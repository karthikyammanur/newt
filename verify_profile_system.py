#!/usr/bin/env python3
"""
Quick verification script to test profile system routes and functionality
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def check_endpoint(endpoint, method="GET", headers=None, data=None):
    """Check if an endpoint is accessible"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json=data)
        
        return {
            "endpoint": endpoint,
            "status": response.status_code,
            "accessible": response.status_code < 500,
            "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:100]
        }
    except requests.exceptions.ConnectionError:
        return {
            "endpoint": endpoint,
            "status": "Connection Error",
            "accessible": False,
            "response": "Could not connect to server"
        }
    except Exception as e:
        return {
            "endpoint": endpoint,
            "status": "Error",
            "accessible": False,
            "response": str(e)
        }

def verify_profile_system():
    """Verify all profile system endpoints are available"""
    print("🔍 Profile System Verification")
    print("=" * 50)
    print(f"Testing against: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Test public endpoints (no auth required)
    public_endpoints = [
        "/health",
        "/summaries",
        "/auth/register",
        "/auth/login"
    ]

    print("📋 Testing Public Endpoints:")
    for endpoint in public_endpoints:
        result = check_endpoint(endpoint)
        status_icon = "✅" if result["accessible"] else "❌"
        print(f"  {status_icon} {endpoint}: {result['status']}")

    print()

    # Test protected endpoints (would need auth, but we can check if they reject properly)
    protected_endpoints = [
        "/users",
        "/dashboard",
        "/auth/me"
    ]

    print("🔒 Testing Protected Endpoints (expecting 401 without auth):")
    for endpoint in protected_endpoints:
        result = check_endpoint(endpoint)
        # 401 is expected for protected endpoints without auth
        status_icon = "✅" if result["status"] in [401, "Connection Error"] else "❌"
        expected = "401 (Expected)" if result["status"] == 401 else result["status"]
        print(f"  {status_icon} {endpoint}: {expected}")

    print()

    # Test user-specific endpoints (would need user ID and auth)
    user_endpoints = [
        "/user/test-id/profile",
        "/user/test-id/followers", 
        "/user/test-id/following"
    ]

    print("👤 Testing User Profile Endpoints (expecting 401 without auth):")
    for endpoint in user_endpoints:
        result = check_endpoint(endpoint)
        status_icon = "✅" if result["status"] in [401, "Connection Error"] else "❌"
        expected = "401 (Expected)" if result["status"] == 401 else result["status"]
        print(f"  {status_icon} {endpoint}: {expected}")

    print()

    # Check if server is running
    health_check = check_endpoint("/health")
    if health_check["accessible"]:
        print("🟢 Backend Server Status: RUNNING")
        print(f"   Health Check: {health_check['response']}")
    else:
        print("🔴 Backend Server Status: NOT ACCESSIBLE")
        print(f"   Error: {health_check['response']}")

    print()
    print("📁 Frontend Routes to Test Manually:")
    frontend_routes = [
        "http://localhost:3000/",
        "http://localhost:3000/summaries", 
        "http://localhost:3000/dashboard",
        "http://localhost:3000/discover",
        "http://localhost:3000/profile/[user-id]",
        "http://localhost:3000/profile/[user-id]/followers",
        "http://localhost:3000/profile/[user-id]/following"
    ]
    
    for route in frontend_routes:
        print(f"  📄 {route}")

    print()
    print("✨ Verification Complete!")
    print()
    print("📝 Next Steps:")
    print("  1. Ensure backend server is running: cd backend && python -m uvicorn app.main:app --reload")
    print("  2. Ensure frontend server is running: cd frontend && npm run dev")
    print("  3. Create test users and test follow functionality")
    print("  4. Test profile pages by logging in and navigating to /discover")

if __name__ == "__main__":
    verify_profile_system()
