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
	s.Every(config.rescanInterval).Minutes().Do(func() {
		doRescan("cron", config, logger)
	})
}

func genFileRoute(router *gin.Engine, maxAge int, basepath ...string) func(string) {
	return func(relativePath string) {
		finalFilePath := append(basepath, relativePath)
		filepath := join(finalFilePath...)

		if strings.Contains(relativePath, ":") || strings.Contains(relativePath, "*") {
			panic("URL parameters can not be used when serving a static file")
		}

		handler := func(c *gin.Context) {
			c.Header("Cache-Control", "max-age="+strconv.Itoa(maxAge))
			c.File(filepath)
		}

		router.GET(relativePath, handler)
		router.HEAD(relativePath, handler)
	}
}

func runServer(config Config, logger *Logger) {
	r := gin.Default()

	if len(config.trustedProxies) != 0 {
		r.SetTrustedProxies(config.trustedProxies)
	} else {
		r.SetTrustedProxies(nil)
	}

	// static files are good for a day
	staticFileRoute := genFileRoute(r, 86400, config.staticPath)
	// assets are good for 3 days
	assetRoute := genFileRoute(r, 259200, config.assetsPath, "..")

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

	// Images (at /assets/)
	assetRoute("/assets/logos/esea.png")
	assetRoute("/assets/logos/faceit.png")
	assetRoute("/assets/logos/steam.png")
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
		v1.GET("/ping", ping())
		v1.GET("/health", health())
		v1.GET("/matches/:id", matches(config.dataPath))
		v1.GET("/history", file(config.dataPath, "history.json"))
		v1.GET("/usermeta", file(config.dataPath, "usermeta.json"))

		v1.PATCH("/rescan", rescan(config, logger))
	}

	// React frontend routes
	r.Static(config.frontendPath, config.staticPath)
	r.GET("/", redirToApp(config.frontendPath))

	// 404 handler
	r.NoRoute(noRoute(config.staticPath, config.frontendPath))
	r.Run(":" + config.port)
}
