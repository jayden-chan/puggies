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
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v4/pgxpool"
)

type pgdb struct {
	dbpool *pgxpool.Pool
}

func newPgDb(config Config, logger *Logger) (*pgdb, error) {
	dbpool, err := pgxpool.Connect(context.Background(), config.dbConnString)
	if err != nil {
		logger.Errorf("Failed to connect to database: %s", err.Error())
		return &pgdb{}, err
	}

	return &pgdb{
		dbpool: dbpool,
	}, nil
}

func (p *pgdb) transactionExec(query string, arguments ...interface{}) (int64, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return 0, err
	}
	defer conn.Release()

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(context.Background())

	commandTag, err := tx.Exec(context.Background(), query, arguments...)
	if err != nil {
		return 0, err
	}

	err = tx.Commit(context.Background())
	if err != nil {
		return 0, err
	}

	return commandTag.RowsAffected(), nil
}

func (p *pgdb) Close() {
	p.dbpool.Close()
}

func (p *pgdb) InsertMatches(matches ...Match) error {
	params := make([]interface{}, 0, len(matches)*11)
	rows := make([]string, 0, len(matches))

	for i, match := range matches {
		value, err := p.genMatchInsert(match, i*11, &params)
		if err != nil {
			return err
		}

		rows = append(rows, value)
	}

	query := `INSERT INTO matches (
				id,
				version,
				map,
				date,
				demo_type,
				player_names,
				team_a_score,
				team_b_score,
				team_a_title,
				team_b_title,
				match_data
			) VALUES ` + strings.Join(rows, ", ")

	_, err := p.transactionExec(query, params...)
	return err
}

func (p *pgdb) RegisterUser(user User, password string) error {
	var steamId *string = nil
	if user.SteamId != "" {
		steamId = &user.SteamId
	}

	argon2ID := NewArgon2ID()
	passwordArgon, err := argon2ID.Hash(password)
	if err != nil {
		return err
	}

	query := `INSERT INTO users
					(username, display_name, email, password_argon, steam_id)
		VALUES ($1, $2, $3, $4, $5)`

	_, err = p.transactionExec(query,
		user.Username,
		user.DisplayName,
		user.Email,
		passwordArgon,
		steamId,
	)

	return err
}

func (p *pgdb) InsertAuditEntry(entry AuditEntry) error {
	query := `INSERT INTO auditlog (timestamp, system, username, action, description) VALUES ($1, $2, $3, $4, $5)`
	var user *string
	if entry.Username != "" {
		user = &entry.Username
	}

	_, err := p.transactionExec(
		query,
		time.Now().UnixMilli(),
		entry.System,
		user,
		entry.Action,
		entry.Description,
	)
	return err
}

func (p *pgdb) RunMigration(config Config, dir string) error {
	m, err := p.createMigrationClient(config)
	if err != nil {
		return err
	}

	if dir == "up" {
		err = m.Up()
	} else if dir == "down" {
		err = m.Down()
	} else {
		err = errors.New("Invalid migration direction \"" + dir + "\"")
	}

	if err != nil && err.Error() != "no change" {
		return err
	}

	return nil
}

func (p *pgdb) HasMatch(id string) (bool, int, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return false, 0, err
	}
	defer conn.Release()

	returnedVersion := 0
	returnedId := ""

	err = conn.
		QueryRow(context.Background(), "SELECT id, version FROM matches WHERE id = $1", id).
		Scan(&returnedId, &returnedVersion)

	if err != nil && err.Error() != "no rows in result set" {
		return false, 0, err
	}

	return returnedId == id, returnedVersion, nil
}

func (p *pgdb) HasUser(username string) (bool, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return false, err
	}
	defer conn.Release()

	var count int
	err = conn.
		QueryRow(
			context.Background(),
			"SELECT COUNT(username) FROM users WHERE username = $1",
			username,
		).
		Scan(&count)

	if err != nil {
		return false, err
	}

	return count != 0, nil
}

