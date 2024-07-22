-- Migration number: 0005 	 2024-07-21T21:17:51.055Z
CREATE TABLE IF NOT EXISTS game_users (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(game_id) REFERENCES games(id)
);