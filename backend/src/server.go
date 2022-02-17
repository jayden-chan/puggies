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
	"strconv"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/go-co-op/gocron"
)

func doRescan(trigger string, c Context) {
	c.logger.Infof("trigger=%s starting incremental demo folder rescan", trigger)
	err := parseAllIdempotent(c.config.demosPath, c.config.dataPath, c)
	if err != nil {
		c.logger.Errorf("trigger=%s failed to re-scan demos folder: %s", trigger, err.Error())
	} else {
		c.logger.Infof("trigger=%s incremental demo folder rescan finished", trigger)
	}
}

func watchFileChanges(c Context) {
	heatmapsDir := join(c.config.dataPath, "heatmaps")
	fileChanged := make(chan string, FileChangedChannelBuffer)

	// register our fsnotify watcher to send events to our
	// fileChanged channel
	go watchDemoDir(c.config.demosPath, fileChanged, c.logger)

	for f := range fileChanged {
		c.logger.Infof("file change detected: %s", f)
		demoId := getDemoFileName(f)
		err := parseIdempotent(f, heatmapsDir, c)
		if err != nil {
			c.logger.Errorf(
				"demo=%s Failed to parse demo: %s",
				demoId,
				err.Error(),
			)
		} else {
			c.logger.Infof("demo=%s added demo to database", demoId)
		}
	}
}

func registerJobs(s *gocron.Scheduler, c Context) {
	c.logger.Info("registering scheduler jobs")

	s.Every(c.config.rescanInterval).Minutes().Do(func() {
		doRescan("cron", c)
	})

	s.Every(1).Hour().Do(func() {
		c.logger.Infof("trigger=cron clearing stale invalid tokens")
		err := c.db.CleanInvalidTokens()
		if err != nil {
			c.logger.Errorf(
				"trigger=cron failed to clean invalid tokens from database: %s",
				err.Error(),
			)
		} else {
			c.logger.Infof("trigger=cron finished clearing stale invalid tokens")
		}
	})
}

func genFileRoute(router *gin.Engine, maxAge int, basepath ...string) func(string) {
	return func(relativePath string) {
		finalFilePath := append(basepath, relativePath)
		filepath := join(finalFilePath...)

		if strings.Contains(relativePath, ":") || strings.Contains(relativePath, "*") {
			panic("URL parameters can not be used when serving a static file")
		}

		handler := func(ginc *gin.Context) {
			ginc.Header("Cache-Control", "max-age="+strconv.Itoa(maxAge))
			ginc.File(filepath)
		}

		router.GET(relativePath, handler)
		router.HEAD(relativePath, handler)
	}
}

