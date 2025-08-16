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
