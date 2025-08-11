#!/usr/bin/env python3
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Account Data
ACCOUNT_ID = "1022121"
HOOKER_KEY = "QyqSaysVzL9sdJQ8nlo1"
API_TOKEN = os.getenv('API_TOKEN')
API_URL = os.getenv('API_URL')

print("🔐 PROBANDO DIFERENTES COMBINACIONES DE TOKENS")
print("=" * 60)
print(f"🏢 Account ID: {ACCOUNT_ID}")
print(f"🔑 Hooker Key: {HOOKER_KEY}")
print(f"🔑 API Token: {API_TOKEN[:10]}...")
print()

# Test different header combinations
test_cases = [
    {
        "name": "Hooker Key como X-ACCESS-TOKEN",
        "headers": {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app',
            'X-ACCESS-TOKEN': HOOKER_KEY
        }
    },
    {
        "name": "API Token como X-ACCESS-TOKEN",
        "headers": {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app',
            'X-ACCESS-TOKEN': API_TOKEN
        }
    },
    {
        "name": "Sin X-ACCESS-TOKEN",
        "headers": {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app'
        }
    },
    {
        "name": "Hooker Key como Authorization Bearer",
        "headers": {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app',
            'Authorization': f'Bearer {HOOKER_KEY}'
        }
    },
    {
        "name": "API Token como Authorization Bearer",
        "headers": {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app',
            'Authorization': f'Bearer {API_TOKEN}'
        }
    }
]

# Test conversations endpoint with different combinations
for i, test_case in enumerate(test_cases, 1):
    print(f"\n📤 PRUEBA {i}: {test_case['name']}")
    print("-" * 40)
    
    request_data = {
        "account_id": int(ACCOUNT_ID),
        "op": "conversations",
        "op1": "get"
    }
    
    try:
        response = requests.post(API_URL, json=request_data, headers=test_case['headers'])
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.text}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data and data.get('status') == 'OK':
                    print("✅ ¡FUNCIONÓ! Conversaciones obtenidas")
                    conversations = data.get('data', [])
                    print(f"📱 Número de conversaciones: {len(conversations)}")
                else:
                    print(f"❌ Error: {data}")
            except:
                print("❌ Response no es JSON válido")
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            
    except Exception as e:
        print(f"💥 Error: {e}")

print("\n" + "="*60)
print("🔍 PRÓXIMOS PASOS:")
print("1. Si ninguna combinación funciona, necesitamos el USER_TOKEN correcto")
print("2. El USER_TOKEN se obtiene después del login exitoso")
print("3. Necesitamos hacer login con las credenciales correctas")
print("4. O Antonio debe proporcionar el USER_TOKEN directamente") 