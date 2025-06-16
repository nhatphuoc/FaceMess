// messenger-server/domain/usecases/auth_usecase.go
package usecases

import (
	"context"
	"messenger-server/domain/entities"
	"messenger-server/domain/interfaces"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type SignedDetails struct {
	Username string
	Email    string
	GoogleID string
	Avatar   string
	jwt.RegisteredClaims
}

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

	claims := SignedDetails{
		Username: oauthUser.Username,
		Email:    oauthUser.Email,
		GoogleID: oauthUser.GoogleID,
		Avatar:   oauthUser.Avatar,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(uc.JWTSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
