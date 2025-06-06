package interfaces

type FriendService interface {
	CheckFriendship(userId, friendId int) (bool, error)
}
