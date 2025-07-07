package service

import (
	"context"
	"encoding/json"
	"messenger-server/domain/entities"
	"messenger-server/domain/repositories"
	"messenger-server/infrastructure/websocket"
)

type MessageService struct {
	Hub        *websocket.Hub
	Repository repositories.MessageRepository
}

func NewMessageService(hub *websocket.Hub, repo repositories.MessageRepository) *MessageService {
	return &MessageService{Hub: hub, Repository: repo}
}

func (s *MessageService) SaveMessage(ctx context.Context, msg entities.Message) error {
	// Lưu tin nhắn vào repository
	if err := s.Repository.SaveMessage(ctx, msg); err != nil {
		return err
	}

	// Chuẩn bị envelope để gửi qua WebSocket
	env := entities.Envelope{
		Type: "message",
		Data: msg,
	}
	data, err := json.Marshal(env)
	if err != nil {
		return err
	}

	// Gửi tin nhắn qua Hub
	s.Hub.Broadcast <- data
	return nil
}

func (s *MessageService) GetMessages(ctx context.Context, senderEmail string, receiverEmail string) ([]entities.Message, error) {
	// Lấy danh sách tin nhắn từ repository
	messages, err := s.Repository.GetMessages(ctx, senderEmail, receiverEmail)
	if err != nil {
		return nil, err
	}

	// Chuẩn bị envelope để gửi qua WebSocket
	env := entities.Envelope{
		Type: "messages",
		Data: messages,
	}
	data, err := json.Marshal(env)
	if err != nil {
		return nil, err
	}

	// Gửi danh sách tin nhắn qua Hub
	s.Hub.Broadcast <- data
	return messages, nil
}
