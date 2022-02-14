package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func route_file(dataPath, fileName string) func(*gin.Context) {
	return func(c *gin.Context) {
		c.File(join(dataPath, fileName))
	}
}

func route_license(frontendPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		c.File(join(frontendPath, "LICENSE.txt"))
	}
}

func route_redirToApp(frontendPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, frontendPath)
	}
}

func route_noRoute(staticPath, frontendPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		// Serve the frontend in the event of a 404 at /app so that
		// the frontend routing works properly when navigating directly
		// to a page like /match/my_match_id
		path := c.Request.URL.Path
		if strings.HasPrefix(path, frontendPath) && !isLikelyFile(path) {
			c.File(join(staticPath, "index.html"))
		} else {
			c.String(404, "404 not found\n")
		}
	}
}
