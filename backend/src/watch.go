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
	"strings"

	"github.com/fsnotify/fsnotify"
)

type FileRename struct {
	old, new string
}

func watchDemoDir(watchDir string, newFile chan<- string, renamedFile chan<- FileRename, logger *Logger) error {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		logger.Error(err)
		return err
	}

	defer watcher.Close()

	done := make(chan bool)
	go func() {
		var prev *fsnotify.Event
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					done <- true
					return
				}

				if strings.HasSuffix(event.Name, ".dem") &&
					event.Op&fsnotify.Create == fsnotify.Create {

					if prev != nil && prev.Op&fsnotify.Rename == fsnotify.Rename {
						renamedFile <- FileRename{old: prev.Name, new: event.Name}
					} else {
						newFile <- event.Name
					}
				}

				prev = &event
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
