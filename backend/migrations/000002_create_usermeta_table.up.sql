CREATE TABLE usermeta (
  mapid TEXT NOT NULL,
  demo_link TEXT,

  -- when a match is deleted its user metadata should be removed as well
  FOREIGN KEY (mapid) REFERENCES matches (id) ON DELETE CASCADE,
  PRIMARY KEY (mapid)
);
