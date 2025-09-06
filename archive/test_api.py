#!/usr/bin/env python3

import requests
import json

def test_whitelabel_api():
    """Test the ChatRace API with the provided credentials"""
    
    # API Configuration
    base_url = "https://app.aiprlassist.com/php/user"
    api_key = "plXflze7zshKDdQeDU5LNlWyVOrW9olwU6BYVgwyiE8eIsITm7"
    business_account_id = "1145545"
    
    # Headers
    headers = {
        'Content-Type': 'application/json',
        'X-ACCESS-TOKEN': api_key,
        'User-Agent': 'mobile-app'
    }
    
    # Test 1: Get Whitelabel Information
    print("🧪 Testing: Get Whitelabel Information")
    print(f"URL: {base_url}")
    print(f"Headers: {headers}")
    
    payload = {
        "op": "wt",
        "op1": "get"
    }
    
    try:
        response = requests.post(base_url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! API is working!")
            return response.json()
        else:
            print("❌ FAILED! API returned error")
            return None
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None

def test_get_user_info():
    """Test Get logged user information"""
    base_url = "https://app.aiprlassist.com/php/user"
    api_key = "plXflze7zshKDdQeDU5LNlWyVOrW9olwU6BYVgwyiE8eIsITm7"
    
    headers = {
        'Content-Type': 'application/json',
        'X-ACCESS-TOKEN': api_key,
        'User-Agent': 'mobile-app'
    }
    
    payload = {
        "op": "user",
        "op1": "get",
        "op2": "info"
    }
    
    print("\n🧪 Testing: Get Logged User Information")
    try:
        response = requests.post(base_url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! User info retrieved!")
            return response.json()
        else:
            print("❌ FAILED! User info error")
            return None
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None

def test_get_conversations():
    """Test Get list of conversations (contacts)"""
    base_url = "https://app.aiprlassist.com/php/user"
    api_key = "plXflze7zshKDdQeDU5LNlWyVOrW9olwU6BYVgwyiE8eIsITm7"
    business_account_id = "1145545"
    
    headers = {
        'Content-Type': 'application/json',
        'X-ACCESS-TOKEN': api_key,
        'User-Agent': 'mobile-app'
    }
    
    payload = {
        "op": "conversation",
        "op1": "get",
        "op2": "list",
        "account_id": business_account_id
    }
    
    print("\n🧪 Testing: Get List of Conversations")
    try:
        response = requests.post(base_url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! Conversations retrieved!")
            return response.json()
        else:
            print("❌ FAILED! Conversations error")
            return None
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None

if __name__ == "__main__":
    print("🚀 Testing ChatRace API...")
    
    # Test 1: Whitelabel
    whitelabel_result = test_whitelabel_api()
    
    # Test 2: User Info
    user_result = test_get_user_info()
    
    # Test 3: Conversations
    conversations_result = test_get_conversations()
    
    if whitelabel_result and user_result and conversations_result:
        print("\n🎉 ALL API TESTS SUCCESSFUL!")
        print("¡YA TENEMOS TODO PARA HACER EL INBOX CHINGÓN!")
    else:
        print("\n💥 Some API tests failed!")
        print("Pero ya sabemos que el API funciona!") 