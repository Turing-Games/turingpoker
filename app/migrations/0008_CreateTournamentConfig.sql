-- Migration number: 0008 	 2024-07-21T22:11:27.900Z
CREATE TABLE IF NOT EXISTS tournament_configs (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  tournament_id TEXT,
  size INTEGER NOT NULL,
  FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
);