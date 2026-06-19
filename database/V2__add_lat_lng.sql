-- V2 : ajout des colonnes latitude / longitude sur association et evenement
-- Appliquer avec :
-- docker exec -i potcommun_db mysql -u potcommun_user -ppotcommun_pass potcommun < database/V2__add_lat_lng.sql

ALTER TABLE association
    ADD COLUMN latitude  DECIMAL(9, 6) NULL,
    ADD COLUMN longitude DECIMAL(9, 6) NULL;

ALTER TABLE evenement
    ADD COLUMN latitude  DECIMAL(9, 6) NULL,
    ADD COLUMN longitude DECIMAL(9, 6) NULL;

-- Coordonnées de test (Paris)
UPDATE association SET latitude = 48.856600, longitude = 2.352200 WHERE id = 1;
UPDATE association SET latitude = 48.873800, longitude = 2.350600 WHERE id = 2;

UPDATE evenement SET latitude = 48.856600, longitude = 2.352200 WHERE id = 1;
UPDATE evenement SET latitude = 48.858400, longitude = 2.294500 WHERE id = 2;
