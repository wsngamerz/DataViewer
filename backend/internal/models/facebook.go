package models

import "github.com/wsngamerz/dataviewer/internal/dtos"

type Import struct {
	BaseModel `bson:",inline"`
	Filename  string `bson:"filename"`
	Status    string `bson:"status"`
}

func (i Import) ToDTO() dtos.ImportDTO {
	return dtos.ImportDTO{
		ID:       i.ID,
		Filename: i.Filename,
		Status:   i.Status,
	}
}
