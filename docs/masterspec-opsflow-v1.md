Here’s a **much more detailed v1 master spec** you can drop into `docs/master-spec-version1.md`. It’s still “copilot only”, but now includes inbound email, teams, metrics dashboard, pricing page (free), docs, and all the little SaaS bits. [zendesk](https://www.zendesk.com/service/help-desk-software/saas-help-desk/)

---

# master-spec-version1.md — opsFlow v1 “Smart Copilot”

## 0. Product Vision & Positioning

**Vision**  
opsFlow v1 is an AI **copilot** for support teams in e‑commerce/fintech‑like businesses. It sits on top of a shared inbox/helpdesk, understands tickets, and drafts answers from the company’s knowledge, but leaves **all sending and actions to humans**. [assembled](https://www.assembled.com/page/ai-copilots-customer-service)

**v1 promise to users**

- “Plug opsFlow into your support inbox and get instant, high‑quality answer drafts and smart triage — without changing your tools or giving up control.” [vynta](https://vynta.ai/blog/saas-helpdesk/)

**Audience**

- Small to mid‑size teams (3–30 agents) using basic shared inbox/helpdesk tools.
- Founders/heads of support who want AI help but don’t trust full autonomy yet. [hiverhq](https://hiverhq.com/blog/best-help-desk-software-features)

**Out of scope in v1**

- No autonomous actions (no refunds, no status changes).
- No multi‑brand complexity beyond a single workspace.
- No multi‑tenant SSO/Enterprise features.
- No paid tiers yet (free only, but instrumented for future pricing). [helpdesk](https://www.helpdesk.com/pricing/)

---

## 1. Functional Requirements

### 1.1 Channels & Inbound Email

**Goal:** Make it easy to plug opsFlow into existing workflows via email and a generic API.

**Inbound email**

- Each workspace (tenant) gets a unique support email address:
  - Format: `tenant-slug@inbound.opsflow.ai`.
- Tenant can set up **forwarding** from their main support email (e.g. `support@brand.com`) to this address, or use it directly. [zendesk](https://www.zendesk.com/service/help-desk-software/saas-help-desk/)

**Inbound email behavior**

- Parse incoming email:
  - Headers: `From`, `To`, `Cc`, `Subject`, `Message-ID`, `In-Reply-To`.
  - Body: HTML and plain text; prefer plain text for analysis.
- Create or update Ticket:
  - If `In-Reply-To` or `References` matches an existing ticket → append as a message in the same thread.
  - Else → create a new Ticket.

**Generic API ingestion**

- For helpdesks or backends that want to push tickets directly:
  - `POST /api/tickets/ingest` with JSON payload (tenant API key).
  - Same normalization as email ingestion. [vynta](https://vynta.ai/blog/saas-helpdesk/)

**Optional chat widget (basic)**

- Embeddable script for Next.js frontend:
  - Minimal widget with:
    - Name, email, message field.
    - Posts to `/api/tickets/ingest` with channel=`chat`.

---

### 1.2 Shared Inbox & Teams

**Shared team inbox**

- Centralized ticket list for all agents:
  - Supports claim/assign, status changes, and comments. [kustomer](https://www.kustomer.com/resources/blog/ai-powered-help-desk-software/)

**Teams**

- In v1, keep teams simple:
  - One workspace = one “team” with individual agents.
  - Each ticket has an optional `assigneeId`.

**Collaboration basics**

- Internal notes:
  - Agents can add internal notes that are not visible to customers.
- Mentions (optional v1.1):
  - `@` mention an agent in an internal note (no notifications needed in v1; simple visual highlight).

---

### 1.3 AI Copilot Core

**Intent & triage**

- Automatically infer for each new ticket:
  - **Intent** (order status, refund, shipping issue, payment failure, account access, general question).
  - **Sentiment** (calm, frustrated, angry). [gettalkative](https://gettalkative.com/info/ai-copilots-in-customer-service)
  - **Priority** (low/medium/high).
  - Tags (e.g. `billing`, `shipping`, `bug`, `feature_request`). [helpjam](https://helpjam.com/blog/top-8-ai-help-desk-features-every-saas-business-needs/)

**Answer suggestions**

- For each open ticket:
  - Retrieve relevant KB docs and snippets from similar resolved tickets.
  - Draft a suggested reply:
    - In the tenant’s tone and language.
    - With clear paragraphs, bullet points when needed.
    - Suggest next actions (“If your payment still fails, we recommend…”). [helpjam](https://helpjam.com/blog/top-8-ai-help-desk-features-every-saas-business-needs/)

**Agent UI behavior**

- When opening a ticket:
  - AI suggestion automatically loads (or via “Generate suggestion” button).
- Agent sees:
  - Suggested answer (editable).
  - Confidence indicator or “AI quality” label (e.g. low/medium/high).
  - Short “Why this answer” explanation (summarized from retrieved docs). [assembled](https://www.assembled.com/page/ai-copilots-customer-service)

**No auto-send**

- Agent must click “Send” (or “Copy & paste to your tool”) to send.
- For inbound email:
  - v1: store “outgoing message” in ticket but do not automatically send replies from opsFlow (so they can still reply via their own tool).
  - v1.1 (optional): send email directly from opsFlow using SMTP/transactional service.

---

### 1.4 Knowledge Base & AI Content

**KB management**

- Admin can:
  - Add/edit/delete KB articles.
  - Organize into categories (FAQ, Shipping, Payments, Account, Technical, etc.). [zendesk](https://www.zendesk.com/service/help-desk-software/saas-help-desk/)

- Article fields:
  - Title, category, body (Markdown), visibility (internal only vs customer‑facing in future).

**AI-powered KB usage**

- RAG:
  - Use KB + optional “resolved tickets” snippets for context retrieval. [aubergine](https://www.aubergine.co/insights/revolutionizing-customer-support-with-rag-powered-chatbot)
- AI guardrails:
  - AI must cite which articles it used (titles listed in UI).
  - If no relevant docs, AI should say it lacks information and ask agent to confirm.

---

### 1.5 Teams & Roles

**Roles**

- Admin:
  - Manage workspace settings, KB, inbound email, API keys, members.
- Agent:
  - Work tickets, use AI suggestions, add KB suggestions but cannot publish them (optional).

**Members**

- Invite flow:
  - Admin invites via email, sets role.
  - Invitee accepts and sets password.

---

### 1.6 Metrics & Reporting

**Agent-level metrics**

- Per agent:
  - Tickets assigned.
  - Tickets closed.
  - AI suggestions used vs edited vs ignored. [helpjam](https://helpjam.com/blog/top-8-ai-help-desk-features-every-saas-business-needs/)

**Workspace-level metrics**

- Per workspace:
  - Tickets per day/week.
  - AI suggestions generated.
  - % of tickets where suggestion was “used as is” vs “edited” vs “ignored”. [hiverhq](https://hiverhq.com/blog/best-help-desk-software-features)
  - Average first response time (approx based on ticket open vs first reply timestamp). [hiverhq](https://hiverhq.com/blog/best-help-desk-software-features)

**Dashboard v1**

- Simple dashboard page:
  - Date range selector.
  - Cards:
    - Tickets created.
    - Tickets closed.
    - AI suggestions generated.
    - AI suggestions used.
  - Basic charts:
    - Tickets over time.
    - AI usage over time. [hiverhq](https://hiverhq.com/blog/best-help-desk-software-features)

---

### 1.7 Public Website & Pricing Page

**Landing page (Next.js)**

- Sections:
  - Hero:
    - Headline: “AI copilot for your support team” (or opsFlow phrasing).
    - Subheadline: “Let AI draft perfect replies from your docs — you stay in control.” [assembled](https://www.assembled.com/page/ai-copilots-customer-service)
    - Primary CTA: “Start free” (link to signup).
  - How it works:
    - 3 steps (Connect inbox, Upload docs, Let AI draft answers).
  - Features:
    - Smart triage, AI drafts, shared inbox, KB.
  - For whom:
    - E‑commerce, SaaS, fintech‑like businesses.
  - Testimonials (placeholder for now).
  - Footer: docs, privacy, terms, contact.

**Pricing page (v1)**

- Single plan section:
  - “Public Beta — Free”
  - Bullets:
    - Up to X tickets/month.
    - Up to Y AI suggestions/month.
    - Up to Z team members.
  - Secondary CTA: “Sign up free” (no credit card).
  - Note: “Paid plans coming later — lock in free access now.” [getmonetizely](https://www.getmonetizely.com/articles/how-to-price-ai-services-in-2025-models-examples-and-strategy-for-saas-leaders)

---

### 1.8 Documentation (Docs Site)

**Docs structure**

- `/docs` route as a docs homepage.

Sections:

1. **Getting Started**
   - What is opsFlow v1.
   - Concepts: Workspace, Ticket, KB, AI Suggestion.
   - 5‑minute quickstart:
     - Create workspace.
     - Setup inbound email.
     - Upload docs.
     - Open first ticket and see AI suggestion.

2. **Setup**
   - Workspace setup.
   - Inbound email configuration:
     - How to forward emails from Gmail/Google Workspace and other providers.
   - API key + `/tickets/ingest` integration. [azure-samples.github](https://azure-samples.github.io/azure-open-ai-rag-oyd-text-images/workshop_overview/)

3. **Using opsFlow**
   - Shared inbox.
   - Working with tickets and AI suggestions.
   - KB editing and best practices (how to write good docs for AI).

4. **Admin & Security**
   - Roles and permissions.
   - Data handling and privacy overview (high level).

5. **FAQ**
   - Common questions (what AI does/doesn’t do, how to control it, supported languages, etc.).

---

## 2. Non‑Functional Requirements (expanded)

- Performance:
  - Ticket list loads under 2 seconds with typical volume.
  - AI suggestion under 10 seconds for majority of cases. [youtube](https://www.youtube.com/watch?v=eGicNXq7X8w)

- Reliability:
  - Inbound email must be idempotent; duplicate emails should not create duplicate tickets.
  - Basic retry logic for AI pipeline failures (queue retry with back‑off).

- Security & data:
  - Per-tenant logical isolation, no cross-tenant KB retrieval.
  - Only authorized users with same tenant_id can access tickets and KB.

- Observability:
  - Basic log events:
    - `ticket.ingested`, `ticket.ai_pipeline_started`, `ticket.ai_pipeline_finished`, `ticket.ai_pipeline_failed`, `ai_suggestion.used`, `ai_suggestion.ignored` etc. [gettalkative](https://gettalkative.com/info/ai-copilots-in-customer-service)

- Multi-language (minimum)
  - Support tickets in at least English first.
  - LLM should auto-detect user language; future versions may enable multilingual responses. [helpjam](https://helpjam.com/blog/top-8-ai-help-desk-features-every-saas-business-needs/)

---

## 3. Modules (System Architecture Level)

### 3.1 Inbound Email Service

- Accepts emails via:
  - Webhook from email provider OR direct SMTP receiver.
- Normalizes and forwards payload to Ingestion module.

### 3.2 Ingestion & Ticketing Service

- Creates/updates Tikets in Mongo.
- Emits events to the AI Pipeline queue.

### 3.3 AI Pipeline Service

- Stateless worker service that:
  - Fetches ticket.
  - Runs classification chain.
  - Runs RAG retrieval.
  - Generates suggestion and updates Ticket.

### 3.4 Knowledge Base Service

- CRUD for KB articles.
- Async indexing into vector store.

### 3.5 Auth & Tenant Service

- Handles signup, login, sessions.
- Manages tenants, roles, memberships.

### 3.6 Metrics & Reporting Service

- Aggregates events into TenantUsage & AgentUsage.
- Serves metrics API for Dashboard.

### 3.7 Frontend App (Next.js)

- Public site (landing + pricing + docs).
- App (inbox, ticket UI, KB, settings, dashboard).

---

## 4. API Endpoints (No Code, Just Shape)

You can keep the endpoints roughly as previously defined, but v1 spec now **assumes**:

- Endpoint for inbound email (internal / provider-specific).
- Tickets + KB + Settings + Metrics endpoints as described earlier.

(You explicitly said no code, so I’m not repeating shapes.)

---

## 5. UX / UI Screens (Expanded)

### 5.1 Public pages

- **Home / Landing**
- **Pricing**
- **Docs index**
- **Auth** (Signup, Login, Forgot Password)

### 5.2 App pages

- **Dashboard**
  - Key metrics cards, simple charts.

- **Inbox / Tickets list**
  - Filters, search, row-level AI indicators.

- **Ticket detail**
  - Left: conversation, info.
  - Right: AI panel, internal notes, history of AI suggestions.

- **Knowledge Base**
  - List + editor.

- **Team & Members**
  - Invite members, change roles, view pending invites.

- **Settings**
  - Workspace info, inbound email alias, API key, tone, language, signature.

---

## 6. v1 Completion Criteria

- A new workspace can:
  - Sign up from the landing page.
  - Get an inbound email address.
  - Forward their support email to it.
  - Upload at least 3–5 KB articles.
  - See new tickets arrive in the inbox.
  - Open a ticket and get an AI suggestion, with visible KB sources.
  - Use the suggestion to respond (even if manually via copy‑paste).
  - See usage metrics update on the dashboard.

Once everything above works reliably for a test tenant, v1 is “done” and you’re ready to let real teams use it for free while you work on v2 autonomy.

If you want, next I can generate a **Linear/Jira-style task breakdown** from this v1 spec so you can feed it into Trae or your own planner.
