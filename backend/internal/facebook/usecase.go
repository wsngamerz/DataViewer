package facebook

import (
	"archive/zip"
	"context"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/domain"
	"github.com/wsngamerz/dataviewer/internal/dtos"
	"github.com/wsngamerz/dataviewer/internal/models"
)

type usecase struct {
	facebookRepo domain.FacebookRepo
}

func NewUseCase(fr domain.FacebookRepo) domain.FacebookUseCase {
	return &usecase{
		facebookRepo: fr,
	}
}

func (u usecase) GetImports(ctx context.Context) ([]dtos.ImportDTO, error) {
	imports, err := u.facebookRepo.GetImports(ctx)
	if err != nil {
		return nil, err
	}

	return models.ToDTOs(imports), nil
}

func (u usecase) CreateImport(ctx context.Context, input domain.CreateFacebookImport) (dtos.ImportDTO, error) {
	importModel, err := createImportFromDTO(input)
	if err != nil {
		return dtos.ImportDTO{}, err
	}

	if err := u.facebookRepo.CreateImport(ctx, importModel); err != nil {
		return dtos.ImportDTO{}, err
	}

	zipReader, err := zip.NewReader(input.File, input.Size)
	if err != nil {
		return dtos.ImportDTO{}, err
	}

	go u.processFacebookImport(zipReader, importModel.ID)
	return importModel.ToDTO(), nil
}

func (u usecase) processFacebookImport(zipReader *zip.Reader, id string) {
	currentImport, err := u.facebookRepo.GetImport(context.Background(), id)
	if err != nil {
		log.Error().Err(err).Str("importID", id).Msg("Error fetching import for processing")
		return
	}

	log.Info().Str("importID", id).Msg("Started processing facebook import")
	for _, file := range zipReader.File {
		log.Debug().Str("fileName", file.Name).Msg("Processing file")
	}

	log.Info().Str("importID", id).Msg("Finished processing facebook import")
	currentImport.Status = "completed"
	if err := u.facebookRepo.UpdateImport(context.Background(), *currentImport); err != nil {
		log.Error().Err(err).Str("importID", id).Msg("Error updating import status")
		return
	}
}

func createImportFromDTO(input domain.CreateFacebookImport) (models.Import, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return models.Import{}, err
	}

	model := models.Import{
		BaseModel: models.BaseModel{
			ID:        id.String(),
			CreatedBy: "user",
		},
		Filename: input.Name,
		Status:   "processing",
	}
	model.BaseModel.UpdateTimestamps()
	return model, nil
}
