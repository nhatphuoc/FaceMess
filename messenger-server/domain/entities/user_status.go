package entities

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserStatus struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      int64              `bson:"userId" json:"userId"`
	Status      string             `bson:"status" json:"status"`
	LastUpdated time.Time          `bson:"lastUpdated" json:"lastUpdated"`
}
