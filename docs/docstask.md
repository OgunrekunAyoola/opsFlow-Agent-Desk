Use this as your Trae IDE “master prompt” for implementing opsFlow v1. Paste it as a single spec/task prompt; adjust paths/names if needed.

---

**Prompt for Trae IDE — Implement opsFlow v1 “Smart Copilot”**

You are building **opsFlow v1**, an AI **support copilot** SaaS for e‑commerce/fintech‑like teams.

I already have:

- **Backend:** Node (Nest/Express) with **MongoDB**
- **Frontend:** **Next.js** app (App Router)
- **Auth:** **BetterAuth** (with organizations/workspaces)
- **AI:** **LangChain** (TypeScript) as the LLM/RAG orchestrator
- I will use **streaming responses** from the LLM to the Next.js app

Your job is to implement everything needed for a **version 1 launch**, including functionality, UI, APIs, and **enterprise‑grade testing for security, reliability, and performance**.

Read carefully and implement **all** of the following.

---

## 1. High‑level product behavior (v1)

opsFlow v1 is a **copilot only**:

- Ingests support messages (email + API + basic chat widget).
- Normalizes into tickets (multi‑tenant).
- Uses RAG over a tenant’s **knowledge base (KB)** and optional past tickets to draft answers.
- Auto‑classifies intent, sentiment, priority, tags.
- Shows suggestions to agents in a shared inbox UI.
- **Never auto‑sends** replies or performs actions in v1. Humans always choose what to send.

No autonomy in v1: no refunds, no upstream API actions, no auto‑send. Only **triage + suggested replies**.

---

## 2. Architecture & modules to implement

Implement these modules as clearly separated folders/services, wired together:

1. **Auth & Tenant module (BetterAuth)**
   - Use BetterAuth with organizations/workspaces:
     - Workspace = Tenant.
   - Roles: `admin`, `agent`.
   - Expose:
     - Signup (create workspace + admin).
     - Login/logout.
     - Invite members (admin only).
   - Ensure multi‑tenant scoping is enforced everywhere (every data query filtered by tenant/workspace ID).

2. **Ingestion module**
   - **Inbound email** support:
     - Each workspace gets a unique inbound email address (store on Tenant).
     - Implement an endpoint to receive normalized email webhooks (we will plug an email provider later):
       - Parse `from`, `to`, `subject`, `messageId`, `inReplyTo`, `bodyHtml`, `bodyText`.
       - Decide whether to create a new ticket or append to an existing ticket thread.
   - **Generic API ingestion**:
     - `POST /api/tickets/ingest` (protected via tenant API key or authenticated user):
       - Body includes: channel (`api`/`chat`), customer info, subject, body, optional externalId.
   - Optional **chat widget**:
     - A simple embeddable widget in Next.js that POSTs to `/api/tickets/ingest` with `channel=chat`.

3. **Ticket service module**
   - Ticket model in MongoDB with fields:
     - tenantId, channel (`email`, `chat`, `api`), customer (id/email/name), subject, body, status (`open`, `pending`, `closed`), priority (`low`, `medium`, `high`), tags[], sentiment, `assigneeId`, timestamps.
     - `ai` subdocument: lastRunAt, intent, confidence, suggestion (text, model, createdAt, reasoningSummary, used/edited/ignored flags), retrieved docs metadata.
   - CRUD APIs:
     - List tickets with filters (status, tag, assignee, date).
     - Get ticket by ID (including AI suggestion).
     - Update ticket (status, tags, assignee).

4. **Knowledge base (KB) module**
   - KB article model:
     - tenantId, title, body (Markdown/HTML), category, timestamps.
   - CRUD APIs:
     - List, create, update, delete articles.
     - Optional import from URL.
   - RAG indexing:
     - Chunk KB articles.
     - Store embeddings in a vector store (you choose: pgvector/Qdrant/Pinecone etc.).
     - Include metadata: tenantId, articleId, category.
   - Retrieval helper:
     - Given ticket text + intent + tenantId, retrieve top N relevant chunks.

5. **AI pipeline module (LangChain)**
   - Implement a **multi‑step chain** (can be sequential, not complex agents yet):
     1. **Classification step**:
        - Use LLM or small classifier via LangChain.
        - Input: ticket body (+ subject, channel).
        - Output JSON:
          - `intent` (enum: order_status, refund, shipping_issue, payment_failure, account_access, general_question, other)
          - `sentiment` (calm, frustrated, angry, unknown)
          - `priority` (low, medium, high)
          - `tags` (string array)
     2. **RAG retrieval step**:
        - Use vector store + metadata filter by tenantId.
        - Retrieve top relevant KB chunks (and optionally “resolved ticket” snippets).
     3. **Answer generation step**:
        - Use LangChain with streaming support.
        - Prompt:
          - System: you are a professional support agent for this tenant; only use provided docs; if insufficient info, say you don’t know and ask agent to confirm.
          - Include tenant tone (formal/friendly/casual), signature, language.
        - Output:
          - Suggested answer text.
          - Short reasoning summary (internal).
     4. **Ticket update**:
        - Save classification + suggestion + retrieved docs metadata into the Ticket `ai` field.
   - Provide:
     - A worker/queue consumer to process tickets asynchronously (e.g. BullMQ).
     - An internal hook to re‑run AI pipeline manually for a ticket.

6. **Metrics & logging module**
   - Collect metrics per tenant:
     - Tickets ingested (per period).
     - AI suggestions generated.
     - For each suggestion, whether agent clicked “Use” / “Edited” / “Ignored”.
   - Simple collections:
     - TenantUsage: tenantId, period (e.g. `YYYY-MM`), ticketsIngested, aiSuggestionsCreated, aiSuggestionsUsed, createdAt.
   - Logging:
     - Structured logs for: ticket.ingested, ai.pipeline.started, ai.pipeline.succeeded, ai.pipeline.failed, ai.suggestion.used/edited/ignored.

