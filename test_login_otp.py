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

print("🔐 PROBANDO LOGIN CON OTP")
print("=" * 50)
print(f"📧 Email: jlasse@aiprlassist.com")
print(f"🌐 API URL: {API_URL}")
print(f"🔑 API Token: {API_TOKEN[:10]}...")
print()

# Step 1: Request OTP
print("📤 PASO 1: Solicitando OTP...")
otp_request = {
    "op": "login",
    "op1": "email", 
    "op2": "requestOTP",
    "data": {
        "email": "jlasse@aiprlassist.com"
    }
}

headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'mobile-app'
}

try:
    response = requests.post(API_URL, json=otp_request, headers=headers)
    print(f"📊 Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'OK':
            print("✅ OTP enviado exitosamente!")
            print(f"🔑 Request ID: {data.get('data', {}).get('rid', 'No encontrado')}")
            
            # Ask user for OTP
            print("\n" + "="*50)
            otp_code = input("📱 Ingresa el código OTP que recibiste: ")
            
            # Step 2: Validate OTP
            print("\n📤 PASO 2: Validando OTP...")
            validate_request = {
                "op": "login",
                "op1": "email",
                "op2": "validateOTP", 
                "rid": data.get('data', {}).get('rid'),
                "data": {
                    "code": otp_code
                }
            }
            
            validate_response = requests.post(API_URL, json=validate_request, headers=headers)
            print(f"📊 Status Code: {validate_response.status_code}")
            print(f"📄 Response: {validate_response.text}")
            
            if validate_response.status_code == 200:
                validate_data = validate_response.json()
                if validate_data.get('status') == 'OK':
                    user_token = validate_data.get('data', {}).get('token')
                    print("🎉 ¡LOGIN EXITOSO!")
                    print(f"🔑 USER TOKEN: {user_token}")
                    print(f"💾 Guarda este token en tu .env como USER_TOKEN")
                else:
                    print(f"❌ Error en validación: {validate_data}")
            else:
                print(f"❌ Error HTTP: {validate_response.status_code}")
                
        else:
            print(f"❌ Error en solicitud OTP: {data}")
    else:
        print(f"❌ Error HTTP: {response.status_code}")
        
except Exception as e:
    print(f"💥 Error: {e}") 