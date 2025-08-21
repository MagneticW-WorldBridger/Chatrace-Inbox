import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import cookieParser from 'cookie-parser';
import Busboy from 'busboy';
import FormData from 'form-data';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.disable('x-powered-by');
app.use((_, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); next(); });
// Minimal security headers
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Minimal CORS (optional via env)
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || '';
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-ACCESS-TOKEN, Authorization, X-REQUEST-ID');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Basic request-id and logging
app.use((req, res, next) => {
  const rid = req.headers['x-request-id'] || Math.random().toString(36).slice(2);
  res.setHeader('x-request-id', String(rid));
  req._rid = rid;
  next();
});

// Simple auth gate for mutating endpoints
function requireAuth(req, res, next) {
  const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
  const cookieToken = req.cookies?.user_token;
  const token = headerToken || cookieToken || null;
  if (!token) {
    return res.status(401).json({ status: 'ERROR', message: 'Missing authentication token' });
  }
  next();
}

// Basic health endpoints
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// Serve static admin inbox file
app.get('/admin-inbox-v2.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin-inbox-v2.html'));
});

// Resolve account_id from request (query > cookie > env)
function resolveAccountId(req, payload) {
  if (payload && payload.account_id) return payload.account_id;
  if (req?.query?.account_id) return req.query.account_id;
  if (req?.cookies?.account_id) return req.cookies.account_id;
  return process.env.BUSINESS_ID;
}

// Helper to call upstream API
async function callUpstream(payload, tokenOverride, req) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error('Missing API_URL');

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'mobile-app',
    'X-ACCESS-TOKEN': tokenOverride || (req && (req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, '')))) || process.env.USER_TOKEN || process.env.API_TOKEN || '',
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return response;
}

