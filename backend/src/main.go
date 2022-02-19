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
	"time"

	"github.com/go-co-op/gocron"
)

const (
	// hopefully no one drops more than 100 demos into
	// their demo folder at once lmao
	FileChangedChannelBuffer = 100
	GitHubLink               = "https://github.com/jayden-chan/puggies"
)

func main() {
	args := os.Args[1:]
	if len(args) == 0 {
		fmt.Println("Commands: parse, serve, migrate")
		return
	}

	command := args[0]

	config, err := getConfig()
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error: Failed to initialize configuration")
		fmt.Fprintln(os.Stderr, err)
		return
	}

	logger := newLogger(config.debug)

	// we don't need to initialize the database for these commands
	switch command {
	case "parse":
		commandParse(args, config, logger)
		return
	case "argon":
		commandArgon(args, logger)
		return
	}

	context, err := getContext(config, logger)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error: Failed to initialize application context")
		fmt.Fprintln(os.Stderr, err)
		return
	}

	defer context.db.Close()

	switch command {
	case "serve":
		commandServe(context)
	case "migrate":
		commandMigrate(args, context)
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

func commandServe(c Context) {
	c.logger.Infof("using config: %s", c.config)
	c.logger.Info("performing database migrations")
	err := c.db.RunMigration(c.config, "up")
	if err != nil {
		c.logger.Errorf("failed to run database migrations: %s", err.Error())
		return
	}

	c.logger.Info("completed database migrations")

	scheduler := gocron.NewScheduler(time.UTC)
	registerJobs(scheduler, c)
	c.logger.Info("starting job scheduler")
	scheduler.StartAsync()

	go watchFileChanges(c)
	c.logger.Infof("starting Puggies HTTP server on port %s", c.config.port)
	runServer(c)
}

func commandMigrate(args []string, c Context) {
	err := c.db.RunMigration(c.config, args[1])
	if err != nil {
		c.logger.Error(err)
	}
}

func commandArgon(args []string, logger *Logger) {
	argon2ID := NewArgon2ID()
	if len(args) < 2 {
		logger.Error("Provide the password to hash")
	}

	hash, err := argon2ID.Hash(args[1])
	if err != nil {
		logger.Error(err)
	} else {
		fmt.Println(hash)
	}
}
