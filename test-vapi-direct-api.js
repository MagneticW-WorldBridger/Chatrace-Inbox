import fetch from 'node-fetch';

// Configuración desde .env
const VAPI_PRIVATE_KEY = '8a374da5-433c-44c5-87a6-62699c12abfc';
const VAPI_PUBLIC_KEY = '18fc48e4-a0d2-4c54-af1c-140ddfb96b97';
// Key que SÍ funciona en el CLI
const VAPI_CLI_KEY = '5438********************************';
const ASSISTANT_ID = '24479071-79c7-4f24-a903-58ab2619ef4e';
const PHONE_NUMBER_ID = 'b8e1bcf7-630b-43dd-8558-5fbc6bbca10e';
const TO_NUMBER = '+13323339453';

async function testVapiCall(apiKey, keyType) {
  console.log(`\n🔑 PROBANDO CON ${keyType}: ${apiKey}`);
  console.log('=' .repeat(60));
  
  const requestBody = {
    phoneNumberId: PHONE_NUMBER_ID,
    customer: {
      number: TO_NUMBER,
      name: "Coinops Test"
    },
    assistantId: ASSISTANT_ID,
    metadata: {
      test: true,
      keyType: keyType,
      timestamp: new Date().toISOString()
    }
  };

  console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📡 Response status: ${response.status}`);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📡 Response body:', responseText);

    if (response.ok) {
      console.log(`✅ ¡ÉXITO CON ${keyType}!`);
      const callData = JSON.parse(responseText);
      console.log(`📞 Call ID: ${callData.id}`);
      console.log(`📱 Status: ${callData.status}`);
      return { success: true, keyType, callData };
    } else {
      console.log(`❌ ERROR CON ${keyType}: HTTP ${response.status}`);
      console.log(`❌ Error response: ${responseText}`);
      return { success: false, keyType, error: responseText };
    }

  } catch (error) {
    console.log(`❌ EXCEPTION CON ${keyType}:`, error.message);
    return { success: false, keyType, error: error.message };
  }
}

async function main() {
  console.log('🚀 PROBANDO VAPI API DIRECTA - AMBAS KEYS');
  console.log('🎯 Target:', TO_NUMBER);
  console.log('📱 Assistant:', ASSISTANT_ID);
  console.log('📞 Phone Number:', PHONE_NUMBER_ID);
  
  // Probar PRIVATE KEY primero
  const privateResult = await testVapiCall(VAPI_PRIVATE_KEY, 'PRIVATE_KEY');
  
  // Si private key falló, probar PUBLIC KEY
  if (!privateResult.success) {
    console.log('\n🔄 Private key falló, probando Public key...');
    const publicResult = await testVapiCall(VAPI_PUBLIC_KEY, 'PUBLIC_KEY');
    
    if (!publicResult.success) {
      console.log('\n💀 AMBAS KEYS FALLARON');
      console.log('Private key error:', privateResult.error);
      console.log('Public key error:', publicResult.error);
    } else {
      console.log('\n🎉 ¡PUBLIC KEY FUNCIONÓ!');
    }
  } else {
    console.log('\n🎉 ¡PRIVATE KEY FUNCIONÓ!');
  }
}

main().catch(console.error);
