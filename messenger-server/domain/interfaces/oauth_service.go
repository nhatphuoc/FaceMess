// messenger-server/domain/interfaces/oauth_service.go
package interfaces

import (
	"context"
	"messenger-server/domain/entities"
)

type OAuthService interface {
	GetGoogleAuthURL(state string) string
	GetGoogleUser(ctx context.Context, code string) (entities.User, error)
}
