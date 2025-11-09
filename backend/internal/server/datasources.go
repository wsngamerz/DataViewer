package server

import (
	"context"

	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DataSources holds the data sources (clients) used by the service.
type DataSources struct {
	Mongo *mongo.Client
}

// NewDataSources creates a new DataSources instance and initialises the data sources.
func NewDataSources(cfg *config.Config) (*DataSources, error) {
	log.Info().Msg("Initialising data sources")

	mongoClient, err := InitMongo(cfg.Mongo)
	if err != nil {
		return nil, err
	}

	ds := &DataSources{
		Mongo: mongoClient,
	}
	return ds, nil
}

func InitMongo(cfg config.Mongo) (*mongo.Client, error) {
	mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI(cfg.ConnectionString))
	if err != nil {
		return nil, err
	}

	if err := mongoClient.Ping(context.Background(), nil); err != nil {
		return nil, err
	}

	return mongoClient, nil
}

func (ds *DataSources) Close() {
	if err := ds.Mongo.Disconnect(context.Background()); err != nil {
		log.Error().Err(err).Msg("Failed to disconnect MongoDB client")
	}
}
