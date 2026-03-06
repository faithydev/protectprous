
import requests
import time

BASE_URL = "http://localhost:3000/api"

def test_apk_upload():
    print("--- Testing APK Upload ---")
    
    # Create a dummy APK file (just text content for demo)
    dummy_content = b"PK\x03\x04" + b"demo_content" * 100
    files = {'apk': ('test_app.apk', dummy_content, 'application/vnd.android.package-archive')}
    
    try:
        start = time.time()
        response = requests.post(f"{BASE_URL}/scan-apk", files=files)
        elapsed = time.time() - start
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print(f"Time: {elapsed:.2f}s")
        
    except Exception as e:
        print(f"Upload Failed: {e}")

if __name__ == "__main__":
    test_apk_upload()
