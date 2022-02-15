package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthRequired(c Context) gin.HandlerFunc {
	return AllowedRoles(c, nil)
}

func AllowedRoles(c Context, allowedRoles []string) gin.HandlerFunc {
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

		user, err := c.db.GetUser(username)
		if err != nil {
			c.logger.Warnf("username=%s failed to get user", username)
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if allowedRoles == nil {
			ginc.Set("user", user)
			ginc.Next()
		} else {
			for _, ar := range allowedRoles {
				for _, ur := range user.Roles {
					if ar == ur {
						ginc.Set("user", user)
						ginc.Next()
						return
					}
				}
			}

			c.logger.Warnf("username=%s user doesn't have required roles for this route", username)
			ginc.AbortWithStatus(http.StatusUnauthorized)
		}

	}
}
