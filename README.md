# PotCommun

Application web de gestion d'associations, d'événements, de dons et de campagnes de collecte de fonds.

---

## Architecture du projet

```
Projet-MESI/
├── backend/          # API REST Java / Spring Boot (port 8080)
├── frontend/         # Interface React / Vite (port 5173)
├── database/
│   └── init.sql      # Script d'initialisation du schéma MySQL
├── docker-compose.yml  # MySQL 8 + phpMyAdmin (port 8081)
├── .env.example      # Variables d'environnement à copier
└── .github/
    └── workflows/
        └── ci.yml    # Pipeline CI GitHub Actions
```

### Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, TypeScript |
| Backend | Java 21, Spring Boot 3.2.2, Spring Data JPA, Spring Security Crypto |
| Base de données | MySQL 8.0 |
| ORM | Hibernate 6 |
| Build backend | Maven |
| Build frontend | Vite / npm |
| Conteneurs (dev) | Docker Compose (MySQL + phpMyAdmin) |
| CI/CD | GitHub Actions |

### Architecture Docker (développement)

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
   Spring Boot backend     React frontend
   (mvn spring-boot:run)   (npm run dev)
        :8080                  :5173
```

> Docker gère uniquement la base de données. Le backend et le frontend se lancent séparément sur la machine hôte.

### Schéma de la base de données

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

**Statuts du paiement (`status`) :** `0` = en attente · `1` = validé · `2` = refusé · `3` = remboursé

**Relations clés :**
```
users ──▶ don ──▶ association
      ──▶ commande ──▶ evenement ──▶ association
      ──▶ adhesion ──▶ association
      ──▶ campagne_utilisateur ──▶ campagne ──▶ association
commande / don ──▶ paiement
```

### Ports par défaut

| Service | Port |
|---|---|
| Backend API | 8080 |
| Frontend dev | 5173 |
| MySQL | 3306 |
| phpMyAdmin | 8081 |

---

## Prérequis

### Communs (tous les OS)

- **Git**
- **Java 21** (JDK) — [Temurin recommandé](https://adoptium.net/)
- **Maven 3.8+** — ou utiliser le wrapper `./mvnw` si présent
- **Node.js 20 LTS** + **npm** — [nodejs.org](https://nodejs.org/)
- **MySQL 8.0** — en local **ou** via Docker

> **Option recommandée :** utiliser Docker pour MySQL afin d'éviter toute installation locale.

---

## Installation — macOS

### 1. Prérequis via Homebrew

```bash
# Installer Homebrew si absent
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Java 21
brew install --cask temurin@21

# Maven
brew install maven

# Node.js 20
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Docker Desktop (pour MySQL)
brew install --cask docker
```

### 2. Vérifier les versions

```bash
java -version    # doit afficher openjdk 21
mvn -v           # doit afficher Maven 3.x
node -v          # doit afficher v20.x
npm -v
docker -v
```

### 3. Cloner le projet

```bash
git clone <url-du-repo>
cd Projet-MESI
git checkout develop
```

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Le fichier `.env` contient les identifiants MySQL utilisés par Docker Compose. Les valeurs par défaut correspondent à la configuration du backend (`potcommun_user` / `potcommun_pass`).

### 5. Démarrer la base de données

**Option A — Docker (recommandé) :**

```bash
docker compose up -d
```

Cela démarre MySQL sur le port 3306 et phpMyAdmin sur [http://localhost:8081](http://localhost:8081).  
Le script `database/init.sql` est exécuté automatiquement au premier démarrage.

**Option B — MySQL local (Homebrew) :**

```bash
brew install mysql
brew services start mysql

# Créer la base et l'utilisateur
mysql -u root -e "
  CREATE DATABASE IF NOT EXISTS potcommun CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'potcommun_user'@'localhost' IDENTIFIED BY 'potcommun_pass';
  GRANT ALL PRIVILEGES ON potcommun.* TO 'potcommun_user'@'localhost';
  FLUSH PRIVILEGES;
"

# Initialiser le schéma
mysql -u root potcommun < database/init.sql
```

### 6. Démarrer le backend

```bash
cd backend
mvn spring-boot:run
```

L'API est disponible sur [http://localhost:8080](http://localhost:8080).

### 7. Démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

L'interface est disponible sur [http://localhost:5173](http://localhost:5173).

---

## Installation — Linux (Ubuntu / Debian)

### 1. Prérequis système

```bash
sudo apt update && sudo apt upgrade -y

