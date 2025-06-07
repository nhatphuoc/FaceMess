package interfaces

import "context"

type FriendService interface {
	CheckFriendship(ctx context.Context, userId, friendId int64) (bool, error)
}
