# VISHNU 4-HOUR HACKATHON TASK
## DevOps Engineer Technical Assessment — Chatrace Inbox Project

**Date:** October 6, 2025  
**Duration:** 4 Hours  
**Split:** 80% Coding/Debugging | 20% DevOps/Team Coordination  
**Access:** NO CODEBASE ACCESS - Build from scratch using documentation only

---

## 🎯 MISSION OVERVIEW

You are joining the April Assist team as a Cloud DevOps Engineer. Your first task is to independently build and deploy a **production-grade monitoring and observability infrastructure** for our Unified Inbox system, while coordinating with two developers on specific integration tasks.

**Current State:**
- **Unified Inbox** serving 177+ conversations from 3 sources (ChatRace API, Woodstock Postgres, VAPI webhooks)
- **Backend:** Node.js/Express on port 3001 (Railway deployment)
- **Frontend:** React/Vite on port 5173
- **Databases:** PostgreSQL (Neon) + external Woodstock database
- **Integrations:** Google OAuth, Gmail API, VAPI voice calls, ChatRace messaging platform

**Your Challenge:**
Build a complete DevOps infrastructure that can monitor, trace, and debug this multi-source inbox system WITHOUT access to the existing codebase. You will work from API documentation and environment variables only.

---

## 📋 PART 1: INFRASTRUCTURE & MONITORING (60 minutes) — 30% of task

### **Task 1.1: Environment Setup & Health Monitoring**

**Goal:** Create a standalone monitoring service that tracks the health of all system components.

**Provided Resources:**
```bash
# API Endpoints
API_URL=https://app.aiprlassist.com/php/user
BUSINESS_ID=1145545
USER_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiMTAwMDAyNjc1NyIsImV4cGlyZSI6MTc4NjM3Mjc4OSwicHJvdmlkZXIiOiJnb29nbGUiLCJ3dCI6IjQyMCJ9.J8B9b_A2Fk8Em4F27cUBtVRZ9ZPHb5DO7uZtJ8C2Y6A
API_TOKEN=1281352.DJB0g6DT3PONyWkenC43WIS2aexzXwiaLWnuKiGEF2Rsky

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_Qy8rxk0itEhg@ep-ancient-scene-ad2nguei-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# VAPI Integration
VAPI_PRIVATE_KEY=8a374da5-433c-44c5-87a6-62699c12abfc
VAPI_PUBLIC_KEY=18fc48e4-a0d2-4c54-af1c-140ddfb96b97

# System Endpoints (local development)
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

**Requirements:**
1. **Create a Docker Compose stack** with:
   - Prometheus (metrics collection)
   - Grafana (visualization)
   - Node Exporter (system metrics)
   - Your custom health check service (Node.js/Python)

2. **Build a Health Check Service** that monitors every 30 seconds:
   - ChatRace API availability (`POST https://app.aiprlassist.com/php/user` with `op=wt&op1=get`)
   - Database connection pool status (query count, connection latency)
   - VAPI webhook endpoint readiness
   - Gmail OAuth token expiration tracking

3. **Expose Prometheus metrics** at `/metrics`:
   - `chatrace_api_response_time_ms`
   - `database_connection_pool_size`
   - `database_query_latency_ms`
   - `vapi_webhook_events_total`
   - `gmail_oauth_tokens_expiring_soon` (expires < 7 days)

**Deliverable:**
- `docker-compose.yml` with full monitoring stack
- `health-monitor/` directory with your service code
- Grafana dashboard JSON showing all 5+ metrics
- README with setup instructions

---

## 🔧 PART 2: DATABASE OBSERVABILITY & TESTING (60 minutes) — 30% of task

### **Task 2.1: Database Performance Profiling**

**Context from Interview:**
You mentioned experience with "review how the postgres is used, ensuring the index connectors fails and possible introductions and also for the read replicas or shading as volumes."

