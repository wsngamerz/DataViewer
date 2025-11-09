package models

import "time"

type BaseModel struct {
	ID        string    `bson:"_id"`
	CreatedBy string    `bson:"createdBy,omitempty"`
	UpdatedBy string    `bson:"updatedBy,omitempty"`
	CreatedAt time.Time `bson:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt"`
	Deleted   bool      `bson:"deleted"`
}

func (bm *BaseModel) UpdateTimestamps() {
	now := time.Now()
	if bm.CreatedAt.IsZero() {
		bm.CreatedAt = now
	}
	bm.UpdatedAt = now
}
