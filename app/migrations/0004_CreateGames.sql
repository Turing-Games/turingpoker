-- Migration number: 0004 	 2024-07-21T21:16:29.769Z
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  title TEXT,
  room TEXT UNIQUE NOT NULL,
  party TEXT NOT NULL,
  game_id TEXT,
  winner_id TEXT,
  tournament_id TEXT,
  FOREIGN KEY(winner_id) REFERENCES users(id),
  FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
);