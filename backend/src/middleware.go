package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthRequired(c Context) gin.HandlerFunc {
	return func(ginc *gin.Context) {
		auth := ginc.GetHeader("Authorization")
		authWords := strings.Fields(auth)
		if len(authWords) != 2 || authWords[0] != "Bearer" {
			c.logger.Warn("invalid Authorization header encountered")
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		username, err := validateJwt(c, authWords[1])
		if err != nil {
			c.logger.Warn("invalid JWT provided")
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		hasUser, err := c.db.HasUser(username)
		if err != nil || hasUser == false {
			c.logger.Warnf(
				"username=%s valid JWT with non-existent user encountered",
				username,
			)
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		ginc.Set("username", username)
		ginc.Next()
	}
}
