package domain

import (
	"context"
	"io"

	"github.com/wsngamerz/dataviewer/internal/dtos"
	"github.com/wsngamerz/dataviewer/internal/models"
)

type FacebookUseCase interface {
	GetImports(ctx context.Context) ([]dtos.ImportDTO, error)
	CreateImport(ctx context.Context, createImportRequest CreateFacebookImport) (dtos.ImportDTO, error)

	GetAccounts(ctx context.Context) ([]dtos.AccountDTO, error)
	GetChats(ctx context.Context) ([]dtos.ChatDTO, error)
	GetMessages(ctx context.Context) ([]dtos.MessageDTO, error)
}

type FacebookRepo interface {
	GetImports(ctx context.Context) ([]models.Import, error)
	GetImport(ctx context.Context, id string) (*models.Import, error)
	CreateImport(ctx context.Context, i models.Import) error
	UpdateImport(ctx context.Context, i models.Import) error

	GetAccounts(ctx context.Context) ([]models.Account, error)
	CreateAccount(ctx context.Context, a models.Account) error

	GetChats(ctx context.Context) ([]models.Chat, error)
	CreateChat(ctx context.Context, c models.Chat) error

	GetMessages(ctx context.Context) ([]models.Message, error)
	CreateMessage(ctx context.Context, m models.Message) error
}

type CreateFacebookImport struct {
	File io.ReaderAt
	Size int64
	Name string
}
