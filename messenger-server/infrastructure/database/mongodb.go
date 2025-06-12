package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectMongoDB(uri string) (*mongo.Client, *mongo.Database, error) {
	// Tạo context với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Kết nối tới MongoDB Atlas
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Printf("MongoDB connection error: %v. URI: %s", err, uri)
		return nil, nil, err
	}

	// Kiểm tra kết nối
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("Failed to ping MongoDB: %v. URI: %s", err, uri)
		return nil, nil, err
	}

	// Lấy database từ URI (driver sẽ tự chọn database từ URI)
	db := client.Database("") // Để driver tự chọn database từ URI

	return client, db, nil
}
