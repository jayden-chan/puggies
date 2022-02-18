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
	"strings"

	"github.com/gin-gonic/gin"
)

func route_ping() func(*gin.Context) {
	return func(ginc *gin.Context) {
		ginc.JSON(http.StatusOK, gin.H{"message": "pong"})
	}
}

// may update this later with actual route_health information
func route_health() func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "healthy"})
	}
}

func route_options(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		ginc.JSON(http.StatusOK, gin.H{
			"message": gin.H{
				"selfSignupEnabled": c.config.selfSignupEnabled,
				"showLoginButton":   c.config.showLoginButton,
				"allowDemoDownload": c.config.allowDemoDownload,
			},
		})
	}
}

func route_match(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		if strings.Contains("..", id) {
			ginc.JSON(http.StatusBadRequest, gin.H{"error": "bruh"})
			return
		}

		meta, match, err := c.db.GetMatch(id)
		if err != nil {
			if err.Error() == "no rows in result set" {
				ginc.JSON(http.StatusNotFound, gin.H{"error": "match not found"})
			} else {
				errString := fmt.Sprintf("Failed to fetch matches: %s", err.Error())
				c.logger.Errorf(errString)
				ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
			}
		} else {
			ginc.JSON(http.StatusOK, gin.H{
				"message": gin.H{
					"meta":      meta,
					"matchData": match,
				},
			})
		}
	}
}

func route_history(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		matches, err := c.db.GetMatches()
		if err != nil {
			if err.Error() == "no rows in result set" {
				ginc.JSON(http.StatusNotFound, gin.H{"error": "no matches"})
			} else {
				errString := fmt.Sprintf("Failed to fetch matches: %s", err.Error())
				c.logger.Errorf(errString)
				ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
			}
		} else {
			ginc.JSON(http.StatusOK, gin.H{"message": matches})
		}
	}
}

func route_usermeta(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		// I'm not even sure if this is necessary but I guess better safe than sorry
		if strings.Contains("..", id) {
			ginc.JSON(http.StatusBadRequest, gin.H{"error": "bruh"})
			return
		}

		meta, err := c.db.GetUserMeta(id)
		if err != nil {
			if err.Error() == "no rows in result set" {
				// technically we should return a 404 here but the usermeta
				// is often going to be empty and we don't want to flood the
				// browser console with 404 errors (you can't turn them off)
				ginc.JSON(http.StatusOK, gin.H{"message": nil})
			} else {
				errString := fmt.Sprintf(
					"demo=%s Failed to fetch user meta for demo: %s",
					id,
					err.Error(),
				)

				c.logger.Errorf(errString)
				ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
			}
		} else {
			ginc.JSON(http.StatusOK, gin.H{"message": meta})
		}
	}
}

func route_rescan(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		ginc.JSON(http.StatusOK, gin.H{
			"message": "Incremental re-scan of demos folder started",
		})

		go doRescan("api", c)
	}
}

type RegisterPostData struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
	SteamId     string `json:"steamId"`
}

func route_register(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		var json RegisterPostData
		if err := ginc.ShouldBindJSON(&json); err != nil {
			ginc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		displayName := json.DisplayName
		if displayName == "" {
			displayName = json.DisplayName
		}

		user := User{
			Username:    json.Username,
			DisplayName: displayName,
			Email:       json.Email,
			SteamId:     json.SteamId,
		}

		err := c.db.RegisterUser(user, json.Password)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		token, err := createJwt(c, user)
		if err != nil {
			errString := err.Error()
			c.logger.Errorf(
				"username=%s failed to create JWT: %s",
				user.Username,
				errString,
			)
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": token})
	}
}

type LoginPostData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func route_login(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		var json LoginPostData
		if err := ginc.ShouldBindJSON(&json); err != nil {
			ginc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		username := json.Username
		password := json.Password
		user, err := c.db.Login(username, password)

		if err != nil {
			errString := err.Error()
			if errString == "wrong password" {
				c.logger.Warnf(
					"username=%s password=%s failed login attempt",
					username,
					password,
				)
				ginc.JSON(http.StatusUnauthorized, gin.H{"error": "password incorrect"})
			} else if errString == "no rows in result set" {
				c.logger.Warnf(
					"username=%s password=%s login attempt for non-existent user",
					username,
					password,
				)
				ginc.JSON(http.StatusNotFound, gin.H{"error": "user doesn't exist"})
			} else {
				c.logger.Errorf(
					"username=%s failed to perform user login test: %s",
					username,
					errString,
				)
				ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
			}
			return
		}

		token, err := createJwt(c, user)
		if err != nil {
			errString := err.Error()
			c.logger.Errorf(
				"username=%s failed to create JWT: %s",
				username,
				errString,
			)
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": token})
	}
}
