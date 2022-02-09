package main

import (
	"log"
	"os"
)

type Logger struct {
	inner     *log.Logger
	debugMode bool
}

func newLogger(debugMode bool) *Logger {
	var inner *log.Logger
	if debugMode {
		inner = log.New(os.Stderr, "[puggies-core] ", 0)
	} else {
		inner = log.New(os.Stderr, "[puggies-core] ", log.Flags())
	}

	return &Logger{
		inner,
		debugMode,
	}
}

func (l *Logger) Debug(format string, a ...interface{}) {
	if l.debugMode {
		l.inner.Printf("[debug] "+format, a...)
	}
}

func (l *Logger) DebugBig(format string, a ...interface{}) {
	if l.debugMode {
		a = append(a, "----------------------------------------------------")
		l.inner.Printf("[debug] "+format, a...)
	}
}

func (l *Logger) Info(format string, v ...interface{}) {
	l.inner.Printf("[info] "+format, v...)
}

func (l *Logger) Warn(format string, v ...interface{}) {
	l.inner.Printf("[warn] "+format, v...)
}

func (l *Logger) Error(format string, v ...interface{}) {
	l.inner.Printf("[error] "+format, v...)
}
