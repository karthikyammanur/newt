import requests
import json

BASE_URL = "http://localhost:8000/api"

def create_test_user():
    """Create a test user and return their details"""
    user_data = {
        "email": "testuser@example.com",
        "password": "password123"
    }
    
    print("Creating test user...")
    
    # Try to register the user
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    
    if response.status_code == 200:
        print("✅ User registered successfully")
        token = response.json()["access_token"]
        
        # Get user info
        user_response = requests.get(f"{BASE_URL}/auth/me", 
                                   headers={"Authorization": f"Bearer {token}"})
        
        if user_response.status_code == 200:
            user_info = user_response.json()
            print(f"✅ User info retrieved: {user_info}")
            return user_info, token
        else:
            print(f"❌ Failed to get user info: {user_response.text}")
            return None, token
            
    elif response.status_code == 400:
        # User might already exist, try to login
        print("User might already exist, trying to login...")
        
        form_data = {
            "username": user_data["email"],
            "password": user_data["password"]
        }
        
        login_response = requests.post(f"{BASE_URL}/auth/login", data=form_data)
        
        if login_response.status_code == 200:
            print("✅ Logged in successfully")
            token = login_response.json()["access_token"]
            
            # Get user info
            user_response = requests.get(f"{BASE_URL}/auth/me",
                                       headers={"Authorization": f"Bearer {token}"})
            
            if user_response.status_code == 200:
                user_info = user_response.json()
                print(f"✅ User info retrieved: {user_info}")
                return user_info, token
            else:
                print(f"❌ Failed to get user info: {user_response.text}")
                return None, token
        else:
            print(f"❌ Login failed: {login_response.text}")
            return None, None
    else:
        print(f"❌ Registration failed: {response.text}")
        return None, None

def test_profile_endpoint(user_id, token):
    """Test the profile endpoint"""
    print(f"\nTesting profile endpoint for user_id: {user_id}")
    
    response = requests.get(f"{BASE_URL}/user/{user_id}/profile",
                          headers={"Authorization": f"Bearer {token}"})
    
    if response.status_code == 200:
        profile = response.json()
        print("✅ Profile endpoint working!")
        print(f"Profile data: {json.dumps(profile, indent=2)}")
        return True
    else:
        print(f"❌ Profile endpoint failed: {response.status_code}")
        print(f"Error: {response.text}")
        return False

if __name__ == "__main__":
    try:
        user_info, token = create_test_user()
        
        if user_info and token:
            print(f"\n📋 Test User Details:")
            print(f"   User ID: {user_info['user_id']}")
            print(f"   Email: {user_info['email']}")
            print(f"   Points: {user_info['points']}")
            
            # Test the profile endpoint
            success = test_profile_endpoint(user_info['user_id'], token)
            
            if success:
                print(f"\n🔗 Test Profile URL: http://localhost:5183/profile/{user_info['user_id']}")
                print("You can now test the profile page in the browser!")
            
        else:
            print("❌ Could not create or login test user")
            
    except Exception as e:
        print(f"❌ Error: {e}")
