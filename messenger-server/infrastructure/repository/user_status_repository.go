// messenger-server/infrastructure/repository/user_status_repository.go
package repository

import (
	"context"
	"messenger-server/domain/entities"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserStatusMongoRepository struct {
	Collection *mongo.Collection
}

func NewUserStatusMongoRepository(db *mongo.Database) *UserStatusMongoRepository {
	return &UserStatusMongoRepository{
		Collection: db.Collection("user_status"),
	}
}

func (r *UserStatusMongoRepository) UpdateStatus(ctx context.Context, userId int64, status string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	filter := bson.M{"userId": userId}
	update := bson.M{
		"$set": bson.M{
			"status":      status,
			"lastUpdated": time.Now(),
		},
	}
	_, err := r.Collection.UpdateOne(ctx, filter, update, options.Update().SetUpsert(true))
	return err
}

func (r *UserStatusMongoRepository) GetStatus(ctx context.Context, userId int64) (entities.UserStatus, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var status entities.UserStatus
	err := r.Collection.FindOne(ctx, bson.M{"userId": userId}).Decode(&status)
	return status, err
}
