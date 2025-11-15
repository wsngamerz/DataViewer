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
	GetChatByID(ctx context.Context, id string) (dtos.ChatDTO, error)

	GetMessages(ctx context.Context) ([]dtos.MessageDTO, error)
	GetMessagesByChatID(ctx context.Context, chatID string, limit int, offset int) ([]dtos.MessageDTO, int, error)
}

type FacebookRepo interface {
	GetImports(ctx context.Context) ([]models.Import, error)
	GetImport(ctx context.Context, id string) (*models.Import, error)
	CreateImport(ctx context.Context, i models.Import) error
	UpdateImport(ctx context.Context, i models.Import) error

	GetAccounts(ctx context.Context) ([]models.Account, error)
	CreateAccount(ctx context.Context, a models.Account) error

	GetChats(ctx context.Context) ([]models.Chat, error)
	GetChatByID(ctx context.Context, id string) (*models.Chat, error)
	GetChatByThreadPath(ctx context.Context, threadPath string) (*models.Chat, error)
	CreateChat(ctx context.Context, c models.Chat) error

	GetMessages(ctx context.Context) ([]models.Message, error)
	GetMessagesByChatID(ctx context.Context, chatID string, limit int, offset int) ([]models.Message, int, error)
	CreateMessage(ctx context.Context, m models.Message) error
	CreateMessagesBulk(ctx context.Context, messages []models.Message) error
}

type CreateFacebookImport struct {
	File io.ReaderAt
	Size int64
	Name string
}
