-- =============================================================
--  PotCommun – Script d'initialisation MySQL
--  Exécuté automatiquement au premier démarrage du conteneur Docker
-- =============================================================

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

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
    ('Les Restos du Cœur',      'Aide alimentaire', 'contact@restosducoeur.fr', '30251719200030', '75 rue Nationale, 75013 Paris',         '0140123456', 48.856600, 2.352200),
    ('Greenpeace France',        'Environnement',    'info@greenpeace.fr',       '39399240200020', '13 rue Enghien, 75010 Paris',           '0140212321', 48.873800, 2.350600),
    ('Croix-Rouge Française',    'Aide humanitaire', 'contact@croix-rouge.fr',   '77567227200329', '98 rue Didot, 75014 Paris',             '0144431100', 48.828200, 2.317300),
    ('Médecins Sans Frontières', 'Santé',            'info@msf.fr',              '30252161900050', '14-34 avenue Jean Jaurès, 75019 Paris', '0140213229', 48.879300, 2.371900),
    ('WWF France',               'Environnement',    'contact@wwf.fr',           '42761800200012', '1 carrefour de Longchamp, 75016 Paris', '0155258484', 48.861500, 2.252200),
    ('Ligue contre le Cancer',   'Santé',            'info@ligue-cancer.net',    '77563134200021', '14 rue Corvisart, 75013 Paris',         '0153559595', 48.827800, 2.351100);

INSERT INTO campagne (association_id) VALUES (1),(2),(3),(4),(5),(6);

INSERT INTO evenement (name, length, release_dt, synopsis, association_id, latitude, longitude) VALUES
    -- Événements passés (archives)
    ('Gala de charité 2025',  180, '2025-06-15', 'Soirée annuelle de levée de fonds.',      1, 48.856600, 2.352200),
    ('Marche pour le climat', 120, '2025-09-22', 'Manifestation pacifique pour le climat.', 2, 48.858400, 2.294500),

    -- Les Restos du Cœur (id=1)
    ('Collecte de rentrée 2026',         30, '2026-07-01',
     'Grande collecte de denrées non périssables dans les supermarchés partenaires de toute la région parisienne.',
     1, 48.8566, 2.3522),
    ('Atelier cuisine anti-gaspillage',   7, '2026-08-10',
     'Ateliers pratiques pour apprendre à cuisiner des repas équilibrés avec des ingrédients simples et peu coûteux.',
     1, 48.8510, 2.3600),
    ('Gala de bienfaisance automne',      1, '2026-09-15',
     'Soirée annuelle de levée de fonds avec vente aux enchères, concert et dîner au profit des familles en difficulté.',
     1, 48.8566, 2.3522),
    ('Marché solidaire de Noël',         30, '2026-11-28',
     'Marché de Noël associatif avec produits artisanaux, tombola et animations pour soutenir nos actions alimentaires.',
     1, 48.8480, 2.3520),

    -- Greenpeace France (id=2)
    ('Nettoyage des berges de la Seine',  1, '2026-07-12',
     'Action citoyenne de dépollution des rives de la Seine. Matériel fourni, inscription obligatoire.',
     2, 48.8584, 2.2945),
    ('Marche pour le Climat Paris 2026',  1, '2026-09-20',
     'Manifestation nationale pour une politique climatique ambitieuse et la sortie des énergies fossiles.',
     2, 48.8566, 2.3522),
    ('Forum écologie urbaine',            3, '2026-10-05',
     'Trois jours de conférences, ateliers et débats autour de la ville durable, mobilités vertes et éco-conception.',
     2, 48.8738, 2.3506),
    ('Journée zéro déchet Paris',         1, '2026-11-08',
     'Sensibilisation au tri, au compostage et à la réduction des déchets dans nos quartiers. Stands et démonstrations.',
     2, 48.8566, 2.3522),

    -- Croix-Rouge Française (id=3)
    ('Formation premiers secours',        2, '2026-07-20',
     'Stage PSC1 ouvert à tous. Apprenez les gestes qui sauvent en 7 heures de formation théorique et pratique.',
     3, 48.8282, 2.3173),
    ('Concert caritatif Solidarité 2026', 1, '2026-08-25',
     'Concert de musique classique et jazz au bénéfice des victimes de catastrophes. Entrée sur don libre.',
     3, 48.8590, 2.3460),
    ('Journée portes ouvertes Croix-Rouge', 1, '2026-09-05',
     'Découvrez nos équipes, nos missions locales et comment devenir bénévole. Démonstrations de secourisme incluses.',
     3, 48.8282, 2.3173),
    ('Collecte de sang – semaine nationale', 14, '2026-10-14',
     'Points de collecte de sang dans toute la ville. Chaque don peut sauver jusqu''à trois vies.',
     3, 48.8282, 2.3173),

    -- Médecins Sans Frontières (id=4)
    ('Conférence urgences sanitaires mondiales', 1, '2026-08-28',
     'Témoignages de médecins de retour de mission sur l''accès aux soins en zones de guerre et d''épidémie.',
     4, 48.8793, 2.3719),
    ('Expo humanitaire – Soigner sans frontières', 21, '2026-09-10',
     'Exposition photographique immersive sur les missions MSF dans les zones de conflit et catastrophes naturelles.',
     4, 48.8793, 2.3719),
    ('Marché solidaire MSF – Décembre',   7, '2026-12-05',
     'Marché de fin d''année avec objets artisanaux rapportés par les équipes MSF et produits du commerce équitable.',
     4, 48.8793, 2.3719),

    -- WWF France (id=5)
    ('Nettoyage du Bois de Boulogne',     1, '2026-07-05',
     'Collecte de déchets dans le Bois de Boulogne avec les bénévoles WWF. Matériel de collecte fourni sur place.',
     5, 48.8615, 2.2522),
    ('Journée mondiale des océans',       1, '2026-07-28',
     'Conférences, projections et ateliers pour sensibiliser à la protection des océans et de la vie marine.',
     5, 48.8615, 2.2522),
    ('Exposition biodiversité en danger', 30, '2026-10-01',
     'Grande exposition photographique sur les espèces menacées. Intervenants scientifiques tout au long du mois.',
     5, 48.8615, 2.2522),

    -- Ligue contre le Cancer (id=6)
    ('Octobre Rose – Marche solidaire',  31, '2026-10-01',
     'Un mois de mobilisation pour la recherche contre le cancer du sein. Marches, conférences et dépistages gratuits.',
     6, 48.8278, 2.3511),
    ('Conférence prévention des cancers',  1, '2026-11-18',
     'Conférence médicale grand public sur le dépistage précoce, les facteurs de risque et les avancées thérapeutiques.',
     6, 48.8278, 2.3511);

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