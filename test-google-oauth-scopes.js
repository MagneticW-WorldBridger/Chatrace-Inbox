#!/usr/bin/env node
/**
 * 🔍 GOOGLE OAUTH SCOPE CHECKER
 * 
 * Este script se conecta a tu Google App existente y verifica:
 * 1. Qué scopes están configurados actualmente
 * 2. Si tiene permisos de Gmail
 * 3. Qué tipo de acceso tienes
 */

import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import https from 'https';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

console.log('🔥 GOOGLE OAUTH SCOPE CHECKER - PROBANDO TU APP EXISTENTE');
console.log('=' .repeat(70));
console.log(`📱 Client ID: ${CLIENT_ID}`);
console.log(`🔐 Client Secret: ${CLIENT_SECRET ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
console.log('=' .repeat(70));

// Scopes que queremos probar
const SCOPES_TO_TEST = [
  // Scopes básicos que ya deberías tener
  'openid',
  'email',
  'profile',
  
  // Scopes de Gmail que necesitamos para enviar emails
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://mail.google.com/', // Full Gmail access
];

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

console.log('\n📋 SCOPES QUE VAMOS A PROBAR:');
SCOPES_TO_TEST.forEach((scope, i) => {
  console.log(`   ${i + 1}. ${scope}`);
});

// Generar URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES_TO_TEST,
  prompt: 'consent' // Forzar pantalla de consentimiento para ver todos los scopes
});

console.log('\n🌐 URL DE AUTORIZACIÓN GENERADA:');
console.log('=' .repeat(70));
console.log(authUrl);
console.log('=' .repeat(70));

console.log('\n📝 INSTRUCCIONES:');
console.log('1. Copia la URL de arriba');
console.log('2. Pégala en tu navegador');
console.log('3. Autoriza la app con tu cuenta de Google');
console.log('4. Copia el código de autorización que te dan');
console.log('5. Pégalo aquí abajo');
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Pega el código de autorización aquí: ', async (code) => {
  try {
    console.log('\n⏳ Intercambiando código por tokens...');
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    console.log('\n✅ ¡TOKENS OBTENIDOS!');
    console.log('=' .repeat(70));
    console.log('📋 ACCESS TOKEN:', tokens.access_token ? '✅ Recibido' : '❌ No recibido');
    console.log('🔄 REFRESH TOKEN:', tokens.refresh_token ? '✅ Recibido' : '❌ No recibido');
    console.log('⏰ EXPIRA EN:', tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'N/A');
    console.log('🎯 SCOPES:', tokens.scope || 'No especificado');
    console.log('=' .repeat(70));
    
    // Verificar qué scopes fueron realmente autorizados
    if (tokens.scope) {
      const authorizedScopes = tokens.scope.split(' ');
      
      console.log('\n✅ SCOPES AUTORIZADOS:');
      authorizedScopes.forEach(scope => {
        console.log(`   ✓ ${scope}`);
      });
      
      console.log('\n❌ SCOPES NO AUTORIZADOS:');
      const notAuthorized = SCOPES_TO_TEST.filter(s => !authorizedScopes.includes(s));
      if (notAuthorized.length === 0) {
        console.log('   ¡TODOS LOS SCOPES FUERON AUTORIZADOS! 🎉');
      } else {
        notAuthorized.forEach(scope => {
          console.log(`   ✗ ${scope}`);
        });
      }
      
      // Verificar si tiene permisos de Gmail
      const hasGmailSend = authorizedScopes.some(s => 
        s.includes('gmail.send') || s.includes('mail.google.com')
      );
      
      console.log('\n📧 PERMISOS DE GMAIL:');
      if (hasGmailSend) {
        console.log('   ✅ ¡TIENE PERMISOS PARA ENVIAR EMAILS!');
      } else {
        console.log('   ❌ NO TIENE PERMISOS PARA ENVIAR EMAILS');
        console.log('   💡 Necesitas agregar estos scopes a tu Google Cloud Console:');
        console.log('      - https://www.googleapis.com/auth/gmail.send');
        console.log('      - https://www.googleapis.com/auth/gmail.compose');
      }
    }
    
    // Probar a obtener información del usuario
    console.log('\n👤 PROBANDO ACCESO A USER INFO...');
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    
    https.get(userInfoUrl + '?access_token=' + tokens.access_token, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const userInfo = JSON.parse(data);
          console.log('✅ USER INFO OBTENIDO:');
          console.log('   📧 Email:', userInfo.email);
          console.log('   👤 Nombre:', userInfo.name);
          console.log('   🖼️  Picture:', userInfo.picture);
          console.log('   ✓ Verified:', userInfo.verified_email);
        } catch (e) {
          console.log('❌ Error al parsear user info:', e.message);
        }
        
        console.log('\n' + '=' .repeat(70));
        console.log('🎯 CONCLUSIÓN:');
        console.log('=' .repeat(70));
        console.log('Tu Google App está configurada y funcionando.');
        console.log('Revisa los scopes autorizados arriba para saber qué permisos tienes.');
        console.log('Si no tienes permisos de Gmail, necesitas agregarlos en Google Cloud Console.');
        console.log('=' .repeat(70));
        
        rl.close();
      });
    }).on('error', (e) => {
      console.log('❌ Error al obtener user info:', e.message);
      rl.close();
    });
    
  } catch (error) {
    console.error('\n❌ ERROR AL INTERCAMBIAR TOKEN:');
    console.error(error.message);
    if (error.response) {
      console.error('Respuesta:', error.response.data);
    }
    rl.close();
  }
});

