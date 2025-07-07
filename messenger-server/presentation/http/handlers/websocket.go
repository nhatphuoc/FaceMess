// File: messenger-server/presentation/http/handlers/websocket.go
package handlers

import (
	"messenger-server/application/usecases"
	"messenger-server/infrastructure/websocket"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/gin-gonic/gin"
)

type WebSocketHandler struct {
	MessageUC  *usecases.MessageUseCase
	Cloudinary *cloudinary.Cloudinary
	Hub        *websocket.Hub
}

func NewWebSocketHandler(messageUC *usecases.MessageUseCase, cloudinary *cloudinary.Cloudinary, hub *websocket.Hub) *WebSocketHandler {
	return &WebSocketHandler{MessageUC: messageUC, Cloudinary: cloudinary, Hub: hub}
}

func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	userEmail := c.GetString("userEmail")
	friendEmail := c.GetString("friendEmail")
	websocket.ServeWs(h.Hub, c.Writer, c.Request, userEmail, friendEmail, h.MessageUC)
}
