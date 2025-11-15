package facebook

import (
	"context"
	"errors"

	"github.com/wsngamerz/dataviewer/internal/config"
	"github.com/wsngamerz/dataviewer/internal/domain"
	"github.com/wsngamerz/dataviewer/internal/dtos"
	"github.com/wsngamerz/dataviewer/internal/errs"
	"github.com/wsngamerz/dataviewer/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type repo struct {
	mongoClient       *mongo.Client
	importCollection  *mongo.Collection
	accountCollection *mongo.Collection
	chatCollection    *mongo.Collection
	messageCollection *mongo.Collection
}

func NewRepo(mongoClient *mongo.Client, cfg config.Mongo) domain.FacebookRepo {
	r := &repo{
		mongoClient:       mongoClient,
		importCollection:  mongoClient.Database(cfg.DatabaseName).Collection(cfg.FacebookImportsCollection),
		accountCollection: mongoClient.Database(cfg.DatabaseName).Collection(cfg.FacebookAccountsCollection),
		chatCollection:    mongoClient.Database(cfg.DatabaseName).Collection(cfg.FacebookChatsCollection),
		messageCollection: mongoClient.Database(cfg.DatabaseName).Collection(cfg.FacebookMessagesCollection),
	}
	ctx := context.Background()

	type indexDef struct {
		coll   *mongo.Collection
		models []mongo.IndexModel
	}

	indexes := []indexDef{
		{r.importCollection, []mongo.IndexModel{
			{Keys: bson.D{{Key: "deleted", Value: 1}}},
		}},
		{r.accountCollection, []mongo.IndexModel{
			{Keys: bson.D{{Key: "deleted", Value: 1}}},
		}},
		{r.chatCollection, []mongo.IndexModel{
			{Keys: bson.D{{Key: "deleted", Value: 1}}},
			{Keys: bson.D{{Key: "threadPath", Value: 1}}, Options: options.Index().SetUnique(true)},
		}},
		{r.messageCollection, []mongo.IndexModel{
			{Keys: bson.D{{Key: "deleted", Value: 1}}},
			{Keys: bson.D{{Key: "chatId", Value: 1}}},
			{Keys: bson.D{{Key: "senderId", Value: 1}}},
			{Keys: bson.D{{Key: "sentAt", Value: 1}}},
			{Keys: bson.D{{Key: "chatId", Value: 1}, {Key: "deleted", Value: 1}, {Key: "sentAt", Value: -1}}},
		}},
	}

	for _, idx := range indexes {
		for _, model := range idx.models {
			if _, err := idx.coll.Indexes().CreateOne(ctx, model); err != nil {
				panic("Failed to create index: " + err.Error())
			}
		}
	}

	return r
}

func (r repo) GetImports(ctx context.Context) ([]models.Import, error) {
	var imports []models.Import
	cursor, err := r.importCollection.Find(ctx, bson.M{"deleted": false})
	if err != nil {
		return imports, err
	}

	err = cursor.All(ctx, &imports)
	if err != nil {
		return imports, err
	}

	return imports, nil
}

func (r repo) GetImport(ctx context.Context, id string) (*models.Import, error) {
	var importModel models.Import
	err := r.importCollection.FindOne(ctx, bson.M{"_id": id, "deleted": false}).Decode(&importModel)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errs.ErrNotFound
		}
		return nil, err
	}

	return &importModel, nil
}

func (r repo) CreateImport(ctx context.Context, i models.Import) error {
	_, err := r.importCollection.InsertOne(ctx, i)
	return err
}

func (r repo) UpdateImport(ctx context.Context, i models.Import) error {
	_, err := r.importCollection.UpdateOne(ctx, bson.M{"_id": i.ID}, bson.M{"$set": i})
	return err
}

func (r repo) GetAccounts(ctx context.Context) ([]models.Account, error) {
	var accounts []models.Account
	cursor, err := r.accountCollection.Find(ctx, bson.M{"deleted": false})
	if err != nil {
		return accounts, err
	}

	err = cursor.All(ctx, &accounts)
	if err != nil {
		return accounts, err
	}

	return accounts, nil
}

func (r repo) CreateAccount(ctx context.Context, a models.Account) error {
	_, err := r.accountCollection.InsertOne(ctx, a)
	return err
}

func (r repo) GetChats(ctx context.Context) ([]models.Chat, error) {
	var chats []models.Chat
	cursor, err := r.chatCollection.Find(ctx, bson.M{"deleted": false})
	if err != nil {
		return chats, err
	}

	err = cursor.All(ctx, &chats)
	if err != nil {
		return chats, err
	}

	return chats, nil
}