func (p *pgdb) getMatches(limit, offset int, deleted bool) ([]MetaData, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	rows, err := conn.
		Query(context.Background(),
			`SELECT
			   id,
			   map,
			   COALESCE(usermeta.date_override, matches.date) AS date,
			   demo_type,
			   player_names,
			   team_a_score,
			   team_b_score,
			   team_a_title,
			   team_b_title
			 FROM matches
			 LEFT OUTER JOIN usermeta ON mapid = id
			 WHERE deleted = $1
			 ORDER BY date DESC
			 LIMIT $2 OFFSET $3`, deleted, limit, offset)

	matches := make([]MetaData, 0, 10)
	for rows.Next() {
		var id, mapName, demoType, teamATitle, teamBTitle string
		var dateTimestamp int64
		var teamAScore, teamBScore int
		var playerNames NamesMap

		err = rows.Scan(
			&id, &mapName, &dateTimestamp, &demoType, &playerNames,
			&teamAScore, &teamBScore, &teamATitle, &teamBTitle,
		)

		if err != nil {
			return nil, err
		}

		matches = append(matches,
			MetaData{
				Map:           mapName,
				Id:            id,
				DateTimestamp: dateTimestamp,
				DemoType:      demoType,
				PlayerNames:   playerNames,
				TeamAScore:    teamAScore,
				TeamBScore:    teamBScore,
				TeamATitle:    teamATitle,
				TeamBTitle:    teamBTitle,
			})
	}

	return matches, nil
}

func (p *pgdb) GetMatches(limit, offset int) ([]MetaData, error) {
	return p.getMatches(limit, offset, false)
}

func (p *pgdb) GetDeletedMatches(limit, offset int) ([]MetaData, error) {
	return p.getMatches(limit, offset, true)
}

func (p *pgdb) GetMatch(id string) (*RetrievedMatch, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	var mapName, demoType, teamATitle, teamBTitle, demoLink string
	var dateTimestamp int64
	var teamAScore, teamBScore int
	var playerNames NamesMap
	var matchData MatchData

	err = conn.
		QueryRow(
			context.Background(),
			`SELECT
			   map,
			   COALESCE(usermeta.date_override, matches.date) AS date,
			   demo_type,
			   player_names,
			   team_a_score,
			   team_b_score,
			   team_a_title,
			   team_b_title,
			   COALESCE(usermeta.demo_link, FORMAT('/api/v1/demos/%s.dem', id)) AS demo_link,
			   match_data
		     FROM matches
			 LEFT OUTER JOIN usermeta ON mapid = id
			 WHERE id = $1 AND deleted = FALSE`, id).
		Scan(
			&mapName,
			&dateTimestamp,
			&demoType,
			&playerNames,
			&teamAScore,
			&teamBScore,
			&teamATitle,
			&teamBTitle,
			&demoLink,
			&matchData,
		)

	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, err
	}

	return &RetrievedMatch{
		Meta: RetrievedMeta{
			MetaData: MetaData{
				Map:           mapName,
				Id:            id,
				DateTimestamp: dateTimestamp,
				DemoType:      demoType,
				PlayerNames:   playerNames,
				TeamAScore:    teamAScore,
				TeamBScore:    teamBScore,
				TeamATitle:    teamATitle,
				TeamBTitle:    teamBTitle,
			},
			DemoLink: demoLink,
		},
		MatchData: matchData,
	}, nil
}

func (p *pgdb) GetUserMeta(id string) (*UserMeta, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	var demoLink string
	var dateTimestamp *int64

	err = conn.
		QueryRow(
			context.Background(),
			`SELECT demo_link, date_override FROM usermeta WHERE mapid = $1`,
			id,
		).
		Scan(&demoLink, &dateTimestamp)

	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, err
	}

	var dateOverride int64 = 0
	if dateTimestamp != nil {
		dateOverride = *dateTimestamp
	}

	return &UserMeta{
		DemoLink:     demoLink,
		DateOverride: dateOverride,
	}, nil
}

func (p *pgdb) Login(username, password string) (*User, error) {
	return p.getUser(username, &password)
}

func (p *pgdb) InvalidateToken(token string, expiry time.Time) error {
	query := `INSERT INTO invalid_tokens (expiry, token) VALUES ($1, $2)`
	_, err := p.transactionExec(query, expiry.Unix(), token)
	return err
}

