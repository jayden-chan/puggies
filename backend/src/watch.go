package main

import (
	"github.com/fsnotify/fsnotify"
)

func watchDemoDir(watchDir string, notifyChan chan<- string, logger *Logger) error {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		logger.Error(err)
		return err
	}

	defer watcher.Close()

	done := make(chan bool)
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					done <- true
					return
				}

				if event.Op&fsnotify.Write == fsnotify.Write ||
					event.Op&fsnotify.Create == fsnotify.Create {
					notifyChan <- event.Name
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					done <- true
					return
				}
				logger.Debug("error:", err)
			}
		}
	}()

	err = watcher.Add(watchDir)
	if err != nil {
		logger.Error(err)
	}

	<-done
	return nil
}
