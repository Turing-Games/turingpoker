-- Migration number: 0009 	 2024-07-29T16:57:13.464Z
ALTER TABLE tournament_configs
ADD private BOOLEAN NOT NULL DEFAULT 0;

ALTER TABLE game_configs
ADD private BOOLEAN NOT NULL DEFAULT 0;