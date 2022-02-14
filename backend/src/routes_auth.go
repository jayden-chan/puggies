package main

import (
	"github.com/gin-gonic/gin"
)

func route_userinfo(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		username := ginc.GetString("username")
		user, err := c.db.GetUser(username)
		if err != nil {
			ginc.JSON(500, gin.H{"message": err.Error()})
		} else {
			c.logger.Info(user)
			ginc.JSON(200, user)
		}
	}
}
