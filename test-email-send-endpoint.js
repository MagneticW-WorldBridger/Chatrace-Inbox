import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

console.log('📧 TESTING EMAIL SEND ENDPOINT');
console.log('='.repeat(70));

const test = async () => {
  const response = await fetch('http://localhost:3001/api/inbox/conversations/test-123/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ACCESS-TOKEN': process.env.USER_TOKEN
    },
    body: JSON.stringify({
      message: 'Test email from ChatRace unified inbox',
      sendAsEmail: true,
      fromEmail: 'jlasse@aiprlassist.com',
      recipientEmail: 'jean.ps3.ufo@gmail.com',
      emailSubject: '🔥 Test from ChatRace Inbox'
    })
  });
  
  const result = await response.json();
  console.log('Response:', result);
  
  if (result.status === 'OK') {
    console.log('✅ EMAIL SENT!');
    console.log(`   Message ID: ${result.messageId}`);
  } else {
    console.log('❌ FAILED:', result.message);
  }
};

test().catch(console.error);
