import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

console.log('🚀 Script iniciado...');

// Configuración desde .env
const VAPI_PRIVATE_KEY = '8a374da5-433c-44c5-87a6-62699c12abfc';
const ORG_ID = '5334cc89-ebcc-425c-8a33-3c5a818e196a';
const ASSISTANT_ID = '24479071-79c7-4f24-a903-58ab2619ef4e';
const PHONE_NUMBER_ID = 'b8e1bcf7-630b-43dd-8558-5fbc6bbca10e'; // Sports Clips Main
const TO_NUMBER = '+13323339453';

console.log('📋 Configuración cargada');

// Generar JWT token
function generateJWT() {
  const payload = {
    orgId: ORG_ID,
    scope: 'public'
  };
  
  const token = jwt.sign(payload, VAPI_PRIVATE_KEY, {
    algorithm: 'HS256',
    expiresIn: '1h'
  });
  
  return token;
}

async function makeTestCall() {
  try {
    console.log('🚀 Iniciando llamada de prueba...');
    console.log('📱 Assistant ID:', ASSISTANT_ID);
    console.log('📞 Phone Number ID:', PHONE_NUMBER_ID);
    console.log('👤 To:', TO_NUMBER);
    
    // Generar JWT token
    const jwtToken = generateJWT();
    console.log('🔑 JWT Token generado');
    
    const requestBody = {
      phoneNumberId: PHONE_NUMBER_ID,
      customer: {
        number: TO_NUMBER,
        name: 'Coinops Test'
      },
      assistantId: ASSISTANT_ID,
      metadata: {
        test: true,
        conversation_id: 'test-123',
        user: 'coinops',
        source: 'inbox-test'
      }
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    // Hacer la llamada usando la API directa
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const call = await response.json();
    
    console.log('✅ Llamada iniciada exitosamente!');
    console.log('📱 Call ID:', call.id);
    console.log('📞 Status:', call.status);
    console.log('👤 Customer:', call.customer);
    
    // Guardar el call ID para tracking
    console.log('\n💾 Guarda este Call ID para ver los webhooks:');
    console.log('Call ID:', call.id);
    
    return call;
    
  } catch (error) {
    console.error('❌ Error al hacer la llamada:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

console.log('🔧 Función makeTestCall definida');

// Ejecutar directamente
console.log('🎯 Ejecutando makeTestCall...');
makeTestCall().catch(console.error);

export { makeTestCall };
