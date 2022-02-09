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
		inner = log.New(os.Stderr, "[puggies-core] ", log.Lshortfile)
	} else {
		inner = log.New(os.Stderr, "[puggies-core] ", log.Flags())
	}

	return &Logger{
		inner,
		debugMode,
	}
}

func (l *Logger) Debug(v ...interface{}) {
	if l.debugMode {
		v = append(make([]interface{}, 1), v...)
		v[0] = "[debug]"
		l.inner.Println(v...)
	}
}

func (l *Logger) DebugBig(v ...interface{}) {
	if l.debugMode {
		v = append(make([]interface{}, 1), v...)
		v[0] = "[debug]"
		v = append(v, "----------------------------------------------------")
		l.inner.Println(v...)
	}
}

func (l *Logger) Debugf(format string, v ...interface{}) {
	if l.debugMode {
		l.inner.Printf("[debug] "+format, v...)
	}
}

func (l *Logger) Info(v ...interface{}) {
	v = append(make([]interface{}, 1), v...)
	v[0] = "[info]"
	l.inner.Println(v...)
}

func (l *Logger) Warn(v ...interface{}) {
	v = append(make([]interface{}, 1), v...)
	v[0] = "[warn]"
	l.inner.Println(v...)
}

func (l *Logger) Error(v ...interface{}) {
	v = append(make([]interface{}, 1), v...)
	v[0] = "[error]"
	l.inner.Println(v...)
}

func (l *Logger) Infof(format string, v ...interface{}) {
	l.inner.Printf("[info] "+format, v...)
}

func (l *Logger) Warnf(format string, v ...interface{}) {
	l.inner.Printf("[warn] "+format, v...)
}

func (l *Logger) Errorf(format string, v ...interface{}) {
	l.inner.Printf("[error] "+format, v...)
}
