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
	"time"

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
		timers := make(map[string]*time.Timer, 10)
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					done <- true
					return
				}

				path := event.Name
				if !strings.HasSuffix(path, ".dem") {
					continue
				}

				if event.Op&fsnotify.Create == fsnotify.Create ||
					event.Op&fsnotify.Write == fsnotify.Write {

					if prev != nil && prev.Op&fsnotify.Rename == fsnotify.Rename {
						renamedFile <- FileRename{old: prev.Name, new: path}
					} else {
						// only send to the channel after we have stopped receiving
						// write events for 3 seconds
						if timers[path] == nil {
							timers[path] = time.NewTimer(3 * time.Second)
							go func() {
								<-timers[path].C
								newFile <- path
								delete(timers, path)
							}()
						} else {
							timers[path].Reset(3 * time.Second)
						}
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
