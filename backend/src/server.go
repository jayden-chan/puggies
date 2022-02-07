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

func envOr(key, defaultV string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultV
	}
	return val
}

type serverSettings struct {
	dataPath     string
	staticPath   string
	frontendPath string
	port         string
}

func getSettings() serverSettings {
	return serverSettings{
		dataPath:     envOr("PUGGIES_DATA_PATH", "/data"),
		staticPath:   envOr("PUGGIES_STATIC_PATH", "/frontend/build"),
		frontendPath: envOr("PUGGIES_FRONTEND_PATH", "/app"),
		port:         envOr("PUGGIES_HTTP_PORT", "9115"),
	}
}

func RunServer() {
	r := gin.Default()
	s := getSettings()

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
	r.Static(s.frontendPath, s.staticPath)
	r.GET("/", redirToApp(s.frontendPath))

	// Static files in the root that browsers might ask for
	r.StaticFile("/android-chrome-192x192.png", join(s.staticPath, "android-chrome-192x192.png"))
	r.StaticFile("/android-chrome-512x512.png", join(s.staticPath, "android-chrome-512x512.png"))
	r.StaticFile("/apple-touch-icon.png", join(s.staticPath, "apple-touch-icon.png"))
	r.StaticFile("/favicon-16x16.png", join(s.staticPath, "favicon-16x16.png"))
	r.StaticFile("/favicon-32x32.png", join(s.staticPath, "favicon-32x32.png"))
	r.StaticFile("/favicon.ico", join(s.staticPath, "favicon.ico"))

	// Source code and license
	r.StaticFile("/puggies-src.tar.gz", join(s.staticPath, "puggies-src.tar.gz"))
	r.GET("/LICENSE.txt", license(s.staticPath))

	// API routes
	v1 := r.Group("/api/v1")
	{
		v1.GET("/ping", ping())
		v1.GET("/health", ping())
		v1.GET("/matches/:id", matches(s.dataPath))
		v1.GET("/history.json", history(s.dataPath))
	}

	// 404 handler
	r.NoRoute(noRoute(s.staticPath, s.frontendPath))
	r.Run(":" + s.port)
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
