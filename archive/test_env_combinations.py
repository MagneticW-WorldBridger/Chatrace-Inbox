#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_different_combinations():
    """Test different combinations of tokens and configurations from .env"""
    
    # Get all values from .env
    api_token = os.getenv("API_TOKEN")
    user_token = os.getenv("USER_TOKEN")
    business_id = os.getenv("BUSINESS_ID")
    user_id = os.getenv("USER_ID")
    api_url = os.getenv("API_URL")
    
    print("🧪 Testing different combinations from .env")
    print(f"API Token: {api_token[:10]}...")
    print(f"User Token: {user_token[:10]}...")
    print(f"Business ID: {business_id}")
    print(f"User ID: {user_id}")
    print("=" * 80)
    
    # Test combinations
    combinations = [
        {
            "name": "API_TOKEN in Authorization header",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'Authorization': f'Bearer {api_token}'
            },
            "payload": {"op": "wt", "op1": "get"}
        },
        {
            "name": "API_TOKEN in X-API-Key header",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'X-API-Key': api_token
            },
            "payload": {"op": "wt", "op1": "get"}
        },
        {
            "name": "USER_TOKEN in X-ACCESS-TOKEN",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'X-ACCESS-TOKEN': user_token
            },
            "payload": {"op": "wt", "op1": "get"}
        },
        {
            "name": "Both tokens together",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'X-ACCESS-TOKEN': user_token,
                'Authorization': f'Bearer {api_token}'
            },
            "payload": {"op": "wt", "op1": "get"}
        },
        {
            "name": "API_TOKEN with account_id",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'X-ACCESS-TOKEN': api_token
            },
            "payload": {
                "account_id": business_id,
                "op": "conversations",
                "op1": "get"
            }
        },
        {
            "name": "USER_TOKEN with account_id",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'X-ACCESS-TOKEN': user_token
            },
            "payload": {
                "account_id": business_id,
                "op": "conversations",
                "op1": "get"
            }
        },
        {
            "name": "API_TOKEN as USER_TOKEN",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'X-ACCESS-TOKEN': api_token
            },
            "payload": {
                "account_id": business_id,
                "op": "users",
                "op1": "get",
                "user_id": user_id
            }
        },
        {
            "name": "No auth - just test connection",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app'
            },
            "payload": {"op": "wt", "op1": "get"}
        },
        {
            "name": "Test with different endpoint",
            "headers": {
                'Content-Type': 'application/json',
                'User-Agent': 'mobile-app',
                'X-ACCESS-TOKEN': user_token
            },
            "payload": {"op": "wt", "op1": "get"},
            "url": "https://app.aiprlassist.com/api/user"
        }
    ]
    
    working_combinations = []
    failed_combinations = []
    
    for i, combo in enumerate(combinations, 1):
        print(f"\n[{i:2d}/{len(combinations)}] Testing: {combo['name']}")
        
        url = combo.get('url', api_url)
        
        try:
            response = requests.post(url, headers=combo['headers'], json=combo['payload'])
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:150]}...")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("status") == "OK":
                        print(f"✅ SUCCESS: {combo['name']}")
                        working_combinations.append(combo['name'])
                    else:
                        error_code = data.get("code", "Unknown")
                        print(f"❌ API ERROR (Code {error_code}): {combo['name']}")
                        failed_combinations.append(combo['name'])
                except json.JSONDecodeError:
                    if response.text.strip() == "null":
                        print(f"⚠️ NULL RESPONSE: {combo['name']}")
                        failed_combinations.append(combo['name'])
                    else:
                        print(f"✅ SUCCESS (Non-JSON): {combo['name']}")
                        working_combinations.append(combo['name'])
            else:
                print(f"❌ HTTP {response.status_code}: {combo['name']}")
                failed_combinations.append(combo['name'])
                
        except Exception as e:
            print(f"❌ EXCEPTION: {combo['name']} - {str(e)}")
            failed_combinations.append(combo['name'])
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 COMBINATION TEST RESULTS")
    print("=" * 80)
    print(f"✅ Working: {len(working_combinations)}")
    print(f"❌ Failed: {len(failed_combinations)}")
    
    if working_combinations:
        print(f"\n✅ WORKING COMBINATIONS:")
        for combo in working_combinations:
            print(f"   - {combo}")
    
    if failed_combinations:
        print(f"\n❌ FAILED COMBINATIONS:")
        for combo in failed_combinations:
            print(f"   - {combo}")

def test_special_endpoints():
    """Test some special endpoints that might work"""
    
    api_url = os.getenv("API_URL")
    api_token = os.getenv("API_TOKEN")
    user_token = os.getenv("USER_TOKEN")
    business_id = os.getenv("BUSINESS_ID")
    
    print("\n" + "=" * 80)
    print("🔍 TESTING SPECIAL ENDPOINTS")
    print("=" * 80)
    
    # Test different URL variations
    urls_to_test = [
        "https://app.aiprlassist.com/php/user",
        "https://app.aiprlassist.com/api/user",
        "https://app.aiprlassist.com/php/user/",
        "https://app.aiprlassist.com/api/user/"
    ]
    
    for url in urls_to_test:
        print(f"\n--- Testing URL: {url} ---")
        
        # Test with API_TOKEN
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app',
            'X-ACCESS-TOKEN': api_token
        }
        
        payload = {"op": "wt", "op1": "get"}
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            print(f"API_TOKEN - Status: {response.status_code}")
            print(f"Response: {response.text[:100]}...")
        except Exception as e:
            print(f"API_TOKEN - Error: {str(e)}")
        
        # Test with USER_TOKEN
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app',
            'X-ACCESS-TOKEN': user_token
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            print(f"USER_TOKEN - Status: {response.status_code}")
            print(f"Response: {response.text[:100]}...")
        except Exception as e:
            print(f"USER_TOKEN - Error: {str(e)}")

if __name__ == "__main__":
    test_different_combinations()
    test_special_endpoints() 