CREATE TABLE users (
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_argon TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',

  steam_id TEXT,

  PRIMARY KEY (username)
);
