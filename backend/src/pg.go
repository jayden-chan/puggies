package main

import (
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

func migrateUp(config Config) error {
	m, err := createMigrationClient(config)
	if err != nil {
		return err
	}

	err = m.Up()
	if err != nil {
		return err
	}

	return nil
}

func migrateDown(config Config) error {
	m, err := createMigrationClient(config)
	if err != nil {
		return err
	}

	err = m.Down()
	if err != nil {
		return err
	}

	return nil
}
