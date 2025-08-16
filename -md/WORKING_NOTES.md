### Working Notes — Inbox Integration

Environment variables required
- API_URL: Chatrace API base (`https://app.aiprlassist.com/php/user`)
- BUSINESS_ID: e.g. `1145545`
- USER_TOKEN: Logged user token (JWT) for `X-ACCESS-TOKEN`
- API_TOKEN: Whitelabel token for `op=wt` when needed

Local endpoints
- GET `/healthz` → ok
- GET `/api/inbox/conversations?platform=webchat|instagram|facebook&limit=N` → maps to `op=conversations/get`
- GET `/api/inbox/conversations/:id/messages?limit=N` → maps to `op=conversations/get` with `id`
- POST `/api/inbox/conversations/:id/send` → supports text, flow, step, products
- POST `/api/inbox/conversations/:id/update` → supports `assign|archived|followup|read|live-chat`
  - read: `{ timestamp: <unix> }` or `0` for unread
  - live-chat: `{ enabled: 1|0 }`
- POST `/api/chatrace` → generic proxy to API_URL, token strategy:
  - whitelabel (`op=wt|whitelabel`): prefer API_TOKEN
  - others: prefer incoming header/body token → USER_TOKEN → API_TOKEN
- POST `/api/proxy` → alias for `/api/chatrace`
- POST `/api/test-auth` → returns `{ status: 'OK', token, demoMode: false }` using USER_TOKEN
- POST `/api/demo-data` → serves `working_conversations.json`, `working_messages.json`, or simple profile
- POST `/api/request-otp` → `login/email/sendOTP`
- POST `/api/validate-otp` → `login/email/validateOTP`

Frontend (src/App.jsx)
- Conversations: POST `/api/proxy` `{ op:'conversations', op1:'get', account_id }`
- Messages: POST `/api/proxy` `{ op:'conversations', op1:'get', id, account_id, offset, limit, expand }`
- Profile: POST `/api/proxy` `{ op:'users', op1:'get', ms_id, account_id }`

Dev server
- Vite proxy updated to port 3001 for `/api` and `/ws`

Manual test snippets
```
curl -s "http://localhost:3001/healthz"
curl -s -X POST http://localhost:3001/api/chatrace -H 'Content-Type: application/json' -H "X-ACCESS-TOKEN: $USER_TOKEN" -d '{"op":"wt","op1":"get"}'
curl -s -X POST http://localhost:3001/api/chatrace -H 'Content-Type: application/json' -H "X-ACCESS-TOKEN: $USER_TOKEN" -d '{"op":"conversations","op1":"get","account_id":"'$BUSINESS_ID'","limit":2}'
```

Open items
- WebSocket server for live updates is not implemented; current SSE is heartbeat only
- Consider adding endpoints for notes and saved replies if needed by UI


