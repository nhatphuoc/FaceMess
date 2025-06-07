package interfaces

import (
	"context"
	"messenger-server/domain/entities"
)

type UserStatusRepository interface {
	UpdateStatus(ctx context.Context, userId int64, status string) error
	GetStatus(ctx context.Context, userId int64) (entities.UserStatus, error)
}
