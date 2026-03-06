
import requests
import time
import json

BASE_URL = "http://localhost:3000/api"

def test_api():
    print("Waiting for server to start...")
    time.sleep(3)
    
    print("\n--- Testing Quick Scan ---")
    try:
        response = requests.post(f"{BASE_URL}/scan", json={"url": "http://google.com"})
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Scan Failed: {e}")

    print("\n--- Testing Dangerous URL ---")
    try:
        response = requests.post(f"{BASE_URL}/scan", json={"url": "http://suspicious-bank-login.exe"})
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Scan Failed: {e}")

    print("\n--- Testing Contact Form ---")
    try:
        response = requests.post(f"{BASE_URL}/contact", json={
            "fullName": "Test User",
            "email": "test@example.com",
            "phone": "+998901234567",
            "message": "Hello backend!"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Contact Failed: {e}")

if __name__ == "__main__":
    test_api()
