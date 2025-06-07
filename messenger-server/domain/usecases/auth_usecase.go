package usecases

import (
	"context"
	"crypto/rand"
	"encoding/binary"
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
		user = entities.User{
			UserID:   randInt(),
			Username: oauthUser.Username,
			Email:    oauthUser.Email,
			GoogleID: oauthUser.GoogleID,
			Avatar:   oauthUser.Avatar,
		}
		user, err = uc.UserRepo.SaveUser(ctx, user)
		if err != nil {
			return "", err
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.UserID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString([]byte(uc.JWTSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func randInt() int64 {
	var n int64
	err := binary.Read(rand.Reader, binary.BigEndian, &n)
	if err != nil {
		panic(err)
	}
	if n < 0 {
		n = -n
	}
	return n
}
