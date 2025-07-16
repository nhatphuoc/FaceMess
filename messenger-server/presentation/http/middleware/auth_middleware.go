package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			fmt.Println("[AuthMiddleware] Missing Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil {
			fmt.Printf("[AuthMiddleware] JWT parse error: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
			c.Abort()
			return
		}

		if !token.Valid {
			fmt.Println("[AuthMiddleware] Token is not valid")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["email"] == nil {
			fmt.Println("[AuthMiddleware] Invalid claims or email missing")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			c.Abort()
			return
		}

		// Optional: Log thông tin token hợp lệ
		fmt.Printf("[AuthMiddleware] Authenticated user: %v\n", claims["email"])

		ctx := context.WithValue(c.Request.Context(), string("token"), tokenString)
		c.Set("userEmail", claims["email"].(string))
		c.Set("token", tokenString)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}
