/**
 * 📧 GMAIL SERVICE - Send emails on behalf of clients
 * 
 * Uses stored OAuth tokens to send emails via Gmail API
 */

import { google } from 'googleapis';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Get Gmail client for a user
 */
async function getGmailClient(businessId, userEmail) {
  const result = await pool.query(
    'SELECT access_token, refresh_token, expires_at FROM google_oauth_tokens WHERE business_id = $1 AND user_email = $2',
    [businessId, userEmail]
  );
  
  if (!result.rows[0]) throw new Error('No OAuth tokens found');
  
  const { access_token, refresh_token, expires_at } = result.rows[0];
  
  // Check if token expired
  if (new Date(expires_at) < new Date()) {
    if (!refresh_token) throw new Error('Token expired and no refresh token');
    
    // Refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({ refresh_token });
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update DB
    await pool.query(
      'UPDATE google_oauth_tokens SET access_token = $1, expires_at = $2, updated_at = NOW() WHERE business_id = $3 AND user_email = $4',
      [credentials.access_token, new Date(credentials.expiry_date), businessId, userEmail]
    );
    
    oauth2Client.setCredentials(credentials);
    return google.gmail({ version: 'v1', auth: oauth2Client });
  }
  
  // Token still valid
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token, refresh_token });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Send email
 */
export async function sendEmail({ businessId, fromEmail, to, subject, body, html }) {
  const gmail = await getGmailClient(businessId, fromEmail);
  
  const emailContent = html ? 
    [
      'Content-Type: text/html; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `Subject: ${subject}\n\n`,
      html
    ].join('') :
    [
      'Content-Type: text/plain; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `Subject: ${subject}\n\n`,
      body
    ].join('');

  const encoded = Buffer.from(emailContent)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded }
  });

  return { messageId: res.data.id, threadId: res.data.threadId };
}

/**
 * Send email with attachment
 */
export async function sendEmailWithAttachment({ businessId, fromEmail, to, subject, body, attachments }) {
  const gmail = await getGmailClient(businessId, fromEmail);
  
  const boundary = 'boundary_chatrace_' + Date.now();
  let email = [
    'MIME-Version: 1.0\n',
    `To: ${to}\n`,
    `Subject: ${subject}\n`,
    `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`,
    `--${boundary}\n`,
    'Content-Type: text/plain; charset="UTF-8"\n\n',
    body + '\n\n'
  ].join('');

  // Add attachments
  for (const att of attachments) {
    email += `--${boundary}\n`;
    email += `Content-Type: ${att.mimeType}\n`;
    email += `Content-Disposition: attachment; filename="${att.filename}"\n`;
    email += 'Content-Transfer-Encoding: base64\n\n';
    email += att.data + '\n\n';
  }

  email += `--${boundary}--`;

  const encoded = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded }
  });

  return { messageId: res.data.id, threadId: res.data.threadId };
}

export default { sendEmail, sendEmailWithAttachment };



