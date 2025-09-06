const { VapiClient } = require('@vapi-ai/server-sdk');

// Configuración
const VAPI_API_KEY = process.env.VAPI_API_KEY || 'your-api-key-here';
const PHONE_NUMBER_ID = 'b8e1bcf7-630b-43dd-8558-5fbc6bbca10e';
const ASSISTANT_ID = '24479071-79c7-4f24-a903-58ab2619ef4e';
const TO_NUMBER = '+13323339453';

async function makeTestCall() {
  try {
    console.log('🚀 Iniciando llamada de prueba VAPI...');
    
    const client = new VapiClient({ token: VAPI_API_KEY });
    
    const call = await client.call.create({
      phoneNumberId: PHONE_NUMBER_ID,
      customer: {
        number: TO_NUMBER,
        name: 'Test User'
      },
      assistantId: ASSISTANT_ID,
      metadata: {
        test: true,
        conversation_id: 'test-123',
        user: 'coinops',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('✅ Llamada iniciada exitosamente!');
    console.log('📱 Call ID:', call.id);
    console.log('📞 Status:', call.status);
    console.log('👤 To:', TO_NUMBER);
    console.log('🤖 Assistant:', ASSISTANT_ID);
    
    // Guardar el call ID para referencia
    console.log('\n💾 Guarda este Call ID para verificar los webhooks:');
    console.log('Call ID:', call.id);
    
  } catch (error) {
    console.error('❌ Error al crear la llamada:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  makeTestCall();
}

module.exports = { makeTestCall };
