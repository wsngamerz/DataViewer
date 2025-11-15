package facebook

import (
	"archive/zip"
	"context"
	"encoding/json"
	"io"
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/domain"
	"github.com/wsngamerz/dataviewer/internal/dtos"
	"github.com/wsngamerz/dataviewer/internal/errs"
	"github.com/wsngamerz/dataviewer/internal/models"
)

var messageFilePattern = regexp.MustCompile(`^your_facebook_activity/messages/(inbox|archived_threads|e2ee_cutover)/([^/]+)/message_(\d+)\.json$`)

type usecase struct {
	facebookRepo domain.FacebookRepo
}

func NewUseCase(fr domain.FacebookRepo) domain.FacebookUseCase {
	return &usecase{
		facebookRepo: fr,
	}
}

func (u usecase) GetImports(ctx context.Context) ([]dtos.ImportDTO, error) {
	imports, err := u.facebookRepo.GetImports(ctx)
	if err != nil {
		return nil, err
	}

	return models.ToDTOs(imports), nil
}

func (u usecase) CreateImport(ctx context.Context, input domain.CreateFacebookImport) (dtos.ImportDTO, error) {
	importModel, err := createImportFromDTO(input)
	if err != nil {
		return dtos.ImportDTO{}, err
	}

	if err := u.facebookRepo.CreateImport(ctx, importModel); err != nil {
		return dtos.ImportDTO{}, err
	}

	zipReader, err := zip.NewReader(input.File, input.Size)
	if err != nil {
		return dtos.ImportDTO{}, err
	}

	go u.processFacebookImport(zipReader, importModel.ID)
	return importModel.ToDTO(), nil
}

func (u usecase) GetAccounts(ctx context.Context) ([]dtos.AccountDTO, error) {
	accounts, err := u.facebookRepo.GetAccounts(ctx)
	if err != nil {
		return nil, err
	}

	return models.ToDTOs(accounts), nil
}

func (u usecase) GetChats(ctx context.Context) ([]dtos.ChatDTO, error) {
	chats, err := u.facebookRepo.GetChats(ctx)
	if err != nil {
		return nil, err
	}

	return models.ToDTOs(chats), nil
}

func (u usecase) GetChatByID(ctx context.Context, id string) (dtos.ChatDTO, error) {
	chat, err := u.facebookRepo.GetChatByID(ctx, id)
	if err != nil {
		return dtos.ChatDTO{}, err
	}

	return chat.ToDTO(), nil
}

func (u usecase) GetMessages(ctx context.Context) ([]dtos.MessageDTO, error) {
	messages, err := u.facebookRepo.GetMessages(ctx)
	if err != nil {
		return nil, err
	}

	return models.ToDTOs(messages), nil
}

