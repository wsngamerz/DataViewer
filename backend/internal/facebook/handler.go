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

	huma.Get(g, "/accounts", h.getAccounts)

	huma.Get(g, "/chats", h.getChats)
	huma.Get(g, "/chats/{id}", h.getChatByID)
	huma.Get(g, "/chats/{id}/summary", h.getChatSummary)
	huma.Get(g, "/chats/{id}/messages", h.getMessagesByChatID)
	huma.Get(g, "/chats/summaries", h.getChatSummaries)

	huma.Get(g, "/messages", h.getMessages)
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

type GetAccountsResponse struct {
	Body struct {
		Accounts []dtos.AccountDTO `json:"accounts"`
	}
}

func (h *handler) getAccounts(ctx context.Context, _ *struct{}) (*GetAccountsResponse, error) {
	accounts, err := h.facebookUseCase.GetAccounts(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook accounts")
		return nil, err
	}

	response := &GetAccountsResponse{}
	response.Body.Accounts = accounts
	return response, nil
}

type GetChatsResponse struct {
	Body struct {
		Chats []dtos.ChatDTO `json:"chats"`
	}
}

func (h *handler) getChats(ctx context.Context, _ *struct{}) (*GetChatsResponse, error) {
	chats, err := h.facebookUseCase.GetChats(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook chats")
		return nil, err
	}

	response := &GetChatsResponse{}
	response.Body.Chats = chats
	return response, nil
}

type GetChatByIDRequest struct {
	ID string `path:"id" required:"true"`
}

type GetChatByIDResponse struct {
	Body struct {
		Chat dtos.ChatDTO `json:"chat"`
	}
}

func (h *handler) getChatByID(ctx context.Context, input *GetChatByIDRequest) (*GetChatByIDResponse, error) {
	chat, err := h.facebookUseCase.GetChatByID(ctx, input.ID)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook chat by ID")
		return nil, err
	}

	response := &GetChatByIDResponse{}
	response.Body.Chat = chat
	return response, nil
}

type GetMessagesResponse struct {
	Body struct {
		Messages []dtos.MessageDTO `json:"messages"`
	}
}

func (h *handler) getMessages(ctx context.Context, _ *struct{}) (*GetMessagesResponse, error) {
	messages, err := h.facebookUseCase.GetMessages(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook messages")
		return nil, err
	}

	response := &GetMessagesResponse{}
	response.Body.Messages = messages
	return response, nil
}

type GetMessagesByChatIDRequest struct {
	ChatID   string `path:"id" required:"true"`
	Page     int    `query:"page" required:"false" default:"1"`
	PageSize int    `query:"pageSize" required:"false" default:"50"`
}

type GetMessagesByChatIDResponse struct {
	Body struct {
		Messages  []dtos.MessageDTO `json:"messages"`
		Total     int               `json:"total"`
		Page      int               `json:"page"`
		PageSize  int               `json:"pageSize"`
		PageCount int               `json:"pageCount"`
	}
}

func (h *handler) getMessagesByChatID(ctx context.Context, input *GetMessagesByChatIDRequest) (*GetMessagesByChatIDResponse, error) {
	messages, total, err := h.facebookUseCase.GetMessagesByChatID(ctx, input.ChatID, input.Page, input.PageSize)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook messages by chat ID")
		return nil, err
	}

	pageCount := (total + input.PageSize - 1) / input.PageSize

	response := &GetMessagesByChatIDResponse{}
	response.Body.Messages = messages
	response.Body.Total = total
	response.Body.Page = input.Page
	response.Body.PageSize = input.PageSize
	response.Body.PageCount = pageCount
	return response, nil
}

type GetChatSummaryRequest struct {
	ID string `path:"id" required:"true"`
}

type GetChatSummaryResponse struct {
	Body struct {
		Summary dtos.ChatSummaryDTO `json:"summary"`
	}
}

func (h *handler) getChatSummary(ctx context.Context, input *GetChatSummaryRequest) (*GetChatSummaryResponse, error) {
	summary, err := h.facebookUseCase.GetChatSummary(ctx, input.ID)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook chat summary")
		return nil, err
	}

	response := &GetChatSummaryResponse{}
	response.Body.Summary = summary
	return response, nil
}

type GetChatSummariesResponse struct {
	Body struct {
		Summaries []dtos.ChatSummaryDTO `json:"summaries"`
	}
}

func (h *handler) getChatSummaries(ctx context.Context, _ *struct{}) (*GetChatSummariesResponse, error) {
	summaries, err := h.facebookUseCase.GetChatSummaries(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Error getting facebook chat summaries")
		return nil, err
	}

	response := &GetChatSummariesResponse{}
	response.Body.Summaries = summaries
	return response, nil
}
