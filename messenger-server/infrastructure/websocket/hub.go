package websocket

import (
	"encoding/json"
	"messenger-server/domain/entities"
	"sync"
)

type Hub struct {
	Clients    map[string]*Client
	Broadcast  chan []byte
	Register   chan *Client
	Unregister chan *Client
	Mutex      sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mutex.Lock()
			if _, exists := h.Clients[client.Email]; exists {
				client.SendError("Email đã được sử dụng")
				client.Conn.Close()
				h.Mutex.Unlock()
				continue
			}
			h.Clients[client.Email] = client
			h.Mutex.Unlock()
		case client := <-h.Unregister:
			h.Mutex.Lock()
			if _, ok := h.Clients[client.Email]; ok {
				delete(h.Clients, client.Email)
				close(client.Send)
			}
			h.Mutex.Unlock()
		case message := <-h.Broadcast:
			h.Mutex.RLock()
			var env entities.Envelope
			if err := json.Unmarshal(message, &env); err != nil {
				h.Mutex.RUnlock()
				continue
			}
			msg, ok := env.Data.(map[string]interface{})
			if !ok {
				h.Mutex.RUnlock()
				continue
			}
			receiverEmail, _ := msg["receiver_email"].(string)
			senderEmail, _ := msg["sender_email"].(string)

			for email, client := range h.Clients {
				if email == receiverEmail || email == senderEmail {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(h.Clients, email)
					}
				}
			}
			h.Mutex.RUnlock()
		}
	}
}
