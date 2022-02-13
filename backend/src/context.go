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

// Everthing in here needs to be concurrency-safe
type Context struct {
	config Config
	db     Db
	logger *Logger
}

type Db interface {
	InsertMatches(match ...Match) error
	HasMatch(id string) (bool, string, error)

	GetMatch(id string) (MetaData, MatchData, error)
	GetMatches() ([]MetaData, error)

	RunMigration(config Config, dir string) error

	Close()
}

func getContext(config Config, logger *Logger) (Context, error) {
	var db Db
	// dbType has been checked by this point -- no need for default case
	switch config.dbType {
	case "postgres":
		pg, err := newPgDb(config, logger)
		if err != nil {
			return Context{}, err
		}
		db = pg
	}

	return Context{
		config: config,
		db:     db,
		logger: logger,
	}, nil
}
