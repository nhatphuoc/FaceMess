// messenger-server/infrastructure/database/mongodb.go
package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ConnectMongoDB kết nối tới MongoDB và trả về client, database
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
	db := client.Database("messenger") // Để driver tự chọn database từ URI

	return client, db, nil
}

// InitDB tạo các collection cần thiết nếu chưa tồn tại
func InitDB(db *mongo.Database) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Danh sách các collection cần tạo
	collections := []string{"users", "messages", "user_statuses"}

	for _, collName := range collections {
		err := createCollectionIfNotExists(ctx, db, collName)
		if err != nil {
			log.Printf("Error creating collection %s: %v", collName, err)
			return err
		}
	}

	log.Println("All collections initialized successfully.")
	return nil
}

// createCollectionIfNotExists kiểm tra collection đã tồn tại chưa, nếu chưa thì tạo mới
func createCollectionIfNotExists(ctx context.Context, db *mongo.Database, name string) error {
	// Lấy danh sách collection hiện tại
	collections, err := db.ListCollectionNames(ctx, struct{}{})
	if err != nil {
		return err
	}

	// Kiểm tra collection đã tồn tại chưa
	for _, coll := range collections {
		if coll == name {
			return nil // Collection đã tồn tại
		}
	}

	// Nếu chưa có thì tạo mới
	return db.CreateCollection(ctx, name)
}
