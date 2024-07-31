-- Migration number: 0015 	 2024-07-31T19:52:08.407Z

ALTER TABLE api_keys RENAME TO api_keys_old;

CREATE TABLE api_keys (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT,
    key TEXT UNIQUE NOT NULL,
    user_id TEXT,
    bot_id TEXT,
    viewed BOOLEAN DEFAULT false,
    FOREIGN KEY(bot_id) REFERENCES bots(id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO api_keys (
  id,
  name,
  key,
  user_id,
  bot_id,
  viewed
)
SELECT id, name, key, user_id, bot_id, viewed
FROM api_keys_old;

DROP TABLE api_keys_old;
