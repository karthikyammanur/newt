import sys
print("Testing basic functionality...")

try:
    import requests
    print("✅ Requests library imported")
    
    response = requests.get("http://localhost:8000/api/health")
    print(f"✅ Backend responded with status: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    
print("Test complete.")
