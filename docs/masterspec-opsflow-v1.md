Here’s the updated **Master Spec for Phase 1 of OpsFlow Agent Desk**, now with multi‑tenant structure designed in from the start (single DB, row‑level tenancy). [learn.microsoft](https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns?view=azuresql)

---

## 1. v1 Goal & Scope

**Goal**  
Ship a multi‑tenant‑ready MVP where each agency gets its own workspace: they see their own tickets, run AI ticket triage, and approve/send AI‑drafted replies.

**Core v1 workflow**

- Ticket Triage & Reply for support/ops emails:
  - Ingest ticket (simulate email via form/API).
  - AI classifies, prioritizes, suggests assignee, drafts reply.
  - Human reviews, edits, and marks as replied.

**Multi‑tenant stance (v1)**

- One shared database, multiple tenants distinguished by `tenant_id` on all tenant‑owned documents. [relevant](https://relevant.software/blog/multi-tenant-architecture/)
- Each user belongs to exactly one tenant.
- All queries are scoped by `tenant_id` resolved from the authenticated user.

**Out of scope (v1)**

- Separate DB/collections per tenant. [seedium](https://seedium.io/blog/how-to-build-multi-tenant-saas-architecture/)
- Complex org hierarchies, advanced roles, billing.

---

## 2. v1 User Stories

1. As a **tenant owner (Admin)**, I can sign up my agency (tenant) and my first user.
2. As an **Admin**, I can invite/create more users in my agency.
3. As a **team member** in an agency, I see only my agency’s tickets.
4. As a **team member**, I can trigger AI triage on a ticket and see suggestions.
5. As a **team member**, I can edit AI suggestions and save/send a reply.
6. As a **team member**, I can see workflow history per ticket.

---

## 3. Data Model (with Tenant)

### 3.1 Core multi‑tenant entities

**Tenant (Agency)**

- `_id` (ObjectId)
- `name`
- `slug` (for future subdomain or URL use, optional)
- `created_at`, `updated_at`

**User**

- `_id` (ObjectId)
- `tenant_id` (Ref → Tenant)
- `name`
- `email` (unique per tenant)
- `password_hash`
- `role` (`admin` | `member`)
- `created_at`, `updated_at`

All other main entities are **tenant‑scoped**:

**Ticket**

- `_id` (ObjectId)
- `tenant_id` (Ref → Tenant)
- `subject`
- `body` (text)
- `channel` (`email`, `web_form`)
- `status` (`new`, `triaged`, `awaiting_reply`, `replied`, `closed`)
- `priority` (`low`, `medium`, `high`, `urgent`)
- `category` (`bug`, `feature_request`, `billing`, `general`, `other`)
- `customer_name` (nullable)
- `customer_email` (nullable)
- `assignee_id` (nullable, Ref → User)
- `created_by_id` (nullable Ref → User)
- `created_at`, `updated_at`

**TicketReply**

- `_id` (ObjectId)
- `tenant_id` (Ref → Tenant)
- `ticket_id` (Ref → Ticket)
- `author_type` (`ai`, `human`)
- `author_id` (nullable Ref → User when human)
- `body` (text)
- `created_at`

**WorkflowRun**

- `_id` (ObjectId)
- `tenant_id` (Ref → Tenant)
- `type` (`ticket_triage`)
- `ticket_id` (Ref → Ticket)
- `status` (`running`, `succeeded`, `failed`)
- `started_by_user_id` (Ref → User)
- `started_at`
- `finished_at` (nullable)
- `error_message` (nullable)

**WorkflowStep**

- `_id` (ObjectId)
- `tenant_id` (Ref → Tenant)
- `workflow_run_id` (Ref → WorkflowRun)
- `step_type` (`classification`, `priority`, `assignee_suggestion`, `reply_draft`)
- `input_snapshot` (JSON)
- `output_snapshot` (JSON)
- `created_at`

Optional v1 (can be added later):

**CannedResponse / Policy**

- `_id` (ObjectId)
- `tenant_id`
- `category`
- `template` (text)

---

## 4. Tenant Resolution & Security Model

- On login, backend identifies user and returns a JWT that includes:
  - `user_id`, `tenant_id`, `role`. [clerk](https://clerk.com/blog/how-to-design-multitenant-saas-architecture)
- Every authenticated request:
  - Extract `tenant_id` from token.
  - All queries use `WHERE tenant_id = currentTenantId`. [acropolium](https://acropolium.com/blog/build-scale-a-multi-tenant-saas/)
- No endpoint accepts `tenant_id` from the client directly (to avoid tenant hopping).

---

## 5. System Architecture (Phase 1)

### 5.1 Frontend

- React SPA with a notion of “current user” and “current tenant” from JWT.
- All API calls send the auth token; no front‑end tenant scoping beyond that.

Views:

- Auth:
  - Signup (creates tenant + first admin user).
  - Login.
- App:
  - Ticket List (scoped to tenant via backend).
  - Ticket Detail (with AI suggestions & reply editor).
  - WorkflowRun Detail.

### 5.2 Backend

- Node/Nest with modules:
  - `auth` (signup/login, `me`),
  - `tenants`,
  - `users`,
  - `tickets`,
  - `workflows`,
  - `ai`.

### 5.3 Agent/Workflow Service

- Module/class implementing `TicketTriageWorkflow`:
  - Takes `tenant_id` + `ticket_id` + `started_by_user_id`.
  - Reads only tenant‑scoped data.
  - Calls LLM and persists workflow data.

### 5.4 Storage & Infra

- DB: Postgres with `tenant_id` on all relevant tables. [learn.microsoft](https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns?view=azuresql)
- Background jobs: in‑process or BullMQ (single queue, multi‑tenant).
- Deployment: 1 API service, 1 frontend service (multi‑tenant at app level).

---

## 6. API Design (Phase 1, Multi‑tenant aware)

All routes are implicitly scoped by `tenant_id` from JWT; no `tenant_id` in request body/query.

### 6.1 Auth & Tenants

- `POST /auth/signup`
  - Body:
    - `tenant_name`
    - `user_name`
    - `email`
    - `password`
  - Behavior:
    - Create new `Tenant`.
    - Create `User` with `role = admin` belonging to this tenant.
    - Return `user`, `tenant`, `access_token`.

- `POST /auth/login`
  - Body: `email, password`
  - Behavior:
    - Find user by email (within any tenant).
    - Return `user`, `tenant`, `access_token`.

- `GET /auth/me`
  - Returns: `user`, `tenant`.

### 6.2 Users

- `GET /users` (admin only)
  - List users in current tenant.

- `POST /users` (admin)
  - Body: `name, email, role`
  - Create user under current tenant with default password or invite flow (for v1 you can keep it simple).

### 6.3 Tickets

- `POST /tickets`
  - Body:
    - `subject`
    - `body`
    - `channel` (`email` | `web_form`)
    - `customer_name?`
    - `customer_email?`
  - Behavior:
    - Create `Ticket` with `tenant_id = currentTenantId`, `status = new`, `created_by_id = currentUserId`.

- `GET /tickets`
  - Query: `status?`, `assignee_id?`, pagination.
  - Return tickets for current tenant only.

- `GET /tickets/:id`
  - Return ticket + replies + last AI suggestion (if needed) for current tenant.

- `PATCH /tickets/:id`
  - Body: any of `status`, `priority`, `category`, `assignee_id`.
  - Update only ticket in current tenant.

### 6.4 Ticket Replies

- `POST /tickets/:id/replies`
  - Body:
    - `body` (string)
  - Behavior:
    - Create `TicketReply` with:
      - `tenant_id = currentTenantId`
      - `author_type = human`
      - `author_id = currentUserId`
    - Update `Ticket.status` → `replied`.

(You may also auto‑send or just treat as “internal reply” in v1.)

### 6.5 Workflows

- `POST /tickets/:id/workflows/triage`
  - Behavior:
    - Verify ticket belongs to current tenant.
    - Start `TicketTriageWorkflow`:
      - Create `WorkflowRun` (`tenant_id`, `ticket_id`, `started_by_user_id`).
      - Run steps (sync in v1).
      - Persist `WorkflowStep`s.
      - Save AI reply draft as `TicketReply` with `author_type = ai` (optional flag `is_draft`).
    - Returns:
      - `workflow_run`
      - `ticket_updates` (suggested `category`, `priority`, `assignee_id`)
      - `ai_reply_draft` (text).

- `GET /workflows/runs/:id`
  - Returns `WorkflowRun` + `WorkflowStep[]` (only if `tenant_id` matches current tenant).

---

## 7. TicketTriageWorkflow (Agentic Flow)

### 7.1 Inputs

- `tenant_id`
- `ticket_id`
- `started_by_user_id`

Workflow always scopes DB calls by `tenant_id`.

### 7.2 Steps

1. **Fetch context**
   - Fetch ticket (tenant‑scoped).
   - Fetch tenant’s users (for assignee suggestions).
   - Optionally fetch canned responses/policies.

2. **Classification**
   - Prompt LLM:
     - “Given this ticket, classify into: bug, feature_request, billing, general, other. Return JSON `{category, reason}`.”
   - Save `WorkflowStep` with `step_type = classification`.

3. **Priority**
   - Prompt LLM:
     - “Based on category + text, decide priority: low, medium, high, urgent; with reason.”
   - Save `WorkflowStep` with `step_type = priority`.

4. **Assignee suggestion**
   - Prompt LLM with list of team members (names + roles or “skills” notes):
     - “Pick best assignee_id or null; explain why.”
   - Save `WorkflowStep` with `step_type = assignee_suggestion`.

5. **Reply draft**
   - Prompt LLM:
     - Use ticket text, category, priority, and optional policies.
     - Draft reply with structure: greeting, summary, answer, next steps.
     - Return `reply_body`.
   - Save `WorkflowStep` with `step_type = reply_draft`.

6. **Persist changes**
   - Update `Ticket` fields with suggested `category`, `priority`, `assignee_id` (but user can override).
   - Create `TicketReply`:
     - `tenant_id = tenant_id`
     - `ticket_id`
     - `author_type = ai`
     - `body = reply_body`.
   - Set `WorkflowRun.status = succeeded`.

7. **Error handling**
   - On failure:
     - `WorkflowRun.status = failed`, `error_message` set.
     - No ticket fields changed unless previous steps succeeded.

---

## 8. Frontend UX (Tenant‑aware, but simple)

### 8.1 Auth & Tenant

- Signup creates tenant + first user:
  - After success, user is logged in and taken to their tenant’s dashboard.
- No tenant selector in v1 (user belongs to exactly one tenant).

### 8.2 Ticket List

- Shows tickets for current tenant only (backend enforced).
- Columns: Subject, Customer, Status, Priority, Category, Assignee, “AI triaged?” indicator.

### 8.3 Ticket Detail

- Header: Subject, customer, created_at, status, priority, category, assignee.
- Body: Ticket content.
- AI Section:
  - If no AI triage yet:
    - Button “Run AI triage”.
  - After AI triage:
    - Show suggested category, priority, assignee (with reasoning tooltips).
    - Reply editor prefilled with AI draft:
      - Buttons: “Save & Mark Replied”, “Save as Draft” (optional).
- Link to Workflow history.

### 8.4 WorkflowRun View

- Timeline UI showing each step:
  - Classification → Priority → Assignee → Reply draft.
- Show `input_snapshot` and `output_snapshot` (pretty‑printed JSON / summary).

---

## 9. Observability

- Each LLM call logs:
  - `tenant_id`, `ticket_id`, `workflow_run_id`, `step_type`, model, latency, success/error. [docs.aws.amazon](https://docs.aws.amazon.com/pdfs/prescriptive-guidance/latest/agentic-ai-multitenant/agentic-ai-multitenant.pdf)
- Logs can live in DB as part of `WorkflowStep` plus application logs.

---

## 10. Non‑Functional Requirements

- Tenant isolation:
  - No data from tenant A ever returned in responses for tenant B (enforced by `tenant_id` checks). [relevant](https://relevant.software/blog/multi-tenant-architecture/)
- Performance:
  - Triage action ≤ 5–8 seconds for typical ticket.
- Safety:
  - Replies avoid promises on money/timelines unless explicitly present.

---

## 11. Build Order (Phase 1, Multi‑tenant aware)

1. Implement DB schema with `Tenant` + `tenant_id` on all relevant collections.
2. Implement signup (create tenant + admin user) and login.
3. Implement `GET /auth/me` and basic frontend auth.
4. Implement ticket CRUD API (scoped by tenant) + frontend list/detail.
5. Implement `TicketTriageWorkflow` with static/mock outputs.
6. Wire up `POST /tickets/:id/workflows/triage` + frontend “Run AI triage” button.
7. Replace mock with real LLM calls and `WorkflowRun`/`WorkflowStep` persistence.
8. Add WorkflowRun detail view.
9. Polish UX and error handling.
