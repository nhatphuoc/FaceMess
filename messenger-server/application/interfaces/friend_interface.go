package interfaces

import (
	"context"
	"messenger-server/domain/entities"
)

type FriendInterface interface {
	GetFriends(ctx context.Context, userEmail string) ([]entities.UserResponse, error)
	SendFriendRequest(ctx context.Context, userEmail, friendEmail string) error
	CheckFriendship(ctx context.Context, userEmail, friendEmail string) (bool, error)
}
