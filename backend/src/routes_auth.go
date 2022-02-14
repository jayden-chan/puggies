package main

import (
	"net/http"

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
