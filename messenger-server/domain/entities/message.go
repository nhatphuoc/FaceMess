package entities

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SenderID   int64              `bson:"senderId" json:"senderId"`
	ReceiverID int64              `bson:"receiverId" json:"receiverId"`
	Content    string             `bson:"content" json:"content"`
	MediaURL   string             `bson:"mediaUrl,omitempty" json:"mediaUrl"`
	CreatedAt  time.Time          `bson:"createdAt" json:"createdAt"`
}
