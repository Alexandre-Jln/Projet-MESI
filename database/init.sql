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
-- Correspond à UserEntity.java (@Table name = "users")
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
-- Données de test (supprimer en production)
-- =============================================================

-- Mots de passe = "password123" hashés BCrypt
INSERT INTO users (email, password) VALUES
    ('alice@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
    ('bob@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

INSERT INTO association (name, categorie, email, siret, siege_social, telephone) VALUES
    ('Les Restos du Cœur', 'Aide alimentaire', 'contact@restosducoeur.fr', '30251719200030', '75 rue Nationale Paris', '0140123456'),
    ('Greenpeace France',  'Environnement',    'info@greenpeace.fr',       '39399240200020', '13 rue Enghien Paris',   '0140212321');

INSERT INTO campagne (association_id) VALUES (1), (2);

INSERT INTO evenement (name, length, release_dt, synopsis, association_id) VALUES
    ('Gala de charité 2025', 180, '2025-06-15', 'Soirée annuelle de levée de fonds.', 1),
    ('Marche pour le climat', 120, '2025-09-22', 'Manifestation pacifique pour le climat.', 2);

INSERT INTO adhesion (user_id, association_id, role) VALUES
    (1, 1, 'admin'),
    (2, 1, 'membre');
