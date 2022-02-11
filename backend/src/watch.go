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
