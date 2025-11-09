package server

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/config"
)

func Run() error {
	log.Logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout}).With().Timestamp().Logger() //nolint:reassign // set log output to console

	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := config.GetConfig()
	if err != nil {
		return errors.Wrap(err, "failed to initialize config")
	}
	if err = cfg.Validate(); err != nil {
		return errors.Wrap(err, "failed to validate config")
	}

	sources, err := NewDataSources(cfg)
	if err != nil {
		return errors.Wrap(err, "failed to initialise data sources")
	}
	defer sources.Close()
	ec := initExternalClients(*cfg)

	router, err := inject(sources, cfg, ec)
	if err != nil {
		return errors.Wrap(err, "failed to initialise router")
	}

	srv := &http.Server{
		Addr:              ":" + strconv.FormatInt(cfg.Service.Port, 10),
		Handler:           router,
		ReadHeaderTimeout: 2 * time.Second,
	}

	// Initialising the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		if err = srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Logger.Fatal().Stack().Err(err).Msg("Failed to initialize server")
		}
	}()
	log.Logger.Info().Msgf("Listening on port %v", srv.Addr)
	log.Logger.Info().Msgf("  - API Documentation http://localhost%v/docs", srv.Addr)

	// Listen for the interrupt signal.
	<-ctx.Done()

	// Restore default behavior on the interrupt signal and notify user of shutdown.
	stop()
	log.Logger.Info().Msg("Shutting down gracefully, press Ctrl+C again to force")

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		return errors.Wrap(err, "server forced to shutdown")
	}

	log.Logger.Info().Msgf("Server exiting")
	return nil
}