// SSE clients registry and broadcaster
const sseClients = new Set();
function broadcastEvent(event) {
  const payload = `data: ${JSON.stringify({ ...event, t: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch (_) { /* ignore */ }
  }
}

// Simple validators
function ensureArray(val) { return Array.isArray(val) ? val : []; }
function isNonEmptyString(s) { return typeof s === 'string' && s.trim().length > 0; }

// Very light rate limiter (per IP)
const rateWindowMs = Number(process.env.RATE_WINDOW_MS || 60000);
const rateMax = Number(process.env.RATE_MAX || 600);
const ipHits = new Map();
function rateLimit(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const rec = ipHits.get(ip) || { t: now, n: 0 };
    if (now - rec.t > rateWindowMs) { rec.t = now; rec.n = 0; }
    rec.n += 1; ipHits.set(ip, rec);
    if (rec.n > rateMax) return res.status(429).json({ status: 'ERROR', message: 'Too many requests' });
  } catch {}
  next();
}

// Inbox API: Get conversations
app.get('/api/inbox/conversations', async (req, res) => {
  try {
    const platform = String(req.query.platform || 'webchat');
    const limit = Math.max(1, Math.min(500, Number(req.query.limit || 25)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    const channelMap = {
      webchat: '9',
      facebook: '0',
      instagram: '10', // original inbox.js uses 10 for Instagram
    };
    const filterChannel = channelMap[platform] || null;

    const upstream = await callUpstream({
      op: 'conversations',
      op1: 'get',
      account_id: resolveAccountId(req),
      offset,
      limit,
    }, undefined, req);

    const data = await upstream.json().catch(() => null);
    if (data && data.status === 'OK' && Array.isArray(data.data)) {
      const base = data.data
        .filter(row => (filterChannel ? String(row.channel) === filterChannel : true))
        .slice(0, limit);

      const mapped = base.map((row, idx) => {
        const conversationId = String(row.ms_id || row.id || idx + 1);
        const displayName = String(row.full_name || `Guest ${idx + 1}`);
        const avatarUrl = row.profile_pic || '';
        return {
          conversation_id: conversationId,
          display_name: displayName,
          username: displayName,
          user_identifier: conversationId,
          avatar_url: avatarUrl,
          last_message_at: row.timestamp || null,
          last_message_content: row.last_msg || '',
          _platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        };
      });
      return res.json({ status: 'success', data: mapped });
    }
    return res.json({ status: 'success', data: [] });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Inbox API: Get messages for a conversation
app.get('/api/inbox/conversations/:id/messages', async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const limit = Math.max(1, Math.min(1000, Number(req.query.limit || 200)));

    const upstream = await callUpstream({
      op: 'conversations',
      op1: 'get',
      id: conversationId,
      account_id: resolveAccountId(req),
      offset: 0,
      limit: Math.min(limit, 100),
      expand: { comments: {}, refs: {}, appointments: {} },
    }, undefined, req);

    const data = await upstream.json().catch(() => null);
    if (data && data.status === 'OK' && Array.isArray(data.data)) {
      const mapped = data.data
        .map(row => {
          const parts = [];
          try {
            const arr = JSON.parse(row.message || '[]');
            for (const item of arr) {
              if (item.type === 'typing') continue;
              if (typeof item.text === 'string' && item.text.trim().length > 0) {
                parts.push(item.text);
              } else if (item.attachment && item.attachment.payload) {
                const element = item.attachment.payload.elements?.[0];
                const url = element?.url || item.attachment.payload.url;
                if (url) parts.push(`[media] ${url}`);
              }
            }
          } catch {
            if (row.message) parts.push(String(row.message));
          }
          const content = parts.join('\n').trim();
          return {
            message_created_at: Number(row.timestamp || Date.now()),
            message_content: content,
            message_role: (String(row.dir) === '0' ? 'assistant' : 'user'),
            function_execution_status: 'read',
          };
        })
        .filter(m => m.message_content && m.message_content.length > 0);

      if (mapped.length > 0) return res.json({ status: 'success', data: mapped });
    }

    // Fallback: synthesize from conversations list
    try {
      const convRes = await callUpstream({
        op: 'conversations',
        op1: 'get',
        account_id: resolveAccountId(req),
        offset: 0,
        limit: 1000,
      }, undefined, req);
      const convData = await convRes.json().catch(() => null);
      if (convData && convData.status === 'OK' && Array.isArray(convData.data)) {
        const match = convData.data.find(r => String(r.ms_id || r.id || '') === String(conversationId));
        if (match && (match.last_msg || match.timestamp)) {
          return res.json({
            status: 'success',
            data: [
              {
                message_created_at: Number(match.timestamp || Date.now()),
                message_content: String(match.last_msg || ''),
                message_role: 'user',
                function_execution_status: 'read',
              },
            ],
          });
        }
      }
    } catch {}

    return res.json({ status: 'success', data: [] });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Inbox API: Dedup preview (stub)
app.get('/api/inbox/conversations/:id/dedup-preview', async (_req, res) => {
  return res.json({ status: 'success', data: [] });
});

// Inbox API: Link contact (stub)
app.post('/api/inbox/conversations/:id/link-contact', async (req, res) => {
  const { id } = req.params;
  return res.json({ status: 'success', contact_id: id });
});

// Inbox API: Get linked contact (prefer users.get with ms_id)
app.get('/api/inbox/conversations/:id/contact', async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    // Try users.get first (ms_id), fallback to contacts.get
    let data = null;
    try {
      const up1 = await callUpstream({ op: 'users', op1: 'get', account_id: resolveAccountId(req), ms_id: conversationId }, undefined, req);
      data = await up1.json().catch(() => null);
      if (!(data && data.status === 'OK' && data.data)) {
        const up2 = await callUpstream({ op: 'contacts', op1: 'get', account_id: resolveAccountId(req), contact_id: conversationId }, undefined, req);
        data = await up2.json().catch(() => null);
      }
    } catch {}

    if (data && data.status === 'OK' && data.data) {
      const u = data.data;
      return res.json({
        status: 'success',
        contact: {
          contact_id: String(u.id || u.ms_id || conversationId),
          full_name: String(u.full_name || u.name || ''),
          email: u.email || '',
          phone: u.phone || '',
          city: u.city || '',
          state: u.state || '',
          country: u.country || ''
        },
      });
    }
    return res.json({ status: 'success', contact: null });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Inbox API: SSE stream (heartbeat stub)
app.get('/api/inbox/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'hello', t: Date.now() })}\n\n`);
  sseClients.add(res);

  const interval = setInterval(() => {
    try { res.write(`data: ${JSON.stringify({ type: 'heartbeat', t: Date.now() })}\n\n`); } catch (_) {}
  }, 15000);

  req.on('close', () => {
    clearInterval(interval);
    sseClients.delete(res);
  });
});