# Java 21
sudo apt install -y wget apt-transport-https
wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo apt-key add -
echo "deb https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
sudo apt update
sudo apt install -y temurin-21-jdk

# Maven
sudo apt install -y maven

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Vérifier les versions

```bash
java -version
mvn -v
node -v
npm -v
docker -v
```

### 3. Cloner le projet

```bash
git clone <url-du-repo>
cd Projet-MESI
git checkout develop
```

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

### 5. Démarrer la base de données

**Option A — Docker (recommandé) :**

```bash
docker compose up -d
```

**Option B — MySQL local :**

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql

sudo mysql -e "
  CREATE DATABASE IF NOT EXISTS potcommun CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'potcommun_user'@'localhost' IDENTIFIED BY 'potcommun_pass';
  GRANT ALL PRIVILEGES ON potcommun.* TO 'potcommun_user'@'localhost';
  FLUSH PRIVILEGES;
"

mysql -u potcommun_user -ppotcommun_pass potcommun < database/init.sql
```

### 6. Démarrer le backend

```bash
cd backend
mvn spring-boot:run
```

### 7. Démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Installation — Windows

### 1. Prérequis

Installer dans cet ordre :

- **Git** : [git-scm.com](https://git-scm.com/download/win)
- **Java 21 JDK (Temurin)** : [adoptium.net](https://adoptium.net/) → choisir Windows x64 `.msi`  
  Cocher "Set JAVA_HOME variable" pendant l'installation.
- **Maven** : [maven.apache.org](https://maven.apache.org/download.cgi) → `.zip` binaire  
  Extraire dans `C:\Program Files\Apache\maven`, puis ajouter `C:\Program Files\Apache\maven\bin` au PATH.
- **Node.js 20 LTS** : [nodejs.org](https://nodejs.org/) → `.msi` Windows installer
- **Docker Desktop** : [docker.com](https://www.docker.com/products/docker-desktop/) (nécessite WSL2 activé)

> **Activer WSL2** (requis par Docker Desktop) :
> ```powershell
> # Dans PowerShell en administrateur
> wsl --install
> # Redémarrer le PC
> ```

### 2. Vérifier les versions (PowerShell)

```powershell
java -version
mvn -v
node -v
npm -v
docker -v
```

### 3. Cloner le projet

```powershell
git clone <url-du-repo>
cd Projet-MESI
git checkout develop
```

### 4. Configurer les variables d'environnement

```powershell
copy .env.example .env
```

Ouvrir `.env` avec un éditeur et vérifier les valeurs.

### 5. Démarrer la base de données

**Option A — Docker Desktop (recommandé) :**

```powershell
docker compose up -d
```

**Option B — MySQL local :**

Télécharger MySQL 8.0 Community Server sur [dev.mysql.com](https://dev.mysql.com/downloads/mysql/).  
Pendant l'installation, noter le mot de passe root choisi.

```powershell
# Dans PowerShell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS potcommun CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'potcommun_user'@'localhost' IDENTIFIED BY 'potcommun_pass'; GRANT ALL PRIVILEGES ON potcommun.* TO 'potcommun_user'@'localhost'; FLUSH PRIVILEGES;"

mysql -u root -p potcommun < database\init.sql
```

### 6. Démarrer le backend

```powershell
cd backend
mvn spring-boot:run
```

### 7. Démarrer le frontend

```powershell
cd frontend
npm install
npm run dev
```

---

## Commandes utiles

### Backend

```bash
# Compiler sans lancer
mvn clean package

# Lancer les tests
mvn test

# Lancer le JAR compilé
java -jar backend/target/PotCommun-backend-1.0-SNAPSHOT.jar
```

### Frontend

```bash
# Démarrer en développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

### Docker

```bash
# Démarrer les services (MySQL + phpMyAdmin)
docker compose up -d

# Voir les logs MySQL
docker compose logs db

# Arrêter les services
docker compose down

# Arrêter et supprimer les données (reset complet)
docker compose down -v
```

---

## Accès phpMyAdmin

