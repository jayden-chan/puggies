package main

import (
	"fmt"
	"os"
)

func Debug(a ...interface{}) {
	debug := os.Getenv("PUGGIES_DEBUG")
	if debug == "true" || debug == "1" {
		fmt.Fprintln(os.Stderr, a...)
	}
}

func DebugBig(a ...interface{}) {
	debug := os.Getenv("PUGGIES_DEBUG")
	a = append(a, "----------------------------------------------------")
	if debug == "true" || debug == "1" {
		fmt.Fprintln(os.Stderr, a...)
	}
}
