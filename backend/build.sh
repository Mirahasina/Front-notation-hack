
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

if [ "$DJANGO_SUPERUSER_USERNAME" ]; then
    python manage.py createsuperuser \
        --no-input \
        --username $DJANGO_SUPERUSER_USERNAME \
        --email $DJANGO_SUPERUSER_EMAIL || true
    
    # Force the role to 'admin' and ensure password is set correctly just in case
    echo "from jury_api.models import User; u = User.objects.get(username='$DJANGO_SUPERUSER_USERNAME'); u.role = 'admin'; u.is_staff = True; u.is_superuser = True; u.set_password('$DJANGO_SUPERUSER_PASSWORD'); u.save(); print('Superuser role updated to admin and password reset')" | python manage.py shell
fi
