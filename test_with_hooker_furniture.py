#!/usr/bin/env python3
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Hooker Furniture Account Data
HOOKER_ACCOUNT_ID = "1022121"
HOOKER_KEY = "QyqSaysVzL9sdJQ8nlo1"
API_URL = os.getenv('API_URL')
API_TOKEN = os.getenv('API_TOKEN')

print("🔐 PROBANDO CON HOOKER FURNITURE ACCOUNT")
print("=" * 60)
print(f"🏢 Account ID: {HOOKER_ACCOUNT_ID}")
print(f"🔑 Key: {HOOKER_KEY}")
print(f"🌐 API URL: {API_URL}")
print(f"🔑 API Token: {API_TOKEN[:10]}...")
print()

# Test 1: Get Whitelabel Info (should work)
print("📤 PRUEBA 1: Información del Whitelabel...")
whitelabel_request = {
    "op": "whitelabel",
    "op1": "info"
}

headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'mobile-app',
    'X-ACCESS-TOKEN': API_TOKEN
}

try:
    response = requests.post(API_URL, json=whitelabel_request, headers=headers)
    print(f"📊 Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            if data and data.get('status') == 'OK':
                print("✅ Whitelabel info obtenida exitosamente!")
                print(f"🏢 Business Name: {data.get('data', {}).get('business_name', 'N/A')}")
                print(f"🌐 Domain: {data.get('data', {}).get('domain', 'N/A')}")
            else:
                print(f"❌ Error en whitelabel: {data}")
        except:
            print("❌ Response no es JSON válido")
    else:
        print(f"❌ Error HTTP: {response.status_code}")
        
except Exception as e:
    print(f"💥 Error: {e}")

print("\n" + "="*60)

# Test 2: Get Conversations with Hooker Account
print("📤 PRUEBA 2: Obtener Conversaciones...")
conversations_request = {
    "account_id": int(HOOKER_ACCOUNT_ID),
    "op": "conversations",
    "op1": "get"
}

headers_with_key = {
    'Content-Type': 'application/json',
    'User-Agent': 'mobile-app',
    'X-ACCESS-TOKEN': HOOKER_KEY  # Using the Key as token
}

try:
    response = requests.post(API_URL, json=conversations_request, headers=headers_with_key)
    print(f"📊 Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            if data and data.get('status') == 'OK':
                print("✅ Conversaciones obtenidas exitosamente!")
                conversations = data.get('data', [])
                print(f"📱 Número de conversaciones: {len(conversations)}")
                for i, conv in enumerate(conversations[:3]):  # Show first 3
                    print(f"   {i+1}. Contact: {conv.get('contact_name', 'N/A')} - Last: {conv.get('last_message', 'N/A')}")
            else:
                print(f"❌ Error en conversaciones: {data}")
        except:
            print("❌ Response no es JSON válido")
    else:
        print(f"❌ Error HTTP: {response.status_code}")
        
except Exception as e:
    print(f"💥 Error: {e}")

print("\n" + "="*60)

# Test 3: Get User Info
print("📤 PRUEBA 3: Obtener Información del Usuario...")
user_request = {
    "account_id": int(HOOKER_ACCOUNT_ID),
    "op": "users",
    "op1": "info"
}

try:
    response = requests.post(API_URL, json=user_request, headers=headers_with_key)
    print(f"📊 Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            if data and data.get('status') == 'OK':
                print("✅ Información de usuario obtenida!")
                user_data = data.get('data', {})
                print(f"👤 User ID: {user_data.get('id', 'N/A')}")
                print(f"📧 Email: {user_data.get('email', 'N/A')}")
                print(f"📛 Name: {user_data.get('name', 'N/A')}")
            else:
                print(f"❌ Error en user info: {data}")
        except:
            print("❌ Response no es JSON válido")
    else:
        print(f"❌ Error HTTP: {response.status_code}")
        
except Exception as e:
    print(f"💥 Error: {e}")

print("\n" + "="*60)
print("🔍 RESUMEN:")
print(f"✅ Account ID: {HOOKER_ACCOUNT_ID}")
print(f"🔑 Key (posible USER_TOKEN): {HOOKER_KEY}")
print("💡 Si estas pruebas funcionan, actualiza tu .env con estos valores") 