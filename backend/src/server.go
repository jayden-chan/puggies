package main

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func ping(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

func RunServer(dataPath, frontendPath string) {
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

	// Routes
	r.Static("/app", frontendPath)
	r.StaticFile("/favicon.ico", frontendPath+"/favicon.ico")
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/app")
	})

	v1 := r.Group("/api/v1")
	{
		v1.GET("/ping", ping)
		v1.GET("/health", ping)
		v1.Static("/matches", dataPath+"/matches")
		v1.StaticFile("/matchInfo.json", dataPath+"/matchInfo.json")
	}

	r.NoRoute(func(c *gin.Context) {
		// Serve the frontend in the event of a 404 at /app so that
		// the frontend routing works properly
		if strings.HasPrefix(c.Request.URL.Path, "/app") {
			c.File(frontendPath + "/index.html")
		} else {
			c.String(404, "404 not found\n")
		}
	})

	r.Run(":9115")
}
