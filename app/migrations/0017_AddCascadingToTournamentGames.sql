-- Migration number: 0017 	 2024-08-06T19:51:24.810Z
ALTER TABLE games RENAME TO games_old;

CREATE TABLE games (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    title TEXT,
    room TEXT UNIQUE NOT NULL,
    party TEXT NOT NULL,
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
  room,
  party,
  game_id,
  winner_id,
  tournament_id,
  game_type,
  winner_id,
  tournament_id
)
SELECT id, title, room, party, game_id, winner_id, tournament_id, game_type, winner_id, tournament_id
FROM games_old;

DROP TABLE games_old;

