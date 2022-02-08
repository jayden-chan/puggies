package main

import (
	"encoding/json"
	"fmt"
	"os"
)

func main() {
	args := os.Args[1:]
	if len(args) == 0 {
		fmt.Println("Commands: parse, parseAll, serve")
		return
	}

	switch args[0] {
	case "parse":
		if len(args) >= 2 && args[1] != "" {
			output := ParseDemo(args[1], ".")
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
		if len(args) >= 3 && args[1] != "" && args[2] != "" {
			incremental := false
			for _, arg := range args {
				if arg == "--incremental" {
					incremental = true
				}
			}

			err := ParseAll(args[1], args[2], incremental)
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
			}
		} else {
			fmt.Fprintln(os.Stderr, "Usage: parseAll /path/to/demos /output/path")
		}
	case "serve":
		RunServer()
	}
}
