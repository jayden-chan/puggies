package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func join(elem ...string) string {
	return filepath.Join(elem...)
}

func RunServer(dataPath, staticPath, frontendPath string) {
	r := gin.Default()

	// Set the Gin trusted proxies if provided
	trustedProxies := os.Getenv("PUGGIES_TRUSTED_PROXIES")
	if trustedProxies != "" {
		proxies := strings.Split(trustedProxies, ",")
		r.SetTrustedProxies(proxies)
	} else {
		r.SetTrustedProxies(nil)
	}

	// Middlewares
	r.Use(gzip.Gzip(gzip.DefaultCompression))

	// Frontend routes
	r.Static(frontendPath, staticPath)
	r.GET("/", redirToApp(frontendPath))

	// Static files in the root that browsers might ask for
	r.StaticFile("/android-chrome-192x192.png", join(staticPath, "android-chrome-192x192.png"))
	r.StaticFile("/android-chrome-512x512.png", join(staticPath, "android-chrome-512x512.png"))
	r.StaticFile("/apple-touch-icon.png", join(staticPath, "apple-touch-icon.png"))
	r.StaticFile("/favicon-16x16.png", join(staticPath, "favicon-16x16.png"))
	r.StaticFile("/favicon-32x32.png", join(staticPath, "favicon-32x32.png"))
	r.StaticFile("/favicon.ico", join(staticPath, "favicon.ico"))

	// Source code and license
	r.StaticFile("/puggies-src.tar.gz", join(staticPath, "puggies-src.tar.gz"))
	r.GET("/LICENSE.txt", license(staticPath))

	// API routes
	v1 := r.Group("/api/v1")
	{
		v1.GET("/ping", ping())
		v1.GET("/health", ping())
		v1.GET("/matches/:id", matches(dataPath))
		v1.GET("/history.json", history(dataPath))
	}

	// 404 handler
	r.NoRoute(noRoute(staticPath, frontendPath))

	port := os.Getenv("PUGGIES_HTTP_PORT")
	if port == "" {
		port = "9115"
	}

	r.Run(":" + port)
}

func ping() func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	}
}

func matches(dataPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")
		c.File(join(dataPath, "matches", id))
	}
}

func history(dataPath string) func(*gin.Context) {
	return func(c *gin.Context) {
		c.File(join(dataPath, "history.json"))
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
		// the frontend routing works properly
		if strings.HasPrefix(c.Request.URL.Path, frontendPath) {
			c.File(join(staticPath, "index.html"))
		} else {
			c.String(404, "404 not found\n")
		}
	}
}
