import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_auth_system():
    print("\n=== Testing JWT & Admin System ===")
    
    # 1. Login as 'demo_user' (created during previous walkthrough)
    login_data = {
        "user_handle": "demo_user",
        "password": "demopassword"
    }
    print(f"Logging in as @{login_data['user_handle']}...")
    resp = requests.post(f"{BASE_URL}/consent/login", json=login_data)
    
    if resp.status_code != 200:
        print(f"✗ Login failed: {resp.text}")
        return
        
    res = resp.json()
    token = res["access_token"]
    is_admin = res["user"]["is_admin"]
    print(f"✓ Login successful! Admin={is_admin}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Test /me endpoint
    print("Testing /me endpoint...")
    me_resp = requests.get(f"{BASE_URL}/consent/me", headers=headers)
    if me_resp.status_code == 200:
        print(f"✓ Found me: @{me_resp.json()['handle']}")
    else:
        print(f"✗ /me failed: {me_resp.text}")
        
    # 3. Test Admin Protected Endpoint
    print("\nTesting Admin Protected Endpoint (/api/admin/users)...")
    admin_resp = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    
    if is_admin:
        if admin_resp.status_code == 200:
            print(f"✓ Admin verified! User count: {len(admin_resp.json())}")
        else:
            print(f"✗ Admin expected access but got: {admin_resp.status_code}")
    else:
        if admin_resp.status_code == 403:
            print("✓ Expected: Regular user denied access to Admin route.")
        else:
            print(f"✗ Failure: Admin route returned status {admin_resp.status_code} unexpectedly.")

if __name__ == "__main__":
    test_auth_system()