// Inbox API: Send message/flow/step/products to a conversation
app.post('/api/inbox/conversations/:id/send', rateLimit, requireAuth, async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};

    const accountId = resolveAccountId(req);
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    const tokenToUse = headerToken || body.user_token || process.env.USER_TOKEN || process.env.API_TOKEN || '';

    // Supported payloads:
    // 1) Text message: { message, channel? }
    // 2) Flow: { flow_id, contact_id, channel }
    // 3) Step: { step_id, contact_id, channel }
    // 4) Products: { product_ids: [], contact_id, channel }

    let upstreamPayload = null;

    // Basic validation
    const validChannels = new Set([0, 9, 10]);
    const ch = Number(body.channel);
    if (!validChannels.has(ch)) {
      return res.status(400).json({ status: 'error', message: 'Invalid channel. Use 0 (facebook), 9 (webchat), or 10 (instagram).' });
    }

    if (body && typeof body.flow_id !== 'undefined') {
      // Send a flow
      upstreamPayload = {
        account_id: accountId,
        op: 'conversations',
        op1: 'send',
        op2: 'flow',
        id: body.flow_id,
        contact_id: body.contact_id || conversationId,
        channel: body.channel,
      };
    } else if (body && typeof body.step_id !== 'undefined') {
      // Send a single step
      upstreamPayload = {
        account_id: accountId,
        op: 'conversations',
        op1: 'send',
        op2: 'step',
        id: body.step_id,
        contact_id: body.contact_id || conversationId,
        channel: body.channel,
      };
    } else if (body && (Array.isArray(body.product_ids) || typeof body.product_ids !== 'undefined')) {
      // Send products
      const list = Array.isArray(body.product_ids) ? body.product_ids : [body.product_ids].filter(Boolean);
      upstreamPayload = {
        account_id: accountId,
        op: 'conversations',
        op1: 'send',
        op2: 'products',
        product_ids: list,
        contact_id: body.contact_id || conversationId,
        channel: body.channel,
      };
    } else if (body && typeof body.message === 'string' && body.message.trim().length > 0) {
      // Plain text message (best-effort). Some APIs use op: message/send, others conversations/send
      // Try message/send first
      upstreamPayload = {
        account_id: accountId,
        op: 'message',
        op1: 'send',
        id: conversationId,
        channel: body.channel,
        message: body.message,
      };
    } else {
      return res.status(400).json({ status: 'error', message: 'Missing payload. Provide one of: message | flow_id | step_id | product_ids' });
    }

    const upstreamRes = await callUpstream(upstreamPayload, tokenToUse, req);
    const text = await upstreamRes.text();
    try {
      const json = JSON.parse(text);
      // If plain message failed, try fallback to conversations/send message
      if ((upstreamPayload.op === 'message') && json && json.status && json.status !== 'OK') {
        const fallback = {
          account_id: accountId,
          op: 'conversations',
          op1: 'send',
          op2: 'message',
          id: conversationId,
          contact_id: body.contact_id || conversationId,
          channel: body.channel,
          message: body.message,
        };
        const fbRes = await callUpstream(fallback, tokenToUse, req);
        const fbText = await fbRes.text();
        try {
          const fbJson = JSON.parse(fbText);
          return res.status(200).json(fbJson);
        } catch {
          res.setHeader('Content-Type', 'text/plain');
          return res.status(200).send(fbText);
        }
      }
      // Broadcast event on success
      if (json && json.status === 'OK') {
        broadcastEvent({ type: 'message_sent', conversation_id: conversationId, channel: ch });
      }
      return res.status(200).json(json);
    } catch {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(text);
    }
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Inbox API: Update conversation state (assign, archived, followup, read, live-chat)
app.post('/api/inbox/conversations/:id/update', rateLimit, requireAuth, async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};

    const accountId = resolveAccountId(req);
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    const tokenToUse = headerToken || body.user_token || process.env.USER_TOKEN || process.env.API_TOKEN || '';

    // Accept both `action` and explicit op/op1/op2 (fallback to direct call if provided)
    if (body.op && body.op1) {
      const upstreamRes = await callUpstream({ ...body, account_id: body.account_id || accountId }, tokenToUse, req);
      const text = await upstreamRes.text();
      try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
    }

    const action = String(body.action || '').toLowerCase();
    if (!action) {
      return res.status(400).json({ status: 'error', message: 'Missing action. Supported: assign | archived | followup | read | live_chat' });
    }

    let op2 = null;
    let data = {};
    switch (action) {
      case 'assign':
        op2 = 'assign';
        data = { fb_id: body.fb_id ?? 0 };
        break;
      case 'archived':
        op2 = 'archived';
        data = { value: body.value ? 1 : 0 };
        break;
      case 'followup':
        op2 = 'followup';
        data = { value: body.value ? 1 : 0 };
        break;
      case 'read':
        op2 = 'read';
        // Postman expects timestamp (read) or 0 to mark unread
        if (typeof body.timestamp !== 'undefined') {
          data = { timestamp: Number(body.timestamp) || 0 };
        } else {
          data = { timestamp: body.value ? Math.floor(Date.now() / 1000) : 0 };
        }
        break;
      case 'live_chat':
      case 'live-chat':
        op2 = 'live-chat';
        // Postman expects { enabled: 1|0 }
        data = { enabled: body.value ? 1 : 0 };
        break;
      case 'blocked':
        op2 = 'blocked';
        data = { value: body.value ? 1 : 0 };
        break;
      default:
        return res.status(400).json({ status: 'error', message: `Unsupported action: ${action}` });
    }

    const upstreamPayload = {
      account_id: accountId,
      op: 'conversations',
      op1: 'update',
      op2,
      contact_id: body.contact_id || conversationId,
      data,
    };

    const upstreamRes = await callUpstream(upstreamPayload, tokenToUse, req);
    const text = await upstreamRes.text();
    try {
      const json = JSON.parse(text);
      if (json && json.status === 'OK') {
        broadcastEvent({ type: 'conversation_updated', conversation_id: conversationId, action, op2 });
      }
      return res.status(200).json(json);
    } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Generic proxy route to mirror Postman collection usage
