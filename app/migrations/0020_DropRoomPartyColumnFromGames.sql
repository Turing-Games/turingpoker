-- Migration number: 0020 	 2024-08-07T18:56:05.087Z
ALTER TABLE games RENAME TO games_old;

CREATE TABLE games (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    title TEXT,
    game_id TEXT,
    winner_id TEXT,
    tournament_id TEXT,
    game_type TEXT NOT NULL DEFAULT '',
    FOREIGN KEY(winner_id) REFERENCES users(id),
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

INSERT INTO games (
  id,
  title,
  game_id,
  winner_id,
  tournament_id,
  game_type
) SELECT id, title, game_id, winner_id, tournament_id, game_type
FROM games_old;

DROP TABLE games_old;
