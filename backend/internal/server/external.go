package server

import (
	"github.com/wsngamerz/dataviewer/internal/config"
)

type externalClients struct {
}

func initExternalClients(cfg config.Config) externalClients {
	ec := externalClients{}
	return ec
}