**Database Schema (Provided):**
```sql
-- Main tables for unified inbox
CREATE TABLE vapi_calls (
  id SERIAL PRIMARY KEY,
  call_id TEXT UNIQUE NOT NULL,
  customer_phone TEXT,
  customer_name TEXT,
  transcript TEXT,
  summary TEXT,
  call_started_at TIMESTAMP,
  call_ended_at TIMESTAMP,
  recording_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_to_chatrace BOOLEAN DEFAULT false
);

CREATE TABLE unified_conversations (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  customer_name TEXT,
  customer_identifier TEXT,
  last_message_content TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE unified_messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT REFERENCES unified_conversations(id),
  message_content TEXT,
  message_role TEXT,
  created_at TIMESTAMP,
  function_data JSONB
);

CREATE TABLE google_oauth_tokens (
  id SERIAL PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, user_email)
);
```

**Requirements:**
1. **Create a performance testing script** that:
   - Inserts 10,000 simulated conversations (3 sources: chatrace, woodstock, vapi)
   - Inserts 50,000 messages across conversations
   - Runs the "unified inbox query" that fetches conversations sorted by `last_message_at DESC` with pagination
   - Measures query performance at 0, 5k, 10k, 25k, 50k message counts

2. **Identify missing indexes** by running `EXPLAIN ANALYZE` on:
   - Conversation list query with timestamp sorting
   - Message fetch for specific conversation_id
   - OAuth token lookup by business_id + user_email

3. **Generate an optimization report** with:
   - Current query times (baseline)
   - Recommended indexes with CREATE INDEX statements
   - Expected performance improvement estimates
   - Sharding recommendations if > 100k messages

**Deliverable:**
- `db-performance-test.js` or `.py` script
- `OPTIMIZATION_REPORT.md` with findings and recommendations
- SQL file with all recommended index creation statements

---

## 🔐 PART 3: COMPLIANCE & ERROR TRACKING (45 minutes) — 20% of task

### **Task 3.1: GDPR-Compliant Audit Logging**

**Context from Interview:**
"I implemented a role based access control and IM policies... system you know requests like that for the it's mostly the zero period in the healthcare system... where every deployment is very fully automated and also you ensuring all the data so we have like putting into the so data was encrypted"

**Challenge:**
Design and implement an audit logging system that tracks all sensitive operations for GDPR/SOC2 compliance.

**Requirements:**
1. **Create audit log table schema:**
   ```sql
   CREATE TABLE audit_logs (
     id SERIAL PRIMARY KEY,
     timestamp TIMESTAMP DEFAULT NOW(),
     user_id TEXT,
     business_id TEXT,
     action_type TEXT, -- READ, UPDATE, DELETE, EXPORT
     resource_type TEXT, -- conversation, message, oauth_token
     resource_id TEXT,
     ip_address INET,
     user_agent TEXT,
     gdpr_category TEXT, -- PII, FINANCIAL, HEALTH, COMMUNICATION
     retention_policy TEXT, -- 30_DAYS, 90_DAYS, 7_YEARS
     encrypted BOOLEAN DEFAULT false
   );
   ```

2. **Build middleware/interceptor** that:
   - Automatically logs all database reads/writes with sensitive data
   - Tags data by GDPR category (conversations = COMMUNICATION PII)
   - Implements retention policies (auto-delete after period)
   - Encrypts PII fields in logs at rest

3. **Create compliance reporting endpoint:**
   - `/api/compliance/data-access-report?user_email=X` - Shows all data accessed for a user
   - `/api/compliance/right-to-be-forgotten?user_email=X` - Simulates GDPR deletion request
   - `/api/compliance/data-export?user_email=X` - Exports all user data as JSON

**Deliverable:**
- `audit-logger/` service with middleware code
- SQL schema for audit_logs table
- `COMPLIANCE_ENDPOINTS.md` documenting the 3 API endpoints
- Example curl commands showing audit logs being created

---

## 👥 PART 4: TEAM COORDINATION & SCRUM MANAGEMENT (45 minutes) — 20% of task

### **Task 4.1: Sprint Planning & Developer Assignment**

**Team Members:**
- **Marvellous** (Frontend Developer) - React/Vite specialist
- **James** (Backend Developer) - Node.js/Express specialist

**Current Backlog Issues (Real Problems):**

