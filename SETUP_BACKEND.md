# Configuration rapide Backend Django + PostgreSQL

## Installation Express (5 minutes)

### 1. PostgreSQL
```bash
# Installer PostgreSQL
sudo apt-get update && sudo apt-get install -y postgresql

# Créer la base de données
sudo -u postgres createdb juryhack_db
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### 2. Backend Django
```bash
cd /home/mirahasina/Documents/JuryHack2025/Jurydec/backend

# Installer les dépendances
pip3 install -r requirements.txt

# Créer les tables
python3 manage.py makemigrations jury_api
python3 manage.py migrate

# Créer l'admin
python3 manage.py shell << EOF
from jury_api.models import User
User.objects.create_superuser(username='admin', password='admin123', email='admin@mail.com', role='admin')
EOF

# Démarrer le backend  
python3 manage.py runserver 8000
```

### 3. Frontend React
```bash
cd /home/mirahasina/Documents/JuryHack2025/Jurydec

# S'assurer que les dépendances sont installées
npm install

# Démarrer le frontend (déjà en cours normalement)
npm run dev
```

## URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## Identifiants
- **Admin**: admin / admin123

## Test API rapide
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Le token sera dans la réponse
```

## Problèmes courants

### PostgreSQL : "peer authentication failed"
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Changer "peer" en "md5" pour local
sudo systemctl restart postgresql
```

### Port 8000 occupé
```bash
# Utiliser un autre port
python3 manage.py runserver 8001
```

### Migrations
```bash
# Supprimer et recreer
cd backend
rm -rf jury_api/migrations/*
python3 manage.py makemigrations jury_api
python3 manage.py migrate
```
