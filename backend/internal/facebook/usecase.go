package facebook

import (
	"archive/zip"
	"context"
	"encoding/json"
	"io"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/domain"
	"github.com/wsngamerz/dataviewer/internal/dtos"
	"github.com/wsngamerz/dataviewer/internal/models"
)

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

func (u usecase) GetMessages(ctx context.Context) ([]dtos.MessageDTO, error) {
	messages, err := u.facebookRepo.GetMessages(ctx)
	if err != nil {
		return nil, err
	}

	return models.ToDTOs(messages), nil
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
		log.Debug().Str("fileName", file.Name).Msg("Processing file")
		if file.Name == "connections/friends/your_friends.json" {
			if err := u.processFriendsFile(ctx, file, currentImport); err != nil {
				log.Error().Err(err).Str("importID", id).Msg("Error processing friends file")
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
