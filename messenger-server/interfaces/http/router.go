// messenger-server/interfaces/http/router.go
package http

import (
	"messenger-server/interfaces/http/handlers"
	"messenger-server/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(authHandler *handlers.AuthHandler, wsHandler *handlers.WebSocketHandler, jwtSecret string) *gin.Engine {
	r := gin.Default()
	api := r.Group("/api")
	{
		api.GET("/auth/google", authHandler.GoogleLogin)
		api.GET("/auth/callback/google", authHandler.GoogleCallback)
		api.GET("/ws/:userId/:friendId", middleware.AuthMiddleware(jwtSecret), wsHandler.HandleWebSocket)
		api.GET("/testMess", func(c *gin.Context) {
			c.String(200, "messenger-server hello")
		})
	}
	return r
}
