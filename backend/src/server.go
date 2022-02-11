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

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/go-co-op/gocron"
)

func doRescan(trigger string, config Config, logger *Logger) {
	logger.Infof("trigger=%s starting incremental demo folder rescan", trigger)
	err := parseAll(config.demosPath, config.dataPath, true, config, logger)
	if err != nil {
		logger.Errorf("trigger=%s failed to re-scan demos folder: %s", trigger, err.Error())
	} else {
		logger.Infof("trigger=%s incremental demo folder rescan finished", trigger)
	}
}

func registerJobs(s *gocron.Scheduler, config Config, logger *Logger) {
	logger.Info("registering scheduler jobs")
	s.Every(config.incrementalRescanIntervalMinutes).Minutes().Do(func() {
		doRescan("cron", config, logger)
	})
}

func staticFile(router *gin.Engine, relativePath, basepath string) {
	filepath := join(basepath, relativePath)

	if strings.Contains(relativePath, ":") || strings.Contains(relativePath, "*") {
		panic("URL parameters can not be used when serving a static file")
	}

	handler := func(c *gin.Context) {
		// static files are good for a day at least, probably more
		// but this is conservative
		c.Header("Cache-Control", "max-age=86400")
		c.File(filepath)
	}

	router.GET(relativePath, handler)
	router.HEAD(relativePath, handler)
}

func runServer(config Config, logger *Logger) {
	r := gin.Default()

	if len(config.trustedProxies) != 0 {
		r.SetTrustedProxies(config.trustedProxies)
	} else {
		r.SetTrustedProxies(nil)
	}

	// Middlewares
	r.Use(gzip.Gzip(gzip.DefaultCompression))

	// Serve the React frontend
	r.Static(config.frontendPath, config.staticPath)
	r.GET("/", redirToApp(config.frontendPath))

	// Static files in the root that browsers might ask for
	staticFile(r, "/android-chrome-192x192.png", config.staticPath)
	staticFile(r, "/android-chrome-512x512.png", config.staticPath)
	staticFile(r, "/apple-touch-icon.png", config.staticPath)
	staticFile(r, "/favicon-16x16.png", config.staticPath)
	staticFile(r, "/favicon-32x32.png", config.staticPath)
	staticFile(r, "/favicon.ico", config.staticPath)
	staticFile(r, "/manifest.json", config.staticPath)
	staticFile(r, "/robots.txt", config.staticPath)

	// Source code and license
	staticFile(r, "/puggies-src.tar.gz", config.staticPath)
	staticFile(r, "/LICENSE.txt", config.staticPath)

	// API routes
	v1 := r.Group("/api/v1")
	{
		v1.GET("/ping", ping())
		v1.GET("/health", health())
		v1.GET("/matches/:id", matches(config.dataPath))
		v1.GET("/history", file(config.dataPath, "history.json"))
		v1.GET("/usermeta", file(config.dataPath, "usermeta.json"))

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
