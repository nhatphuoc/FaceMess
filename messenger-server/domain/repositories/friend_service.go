// messenger-server/domain/interfaces/friend_service.go
package repositories

import "context"

type FriendService interface {
	CheckFriendship(ctx context.Context, userId, friendId int64) (bool, error)
}
