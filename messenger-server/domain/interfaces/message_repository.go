package interfaces

import (
	"context"
	"messenger-server/domain/entities"
)

type MessageRepository interface {
	SaveMessage(ctx context.Context, msg entities.Message) error
	GetMessages(ctx context.Context, senderId, receiverId int64) ([]entities.Message, error)
}