1. **CRITICAL BUG:** VAPI conversations not showing proper timestamps
   - **Symptoms:** VAPI calls (📞) appear at bottom of unified inbox despite being recent
   - **Suspected Cause:** Timestamp sorting logic or database timezone mismatch
   - **Affected Code:** Unified inbox query, conversation list endpoint

2. **FEATURE REQUEST:** Real-time message updates via WebSocket
   - **Requirement:** New messages from any source should appear without refresh
   - **Technical:** Need SSE/WebSocket endpoint that broadcasts conversation updates
   - **Current State:** Only heartbeat SSE implemented, no real events

3. **PERFORMANCE ISSUE:** Slow conversation loading with 100+ items
   - **Symptoms:** Frontend takes 5-8 seconds to render conversation list
   - **Suspected Cause:** No pagination in frontend, fetching all conversations at once
   - **Need:** Implement infinite scroll with proper lazy loading

4. **INFRASTRUCTURE NEED:** Automated deployment pipeline
   - **Current:** Manual deployment to Railway
   - **Need:** GitHub Actions CI/CD with automated tests and staging environment

**Your Tasks:**

1. **Create a Sprint Planning Document** (`SPRINT_1_PLAN.md`) with:
   - Task breakdown for each issue (split into frontend/backend subtasks)
   - Assignment to Marvellous or James with clear acceptance criteria
   - Estimated hours per task
   - Dependencies between tasks
   - Definition of Done for each task

2. **Write Technical Specifications** for each developer:
   - `SPEC_MARVELLOUS.md` - Frontend implementation details for assigned tasks
   - `SPEC_JAMES.md` - Backend implementation details for assigned tasks
   - Include API contracts, data structures, test scenarios

3. **Create a JIRA-style Kanban board** (use Markdown table):
   - Columns: TODO | IN PROGRESS | CODE REVIEW | DONE
   - All 4 issues broken down into 10+ subtasks
   - Priority labels (P0-P3), estimated hours, assignees

4. **Design a Daily Standup format** with:
   - Questions to ask each developer
   - How to track blockers
   - How to escalate issues to Jean (backend lead) or Derek (founder)

**Deliverable:**
- `SPRINT_1_PLAN.md` with complete sprint breakdown
- `SPEC_MARVELLOUS.md` - Frontend developer technical spec
- `SPEC_JAMES.md` - Backend developer technical spec
- `KANBAN_BOARD.md` - Visual task board
- `STANDUP_FORMAT.md` - Daily coordination process

---

## 🧪 BONUS CHALLENGE: CI/CD Pipeline (30 minutes if time permits)

### **Task 5.1: GitHub Actions Workflow**

**Goal:** Create a production-ready CI/CD pipeline for the inbox system.

**Requirements:**
1. **Create `.github/workflows/deploy.yml`** that:
   - Runs on push to `main` branch
   - Executes linting (ESLint for backend, frontend)
   - Runs database migrations
   - Runs your performance tests from Part 2
   - Builds Docker images for backend + frontend
   - Deploys to Railway staging environment
   - Runs smoke tests against staging
   - Promotes to production on success

2. **Add health checks** that:
   - Verify database connectivity
   - Test ChatRace API integration
   - Validate OAuth tokens are not expired
   - Check VAPI webhook endpoint is accessible

3. **Implement rollback strategy:**
   - Blue-green deployment pattern
   - Automatic rollback if health checks fail
   - Slack notification on deployment success/failure

**Deliverable:**
- `.github/workflows/deploy.yml` - Complete CI/CD pipeline
- `deployment/` directory with rollback scripts
- `DEPLOYMENT_GUIDE.md` - How to deploy and rollback

---

## 📊 EVALUATION CRITERIA

### **Technical Skills (80%)**

**Infrastructure & Monitoring (30 points)**
- [ ] Docker Compose stack runs successfully
- [ ] Prometheus collecting all 5+ required metrics
- [ ] Grafana dashboard visualizing system health
- [ ] Health check service detecting API/DB issues
- [ ] Proper error handling and logging

