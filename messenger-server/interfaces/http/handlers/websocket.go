// messenger-server/interfaces/http/handlers/websocket.go
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

type WebSocketHandler struct {
	MessageUC  *usecases.MessageUseCase
	StatusUC   *usecases.UserStatusUseCase
	Cloudinary *cloudinary.Cloudinary
}

func NewWebSocketHandler(messageUC *usecases.MessageUseCase, statusUC *usecases.UserStatusUseCase, cloudinary *cloudinary.Cloudinary) *WebSocketHandler {
	return &WebSocketHandler{MessageUC: messageUC, StatusUC: statusUC, Cloudinary: cloudinary}
}

type clients map[int64]*websocket.Conn

var Clients = make(clients)

func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	userId := c.GetInt64("userId")
	friendIdStr := c.Param("friendId")
	friendId, err := strconv.ParseInt(friendIdStr, 10, 64)
	if err != nil {
		log.Println(err)
		return
	}

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}
	Clients[userId] = ws
	defer func() {
		h.StatusUC.UpdateStatus(context.Background(), userId, "offline")
		delete(Clients, userId)
		ws.Close()
	}()

	if err := h.StatusUC.UpdateStatus(context.Background(), userId, "online"); err != nil {
		log.Println(err)
	}

	messages, err := h.MessageUC.GetMessages(context.Background(), userId, friendId)
	if err != nil {
		ws.WriteJSON(gin.H{"error": err.Error()})
		return
	}
	if err := ws.WriteJSON(messages); err != nil {
		log.Println(err)
	}

	friendStatus, err := h.StatusUC.GetStatus(context.Background(), userId, friendId)
	if err == nil {
		ws.WriteJSON(gin.H{"type": "status", "userId": friendId, "status": friendStatus.Status})
	}

	for {
		var msg struct {
			Content  string `json:"content"`
			MediaURL string `json:"mediaUrl"`
		}
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Println(err)
			break
		}

		mediaURL := ""
		if msg.MediaURL != "" {
			resp, err := h.Cloudinary.Upload.Upload(context.Background(), msg.MediaURL, uploader.UploadParams{
				PublicID: "message_" + strconv.FormatInt(time.Now().UnixNano(), 10),
			})
			if err != nil {
				log.Println(err)
			} else {
				mediaURL = resp.SecureURL
			}
		}

		sentMsg, err := h.MessageUC.SendMessage(context.Background(), userId, friendId, msg.Content, mediaURL)
		if err != nil {
			ws.WriteJSON(gin.H{"error": err.Error()})
			continue
		}

		if receiverConn, ok := Clients[friendId]; ok {
			if err := receiverConn.WriteJSON(sentMsg); err != nil {
				log.Println(err)
			}
		}

		if err := ws.WriteJSON(sentMsg); err != nil {
			log.Println(err)
		}
	}
}
