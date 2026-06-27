-- V3 : ajout des colonnes d'authentification et de gestion des comptes association
-- Appliquer avec :
-- docker exec -i potcommun_db mysql -u potcommun_user -ppotcommun_pass potcommun < database/V3__add_auth_columns.sql

ALTER TABLE association
    ADD COLUMN email_hash      VARCHAR(64)                          NULL,
    ADD COLUMN password_hash   TEXT                                 NULL,
    ADD COLUMN description     TEXT                                 NULL,
    ADD COLUMN iban            VARCHAR(34)                          NULL,
    ADD COLUMN statut          ENUM('PENDING','VALIDATED','REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN date_inscription  DATETIME                           NULL,
    ADD COLUMN date_validation   DATETIME                           NULL,
    ADD COLUMN motif_rejet       TEXT                               NULL;

-- Les associations existantes (pré-créées) passent en VALIDATED
UPDATE association SET statut = 'VALIDATED' WHERE statut = 'PENDING';
