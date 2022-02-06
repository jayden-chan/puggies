package main

import (
	"fmt"
	"os"
)

func main() {
	switch os.Args[1] {
	case "--parse":
		if os.Args[2] != "" {
			ParseDemo(os.Args[2])
		} else {
			fmt.Fprintln(os.Stderr, "Provide the path to the demo file")
		}
	}
}
