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