func (u usecase) GetMessagesByChatID(ctx context.Context, chatID string, limit int, offset int) ([]dtos.MessageDTO, int, error) {
	messages, total, err := u.facebookRepo.GetMessagesByChatID(ctx, chatID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return models.ToDTOs(messages), total, nil
}

func (u usecase) processFacebookImport(zipReader *zip.Reader, id string) {
	ctx := context.Background()
	currentImport, err := u.facebookRepo.GetImport(ctx, id)
	if err != nil {
		log.Error().Err(err).Str("importID", id).Msg("Error fetching import for processing")
		return
	}

	log.Info().Str("importID", id).Msg("Started processing facebook import")
	for _, file := range zipReader.File {
		switch file.Name {
		case "connections/friends/your_friends.json":
			if err := u.processFriendsFile(ctx, file, currentImport); err != nil {
				log.Error().Err(err).Str("importID", id).Msg("Error processing friends file")
				return
			}
		}

		matches := messageFilePattern.FindStringSubmatch(file.Name)
		if matches != nil {
			messageType := matches[1]
			chatName := matches[2]
			fileNumber := matches[3]
			if err := u.processMessageFile(ctx, file, messageType, chatName, fileNumber); err != nil {
				log.Error().Err(err).Str("importID", id).Msg("Error processing message file")
				return
			}
		}
	}

	log.Info().Str("importID", id).Msg("Finished processing facebook import")
	currentImport.Status = "completed"
	if err := u.facebookRepo.UpdateImport(context.Background(), *currentImport); err != nil {
		log.Error().Err(err).Str("importID", id).Msg("Error updating import status")
		return
	}
}

func (u usecase) processFriendsFile(ctx context.Context, file *zip.File, importModel *models.Import) error {
	log.Debug().Msg("Processing friends file")
	type FriendEntry struct {
		Name      string `json:"name"`
		Timestamp int64  `json:"timestamp"`
	}

	type FriendsFile struct {
		Friends []FriendEntry `json:"friends_v2"`
	}

	var friendsData FriendsFile
	rc, err := file.Open()
	if err != nil {
		return err
	}
	defer func(rc io.ReadCloser) {
		if err := rc.Close(); err != nil {
			log.Error().Err(err).Msg("Error closing friends file reader")
		}
	}(rc)
	if err := json.NewDecoder(rc).Decode(&friendsData); err != nil {
		return err
	}

	for _, friend := range friendsData.Friends {
		log.Debug().Str("name", friend.Name).Int64("timestamp", friend.Timestamp).Msg("Processing friend")
		accountModel := models.Account{
			BaseModel: models.BaseModel{
				ID: uuid.New().String(),
			},
			Name:        friend.Name,
			UserID:      "", // Facebook does not provide user IDs in the data export
			FriendSince: time.UnixMilli(friend.Timestamp * 1000),
		}
		accountModel.UpdateTimestamps()
		if err := u.facebookRepo.CreateAccount(ctx, accountModel); err != nil {
			return err
		}
	}

	return nil
}

func (u usecase) processMessageFile(ctx context.Context, file *zip.File, messageType, chatName, fileNumber string) error {
	log.Debug().
		Str("type", messageType).
		Str("chatName", chatName).
		Str("fileNumber", fileNumber).
		Msg("Matched message file")

	type MessageEntry struct {
		SenderName                        string `json:"sender_name"`
		Timestamp                         int    `json:"timestamp_ms"`
		Content                           string `json:"content"`
		IsGeoblockedForViewer             bool   `json:"is_geoblocked_for_viewer"`
		IsUnsentImageByMessengerKidParent bool   `json:"is_unsent_image_by_messenger_kid_parent"`
	}

	type ParticipantEntry struct {
		Name string `json:"name"`
	}

	type MessageFile struct {
		Participants       []ParticipantEntry `json:"participants"`
		Messages           []MessageEntry     `json:"messages"`
		Title              string             `json:"title"`
		ThreadPath         string             `json:"thread_path"`
		IsStillParticipant bool               `json:"is_still_participant"`
		MagicWords         []string           `json:"magic_words"`
	}

	var messageData MessageFile
	rc, err := file.Open()
	if err != nil {
		return err
	}
	defer func(rc io.ReadCloser) {
		if err := rc.Close(); err != nil {
			log.Error().Err(err).Msg("Error closing message file reader")
		}
	}(rc)
	if err := json.NewDecoder(rc).Decode(&messageData); err != nil {
		return err
	}

	// Create chat if it doesnt already exist
	chatModel, err := u.facebookRepo.GetChatByThreadPath(ctx, messageData.ThreadPath)
	if err != nil {
		if !errors.Is(err, errs.ErrNotFound) {
			return err
		}

		// TOOD: Map participant names to IDs properly
		var participantIDs []string
		for _, participant := range messageData.Participants {
			participantIDs = append(participantIDs, participant.Name)
		}

		newChatModel := models.Chat{
			BaseModel:      models.BaseModel{ID: uuid.New().String()},
			Title:          messageData.Title,
			ParticipantIDs: participantIDs,
			ThreadPath:     messageData.ThreadPath,
		}
		newChatModel.UpdateTimestamps()
		if err := u.facebookRepo.CreateChat(ctx, newChatModel); err != nil {
			return err
		}
		chatModel = &newChatModel
	}

	// Process messages
	for _, message := range messageData.Messages {
		messageModel := models.Message{
			BaseModel: models.BaseModel{ID: uuid.New().String()},
			ChatID:    chatModel.ID,
			SenderID:  message.SenderName, // TODO: Map sender name to ID properly
			Content:   message.Content,
		}
		messageModel.UpdateTimestamps()
		if err := u.facebookRepo.CreateMessage(ctx, messageModel); err != nil {
			return err
		}
	}

	return nil
}

func createImportFromDTO(input domain.CreateFacebookImport) (models.Import, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return models.Import{}, err
	}

	model := models.Import{
		BaseModel: models.BaseModel{
			ID:        id.String(),
			CreatedBy: "user",
		},
		Filename: input.Name,
		Status:   "processing",
	}
	model.UpdateTimestamps()
	return model, nil
}
