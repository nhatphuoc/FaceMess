// File: messenger-server/application/service/friend_service.go
package service

import (
	"context"
	"messenger-server/domain/entities"
	"messenger-server/domain/repositories"
)

type FriendService struct {
	Repository repositories.FriendRepository
}

func NewFriendService(repo repositories.FriendRepository) *FriendService {
	return &FriendService{Repository: repo}
}

func (s *FriendService) GetFriends(ctx context.Context, userEmail string) ([]entities.UserResponse, error) {
	return s.Repository.GetFriends(ctx, userEmail)
}

func (s *FriendService) SendFriendRequest(ctx context.Context, userEmail, friendEmail string) error {
	return s.Repository.SendFriendRequest(ctx, userEmail, friendEmail)
}

func (s *FriendService) CheckFriendship(ctx context.Context, userEmail, friendEmail string) (bool, error) {
	return s.Repository.CheckFriendship(ctx, userEmail, friendEmail)
}
