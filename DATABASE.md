# Base de données & Docker — PotCommun

> MySQL 8 · Docker Compose · Spring Boot · phpMyAdmin

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis](#2-prérequis)
3. [Premier démarrage](#3-premier-démarrage)
4. [Utilisation au quotidien](#4-utilisation-au-quotidien)
5. [Schéma de la base de données](#5-schéma-de-la-base-de-données)
6. [Accéder à la base de données](#6-accéder-à-la-base-de-données)
7. [Variables d'environnement](#7-variables-denvironnement)
8. [Modifier le schéma](#8-modifier-le-schéma)
9. [Configuration Spring Boot](#9-configuration-spring-boot)
10. [Commandes Docker utiles](#10-commandes-docker-utiles)
11. [Résolution des problèmes](#11-résolution-des-problèmes)

---

## 1. Vue d'ensemble

```
┌──────────────────────────────────────────────┐
│              Docker Compose                  │
│                                              │
│  ┌─────────────┐       ┌──────────────────┐  │
│  │  MySQL 8.0  │◀─────▶│   phpMyAdmin     │  │
│  │   :3306     │       │     :8081        │  │
│  └──────┬──────┘       └──────────────────┘  │
│         │                                    │
└─────────┼────────────────────────────────────┘
          │
          ▼ (localhost:3306)
   Spring Boot backend
   (lancé séparément, hors Docker)
```

Deux services Docker tournent en parallèle :

| Service | Rôle | Port |
|---|---|---|
| `potcommun_db` | Base de données MySQL 8 | `3306` |
| `potcommun_phpmyadmin` | Interface web d'admin BDD | `8081` |

Les données sont **persistées** dans le volume `potcommun_mysql_data` — elles survivent aux redémarrages.

---

## 2. Prérequis

| Outil | Lien |
|---|---|
| Docker Desktop | https://www.docker.com/products/docker-desktop/ |
| Git | https://git-scm.com/ |

> Pas besoin d'installer MySQL localement. Docker s'en charge entièrement.

Vérifier que Docker est bien installé :
```bash
docker --version
docker compose version
```

---

## 3. Premier démarrage

### Étape 1 — Créer le fichier `.env`

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

> ⚠️ Ne jamais committer `.env` sur Git. Il est déjà dans `.gitignore`.

Le fichier `.env` contient les mots de passe de la base. Demander les valeurs à l'équipe si nécessaire.

### Étape 2 — Lancer les containers

```bash
docker compose up -d
```

Au premier lancement, Docker :
1. Télécharge l'image MySQL 8.0
2. Crée la base `potcommun`
3. Exécute automatiquement `database/init.sql` → toutes les tables sont créées avec des données de test
4. Lance phpMyAdmin

⏱️ **Compter ~1-2 minutes** le temps que MySQL soit prêt.

### Étape 3 — Vérifier

```bash
docker compose ps
```

Les deux services doivent afficher `healthy` ou `running` :

```
NAME                    STATUS
potcommun_db            Up (healthy)
potcommun_phpmyadmin    Up
```

---

## 4. Utilisation au quotidien

```bash
# Démarrer la BDD (matin)
docker compose up -d

# Arrêter la BDD (soir)
docker compose down

# Voir les logs en temps réel
docker compose logs -f db
```

> Le backend Spring Boot se lance **séparément** depuis IntelliJ ou via `mvn spring-boot:run`. Il se connecte à MySQL sur `localhost:3306`.

---

## 5. Schéma de la base de données

### Tables

| Table | Description |
|---|---|
| `users` | Comptes utilisateurs (email + mot de passe bcrypt) |
| `association` | Associations enregistrées sur la plateforme |
| `evenement` | Événements organisés par une association |
| `campagne` | Campagnes de collecte rattachées à une association |
| `campagne_utilisateur` | Liaison users ↔ campagne avec un rôle |
| `don` | Dons effectués par un utilisateur |
| `paiement` | Détails d'un paiement (mode, montant, statut) |
| `commande` | Inscriptions d'un utilisateur à un événement |
| `adhesion` | Adhésions d'un utilisateur à une association |

### Relations

```
users ──────────────────────────────────────────────────────┐
│ id (PK)                                                    │
│ email (UNIQUE)                                             │
│ password (bcrypt)                                          │
└──┬────────────┬───────────────┬──────────────┬────────────┘
   │            │               │              │
   ▼            ▼               ▼              ▼
 don          commande        adhesion    campagne_utilisateur
   │            │               │              │
   ▼            ▼               ▼              ▼
 association  evenement     association     campagne
   │            │                              │
   └────────────┴──────────────────────────────┘
         toutes reliées à association

commande ──▶ paiement
don      ──▶ paiement
```

### Statuts du paiement (`status`)

| Valeur | Signification |
|---|---|
| `0` | En attente |
| `1` | Validé |
| `2` | Refusé |
| `3` | Remboursé |

### Données de test incluses

Le script `init.sql` insère automatiquement des données de démonstration :

- 2 utilisateurs (`alice@example.com`, `bob@example.com`) — mot de passe : `password123`
- 2 associations (Restos du Cœur, Greenpeace)
- 2 campagnes, 2 événements, 2 adhésions

> Ces données sont là pour développer et tester. Les supprimer ou les ignorer en production.

---

## 6. Accéder à la base de données

### Via phpMyAdmin (interface graphique)

Ouvrir dans le navigateur : **http://localhost:8081**

| Champ | Valeur |
|---|---|
| Serveur | `db` |
| Utilisateur | valeur de `MYSQL_USER` dans `.env` |
| Mot de passe | valeur de `MYSQL_PASSWORD` dans `.env` |

### Via le terminal dans le container

```bash
docker exec -it potcommun_db mysql -u potcommun_user -p potcommun
# Entrer le mot de passe défini dans .env
```

Commandes utiles une fois connecté :

```sql
SHOW TABLES;              -- lister les tables
DESCRIBE users;           -- voir la structure d'une table
SELECT * FROM users;      -- voir les données
EXIT;
```

### Via un client SQL externe (DBeaver, TablePlus, DataGrip…)

| Paramètre | Valeur |
|---|---|
| Host | `localhost` |
| Port | `3306` |
| Database | `potcommun` |
| Username | valeur de `MYSQL_USER` dans `.env` |
| Password | valeur de `MYSQL_PASSWORD` dans `.env` |

---

## 7. Variables d'environnement

Toutes les valeurs sensibles sont dans le fichier `.env` (jamais commité) :

| Variable | Rôle | Valeur par défaut |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | Mot de passe administrateur MySQL | — |
| `MYSQL_DATABASE` | Nom de la base de données | `potcommun` |
| `MYSQL_USER` | Utilisateur applicatif | `potcommun_user` |
| `MYSQL_PASSWORD` | Mot de passe de l'utilisateur | — |

Le `docker-compose.yml` lit ces variables avec la syntaxe `${VARIABLE:-valeur_par_defaut}`.

---

## 8. Modifier le schéma

> ⚠️ Ne jamais modifier la BDD directement à la main sur un environnement partagé. Toujours passer par un fichier SQL versionné.

### Ajouter une table ou une colonne

1. Créer un fichier SQL numéroté dans `database/` :

```
database/
├── init.sql          ← schéma initial (ne pas modifier)
└── V2__ma_modification.sql   ← nouveau fichier
```

2. Écrire le SQL de migration :

```sql
-- database/V2__ajout_colonne_users.sql
ALTER TABLE users ADD COLUMN username VARCHAR(50) AFTER email;
```

3. Appliquer sur sa machine :

```bash
docker exec -i potcommun_db mysql -u potcommun_user -ppotcommun_pass potcommun \
  < database/V2__ma_modification.sql
```

4. Mettre à jour l'entité Java correspondante.

5. Committer les deux fichiers ensemble (SQL + entité Java).

### Repartir de zéro (reset complet)

```bash
# ⚠️ Supprime toutes les données
docker compose down -v
docker compose up -d
```

`init.sql` est rejoué automatiquement à la recréation du volume.

---

## 9. Configuration Spring Boot

Le backend se connecte à MySQL via `backend/src/main/ressources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/potcommun?useSSL=false&serverTimezone=UTC
spring.datasource.username=potcommun_user
spring.datasource.password=potcommun_pass
spring.jpa.hibernate.ddl-auto=validate
```

Le mode `validate` signifie qu'Hibernate **vérifie** que le schéma correspond aux entités Java, sans jamais le modifier. Si les deux ne correspondent pas, le backend refuse de démarrer et affiche le champ en désaccord.

**Pour les tests**, un profil H2 distinct est actif automatiquement depuis `backend/src/test/ressources/application-test.properties` — les tests ne touchent jamais à MySQL.

---

## 10. Commandes Docker utiles

```bash
# Démarrer en arrière-plan
docker compose up -d

# Arrêter sans supprimer les données
docker compose down

# Arrêter ET supprimer toutes les données (reset complet)
docker compose down -v

# Voir les logs de la BDD
docker compose logs -f db

# Voir l'état des services
docker compose ps

# Ouvrir un shell MySQL dans le container
docker exec -it potcommun_db mysql -u potcommun_user -p potcommun

# Supprimer les images inutilisées
docker system prune
```

---

## 11. Résolution des problèmes

### ❌ Le port 3306 est déjà utilisé

MySQL est probablement déjà installé localement.

```bash
# Arrêter MySQL local sur Windows
net stop mysql

# Arrêter MySQL local sur Mac
brew services stop mysql

# Arrêter MySQL local sur Linux
sudo systemctl stop mysql
```

Ou changer le port dans `docker-compose.yml` : `"3307:3306"` et adapter `application.properties` en conséquence.

### ❌ `init.sql` n'a pas été exécuté / tables manquantes

Le script `init.sql` ne s'exécute qu'à la **création du volume** (premier lancement). Si le volume existait déjà, il est ignoré.

```bash
docker compose down -v   # supprime le volume
docker compose up -d     # init.sql s'exécute à la recréation
```

### ❌ Le backend refuse de démarrer / `SchemaManagementException`

Le schéma MySQL et les entités Java ne correspondent plus (suite à une migration non appliquée).

Vérifier le message d'erreur — il indique la table ou la colonne en désaccord — puis soit appliquer la migration SQL manquante, soit faire un reset complet.

### ❌ `Access denied for user`

Les credentials dans `application.properties` ou `.env` ne correspondent pas.

Vérifier que les valeurs dans `.env` sont identiques à celles dans `application.properties`. En cas de doute, faire un reset complet.

---

## Fichiers liés

```
MESI/
├── .env.example              ← template à copier en .env
├── .env                      ← variables sensibles (non commité)
├── docker-compose.yml        ← définition des services Docker
├── database/
│   └── init.sql              ← schéma complet + données de test
└── backend/
    └── src/
        ├── main/ressources/
        │   └── application.properties       ← config MySQL (dev)
        └── test/ressources/
            └── application-test.properties  ← config H2 (tests)
```