func (r repo) GetChatByID(ctx context.Context, id string) (*models.Chat, error) {
	var chat models.Chat
	err := r.chatCollection.FindOne(ctx, bson.M{"_id": id, "deleted": false}).Decode(&chat)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errs.ErrNotFound
		}
		return nil, err
	}

	return &chat, nil
}

func (r repo) GetChatSummary(ctx context.Context, id string) (dtos.ChatSummaryDTO, error) {
	var summary dtos.ChatSummaryDTO

	// 1. Fetch chat
	chat, err := r.GetChatByID(ctx, id)
	if err != nil {
		return summary, err
	}

	// 2. Count participants from messages (unique SenderIDs)
	var participantIDs []string
	err = r.messageCollection.Distinct(ctx, "senderId", bson.M{"chatId": id, "deleted": false}).Decode(&participantIDs)
	if err != nil {
		return summary, err
	}

	// 3. Count messages
	msgFilter := bson.M{"chatId": id, "deleted": false}
	messageCount, err := r.messageCollection.CountDocuments(ctx, msgFilter)
	if err != nil {
		return summary, err
	}

	// 4. Get last message
	var lastMsg models.Message
	findOpts := options.FindOne().SetSort(bson.D{{Key: "sentAt", Value: -1}})
	err = r.messageCollection.FindOne(ctx, msgFilter, findOpts).Decode(&lastMsg)
	var lastMsgDTO dtos.MessageDTO
	if err == nil {
		lastMsgDTO = dtos.MessageDTO{
			ID:       lastMsg.ID,
			SenderID: lastMsg.SenderID,
			Content:  lastMsg.Content,
			SentAt:   lastMsg.SentAt,
		}
	}

	// 5. Estimate created at (earliest message)
	var firstMsg models.Message
	findOptsEarliest := options.FindOne().SetSort(bson.D{{Key: "sentAt", Value: 1}})
	err = r.messageCollection.FindOne(ctx, msgFilter, findOptsEarliest).Decode(&firstMsg)
	createdAt := chat.CreatedAt
	if err == nil {
		createdAt = firstMsg.SentAt
	}

	summary = dtos.ChatSummaryDTO{
		ID:                 chat.ID,
		Title:              chat.Title,
		ParticipantIDs:     participantIDs,
		MessageCount:       int(messageCount),
		LastMessage:        lastMsgDTO,
		EstimatedCreatedAt: createdAt,
	}
	return summary, nil
}

func (r repo) GetChatByThreadPath(ctx context.Context, threadPath string) (*models.Chat, error) {
	var chat models.Chat
	err := r.chatCollection.FindOne(ctx, bson.M{"threadPath": threadPath, "deleted": false}).Decode(&chat)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errs.ErrNotFound
		}
		return nil, err
	}

	return &chat, nil
}

func (r repo) CreateChat(ctx context.Context, c models.Chat) error {
	_, err := r.chatCollection.InsertOne(ctx, c)
	return err
}

func (r repo) GetMessages(ctx context.Context) ([]models.Message, error) {
	var messages []models.Message
	cursor, err := r.messageCollection.Find(ctx, bson.M{"deleted": false})
	if err != nil {
		return messages, err
	}

	err = cursor.All(ctx, &messages)
	if err != nil {
		return messages, err
	}

	return messages, nil
}

func (r repo) GetMessagesByChatID(ctx context.Context, chatID string, page int, pageSize int) ([]models.Message, int, error) {
	var messages []models.Message
	filter := bson.M{"chatId": chatID, "deleted": false}
	total, err := r.messageCollection.CountDocuments(ctx, filter)
	if err != nil {
		return messages, 0, err
	}
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	skip := int64((page - 1) * pageSize)
	findOpts := options.Find().SetLimit(int64(pageSize)).SetSkip(skip).SetSort(bson.D{{Key: "sentAt", Value: -1}})
	cursor, err := r.messageCollection.Find(ctx, filter, findOpts)
	if err != nil {
		return messages, 0, err
	}
	err = cursor.All(ctx, &messages)
	if err != nil {
		return messages, 0, err
	}
	return messages, int(total), nil
}

func (r repo) CreateMessage(ctx context.Context, m models.Message) error {
	_, err := r.messageCollection.InsertOne(ctx, m)
	return err
}

func (r repo) CreateMessagesBulk(ctx context.Context, messages []models.Message) error {
	docs := make([]interface{}, len(messages))
	for i, m := range messages {
		docs[i] = m
	}
	_, err := r.messageCollection.InsertMany(ctx, docs)
	return err
}
