#!/usr/bin/env node
/**
 * 🔍 GOOGLE APP CONFIG CHECKER
 * Revisa qué redirect URIs están configurados
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

console.log('🔍 CHECKING GOOGLE APP CONFIGURATION');
console.log('='.repeat(70));
console.log(`📱 Client ID: ${CLIENT_ID}`);
console.log('='.repeat(70));

// Intentar obtener la configuración del discovery document
const discoveryUrl = 'https://accounts.google.com/.well-known/openid-configuration';

https.get(discoveryUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const config = JSON.parse(data);
    console.log('\n✅ GOOGLE OPENID CONFIGURATION:');
    console.log(`   Authorization endpoint: ${config.authorization_endpoint}`);
    console.log(`   Token endpoint: ${config.token_endpoint}`);
    console.log(`   Userinfo endpoint: ${config.userinfo_endpoint}`);
    console.log('\n💡 REDIRECT URIs QUE DEBERÍAS CONFIGURAR EN GOOGLE CONSOLE:');
    console.log('   1. http://localhost:3000/oauth2callback');
    console.log('   2. http://localhost:3001/oauth2callback');
    console.log('   3. http://localhost:5173/oauth2callback');
    console.log('   4. http://127.0.0.1:3000/oauth2callback');
    console.log('\n🌐 PARA PRODUCCIÓN:');
    console.log('   - https://tudominio.com/oauth2callback');
    console.log('   - https://tu-app.railway.app/oauth2callback');
    
    console.log('\n📝 CÓMO AGREGAR REDIRECT URIs:');
    console.log('   1. Ve a: https://console.cloud.google.com/apis/credentials');
    console.log(`   2. Busca: ${CLIENT_ID}`);
    console.log('   3. Click en "EDIT"');
    console.log('   4. En "Authorized redirect URIs" agrega las URIs de arriba');
    console.log('   5. Guarda cambios');
    console.log('\n⚠️  IMPORTANTE: Los cambios pueden tardar unos minutos en aplicarse');
    console.log('='.repeat(70));
  });
}).on('error', (e) => {
  console.error('❌ Error:', e.message);
});






