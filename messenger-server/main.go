package main

import (
	"context"
	"log"
	"messenger-server/domain/usecases"
	"messenger-server/infrastructure/config"
	"messenger-server/infrastructure/database"
	"messenger-server/infrastructure/repository"
	"messenger-server/infrastructure/services"
	"messenger-server/interfaces/http"
	"messenger-server/interfaces/http/handlers"

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
	userStatusRepo := repository.NewUserStatusMongoRepository(db)

	friendService := services.NewFriendService(env.FacebookServiceURL)
	oauthService := services.NewOAuthService(env.GoogleClientID, env.GoogleClientSecret, env.GoogleRedirectURI)

	cld, err := cloudinary.NewFromParams(env.CloudinaryCloudName, env.CloudinaryAPIKey, env.CloudinaryAPISecret)
	if err != nil {
		log.Fatalf("Failed to initialize Cloudinary: %v", err)
	}

	authUC := usecases.NewAuthUseCase(userRepo, oauthService, env.JWTSecret)
	messageUC := usecases.NewMessageUseCase(messageRepo, friendService)
	userStatusUC := usecases.NewUserStatusUseCase(userStatusRepo, friendService)

	authHandler := handlers.NewAuthHandler(authUC, oauthService)
	wsHandler := handlers.NewWebSocketHandler(messageUC, userStatusUC, cld)

	router := http.SetupRouter(authHandler, wsHandler, env.JWTSecret)

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Server run error: %v", err)
	}
}
