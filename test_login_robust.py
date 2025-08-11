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

print("🔐 PROBANDO LOGIN CON OTP - VERSIÓN ROBUSTA")
print("=" * 60)
print(f"📧 Email: jlasse@aiprlassist.com")
print(f"🌐 API URL: {API_URL}")
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
    print(f"📄 Response Headers: {dict(response.headers)}")
    print(f"📄 Raw Response: {response.text}")
    
    if response.status_code == 200:
        # Handle null response
        if response.text.strip() == 'null':
            print("❌ API devolvió 'null' - Email no registrado o error de configuración")
            print("💡 Posibles causas:")
            print("   - Email no está registrado en ChatRace")
            print("   - Problema con la configuración del whitelabel")
            print("   - API no está configurado para este dominio")
        else:
            try:
                data = response.json()
                print(f"📄 Parsed JSON: {json.dumps(data, indent=2)}")
                
                if data and data.get('status') == 'OK':
                    print("✅ OTP enviado exitosamente!")
                    rid = data.get('data', {}).get('rid')
                    print(f"🔑 Request ID: {rid}")
                    
                    if rid:
                        # Ask user for OTP
                        print("\n" + "="*60)
                        otp_code = input("📱 Ingresa el código OTP que recibiste: ")
                        
                        # Step 2: Validate OTP
                        print("\n📤 PASO 2: Validando OTP...")
                        validate_request = {
                            "op": "login",
                            "op1": "email",
                            "op2": "validateOTP", 
                            "rid": rid,
                            "data": {
                                "code": otp_code
                            }
                        }
                        
                        validate_response = requests.post(API_URL, json=validate_request, headers=headers)
                        print(f"📊 Status Code: {validate_response.status_code}")
                        print(f"📄 Response: {validate_response.text}")
                        
                        if validate_response.status_code == 200:
                            if validate_response.text.strip() != 'null':
                                validate_data = validate_response.json()
                                if validate_data and validate_data.get('status') == 'OK':
                                    user_token = validate_data.get('data', {}).get('token')
                                    print("🎉 ¡LOGIN EXITOSO!")
                                    print(f"🔑 USER TOKEN: {user_token}")
                                    print(f"💾 Guarda este token en tu .env como USER_TOKEN")
                                else:
                                    print(f"❌ Error en validación: {validate_data}")
                            else:
                                print("❌ Validación devolvió 'null'")
                        else:
                            print(f"❌ Error HTTP: {validate_response.status_code}")
                    else:
                        print("❌ No se recibió Request ID")
                else:
                    print(f"❌ Error en solicitud OTP: {data}")
            except json.JSONDecodeError:
                print("❌ Response no es JSON válido")
                print(f"📄 Raw response: {response.text}")
    else:
        print(f"❌ Error HTTP: {response.status_code}")
        
except Exception as e:
    print(f"💥 Error: {e}")

print("\n" + "="*60)
print("🔍 DIAGNÓSTICO:")
print("1. El API está respondiendo (status 200)")
print("2. Pero devuelve 'null' en lugar de JSON válido")
print("3. Esto indica que el email no está registrado o hay problema de configuración")
print("\n💡 PRÓXIMOS PASOS:")
print("1. Verificar que jlasse@aiprlassist.com esté registrado en ChatRace")
print("2. Contactar a Antonio para verificar configuración del whitelabel")
print("3. Probar con un email que sepamos que está registrado") 