app.post('/api/chatrace', async (req, res) => {
  try {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return res.status(500).json({ status: 'error', message: 'Missing API_URL' });

    const body = typeof req.body === 'object' && req.body ? { ...req.body } : {};
    if (!body.account_id) body.account_id = resolveAccountId(req, body);

    // Determine token: whitelabel ops use API_TOKEN; others use incoming or USER_TOKEN
    const isWhitelabel = (body.op === 'wt' || body.op === 'whitelabel');
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    const incomingToken = headerToken || body.user_token || body.token;
    const tokenToUse = isWhitelabel ? (process.env.API_TOKEN || incomingToken) : (incomingToken || process.env.USER_TOKEN || process.env.API_TOKEN);

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'mobile-app',
      'X-PLATFORM': req.headers['x-platform'] || 'web',
      'X-ACCESS-TOKEN': tokenToUse || '',
    };

    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Stream back raw body if not JSON
    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      // Non-JSON allowed by tests (they treat non-JSON as success sometimes)
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(text);
    }
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Alias to match React usage and external tools expecting /api/proxy
app.post('/api/proxy', async (req, res) => {
  // Delegate to /api/chatrace logic
  req.url = '/api/chatrace';
  return app._router.handle(req, res, () => {});
});

// Simple auth helper: returns configured USER_TOKEN so UI can proceed
app.post('/api/test-auth', async (_req, res) => {
  try {
    const token = process.env.USER_TOKEN || process.env.API_TOKEN || '';
    if (!token) return res.status(200).json({ status: 'ERROR', message: 'Missing USER_TOKEN' });
    const accountId = process.env.BUSINESS_ID || null;
    if (accountId) {
      res.cookie('account_id', String(accountId), { httpOnly: false, sameSite: 'lax', maxAge: 31536000000 });
    }
    return res.status(200).json({ status: 'OK', token, account_id: accountId, demoMode: false });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Demo data provider using local JSON fixtures
app.post('/api/demo-data', async (req, res) => {
  try {
    const type = (req.body && req.body.type) || '';
    if (type === 'conversations') {
      const raw = fs.readFileSync(path.join(__dirname, 'working_conversations.json'), 'utf-8');
      const json = JSON.parse(raw);
      return res.status(200).json({ status: 'OK', data: json });
    }
    if (type === 'messages') {
      const raw = fs.readFileSync(path.join(__dirname, 'working_messages.json'), 'utf-8');
      const json = JSON.parse(raw);
      return res.status(200).json({ status: 'OK', data: json });
    }
    if (type === 'profile') {
      return res.status(200).json({ status: 'OK', data: { name: 'Demo User', email: '', phone: '', location: '' } });
    }
    return res.status(400).json({ status: 'ERROR', message: 'Unknown demo data type' });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Request OTP via Chatrace (login/email/sendOTP)
app.post('/api/request-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim();
    if (!email) return res.status(400).json({ status: 'ERROR', message: 'Missing email' });
    const upstream = await callUpstream({ op: 'login', op1: 'email', op2: 'sendOTP', data: { email } });
    const json = await upstream.json().catch(() => null);
    if (json) return res.status(200).json(json);
    const text = await upstream.text();
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(text);
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Validate OTP via Chatrace (login/email/validateOTP)
app.post('/api/validate-otp', async (req, res) => {
  try {
    const rid = String(req.body?.rid || '').trim();
    const code = String(req.body?.otp || req.body?.code || '').trim();
    if (!rid || !code) return res.status(400).json({ status: 'ERROR', message: 'Missing rid or code' });
    const upstream = await callUpstream({ op: 'login', op1: 'email', op2: 'validateOTP', rid, data: { code } });
    const json = await upstream.json().catch(() => null);
    if (json) {
      try {
        const token = json?.data?.token || json?.token || null;
        const accountId = json?.data?.account_id || json?.account_id || json?.data?.business_id || null;
        if (token) res.cookie('user_token', String(token), { httpOnly: false, sameSite: 'lax', maxAge: 31536000000 });
        if (accountId) res.cookie('account_id', String(accountId), { httpOnly: false, sameSite: 'lax', maxAge: 31536000000 });
      } catch {}
      return res.status(200).json(json);
    }
    const text = await upstream.text();
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(text);
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Placeholder Google login handler to allow UI flow; prefer direct OTP or manual token
app.post('/api/google-login', async (_req, res) => {
  return res.status(200).json({ status: 'ERROR', message: 'Google login via code not implemented in server. Use OTP flow or test-auth.' });
});

// ===== Additional first-class endpoints for full Postman coverage =====

// Lists
app.get('/api/inbox/admins', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'admins', op1: 'get', account_id: resolveAccountId(req), basic_info: true }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/teams', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'inbox_team', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/flows', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'flows', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/flows/:id/steps', async (req, res) => {
  try {
    const flowID = String(req.params.id);
    const upstream = await callUpstream({ op: 'flows', op1: 'get', account_id: resolveAccountId(req), steps: true, data: { flowID } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/products', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'products', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/tags', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'tags', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/sequences', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'sequences', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Custom fields (account-level)
app.get('/api/inbox/custom-fields', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'custom-fields', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/custom-fields', async (req, res) => {
  try {
    const { name, type } = req.body || {};
    const upstream = await callUpstream({ op: 'custom-fields', op1: 'add', account_id: resolveAccountId(req), name, type }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Saved replies
app.get('/api/inbox/saved-replies', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/saved-replies', async (req, res) => {
  try {
    const { shortcode, value } = req.body || {};
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'add', account_id: resolveAccountId(req), data: { shortcode, value } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.put('/api/inbox/saved-replies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { shortcode, value } = req.body || {};
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'update', account_id: resolveAccountId(req), data: { id, shortcode, value } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.delete('/api/inbox/saved-replies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'delete', account_id: resolveAccountId(req), id }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Notes
app.post('/api/inbox/conversations/:id/notes', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const { text } = req.body || {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ status: 'ERROR', message: 'Note text is required' });
    }
    const upstream = await callUpstream({ op: 'conversations', op1: 'notes', op2: 'add', account_id: resolveAccountId(req), contact_id, data: { text } }, undefined, req);
    const responseText = await upstream.text();
    try {
      const json = JSON.parse(responseText);
      if (json && json.status === 'OK') broadcastEvent({ type: 'note_added', conversation_id: contact_id });
      return res.status(200).json(json);
    } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(responseText); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.put('/api/inbox/conversations/:id/notes/:noteId', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const noteId = String(req.params.noteId);
    const { text } = req.body || {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ status: 'ERROR', message: 'Note text is required' });
    }
    const upstream = await callUpstream({ op: 'conversations', op1: 'notes', op2: 'update', account_id: resolveAccountId(req), contact_id, id: noteId, data: { text } }, undefined, req);
    const responseText = await upstream.text();
    try { const json = JSON.parse(responseText); if (json && json.status === 'OK') broadcastEvent({ type: 'note_updated', conversation_id: contact_id, note_id: noteId }); return res.status(200).json(json); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(responseText); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.delete('/api/inbox/conversations/:id/notes/:noteId', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const noteId = String(req.params.noteId);
    const upstream = await callUpstream({ op: 'conversations', op1: 'notes', op2: 'delete', account_id: resolveAccountId(req), contact_id, id: noteId }, undefined, req);
    const responseText = await upstream.text();
    try { const json = JSON.parse(responseText); if (json && json.status === 'OK') broadcastEvent({ type: 'note_deleted', conversation_id: contact_id, note_id: noteId }); return res.status(200).json(json); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(responseText); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Users: tags/custom-fields
app.post('/api/inbox/users/:ms_id/custom-field/set', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.ms_id);
    const { field_id, field_type, value } = req.body || {};
    const upstream = await callUpstream({ op: 'users', op1: 'custom-field', op2: 'set', account_id: resolveAccountId(req), contact_id, field_id, field_type, value }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/users/:ms_id/custom-field/delete', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.ms_id);
    const { field_id, field_type } = req.body || {};
    const upstream = await callUpstream({ op: 'users', op1: 'custom-field', op2: 'delete', account_id: resolveAccountId(req), contact_id, field_id, field_type }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/users/:ms_id/tags/remove', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.ms_id);
    const { tags } = req.body || {};
    const upstream = await callUpstream({ op: 'users', op1: 'update', op2: 'remove-tag', account_id: resolveAccountId(req), contact_id, tags }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Calendars & Appointments
app.get('/api/inbox/calendars', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'calendars', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/appointments', async (req, res) => {
  try {
    const calendarID = req.query.calendarID ?? null;
    const upstream = await callUpstream({ op: 'calendars', op1: 'appointments', op2: 'get', account_id: resolveAccountId(req), calendarID }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/appointments/:id/cancel', rateLimit, requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const upstream = await callUpstream({ op: 'calendars', op1: 'appointments', op2: 'changeStatus', account_id: resolveAccountId(req), id, status: -1 }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.delete('/api/inbox/appointments/:id', rateLimit, requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const upstream = await callUpstream({ op: 'calendars', op1: 'appointments', op2: 'delete', account_id: resolveAccountId(req), id }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Ecommerce orders
app.get('/api/inbox/orders', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'ecommerce', op1: 'orders', op2: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/orders/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const upstream = await callUpstream({ op: 'ecommerce', op1: 'orders', op2: 'get', account_id: resolveAccountId(req), id }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/orders/:id/status', rateLimit, requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const statusCode = Number(req.body?.status ?? 4);
    const upstream = await callUpstream({ op: 'ecommerce', op1: 'orders', op2: 'update', account_id: resolveAccountId(req), id, data: { status: statusCode } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Firebase Cloud Messaging device registration
app.post('/api/inbox/firebase/device', rateLimit, requireAuth, async (req, res) => {
  try {
    const { firebaseToken, platform, brand, model } = req.body || {};
    const upstream = await callUpstream({ op: 'firebaseCM', op1: 'device', op2: 'add', account_id: resolveAccountId(req), data: { firebaseToken, platform, brand, model } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Google Business Messages: locations
app.get('/api/inbox/googlebm/locations', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'googleBM', op1: 'location', op2: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// OTN lists
app.get('/api/inbox/otn', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'otn', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// AI reply suggestion
app.post('/api/inbox/conversations/:id/ai-suggestion', async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const prompt = req.body?.prompt ?? null;
    const upstream = await callUpstream({ op: 'conversations', op1: 'AI-reply-suggestion', account_id: resolveAccountId(req), contact_id, data: { prompt } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Session helper: return current resolved account_id
app.get('/api/session/account', async (req, res) => {
  try {
    return res.status(200).json({ status: 'OK', account_id: resolveAccountId(req) });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Upload file (multipart)
app.post('/api/inbox/upload', rateLimit, requireAuth, (req, res) => {
  try {
    const bb = new Busboy({ headers: req.headers });
    let jsonParam = null;
    let fileBuffer = null;
    let fileName = 'upload.bin';

    bb.on('field', (name, val) => {
      if (name === 'param') jsonParam = val;
    });

    bb.on('file', (_name, file, filename) => {
      fileName = filename || fileName;
      const chunks = [];
      file.on('data', d => chunks.push(d));
      file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    bb.on('finish', async () => {
      try {
        const apiUrl = process.env.API_URL;
        if (!apiUrl) return res.status(500).json({ status: 'error', message: 'Missing API_URL' });
        const tokenToUse = req.headers['x-access-token'] || process.env.USER_TOKEN || process.env.API_TOKEN || '';

        const form = new FormData();
        if (jsonParam) form.append('param', jsonParam);
        if (fileBuffer) form.append('file', fileBuffer, { filename: fileName });

        const upstream = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'X-ACCESS-TOKEN': tokenToUse, 'User-Agent': 'mobile-app', ...form.getHeaders() },
          body: form,
        });
        const text = await upstream.text();
        try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
      } catch (e) {
        return res.status(200).json({ status: 'error', message: e.message });
      }
    });

    req.pipe(bb);
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  try {
    res.clearCookie('account_id');
    res.clearCookie('user_token');
  } catch {}
  return res.status(200).json({ status: 'OK' });
});

// VAPI Webhook endpoint - receives call events
app.post('/webhook/vapi', (req, res) => {
  console.log('🔔 VAPI Webhook received:', JSON.stringify(req.body, null, 2));
  
  const { type, call, assistant, timestamp } = req.body;
  
  // Log the event type and key data
  console.log(`📞 Event: ${type}`);
  if (call) {
    console.log(`📱 Call ID: ${call.id}`);
    console.log(`📱 Call Status: ${call.status}`);
    if (call.customer) {
      console.log(`👤 Customer: ${call.customer.number} (${call.customer.name || 'Unknown'})`);
    }
  }
  
  // Handle different event types
  switch (type) {
    case 'call-started':
      console.log('✅ Call started successfully');
      break;
    case 'call-ended':
      console.log('🛑 Call ended');
      if (call.transcript) {
        console.log('📝 Transcript:', call.transcript);
      }
      if (call.recordingUrl) {
        console.log('🎵 Recording URL:', call.recordingUrl);
      }
      if (call.summary) {
        console.log('📋 Summary:', call.summary);
      }
      // TODO: Save to database here
      break;
    case 'transcript':
      console.log('📝 Transcript update:', req.body.transcript);
      break;
    case 'function-call':
      console.log('⚡ Function call:', req.body.functionCall);
      break;
    default:
      console.log('ℹ️ Other event type:', type);
  }
  
  res.status(200).json({ status: 'received' });
});

