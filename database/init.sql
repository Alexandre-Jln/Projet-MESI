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
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
                                     id       BIGINT       NOT NULL AUTO_INCREMENT,
                                     email    VARCHAR(250) NOT NULL UNIQUE,
    password VARCHAR(250) NOT NULL,
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
-- TABLE : adhesion  (users <-> association)
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
-- TABLE : campagne_utilisateur  (users <-> campagne)
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
--  Tous les mots de passe = "password123" (BCrypt)
--  À supprimer / remplacer en production
-- =============================================================

-- -------------------------------------------------------------
-- Utilisateurs (10)
-- -------------------------------------------------------------
INSERT INTO users (email, password) VALUES
                                        ('alice@example.com',          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('bob@example.com',            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('claire.dupont@example.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('marc.leblanc@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('sophie.martin@example.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('julien.bernard@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('lea.thomas@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('antoine.petit@example.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('marie.rousseau@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
                                        ('pierre.moreau@example.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
-- IDs attendus : 1 = alice, 2 = bob, 3 = claire, 4 = marc, 5 = sophie,
--                6 = julien, 7 = léa, 8 = antoine, 9 = marie, 10 = pierre

-- -------------------------------------------------------------
-- Associations (6)
-- -------------------------------------------------------------
INSERT INTO association (name, categorie, email, siret, siege_social, telephone) VALUES
                                                                                     ('Les Restos du Cœur',      'Aide alimentaire',  'contact@restosducoeur.fr',  '30251719200030', '75 rue Nationale, 75010 Paris',    '0140123456'),
                                                                                     ('Greenpeace France',       'Environnement',     'info@greenpeace.fr',         '39399240200020', '13 rue Enghien, 75010 Paris',      '0140212321'),
                                                                                     ('Croix-Rouge Française',   'Aide humanitaire',  'contact@croix-rouge.fr',     '77567227200329', '98 rue Didot, 75014 Paris',        '0144431100'),
                                                                                     ('Médecins Sans Frontières','Santé',              'info@msf.fr',                '30252161900050', '14-34 avenue Jean Jaurès, 75019 Paris', '0140213229'),
                                                                                     ('WWF France',              'Environnement',     'contact@wwf.fr',             '42761800200012', '1 carrefour de Longchamp, 75016 Paris', '0155258484'),
                                                                                     ('Ligue contre le Cancer',  'Santé',             'info@ligue-cancer.net',      '77563134200021', '14 rue Corvisart, 75013 Paris',    '0153559595');
-- IDs attendus : 1 = Restos, 2 = Greenpeace, 3 = Croix-Rouge,
--                4 = MSF, 5 = WWF, 6 = Ligue Cancer

-- -------------------------------------------------------------
-- Campagnes (une par association)
-- -------------------------------------------------------------
INSERT INTO campagne (association_id) VALUES
                                          (1), -- Restos du Cœur
                                          (2), -- Greenpeace
                                          (3), -- Croix-Rouge
                                          (4), -- MSF
                                          (5), -- WWF
                                          (6); -- Ligue Cancer
-- IDs attendus : 1 → 6

-- -------------------------------------------------------------
-- Événements (2 par association = 12 au total)
-- -------------------------------------------------------------
INSERT INTO evenement (name, length, release_dt, synopsis, association_id) VALUES
                                                                               -- Restos du Cœur
                                                                               ('Gala de charité 2025',              180, '2025-06-15', 'Soirée annuelle de levée de fonds avec vente aux enchères et dîner.',                                1),
                                                                               ('Collecte hivernale – Paris Nord',    90, '2025-11-28', 'Grande collecte de denrées alimentaires dans les supermarchés partenaires.',                         1),
                                                                               -- Greenpeace
                                                                               ('Marche pour le climat',             120, '2025-09-22', 'Manifestation nationale pour une politique climatique ambitieuse.',                                   2),
                                                                               ('Forum environnemental 2025',        240, '2025-10-11', 'Journée de conférences et d'ateliers sur la transition écologique.',                                  2),
    -- Croix-Rouge
    ('Journée portes ouvertes Croix-Rouge',180,'2025-05-08', 'Découverte des actions locales, démonstrations de secourisme et bénévolat.',                         3),
    ('Concert caritatif Solidarité',      150, '2025-07-04', 'Concert de musique classique au profit des victimes de catastrophes naturelles.',                    3),
    -- MSF
    ('Conférence : Soigner en zones de guerre', 120,'2025-08-20','Témoignages de médecins terrain et débat sur l'accès aux soins en zones de conflit.',            4),
                                                                               ('Vente de solidarité MSF',            60, '2025-12-06', 'Marché solidaire avec objets artisanaux rapportés par les équipes de mission.',                      4),
                                                                               -- WWF
                                                                               ('Nettoyage des berges de la Seine',   180,'2025-04-19', 'Action citoyenne de dépollution des rives de la Seine avec les bénévoles WWF.',                      5),
                                                                               ('Expo photo : Espèces en danger',    300, '2025-06-05', 'Exposition photographique itinérante sur la biodiversité mondiale menacée.',                         5),
                                                                               -- Ligue contre le Cancer
                                                                               ('Octobre Rose – Marche solidaire',   120, '2025-10-04', 'Marche de 10 km pour soutenir la recherche contre le cancer du sein.',                              6),
                                                                               ('Conférence prévention cancer',       90, '2025-11-15', 'Conférence médicale grand public sur le dépistage précoce et les facteurs de risque.',              6);
-- IDs attendus : 1 à 12

-- -------------------------------------------------------------
-- Adhésions : qui est membre / admin de quelle asso
-- -------------------------------------------------------------
INSERT INTO adhesion (user_id, association_id, role, date) VALUES
                                                               -- Restos du Cœur
                                                               (1, 1, 'admin',       '2023-09-01'),
                                                               (2, 1, 'membre',      '2023-10-15'),
                                                               (3, 1, 'membre',      '2024-01-10'),
                                                               -- Greenpeace
                                                               (4, 2, 'admin',       '2022-06-20'),
                                                               (5, 2, 'membre',      '2023-03-08'),
                                                               (2, 2, 'membre',      '2024-02-14'),
                                                               -- Croix-Rouge
                                                               (6, 3, 'admin',       '2021-11-05'),
                                                               (7, 3, 'membre',      '2023-07-22'),
                                                               (8, 3, 'membre',      '2024-04-01'),
                                                               -- MSF
                                                               (9, 4, 'admin',       '2022-01-30'),
                                                               (3, 4, 'membre',      '2023-05-17'),
                                                               -- WWF
                                                               (10, 5, 'admin',      '2020-04-22'),
                                                               (5,  5, 'membre',     '2023-09-14'),
                                                               (7,  5, 'membre',     '2024-03-03'),
                                                               -- Ligue contre le Cancer
                                                               (1, 6, 'membre',      '2024-10-01'),
                                                               (8, 6, 'admin',       '2022-03-15'),
                                                               (9, 6, 'membre',      '2023-11-20');

-- -------------------------------------------------------------
-- Participants aux campagnes
-- -------------------------------------------------------------
INSERT INTO campagne_utilisateur (user_id, campagne_id, role) VALUES
                                                                  (1, 1, 'organisateur'),
                                                                  (2, 1, 'contributeur'),
                                                                  (3, 1, 'contributeur'),
                                                                  (4, 2, 'organisateur'),
                                                                  (5, 2, 'contributeur'),
                                                                  (6, 3, 'organisateur'),
                                                                  (7, 3, 'contributeur'),
                                                                  (8, 3, 'contributeur'),
                                                                  (9, 4, 'organisateur'),
                                                                  (3, 4, 'contributeur'),
                                                                  (10, 5, 'organisateur'),
                                                                  (5,  5, 'contributeur'),
                                                                  (7,  5, 'contributeur'),
                                                                  (8, 6, 'organisateur'),
                                                                  (1, 6, 'contributeur'),
                                                                  (9, 6, 'contributeur');

-- -------------------------------------------------------------
-- Commandes (achats de billets pour des événements)
-- -------------------------------------------------------------
INSERT INTO commande (user_id, evenement_id) VALUES
                                                 (2,  1),  -- bob → Gala Restos
                                                 (3,  1),  -- claire → Gala Restos
                                                 (5,  3),  -- sophie → Marche climat
                                                 (6,  3),  -- julien → Marche climat
                                                 (7,  4),  -- léa → Forum environnemental
                                                 (1,  5),  -- alice → Portes ouvertes Croix-Rouge
                                                 (8,  6),  -- antoine → Concert Croix-Rouge
                                                 (9,  7),  -- marie → Conférence MSF
                                                 (4,  8),  -- marc → Vente MSF
                                                 (10, 9),  -- pierre → Nettoyage Seine
                                                 (5,  10), -- sophie → Expo photo WWF
                                                 (1,  11), -- alice → Octobre Rose
                                                 (3,  11), -- claire → Octobre Rose
                                                 (7,  12); -- léa → Conférence cancer
-- IDs attendus : 1 à 14

-- -------------------------------------------------------------
-- Paiements (liés aux commandes)
-- status : 0=en_attente  1=validé  2=refusé  3=remboursé
-- -------------------------------------------------------------
INSERT INTO paiement (mode_paiement, date, montant, status, commande_id) VALUES
                                                                             ('Carte bancaire', '2025-05-10 09:15:00',  75.00, 1, 1),   -- Gala Restos - bob        ✓
                                                                             ('PayPal',         '2025-05-11 14:32:00',  75.00, 1, 2),   -- Gala Restos - claire     ✓
                                                                             ('Carte bancaire', '2025-08-01 10:00:00',  15.00, 1, 3),   -- Marche climat - sophie   ✓
                                                                             ('Virement',       '2025-08-03 08:45:00',  15.00, 0, 4),   -- Marche climat - julien   ⏳
                                                                             ('Carte bancaire', '2025-09-20 17:10:00',  30.00, 1, 5),   -- Forum WWF - léa          ✓
                                                                             ('PayPal',         '2025-04-25 11:00:00',   0.00, 1, 6),   -- Portes ouvertes - alice  ✓ (gratuit)
                                                                             ('Carte bancaire', '2025-06-15 20:30:00',  45.00, 1, 7),   -- Concert - antoine        ✓
                                                                             ('Carte bancaire', '2025-07-30 09:00:00',  10.00, 2, 8),   -- Conférence MSF - marie   ✗ refusé
                                                                             ('Virement',       '2025-11-20 14:00:00',  20.00, 1, 9),   -- Vente MSF - marc         ✓
                                                                             ('Carte bancaire', '2025-03-10 08:00:00',   0.00, 1, 10),  -- Nettoyage - pierre       ✓ (gratuit)
                                                                             ('PayPal',         '2025-05-28 16:45:00',  12.00, 3, 11),  -- Expo WWF - sophie        ↩ remboursé
                                                                             ('Carte bancaire', '2025-09-05 10:20:00',   5.00, 1, 12),  -- Octobre Rose - alice     ✓
                                                                             ('Carte bancaire', '2025-09-06 12:00:00',   5.00, 1, 13),  -- Octobre Rose - claire    ✓
                                                                             ('Virement',       '2025-10-30 09:30:00',   0.00, 0, 14);  -- Conférence cancer - léa  ⏳

-- -------------------------------------------------------------
-- Dons (indépendants des commandes)
-- -------------------------------------------------------------
INSERT INTO don (user_id, association_id, montant, date, paiement_id) VALUES
                                                                          (1,  1,  50.00, '2025-01-15 10:00:00', NULL),  -- alice → Restos
                                                                          (2,  2,  30.00, '2025-02-08 14:30:00', NULL),  -- bob → Greenpeace
                                                                          (3,  3, 100.00, '2025-03-22 09:15:00', NULL),  -- claire → Croix-Rouge
                                                                          (4,  4,  25.00, '2025-01-30 16:00:00', NULL),  -- marc → MSF
                                                                          (5,  5,  40.00, '2025-04-10 11:45:00', NULL),  -- sophie → WWF
                                                                          (6,  6,  20.00, '2025-02-14 08:00:00', NULL),  -- julien → Ligue Cancer
                                                                          (7,  1,  15.00, '2025-03-05 13:20:00', NULL),  -- léa → Restos
                                                                          (8,  3,  60.00, '2025-05-01 10:10:00', NULL),  -- antoine → Croix-Rouge
                                                                          (9,  4,  80.00, '2025-04-18 15:00:00', NULL),  -- marie → MSF
                                                                          (10, 5,  35.00, '2025-06-01 09:30:00', NULL),  -- pierre → WWF
                                                                          (1,  6,  10.00, '2025-10-15 17:00:00', NULL),  -- alice → Ligue Cancer (Octobre Rose)
                                                                          (3,  2,  45.00, '2025-09-22 18:00:00', NULL);  -- claire → Greenpeace (après Marche)