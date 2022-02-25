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

type Storage interface {
	// Add matches to the database
	InsertMatches(match ...Match) error
	// Add user to the database
	RegisterUser(user User, password string) error

	// Check if a match with the given id exists
	HasMatch(id string) (bool, string, error)
	// Check if a user with the given username exists
	HasUser(username string) (bool, error)

	// Fetch a match from the database
	GetMatch(id string) (*MetaData, *MatchData, error)
	// Fetch match metadatas (match history) from the database
	GetMatches() ([]MetaData, error)
	// Fetch deleted matches from the db
	GetDeletedMatches() ([]MetaData, error)
	// Fetch user-defined data for the given match
	GetUserMeta(id string) (*UserMeta, error)
	// Fetch user
	GetUser(username string) (*User, error)
	// Fetch all users
	GetUsers() ([]User, error)

	// Validate the username and password & return the user if valid
	Login(username, password string) (*User, error)
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

	// Update the user metadata for the given match
	EditMatchMeta(id string, meta UserMeta) error
	// Change the ID of a match (if the demo is renamed in the folder)
	RenameMatch(oldId, newId string) error
	// Update the user information for the given user id
	EditUser(uid string, newInfo User) error

	// Mark the given match as deleted (will not delete the demo itself)
	DeleteMatch(id string) error
	// Fully remove the match from the database (will not delete the demo itself)
	FullDeleteMatch(id string) error
	// Delete user with the given username
	DeleteUser(username string) error

	// Close the database pool connection
	Close()
}
