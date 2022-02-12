CREATE TABLE matches (
  id TEXT,
  map TEXT NOT NULL,
  date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  demo_type TEXT NOT NULL,
  player_names JSON NOT NULL,
  team_a_score INTEGER NOT NULL,
  team_b_score INTEGER NOT NULL,
  team_a_title TEXT NOT NULL,
  team_b_title TEXT NOT NULL,

  -- For the sake of simplicity we won't go too deep into customizing our
  -- Postgres schema, we'll just store the match data as JSON. This way we
  -- won't get too locked-in to Postgres so we can potentially support other
  -- databases if people want to use something different.
  match_data JSON NOT NULL,

  PRIMARY KEY (id),
  CONSTRAINT sane_date CHECK (date >= '2012-01-01'),
  CONSTRAINT sane_team_a_score CHECK (team_a_score >= 0),
  CONSTRAINT sane_team_b_score CHECK (team_b_score >= 0)
);
