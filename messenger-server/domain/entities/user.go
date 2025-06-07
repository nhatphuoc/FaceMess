package entities

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID   int64              `bson:"userId" json:"userId"`
	Username string             `bson:"username" json:"username"`
	Email    string             `bson:"email" json:"email"`
	GoogleID string             `bson:"googleId" json:"googleId"`
	Avatar   string             `bson:"avatar,omitempty" json:"avatar,omitempty"`
}