func runServer(c Context) {
	r := gin.Default()

	if len(c.config.trustedProxies) != 0 {
		r.SetTrustedProxies(c.config.trustedProxies)
	} else {
		r.SetTrustedProxies(nil)
	}

	// static files are good for a day
	staticFileRoute := genFileRoute(r, 86400, c.config.staticPath)
	// assets are good for 3 days
	assetRoute := genFileRoute(r, 259200, c.config.assetsPath, "..")

	// Middlewares
	r.Use(gzip.Gzip(gzip.DefaultCompression))

	// Static files in the root that browsers might ask for
	staticFileRoute("/android-chrome-192x192.png")
	staticFileRoute("/android-chrome-512x512.png")
	staticFileRoute("/apple-touch-icon.png")
	staticFileRoute("/favicon-16x16.png")
	staticFileRoute("/favicon-32x32.png")
	staticFileRoute("/favicon.ico")
	staticFileRoute("/manifest.json")
	staticFileRoute("/robots.txt")

	// We are manually putting in all the routes for all assets
	// because Gin doesn't allow setting the Cache-Control header
	// in their r.Static method.
	assetRoute("/assets/fonts/NimbusSanL-Reg.woff")
	assetRoute("/assets/fonts/NimbusSanL-Bol.woff")
	assetRoute("/assets/logos/esea.png")
	assetRoute("/assets/logos/faceit.png")
	assetRoute("/assets/logos/steam.png")
	assetRoute("/assets/logos/pugsetup.png")
	assetRoute("/assets/killfeed/blind.png")
	assetRoute("/assets/killfeed/flashassist.png")
	assetRoute("/assets/killfeed/headshot.png")
	assetRoute("/assets/killfeed/noscope.png")
	assetRoute("/assets/killfeed/smoke.png")
	assetRoute("/assets/killfeed/wallbang.png")
	assetRoute("/assets/maps/de_ancient.jpeg")
	assetRoute("/assets/maps/de_cache.jpg")
	assetRoute("/assets/maps/de_dust2.jpg")
	assetRoute("/assets/maps/de_inferno.jpg")
	assetRoute("/assets/maps/de_mirage.jpg")
	assetRoute("/assets/maps/de_nuke.jpg")
	assetRoute("/assets/maps/de_overpass.jpg")
	assetRoute("/assets/maps/de_train.jpg")
	assetRoute("/assets/maps/de_vertigo.jpg")
	assetRoute("/assets/weapons/eq_fraggrenade.png")
	assetRoute("/assets/weapons/eq_taser.png")
	assetRoute("/assets/weapons/fire.png")
	assetRoute("/assets/weapons/knife_butterfly.png")
	assetRoute("/assets/weapons/knife_flip.png")
	assetRoute("/assets/weapons/knife_karam.png")
	assetRoute("/assets/weapons/knife_m9_bay.png")
	assetRoute("/assets/weapons/knife_push.png")
	assetRoute("/assets/weapons/knife_survival_bowie.png")
	assetRoute("/assets/weapons/mach_m249.png")
	assetRoute("/assets/weapons/mach_negev.png")
	assetRoute("/assets/weapons/pist_223.png")
	assetRoute("/assets/weapons/pist_cz75.png")
	assetRoute("/assets/weapons/pist_deagle.png")
	assetRoute("/assets/weapons/pist_elite.png")
	assetRoute("/assets/weapons/pist_fiveseven.png")
	assetRoute("/assets/weapons/pist_glock18.png")
	assetRoute("/assets/weapons/pist_hkp2000.png")
	assetRoute("/assets/weapons/pist_p250.png")
	assetRoute("/assets/weapons/pist_revolver.png")
	assetRoute("/assets/weapons/pist_tec9.png")
	assetRoute("/assets/weapons/rif_ak47.png")
	assetRoute("/assets/weapons/rif_aug.png")
	assetRoute("/assets/weapons/rif_famas.png")
	assetRoute("/assets/weapons/rif_galilar.png")
	assetRoute("/assets/weapons/rif_m4a1.png")
	assetRoute("/assets/weapons/rif_m4a1_s.png")
	assetRoute("/assets/weapons/rif_sg556.png")
	assetRoute("/assets/weapons/shot_mag7.png")
	assetRoute("/assets/weapons/shot_nova.png")
	assetRoute("/assets/weapons/shot_sawedoff.png")
	assetRoute("/assets/weapons/shot_xm1014.png")
	assetRoute("/assets/weapons/smg_bizon.png")
	assetRoute("/assets/weapons/smg_mac10.png")
	assetRoute("/assets/weapons/smg_mp5sd.png")
	assetRoute("/assets/weapons/smg_mp7.png")
	assetRoute("/assets/weapons/smg_mp9.png")
	assetRoute("/assets/weapons/smg_p90.png")
	assetRoute("/assets/weapons/smg_ump45.png")
	assetRoute("/assets/weapons/snip_awp.png")
	assetRoute("/assets/weapons/snip_g3sg1.png")
	assetRoute("/assets/weapons/snip_scar20.png")
	assetRoute("/assets/weapons/snip_ssg08.png")

	// Source code and license
	staticFileRoute("/puggies-src.tar.gz")
	staticFileRoute("/LICENSE.txt")

	// API routes
	v1 := r.Group("/api/v1")
	{
		v1.GET("/ping", route_ping())
		v1.GET("/health", route_health())
		v1.GET("/canselfsignup", route_canSelfSignup(c))
		v1.GET("/matches/:id", route_match(c))
		v1.GET("/history", route_history(c))
		v1.GET("/usermeta/:id", route_usermeta(c))

		v1.PATCH("/rescan", route_rescan(c))

		v1.POST("/login", route_login(c))

		if c.config.selfSignupEnabled {
			v1.POST("/register", route_register(c))
		}

		v1Auth := v1.Group("/")
		v1Auth.Use(AuthRequired(c))
		{
			v1Auth.GET("/userinfo", route_userinfo(c))
			v1Auth.POST("/logout", route_logout(c))
		}

		v1Admin := v1.Group("/")
		v1Admin.Use(AllowedRoles(c, []string{"admin"}))
		{
			v1Admin.POST("/adminregister", route_register(c))
			v1Admin.PUT("/usermeta/:id", route_editUserMeta(c))
			v1Admin.DELETE("/matches/:id", route_deleteMatch(c))
		}

	}

	// React frontend routes
	r.Static(c.config.frontendPath, c.config.staticPath)
	r.GET("/", route_redirToApp(c.config.frontendPath))

	// 404 handler
	r.NoRoute(route_noRoute(c.config.staticPath, c.config.frontendPath))
	r.Run(":" + c.config.port)
}
