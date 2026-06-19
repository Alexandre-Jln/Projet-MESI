-- =============================================================
--  PotCommun – Migration : ajout table cagnotte
--  À ajouter à la fin de database/init.sql
--  (ou à exécuter manuellement si la BDD existe déjà)
-- =============================================================

USE potcommun;

CREATE TABLE IF NOT EXISTS cagnotte (
    id               BIGINT         NOT NULL AUTO_INCREMENT,
    titre            VARCHAR(150)   NOT NULL,
    description      TEXT,
    objectif         DECIMAL(10,2),
    montant_collecte DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    association_id   INT            NOT NULL,
    date_creation    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_fin         DATE,
    actif            TINYINT(1)     NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_cagnotte_association
        FOREIGN KEY (association_id) REFERENCES association (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Données de mock
INSERT INTO cagnotte (titre, description, objectif, montant_collecte, association_id, date_fin) VALUES
    ('Repas de Noël pour les sans-abri',
     'Aidez-nous à offrir un repas chaud à 500 personnes le soir du 24 décembre.',
     3000.00, 1240.50, 1, '2025-12-20'),

    ('Opération eau potable – Sahel',
     'Financer l'installation de 3 puits dans des villages sans accès à l'eau potable.',
     8000.00, 3175.00, 4, '2025-09-30'),

    ('Planter 10 000 arbres en France',
     'Chaque don de 5 € finance la plantation d'un arbre dans une forêt dégradée.',
     5000.00, 2890.00, 2, '2025-07-01'),

    ('Matériel médical d'urgence – Ukraine',
     'Achat de kits de premiers secours pour les équipes de la Croix-Rouge sur le terrain.',
     12000.00, 7650.00, 3, '2025-06-30'),

    ('Sauvons le lynx boréal',
     'Soutien au programme de réintroduction du lynx dans les Vosges et le Jura.',
     4500.00, 980.00, 5, '2025-12-31'),

    ('Dépistage cancer gratuit – zones rurales',
     'Financer des camions médicaux itinérants pour le dépistage du cancer dans les déserts médicaux.',
     6000.00, 2100.00, 6, '2025-11-30');
