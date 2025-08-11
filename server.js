import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

// Basic health endpoints
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// Serve static admin inbox file
app.get('/admin-inbox-v2.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin-inbox-v2.html'));
});

// Helper to call upstream API
async function callUpstream(payload, tokenOverride) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error('Missing API_URL');

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'mobile-app',
    'X-ACCESS-TOKEN': tokenOverride || process.env.USER_TOKEN || process.env.API_TOKEN || '',
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return response;
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
      account_id: process.env.BUSINESS_ID,
      offset: 0,
      limit,
    });

    const data = await upstream.json().catch(() => null);
    if (data && data.status === 'OK' && Array.isArray(data.data)) {
      const base = data.data
        .filter(row => (filterChannel ? String(row.channel) === filterChannel : true))
        .slice(offset, offset + limit);

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
    const limit = Math.max(1, Math.min(200, Number(req.query.limit || 200)));

    const upstream = await callUpstream({
      op: 'conversations',
      op1: 'get',
      id: conversationId,
      account_id: process.env.BUSINESS_ID,
      offset: 0,
      limit: Math.min(limit, 50),
      expand: { comments: {}, refs: {}, appointments: {} },
    });

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
        account_id: process.env.BUSINESS_ID,
        offset: 0,
        limit: 1000,
      });
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

// Inbox API: Get linked contact (basic via contacts.get)
app.get('/api/inbox/conversations/:id/contact', async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const upstream = await callUpstream({
      op: 'contacts',
      op1: 'get',
      account_id: process.env.BUSINESS_ID,
      contact_id: conversationId,
    });
    const data = await upstream.json().catch(() => null);
    if (data && data.status === 'OK' && data.data) {
      return res.json({
        status: 'success',
        contact: {
          contact_id: String(data.data.id || conversationId),
          full_name: String(data.data.name || data.data.full_name || ''),
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
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', t: Date.now() })}\n\n`);
  }, 15000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Inbox API: Send message/flow/step/products to a conversation
app.post('/api/inbox/conversations/:id/send', async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};

    const accountId = process.env.BUSINESS_ID;
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    const tokenToUse = headerToken || body.user_token || process.env.USER_TOKEN || process.env.API_TOKEN || '';

    // Supported payloads:
    // 1) Text message: { message, channel? }
    // 2) Flow: { flow_id, contact_id, channel }
    // 3) Step: { step_id, contact_id, channel }
    // 4) Products: { product_ids: [], contact_id, channel }

    let upstreamPayload = null;

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
      upstreamPayload = {
        account_id: accountId,
        op: 'conversations',
        op1: 'send',
        op2: 'products',
        product_ids: Array.isArray(body.product_ids) ? body.product_ids : body.product_ids,
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

    const upstreamRes = await callUpstream(upstreamPayload, tokenToUse);
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
        const fbRes = await callUpstream(fallback, tokenToUse);
        const fbText = await fbRes.text();
        try {
          const fbJson = JSON.parse(fbText);
          return res.status(200).json(fbJson);
        } catch {
          res.setHeader('Content-Type', 'text/plain');
          return res.status(200).send(fbText);
        }
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
app.post('/api/inbox/conversations/:id/update', async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};

    const accountId = process.env.BUSINESS_ID;
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    const tokenToUse = headerToken || body.user_token || process.env.USER_TOKEN || process.env.API_TOKEN || '';

    // Accept both `action` and explicit op/op1/op2 (fallback to direct call if provided)
    if (body.op && body.op1) {
      const upstreamRes = await callUpstream({ ...body, account_id: body.account_id || accountId }, tokenToUse);
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
        data = { value: body.value ? 1 : 0 };
        break;
      case 'live_chat':
      case 'live-chat':
        op2 = 'live-chat';
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

    const upstreamRes = await callUpstream(upstreamPayload, tokenToUse);
    const text = await upstreamRes.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
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
    if (!body.account_id && process.env.BUSINESS_ID) body.account_id = process.env.BUSINESS_ID;

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


