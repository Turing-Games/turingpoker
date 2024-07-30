-- Migration number: 0011 	 2024-07-30T13:48:48.590Z
BEGIN TRANSACTION;

CREATE TABLE new_tournaments (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    title TEXT,
    game_type TEXT NOT NULL DEFAULT ''
);

INSERT INTO new_tournaments (id, title, game_type)
SELECT id, title, game_type
FROM tournaments;

DROP TABLE tournaments;

ALTER TABLE new_tournaments RENAME TO tournaments;

COMMIT;