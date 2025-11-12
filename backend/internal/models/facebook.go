package models

import (
	"time"

	"github.com/wsngamerz/dataviewer/internal/dtos"
)

type Import struct {
	BaseModel `bson:",inline"`
	Filename  string `bson:"filename"`
	Status    string `bson:"status"`
}

func (i Import) ToDTO() dtos.ImportDTO {
	return dtos.ImportDTO{
		ID:        i.ID,
		Filename:  i.Filename,
		Status:    i.Status,
		CreatedAt: i.CreatedAt,
	}
}

type Account struct {
	BaseModel   `bson:",inline"`
	UserID      string    `bson:"userId"`
	Name        string    `bson:"name"`
	FriendSince time.Time `bson:"friendSince"`
}

func (a Account) ToDTO() dtos.AccountDTO {
	return dtos.AccountDTO{
		ID:          a.ID,
		UserID:      a.UserID,
		Name:        a.Name,
		FriendSince: a.FriendSince,
		CreatedAt:   a.CreatedAt,
	}
}

type Chat struct {
	BaseModel      `bson:",inline"`
	Title          string   `bson:"title"`
	ParticipantIDs []string `bson:"participantIds"`
	ThreadPath     string   `bson:"threadPath"`
}

func (c Chat) ToDTO() dtos.ChatDTO {
	return dtos.ChatDTO{
		ID:             c.ID,
		Title:          c.Title,
		ParticipantIDs: c.ParticipantIDs,
		CreatedAt:      c.CreatedAt,
		ThreadPath:     c.ThreadPath,
	}
}

type Message struct {
	BaseModel `bson:",inline"`
	Content   string `bson:"content"`
	SenderID  string `bson:"senderId"`
	ChatID    string `bson:"chatId"`
}

func (m Message) ToDTO() dtos.MessageDTO {
	return dtos.MessageDTO{
		ID:        m.ID,
		Content:   m.Content,
		SenderID:  m.SenderID,
		ChatID:    m.ChatID,
		CreatedAt: m.CreatedAt,
	}
}
