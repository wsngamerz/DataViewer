package dtos

import (
	"time"

	"github.com/wsngamerz/dataviewer/pkg/enums"
)

type ImportDTO struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	Status   string `json:"status"`

	CreatedAt time.Time `json:"created_at"`
}

type AccountDTO struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Name        string    `json:"name"`
	FriendSince time.Time `json:"timestamp"`

	CreatedAt time.Time `json:"created_at"`
}

type MediaDTO struct {
	URL               string          `json:"url"`
	MediaType         enums.MediaType `json:"media_type"`
	CreationTimestamp time.Time       `json:"creation_timestamp"`
}

type ChatDTO struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	ParticipantIDs []string  `json:"participant_ids"`
	ThreadPath     string    `json:"thread_path"`
	Image          *MediaDTO `json:"image,omitempty"`

	CreatedAt time.Time `json:"created_at"`
}

type ChatSummaryDTO struct {
	ID                 string     `json:"id"`
	Title              string     `json:"title"`
	ParticipantIDs     []string   `json:"participant_ids"`
	MessageCount       int        `json:"message_count"`
	LastMessage        MessageDTO `json:"last_message"`
	EstimatedCreatedAt time.Time  `json:"estimated_created_at"`
}

type ShareDTO struct {
	Link      string `json:"link"`
	ShareText string `json:"share_text"`
}

type ReactionDTO struct {
	Reaction string `json:"reaction"`
	Actor    string `json:"actor"`
}

type MessageDTO struct {
	ID       string `json:"id"`
	ChatID   string `json:"chat_id"`
	SenderID string `json:"sender_id"`
	Content  string `json:"content"`

	IsUnsent     bool `json:"is_unsent,omitempty"`
	CallDuration int  `json:"call_duration,omitempty"`

	Media     []*MediaDTO    `json:"media,omitempty"`
	Reactions []*ReactionDTO `json:"reactions,omitempty"`
	Share     *ShareDTO      `json:"share,omitempty"`

	SentAt    time.Time `json:"sent_at"`
	CreatedAt time.Time `json:"created_at"`
}
