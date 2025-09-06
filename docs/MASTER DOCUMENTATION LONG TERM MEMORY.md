# MASTER DOCUMENTATION — LONG TERM MEMORY

This document tracks a 1:1 mapping from the ChatRace Postman collection operations to our local inbox server implementation, plus next steps.

Environment assumptions:
- Required: API_URL, BUSINESS_ID, USER_TOKEN (JWT), optional API_TOKEN
- Admin UI page: /admin-inbox-v2.html (Switch Account sets cookie account_id)
- API base (local): /api/inbox/* and /api/chatrace
- Session helpers: /api/test-auth sets cookie account_id when BUSINESS_ID exists; /api/validate-otp sets cookies user_token and account_id when upstream returns them; /api/session/account shows resolved account

Server health:
- GET /healthz → ok

Implemented endpoints used by Admin Inbox (all resolve account_id via cookie/query/body)
- GET /api/inbox/conversations?platform=webchat|instagram|facebook&limit=N
  - Upstream: op=conversations, op1=get, channel mapped (webchat=9, instagram=10, facebook=0)
  - Status: Implemented
- GET /api/inbox/conversations/:id/messages?limit=N
  - Upstream: op=conversations, op1=get, id=:id
  - Status: Implemented
- GET /api/inbox/conversations/:id/dedup-preview
  - Status: Stub (returns empty)
- POST /api/inbox/conversations/:id/link-contact
  - Status: Stub (returns mock contact_id)
- GET /api/inbox/conversations/:id/contact
  - Upstream: op=users, op1=get (via contacts.get fallback)
  - Status: Basic implementation
- GET /api/inbox/stream (SSE)
  - Status: Implemented (heartbeat only)
- POST /api/inbox/conversations/:id/send
  - Upstream variants supported:
    - Text message (best-effort): op=message/op1=send, fallback to conversations/send message
    - Flow: op=conversations/op1=send/op2=flow
    - Step: op=conversations/op1=send/op2=step
    - Products: op=conversations/op1=send/op2=products
  - Status: Implemented (requires USER_TOKEN in header X-ACCESS-TOKEN or env)

Generic proxy
- POST /api/chatrace
  - Forwards body to API_URL with token selection:
    - Whitelabel ops (op=wt|whitelabel) prefer API_TOKEN, fallback to incoming
    - Other ops prefer incoming token, fallback USER_TOKEN, then API_TOKEN
  - Status: Implemented

Postman collection coverage (op/op1/op2) — Implemented unless noted
- conversations/get — Implemented (list)
- conversations/get (id) — Implemented (messages)
- conversations/send/flow — Implemented
- conversations/send/step — Implemented
- conversations/send/products — Implemented
- message/send — Implemented (best-effort)
- users/get — Implemented (basic contact)
- wt/get — Via proxy
- admins/get — Implemented (endpoint dedicated)
- inbox_team/get — Implemented
- flows/get — Implemented
- products/get — Implemented
- ecommerce/orders/get — Implemented
- ecommerce/orders/update — Implemented
- sequences/get — Implemented
- tags/get — Implemented
- inbox_saved_reply/get — Implemented
- inbox_saved_reply/add — Implemented
- inbox_saved_reply/update — Implemented
- inbox_saved_reply/delete — Implemented
- custom-fields/get — Implemented
- custom-fields/add — Implemented
- users/custom-field/set — Implemented
- users/custom-field/delete — Implemented
- users/update/remove-tag — Implemented
- conversations/update/assign — Implemented
- conversations/update/archived — Implemented
- conversations/update/followup — Implemented
- conversations/update/read — Implemented
- conversations/update/live-chat — Implemented
- conversations/notes/add — Implemented
- conversations/notes/update — Implemented
- conversations/notes/delete — Implemented
- conversations/AI-reply-suggestion — Implemented
- calendars/get — Implemented
- calendars/appointments/get — Implemented
- calendars/appointments/changeStatus — Implemented
- calendars/appointments/delete — Implemented
- login/email/sendOTP — Implemented
- login/email/validateOTP — Implemented
- login/authentication/validate (Google/Microsoft/Apple/Facebook) — Not implemented
- logout — Not implemented (clear cookies manually)
- firebaseCM/device/add — Implemented
- googleBM/location/get — Implemented
- otn/get — Implemented

Notes
- admin-inbox-v2.html: typing simulation disabled by default (AppConfig.SIMULATE_TYPING=false)
- Instagram channel mapping is 10; Facebook 0; Webchat 9.
- Token strategy: prefer header X-ACCESS-TOKEN; otherwise USER_TOKEN; whitelabel prefers API_TOKEN.

Next priorities
1) Integrate advanced actions into React UI (Admin already covers)
2) UX/UI polish (layout responsive for filters, navigation, collapsible panels)
3) SSE/WS in React for live updates
4) Trim legacy and consolidate docs

Testing cheatsheet
- Health: curl localhost:PORT/healthz
- List: curl "/api/inbox/conversations?platform=webchat&limit=5"
- Messages: curl "/api/inbox/conversations/{id}/messages?limit=50"
- Send text: POST "/api/inbox/conversations/{id}/send" { message, channel }
- Proxy: POST "/api/chatrace" { op, op1, ... }

## React UI Behavior Map (src/App.jsx)

- Auth
  - Auto-auth on mount: POST `/api/test-auth` once; sets localStorage `userToken`, `demoMode`, cookie `account_id` if server has `BUSINESS_ID`.
  - Entrar al Inbox button: POST `/api/test-auth` (same behavior).

- Account switching
  - Button in sidebar header prompts for `account_id`, sets cookie, reloads with `?account_id=...`.

- Conversations list and filters
  - Platform chips (Webchat/Instagram/Facebook): GET `/api/inbox/conversations?platform={webchat|instagram|facebook}&limit=50`.
  - Counts: additionally GET all three platforms to compute `{webchat, instagram, facebook}` counts.
  - Search: debounced client-side filter by name/email/lastMessage.
  - Quick filters: client-side for `all | unread | priority`.

- Conversation selection
  - On click: loads messages and contact in parallel for the selected id:
    - GET `/api/inbox/conversations/:id/messages?limit=50`
    - GET `/api/inbox/conversations/:id/contact`

- Message composer
  - Send on Enter (no Shift) or Send button.
  - POST `/api/inbox/conversations/:id/send` with headers `X-ACCESS-TOKEN` and body `{ message, channel }`.
  - After send, re-fetches messages.
  - Quick responses simply prefill the composer.

- Conversation actions (Customer info sidebar)
  - Mark Read: POST `/api/inbox/conversations/:id/update` `{ action:'read', timestamp: now }`
  - Mark Unread: POST `/api/inbox/conversations/:id/update` `{ action:'read', timestamp: 0 }`
  - Follow/Unfollow: POST `{ action:'followup', value: 1|0 }`
  - Archive/Unarchive: POST `{ action:'archived', value: 1|0 }`
  - Move to Human/Bot: POST `{ action:'live_chat', value: 1|0 }`
  - Block/Unblock: POST `{ action:'blocked', value: 1|0 }`
  - Assign: prompts `fb_id`, POST `{ action:'assign', fb_id }`
  - Unassign: POST `{ action:'assign', fb_id: 0 }`
  - Notes: add (POST `/notes`), update (PUT `/notes/:noteId`), delete (DELETE `/notes/:noteId`).
  - AI Suggest: POST `/api/inbox/conversations/:id/ai-suggestion` with `{ prompt:null }`; appends suggestion to composer on success.
  - Send Flow/Step/Products: POST `/api/inbox/conversations/:id/send` with `{ flow_id | step_id | product_ids, channel }`.

- Demo mode
  - When `demoMode` true: conversations/messages/profile are served from POST `/api/demo-data` with `{ type: 'conversations' | 'messages' | 'profile' }`.

## Legacy Admin UI Behavior Map (admin-inbox-v2.html)

- Mirrors core inbox flows via the same local API, plus a Control Panel exposing:
  - Admins, Teams, Flows, Steps, Products, Tags, Sequences, Calendars, Appointments, Orders, Saved Replies, GBM Locations, OTN Lists, FCM Device add, Upload.
  - Conversation actions (assign, archived, followup, read, live_chat, blocked) and Notes.
  - SSE wired to `/api/inbox/stream` (server currently emits heartbeat only).

## Known Issues and Proposed Fixes (UI/Server)

1) AI Suggestion response shape mismatch
   - Symptom: Suggestion often not inserted into composer.
   - Root cause: UI expects `data.text` or `text`, but upstream returns `data: [ { text: "..." } ]` (array).
   - Fix: In `src/App.jsx`, parse `Array.isArray(j?.data) ? j.data[0]?.text : (j?.data?.text || j?.text || j?.suggestion || '')`.

2) Wrong channel used when sending from non-webchat platforms
   - Symptom: Sends may fail on Instagram/Facebook when channel hard-coded to 9.
   - Root cause: UI always sends `{ channel: 9 }` regardless of selected platform.
   - Fix: Map platform → channel in UI: `webchat=9, instagram=10, facebook=0` for text/flow/step/products.

3) Contact endpoint may be too limited
   - Current: Server uses `contacts.get` fallback; Postman reference uses `users/get` with `ms_id`.
   - Fix: Switch server to `{ op:'users', op1:'get', ms_id: :id }` and adapt response mapping for `full_name`, email, phone.

4) Randomized conversation props in UI
   - Symptom: Unstable `unreadCount`, `priority`, `status` and misleading filters.
   - Root cause: UI assigns random values during mapping.
   - Fix: Use deterministic defaults or upstream-derived fields; set `unreadCount=0`, `priority='low'`, `status='online'` unless real signals exist.

5) SSE not integrated in React
   - Current: Only legacy admin listens to SSE; server emits heartbeat only.
   - Fix: Add EventSource client in React; in server, later emit conversation update events to drive live refresh.

6) Profile fetch not surfaced
   - Current: UI calls `/contact` but sidebar displays only `currentContact` fields.
   - Fix: Merge fetched `profile` (email/phone/location) into sidebar or defer fetch until needed.

7) Extra list requests for counts
   - Symptom: Platform switch triggers 3 additional list calls.
   - Fix: Compute counts lazily or add a batched counts endpoint.

8) Logout missing
   - Current: Not implemented.
   - Fix: Add client logout action (clear localStorage + cookies) and optional server `/api/logout` to clear cookies.

## Channel Mapping (Authoritative)

- Webchat → 9
- Instagram → 10
- Facebook → 0

Use this mapping consistently for send operations (text/flow/step/products).

## Production Readiness — Assessment

- Current state: robust prototype suitable for internal demos and controlled pilots, not production-ready yet.
- Key gaps to close before production:
  - Authentication/Authorization: real login (OTP/social), token refresh, logout endpoint, RBAC, consistent `X-ACCESS-TOKEN` enforcement.
  - Security: input validation, rate limiting, CORS/Helmet, secret management, dependency scanning.
  - Reliability: retries/backoff, idempotency keys, structured error handling.
  - Realtime: SSE/WS must emit actual events and React must consume them (currently heartbeat only).
  - Data/API: remove placeholders, consistent schemas, server-side pagination/filtering/search.
  - Observability: central logging, metrics, tracing, alerts.
  - Testing: unit/integration/e2e and upstream contract tests, plus load tests.
  - CI/CD: linters, tests, builds on every PR; staging environment; versioned releases.
  - Multi-tenancy & Compliance: account isolation, quotas, billing, PII handling, audit logs, retention, GDPR/CCPA readiness.
  - Performance/UX: code splitting, caching, accessibility, mobile polish, empty/error states.

## Implemented Improvements (this session)

- UI fixes
  - Correct platform→channel mapping for send actions (webchat=9, instagram=10, facebook=0).
  - AI suggestion parsing now supports array form (`data: [{ text }]`).
  - Removed random conversation fields (status/unread/priority) → deterministic defaults.
  - Profile details (email/phone/location) surfaced in the sidebar when available.
  - Added Logout button (clears local storage and cookies client-side).

- Server fixes
  - `/api/inbox/conversations/:id/contact` now prefers `users/get` (ms_id) and falls back to `contacts/get`, returns richer fields.

## Next Actions (Approved)

1) Realtime events (in progress)
   - Server: maintain SSE client registry and broadcast `conversation_updated` payloads on relevant actions (send/update).
   - React: subscribe to SSE, refresh current platform list/messages selectively.

2) Request/response validation
   - Add lightweight schema validation (e.g., zod/joi) for inbound bodies and normalize responses.

3) Auth hardening
   - Enforce token consistently on all routes; add server `/api/logout`; plan refresh-token or re-auth flow; wire OTP and social logins.

4) Observability & errors
   - Centralized error handler, request IDs, structured logs; basic metrics.

5) Testing & CI
   - Add integration tests for all server routes; basic e2e for core inbox flows; wire into CI.
