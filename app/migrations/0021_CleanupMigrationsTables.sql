-- Migration number: 0021 	 2024-08-07T20:05:26.476Z
-- Step 1: Create the new tables
CREATE TABLE bots_new (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  user_id TEXT,
  api_key_id TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(api_key_id) REFERENCES api_keys(id)
);

CREATE TABLE game_users_new (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(game_id) REFERENCES games(id)
);

CREATE TABLE game_configs_new (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    game_id TEXT DEFAULT '',
    min_players INTEGER NOT NULL DEFAULT 2,
    max_players INTEGER NOT NULL DEFAULT 8,
    auto_start BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Step 2: Copy data from the old tables to the new tables
INSERT INTO bots_new (id, user_id, api_key_id)
SELECT id, user_id, api_key_id FROM bots;

INSERT INTO game_users_new (id, user_id, game_id, created_at)
SELECT id, user_id, game_id, created_at FROM game_users;

INSERT INTO game_configs_new (id, game_id, min_players, max_players, auto_start, created_at)
SELECT id, game_id, min_players, max_players, auto_start, created_at FROM game_configs;

-- Step 3: Drop the old tables
DROP TABLE bots;
DROP TABLE game_users;
DROP TABLE game_configs;

-- Step 4: Rename the new tables to the original table names
ALTER TABLE bots_new RENAME TO bots;
ALTER TABLE game_users_new RENAME TO game_users;
ALTER TABLE game_configs_new RENAME TO game_configs;
