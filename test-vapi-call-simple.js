import fetch from 'node-fetch';

console.log('🚀 Script iniciado...');

// Configuración
const VAPI_API_KEY = '8a374da5-433c-44c5-87a6-62699c12abfc'; // Tu PRIVATE KEY del .env
const ASSISTANT_ID = '24479071-79c7-4f24-a903-58ab2619ef4e';
const PHONE_NUMBER_ID = 'b8e1bcf7-630b-43dd-8558-5fbc6bbca10e'; // Sports Clips Main
const TO_NUMBER = '+13323339453';

console.log('📋 Configuración cargada');

async function makeTestCall() {
  try {
    console.log('🚀 Iniciando llamada de prueba...');
    console.log('📱 Assistant ID:', ASSISTANT_ID);
    console.log('📞 Phone Number ID:', PHONE_NUMBER_ID);
    console.log('👤 To:', TO_NUMBER);
    
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
    
    // Hacer la llamada usando la API key directamente
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`
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
    throw error;
  }
}

console.log('🔧 Función makeTestCall definida');

// Ejecutar directamente
console.log('🎯 Ejecutando makeTestCall...');
makeTestCall().catch(console.error);

export { makeTestCall };
