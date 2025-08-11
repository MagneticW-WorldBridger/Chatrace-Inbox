#!/usr/bin/env python3
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API configuration
API_URL = os.getenv('API_URL')
API_TOKEN = os.getenv('API_TOKEN')

print("💾 GUARDANDO RESPUESTA DEL ENDPOINT QUE FUNCIONA")
print("=" * 60)
print(f"🌐 API URL: {API_URL}")
print(f"🔑 API Token: {API_TOKEN[:10]}...")
print()

# Get Whitelabel Info (the working endpoint)
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
    print(f"📄 Content-Type: {response.headers.get('content-type', 'N/A')}")
    print(f"📄 Content-Length: {len(response.text)}")
    
    # Save the response to a file
    with open('whitelabel_response.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    print("✅ Respuesta guardada en 'whitelabel_response.html'")
    
    # Also try to parse as JSON and save as JSON
    try:
        data = response.json()
        with open('whitelabel_response.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("✅ JSON guardado en 'whitelabel_response.json'")
        
        # Print key info
        if data and data.get('status') == 'OK':
            whitelabel_data = data.get('data', {})
            print("\n📋 INFORMACIÓN DEL WHITELABEL:")
            print(f"🏢 ID: {whitelabel_data.get('id', 'N/A')}")
            print(f"📛 Name: {whitelabel_data.get('name', 'N/A')}")
            print(f"🌐 Domain: {whitelabel_data.get('appdomain', 'N/A')}")
            print(f"🔗 WebSocket: {whitelabel_data.get('wsurl', 'N/A')}")
            print(f"🔗 Google Client: {whitelabel_data.get('google', {}).get('client', 'N/A')}")
            
    except json.JSONDecodeError:
        print("❌ Response no es JSON válido, guardado como HTML")
        
except Exception as e:
    print(f"💥 Error: {e}")

print("\n" + "="*60)
print("📁 Archivos creados:")
print("   - whitelabel_response.html")
print("   - whitelabel_response.json (si es JSON válido)") 