#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_different_account_ids():
    """Test different account_id values to find one that works"""
    
    api_url = os.getenv("API_URL")
    user_token = os.getenv("USER_TOKEN")
    business_id = os.getenv("BUSINESS_ID")
    
    print("🧪 Testing different account_id values")
    print(f"Current BUSINESS_ID: {business_id}")
    print("=" * 80)
    
    # Test different account_id values
    account_ids_to_test = [
        business_id,  # Current one
        "420",  # From whitelabel response
        "1005832147",  # USER_ID
        "1",
        "2", 
        "3",
        "10",
        "100",
        "1000",
        "10000",
        "100000",
        "1000000",
        "1145545",  # Same as business_id but as string
        "1145546",  # Next number
        "1145544",  # Previous number
    ]
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'mobile-app',
        'X-ACCESS-TOKEN': user_token
    }
    
    working_account_ids = []
    failed_account_ids = []
    
    for account_id in account_ids_to_test:
        print(f"\n--- Testing account_id: {account_id} ---")
        
        # Test with conversations endpoint
        payload = {
            "account_id": account_id,
            "op": "conversations",
            "op1": "get"
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:150]}...")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("status") == "OK":
                        print(f"✅ SUCCESS: account_id {account_id} works!")
                        working_account_ids.append(account_id)
                    else:
                        error_code = data.get("code", "Unknown")
                        print(f"❌ API ERROR (Code {error_code}): account_id {account_id}")
                        failed_account_ids.append(account_id)
                except json.JSONDecodeError:
                    if response.text.strip() == "null":
                        print(f"⚠️ NULL RESPONSE: account_id {account_id}")
                        failed_account_ids.append(account_id)
                    else:
                        print(f"✅ SUCCESS (Non-JSON): account_id {account_id}")
                        working_account_ids.append(account_id)
            else:
                print(f"❌ HTTP {response.status_code}: account_id {account_id}")
                failed_account_ids.append(account_id)
                
        except Exception as e:
            print(f"❌ EXCEPTION: account_id {account_id} - {str(e)}")
            failed_account_ids.append(account_id)
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 ACCOUNT_ID TEST RESULTS")
    print("=" * 80)
    print(f"✅ Working: {len(working_account_ids)}")
    print(f"❌ Failed: {len(failed_account_ids)}")
    
    if working_account_ids:
        print(f"\n✅ WORKING ACCOUNT_IDS:")
        for account_id in working_account_ids:
            print(f"   - {account_id}")
    
    if failed_account_ids:
        print(f"\n❌ FAILED ACCOUNT_IDS:")
        for account_id in failed_account_ids:
            print(f"   - {account_id}")

def test_with_working_account_id():
    """If we find a working account_id, test all endpoints with it"""
    
    # Let's assume we found a working account_id
    working_account_id = "420"  # From whitelabel response
    
    api_url = os.getenv("API_URL")
    user_token = os.getenv("USER_TOKEN")
    
    print(f"\n🧪 Testing all endpoints with working account_id: {working_account_id}")
    print("=" * 80)
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'mobile-app',
        'X-ACCESS-TOKEN': user_token
    }
    
    # Test key endpoints with working account_id
    endpoints_to_test = [
        {
            "name": "Get Conversations",
            "payload": {
                "account_id": working_account_id,
                "op": "conversations",
                "op1": "get"
            }
        },
        {
            "name": "Get User Info",
            "payload": {
                "account_id": working_account_id,
                "op": "users",
                "op1": "get",
                "user_id": os.getenv("USER_ID")
            }
        },
        {
            "name": "Get Admins",
            "payload": {
                "account_id": working_account_id,
                "op": "admins",
                "op1": "get"
            }
        },
        {
            "name": "Get Teams",
            "payload": {
                "account_id": working_account_id,
                "op": "teams",
                "op1": "get"
            }
        },
        {
            "name": "Get Tags",
            "payload": {
                "account_id": working_account_id,
                "op": "tags",
                "op1": "get"
            }
        },
        {
            "name": "Get Saved Replies",
            "payload": {
                "account_id": working_account_id,
                "op": "replies",
                "op1": "get"
            }
        }
    ]
    
    working_endpoints = []
    failed_endpoints = []
    
    for endpoint in endpoints_to_test:
        print(f"\n--- Testing: {endpoint['name']} ---")
        
        try:
            response = requests.post(api_url, headers=headers, json=endpoint['payload'])
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:150]}...")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("status") == "OK":
                        print(f"✅ SUCCESS: {endpoint['name']}")
                        working_endpoints.append(endpoint['name'])
                    else:
                        error_code = data.get("code", "Unknown")
                        print(f"❌ API ERROR (Code {error_code}): {endpoint['name']}")
                        failed_endpoints.append(endpoint['name'])
                except json.JSONDecodeError:
                    if response.text.strip() == "null":
                        print(f"⚠️ NULL RESPONSE: {endpoint['name']}")
                        failed_endpoints.append(endpoint['name'])
                    else:
                        print(f"✅ SUCCESS (Non-JSON): {endpoint['name']}")
                        working_endpoints.append(endpoint['name'])
            else:
                print(f"❌ HTTP {response.status_code}: {endpoint['name']}")
                failed_endpoints.append(endpoint['name'])
                
        except Exception as e:
            print(f"❌ EXCEPTION: {endpoint['name']} - {str(e)}")
            failed_endpoints.append(endpoint['name'])
    
    # Summary
    print(f"\n📊 RESULTS WITH ACCOUNT_ID {working_account_id}:")
    print(f"✅ Working: {len(working_endpoints)}")
    print(f"❌ Failed: {len(failed_endpoints)}")
    
    if working_endpoints:
        print(f"\n✅ WORKING ENDPOINTS:")
        for endpoint in working_endpoints:
            print(f"   - {endpoint}")
    
    if failed_endpoints:
        print(f"\n❌ FAILED ENDPOINTS:")
        for endpoint in failed_endpoints:
            print(f"   - {endpoint}")

if __name__ == "__main__":
    test_different_account_ids()
    test_with_working_account_id() 