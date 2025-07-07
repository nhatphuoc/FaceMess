// File: messenger-server/presentation/http/handlers/auth.go
package handlers

import (
	"fmt"
	"messenger-server/application/usecases"
	"messenger-server/infrastructure/services"
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	AuthUC *usecases.AuthUseCase
	OAuth  *services.OAuthService
}

func NewAuthHandler(authUC *usecases.AuthUseCase, oauth *services.OAuthService) *AuthHandler {
	return &AuthHandler{AuthUC: authUC, OAuth: oauth}
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	url := h.OAuth.GetGoogleAuthURL("state-token")
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	email, token, err := h.AuthUC.AuthenticateWithGoogle(c, code)
	if err != nil {
		errorURL := fmt.Sprintf("http://localhost:3000/login?error=%s", url.QueryEscape(err.Error()))
		c.Redirect(http.StatusTemporaryRedirect, errorURL)
		return
	}

	successURL := fmt.Sprintf("http://localhost:3000/login?token=%s&email=%s",
		url.QueryEscape(token),
		url.QueryEscape(email))

	c.Redirect(http.StatusTemporaryRedirect, successURL)
}
