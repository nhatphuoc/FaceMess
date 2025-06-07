package usecases

import (
	"context"
	"errors"
	"messenger-server/domain/entities"
	"messenger-server/domain/interfaces"
)

type UserStatusUseCase struct {
	StatusRepo interfaces.UserStatusRepository
	FriendSvc  interfaces.FriendService
}

func NewUserStatusUseCase(statusRepo interfaces.UserStatusRepository, friendSvc interfaces.FriendService) *UserStatusUseCase {
	return &UserStatusUseCase{StatusRepo: statusRepo, FriendSvc: friendSvc}
}

func (uc *UserStatusUseCase) UpdateStatus(ctx context.Context, userId int64, status string) error {
	return uc.StatusRepo.UpdateStatus(ctx, userId, status)
}

func (uc *UserStatusUseCase) GetStatus(ctx context.Context, userId, friendId int64) (entities.UserStatus, error) {
	isFriend, err := uc.FriendSvc.CheckFriendship(ctx, userId, friendId)
	if err != nil || !isFriend {
		return entities.UserStatus{}, errors.New("not friends")
	}
	return uc.StatusRepo.GetStatus(ctx, friendId)
}
