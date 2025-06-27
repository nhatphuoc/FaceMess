// messenger-server/domain/usecases/message_usecase.go
package usecases

import (
	"context"
	"errors"
	"messenger-server/domain/entities"
	"messenger-server/domain/interfaces"
	"time"
)

type MessageUseCase struct {
	MessageRepo interfaces.MessageRepository
	FriendSvc   interfaces.FriendService
}

func NewMessageUseCase(messageRepo interfaces.MessageRepository, friendSvc interfaces.FriendService) *MessageUseCase {
	return &MessageUseCase{MessageRepo: messageRepo, FriendSvc: friendSvc}
}

func (uc *MessageUseCase) SendMessage(ctx context.Context, senderId, receiverId int64, content, mediaUrl string) (entities.Message, error) {
	isFriend, err := uc.FriendSvc.CheckFriendship(ctx, senderId, receiverId)
	if err != nil || !isFriend {
		return entities.Message{}, errors.New("not friends")
	}

	msg := entities.Message{
		SenderID:   senderId,
		ReceiverID: receiverId,
		Content:    content,
		MediaURL:   mediaUrl,
		CreatedAt:  time.Now(),
	}

	if err := uc.MessageRepo.SaveMessage(ctx, msg); err != nil {
		return entities.Message{}, err
	}
	return msg, nil
}

func (uc *MessageUseCase) GetMessages(ctx context.Context, senderId, receiverId int64) ([]entities.Message, error) {
	isFriend, err := uc.FriendSvc.CheckFriendship(ctx, senderId, receiverId)
	if err != nil || !isFriend {
		return nil, errors.New("not friends")
	}
	return uc.MessageRepo.GetMessages(ctx, senderId, receiverId)
}
