// messenger-server/infrastructure/repository/user_repository.go
package repository

import (
	"context"
	"messenger-server/domain/entities"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserMongoRepository struct {
	Collection *mongo.Collection
}

func NewUserMongoRepository(db *mongo.Database) *UserMongoRepository {
	return &UserMongoRepository{
		Collection: db.Collection("users"),
	}
}

func (r *UserMongoRepository) SaveUser(ctx context.Context, user entities.User) (entities.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.Collection.InsertOne(ctx, user)
	return user, err
}

func (r *UserMongoRepository) FindByEmail(ctx context.Context, email string) (entities.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user entities.User
	err := r.Collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	return user, err
}

func (r *UserMongoRepository) FindByGoogleID(ctx context.Context, googleId string) (entities.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user entities.User
	err := r.Collection.FindOne(ctx, bson.M{"googleId": googleId}).Decode(&user)
	return user, err
}
