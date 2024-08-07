-- Migration number: 0019 	 2024-08-07T16:56:48.489Z
ALTER TABLE tournament_configs
ADD private BOOLEAN NOT NULL DEFAULT 0;

ALTER TABLE game_configs
ADD private BOOLEAN NOT NULL DEFAULT 0;
