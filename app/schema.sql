PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE users (
  id TEXT PRIMARY KEY UNIQUE NOT NULL, 
  clerk_id TEXT UNIQUE NOT NULL
, username TEXT DEFAULT '', profile_image_url TEXT DEFAULT '', created_at TEXT);
CREATE TABLE bots (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  user_id TEXT,
  api_key_id TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(api_key_id) REFERENCES "api_keys_old"(id)
);
CREATE TABLE game_users (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL, created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(game_id) REFERENCES "games_old"(id)
);
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    title TEXT,
    game_type TEXT NOT NULL DEFAULT ''
, created_at TEXT);
CREATE TABLE tournament_configs (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    tournament_id TEXT DEFAULT '',
    size INTEGER NOT NULL, created_at TEXT,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);
CREATE TABLE game_configs (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    game_id TEXT DEFAULT '',
    min_players INTEGER NOT NULL DEFAULT 2,
    max_players INTEGER NOT NULL DEFAULT 8,
    auto_start BOOLEAN NOT NULL DEFAULT FALSE, created_at TEXT,
    FOREIGN KEY (game_id) REFERENCES "games_old"(id) ON DELETE CASCADE
);
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT,
    key TEXT UNIQUE NOT NULL,
    user_id TEXT,
    bot_id TEXT,
    viewed BOOLEAN DEFAULT false, created_at TEXT,
    FOREIGN KEY(bot_id) REFERENCES bots(id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
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
DELETE FROM sqlite_sequence;
