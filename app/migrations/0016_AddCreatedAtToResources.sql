-- Migration number: 0016 	 2024-08-05T17:17:08.583Z
ALTER TABLE users ADD COLUMN created_at TEXT;
ALTER TABLE games ADD COLUMN created_at TEXT;
ALTER TABLE tournaments ADD COLUMN created_at TEXT;
ALTER TABLE api_keys ADD COLUMN created_at TEXT;
ALTER TABLE game_users ADD COLUMN created_at TEXT;
ALTER TABLE tournament_configs ADD COLUMN created_at TEXT;
ALTER TABLE game_configs ADD COLUMN created_at TEXT;