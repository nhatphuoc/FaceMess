// messenger-server/infrastructure/services/friend_service.go
package services

import (
	"context"
	"net/http"
	"strconv"
)

type FriendServiceImpl struct {
	BaseURL string
}

func NewFriendService(baseURL string) *FriendServiceImpl {
	return &FriendServiceImpl{BaseURL: baseURL}
}

func (s *FriendServiceImpl) CheckFriendship(ctx context.Context, userId, friendId int64) (bool, error) {
	url := s.BaseURL + "/friends/check?userId=" + strconv.FormatInt(userId, 10) + "&friendId=" + strconv.FormatInt(friendId, 10)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return false, err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return false, err
	}
	return true, nil
}
