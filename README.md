# EduLearn - Plateforme d'Apprentissage

Bienvenue sur le projet **EduLearn**. Application full-stack composée d'une API Symfony moderne et d'un frontend React dynamique.

## 🏗 Architecture du Projet

Le projet est divisé en deux parties principales :
- **Professeurs (Racine)** : Partie professeurs construite avec **Symfony 7.2**, **API Platform**, **Twig** et **MySQL**.
- **Étudiants (`/student`)** : Partie étudiants construite avec **React 19**, **Vite** et **Tailwind CSS**.

## 🚀 Prérequis
f
Assurez-vous d'avoir les outils suivants installés sur votre machine :
- **PHP** 8.2 ou supérieur
- **Composer** (Gestionnaire de dépendances PHP)
- **Node.js** (LTS recommandé) et **npm**
- **Docker** & **Docker Compose** (Pour la base de données)
- **Symfony CLI** (Recommandé pour lancer le serveur backend)

## 🛠 Installation et Configuration

### 1. Configuration de la partie professeurs (Symfony)

1.  **Installation des dépendances PHP** :
    ```bash
    composer install
    ```

2.  **Démarrage de la base de données** :
    Lancez le conteneur Docker MySQL :
    ```bash
    docker compose up -d --build
    ```

3.  **Configuration des variables d'environnement** :
    Le fichier `compose.yaml` configure une base de données **MySQL** sur le port `5432`.
    Assurez-vous que votre fichier `.env` (à créer si nécessaire) pointe vers la bonne base de données.
    
    Exemple de configuration pour MySQL dans `.env.local` :
    ```ini
    # Adaptez les identifiants selon votre configuration Docker (par défaut celui ci-dessous)
    DATABASE_URL="mysql://app:app@127.0.0.1:3307/app?serverVersion=8.0&charset=utf8mb4"
    ```
    
    *Note : Le projet nécessite également une clé API Mistral (`MISTRAL_API_KEY`) dans le fichier `.env`.*

4.  **Création de la base de données et des migrations** :
    ```bash
    php bin/console doctrine:database:create
    php bin/console doctrine:migrations:migrate
    ```

5.  **Démarrage du serveur API** :
    ```bash
    symfony server serve -d
    # Le site sera accessible sur https://127.0.0.1:8000
    ```

### 2. Configuration de la partie étudiante (React)

1.  **Accéder au dossier frontend** :
    ```bash
    cd frontend
    ```

2.  **Installation des dépendances JavaScript** :
    ```bash
    npm install
    ```

3.  **Démarrage du serveur de développement** :
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:8000/student`.

## ⚙️ Configuration Avancée

### Augmenter la taille limite d'upload PHP

Pour uploader de gros fichiers, vous devez modifier la configuration PHP (`php.ini`).

1.  Localisez votre fichier `php.ini` chargé :
    ```bash
    php --ini
    ```
2.  Ouvrez le fichier indiqué (ex: Loaded Configuration File) et modifiez les valeurs suivantes :
    ```ini
    ; Augmente la taille max d'un fichier uploadé (ex: 100 Mo)
    upload_max_filesize = 100M

    ; Augmente la taille max des données POST (doit être > upload_max_filesize)
    post_max_size = 100M
    
    ; Optionnel : Augmente le temps d'exécution max si l'upload est lent
    max_execution_time = 300
    ```
3.  Redémarrez votre serveur Web ou PHP-FPM (avec Symfony CLI, redémarrez la commande `symfony server:start`).

### Installation de FFmpeg

FFmpeg est nécessaire pour le traitement des fichiers multimédias.

#### 🍎 macOS (avec Homebrew)
```bash
brew install ffmpeg
```

#### 🐧 Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install ffmpeg
```

#### 🪟 Windows
1.  Téléchargez les builds depuis [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) ou le site officiel.
2.  Extrayez l'archive et déplacez le dossier (ex: `C:\ffmpeg`).
3.  Ajoutez le chemin `C:\ffmpeg\bin` à vos variables d'environnement **PATH**.
4.  Vérifiez l'installation dans un nouveau terminal : `ffmpeg -version`.

## 📚 Documentation API

Une fois le backend lancé, vous pouvez accéder à la documentation interactive de l'API (Swagger/OpenAPI) à l'adresse suivante :
- `https://127.0.0.1:8000/api`

## 🧪 Commandes Utiles

- **Lint Backend** : `php bin/console lint:yaml config`
- **Lint Frontend** : `cd frontend && npm run lint`
- **Tests** : `php bin/console test` (si configuré)

## 🔑 Fixtures (Comptes de test)

Pour peupler la base de données avec des utilisateurs de test, lancez la commande suivante :

```bash
php bin/console doctrine:fixtures:load
```

Voici les comptes créés par défaut :

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Professeur** (Admin) | `prof@example.com` | `password` |
| **Étudiant** | `eleve@example.com` | `password` |
