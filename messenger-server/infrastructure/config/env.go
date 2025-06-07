package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	MongoURL            string
	JWTSecret           string
	FacebookServiceURL  string
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	GoogleClientID      string
	GoogleClientSecret  string
	GoogleRedirectURI   string
}

func LoadEnv() Env {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	return Env{
		MongoURL:            os.Getenv("MONGO_URL"),
		JWTSecret:           os.Getenv("JWT_SECRET"),
		FacebookServiceURL:  os.Getenv("FACEBOOK_SERVICE_URL"),
		CloudinaryCloudName: os.Getenv("CLOUDINARY_CLOUD_NAME"),
		CloudinaryAPIKey:    os.Getenv("CLOUDINARY_API_KEY"),
		CloudinaryAPISecret: os.Getenv("CLOUDINARY_API_SECRET"),
		GoogleClientID:      os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:  os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleRedirectURI:   os.Getenv("GOOGLE_REDIRECT_URI"),
	}
}
