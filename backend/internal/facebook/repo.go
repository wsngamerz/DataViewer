package facebook

import (
	"context"

	"github.com/wsngamerz/dataviewer/internal/config"
	"github.com/wsngamerz/dataviewer/internal/domain"
	"github.com/wsngamerz/dataviewer/internal/models"
	"go.mongodb.org/mongo-driver/mongo"
)

type repo struct {
	mongoClient *mongo.Client
	collection  *mongo.Collection
}

func NewRepo(mongo *mongo.Client, cfg config.Mongo) domain.FacebookRepo {
	return &repo{
		mongoClient: mongo,
		collection:  mongo.Database(cfg.DatabaseName).Collection(cfg.FacebookImportsCollection),
	}
}

func (r repo) GetImports(ctx context.Context) ([]models.Import, error) {
	var imports []models.Import
	cursor, err := r.collection.Find(ctx, map[string]interface{}{"deleted": false})
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
	err := r.collection.FindOne(ctx, map[string]interface{}{"_id": id, "deleted": false}).Decode(&importModel)
	if err != nil {
		return nil, err
	}

	return &importModel, nil
}

func (r repo) CreateImport(ctx context.Context, i models.Import) error {
	_, err := r.collection.InsertOne(ctx, i)
	return err
}

func (r repo) UpdateImport(ctx context.Context, i models.Import) error {
	_, err := r.collection.UpdateOne(ctx, map[string]interface{}{"_id": i.ID}, map[string]interface{}{"$set": i})
	return err
}
