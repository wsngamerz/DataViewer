package server

import (
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/config"
	"github.com/wsngamerz/dataviewer/internal/facebook"
	"github.com/wsngamerz/dataviewer/internal/health"
)

func inject(ds *DataSources, cfg *config.Config, _ externalClients) (*gin.Engine, error) { //nolint:unparam // will return an error in the future
	log.Info().Msg("Injecting data sources")
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(gin.Recovery(), cors.Default())
	api := humagin.New(router, huma.DefaultConfig("DataViewer API", "1.0.0"))

	private := huma.NewGroup(api, "/api")

	facebookRepo := facebook.NewRepo(ds.Mongo, cfg.Mongo)
	facebookUseCase := facebook.NewUseCase(facebookRepo)
	facebook.NewHandler(huma.NewGroup(private, "/facebook"), facebookUseCase)

	public := router.Group("")
	health.NewHandler(public.Group("/health"))
	return router, nil
}
