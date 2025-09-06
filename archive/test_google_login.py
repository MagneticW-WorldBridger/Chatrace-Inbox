#!/usr/bin/env python3
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get correct Google Client ID from whitelabel response
CORRECT_GOOGLE_CLIENT = "426960401142-a7rkln8fl3342kn99hl11vh65drp2fci.apps.googleusercontent.com"
API_URL = os.getenv('API_URL')

print("🔐 PROBANDO LOGIN CON GOOGLE")
print("=" * 60)
print(f"🌐 API URL: {API_URL}")
print(f"🔑 Google Client ID (correcto): {CORRECT_GOOGLE_CLIENT}")
print()

# Test Google Login
google_login_request = {
    "op": "login",
    "op1": "authentication",
    "op2": "validate", 
    "op3": "google",
    "data": {
        "idToken": "test_token_for_validation",
        "serverAuthCode": ""
    }
}

headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'mobile-app',
    'X-PLATFORM': 'web'
}

try:
    response = requests.post(API_URL, json=google_login_request, headers=headers)
    print(f"📊 Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            if data and data.get('status') == 'OK':
                user_token = data.get('data', {}).get('token')
                print("🎉 ¡LOGIN EXITOSO!")
                print(f"🔑 USER TOKEN: {user_token}")
                print(f"💾 Guarda este token en tu .env como USER_TOKEN")
            else:
                print(f"❌ Error en login: {data}")
        except json.JSONDecodeError:
            print("❌ Response no es JSON válido")
            print(f"📄 Raw response: {response.text}")
    else:
        print(f"❌ Error HTTP: {response.status_code}")
        
except Exception as e:
    print(f"💥 Error: {e}")

print("\n" + "="*60)
print("💡 NOTA: Este es un test básico.")
print("Para login real necesitas:")
print("1. Un idToken válido de Google OAuth")
print("2. Configurar OAuth en tu aplicación")
print("3. Obtener el token real de Google") 