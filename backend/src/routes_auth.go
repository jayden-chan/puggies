/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func route_deleteMatch(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		err := c.db.DeleteMatch(id)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ginc.JSON(http.StatusOK, gin.H{"message": "match deleted"})
	}
}

func route_fullDeleteMatch(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		err := c.db.FullDeleteMatch(id)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ginc.JSON(http.StatusOK, gin.H{"message": "match deleted"})
	}
}

func route_editUserMeta(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		var json UserMeta
		if err := ginc.ShouldBindJSON(&json); err != nil {
			ginc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := c.db.EditMatchMeta(id, json)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ginc.JSON(http.StatusOK, gin.H{"message": "match metadata updated"})
	}
}

func route_userinfo(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		userVal, exists := ginc.Get("user")
		if !exists {
			ginc.JSON(http.StatusUnauthorized, gin.H{"error": "not logged in"})
			return
		}

		user, ok := userVal.(User)
		if !ok {
			ginc.JSON(http.StatusUnauthorized, gin.H{"error": "not logged in"})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": user})
	}
}

func route_user(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		username := ginc.Param("username")
		user, err := c.db.GetUser(username)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		} else if user == nil {
			ginc.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": user})
	}
}

func route_users(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		users, err := c.db.GetUsers()
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": users})
	}
}

func route_deletedMatches(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		matches, err := c.db.GetDeletedMatches()
		if err != nil {
			errString := fmt.Sprintf("Failed to fetch deleted matches: %s", err.Error())
			c.logger.Errorf(errString)
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
		} else {
			ginc.JSON(http.StatusOK, gin.H{"message": matches})
		}
	}
}

func route_deleteUser(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		username := ginc.Param("username")
		err := c.db.DeleteUser(username)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": "user deleted"})
	}
}

func route_logout(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		token := ginc.GetString("token")
		_, iat, err := validateJwt(c, token)
		if err != nil {
			c.logger.Warn("invalid JWT found in logout route")
			ginc.JSON(http.StatusOK, gin.H{"message": "logged out"})
			return
		}

		expiry := time.Unix(iat, 0).Add(time.Second * 5)
		err = c.db.InvalidateToken(token, expiry)
		if err != nil {
			c.logger.Errorf("failed to add token to invalidated list: %s", err.Error())
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": "logged out"})
	}
}
