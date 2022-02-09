package main

import (
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/go-co-op/gocron"
)

func join(elem ...string) string {
	return filepath.Join(elem...)
}

func RegisterRescanJob(s *gocron.Scheduler, config Config, logger *Logger) {
	logger.Info("starting incremental demo folder rescan interval job")
	s.Every(config.incrementalRescanIntervalMinutes).Minutes().Do(func() {
		logger.Info("[trigger=cron] starting incremental demo folder rescan")
		err := ParseAll(config.demosPath, config.dataPath, true, logger)
		if err != nil {
			logger.Error("incremental demo parse interval failed. reason: %s", err.Error())
		}
	})
}

func RunServer(config Config, logger *Logger) {
	r := gin.Default()

	if len(config.trustedProxies) != 0 {
		r.SetTrustedProxies(config.trustedProxies)
	} else {
		r.SetTrustedProxies(nil)
	}

	// Middlewares
	r.Use(gzip.Gzip(gzip.DefaultCompression))

	// Frontend routes
	r.Static(config.frontendPath, config.staticPath)
	r.GET("/", redirToApp(config.frontendPath))

	// Static files in the root that browsers might ask for
	r.StaticFile("/android-chrome-192x192.png", join(config.staticPath, "android-chrome-192x192.png"))
	r.StaticFile("/android-chrome-512x512.png", join(config.staticPath, "android-chrome-512x512.png"))
	r.StaticFile("/apple-touch-icon.png", join(config.staticPath, "apple-touch-icon.png"))
	r.StaticFile("/favicon-16x16.png", join(config.staticPath, "favicon-16x16.png"))
	r.StaticFile("/favicon-32x32.png", join(config.staticPath, "favicon-32x32.png"))
	r.StaticFile("/favicon.ico", join(config.staticPath, "favicon.ico"))

	// Source code and license
	r.StaticFile("/puggies-src.tar.gz", join(config.staticPath, "puggies-src.tar.gz"))
	r.GET("/LICENSE.txt", license(config.staticPath))

	// API routes
	v1 := r.Group("/api/v1")
	{
		v1.GET("/ping", ping())
		v1.GET("/health", ping())
		v1.GET("/matches/:id", matches(config.dataPath))
		v1.GET("/history.json", history(config.dataPath))

		v1.PATCH("/rescan", rescan(config, logger))
	}

	// 404 handler
	r.NoRoute(noRoute(config.staticPath, config.frontendPath))
	r.Run(":" + config.port)
}

func ping() func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	}
}

func rescan(config Config, logger *Logger) func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Incremental re-scan of demos folder started",
		})

		go func() {
			logger.Info("[trigger=api] starting incremental demo folder rescan")
			err := ParseAll(config.demosPath, config.dataPath, true, logger)
			if err != nil {
				logger.Error("failed to re-scan demos folder: %s", err.Error())
			} else {
				logger.Info("completed incremental re-scan demos folder")
			}
		}()
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
