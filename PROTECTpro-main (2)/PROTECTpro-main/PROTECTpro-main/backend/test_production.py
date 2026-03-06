
import requests
import time
import uuid

BASE_URL = "http://localhost:3000/api"

def test_production_features():
    print("--- Testing Production Features ---")
    time.sleep(2) # Wait for server
    
    user_id = f"test_user_{uuid.uuid4()}"
    print(f"Test User ID: {user_id}")
    
    # 1. Test Daily Rate Limit (Free Plan: 3 links)
    print("\n[1] Testing Rate Limit (Free Plan)...")
    for i in range(1, 6):
        res = requests.post(f"{BASE_URL}/scan", json={"url": "http://google.com", "userId": user_id})
        print(f"Scan {i}: {res.status_code} - {res.json().get('error', 'OK')}")
        if res.status_code == 429:
            print("   -> Rate Limit Correctly Enforced!")
            break
            
    # 2. Test Advanced Heuristics (Telegram)
    print("\n[2] Testing Telegram Detection...")
    res = requests.post(f"{BASE_URL}/scan", json={"url": "http://t.me/fake_bot", "userId": "premium_user_mock"})
    data = res.json()
    print(f"URL: t.me/fake_bot")
    print(f"Threats: {data.get('threats')}")
    if "Telegram Bot Link" in str(data.get('threats')):
        print("   -> Telegram Heuristic Working!")
    else:
        print("   -> FAILED: Telegram link not flagged.")

    # 3. Test Payment/Upgrade
    print("\n[3] Testing Plan Upgrade...")
    res = requests.post(f"{BASE_URL}/payment", json={
        "userId": user_id,
        "plan": "Professional"
    })
    print(f"Payment Status: {res.json().get('success')}")
    
    # 4. Retest Rate Limit (Should be allowed now)
    print("\n[4] Retesting Rate Limit after Upgrade...")
    res = requests.post(f"{BASE_URL}/scan", json={"url": "http://google.com", "userId": user_id})
    print(f"Scan 4 (Post-Upgrade): {res.status_code}")
    if res.status_code == 200:
        print("   -> Upgrade Successful! Limit lifted.")
    else:
        print("   -> FAILED: Still rate limited.")

if __name__ == "__main__":
    test_production_features()
