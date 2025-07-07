package usecases

import (
	"context"
	"messenger-server/application/interfaces"
	"messenger-server/domain/entities"
	"time"
)

// MessageUseCase xử lý logic gửi tin nhắn
type MessageUseCase struct {
	MessageService interfaces.MessageInterface
}

func NewMessageUseCase(service interfaces.MessageInterface) *MessageUseCase {
	return &MessageUseCase{MessageService: service}
}

func (uc *MessageUseCase) SendMessage(ctx context.Context, senderEmail, receiverEmail, content string) (entities.Message, error) {

	msg := entities.Message{
		SenderEmail:   senderEmail,
		ReceiverEmail: receiverEmail,
		Content:       content,
		Timestamp:     time.Now(),
	}

	if err := uc.MessageService.SaveMessage(ctx, msg); err != nil {
		return entities.Message{}, err
	}
	return msg, nil
}

func (uc *MessageUseCase) GetMessages(ctx context.Context, senderEmail, receiverEmail string) ([]entities.Message, error) {
	// isFriend, err := uc.FriendSvc.CheckFriendship(ctx, senderEmail, receiverEmail)
	// if err != nil || !isFriend {
	// 	return nil, errors.New("not friends")
	// }
	return uc.MessageService.GetMessages(ctx, senderEmail, receiverEmail)
}
