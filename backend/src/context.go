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

import "time"

// Everthing in here needs to be concurrency-safe
type Context struct {
	config Config
	db     Db
	logger *Logger
}

type Db interface {
	// Add matches to the database
	InsertMatches(match ...Match) error
	// Add user to the database
	RegisterUser(user User, password string) error

	// Check if a match with the given id exists
	HasMatch(id string) (bool, string, error)
	// Check if a user with the given username exists
	HasUser(username string) (bool, error)

	// Fetch a match from the database
	GetMatch(id string) (MetaData, MatchData, error)
	// Fetch match metadatas (match history) from the database
	GetMatches() ([]MetaData, error)
	// Fetch user-defined data for the given match
	GetUserMeta(id string) (UserMeta, error)
	// Fetch user
	GetUser(username string) (User, error)

	// Validate the username and password & return the user if valid
	Login(username, password string) (User, error)
	// Add the token to the invalidated tokens table
	InvalidateToken(token string, expiry time.Time) error
	// Check if there exists a token in the invalidated tokens table
	// that matches this one. If it hasn't expired yet, the token
	// is considered invalid
	IsTokenValid(token string) (bool, error)
	// Remove tokens from the invalided tokens table that have
	// expired
	CleanInvalidTokens() error

	// Run database schema migrations in the up or down direction
	RunMigration(config Config, dir string) error

	// Close the database pool connection
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
