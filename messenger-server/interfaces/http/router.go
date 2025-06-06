package http

import (
	"messenger-server/interfaces/http/handlers"
	"messenger-server/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(authHandler *handlers.AuthHandler, wsHandler *handlers.WebSocketHandler, jwtSecret string) *gin.Engine {
	r := gin.Default()

	r.GET("/auth/google", authHandler.GoogleLogin)
	r.GET("/auth/google/callback", authHandler.GoogleCallback)
	r.GET("/ws/:userId/:friendId", middleware.AuthMiddleware(jwtSecret), wsHandler.HandleWebSocket)

	return r
}