Quand Docker est lancé, phpMyAdmin est accessible sur [http://localhost:8081](http://localhost:8081).

| Champ | Valeur |
|---|---|
| Serveur | `db` |
| Utilisateur | `potcommun_user` |
| Mot de passe | `potcommun_pass` |

---

## Variables d'environnement (`.env`)

Copier `.env.example` en `.env` et ajuster si nécessaire :

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=potcommun
MYSQL_USER=potcommun_user
MYSQL_PASSWORD=potcommun_pass
```

> Le fichier `.env` ne doit jamais être commité. Il est déjà listé dans `.gitignore`.

---

## Endpoints API (exemples)

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |

---

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) se déclenche sur les pushs et pull requests vers `main`, `develop` et `staging`.

- **Job backend** : `mvn clean package` avec Java 21
- **Job frontend** : `npm ci && npm run build` avec Node.js 20

Les artefacts (JAR et dossier `dist`) sont conservés 7 jours.

---

## Accéder à la base de données

### Via phpMyAdmin (interface graphique)

Ouvrir **http://localhost:8081** dans le navigateur (Docker doit être lancé).

| Champ | Valeur |
|---|---|
| Serveur | `db` |
| Utilisateur | `potcommun_user` |
| Mot de passe | `potcommun_pass` |

### Via le terminal dans le container Docker

```bash
docker exec -it potcommun_db mysql -u potcommun_user -p potcommun
```

Commandes utiles une fois connecté :

```sql
SHOW TABLES;           -- lister les tables
DESCRIBE users;        -- voir la structure d'une table
SELECT * FROM users;   -- voir les données
EXIT;
```

### Via un client SQL externe (DBeaver, TablePlus, DataGrip…)

| Paramètre | Valeur |
|---|---|
| Host | `localhost` |
| Port | `3306` |
| Database | `potcommun` |
| Username | `potcommun_user` |
| Password | `potcommun_pass` |

---

## Modifier le schéma

> Ne jamais modifier la BDD directement à la main sur un environnement partagé. Toujours passer par un fichier SQL versionné.

1. Créer un fichier SQL numéroté dans `database/` :

```
database/
├── init.sql                    ← schéma initial (ne pas modifier)
└── V2__ma_modification.sql     ← nouveau fichier
```

2. Écrire le SQL de migration :

```sql
-- Exemple : database/V2__ajout_colonne_users.sql
ALTER TABLE users ADD COLUMN username VARCHAR(50) AFTER email;
```

3. Appliquer sur sa machine :

```bash
docker exec -i potcommun_db mysql -u potcommun_user -ppotcommun_pass potcommun \
  < database/V2__ma_modification.sql
```

4. Mettre à jour l'entité Java correspondante.

5. Committer les deux fichiers ensemble (SQL + entité Java).

> **Reset complet (supprime toutes les données) :**
> ```bash
> docker compose down -v && docker compose up -d
> ```
> `init.sql` est rejoué automatiquement à la recréation du volume.

---

## Données de test

Le script `database/init.sql` insère des données de test :

| Email | Mot de passe |
|---|---|
| alice@example.com | `password123` |
| bob@example.com | `password123` |

Inclut aussi : 2 associations (Restos du Cœur, Greenpeace), 2 campagnes, 2 événements, 2 adhésions.

> Supprimer ou ignorer ces données en production.

---

## Résolution de problèmes

### Le port 3306 est déjà utilisé

MySQL est probablement déjà installé localement et tourne en arrière-plan.

```bash
# macOS
brew services stop mysql

# Linux
sudo systemctl stop mysql

# Windows (PowerShell admin)
net stop mysql
```

Ou changer le port dans `docker-compose.yml` (`"3307:3306"`) et adapter l'URL dans `application.properties`.

### `init.sql` n'a pas été exécuté / tables manquantes

Le script `init.sql` ne s'exécute qu'à la **création du volume** (premier lancement). Si le volume existait déjà d'un run précédent, il est ignoré.

```bash
docker compose down -v   # supprime le volume
docker compose up -d     # init.sql s'exécute à la recréation
```

### `SchemaManagementException: missing table`

Le schéma MySQL et les entités Java ne correspondent plus. Le mode `validate` d'Hibernate refuse de démarrer si les tables ou colonnes diffèrent.

Vérifier le message d'erreur (il indique la table/colonne en désaccord), appliquer la migration SQL manquante, ou faire un reset complet.

### `Access denied for user`

Les credentials dans `application.properties` ou `.env` ne correspondent pas. Vérifier que les deux fichiers ont les mêmes valeurs. En cas de doute, reset complet.