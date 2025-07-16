// File: messenger-server/presentation/http/router.go
package http

import (
	"messenger-server/application/usecases"
	"messenger-server/infrastructure/auth"
	"messenger-server/infrastructure/websocket"
	"messenger-server/presentation/http/handlers"
	"messenger-server/presentation/http/middleware"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func SetupRouter(authHandler *handlers.AuthHandler, wsHandler *handlers.WebSocketHandler, friendUC *usecases.FriendUseCase, hub *websocket.Hub, jwtSecret string) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	api := r.Group("/api")
	{
		// Endpoint đăng nhập Google
		api.GET("/auth/google", authHandler.GoogleLogin)
		api.GET("/auth/callback/google", authHandler.GoogleCallback)

		// Endpoint kiểm tra xác thực
		api.GET("/testMess", middleware.AuthMiddleware(jwtSecret), func(c *gin.Context) {
			userEmail, exists := c.Get("userEmail")
			if !exists {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found"})
				return
			}
			c.String(http.StatusOK, "Authenticated user email: %s", userEmail)
		})

		// api.GET("/friends", func(c *gin.Context) {
		// 	userEmail := "1234"
		// 	friends, err := friendUC.GetFriends(c, userEmail)
		// 	if err != nil {
		// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		// 		return
		// 	}
		// 	c.JSON(http.StatusOK, friends)
		// })
		// Endpoint lấy danh sách bạn bè
		api.GET("/friends", middleware.AuthMiddleware(jwtSecret), func(c *gin.Context) {
			userEmail := c.GetString("userEmail")
			friends, err := friendUC.GetFriends(c.Request.Context(), userEmail)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, friends)
		})

		// Endpoint gửi yêu cầu kết bạn
		api.POST("/friends/requests", middleware.AuthMiddleware(jwtSecret), func(c *gin.Context) {
			var req struct {
				FriendEmail string `json:"friendEmail"`
			}
			if err := c.BindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
				return
			}
			userEmail := c.GetString("userEmail")
			if err := friendUC.SendFriendRequest(c, userEmail, req.FriendEmail); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Friend request sent"})
		})

		// Endpoint lấy tin nhắn
		api.GET("/messages", middleware.AuthMiddleware(jwtSecret), func(c *gin.Context) {
			userEmail := c.GetString("userEmail")
			receiverEmail := c.Query("receiverEmail")
			if receiverEmail == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "receiverEmail is required"})
				return
			}
			messages, err := wsHandler.MessageUC.GetMessages(c, userEmail, receiverEmail)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, messages)
		})

		// Endpoint WebSocket
		api.GET("/ws/:friendEmail", func(c *gin.Context) {
			// Hỗ trợ token qua query parameter (theo yêu cầu giữ localStorage)
			token := c.Query("token")
			if token == "" {
				// Hỗ trợ thêm token qua header Authorization để tăng tính linh hoạt
				authHeader := c.GetHeader("Authorization")
				token = strings.TrimPrefix(authHeader, "Bearer ")
			}
			email, err := auth.ValidateJWT(token, jwtSecret)
			if err != nil || email == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ"})
				return
			}
			c.Set("userEmail", email)
			c.Set("friendEmail", c.Param("friendEmail"))
			wsHandler.HandleWebSocket(c)
		})
	}

	return r
}
