-- =============================================================
--  PotCommun – Script d'initialisation MySQL
--  Exécuté automatiquement au premier démarrage du conteneur Docker
-- =============================================================

CREATE DATABASE IF NOT EXISTS potcommun
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE potcommun;

-- -------------------------------------------------------------
-- TABLE : users
-- email      : chiffré AES-256-GCM par l'appli (valeurs mock en clair ici)
-- email_hash : SHA-256(lowercase(email)), utilisé pour les lookups
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
                                     id         BIGINT       NOT NULL AUTO_INCREMENT,
                                     email      VARCHAR(500) NOT NULL,                        -- plus long pour accueillir la valeur chiffrée
    email_hash VARCHAR(64)  NOT NULL UNIQUE,                 -- SHA-256 hex = 64 chars
    password   VARCHAR(250) NOT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : association
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS association (
                                           id           INT          NOT NULL AUTO_INCREMENT,
                                           name         VARCHAR(150) NOT NULL,
    categorie    VARCHAR(250),
    email        VARCHAR(250) NOT NULL UNIQUE,
    siret        VARCHAR(250) UNIQUE,
    siege_social VARCHAR(250),
    telephone    VARCHAR(20),
    latitude     DECIMAL(9,6) NULL,
    longitude    DECIMAL(9,6) NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : evenement
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evenement (
                                         id             INT          NOT NULL AUTO_INCREMENT,
                                         name           VARCHAR(250) NOT NULL,
    length         INT,
    release_dt     DATE,
    synopsis       TEXT,
    association_id INT          NOT NULL,
    latitude       DECIMAL(9,6) NULL,
    longitude      DECIMAL(9,6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_evenement_association
    FOREIGN KEY (association_id) REFERENCES association (id)
    ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : paiement
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paiement (
                                        id            INT            NOT NULL AUTO_INCREMENT,
                                        mode_paiement VARCHAR(150)   NOT NULL,
    date          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant       DECIMAL(10, 2) NOT NULL,
    status        TINYINT        NOT NULL DEFAULT 0
    COMMENT '0=en_attente 1=validé 2=refusé 3=remboursé',
    commande_id   INT,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : commande
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commande (
                                        id           INT    NOT NULL AUTO_INCREMENT,
                                        user_id      BIGINT NOT NULL,
                                        evenement_id INT    NOT NULL,
                                        PRIMARY KEY (id),
    CONSTRAINT fk_commande_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commande_evenement
    FOREIGN KEY (evenement_id) REFERENCES evenement (id)
    ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clé étrangère paiement → commande (ajoutée après création de commande)
ALTER TABLE paiement
    ADD CONSTRAINT fk_paiement_commande
        FOREIGN KEY (commande_id) REFERENCES commande (id)
            ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------------------
-- TABLE : campagne
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campagne (
                                        id             INT NOT NULL AUTO_INCREMENT,
                                        association_id INT NOT NULL,
                                        PRIMARY KEY (id),
    CONSTRAINT fk_campagne_association
    FOREIGN KEY (association_id) REFERENCES association (id)
    ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : don
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS don (
                                   id             INT            NOT NULL AUTO_INCREMENT,
                                   user_id        BIGINT         NOT NULL,
                                   association_id INT            NOT NULL,
                                   montant        DECIMAL(10, 2) NOT NULL,
    date           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paiement_id    INT,
    PRIMARY KEY (id),
    CONSTRAINT fk_don_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_don_association
    FOREIGN KEY (association_id) REFERENCES association (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_don_paiement
    FOREIGN KEY (paiement_id) REFERENCES paiement (id)
    ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : adhesion
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS adhesion (
                                        id             INT         NOT NULL AUTO_INCREMENT,
                                        user_id        BIGINT      NOT NULL,
                                        association_id INT         NOT NULL,
                                        role           VARCHAR(50) NOT NULL DEFAULT 'membre',
    date           DATE        NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id),
    UNIQUE KEY uq_adhesion (user_id, association_id),
    CONSTRAINT fk_adhesion_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_adhesion_association
    FOREIGN KEY (association_id) REFERENCES association (id)
    ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : campagne_utilisateur
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campagne_utilisateur (
                                                    id          INT         NOT NULL AUTO_INCREMENT,
                                                    user_id     BIGINT      NOT NULL,
                                                    campagne_id INT         NOT NULL,
                                                    role        VARCHAR(50) NOT NULL DEFAULT 'contributeur',
    PRIMARY KEY (id),
    UNIQUE KEY uq_campagne_user (user_id, campagne_id),
    CONSTRAINT fk_campuser_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_campuser_campagne
    FOREIGN KEY (campagne_id) REFERENCES campagne (id)
    ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =============================================================
--  DONNÉES DE MOCK
--  Emails stockés en clair ici (données de test injectées directement en BDD,
--  sans passer par l'appli). Les nouveaux comptes créés via /auth/register
--  auront leur email chiffré automatiquement par EmailEncryptionConverter.
--
--  Tous les mots de passe = "password123" (BCrypt)
--  email_hash = SHA-256(lowercase(email))
-- =============================================================

INSERT INTO users (email, email_hash, password) VALUES
                                                    ('alice@example.com',
                                                     'ff8d9819fc0e12bf0d24892e45987e249a28dce836a85cad60e28eaaa8c6d976',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('bob@example.com',
                                                     '5ff860bf1190596c7188ab851db691f0f3169c453936e9e1eba2f9a47f7a0018',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('claire.dupont@example.com',
                                                     'c7225c4f222d8e9af0c207ee7adc78bfa0b76f0d7f40e8b5b7e16594b7430cc0',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('marc.leblanc@example.com',
                                                     '21df7363b04fb35382b044146bbc24f3631807af37b9dc9f4f2617fe255ed596',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('sophie.martin@example.com',
                                                     '9bdb5111a39629b9d7a99a864ea2b9906dab3e7f35fbb9b2fa34671c46aad454',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('julien.bernard@example.com',
                                                     '2a458c6ec59e01a138c6e8ff2cef0cb7b0d347ba74853aedc8ba735adaec7571',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('lea.thomas@example.com',
                                                     '5daceea8939fd5a20f399622c064445e82a01d2c05d7ada44d185cede4d51752',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('antoine.petit@example.com',
                                                     'f73d15e78a7e20b8baa615e3c6c463a9efcd31f87b458042bd8897a23276e684',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('marie.rousseau@example.com',
                                                     'b786ca04b169587e7e8a400a4fb90450719855f8bef899427ab491fbad05d026',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                                    ('pierre.moreau@example.com',
                                                     '6b8a022a8ff9ed95013c02e59820dd7a71a777131b48af4887e7a28835fa7629',
                                                     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

INSERT INTO association (name, categorie, email, siret, siege_social, telephone, latitude, longitude) VALUES
    ('Les Restos du Cœur', 'Aide alimentaire', 'contact@restosducoeur.fr', '30251719200030', '75 rue Nationale Paris', '0140123456', 48.856600, 2.352200),
    ('Greenpeace France',  'Environnement',    'info@greenpeace.fr',       '39399240200020', '13 rue Enghien Paris',   '0140212321', 48.873800, 2.350600);

INSERT INTO campagne (association_id) VALUES (1),(2),(3),(4),(5),(6);

INSERT INTO evenement (name, length, release_dt, synopsis, association_id, latitude, longitude) VALUES
    ('Gala de charité 2025',  180, '2025-06-15', 'Soirée annuelle de levée de fonds.',      1, 48.856600, 2.352200),
    ('Marche pour le climat', 120, '2025-09-22', 'Manifestation pacifique pour le climat.', 2, 48.858400, 2.294500);
INSERT INTO evenement (name, length, release_dt, synopsis, association_id) VALUES
                                                                               ('Gala de charité 2025',               180, '2025-06-15', 'Soirée annuelle de levée de fonds avec vente aux enchères et dîner.',                  1),
                                                                               ('Collecte hivernale – Paris Nord',     90, '2025-11-28', 'Grande collecte de denrées alimentaires dans les supermarchés partenaires.',           1),
                                                                               ('Marche pour le climat',              120, '2025-09-22', 'Manifestation nationale pour une politique climatique ambitieuse.',                    2),
                                                                               ('Forum environnemental 2025',         240, '2025-10-11', 'Journée de conférences et d'ateliers sur la transition écologique.',                   2),
    ('Journée portes ouvertes Croix-Rouge',180, '2025-05-08', 'Découverte des actions locales, démonstrations de secourisme et bénévolat.',           3),
    ('Concert caritatif Solidarité',       150, '2025-07-04', 'Concert de musique classique au profit des victimes de catastrophes naturelles.',      3),
    ('Conférence : Soigner en zones de guerre',120,'2025-08-20','Témoignages de médecins terrain sur l'accès aux soins en zones de conflit.',         4),
                                                                               ('Vente de solidarité MSF',             60, '2025-12-06', 'Marché solidaire avec objets artisanaux rapportés par les équipes de mission.',        4),
                                                                               ('Nettoyage des berges de la Seine',   180, '2025-04-19', 'Action citoyenne de dépollution des rives de la Seine avec les bénévoles WWF.',        5),
                                                                               ('Expo photo : Espèces en danger',     300, '2025-06-05', 'Exposition photographique sur la biodiversité mondiale menacée.',                      5),
                                                                               ('Octobre Rose – Marche solidaire',    120, '2025-10-04', 'Marche de 10 km pour soutenir la recherche contre le cancer du sein.',                 6),
                                                                               ('Conférence prévention cancer',        90, '2025-11-15', 'Conférence médicale sur le dépistage précoce et les facteurs de risque.',              6);

INSERT INTO adhesion (user_id, association_id, role, date) VALUES
                                                               (1, 1, 'admin',  '2023-09-01'), (2, 1, 'membre', '2023-10-15'), (3, 1, 'membre', '2024-01-10'),
                                                               (4, 2, 'admin',  '2022-06-20'), (5, 2, 'membre', '2023-03-08'), (2, 2, 'membre', '2024-02-14'),
                                                               (6, 3, 'admin',  '2021-11-05'), (7, 3, 'membre', '2023-07-22'), (8, 3, 'membre', '2024-04-01'),
                                                               (9, 4, 'admin',  '2022-01-30'), (3, 4, 'membre', '2023-05-17'),
                                                               (10,5, 'admin',  '2020-04-22'), (5, 5, 'membre', '2023-09-14'), (7, 5, 'membre', '2024-03-03'),
                                                               (1, 6, 'membre', '2024-10-01'), (8, 6, 'admin',  '2022-03-15'), (9, 6, 'membre', '2023-11-20');

INSERT INTO campagne_utilisateur (user_id, campagne_id, role) VALUES
                                                                  (1, 1, 'organisateur'), (2, 1, 'contributeur'), (3, 1, 'contributeur'),
                                                                  (4, 2, 'organisateur'), (5, 2, 'contributeur'),
                                                                  (6, 3, 'organisateur'), (7, 3, 'contributeur'), (8, 3, 'contributeur'),
                                                                  (9, 4, 'organisateur'), (3, 4, 'contributeur'),
                                                                  (10,5, 'organisateur'), (5, 5, 'contributeur'), (7, 5, 'contributeur'),
                                                                  (8, 6, 'organisateur'), (1, 6, 'contributeur'), (9, 6, 'contributeur');

INSERT INTO commande (user_id, evenement_id) VALUES
                                                 (2,1),(3,1),(5,3),(6,3),(7,4),(1,5),(8,6),(9,7),(4,8),(10,9),(5,10),(1,11),(3,11),(7,12);

INSERT INTO paiement (mode_paiement, date, montant, status, commande_id) VALUES
                                                                             ('Carte bancaire', '2025-05-10 09:15:00',  75.00, 1,  1),
                                                                             ('PayPal',         '2025-05-11 14:32:00',  75.00, 1,  2),
                                                                             ('Carte bancaire', '2025-08-01 10:00:00',  15.00, 1,  3),
                                                                             ('Virement',       '2025-08-03 08:45:00',  15.00, 0,  4),
                                                                             ('Carte bancaire', '2025-09-20 17:10:00',  30.00, 1,  5),
                                                                             ('PayPal',         '2025-04-25 11:00:00',   0.00, 1,  6),
                                                                             ('Carte bancaire', '2025-06-15 20:30:00',  45.00, 1,  7),
                                                                             ('Carte bancaire', '2025-07-30 09:00:00',  10.00, 2,  8),
                                                                             ('Virement',       '2025-11-20 14:00:00',  20.00, 1,  9),
                                                                             ('Carte bancaire', '2025-03-10 08:00:00',   0.00, 1, 10),
                                                                             ('PayPal',         '2025-05-28 16:45:00',  12.00, 3, 11),
                                                                             ('Carte bancaire', '2025-09-05 10:20:00',   5.00, 1, 12),
                                                                             ('Carte bancaire', '2025-09-06 12:00:00',   5.00, 1, 13),
                                                                             ('Virement',       '2025-10-30 09:30:00',   0.00, 0, 14);

INSERT INTO don (user_id, association_id, montant, date) VALUES
                                                             (1,  1,  50.00, '2025-01-15 10:00:00'),
                                                             (2,  2,  30.00, '2025-02-08 14:30:00'),
                                                             (3,  3, 100.00, '2025-03-22 09:15:00'),
                                                             (4,  4,  25.00, '2025-01-30 16:00:00'),
                                                             (5,  5,  40.00, '2025-04-10 11:45:00'),
                                                             (6,  6,  20.00, '2025-02-14 08:00:00'),
                                                             (7,  1,  15.00, '2025-03-05 13:20:00'),
                                                             (8,  3,  60.00, '2025-05-01 10:10:00'),
                                                             (9,  4,  80.00, '2025-04-18 15:00:00'),
                                                             (10, 5,  35.00, '2025-06-01 09:30:00'),
                                                             (1,  6,  10.00, '2025-10-15 17:00:00'),
                                                             (3,  2,  45.00, '2025-09-22 18:00:00');

ALTER TABLE association
    ADD COLUMN IF NOT EXISTS email_hash    VARCHAR(64),
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(250),
    ADD COLUMN IF NOT EXISTS description   TEXT,
    ADD COLUMN IF NOT EXISTS iban          VARCHAR(34),
    ADD COLUMN IF NOT EXISTS statut        ENUM('PENDING','VALIDATED','REJECTED')
    NOT NULL DEFAULT 'VALIDATED',
    ADD COLUMN IF NOT EXISTS date_inscription DATETIME,
    ADD COLUMN IF NOT EXISTS date_validation  DATETIME,
    ADD COLUMN IF NOT EXISTS motif_rejet   TEXT;


UPDATE association SET statut = 'VALIDATED' WHERE statut IS NULL OR statut = 'VALIDATED';

INSERT IGNORE INTO association
    (name, categorie, email, email_hash, password_hash, siret,
     siege_social, telephone, description, statut, date_inscription, date_validation)
VALUES (
    'Association Démo PotCommun',
    'Culture',
    'demo.asso@example.com',
    '3e8a2f1b9c4d7e6f0a5b8c3d2e1f4a7b9c6d3e8f1a4b7c0d5e2f9a6b3c8d1e4',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '12345678901234',
    '1 rue de la Démo, 75001 Paris',
    '0100000000',
    'Compte de démonstration pour tester la création de cagnottes.',
    'VALIDATED',
    NOW(),
    NOW()
);