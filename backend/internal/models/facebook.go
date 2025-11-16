package models

import (
	"time"

	"github.com/wsngamerz/dataviewer/internal/dtos"
	"github.com/wsngamerz/dataviewer/pkg/enums"
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

type Media struct {
	URL              string          `bson:"url"`
	Type             enums.MediaType `bson:"type"`
	CreatedTimestamp time.Time       `bson:"creationTime"`
}

func (m *Media) ToDTO() *dtos.MediaDTO {
	if m == nil {
		return nil
	}

	return &dtos.MediaDTO{
		URL:               m.URL,
		MediaType:         m.Type,
		CreationTimestamp: m.CreatedTimestamp,
	}
}

type Chat struct {
	BaseModel      `bson:",inline"`
	Title          string   `bson:"title"`
	ParticipantIDs []string `bson:"participantIds"`
	ThreadPath     string   `bson:"threadPath"`
	Image          *Media   `bson:"image,omitempty"`
}

func (c Chat) ToDTO() dtos.ChatDTO {
	return dtos.ChatDTO{
		ID:             c.ID,
		Title:          c.Title,
		ParticipantIDs: c.ParticipantIDs,
		CreatedAt:      c.CreatedAt,
		ThreadPath:     c.ThreadPath,
		Image:          c.Image.ToDTO(),
	}
}

type Reaction struct {
	Actor    string `bson:"actor"`
	Reaction string `bson:"reaction"`
}

func (r *Reaction) ToDTO() *dtos.ReactionDTO {
	if r == nil {
		return nil
	}

	return &dtos.ReactionDTO{
		Reaction: r.Reaction,
		Actor:    r.Actor,
	}
}

type Share struct {
	Link      string `bson:"link"`
	ShareText string `bson:"shareText"`
}

func (s *Share) ToDTO() *dtos.ShareDTO {
	if s == nil {
		return nil
	}

	return &dtos.ShareDTO{
		Link:      s.Link,
		ShareText: s.ShareText,
	}
}

type Message struct {
	BaseModel `bson:",inline"`
	Content   string    `bson:"content"`
	SentAt    time.Time `bson:"sentAt"`
	SenderID  string    `bson:"senderId"`
	ChatID    string    `bson:"chatId"`

	IsUnsent     bool `bson:"isUnsent,omitempty"`
	CallDuration int  `bson:"callDuration,omitempty"`

	Media     []*Media    `bson:"media,omitempty"`
	Reactions []*Reaction `bson:"reactions,omitempty"`
	Share     *Share      `bson:"share,omitempty"`
}

func (m Message) ToDTO() dtos.MessageDTO {
	return dtos.MessageDTO{
		ID:       m.ID,
		Content:  m.Content,
		SenderID: m.SenderID,
		ChatID:   m.ChatID,
		SentAt:   m.SentAt,

		IsUnsent:     m.IsUnsent,
		CallDuration: m.CallDuration,

		Media:     ToDTOs(m.Media),
		Reactions: ToDTOs(m.Reactions),
		Share:     m.Share.ToDTO(),

		CreatedAt: m.CreatedAt,
	}
}
