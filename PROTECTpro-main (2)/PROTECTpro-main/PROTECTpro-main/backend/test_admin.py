
import requests
import json

BASE_URL = "http://localhost:3000/api/admin/data"

def test_admin_panel():
    try:
        res = requests.get(BASE_URL)
        print(f"Status Code: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print("Admin Data Received:")
            print(json.dumps(data, indent=2))
            if "stats" in data and "users" in data:
                print("✓ Validation Successful: Stats and Users present.")
            else:
                print("✖ Validation Failed: Missing keys.")
        else:
            print("✖ Server Error")
            print(res.text)
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_admin_panel()
