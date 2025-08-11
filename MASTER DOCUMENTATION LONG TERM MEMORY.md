# MASTER DOCUMENTATION — LONG TERM MEMORY

This document tracks a 1:1 mapping from the ChatRace Postman collection operations to our local inbox server implementation, plus next steps.

Environment assumptions:
- Required: API_URL, BUSINESS_ID, USER_TOKEN (JWT), optional API_TOKEN
- Admin UI page: /admin-inbox-v2.html
- API base (local): /api/inbox/* and /api/chatrace

Server health:
- GET /healthz → ok

Implemented endpoints used by Admin Inbox
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

Postman collection coverage (op/op1/op2)
- conversations/get — Implemented (list)
- conversations/get (id) — Implemented (messages)
- conversations/send/flow — Implemented
- conversations/send/step — Implemented
- conversations/send/products — Implemented
- message/send — Implemented (best-effort)
- users/get — Implemented (basic contact)
- wt/get — Via proxy
- admins/get — Not implemented (use proxy)
- inbox_team/get — Not implemented
- flows/get — Not implemented (use proxy)
- products/get — Not implemented (use proxy)
- ecommerce/orders/get — Not implemented
- ecommerce/orders/update — Not implemented
- sequences/get — Not implemented
- tags/get — Not implemented
- inbox_saved_reply/get — Not implemented
- inbox_saved_reply/add — Not implemented
- inbox_saved_reply/update — Not implemented
- inbox_saved_reply/delete — Not implemented
- custom-fields/get — Not implemented
- custom-fields/add — Not implemented
- users/custom-field/set — Not implemented
- users/custom-field/delete — Not implemented
- users/update/remove-tag — Not implemented
- conversations/update/assign — Not implemented
- conversations/update/archived — Not implemented
- conversations/update/followup — Not implemented
- conversations/update/read — Not implemented
- conversations/update/live-chat — Not implemented
- conversations/notes/add — Not implemented
- conversations/notes/update — Not implemented
- conversations/notes/delete — Not implemented
- conversations/AI-reply-suggestion — Not implemented
- calendars/get — Not implemented
- calendars/appointments/get — Not implemented
- calendars/appointments/changeStatus — Not implemented
- calendars/appointments/delete — Not implemented
- login/email/sendOTP — Not implemented
- login/email/validateOTP — Not implemented
- login/authentication/validate (Google/Microsoft/Apple/Facebook) — Not implemented
- logout — Not implemented
- firebaseCM/device/add — Not implemented
- googleBM/location/get — Not implemented
- otn/get — Not implemented

Notes
- admin-inbox-v2.html currently simulates an AI reply for UX (“Great question…”). Real AI reply API is not wired.
- Instagram channel mapping is 10; Facebook 0; Webchat 9.
- Token strategy: prefer header X-ACCESS-TOKEN; otherwise USER_TOKEN; whitelabel prefers API_TOKEN.

Next priorities
1) Implement conversations update actions (assign, archived, followup, read, live-chat)
2) Implement notes add/update/delete
3) Implement tags and custom-fields (get/set/remove)
4) Implement flows/products lists
5) Implement login/OTP if needed for multi-user session management

Testing cheatsheet
- Health: curl localhost:PORT/healthz
- List: curl "/api/inbox/conversations?platform=webchat&limit=5"
- Messages: curl "/api/inbox/conversations/{id}/messages?limit=50"
- Send text: POST "/api/inbox/conversations/{id}/send" { message, channel }
- Proxy: POST "/api/chatrace" { op, op1, ... }
