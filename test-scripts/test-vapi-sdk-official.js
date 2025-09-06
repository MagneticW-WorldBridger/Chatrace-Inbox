import Vapi from '@vapi-ai/server-sdk';

// Configuración
const VAPI_PRIVATE_KEY = '8a374da5-433c-44c5-87a6-62699c12abfc';
const VAPI_PUBLIC_KEY = '18fc48e4-a0d2-4c54-af1c-140ddfb96b97';
const ASSISTANT_ID = '24479071-79c7-4f24-a903-58ab2619ef4e';
const PHONE_NUMBER_ID = 'b8e1bcf7-630b-43dd-8558-5fbc6bbca10e';
const TO_NUMBER = '+13323339453';

async function testWithSDK(apiKey, keyType) {
  console.log(`\n🔑 PROBANDO SDK CON ${keyType}: ${apiKey.substring(0, 8)}...`);
  console.log('=' .repeat(60));
  
  try {
    // Inicializar SDK
    const vapi = new Vapi(apiKey);
    
    console.log('✅ SDK inicializado correctamente');
    
    // Configurar la llamada
    const callConfig = {
      phoneNumberId: PHONE_NUMBER_ID,
      customer: {
        number: TO_NUMBER,
        name: "Coinops Test SDK"
      },
      assistantId: ASSISTANT_ID,
      metadata: {
        test: true,
        keyType: keyType,
        timestamp: new Date().toISOString(),
        method: 'SDK'
      }
    };

    console.log('📤 Call config:', JSON.stringify(callConfig, null, 2));
    
    // Crear la llamada
    console.log('📞 Creando llamada...');
    const call = await vapi.calls.create(callConfig);
    
    console.log(`✅ ¡ÉXITO CON ${keyType} SDK!`);
    console.log(`📞 Call ID: ${call.id}`);
    console.log(`📱 Status: ${call.status}`);
    console.log('📋 Call details:', JSON.stringify(call, null, 2));
    
    return { success: true, keyType, call };
    
  } catch (error) {
    console.log(`❌ ERROR CON ${keyType} SDK:`, error.message);
    console.log('❌ Error details:', error);
    return { success: false, keyType, error: error.message };
  }
}

async function main() {
  console.log('🚀 PROBANDO VAPI SDK OFICIAL - AMBAS KEYS');
  console.log('🎯 Target:', TO_NUMBER);
  console.log('📱 Assistant:', ASSISTANT_ID);
  console.log('📞 Phone Number:', PHONE_NUMBER_ID);
  
  // Probar PRIVATE KEY primero
  const privateResult = await testWithSDK(VAPI_PRIVATE_KEY, 'PRIVATE_KEY');
  
  // Si private key falló, probar PUBLIC KEY
  if (!privateResult.success) {
    console.log('\n🔄 Private key falló, probando Public key...');
    const publicResult = await testWithSDK(VAPI_PUBLIC_KEY, 'PUBLIC_KEY');
    
    if (!publicResult.success) {
      console.log('\n💀 AMBAS KEYS FALLARON CON SDK');
      console.log('Private key error:', privateResult.error);
      console.log('Public key error:', publicResult.error);
      
      console.log('\n💡 NECESITAMOS LA KEY CORRECTA DEL DASHBOARD');
      console.log('Ve a https://dashboard.vapi.ai y copia la API key correcta');
    } else {
      console.log('\n🎉 ¡PUBLIC KEY FUNCIONÓ CON SDK!');
    }
  } else {
    console.log('\n🎉 ¡PRIVATE KEY FUNCIONÓ CON SDK!');
  }
}

main().catch(console.error);