func (p *pgdb) IsTokenValid(token string) (bool, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return false, err
	}
	defer conn.Release()

	var expiry int64

	err = conn.
		QueryRow(
			context.Background(),
			`SELECT expiry FROM invalid_tokens WHERE token = $1`,
			token,
		).
		Scan(&expiry)

	if err != nil {
		if err.Error() == "no rows in result set" {
			return true, nil
		}
		return false, err
	}

	return time.Unix(expiry, 0).Before(time.Now()), nil
}

func (p *pgdb) CleanInvalidTokens() error {
	now := time.Now().Unix()
	_, err := p.transactionExec(`DELETE FROM invalid_tokens WHERE expiry < $1`, now)
	return err
}

func (p *pgdb) DeleteMatch(id string) error {
	_, err := p.transactionExec(
		`UPDATE matches
		 SET
		   deleted = TRUE,
		   match_data = '{}',
		   player_names = '{}'
	     WHERE id = $1`, id)
	return err
}

func (p *pgdb) FullDeleteMatch(id string) error {
	_, err := p.transactionExec(`DELETE FROM matches WHERE id = $1`, id)
	return err
}

func (p *pgdb) DeleteUser(username string) error {
	_, err := p.transactionExec(`DELETE FROM users WHERE username = $1`, username)
	return err
}

func (p *pgdb) GetUsers() ([]User, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `SELECT username, display_name, email, roles, steam_id FROM users`
	rows, err := conn.Query(context.Background(), query)

	users := make([]User, 0, 10)

	for rows.Next() {
		var username, displayName, email string
		var steamId *string
		var roles []string

		err = rows.Scan(&username, &displayName, &email, &roles, &steamId)

		if err != nil {
			return nil, err
		}

		finalSteamId := ""
		if steamId != nil {
			finalSteamId = *steamId
		}

		users = append(users,
			User{
				Username:    username,
				DisplayName: displayName,
				Email:       email,
				Roles:       roles,
				SteamId:     finalSteamId,
			})
	}

	return users, nil
}

func (p *pgdb) GetAuditLog(limit, offset int) ([]AuditEntry, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `SELECT
				timestamp,
				system,
				username,
				action,
				description
			  FROM auditlog
			  ORDER BY timestamp DESC
			  LIMIT $1 OFFSET $2`
	rows, err := conn.Query(context.Background(), query, limit, offset)

	users := make([]AuditEntry, 0, limit)

	for rows.Next() {
		var action, description string
		var user *string
		var timestamp int64
		var system bool

		err = rows.Scan(&timestamp, &system, &user, &action, &description)

		if err != nil {
			return nil, err
		}

		finalUser := ""
		if user != nil {
			finalUser = *user
		}

		users = append(users,
			AuditEntry{
				Timestamp:   timestamp,
				System:      system,
				Username:    finalUser,
				Action:      action,
				Description: description,
			})
	}

	return users, nil
}

func (p *pgdb) GetUser(username string) (*User, error) {
	return p.getUser(username, nil)
}

func (p *pgdb) EditMatchMeta(id string, meta UserMeta) error {
	// If everything is null just delete the whole entry
	if meta.DemoLink == "" && meta.DateOverride == 0 {
		_, err := p.transactionExec(
			`DELETE FROM usermeta WHERE mapid = $1`,
			id,
		)
		return err
	}

	var dateOverride *int64
	if meta.DateOverride != 0 {
		dateOverride = &meta.DateOverride
	}

	var demoLink *string
	if meta.DemoLink != "" {
		demoLink = &meta.DemoLink
	}

	_, err := p.transactionExec(
		`INSERT INTO usermeta (mapid, demo_link, date_override)
		VALUES ($1, $2, $3)
		ON CONFLICT (mapid)
		DO UPDATE SET demo_link = $2, date_override = $3`,
		id,
		demoLink,
		dateOverride,
	)
	return err
}

func (p *pgdb) RenameMatch(oldId, newId string) error {
	_, err := p.transactionExec(
		`UPDATE matches SET id = $1 WHERE id = $2`,
		newId,
		oldId,
	)
	return err
}

