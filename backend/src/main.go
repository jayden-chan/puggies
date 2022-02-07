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
		RunServer()
	}
}
