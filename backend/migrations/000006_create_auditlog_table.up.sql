CREATE TABLE auditlog (
  -- unix millis
  timestamp BIGINT NOT NULL,
  -- whether the action was performed by the backend or initiated by a user.
  -- this is to differentiate between system-initiated events and events
  -- that were initiated by a deleted user
  system BOOLEAN NOT NULL,
  username TEXT,

  action TEXT NOT NULL,
  description TEXT NOT NULL,

  -- if a user's username is updated it should cascade to this table. if the user is deleted
  -- we still want to keep the audit log entry so we will set the user to null
  FOREIGN KEY (username) REFERENCES users (username) ON DELETE SET NULL ON UPDATE CASCADE,
  PRIMARY KEY (timestamp)
);
