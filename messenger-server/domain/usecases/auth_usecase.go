package usecases

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"messenger-server/domain/entities"
	"messenger-server/domain/interfaces"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthUseCase struct {
	UserRepo     interfaces.UserRepository
	OAuthService interfaces.OAuthService
	JWTSecret    string
}

func NewAuthUseCase(userRepo interfaces.UserRepository, oauthService interfaces.OAuthService, jwtSecret string) *AuthUseCase {
	return &AuthUseCase{UserRepo: userRepo, OAuthService: oauthService, JWTSecret: jwtSecret}
}

func (uc *AuthUseCase) AuthenticateWithGoogle(ctx context.Context, code string) (string, error) {
	oauthUser, err := uc.OAuthService.GetGoogleUser(ctx, code)
	if err != nil {
		return "", err
	}

	user, err := uc.UserRepo.FindByGoogleID(ctx, oauthUser.GoogleID)
	if err != nil {
		// Tạo user mới
		user = entities.User{
			UserID:   randInt(),
			Username: oauthUser.Username,
			Email:    oauthUser.Email,
			GoogleID: oauthUser.GoogleID,
		}
		user, err = uc.UserRepo.SaveUser(ctx, user)
		if err != nil {
			return "", err
		}
	}

	// Tạo JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.UserID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString([]byte(uc.JWTSecret))
}

func randInt() int {
	b := make([]byte, 4)
	rand.Read(b)
	return int(base64.StdEncoding.EncodeToString(b)[0:4])
}
