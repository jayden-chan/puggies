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
	config := GetConfig(logger)
	logger.Debug("using config: %s", config)

	switch args[0] {
	case "parse":
		commandParse(args, logger)
	case "parseAll":
		commandParseAll(args, logger)
	case "serve":
		commandServe(config, logger)
	}
}

func commandParse(args []string, logger *Logger) {
	if len(args) >= 2 && args[1] != "" {
		output, err := ParseDemo(args[1], ".", logger)
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

func commandParseAll(args []string, logger *Logger) {
	if len(args) >= 3 && args[1] != "" && args[2] != "" {
		incremental := false
		for _, arg := range args {
			if arg == "--incremental" {
				incremental = true
			}
		}

		err := ParseAll(args[1], args[2], incremental, logger)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
		}
	} else {
		fmt.Fprintln(os.Stderr, "Usage: parseAll /path/to/demos /output/path")
	}
}

func commandServe(config Config, logger *Logger) {
	scheduler := gocron.NewScheduler(time.UTC)
	RegisterRescanJob(scheduler, config, logger)
	logger.Info("starting job scheduler")
	go scheduler.StartBlocking()

	logger.Info("starting Puggies HTTP server on port %s", config.port)
	RunServer(config, logger)
}
