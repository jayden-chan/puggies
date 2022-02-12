package main

import (
	"errors"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func createMigrationClient(config Config) (*migrate.Migrate, error) {
	return migrate.New(
		"file://"+config.migrationsPath,
		// We are using the pgx driver but it's still compatible with postgres
		// connection strings. Don't want to confuse people with "pgx://" in the
		// documentation so we will just accept postgres strings
		strings.Replace(config.dbConnString, "postgres://", "pgx://", 1))
}

func runMigration(config Config, dir string) error {
	m, err := createMigrationClient(config)
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
