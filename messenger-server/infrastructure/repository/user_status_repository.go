package repository

import (
	"context"
	"messenger-server/domain/entities"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserStatusMongoRepository struct {
	Collection *mongo.Collection
}

func NewUserStatusMongoRepository(client *mongo.Client) *UserStatusMongoRepository {
	return &UserStatusMongoRepository{
		Collection: client.Database("chat").Collection("user_status"),
	}
}

func (r *UserStatusMongoRepository) UpdateStatus(ctx context.Context, userId int, status string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	filter := bson.M{"userId": userId}
	update := bson.M{
		"$set": bson.M{
			"status":      status,
			"lastUpdated": time.Now(),
		},
	}
	_, err := r.Collection.UpdateOne(ctx, filter, update, &mongo.UpdateOptions{Upsert: true})
	return err
}

func (r *UserStatusMongoRepository) GetStatus(ctx context.Context, userId int) (entities.UserStatus, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var status entities.UserStatus
	err := r.Collection.FindOne(ctx, bson.M{"userId": userId}).Decode(&status)
	return status, err
}
