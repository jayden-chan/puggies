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

		token := authWords[1]
		username, _, err := validateJwt(c, token)
		if err != nil {
			c.logger.Warn("invalid JWT provided")
			c.logger.Warn(err.Error())
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		valid, err := c.db.IsTokenValid(token)
		if err != nil {
			c.logger.Errorf("username=%s failed to fetch token validity from db", username)
			c.logger.Errorf(err.Error())
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if !valid {
			c.logger.Errorf("username=%s attempted to use previously invalided token", username)
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		user, err := c.db.GetUser(username)
		if err != nil {
			c.logger.Warnf("username=%s failed to get user", username)
			c.logger.Warnf(err.Error())
			ginc.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if allowedRoles == nil {
			ginc.Set("user", user)
			ginc.Set("token", token)
			ginc.Next()
		} else {
			for _, ar := range allowedRoles {
				for _, ur := range user.Roles {
					if ar == ur {
						ginc.Set("user", user)
						ginc.Set("token", token)
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
