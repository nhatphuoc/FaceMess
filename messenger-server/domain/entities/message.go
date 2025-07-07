// messenger-server/domain/entities/message.go
package entities

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SenderEmail   string             `bson:"senderEmail" json:"senderEmail"`
	ReceiverEmail string             `bson:"receiverEmail" json:"receiverEmail"`
	Content       string             `bson:"content" json:"content"`
	Timestamp     time.Time          `json:"timestamp" bson:"timestamp"`
}

type Envelope struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}
