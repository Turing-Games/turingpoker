-- Migration number: 0014 	 2024-07-31T19:10:19.331Z
ALTER TABLE tournament_configs 
DROP CONSTRAINT tournament_id;

ALTER TABLE settings
ADD CONSTRAINT settings_user_id_fkey
FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;

ALTER TABLE game_configs
DROP CONSTRAINT game_id;

ALTER TABLE game_configs
ADD CONSTRAINT game_id
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;
