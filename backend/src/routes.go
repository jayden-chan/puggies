package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func ping() func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	}
}

// may update this later with actual health information
func health() func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "healthy",
		})
	}
}

func rescan(config Config, logger *Logger) func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Incremental re-scan of demos folder started",
		})

		go doRescan("api", config, logger)
	}
}

func matches(dataPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")
		if strings.Contains("..", id) {
			c.String(400, "bruh\n")
		}

		c.File(join(dataPath, "matches", id+".json"))
	}
}

func file(dataPath, fileName string) func(*gin.Context) {
	return func(c *gin.Context) {
		c.File(join(dataPath, fileName))
	}
}

func license(frontendPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		c.File(join(frontendPath, "LICENSE.txt"))
	}
}

func redirToApp(frontendPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, frontendPath)
	}
}

func noRoute(staticPath, frontendPath string) func(*gin.Context) {
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
