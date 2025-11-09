package main

import (
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/server"
	_ "go.uber.org/automaxprocs"
)

// @title						dataviewer API
// @version					0.0.1-dev
// @description				Dataviewer is a powerful data visualization and analytics platform designed to help users make sense of their own data through interactive charts, graphs, and dashboards.
// @license.name				Apache 2.0
// @license.url				http://www.apache.org/licenses/LICENSE-2.0.html
// @securityDefinitions.apikey	ApiKeyAuth
// @in							header
// @name						Authorization
func main() {
	if err := server.Run(); err != nil {
		log.Logger.Fatal().Stack().Err(err).Msg("Failed to run server")
	}
}
