// File: messenger-server/infrastructure/websocket/client.go
package websocket

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"messenger-server/application/usecases"
	"messenger-server/domain/entities"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const MaxMessageSize = 1024

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		allowedOrigins := []string{"http://localhost:3000"}
		origin := r.Header.Get("Origin")
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				return true
			}
		}
		return false
	},
}

type Client struct {
	Hub   *Hub
	Conn  *websocket.Conn
	Send  chan []byte
	Email string
}

func NewClient(hub *Hub, conn *websocket.Conn, email string) *Client {
	return &Client{
		Hub:   hub,
		Conn:  conn,
		Send:  make(chan []byte, 256),
		Email: email,
	}
}

func (c *Client) SendError(errMsg string) {
	env := entities.Envelope{
		Type: "error",
		Data: map[string]string{"error": errMsg},
	}
	if encoded, err := json.Marshal(env); err == nil {
		c.Send <- encoded
	}
}

func (c *Client) ReadPump(friendEmail string, messageUC *usecases.MessageUseCase) {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(MaxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, []byte{'\n'}, []byte{' '}, -1))

		var msgObj entities.Message
		if err := json.Unmarshal(message, &msgObj); err != nil {
			c.SendError("Tin nhắn không hợp lệ")
			continue
		}

		msgObj.SenderEmail = c.Email
		msgObj.Timestamp = time.Now()
		msgObj.ReceiverEmail = friendEmail

		// if msgObj.ReceiverEmail == "" {
		// 	c.SendError("Email người nhận không được để trống")
		// 	continue
		// }

		// Chạy trong goroutine để tránh chặn luồng
		go func() {
			msgEntity, err := messageUC.SendMessage(context.Background(), c.Email, msgObj.ReceiverEmail, msgObj.Content)
			if err != nil {
				c.SendError("Lỗi gửi tin nhắn: " + err.Error())
				return
			}
			// Chuẩn bị envelope để gửi lại cho client
			env := entities.Envelope{
				Type: "message",
				Data: msgEntity,
			}
			data, err := json.Marshal(env)
			if err != nil {
				c.SendError("Lỗi mã hóa tin nhắn: " + err.Error())
				return
			}
			c.Send <- data // Gửi tin nhắn thành công về client
		}()
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}
			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, userEmail string, friendEmail string, messageUC *usecases.MessageUseCase) {
	conn, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade lỗi:", err)
		return
	}
	client := NewClient(hub, conn, userEmail)
	hub.Register <- client
	go client.WritePump()
	go client.ReadPump(friendEmail, messageUC)
}