7. **Public website & docs**
   - Next.js public pages:
     - `/` Landing page (hero, how it works, features for v1, target users).
     - `/pricing` Simple page with a single “Free Beta” plan.
     - `/docs` Docs index and basic docs pages (can load from MD files).
   - Content:
     - Emphasize AI drafts from your own docs, smart triage, zero‑risk because humans always send, and free beta.

---

## 3. Frontend (Next.js) features

Implement the app UI with Next.js App Router, using modern patterns and **streaming** where appropriate.

1. **Auth & onboarding**
   - Signup page:
     - Workspace name, email, password.
     - On success: create tenant + admin via BetterAuth; redirect to onboarding.
   - Login page.
   - Onboarding steps:
     - Step 1: “Set up inbound email” (show their unique inbound address, simple instructions).
     - Step 2: “Upload your docs” (link to KB page).
     - Step 3: “Invite your team” (link to team/members page).

2. **Shared Inbox**
   - Tickets list page:
     - Table/list with: status, priority, tags, subject/preview, customer, createdAt, AI badge (“AI draft ready”).
     - Filters: status, priority, tags, date range.
   - Ticket detail page:
     - Left column: full conversation (messages, internal notes), customer info, status, priority, tags, assignee.
     - Right column: **AI copilot panel**:
       - Streaming suggestion area (show streaming LLM response as it generates).
       - Buttons: “Use”, “Edit & Send”, “Regenerate”.
       - Show which KB articles were used (titles, clickable).
     - Internal notes section (for agents only).

3. **Knowledge Base UI**
   - KB list page:
     - Table: title, category, last updated.
     - Actions: New article, Edit, Delete.
   - KB editor page:
     - Title, category dropdown, body (Markdown editor).
     - On save → call KB API + trigger reindex.

4. **Team & settings**
   - Team page:
     - List members with roles.
     - Invite new member (admin only).
   - Settings page:
     - Workspace name.
     - Inbound email address (read‑only display).
     - Tone (formal/friendly/casual).
     - Default language.
     - Signature (textarea).
     - API key display (for `/api/tickets/ingest`).

5. **Metrics dashboard**
   - Dashboard page:
     - Date range selector.
     - KPI cards:
       - Tickets created (in range).
       - Tickets closed (in range).
       - AI suggestions generated.
       - AI suggestions used.
     - Simple charts:
       - Tickets per day.
       - AI suggestions vs used per day.

6. **Docs pages**
   - `/docs/getting-started`: quickstart guide (set up workspace, inbound email, upload docs, generate first suggestion).
   - `/docs/setup`: inbound email config, API ingestion, KB guidance.
   - `/docs/using-opsflow`: working inbox, AI suggestions, roles.
   - `/docs/admin-security`: basic security model overview.

---

## 4. Enterprise-grade testing & quality

Add **serious testing and QA** around:

1. **Security**
   - Multi-tenant access control:
     - Tests ensuring tenant A cannot access tenant B’s tickets or KB.
   - Auth:
     - Ensure all app routes and APIs are protected appropriately (only `/`, `/pricing`, `/docs`, `/auth/*` public).
   - Input validation:
     - Validate all external input (ingestion API, email webhook) for required fields, length, and types.
   - Secrets handling:
     - No secrets in logs.
     - Env-based config for DB, vector store, LLM keys.

2. **Reliability**
   - Ingestion idempotence:
     - Tests for duplicate inbound email (same Message-ID or externalId) not creating duplicate tickets.
   - AI pipeline robustness:
     - If LLM or vector store fails:
       - Ticket remains but AI fields not set.
       - Error logged; system does not crash.
   - Queue retries:
     - Ensure failed jobs retry with backoff, but don’t create infinite loops.

3. **Performance**
   - Load test scenarios (at least via automated tests / script outlines):
     - Many tickets ingested in a short time.
     - AI pipeline handling N concurrent jobs with acceptable latency.
   - Frontend:
     - Ticket list and ticket detail should not fetch unbounded data; use pagination and limit fields.

4. **Unit & integration tests**
   - For:
     - Ticket creation and query.
     - KB CRUD and indexing.
     - RAG retrieval logic (correct filtering by tenantId).
     - Classification chain output shape and enums.
   - Integration:
     - End‑to‑end flow: ingest ticket → AI pipeline → suggestion visible in UI → agent marks suggestion “used”.

5. **Basic “enterprise hygiene”**
   - Logging:
     - Use structured logging (tenantId, ticketId, requestId) for all major operations.
   - Observability hooks:
     - Make it easy to plug into external monitoring later (e.g. by emitting metrics to a generic interface).

---

## 5. Non‑functional constraints

- Use modern Next.js patterns (App Router, server actions where appropriate).
- Use LangChain JS/TS with **streaming** responses to the client.
- Ensure all DB queries are scoped by tenantId.
- Structure code for v2 extensions (autonomy) but **do not** implement actions or auto‑send in v1.

---

**Deliverable expectation**

Treat this as the **single source of truth** for opsFlow v1.  
Implement:

- Backend modules (auth, tenants, tickets, KB, AI pipeline, metrics).
- Frontend pages (public & app).
- Email/API ingestion.
- RAG + streaming AI copilot.
- Tests and basic security/performance hardening.

If something is ambiguous, choose **simple, production‑sensible defaults** suitable for a small B2B SaaS with a few early customers.
