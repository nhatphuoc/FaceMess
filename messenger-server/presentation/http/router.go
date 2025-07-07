// File: messenger-server/presentation/http/router.go
package http

import (
	"messenger-server/infrastructure/auth"
	"messenger-server/infrastructure/websocket"
	"messenger-server/presentation/http/handlers"
	"messenger-server/presentation/http/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter(authHandler *handlers.AuthHandler, wsHandler *handlers.WebSocketHandler, jwtSecret string) *gin.Engine {
	r := gin.Default()
	hub := websocket.NewHub()
	go hub.Run()

	api := r.Group("/api")
	{
		api.GET("/auth/google", authHandler.GoogleLogin)
		api.GET("/auth/callback/google", authHandler.GoogleCallback)
		api.GET("/testMess", middleware.AuthMiddleware(jwtSecret), func(c *gin.Context) {
			// Lấy email từ context sau khi middleware xác thực
			userEmail, exists := c.Get("userEmail")
			if !exists {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found"})
				return
			}
			c.String(http.StatusOK, "Authenticated user email: %s", userEmail)
		})

		// Middleware xác thực token
		api.GET("/ws/:friendEmail", func(c *gin.Context) {
			token := c.Query("token")
			email, err := auth.ValidateJWT(token, jwtSecret)
			if err != nil || email == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ"})
				return
			}
			c.Set("userEmail", email)                    // Lưu email vào context
			c.Set("friendEmail", c.Param("friendEmail")) // Lưu email bạn bè vào context
			wsHandler.HandleWebSocket(c)
		})
	}

	return r
}
