package handlers

import (
	"context"
	"log"
	"messenger-server/domain/usecases"
	"net/http"
	"strconv"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}
var clients = make(map[int]*websocket.Conn)

type WebSocketHandler struct {
	MessageUC  *usecases.MessageUseCase
	StatusUC   *usecases.UserStatusUseCase
	Cloudinary *cloudinary.Cloudinary
}

func NewWebSocketHandler(messageUC *usecases.MessageUseCase, statusUC *usecases.UserStatusUseCase, cloudinary *cloudinary.Cloudinary) *WebSocketHandler {
	return &WebSocketHandler{MessageUC: messageUC, StatusUC: statusUC, Cloudinary: cloudinary}
}

func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	userId := c.GetInt("userId")
	friendIdStr := c.Param("friendId")
	friendId, _ := strconv.Atoi(friendIdStr)

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	clients[userId] = ws
	defer func() {
		h.StatusUC.UpdateStatus(context.Background(), userId, "offline")
		delete(clients, userId)
		ws.Close()
	}()

	// Cập nhật trạng thái online
	if err := h.StatusUC.UpdateStatus(context.Background(), userId, "online"); err != nil {
		log.Println("Update status error:", err)
	}

	// Gửi lịch sử tin nhắn
	messages, err := h.MessageUC.GetMessages(context.Background(), userId, friendId)
	if err != nil {
		ws.WriteJSON(gin.H{"error": err.Error()})
		return
	}
	ws.WriteJSON(messages)

	// Gửi trạng thái của friend
	friendStatus, err := h.StatusUC.GetStatus(context.Background(), userId, friendId)
	if err == nil {
		ws.WriteJSON(gin.H{"type": "status", "userId": friendId, "status": friendStatus.Status})
	}

	// Xử lý tin nhắn
	for {
		var msg struct {
			Content  string `json:"content"`
			MediaURL string `json:"mediaUrl"`
		}
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Println("WebSocket read error:", err)
			break
		}

		// Upload media
		mediaURL := msg.MediaURL
		if mediaURL != "" {
			resp, err := h.Cloudinary.Upload.Upload(context.Background(), mediaURL, uploader.UploadParams{
				PublicID: "message_" + time.Now().String(),
			})
			if err == nil {
				mediaURL = resp.SecureURL
			}
		}

		sentMsg, err := h.MessageUC.SendMessage(context.Background(), userId, friendId, msg.Content, mediaURL)
		if err != nil {
			ws.WriteJSON(gin.H{"error": err.Error()})
			continue
		}

		if receiverConn, ok := clients[friendId]; ok {
			receiverConn.WriteJSON(sentMsg)
		}
	}
}
