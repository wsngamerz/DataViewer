package dtos

import "time"

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

type ChatDTO struct {
	ID             string   `json:"id"`
	Title          string   `json:"title"`
	ParticipantIDs []string `json:"participant_ids"`

	CreatedAt time.Time `json:"created_at"`
}

type MessageDTO struct {
	ID       string `json:"id"`
	ChatID   string `json:"chat_id"`
	SenderID string `json:"sender_id"`
	Content  string `json:"content"`

	CreatedAt time.Time `json:"created_at"`
}
