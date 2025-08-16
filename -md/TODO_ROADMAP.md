### Inbox TODO / Roadmap

Must-have (wired now)
- Align React → server → Chatrace calls (done)
- Vite proxy to 3001 (done)
- Auth helper and demo data endpoints (done)
- Conversation update payloads aligned with Postman (read uses timestamp, live-chat uses enabled) (done)

Next
- Implement notes: add/update/delete → `/api/inbox/notes/*` → proxy to `conversations/notes/*`
- Implement tags/custom-fields set/remove for contact management flows
- Add flows/products lists pass-through in UI if needed
- Improve messages mapping for attachments and structured payloads
- Add WebSocket server to broadcast new messages to connected clients

Nice-to-have
- Token rotation and multi-account switching UI
- Error boundary + retry/backoff on upstream errors
- Basic metrics endpoint `/health` with upstream ping time


