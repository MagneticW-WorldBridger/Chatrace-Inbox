import { VapiClient } from '@vapi-ai/server-sdk';

console.log('🚀 Script iniciado con SDK oficial...');

// Configuración
const VAPI_API_KEY = '5438********************************'; // Tu API key del CLI
const ASSISTANT_ID = '24479071-79c7-4f24-a903-58ab2619ef4e';
const PHONE_NUMBER_ID = 'b8e1bcf7-630b-43dd-8558-5fbc6bbca10e'; // Sports Clips Main
const TO_NUMBER = '+13323339453';

console.log('📋 Configuración cargada');

async function makeTestCall() {
  try {
    console.log('🚀 Iniciando llamada de prueba con SDK...');
    console.log('📱 Assistant ID:', ASSISTANT_ID);
    console.log('📞 Phone Number ID:', PHONE_NUMBER_ID);
    console.log('👤 To:', TO_NUMBER);
    
    // Usar el SDK oficial
    const client = new VapiClient({ token: VAPI_API_KEY });
    
    console.log('🔧 Cliente VAPI creado');
    
    const call = await client.call.create({
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
    });
    
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

