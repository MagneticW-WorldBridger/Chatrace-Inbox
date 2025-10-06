#!/usr/bin/env node
/**
 * 📧 GMAIL SEND TEST
 * 
 * Prueba enviar un email usando los tokens que acabas de obtener
 */

import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

console.log('📧 GMAIL SEND TEST');
console.log('='.repeat(70));

// Leer tokens guardados
let tokens;
try {
  tokens = JSON.parse(fs.readFileSync('.google-tokens.json', 'utf8'));
  console.log('✅ Tokens loaded from .google-tokens.json');
  console.log(`   Access Token: ${tokens.access_token.substring(0, 30)}...`);
  console.log(`   Refresh Token: ${tokens.refresh_token ? '✅ Available' : '❌ Not available'}`);
} catch (error) {
  console.error('❌ Could not read .google-tokens.json');
  console.error('   Run: node test-google-oauth-auto.js first');
  process.exit(1);
}

// Configurar OAuth2 client
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials(tokens);

// Crear Gmail API client
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

console.log('\n📝 EMAIL TEST');
console.log('='.repeat(70));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('📧 Enter recipient email (or press Enter to send to yourself): ', async (to) => {
  
  // Si no proporciona email, usar el del token
  const recipientEmail = to.trim() || 'jlasse@aiprlassist.com';
  
  console.log(`\n📤 Sending test email to: ${recipientEmail}`);
  console.log('⏳ Please wait...\n');
  
  // Crear email en formato RFC 2822
  const subject = '🔥 Test Email from ChatRace Inbox';
  const body = `
¡Órale compa!

Este es un email de prueba enviado desde tu ChatRace Inbox app usando Gmail API.

✅ Tu Google OAuth está funcionando perfectamente
✅ Tienes permisos para enviar emails
✅ Los tokens están guardados y funcionando

Scopes autorizados:
${tokens.scope.split(' ').map(s => `  - ${s}`).join('\n')}

¡Ya puedes enviar emails como Penny Mustard! 🎉

--
Enviado con Gmail API
${new Date().toLocaleString()}
`;

  const email = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    'MIME-Version: 1.0\n',
    'Content-Transfer-Encoding: 7bit\n',
    `To: ${recipientEmail}\n`,
    `Subject: ${subject}\n\n`,
    body
  ].join('');

  // Codificar en base64url
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`📧 Message ID: ${res.data.id}`);
    console.log(`📬 Thread ID: ${res.data.threadId}`);
    console.log(`👤 To: ${recipientEmail}`);
    console.log(`📝 Subject: ${subject}`);
    console.log('='.repeat(70));
    
    console.log('\n🎉 PRUEBA EXITOSA!');
    console.log('\n💡 SIGUIENTE PASO:');
    console.log('   Ahora puedes usar estos tokens para enviar emails como Penny Mustard');
    console.log('   Los tokens están en .google-tokens.json');
    console.log('\n🔐 IMPORTANTE:');
    console.log('   - El refresh_token te permite renovar el access_token cuando expire');
    console.log('   - Guarda el refresh_token de forma segura');
    console.log('   - NUNCA lo commitees a git (.google-tokens.json ya está en .gitignore)');
    
  } catch (error) {
    console.error('\n❌ ERROR SENDING EMAIL:');
    console.error(`   Status: ${error.code || 'Unknown'}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code === 401) {
      console.error('\n💡 Token expired or invalid. Run: node test-google-oauth-auto.js again');
    } else if (error.code === 403) {
      console.error('\n💡 Permission denied. Make sure Gmail API is enabled in Google Cloud Console');
      console.error('   Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com');
    }
    
    if (error.errors) {
      console.error('\n📋 Detailed errors:');
      error.errors.forEach(err => {
        console.error(`   - ${err.message}`);
      });
    }
  }
  
  rl.close();
});

