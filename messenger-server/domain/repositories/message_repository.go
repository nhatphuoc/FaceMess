// messenger-server/domain/interfaces/message_repository.go
package repositories

import (
	"context"
	"messenger-server/domain/entities"
)

type MessageRepository interface {
	SaveMessage(ctx context.Context, msg entities.Message) error
	GetMessages(ctx context.Context, senderEmail string, receiverEmail string) ([]entities.Message, error)
}
