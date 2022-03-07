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
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func getUsername(ginc *gin.Context) string {
	userVal, exists := ginc.Get("user")
	if !exists {
		return ""
	}

	user, ok := userVal.(User)
	if !ok {
		return ""
	}

	return user.Username
}

func route_deleteMatch(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		err := c.db.SoftDeleteMatch(id)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.db.InsertAuditEntry(AuditEntry{
			Action:      "MATCH_DELETED",
			Username:    getUsername(ginc),
			Description: fmt.Sprintf("Match %s was marked as deleted", id),
		})

		ginc.JSON(http.StatusOK, gin.H{"message": "match deleted"})
	}
}

func route_fullDeleteMatch(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		err := c.db.HardDeleteMatch(id)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.db.InsertAuditEntry(AuditEntry{
			Action:      "MATCH_REMOVED",
			Username:    getUsername(ginc),
			Description: fmt.Sprintf("Match %s removed from the matches database", id),
		})

		ginc.JSON(http.StatusOK, gin.H{"message": "match deleted"})
	}
}

func route_editUserMeta(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		var input UserMeta
		if err := ginc.ShouldBindJSON(&input); err != nil {
			ginc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := c.db.UpsertMatchMeta(id, input)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		marshalled, err := json.Marshal(input)
		if err == nil {
			c.db.InsertAuditEntry(AuditEntry{
				Action:      "USERMETA_UPDATED",
				Username:    getUsername(ginc),
				Description: fmt.Sprintf("User metadata for match %s was updated: %s", id, string(marshalled)),
			})
		}

		ginc.JSON(http.StatusOK, gin.H{"message": "match metadata updated"})
	}
}

func route_editUser(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		username := ginc.Param("username")

		var input UserWithPassword
		if err := ginc.ShouldBindJSON(&input); err != nil {
			ginc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := c.db.UpdateUser(username, input)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Don't marshall the password
		marshalled, err := json.Marshal(User{
			Username:    input.Username,
			DisplayName: input.DisplayName,
			Email:       input.Email,
			Roles:       input.Roles,
			SteamId:     input.SteamId,
		})

		if err == nil {
			c.db.InsertAuditEntry(AuditEntry{
				Action:      "USER_UPDATED",
				Username:    getUsername(ginc),
				Description: fmt.Sprintf("User %s was updated: %s", username, string(marshalled)),
			})
		}

		ginc.JSON(http.StatusOK, gin.H{"message": "user updated"})
	}
}

func route_rescan(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		ginc.JSON(http.StatusOK, gin.H{
			"message": "Incremental re-scan of demos folder started",
		})

		c.db.InsertAuditEntry(AuditEntry{
			Action:      "RESCAN_TRIGGERED",
			Username:    getUsername(ginc),
			Description: "Rescan of demos folder was triggered by API call",
		})

		go doRescan("api", c)
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
		} else {
			ginc.JSON(http.StatusOK, gin.H{"message": users})
		}
	}
}

func route_numUsers(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		numUsers, err := c.db.NumUsers()
		if err != nil {
			errString := fmt.Sprintf("Failed to fetch number of users: %s", err.Error())
			c.logger.Errorf(errString)
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
		} else {
			ginc.JSON(http.StatusOK, gin.H{"message": numUsers})
		}
	}
}

func route_auditLog(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		limitQ := ginc.DefaultQuery("limit", "50")
		offsetQ := ginc.DefaultQuery("offset", "0")
		limit, err := strconv.Atoi(limitQ)
		if err != nil {
			limit = 50
		}

		offset, err := strconv.Atoi(offsetQ)
		if err != nil {
			offset = 0
		}

		entries, err := c.db.GetAuditLog(limit, offset)
		if err != nil {
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ginc.JSON(http.StatusOK, gin.H{"message": entries})
	}
}

func route_numAuditLogEntries(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		numEntries, err := c.db.NumAuditLogEntries()
		if err != nil {
			errString := fmt.Sprintf("Failed to fetch size of audit log: %s", err.Error())
			c.logger.Errorf(errString)
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": errString})
		} else {
			ginc.JSON(http.StatusOK, gin.H{"message": numEntries})
		}
	}
}

func route_deletedMatches(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		limitQ := ginc.DefaultQuery("limit", "50")
		offsetQ := ginc.DefaultQuery("offset", "0")
		limit, err := strconv.Atoi(limitQ)
		if err != nil {
			limit = 50
		}

		offset, err := strconv.Atoi(offsetQ)
		if err != nil {
			offset = 0
		}

		matches, err := c.db.GetDeletedMatches(limit, offset)
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

		c.db.InsertAuditEntry(AuditEntry{
			Action:      "USER_DELETED",
			Username:    getUsername(ginc),
			Description: fmt.Sprintf("User %s was deleted", username),
		})

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

func route_restore(c Context) func(*gin.Context) {
	return func(ginc *gin.Context) {
		id := ginc.Param("id")
		path := join(c.config.demosPath, id+".dem")
		err := parseIdempotent(path, c.config.dataPath, c)
		if err != nil {
			c.logger.Errorf("failed to parse match during restore: %s", err.Error())
			ginc.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		} else {
			ginc.JSON(http.StatusOK, gin.H{"message": "match restored"})
		}
	}
}
