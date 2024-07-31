-- Migration number: 0014 	 2024-07-31T19:10:19.331Z

ALTER TABLE tournament_configs RENAME TO tournament_configs_old;

-- For tournament_configs
CREATE TABLE tournament_configs (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    tournament_id TEXT DEFAULT '',
    size INTEGER NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

INSERT INTO tournament_configs (
  id,
  tournament_id,
  size
)
SELECT id, tournament_id, size
FROM tournament_configs_old;

DROP TABLE tournament_configs_old;

-- for game configs
ALTER TABLE game_configs RENAME TO game_configs_old;

CREATE TABLE game_configs (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    game_id TEXT DEFAULT '',
    min_players INTEGER NOT NULL DEFAULT 2,
    max_players INTEGER NOT NULL DEFAULT 8,
    auto_start BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

INSERT INTO game_configs (
  id,
  game_id,
  min_players,
  max_players,
  auto_start
)
SELECT id, game_id, min_players, max_players, auto_start
FROM game_configs_old;

DROP TABLE game_configs_old;