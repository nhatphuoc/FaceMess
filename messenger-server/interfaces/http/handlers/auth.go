package handlers

import (
	"messenger-server/domain/usecases"
	"messenger-server/infrastructure/services"
	"net/http"

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
	token, err := h.AuthUC.AuthenticateWithGoogle(c, code)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}
