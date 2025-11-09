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
}

type FacebookRepo interface {
	GetImports(ctx context.Context) ([]models.Import, error)
	GetImport(ctx context.Context, id string) (*models.Import, error)
	CreateImport(ctx context.Context, i models.Import) error
	UpdateImport(ctx context.Context, i models.Import) error
}

type CreateFacebookImport struct {
	File io.ReaderAt
	Size int64
	Name string
}
