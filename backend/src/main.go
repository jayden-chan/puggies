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
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/go-co-op/gocron"
)

const (
	GitHubLink = "https://github.com/jayden-chan/puggies"
)

func main() {
	args := os.Args[1:]
	if len(args) == 0 {
		fmt.Println("Commands: parse, parseAll, serve")
		return
	}

	debug := false
	debugVar := os.Getenv("PUGGIES_DEBUG")
	if strings.ToLower(debugVar) == "true" || debugVar == "1" {
		debug = true
	}

	logger := newLogger(debug)
	config := getConfig(logger)
	logger.Debugf("using config: %s", config)

	switch args[0] {
	case "parse":
		commandParse(args, config, logger)
	case "parseAll":
		commandParseAll(args, config, logger)
	case "serve":
		commandServe(config, logger)
	}
}

func commandParse(args []string, config Config, logger *Logger) {
	if len(args) >= 2 && args[1] != "" {
		output, err := parseDemo(args[1], ".", config, logger)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			return
		}

		json, err := json.MarshalIndent(&output, "", "  ")
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
		} else {
			fmt.Println(string(json))
		}
	} else {
		fmt.Fprintln(os.Stderr, "Usage: parse /path/to/demo.dem")
	}
}

func commandParseAll(args []string, config Config, logger *Logger) {
	if len(args) >= 3 {
		incremental := false
		for _, arg := range args {
			if arg == "--incremental" {
				incremental = true
			}
		}

		err := parseAll(args[1], args[2], incremental, config, logger)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
		}
	} else {
		fmt.Fprintln(os.Stderr, "Usage: parseAll /path/to/demos /output/path")
	}
}

func commandServe(config Config, logger *Logger) {
	scheduler := gocron.NewScheduler(time.UTC)
	registerJobs(scheduler, config, logger)
	logger.Info("starting job scheduler")
	scheduler.StartAsync()

	go func() {
		fileChanged := make(chan string)
		go watchDemoDir(config.demosPath, fileChanged, logger)
		for f := range fileChanged {
			logger.Infof("file change detected: %s", f)

			// we will trigger a partial re-scan of the entire demos folder
			// when a file changes. the already-parsed demos will be skipped
			// and the new demo will be parsed. this also has the benefit of
			// ensuring the entire folder is up to date in case the server
			// somehow missed some of the file changed events or something.
			doRescan("filechange", config, logger)
		}
	}()

	logger.Infof("starting Puggies HTTP server on port %s", config.port)
	runServer(config, logger)
}
