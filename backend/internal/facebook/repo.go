package facebook

import (
	"context"
	"errors"

	"github.com/wsngamerz/dataviewer/internal/config"
	"github.com/wsngamerz/dataviewer/internal/domain"
	"github.com/wsngamerz/dataviewer/internal/errs"
	"github.com/wsngamerz/dataviewer/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type repo struct {
	mongoClient       *mongo.Client
	importCollection  *mongo.Collection
	accountCollection *mongo.Collection
	chatCollection    *mongo.Collection
	messageCollection *mongo.Collection
}

func NewRepo(mongo *mongo.Client, cfg config.Mongo) domain.FacebookRepo {
	return &repo{
		mongoClient:       mongo,
		importCollection:  mongo.Database(cfg.DatabaseName).Collection(cfg.FacebookImportsCollection),
		accountCollection: mongo.Database(cfg.DatabaseName).Collection(cfg.FacebookAccountsCollection),
		chatCollection:    mongo.Database(cfg.DatabaseName).Collection(cfg.FacebookChatsCollection),
		messageCollection: mongo.Database(cfg.DatabaseName).Collection(cfg.FacebookMessagesCollection),
	}
}

func (r repo) GetImports(ctx context.Context) ([]models.Import, error) {
	var imports []models.Import
	cursor, err := r.importCollection.Find(ctx, map[string]interface{}{"deleted": false})
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
	err := r.importCollection.FindOne(ctx, map[string]interface{}{"_id": id, "deleted": false}).Decode(&importModel)
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
	_, err := r.importCollection.UpdateOne(ctx, map[string]interface{}{"_id": i.ID}, map[string]interface{}{"$set": i})
	return err
}

func (r repo) GetAccounts(ctx context.Context) ([]models.Account, error) {
	var accounts []models.Account
	cursor, err := r.accountCollection.Find(ctx, map[string]interface{}{"deleted": false})
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
	cursor, err := r.chatCollection.Find(ctx, map[string]interface{}{"deleted": false})
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
	err := r.chatCollection.FindOne(ctx, map[string]interface{}{"_id": id, "deleted": false}).Decode(&chat)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errs.ErrNotFound
		}
		return nil, err
	}

	return &chat, nil
}

func (r repo) GetChatByThreadPath(ctx context.Context, threadPath string) (*models.Chat, error) {
	var chat models.Chat
	err := r.chatCollection.FindOne(ctx, map[string]interface{}{"threadPath": threadPath, "deleted": false}).Decode(&chat)
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
	cursor, err := r.messageCollection.Find(ctx, map[string]interface{}{"deleted": false})
	if err != nil {
		return messages, err
	}

	err = cursor.All(ctx, &messages)
	if err != nil {
		return messages, err
	}

	return messages, nil
}

func (r repo) GetMessagesByChatID(ctx context.Context, chatID string, limit int, offset int) ([]models.Message, int, error) {
	var messages []models.Message
	filter := map[string]interface{}{"chatId": chatID, "deleted": false}
	total, err := r.messageCollection.CountDocuments(ctx, filter)
	if err != nil {
		return messages, 0, err
	}
	findOpts := options.Find().SetLimit(int64(limit)).SetSkip(int64(offset)).SetSort(bson.M{"createdAt": 1})
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