**Database Performance (30 points)**
- [ ] Performance test script runs without errors
- [ ] Accurate query performance measurements
- [ ] Valid index recommendations with SQL
- [ ] Clear optimization report with estimates
- [ ] Understanding of sharding/replication strategies

**Compliance & Security (20 points)**
- [ ] Audit log schema follows best practices
- [ ] Middleware captures all sensitive operations
- [ ] GDPR endpoints functional (access/export/delete)
- [ ] Proper encryption of PII in logs
- [ ] Retention policies implemented

**Bonus: CI/CD (20 bonus points)**
- [ ] GitHub Actions workflow is valid YAML
- [ ] Includes all required stages (lint, test, deploy)
- [ ] Health checks prevent bad deployments
- [ ] Rollback strategy is documented

### **Team Management Skills (20%)**

**Sprint Planning (40 points)**
- [ ] Tasks are broken down into concrete subtasks
- [ ] Clear acceptance criteria for each task
- [ ] Realistic time estimates (not too optimistic/pessimistic)
- [ ] Proper identification of dependencies
- [ ] Priority assigned correctly (P0 = critical bugs first)

**Technical Specifications (30 points)**
- [ ] Specs are detailed enough for developers to implement
- [ ] API contracts clearly defined
- [ ] Test scenarios included
- [ ] Edge cases considered
- [ ] No ambiguity in requirements

**Process Design (30 points)**
- [ ] Kanban board is well-organized
- [ ] Standup format is efficient (< 15 min)
- [ ] Blocker escalation process is clear
- [ ] Communication protocols defined
- [ ] Reporting structure to Jean/Derek

---

## 📦 SUBMISSION REQUIREMENTS

**Directory Structure:**
```
vishnu-hackathon-submission/
├── docker-compose.yml
├── health-monitor/
│   ├── package.json
│   ├── index.js
│   └── README.md
├── grafana/
│   └── dashboard.json
├── db-performance/
│   ├── db-performance-test.js
│   ├── OPTIMIZATION_REPORT.md
│   └── recommended-indexes.sql
├── audit-logger/
│   ├── audit-middleware.js
│   ├── schema.sql
│   └── COMPLIANCE_ENDPOINTS.md
├── team-management/
│   ├── SPRINT_1_PLAN.md
│   ├── SPEC_MARVELLOUS.md
│   ├── SPEC_JAMES.md
│   ├── KANBAN_BOARD.md
│   └── STANDUP_FORMAT.md
├── .github/
│   └── workflows/
│       └── deploy.yml (BONUS)
└── README.md (master document explaining everything)
```

**README.md Must Include:**
1. **Quick Start:** Commands to run your entire setup
2. **Architecture Diagram:** How your monitoring stack works
3. **Key Findings:** Top 3 performance improvements you discovered
4. **Time Breakdown:** How you spent the 4 hours
5. **Recommendations:** What the team should implement first

---

## 🎯 SUCCESS METRICS

**At the end of 4 hours, you should have:**

✅ **Working Monitoring Infrastructure**
- Can detect ChatRace API downtime within 30 seconds
- Shows database performance degradation in Grafana
- Alerts when OAuth tokens expire soon

✅ **Actionable Performance Report**
- Specific queries to optimize
- Exact indexes to create
- Expected performance gains (e.g., "50% faster query time")

✅ **Production-Ready Compliance System**
- Audit logs for all sensitive operations
- GDPR data export working
- Retention policies enforced

✅ **Clear Development Roadmap**
- Marvellous knows exactly what to build (frontend tasks)
- James knows exactly what to build (backend tasks)
- Sprint can start immediately with your planning

---

## 🚀 EVALUATION CALL (End of Hackathon)

**15-minute live demo covering:**
1. **Show your monitoring dashboard** - Explain each metric and why it matters
2. **Run your performance test** - Show before/after query times
3. **Demonstrate compliance endpoints** - Show audit log creation and data export
4. **Walk through sprint plan** - Explain task breakdown and assignments
5. **Q&A:** Answer technical questions about your implementation choices

