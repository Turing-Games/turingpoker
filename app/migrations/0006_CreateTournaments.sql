-- Migration number: 0006 	 2024-07-21T21:26:51.843Z
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  title TEXT,
  tournament_config_id TEXT,
  FOREIGN KEY(tournament_config_id) REFERENCES tournament_configs(id)
);