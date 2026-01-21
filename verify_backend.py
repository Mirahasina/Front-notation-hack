import requests
import sys

BASE_URL = 'http://localhost:8000/api'

def run_verification():
    print("🚀 Starting Backend Verification...")
    
    # 1. Login
    print("\n🔑 Testing Login...")
    session = requests.Session()
    login_data = {'username': 'admin', 'password': 'admin123'}
    try:
        response = session.post(f'{BASE_URL}/auth/login/', json=login_data)
        if response.status_code == 200:
            token = response.json().get('token')
            print("Login successful")
            session.headers.update({'Authorization': f'Token {token}'})
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Login Error: {e}")
        return False

    # 2. List Events
    print("\n Testing Events List...")
    response = session.get(f'{BASE_URL}/events/')
    if response.status_code == 200:
        events = response.json()
        if isinstance(events, dict) and 'results' in events:
            events = events['results']
        
        print(f" Found {len(events)} events")
        if not events:
            print(" No events found. Default event should have been created.")
            return False
        event_id = events[0]['id']
        print(f" Using Event ID: {event_id}")
    else:
        print(f" Failed to list events: {response.status_code} - {response.text}")
        return False

    print("\n👥 Testing Team Creation...")
    team_data = {
        'name': 'Verification Team',
        'event': event_id,
        'description': 'Created by verify_backend.py',
        'email': 'verify@test.com',
        'generated_email': 'team_verify@juryhack.com',
        'password': 'password123',
        'has_logged_in': False,
        'imported_from': 'verification_script'
    }
    import random
    team_data['generated_email'] = f"team_{random.randint(1000,9999)}@juryhack.com"
    team_data['name'] = f"Verification Team {random.randint(1000,9999)}"

    response = session.post(f'{BASE_URL}/teams/', json=team_data)
    if response.status_code == 201:
        created_team = response.json()
        print(f" Team created: {created_team['name']} (ID: {created_team['id']})")
    else:
        print(f" Failed to create team: {response.status_code} - {response.text}")
        return False

    print("\n Verifying Persistence...")
    response = session.get(f'{BASE_URL}/teams/?event_id={event_id}')
    if response.status_code == 200:
        teams = response.json()
        if isinstance(teams, dict) and 'results' in teams:
            teams = teams['results']
        found = any(t['id'] == created_team['id'] for t in teams)
        if found:
            print(" Persistence Confirmed: Created team found in list.")
        else:
            print(" Persistence Failed: Created team NOT found in list.")
            return False
    else:
        print(f" Failed to list teams: {response.status_code} - {response.text}")
        return False
        
    print("\n Verification Complete & Successful!")
    return True

if __name__ == "__main__":
    if run_verification():
        sys.exit(0)
    else:
        sys.exit(1)
