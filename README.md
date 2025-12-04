# JuryHack 2025 - Plateforme de Notation

Une plateforme complète de notation pour jurys avec backend Django + PostgreSQL et frontend React + TypeScript.

## 🏗️ Architecture

### Frontend
- **React 19** avec TypeScript
- **React Router DOM** pour la navigation
- **Vite** comme bundler
- Design moderne avec dark mode

### Backend
- **Django 5.2** avec Django REST Framework  
- **PostgreSQL** comme base de données
- **Token Authentication** pour la sécurité
- API REST complète

## 📋 Prérequis

- Node.js 18+ et npm
- Python 3.10+
- PostgreSQL 14+

## 🚀 Installation

### 1. Installation de PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Configuration de la Base de Données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans le shell PostgreSQL:
CREATE DATABASE juryhack_db;
ALTER ROLE postgres WITH PASSWORD 'postgres';
\q
```

### 3. Installation du Backend Django

```bash
cd backend

# Installer les dépendances Python
pip3 install -r requirements.txt

# Créer et appliquer les migrations
python3 manage.py makemigrations
python3 manage.py migrate

# Créer un superutilisateur admin
python3 manage.py createsuperuser
# Username: admin
# Password: admin123
# Role: admin (sera demandé)

# Démarrer le serveur backend
python3 manage.py runserver 8000
```

Le backend sera disponible sur **http://localhost:8000**

### 4. Installation du Frontend React

```bash
# Retour au dossier principal
cd ..

# Installer les dépendances npm
npm install  

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera disponible sur **http://localhost:5173** (ou 5174/5175 si le port est occupé)

## 🎯 Utilisation

### Interface Admin

1. **Connexion** sur http://localhost:5173
   - Username: `admin`
   - Password: `admin123`

2. **Configuration**:
   - Créer des critères de notation
   - Ajouter les équipes participantes
   - Créer des comptes jurys

3. **Suivi**:
   - Dashboard montre la progression en temps réel
   - Vérifier que tous les jurys notent toutes les équipes

4. **Résultats**:
   - Finaliser et afficher le classement
   - Export des résultats avec détails

### Interface Jury

1. **Connexion** avec les identifiants fournis par l'admin

2. **Notation**:
   - Noter chaque équipe avec les critères définis
   - Valider (action irréversible!)

3. **Suivi**: Progression visible sur le dashboard

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/logout/` - Déconnexion

### Utilisateurs (Admin seulement)
- `GET /api/users/` - Liste des utilisateurs
- `POST /api/users/` - Créer un utilisateur
- `GET /api/users/{id}/` - Détails d'un utilisateur
- `PUT /api/users/{id}/` - Modifier un utilisateur
- `DELETE /api/users/{id}/` - Supprimer un utilisateur

### Critères
- `GET /api/criteria/` - Liste des critères
- `POST /api/criteria/` - Créer un critère (admin)
- `PUT /api/criteria/{id}/` - Modifier un critère (admin)
- `DELETE /api/criteria/{id}/` - Supprimer un critère (admin)

### Équipes
- `GET /api/teams/` - Liste des équipes
- `POST /api/teams/` - Créer une équipe (admin)
- `PUT /api/teams/{id}/` - Modifier une équipe (admin)
- `DELETE /api/teams/{id}/` - Supprimer une équipe (admin)

### Scores
- `GET /api/team-scores/` - Liste des scores
- `POST /api/team-scores/` - Créer/Sauvegarder un score
- `PUT /api/team-scores/{id}/` - Modifier un score (si non verrouillé)
- `POST /api/team-scores/{id}/lock/` - Verrouiller un score

### Résultats
- `GET /api/results/` - Classement final
- `GET /api/check-completion/` - Vérifier si tout est complété
- `GET /api/jury-progress/{jury_id}/` - Progression d'un jury

## 🔒 Authentification

L'API utilise Token Authentication. Après connexion, un token est retourné:

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Utilisez le token dans les requêtes suivantes:

```bash
curl http://localhost:8000/api/teams/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

## 📁 Structure du Projet

```
Jurydec/
├── backend/                # Backend Django
│   ├── config/            # Configuration Django
│   ├── jury_api/          # Application principale
│   │   ├── models.py      # Modèles de données
│   │   ├── serializers.py # Sérialiseurs DRF
│   │   ├── views.py       # Vues API
│   │   ├── urls.py        # Routes API
│   │   └── admin.py       # Admin Django
│   ├── manage.py
│   └── requirements.txt
├── src/                   # Frontend React
│   ├── components/        # Composants réutilisables
│   ├── contexts/          # Contextes React
│   ├── pages/             # Pages de l'application
│   ├── utils/             # Utilitaires
│   └── types.ts           # Types TypeScript
├── package.json
└── README.md
```

## 🛠️ Scripts Disponibles

### Frontend
```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
```

### Backend
```bash
python3 manage.py runserver         # Démarrer le serveur
python3 manage.py makemigrations    # Créer des migrations
python3 manage.py migrate           # Appliquer les migrations
python3 manage.py createsuperuser   # Créer un admin
python3 manage.py shell             # Shell Django
```

## 🧪 Administration Django

Accéder à l'interface d'administration Django:
- URL: http://localhost:8000/admin
- Username: `admin`
- Password: `admin123`

## 🔧 Variables d'Environnement

Fichier `backend/.env`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=juryhack_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## 🐛 Dépannage

### PostgreSQL ne démarre pas
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est démarré
- Vérifier les identifiants dans `.env`
- Vérifier que la base de données existe

### Port déjà utilisé (Frontend)
Vite choisira automatiquement un autre port (5174, 5175, etc.)

### Port déjà utilisé (Backend)
```bash
python3 manage.py runserver 8001  # Utiliser un autre port
```

## 📝 Notes Importantes

- ✅ Les notes sont verrouillées après validation (irréversible)
- ✅ Seuls les admins peuvent créer des jurys, équipes et critères
- ✅ Les jurys ne voient que leurs propres notes
- ✅ Les résultats ne sont visibles qu'une fois tout complété
- ✅ Toutes les données sont persistées dans PostgreSQL

## 📧 Support

Pour toute question ou problème, contacter l'administrateur système.

## 📜 Licence

Projet développé pour **JuryHack 2025**
