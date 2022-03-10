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
			c.logger.Warnf("invalid Authorization header encountered: %s", auth)
			ginc.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{"message": "invalid Authorization headers"},
			)
			return
		}

		token := authWords[1]
		username, _, err := validateJwt(c, token)
		if err != nil {
			c.logger.Warn("invalid JWT provided")
			c.logger.Warn(err.Error())
			ginc.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{"message": "invalid token"},
			)
			return
		}

		valid, err := c.db.IsTokenValid(token)
		if err != nil {
			c.logger.Errorf("username=%s failed to fetch token validity from db", username)
			c.logger.Errorf(err.Error())
			ginc.AbortWithStatusJSON(
				http.StatusInternalServerError,
				gin.H{"message": "failed to fetch token validity from db"},
			)
			return
		}

		if !valid {
			c.logger.Errorf("username=%s attempted to use previously invalided token", username)
			ginc.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{"message": "invalid token"},
			)
			return
		}

		user, err := c.db.GetUser(username)
		if err != nil {
			c.logger.Warnf("username=%s failed to get user", username)
			c.logger.Warnf(err.Error())
			ginc.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{"message": "unauthorized"},
			)
			return
		} else if user == nil {
			c.logger.Warnf("username=%s valid token used for non-existent user", username)
			ginc.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{"message": "unauthorized"},
			)
			return
		}

		if allowedRoles == nil {
			ginc.Set("user", *user)
			ginc.Set("token", token)
			ginc.Next()
		} else {
			for _, ar := range allowedRoles {
				for _, ur := range user.Roles {
					if ar == ur {
						ginc.Set("user", *user)
						ginc.Set("token", token)
						ginc.Next()
						return
					}
				}
			}

			c.logger.Warnf("username=%s user doesn't have required roles for this route", username)
			ginc.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{"message": "Unauthorized: user lacks required role for this action"},
			)
		}

	}
}
