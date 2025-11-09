package facebook

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/internal/domain"
	"github.com/wsngamerz/dataviewer/internal/dtos"
)

type handler struct {
	facebookUseCase domain.FacebookUseCase
}

func NewHandler(g *huma.Group, fuc domain.FacebookUseCase) {
	h := handler{
		facebookUseCase: fuc,
	}

	huma.Get(g, "/imports", h.getImports)
	huma.Post(g, "/imports", h.createImport)
}

type GetImportsResponse struct {
	Body struct {
		Imports []dtos.ImportDTO `json:"imports"`
	}
}

func (h *handler) getImports(ctx context.Context, _ *struct{}) (*GetImportsResponse, error) {
	imports, err := h.facebookUseCase.GetImports(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook imports")
		return nil, err
	}

	response := &GetImportsResponse{}
	response.Body.Imports = imports
	return response, nil
}

type CreateImportRequest struct {
	RawBody huma.MultipartFormFiles[struct {
		DataExtractFile huma.FormFile `form:"file" contentType:"application/zip" required:"true"`
		Name            string        `form:"name" contentType:"text" required:"true"`
	}]
}

type CreateImportResponse struct {
	Body struct {
		Import dtos.ImportDTO `json:"import"`
	}
}

func (h *handler) createImport(ctx context.Context, input *CreateImportRequest) (*CreateImportResponse, error) {
	formData := input.RawBody.Data()
	createdImport, err := h.facebookUseCase.CreateImport(ctx, domain.CreateFacebookImport{
		File: formData.DataExtractFile,
		Size: formData.DataExtractFile.Size,
		Name: formData.Name,
	})
	if err != nil {
		log.Error().Err(err).Msg("Error creating facebook import")
		return nil, err
	}

	response := &CreateImportResponse{}
	response.Body.Import = createdImport
	return response, nil
}
