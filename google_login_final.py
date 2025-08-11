#!/usr/bin/env python3
"""
Google OAuth Login Script - Using User's Own Google App
Now that redirect_uri has been added to Google Cloud Console
"""

import os
import json
import requests
from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# Load environment variables
load_dotenv()

# Google OAuth configuration from .env
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')

# ChatRace API configuration
API_URL = os.getenv('API_URL')

print("🚀 GOOGLE OAUTH LOGIN - USING YOUR OWN APP")
print(f"Client ID: {GOOGLE_CLIENT_ID}")
print(f"Redirect URI: {GOOGLE_REDIRECT_URI}")
print(f"API URL: {API_URL}")
print("-" * 50)

# Create OAuth flow configuration
flow_config = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [GOOGLE_REDIRECT_URI]
    }
}

# Extract port from redirect URI
import urllib.parse
parsed_uri = urllib.parse.urlparse(GOOGLE_REDIRECT_URI)
oauth_port = parsed_uri.port if parsed_uri.port else 3000
print(f"🔧 Using port: {oauth_port} from redirect URI: {GOOGLE_REDIRECT_URI}")

# Save config to temporary file
with open('temp_oauth_config.json', 'w') as f:
    json.dump(flow_config, f)

try:
    # Create OAuth flow
    flow = InstalledAppFlow.from_client_secrets_file(
        'temp_oauth_config.json',
        scopes=['openid', 'email', 'profile']
    )
    
    print("🔐 Starting Google OAuth flow...")
    print("📱 A browser window will open for Google login")
    
    # Run the OAuth flow - Use port from .env redirect URI
    credentials = flow.run_local_server(port=oauth_port)
    
    print("✅ Google OAuth successful!")
    print(f"Access Token: {credentials.token}")
    print(f"ID Token: {credentials.id_token}")
    
    # Now try to login to ChatRace with the Google token
    print("\n🔄 Attempting ChatRace login with Google token...")
    
    chatrace_payload = {
        "op": "login",
        "op1": "authentication", 
        "op2": "validate",
        "op3": "google",
        "data": {
            "idToken": credentials.id_token,
            "serverAuthCode": ""
        }
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'mobile-app'
    }
    
    response = requests.post(API_URL, json=chatrace_payload, headers=headers)
    
    print(f"📡 ChatRace API Response Status: {response.status_code}")
    print(f"📡 ChatRace API Response: {response.text}")
    
    if response.status_code == 200:
        try:
            result = response.json()
            if result.get('status') == 'OK':
                print("🎉 SUCCESS! ChatRace login successful!")
                print(f"🎫 User Token: {result.get('data', {}).get('token')}")
            else:
                print(f"❌ ChatRace login failed: {result}")
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error during OAuth flow: {e}")
    
finally:
    # Clean up temporary file
    if os.path.exists('temp_oauth_config.json'):
        os.remove('temp_oauth_config.json')
        print("🧹 Cleaned up temporary files") 