func (p *pgdb) EditUser(username string, newInfo UserWithPassword) error {
	numUpdates := 0
	args := make([]interface{}, 0)

	var updates []string
	if newInfo.DisplayName != "" {
		numUpdates += 1
		updates = append(updates, `display_name = $`+strconv.Itoa(numUpdates))
		args = append(args, newInfo.DisplayName)
	}

	if newInfo.Email != "" {
		numUpdates += 1
		updates = append(updates, `email = $`+strconv.Itoa(numUpdates))
		args = append(args, newInfo.Email)
	}

	if newInfo.SteamId != "" {
		numUpdates += 1
		updates = append(updates, `steam_id = $`+strconv.Itoa(numUpdates))
		args = append(args, newInfo.SteamId)
	}

	if newInfo.Username != "" {
		numUpdates += 1
		updates = append(updates, `username = $`+strconv.Itoa(numUpdates))
		args = append(args, newInfo.Username)
	}

	if newInfo.Roles != nil {
		numUpdates += 1
		updates = append(updates, `roles = $`+strconv.Itoa(numUpdates))
		args = append(args, newInfo.Roles)
	}

	if newInfo.Password != "" {
		argon2ID := NewArgon2ID()
		passwordArgon, err := argon2ID.Hash(newInfo.Password)
		if err != nil {
			return err
		}

		numUpdates += 1
		updates = append(updates, `password_argon = $`+strconv.Itoa(numUpdates))
		args = append(args, passwordArgon)
	}

	if numUpdates == 0 {
		return errors.New("no fields were updated")
	}

	args = append(args, username)
	updatesString := strings.Join(updates, ", ")
	query := `UPDATE users SET ` + updatesString + ` WHERE username = $` + strconv.Itoa(numUpdates+1)
	_, err := p.transactionExec(query, args...)
	return err
}

func (p *pgdb) getUser(username string, password *string) (*User, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	var displayName, email, passwordArgon string
	var roles []string
	var steamIdScanned *string

	err = conn.
		QueryRow(
			context.Background(),
			`SELECT
				display_name,
				email,
				password_argon,
				roles,
				steam_id
			FROM users WHERE username = $1`,
			username,
		).
		Scan(&displayName, &email, &passwordArgon, &roles, &steamIdScanned)

	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, err
	}

	if password != nil {
		argon2ID := NewArgon2ID()
		passwordOk, err := argon2ID.Verify(*password, passwordArgon)
		if err != nil {
			return nil, err
		}

		if !passwordOk {
			return nil, errors.New("wrong password")
		}
	}

	steamId := ""
	if steamIdScanned != nil {
		steamId = *steamIdScanned
	}

	return &User{
		Username:    username,
		DisplayName: displayName,
		Email:       email,
		Roles:       roles,
		SteamId:     steamId,
	}, nil
}

func (p *pgdb) createMigrationClient(config Config) (*migrate.Migrate, error) {
	return migrate.New(
		"file://"+config.migrationsPath,
		// We are using the pgx driver but it's still compatible with postgres
		// connection strings. Don't want to confuse people with "pgx://" in the
		// documentation so we will just accept postgres strings
		strings.Replace(config.dbConnString, "postgres://", "pgx://", 1))
}

func valuesRowSql(base, numCols int) string {
	sql := "("
	vars := make([]string, 0, numCols)
	for i := 1; i <= numCols; i++ {
		vars = append(vars, "$"+strconv.Itoa(base+i))
	}

	sql += strings.Join(vars, ", ")
	sql += ")"

	return sql
}

func (p *pgdb) genMatchInsert(match Match, base int, params *[]interface{}) (string, error) {
	player_names, err := json.Marshal(match.Meta.PlayerNames)
	if err != nil {
		return "", err
	}

	match_data, err := json.Marshal(match.MatchData)
	if err != nil {
		return "", err
	}

	sql := valuesRowSql(base, 11)
	*params = append(*params,
		match.Meta.Id,
		ParserVersion,
		match.Meta.Map,
		match.Meta.DateTimestamp,
		match.Meta.DemoType,
		string(player_names),
		match.Meta.TeamAScore,
		match.Meta.TeamBScore,
		match.Meta.TeamATitle,
		match.Meta.TeamBTitle,
		string(match_data),
	)

	return sql, nil
}
