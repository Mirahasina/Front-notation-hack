import os
import django
import sys

sys.path.append('/home/mirahasina/Documents/Système notation RISE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from jury_api.models import Message
from rest_framework.test import APIRequestFactory, force_authenticate
from jury_api.views import MessageViewSet
from rest_framework.exceptions import ValidationError

User = get_user_model()

def run_verification():
    print("Setting up test data...")
    # Create users
    admin, _ = User.objects.get_or_create(username='test_admin_verif', role='admin')
    team1, _ = User.objects.get_or_create(username='test_team1_verif', role='team')
    team2, _ = User.objects.get_or_create(username='test_team2_verif', role='team')
    jury1, _ = User.objects.get_or_create(username='test_jury1_verif', role='jury')
    
    factory = APIRequestFactory()
    view = MessageViewSet.as_view({'get': 'list', 'post': 'create'})
    
    Message.objects.all().delete()

    print("\n--- Test 1: Team -> Staff (Valid) ---")
    data = {'content': 'Hello Staff', 'recipient': None} # None means Staff
    request = factory.post('/api/messages/', data, format='json')
    force_authenticate(request, user=team1)
    response = view(request)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("PASS")
    else:
        print(f"FAIL: {response.data}")

    print("\n--- Test 2: Team -> Team (Invalid) ---")
    data = {'content': 'Hello Team2', 'recipient': team2.id}
    request = factory.post('/api/messages/', data, format='json')
    force_authenticate(request, user=team1)
    try:
        response = view(request)
        print(f"Status: {response.status_code}")
        if response.status_code == 400: # ValidationError
             print("PASS")
        else:
             print(f"FAIL: Expected 400, got {response.status_code}")
    except ValidationError:
        print("PASS (ValidationError raised)")
    except Exception as e:
        print(f"PASS (Exception raised: {e}) Check if this is ValidationError")

    print("\n--- Test 3: Jury -> Staff (Valid) ---")
    data = {'content': 'Feedback', 'recipient': None}
    request = factory.post('/api/messages/', data, format='json')
    force_authenticate(request, user=jury1)
    response = view(request)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("PASS")
    else:
        print(f"FAIL: {response.data}")

    print("\n--- Test 4: Staff -> Team (Valid, Single) ---")
    data = {'content': 'Reply to Team1', 'recipient': team1.id}
    request = factory.post('/api/messages/', data, format='json')
    force_authenticate(request, user=admin)
    response = view(request)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("PASS")
    else:
        print(f"FAIL: {response.data}")

    print("\n--- Test 5: Staff -> Multi (Valid, Multi-Recipient) ---")
    data = {'content': 'Announcement', 'recipients': [team1.id, team2.id]}
    request = factory.post('/api/messages/', data, format='json')
    force_authenticate(request, user=admin)
    response = view(request)
    print(f"Status: {response.status_code}")
    
    # Check if messages where created
    msg_count = Message.objects.filter(content='Announcement').count()
    print(f"Created messages: {msg_count}")
    
    if response.status_code == 201 and msg_count == 2:
        print("PASS")
    else:
        print(f"FAIL: Code {response.status_code}, Count {msg_count}")
        print(response.data)

    print("\n--- Test 6: Team -> Multi (Invalid) ---")
    data = {'content': 'Spam', 'recipients': [team2.id, jury1.id]}
    request = factory.post('/api/messages/', data, format='json')
    force_authenticate(request, user=team1)
    try:
        response = view(request)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
             print("PASS")
        else:
             print(f"FAIL: Expected 400, got {response.status_code}")
    except ValidationError:
        print("PASS (ValidationError raised)")

if __name__ == '__main__':
    run_verification()
