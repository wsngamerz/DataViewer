package health

import (
	"context"
	"net/http"
	"time"

	"github.com/alexliesenfeld/health"
	"github.com/gin-gonic/gin"
)

type Handler struct{}

func NewHandler(g *gin.RouterGroup) {
	handler := &Handler{}
	g.GET("", gin.WrapH(handler.ServeHealth()))
}

// ServeHealth godoc
//
//	@Summary		Gets the health of the service
//	@Description	get the health of the dependencies of the service
//	@Tags			Health
//	@Produce		json
//	@Success		200
//	@Router			/health [get]
func (h *Handler) ServeHealth() http.HandlerFunc {
	checker := health.NewChecker(
		health.WithCheck(health.Check{
			Name:    "SomeCheck",
			Timeout: 2 * time.Second,
			Check: func(ctx context.Context) error {
				// Todo: Insert your health check here
				return nil
			},
		}),
	)

	return health.NewHandler(
		checker,
	)
}
