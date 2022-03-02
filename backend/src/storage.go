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

type RetrievedMeta struct {
	DemoLink string `json:"demoLink"`
	MetaData
}

type RetrievedMatch struct {
	Meta      RetrievedMeta `json:"meta"`
	MatchData MatchData     `json:"matchData"`
}

type Storage interface {
	InsertUser(user User, password string) error
	InsertAuditEntry(entry AuditEntry) error
	UpsertMatches(match ...Match) error
	UpsertMatchMeta(id string, meta UserMeta) error
	// Change the ID of a match (if the demo is renamed in the folder)
	RenameMatch(oldId, newId string) error
	UpdateUser(username string, newInfo UserWithPassword) error

	// Returns if the match exists, and if so which parser version was used
	// to parse it
	HasMatch(id string) (bool, int, error)
	HasUser(username string) (bool, error)

	NumUsers() (int, error)
	NumMatches() (int, error)

	GetMatch(id string) (*RetrievedMatch, error)
	// Fetch match metadatas (match history) from the database
	GetMatches(limit, offset int) ([]MetaData, error)
	// Fetch matches which are marked as deleted
	GetDeletedMatches(limit, offset int) ([]MetaData, error)
	// Fetch user-defined data for the given match
	GetUserMeta(id string) (*UserMeta, error)
	GetUser(username string) (*User, error)
	GetUsers() ([]User, error)
	GetAuditLog(limit, offset int) ([]AuditEntry, error)

	// Validate the username and password & return the user if valid
	Login(username, password string) (*User, error)
	// Add the token to the invalidated tokens table
	InvalidateToken(token string, expiry time.Time) error
	// Check if there exists a token in the invalidated tokens table
	// that matches this one. If it hasn't expired yet, the token
	// is considered invalid
	IsTokenValid(token string) (bool, error)
	// Remove tokens from the invalided tokens table that have expired
	CleanInvalidTokens() error

	// Run database schema migrations in the up or down direction
	RunMigration(config Config, dir string) error

	// Mark the given match as deleted (will not delete the demo itself)
	SoftDeleteMatch(id string) error
	// Fully remove the match from the database (will not delete the demo itself)
	HardDeleteMatch(id string) error
	// Delete user with the given username
	DeleteUser(username string) error

	// Close the database pool connection
	Close()
}
