// messenger-server/domain/interfaces/user_repository.go
package interfaces

import (
	"context"
	"messenger-server/domain/entities"
)

type UserRepository interface {
	SaveUser(ctx context.Context, user entities.User) (entities.User, error)
	FindByEmail(ctx context.Context, email string) (entities.User, error)
	FindByGoogleID(ctx context.Context, googleId string) (entities.User, error)
}
