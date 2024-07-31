-- Migration number: 0011 	 2024-07-30T13:48:48.590Z


ALTER TABLE tournaments RENAME TO tournaments_old;

CREATE TABLE tournaments (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    title TEXT,
    game_type TEXT NOT NULL DEFAULT ''
);


INSERT INTO tournaments (id, title, game_type)
SELECT id, title, game_type
FROM tournaments_old;

DROP TABLE tournaments_old;