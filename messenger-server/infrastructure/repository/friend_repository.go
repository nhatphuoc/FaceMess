// File: messenger-server/infrastructure/repository/friend_repository.go
package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"messenger-server/domain/entities"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// UserResponse là struct tạm thời để trả về dữ liệu với trường isFriend

type FriendMongoRepository struct {
	Collection *mongo.Collection
	baseURL    string
	client     *http.Client
}

// NewFriendMongoRepository khởi tạo repository với baseURL và MongoDB collection
func NewFriendMongoRepository(db *mongo.Database, baseURL string) *FriendMongoRepository {
	return &FriendMongoRepository{
		Collection: db.Collection("users"),
		baseURL:    baseURL,
		client:     &http.Client{Timeout: 5 * time.Second},
	}
}

// GetFriends lấy danh sách tất cả người dùng và kiểm tra trạng thái bạn bè
func (r *FriendMongoRepository) GetFriends(ctx context.Context, userEmail string) ([]entities.UserResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Lấy token từ context
	token, ok := ctx.Value("token").(string)
	if !ok || token == "" {
		return nil, fmt.Errorf("no token found in context")
	}

	// Lấy danh sách bạn bè từ facebook-server (/api/friends)
	url := fmt.Sprintf("%s/api/friends", r.baseURL)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		fmt.Printf("err1: failed to create request: %v\n", err)
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := r.client.Do(req)
	if err != nil {
		fmt.Printf("err2: failed to fetch friends: %v\n", err)
		return nil, fmt.Errorf("failed to fetch friends: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("err3: non-200 status from fb-server: %d - %s\n", resp.StatusCode, string(body))
		return nil, fmt.Errorf("failed to fetch friends: %d - %s", resp.StatusCode, string(body))
	}

	var friends []entities.UserFB
	if err := json.NewDecoder(resp.Body).Decode(&friends); err != nil {
		fmt.Printf("err4: failed to decode friends response: %v\n", err)
		return nil, fmt.Errorf("failed to decode friends response: %v", err)
	}

	fmt.Printf("fb-server friends: %+v\n", friends)

	// Tạo map email của bạn bè để kiểm tra nhanh
	friendEmails := make(map[string]bool)
	for _, friend := range friends {
		friendEmails[friend.Email] = true
	}
	fmt.Printf("Friend emails: %+v\n", friendEmails)

	// Lấy tất cả người dùng từ MongoDB (trừ người dùng hiện tại)
	filter := bson.M{"email": bson.M{"$ne": userEmail}}
	cursor, err := r.Collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch users: %v", err)
	}
	defer cursor.Close(ctx)

	var users []entities.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, fmt.Errorf("failed to decode users: %v", err)
	}

	// Chuyển đổi sang UserResponse với trường isFriend
	userResponses := make([]entities.UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = entities.UserResponse{
			User:     user,
			IsFriend: friendEmails[user.Email],
		}
	}

	return userResponses, nil
}

func (r *FriendMongoRepository) SendFriendRequest(ctx context.Context, userEmail, friendEmail string) error {
	url := fmt.Sprintf("%s/requests", r.baseURL)
	payload := map[string]string{
		"friendEmail": friendEmail,
	}

	resp, err := r.doRequestWithBody(ctx, "POST", url, payload)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return r.readErrorResponse(resp)
	}
	return nil
}

func (r *FriendMongoRepository) CheckFriendship(ctx context.Context, userEmail, friendEmail string) (bool, error) {
	url := fmt.Sprintf("%s/?email=%s", r.baseURL, userEmail)
	resp, err := r.doRequest(ctx, "GET", url, nil)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, r.readErrorResponse(resp)
	}

	var friends []entities.User
	if err := json.NewDecoder(resp.Body).Decode(&friends); err != nil {
		return false, err
	}

	isFriend := false
	for _, friend := range friends {
		if friend.Email == friendEmail {
			isFriend = true
			break
		}
	}

	return isFriend, nil
}

// Internal Helper Functions

func (r *FriendMongoRepository) doRequest(ctx context.Context, method, url string, body io.Reader) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, err
	}

	// Lấy token từ context
	token, ok := ctx.Value("token").(string)
	if !ok || token == "" {
		return nil, fmt.Errorf("no token found in context")
	}
	req.Header.Set("Authorization", "Bearer "+token)

	return r.client.Do(req)
}

func (r *FriendMongoRepository) doRequestWithBody(ctx context.Context, method, url string, data interface{}) (*http.Response, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, method, url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	// Lấy token từ context
	token, ok := ctx.Value("token").(string)
	if !ok || token == "" {
		return nil, fmt.Errorf("no token found in context")
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	return r.client.Do(req)
}

func (r *FriendMongoRepository) readErrorResponse(resp *http.Response) error {
	body, _ := io.ReadAll(resp.Body)
	return fmt.Errorf("request failed [%d]: %s", resp.StatusCode, string(body))
}
