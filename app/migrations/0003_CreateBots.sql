-- Migration number: 0003 	 2024-07-11T16:01:29.259Z
CREATE TABLE IF NOT EXISTS bots (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  user_id TEXT,
  api_key_id TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(api_key_id) REFERENCES api_keys(id)
);