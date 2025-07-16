// messenger-server/application/usecases/auth_usecase.go
package usecases

import (
	"context"
	"fmt"
	"io"
	"messenger-server/domain/entities"
	"messenger-server/domain/repositories"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type SignedDetails struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	GoogleID string `json:"google_id"`
	Avatar   string `json:"avatar"`
	jwt.RegisteredClaims
}

type AuthUseCase struct {
	UserRepo     repositories.UserRepository
	OAuthService repositories.OAuthService
	JWTSecret    string
}

func NewAuthUseCase(userRepo repositories.UserRepository, oauthService repositories.OAuthService, jwtSecret string) *AuthUseCase {
	return &AuthUseCase{UserRepo: userRepo, OAuthService: oauthService, JWTSecret: jwtSecret}
}

func (uc *AuthUseCase) AuthenticateWithGoogle(ctx context.Context, code string) (string, string, error) {
	// Fetch user info from Google OAuth
	oauthUser, err := uc.OAuthService.GetGoogleUser(ctx, code)
	if err != nil {
		return "", "", fmt.Errorf("failed to get Google user: %v", err)
	}

	// Validate required fields
	if oauthUser.Email == "" || oauthUser.GoogleID == "" {
		return "", "", fmt.Errorf("missing required user info: email or GoogleID")
	}

	// Find or create user
	user, err := uc.UserRepo.FindByGoogleID(ctx, oauthUser.GoogleID)
	if err != nil {
		user = entities.User{
			Username: oauthUser.Username,
			Email:    oauthUser.Email,
			GoogleID: oauthUser.GoogleID,
			Avatar:   oauthUser.Avatar,
		}
		user, err = uc.UserRepo.SaveUser(ctx, user)
		if err != nil {
			return "", "", fmt.Errorf("failed to save user: %v", err)
		}
	}

	// Gửi yêu cầu tạo user tới fb server
	fbServerURL := "http://localhost:5000/api/users" // Thay bằng URL thực tế của fb server
	jsonData := fmt.Sprintf(`{"email": "%s", "username": "%s", "googleId": "%s", "avatar": "%s"}`, user.Email, user.Username, user.GoogleID, user.Avatar)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fbServerURL, strings.NewReader(jsonData))
	if err != nil {
		return "", "", fmt.Errorf("failed to create request to fb server: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("failed to send request to fb server: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Printf("Failed to read error response body: %v\n", err)
		} else {
			fmt.Printf("fb server returned error: %s (Status: %v)\n", string(bodyBytes), resp.Status)
		}
		return "", "", fmt.Errorf("fb server returned error: %v", resp.Status)
	}

	// Generate JWT
	claims := SignedDetails{
		Username: user.Username,
		Email:    user.Email,
		GoogleID: user.GoogleID,
		Avatar:   user.Avatar,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(uc.JWTSecret))
	if err != nil {
		return "", "", fmt.Errorf("failed to generate token: %v", err)
	}

	return user.Email, tokenString, nil
}
