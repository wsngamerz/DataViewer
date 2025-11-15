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
	ThreadPath     string   `json:"thread_path"`

	CreatedAt time.Time `json:"created_at"`
}

type MessageDTO struct {
	ID       string `json:"id"`
	ChatID   string `json:"chat_id"`
	SenderID string `json:"sender_id"`
	Content  string `json:"content"`

	SentAt    time.Time `json:"sent_at"`
	CreatedAt time.Time `json:"created_at"`
}
