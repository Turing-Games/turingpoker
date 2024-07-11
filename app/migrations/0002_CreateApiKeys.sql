-- Migration number: 0002 	 2024-07-11T16:01:15.016Z
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  name TEXT,
  key TEXT UNIQUE NOT NULL,
  user_id TEXT,
  bot_id TEXT,
  viewed BOOLEAN DEFAULT false,
  FOREIGN KEY(bot_id) REFERENCES bots(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
