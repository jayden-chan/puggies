package main

import (
	"encoding/json"
	"fmt"
	"os"
)

func main() {
	switch os.Args[1] {
	case "parse":
		if os.Args[2] != "" {
			output := ParseDemo(os.Args[2], ".")
			json, err := json.MarshalIndent(&output, "", "  ")
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
			} else {
				fmt.Println(string(json))
			}
		} else {
			fmt.Fprintln(os.Stderr, "Usage: parse /path/to/demo.dem")
		}
	case "parseAll":
		if os.Args[2] != "" && os.Args[3] != "" {
			err := ParseAll(os.Args[2], os.Args[3])
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
			}
		} else {
			fmt.Fprintln(os.Stderr, "Usage: parseAll /path/to/demos /output/path")
		}
	case "serve":
		dataPath := os.Getenv("PUGGIES_DATA_PATH")
		if dataPath == "" {
			// default path for docker container
			dataPath = "/data"
		}

		staticPath := os.Getenv("PUGGIES_STATIC_PATH")
		if staticPath == "" {
			// default path for docker container
			staticPath = "/frontend/build"
		}

		frontendPath := os.Getenv("PUGGIES_FRONTEND_PATH")
		if frontendPath == "" {
			frontendPath = "/app"
		}

		RunServer(dataPath, staticPath, frontendPath)
	}
}
