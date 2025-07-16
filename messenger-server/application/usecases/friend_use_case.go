// File: messenger-server/application/usecases/friend_use_case.go
package usecases

import (
	"context"
	"errors"
	"messenger-server/application/interfaces"

	"messenger-server/domain/entities"
)

type FriendUseCase struct {
	FriendRepo interfaces.FriendInterface
}

func NewFriendUseCase(friendRepo interfaces.FriendInterface) *FriendUseCase {
	return &FriendUseCase{FriendRepo: friendRepo}
}

func (uc *FriendUseCase) GetFriends(ctx context.Context, userEmail string) ([]entities.UserResponse, error) {
	return uc.FriendRepo.GetFriends(ctx, userEmail)
}

func (uc *FriendUseCase) SendFriendRequest(ctx context.Context, userEmail, friendEmail string) error {
	if userEmail == friendEmail {
		return errors.New("cannot send friend request to self")
	}
	return uc.FriendRepo.SendFriendRequest(ctx, userEmail, friendEmail)
}

func (uc *FriendUseCase) CheckFriendship(ctx context.Context, userEmail, friendEmail string) (bool, error) {
	friends, err := uc.FriendRepo.GetFriends(ctx, userEmail)
	if err != nil {
		return false, err
	}
	for _, friend := range friends {
		if friend.Email == friendEmail {
			return true, nil
		}
	}
	return false, nil
}
