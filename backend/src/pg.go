package main

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"strings"

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

func (p *pgdb) Close() {
	p.dbpool.Close()
}

func (p *pgdb) InsertMatches(matches ...Match) error {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return err
	}

	defer conn.Release()

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return err
	}

	defer tx.Rollback(context.Background())

	params := make([]interface{}, 0, len(matches)*10)
	rows := make([]string, 0, len(matches))

	for i, match := range matches {
		value, err := p.genMatchInsert(match, i*10, &params)
		if err != nil {
			return err
		}

		rows = append(rows, value)
	}

	query := `INSERT INTO matches
					(id, map, date, demo_type, player_names, team_a_score,
					team_b_score, team_a_title, team_b_title, match_data)
		VALUES ` + strings.Join(rows, ", ")

	commandTag, err := tx.Exec(context.Background(), query, params...)
	if err != nil {
		return err
	}

	if commandTag.RowsAffected() != int64(len(matches)) {
		return errors.New("Wrong number of rows changed (somehow?)")
	}

	err = tx.Commit(context.Background())
	if err != nil {
		return err
	}

	return nil
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

	if err != nil {
		return err
	}

	return nil
}

func (p *pgdb) HasMatch(id string) (bool, string, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return false, "", err
	}

	defer conn.Release()

	// TODO: this will be updated later to check version information
	var version string = ""
	var returnedId string

	err = conn.
		QueryRow(context.Background(), "SELECT id FROM matches WHERE id = $1", id).
		Scan(&returnedId)

	if err != nil && err.Error() != "no rows in result set" {
		return false, "", err
	}

	return returnedId == id, version, nil
}

func (p *pgdb) GetMatches() ([]MetaData, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return nil, err
	}

	defer conn.Release()
	rows, err := conn.
		Query(context.Background(), `SELECT
			id, map, date, demo_type, player_names, team_a_score, team_b_score,
			team_a_title, team_b_title
		FROM matches`)

	var matches []MetaData

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

func (p *pgdb) GetMatch(id string) (MetaData, MatchData, error) {
	conn, err := p.dbpool.Acquire(context.Background())
	if err != nil {
		return MetaData{}, MatchData{}, err
	}

	defer conn.Release()

	var mapName, demoType, teamATitle, teamBTitle string
	var dateTimestamp int64
	var teamAScore, teamBScore int
	var playerNames NamesMap
	var matchData MatchData

	err = conn.
		QueryRow(context.Background(), `SELECT
			map, date, demo_type, player_names, team_a_score,
			team_b_score, team_a_title, team_b_title, match_data
		FROM matches WHERE id = $1`, id).
		Scan(&mapName, &dateTimestamp, &demoType, &playerNames, &teamAScore, &teamBScore, &teamATitle, &teamBTitle, &matchData)

	if err != nil {
		return MetaData{}, MatchData{}, err
	}

	return MetaData{
		Map:           mapName,
		Id:            id,
		DateTimestamp: dateTimestamp,
		DemoType:      demoType,
		PlayerNames:   playerNames,
		TeamAScore:    teamAScore,
		TeamBScore:    teamBScore,
		TeamATitle:    teamATitle,
		TeamBTitle:    teamBTitle,
	}, matchData, nil
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

	sql := valuesRowSql(base, 10)
	*params = append(*params,
		match.Meta.Id,
		match.Meta.Map,
		match.Meta.DateTimestamp,
		match.Meta.DemoType,
		string(player_names),
		match.Meta.TeamAScore,
		match.Meta.TeamBScore,
		match.Meta.TeamATitle,
		match.Meta.TeamBTitle,
		string(match_data))

	return sql, nil
}
