
import os
import django

# Configure Django BEFORE importing anything else
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from rest_framework.test import APIRequestFactory, force_authenticate
from jury_api.serializers import UserSerializer
from jury_api.views import UserViewSet
from jury_api.models import Event, User

print(f"Settings configured: {settings.SETTINGS_MODULE}")

# Get event
event = Event.objects.first()
if not event:
    print("No events found!")
    exit(1)
print(f"Using Event ID: {event.id}")

# Get admin user
admin_user = User.objects.filter(role='admin').first()
if not admin_user:
    print("No admin user found! Creating temp admin...")
    admin_user = User.objects.create_superuser('temp_admin', 'admin@example.com', 'adminpass')
print(f"Acting as Admin: {admin_user.username}")

# Payload - Attempt 1: Empty string for event (possible frontend issue?)
print("\n--- TEST 1: Invalid Event ID ---")
payload_bad_event = {
    "username": "jury_bad_event",
    "password": "Password123!",
    "role": "jury",
    "event": "", # sending empty string instead of ID
    "assigned_criteria": []
}

factory = APIRequestFactory()
request = factory.post('/api/users/', payload_bad_event, format='json')
force_authenticate(request, user=admin_user)
view = UserViewSet.as_view({'post': 'create'})

try:
    response = view(request)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")
except Exception as e:
    print(f"Execution Error: {e}")


# Payload - Attempt 2: Missing password (possible frontend logic error?)
print("\n--- TEST 2: Missing Password ---")
payload_no_pass = {
    "username": "jury_no_pass",
    # "password": "Password123!", 
    "role": "jury",
    "event": event.id,
    "assigned_criteria": []
}

request = factory.post('/api/users/', payload_no_pass, format='json')
force_authenticate(request, user=admin_user)

try:
    response = view(request)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")
except Exception as e:
    print(f"Execution Error: {e}")

# Payload - Attempt 3: Duplicate Username (possible race condition or old data?)
print("\n--- TEST 3: Duplicate Username ---")
# Ensure user exists first
if not User.objects.filter(username="jury_dup").exists():
    User.objects.create_user(username="jury_dup", password="pwd", role="jury")

payload_dup = {
    "username": "jury_dup",
    "password": "Password123!", 
    "role": "jury",
    "event": event.id,
    "assigned_criteria": []
}

request = factory.post('/api/users/', payload_dup, format='json')
force_authenticate(request, user=admin_user)

try:
    response = view(request)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")
except Exception as e:
    print(f"Execution Error: {e}")
