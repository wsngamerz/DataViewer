package dtos

type ImportDTO struct {
	ID        string `json:"id"`
	Filename  string `json:"filename"`
	CreatedAt string `json:"created_at"`
	Status    string `json:"status"`
}
