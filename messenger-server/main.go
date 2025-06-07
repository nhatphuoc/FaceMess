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

	mongoClient, err := database.ConnectMongoDB(env.MongoURL)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect(context.Background())

	userRepo := repository.NewUserMongoRepository(mongoClient)
	messageRepo := repository.NewMessageMongoRepository(mongoClient)
	userStatusRepo := repository.NewUserStatusMongoRepository(mongoClient)

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
