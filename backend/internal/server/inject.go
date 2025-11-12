package server

import (
	"encoding/json"
	"os"
	"path/filepath"

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

	if err := exportOpenAPI(api.OpenAPI()); err != nil {
		return nil, err
	}
	return router, nil
}

func exportOpenAPI(api *huma.OpenAPI) error {
	log.Info().Msg("Exporting OpenAPI specification")
	rawJSON, err := api.MarshalJSON()
	if err != nil {
		return err
	}

	var obj interface{}
	if err := json.Unmarshal(rawJSON, &obj); err != nil {
		return err
	}

	prettyJSON, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return err
	}

	if err := os.MkdirAll("docs", 0755); err != nil {
		return err
	}

	openapiJSONPath := filepath.Join("docs", "openapi.json")
	err = os.WriteFile(openapiJSONPath, prettyJSON, 0644)
	if err != nil {
		return err
	}

	openapiYAMLPath := filepath.Join("docs", "openapi.yaml")
	openapiYAML, err := api.YAML()
	if err != nil {
		return err
	}
	return os.WriteFile(openapiYAMLPath, openapiYAML, 0644)
}
