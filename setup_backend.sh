#!/bin/bash

# Setup script for JuryHack Backend

echo "🚀 Setting up JuryHack Backend..."

# Create PostgreSQL database
echo "📦 Creating PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE juryhack_db;" 2>/dev/null || echo "Database may already exist"
sudo -u postgres psql -c "ALTER ROLE postgres WITH PASSWORD 'postgres';" 2>/dev/null

# Run migrations
echo "🔄 Running migrations..."
cd backend
python3 manage.py makemigrations
python3 manage.py migrate

# Create superuser (admin)
echo "👤 Creating admin user..."
python3 manage.py shell << EOF
from jury_api.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        password='admin123',
        email='admin@juryhack.com',
        role='admin'
    )
    print("✅ Admin user created: username='admin', password='admin123'")
else:
    print("ℹ️  Admin user already exists")
EOF

echo "✅ Backend setup complete!"
echo "🎯 Run 'cd backend && python3 manage.py runserver' to start the backend"
