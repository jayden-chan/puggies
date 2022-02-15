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
