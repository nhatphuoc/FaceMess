// messenger-server/application/interfaces/message_interface.go
package interfaces

import (
	"context"
	"messenger-server/domain/entities"
)

type MessageInterface interface {
	SaveMessage(ctx context.Context, msg entities.Message) error
	GetMessages(ctx context.Context, senderEmail string, receiverEmail string) ([]entities.Message, error)
}
