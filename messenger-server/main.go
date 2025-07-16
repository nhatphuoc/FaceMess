package main

import (
	"context"
	"log"
	"messenger-server/application/service"
	"messenger-server/application/usecases"
	"messenger-server/infrastructure/config"
	"messenger-server/infrastructure/database"
	"messenger-server/infrastructure/repository"
	"messenger-server/infrastructure/services"
	"messenger-server/infrastructure/websocket"
	"messenger-server/presentation/http"
	"messenger-server/presentation/http/handlers"

	"github.com/cloudinary/cloudinary-go/v2"
)

func main() {
	env := config.LoadEnv()

	// Kết nối tới MongoDB và lấy cả client và database
	mongoClient, db, err := database.ConnectMongoDB(env.MongoURL)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v", err)
		}
	}()

	database.InitDB(db)

	// Khởi tạo repository với database
	userRepo := repository.NewUserMongoRepository(db)
	messageRepo := repository.NewMessageMongoRepository(db)
	friendRepo := repository.NewFriendMongoRepository(db, env.FacebookServiceURL)

	oauthService := services.NewOAuthService(env.GoogleClientID, env.GoogleClientSecret, env.GoogleRedirectURI)

	cld, err := cloudinary.NewFromParams(env.CloudinaryCloudName, env.CloudinaryAPIKey, env.CloudinaryAPISecret)
	if err != nil {
		log.Fatalf("Failed to initialize Cloudinary: %v", err)
	}

	hub := websocket.NewHub()
	go hub.Run()

	// Khởi tạo use cases
	authUC := usecases.NewAuthUseCase(userRepo, oauthService, env.JWTSecret)
	messageService := service.NewMessageService(hub, messageRepo)
	friendService := service.NewFriendService(friendRepo)
	friendUC := usecases.NewFriendUseCase(friendService)
	messageUC := usecases.NewMessageUseCase(messageService, friendService)

	// Khởi tạo handlers
	authHandler := handlers.NewAuthHandler(authUC, oauthService)
	wsHandler := handlers.NewWebSocketHandler(messageUC, cld, hub)

	// Khởi tạo router
	router := http.SetupRouter(authHandler, wsHandler, friendUC, hub, env.JWTSecret)

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Server run error: %v", err)
	}
}
