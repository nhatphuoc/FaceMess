package services

import (
	"context"
	"encoding/json"
	"io"
	"messenger-server/domain/entities"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OAuthService struct {
	Config *oauth2.Config
}

type googleUserInfo struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

func NewOAuthService(clientID, clientSecret, redirectURL string) *OAuthService {
	return &OAuthService{
		Config: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURL,
			Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"},
			Endpoint:     google.Endpoint,
		},
	}
}

func (s *OAuthService) GetGoogleAuthURL(state string) string {
	return s.Config.AuthCodeURL(state)
}

func (s *OAuthService) GetGoogleUser(ctx context.Context, code string) (entities.User, error) {
	token, err := s.Config.Exchange(ctx, code)
	if err != nil {
		return entities.User{}, err
	}

	client := s.Config.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return entities.User{}, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return entities.User{}, err
	}

	var userInfo googleUserInfo
	if err := json.Unmarshal(data, &userInfo); err != nil {
		return entities.User{}, err
	}

	return entities.User{
		GoogleID: userInfo.ID,
		Username: userInfo.Name,
		Email:    userInfo.Email,
		Avatar:   userInfo.Picture,
	}, nil
}
