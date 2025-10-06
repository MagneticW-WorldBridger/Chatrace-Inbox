#!/usr/bin/env node
/**
 * 🧪 TEST GOOGLE OAUTH WITH EXTERNAL EMAIL
 * 
 * Prueba si funciona con un email EXTERNO (no @aiprlassist.com)
 */

import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import { exec } from 'child_process';
import readline from 'readline';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const PORT = 3000;

console.log('🧪 TESTING GOOGLE OAUTH WITH EXTERNAL EMAIL');
console.log('='.repeat(70));
console.log(`📱 Client ID: ${CLIENT_ID}`);
console.log(`🔄 Redirect URI: ${REDIRECT_URI}`);
console.log('='.repeat(70));

// ESTOS son los scopes que ACABAS DE AUTORIZAR
const SCOPES = [
  'openid',
  'email', 
  'profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
];

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

console.log('\n📋 SCOPES THAT WILL BE REQUESTED:');
SCOPES.forEach((scope, i) => {
  console.log(`   ${i + 1}. ${scope}`);
});

console.log('\n⚠️  IMPORTANT:');
console.log('   Use an EXTERNAL email (e.g. jean.ps3.ufo@gmail.com)');
console.log('   NOT an @aiprlassist.com email');
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Press ENTER to start the OAuth flow... ', () => {
  rl.close();
  startOAuthFlow();
});

function startOAuthFlow() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('\n🌐 AUTHORIZATION URL:');
  console.log(authUrl);

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
          
          // Decodificar el ID token para ver el email
          const idToken = tokens.id_token;
          if (idToken) {
            const payload = JSON.parse(
              Buffer.from(idToken.split('.')[1], 'base64').toString()
            );
            
            console.log('\n👤 USER INFO FROM ID TOKEN:');
            console.log(`   📧 Email: ${payload.email}`);
            console.log(`   👤 Name: ${payload.name}`);
            console.log(`   🏢 Domain: ${payload.hd || 'No domain (personal email)'}`);
            console.log(`   ✓ Verified: ${payload.email_verified}`);
            
            if (payload.hd) {
              console.log('\n⚠️  THIS IS AN ORGANIZATION EMAIL (@' + payload.hd + ')');
              console.log('   Gmail API may have restrictions for org emails');
            } else {
              console.log('\n✅ THIS IS A PERSONAL EMAIL');
              console.log('   Should work fine with Gmail API');
            }
          }
          
          if (tokens.scope) {
            const authorizedScopes = tokens.scope.split(' ');
            
            console.log('\n✅ AUTHORIZED SCOPES:');
            authorizedScopes.forEach(scope => {
              console.log(`   ✓ ${scope}`);
            });
            
            const hasGmailSend = authorizedScopes.some(s => 
              s.includes('gmail.send') || s.includes('mail.google.com')
            );
            
            console.log('\n📧 GMAIL PERMISSIONS:');
            if (hasGmailSend) {
              console.log('   ✅ HAS GMAIL SEND PERMISSIONS!');
              console.log('   This email can be used to send emails via Gmail API');
            } else {
              console.log('   ❌ NO GMAIL SEND PERMISSIONS');
            }
          }
          
          // Guardar tokens con el email como identificador
          const fs = await import('fs');
          const tokensWithEmail = {
            ...tokens,
            email: idToken ? JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString()).email : 'unknown'
          };
          fs.writeFileSync('.google-tokens-external.json', JSON.stringify(tokensWithEmail, null, 2));
          console.log('\n💾 Tokens saved to .google-tokens-external.json');
          
        } catch (error) {
          console.error('\n❌ ERROR EXCHANGING TOKEN:');
          console.error(error.message);
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🎯 TEST COMPLETE');
        console.log('='.repeat(70));
        console.log('\n💡 NEXT STEPS:');
        console.log('   1. Check if external email works the same as org email');
        console.log('   2. Test sending email with: node test-gmail-send-external.js');
        console.log('   3. Compare scopes between org and external emails');
        
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
  });

  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down...');
    server.close();
    process.exit(0);
  });
}

