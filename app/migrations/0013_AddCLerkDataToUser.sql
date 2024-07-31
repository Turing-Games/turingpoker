-- Migration number: 0013 	 2024-07-31T17:00:09.829Z
ALTER TABLE users ADD COLUMN username TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN profile_image_url TEXT DEFAULT '';