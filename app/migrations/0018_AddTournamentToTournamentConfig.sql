-- Migration number: 0018 	 2024-08-07T16:46:09.738Z
ALTER TABLE tournament_configs RENAME TO tournament_configs_old;

CREATE TABLE tournament_configs (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  size INTEGER NOT NULL,
  min_players INTEGER NOT NULL DEFAULT 2,
  max_players INTEGER NOT NULL DEFAULT 8,
  tournament_id TEXT,
  FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
);


INSERT INTO tournament_configs (id, tournament_id, size)
SELECT id, tournament_id, size
FROM tournament_configs_old;

DROP TABLE tournament_configs_old;