**Questions You'll Be Asked:**
- "How would you scale this to 1 million conversations?"
- "What happens if the Neon database goes down?"
- "How do you prevent audit logs from consuming too much storage?"
- "Why did you assign Task X to Marvellous instead of James?"
- "What's your rollback plan if this monitoring system breaks production?"

---

## 📚 REFERENCE DOCUMENTATION

**API Endpoints Available:**
```bash
# ChatRace API (external)
POST https://app.aiprlassist.com/php/user
Headers: X-ACCESS-TOKEN: {USER_TOKEN}
Body: { "op": "conversations", "op1": "get", "account_id": "1145545", "limit": 50 }

# Local Backend (if accessible for testing)
GET http://localhost:3001/healthz
GET http://localhost:3001/api/inbox/conversations?platform=all&limit=50
GET http://localhost:3001/api/inbox/conversations/:id/messages?limit=50

# Database Query Example
SELECT * FROM unified_conversations 
WHERE source = 'vapi' 
ORDER BY last_message_at DESC 
LIMIT 20;
```

**Key Technologies:**
- **Backend:** Node.js 18+, Express, PostgreSQL (pg library)
- **Frontend:** React 18, Vite, TailwindCSS
- **Infrastructure:** Docker, Docker Compose, Railway
- **Monitoring:** Prometheus, Grafana, Node Exporter
- **Databases:** PostgreSQL (Neon), connection pooling via pgbouncer

---

## ⚡ INTERVIEW INSIGHTS TO APPLY

Based on your interview, we expect you to demonstrate:

1. **"I will review how the postgres is used, ensuring the index connectors fails"**
   → Show us query analysis and index recommendations in Part 2

2. **"I would use a combination of identifiers as a you know as a uh mostly you know belongs to the same user"**
   → Apply this to audit logging - track users across business_id + email combinations

3. **"I will use the data rock for distribution and tracing"**
   → While we don't have Datadog, show us how you'd implement distributed tracing with Prometheus

4. **"I also do you know as entity regions on uh model development"**
   → Apply your ML experience to predict which conversations need human escalation (bonus insight in report)

5. **"I passionate about like a building reliable scale and cost optimizing pipelines"**
   → Cost analysis: How much would your monitoring stack cost at AWS/GCP scale?

---

## ❓ ALLOWED RESOURCES

**You MAY use:**
- ✅ Google/Stack Overflow for syntax and library documentation
- ✅ ChatGPT/Claude for code generation (must understand and explain it)
- ✅ Official documentation (Prometheus, Grafana, PostgreSQL, Node.js)
- ✅ Database GUI tools (pgAdmin, DBeaver, Postico)
- ✅ Postman/Insomnia for API testing

**You MAY NOT:**
- ❌ Access the existing Chatrace-Inbox codebase
- ❌ Contact other April Assist team members during the hackathon
- ❌ Use pre-built monitoring solutions (e.g., New Relic, Datadog SaaS)
- ❌ Copy-paste entire solutions from GitHub repos

---

## 🏁 FINAL NOTES

**This is a realistic simulation of your first week at April Assist.**

Jean (your backend lead) is overwhelmed with building features. Derek (founder) needs visibility into system health. The team needs structure and clear task assignments. You're being hired to solve these problems.

**We're evaluating:**
- Can you build production infrastructure from scratch?
- Do you understand database performance deeply?
- Can you implement compliance requirements?
- Can you lead developers without micromanaging?
- Do you ask the right questions when stuck?

**Timeline:**
- 0:00-1:00 → Part 1 (Monitoring Infrastructure)
- 1:00-2:00 → Part 2 (Database Performance)
- 2:00-2:45 → Part 3 (Compliance & Audit Logging)
- 2:45-3:30 → Part 4 (Team Coordination)
- 3:30-4:00 → Documentation, README, final testing

**Good luck! 🚀**

---

**Evaluation Panel:**
- **Derek Dicks** (CEO) - Business impact and team management
- **Jean De Lasse** (Lead Backend Engineer) - Technical depth and architecture
- **Evan Kubicek** (CRO) - Communication and prioritization

**Questions?** You get ONE "phone a friend" to ask a clarifying question. Use it wisely.
