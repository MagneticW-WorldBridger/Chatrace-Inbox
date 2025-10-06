#!/usr/bin/env node
/**
 * 🚀 GOOGLE OAUTH AUTO TESTER
 * 
 * Este script:
 * 1. Levanta un servidor en localhost:3000
 * 2. Abre el navegador automáticamente
 * 3. Captura el código de autorización
 * 4. Intercambia por tokens
 * 5. Te muestra qué scopes tienes
 */

import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import { exec } from 'child_process';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const PORT = 3000;

console.log('🚀 GOOGLE OAUTH AUTO TESTER - TESTING YOUR EXISTING APP');
console.log('='.repeat(70));
console.log(`📱 Client ID: ${CLIENT_ID}`);
console.log(`🔐 Client Secret: ${CLIENT_SECRET ? '✅ Configured' : '❌ NOT CONFIGURED'}`);
console.log(`🔄 Redirect URI: ${REDIRECT_URI}`);
console.log('='.repeat(70));

// Scopes que queremos probar
const SCOPES = [
  'openid',
  'email', 
  'profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
];

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

console.log('\n📋 SCOPES TO TEST:');
SCOPES.forEach((scope, i) => {
  console.log(`   ${i + 1}. ${scope}`);
});

// Generar URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('\n🌐 AUTHORIZATION URL:');
console.log(authUrl);

// Crear servidor para capturar el código
const server = http.createServer(async (req, res) => {
  if (req.url.indexOf('/oauth2callback') > -1) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const code = url.searchParams.get('code');
    
    if (code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: monospace; padding: 40px; background: #1a1a1a; color: #00ff00;">
            <h1>✅ AUTHORIZATION SUCCESSFUL!</h1>
            <p>Code received. Processing...</p>
            <p>You can close this window now.</p>
          </body>
        </html>
      `);
      
      console.log('\n✅ CODE RECEIVED! Processing...');
      
      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        console.log('\n🎉 TOKENS OBTAINED!');
        console.log('='.repeat(70));
        console.log('📋 ACCESS TOKEN:', tokens.access_token ? '✅ Received' : '❌ Not received');
        console.log('🔄 REFRESH TOKEN:', tokens.refresh_token ? '✅ Received' : '❌ Not received');
        console.log('⏰ EXPIRES:', tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'N/A');
        console.log('🎯 SCOPES:', tokens.scope || 'Not specified');
        console.log('='.repeat(70));
        
        if (tokens.scope) {
          const authorizedScopes = tokens.scope.split(' ');
          
          console.log('\n✅ AUTHORIZED SCOPES:');
          authorizedScopes.forEach(scope => {
            console.log(`   ✓ ${scope}`);
          });
          
          console.log('\n❌ NOT AUTHORIZED:');
          const notAuthorized = SCOPES.filter(s => !authorizedScopes.includes(s));
          if (notAuthorized.length === 0) {
            console.log('   🎉 ALL SCOPES AUTHORIZED!');
          } else {
            notAuthorized.forEach(scope => {
              console.log(`   ✗ ${scope}`);
            });
          }
          
          const hasGmailSend = authorizedScopes.some(s => 
            s.includes('gmail.send') || s.includes('mail.google.com')
          );
          
          console.log('\n📧 GMAIL PERMISSIONS:');
          if (hasGmailSend) {
            console.log('   ✅ HAS GMAIL SEND PERMISSIONS!');
          } else {
            console.log('   ❌ NO GMAIL SEND PERMISSIONS');
            console.log('   💡 You need to:');
            console.log('      1. Go to Google Cloud Console');
            console.log('      2. Enable Gmail API');
            console.log('      3. Add gmail.send scope to your app');
          }
        }
        
        // Guardar tokens en archivo para uso futuro
        const fs = await import('fs');
        fs.writeFileSync('.google-tokens.json', JSON.stringify(tokens, null, 2));
        console.log('\n💾 Tokens saved to .google-tokens.json');
        
      } catch (error) {
        console.error('\n❌ ERROR EXCHANGING TOKEN:');
        console.error(error.message);
      }
      
      console.log('\n' + '='.repeat(70));
      console.log('🎯 TEST COMPLETE');
      console.log('='.repeat(70));
      
      server.close();
      process.exit(0);
    } else {
      res.writeHead(400);
      res.end('No code found in callback');
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n🌐 Server listening on http://localhost:${PORT}`);
  console.log('\n📱 Opening browser...');
  
  // Abrir navegador automáticamente
  const openCommand = process.platform === 'darwin' ? 'open' : 
                     process.platform === 'win32' ? 'start' : 'xdg-open';
  
  exec(`${openCommand} "${authUrl}"`, (error) => {
    if (error) {
      console.log('\n⚠️  Could not open browser automatically');
      console.log('Please open this URL manually:');
      console.log(authUrl);
    }
  });
  
  console.log('\n⏳ Waiting for authorization...');
  console.log('   If browser did not open, copy the URL above and paste it in your browser');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  server.close();
  process.exit(0);
});






