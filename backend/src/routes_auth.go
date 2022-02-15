package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func route_userinfo(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		userVal, exists := ginc.Get("user")
		if !exists {
			ginc.JSON(http.StatusUnauthorized, gin.H{"message": "not logged in"})
			return
		}

		user, ok := userVal.(User)
		if !ok {
			ginc.JSON(http.StatusUnauthorized, gin.H{"message": "not logged in"})
			return
		}

		ginc.JSON(200, user)
	}
}

func route_logout(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		token := ginc.GetString("token")
		_, iat, err := validateJwt(c, token)
		if err != nil {
			c.logger.Warn("invalid JWT found in logout route")
			ginc.JSON(200, gin.H{"message": "logged out"})
			return
		}

		expiry := time.Unix(iat, 0).Add(time.Second * 5)
		err = c.db.InvalidateToken(token, expiry)
		if err != nil {
			c.logger.Errorf("failed to add token to invalidated list: %s", err.Error())
			ginc.JSON(500, gin.H{"message": err.Error()})
			return
		}

		ginc.JSON(200, gin.H{"message": "logged out"})
	}
}
