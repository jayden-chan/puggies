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

func route_file(dataPath, fileName string) func(*gin.Context) {
	return func(ginc *gin.Context) {
		ginc.File(join(dataPath, fileName))
	}
}

func route_license(frontendPath string) func(*gin.Context) {
	return func(ginc *gin.Context) {
		ginc.File(join(frontendPath, "LICENSE.txt"))
	}
}

func route_redirToApp(frontendPath string) func(*gin.Context) {
	return func(ginc *gin.Context) {
		ginc.Redirect(http.StatusMovedPermanently, frontendPath)
	}
}

func route_noRoute(staticPath, frontendPath string) func(*gin.Context) {
	return func(ginc *gin.Context) {
		// Serve the frontend in the event of a 404 at /app so that
		// the frontend routing works properly when navigating directly
		// to a page like /match/my_match_id
		path := ginc.Request.URL.Path
		if strings.HasPrefix(path, frontendPath) && !isLikelyFile(path) {
			ginc.File(join(staticPath, "index.html"))
		} else {
			ginc.JSON(http.StatusNotFound, gin.H{"error": "route not found"})
		}
	}
}
