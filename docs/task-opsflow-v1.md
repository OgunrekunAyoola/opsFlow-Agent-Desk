Below is a `tasks.md` you can drop straight into the repo for **OpsFlow Agent Desk (v1, multi‑tenant, ticket triage workflow)**.

***

# tasks.md

## Overview

Goal: Build a multi‑tenant, production‑ish MVP of **OpsFlow Agent Desk** that lets agencies:

- Sign up their own workspace (tenant).  
- Add team members.  
- Create and view tickets.  
- Run AI ticket triage (classify, prioritize, suggest assignee, draft reply).  
- Review workflow history per ticket.

***

## Phase 0 – Project setup

- [ ] Create mono‑repo or separate folders for `backend/` and `frontend/`.  
- [ ] Initialize backend (Node/Nest or preferred framework).  
- [ ] Initialize frontend (React + router + basic layout).  
- [ ] Set up shared `.editorconfig`, `.prettierrc`, `.eslintrc`.  
- [ ] Add base `README.md` with short product description and v1 scope.  
- [ ] Set up `.env.example` for backend and frontend.

***

## Phase 1 – Database & multi‑tenant schema

- [ ] Choose DB (MongoDB).
- [ ] Set up ODM (Mongoose) or Prisma (MongoDB).
- [ ] Create `tenants` collection:
  - [ ] `_id`, `name`, `slug`, timestamps.
- [ ] Create `users` collection:
  - [ ] `_id`, `tenant_id`, `name`, `email`, `password_hash`, `role`, timestamps.
  - [ ] Add unique index on `(tenant_id, email)`.
- [ ] Create `tickets` collection:
  - [ ] `_id`, `tenant_id`, `subject`, `body`, `channel`, `status`, `priority`, `category`, `customer_name`, `customer_email`, `assignee_id`, `created_by_id`, timestamps.
- [ ] Create `ticket_replies` collection:
  - [ ] `_id`, `tenant_id`, `ticket_id`, `author_type`, `author_id`, `body`, `created_at`.
- [ ] Create `workflow_runs` collection:
  - [ ] `_id`, `tenant_id`, `type`, `ticket_id`, `status`, `started_by_user_id`, `started_at`, `finished_at`, `error_message`.
- [ ] Create `workflow_steps` collection:
  - [ ] `_id`, `tenant_id`, `workflow_run_id`, `step_type`, `input_snapshot` (JSON), `output_snapshot` (JSON), `created_at`.
- [ ] Setup Mongoose schemas and verify indexes.

***

## Phase 2 – Auth & tenant handling

### Backend

- [ ] Implement password hashing and JWT utils.  
- [ ] Implement `POST /auth/signup`:
  - [ ] Accept `tenant_name`, `user_name`, `email`, `password`.  
  - [ ] Create `Tenant`.  
  - [ ] Create first `User` as `admin` with `tenant_id`.  
  - [ ] Return `user`, `tenant`, `access_token` (JWT includes `user_id`, `tenant_id`, `role`).  
- [ ] Implement `POST /auth/login`:
  - [ ] Accept `email`, `password`.  
  - [ ] Find user, verify password.  
  - [ ] Return `user`, `tenant`, `access_token`.  
- [ ] Implement `GET /auth/me`:
  - [ ] Read token, return `user`, `tenant`.  

### Tenant scoping middleware

- [ ] Create auth middleware/guard that:
  - [ ] Decodes JWT.  
  - [ ] Attaches `currentUser` and `currentTenantId` to request context.  
- [ ] Ensure all protected routes **never** accept `tenant_id` from request body/query.  
- [ ] Add helper to enforce scoping: e.g., `where tenant_id = currentTenantId` on every query.

### Frontend

- [ ] Implement auth context/store for `user`, `tenant`, `token`.  
- [ ] Build signup page (tenant + first user).  
- [ ] Build login page.  
- [ ] Protect app routes (redirect unauthenticated users to login).  

***

## Phase 3 – Users & team management

### Backend

- [ ] Implement `GET /users` (admin only):
  - [ ] Return users for `currentTenantId`.  
- [ ] Implement `POST /users` (admin only):
  - [ ] Create user with `tenant_id = currentTenantId`.  
  - [ ] Simple password generation or invite placeholder for v1.  

### Frontend

- [ ] Create “Team” page:
  - [ ] List users with name, email, role.  
  - [ ] Form to add new user (admin only).  
- [ ] Guard “Team” page behind `role === admin`.

***

## Phase 4 – Ticket CRUD & basic UI

### Backend

- [ ] Implement `POST /tickets`:
  - [ ] Create ticket with `tenant_id = currentTenantId`, `status = new`, `created_by_id = currentUserId`.  
- [ ] Implement `GET /tickets`:
  - [ ] Support filters: `status?`, `assignee_id?`, pagination.  
  - [ ] Scope to `tenant_id = currentTenantId`.  
- [ ] Implement `GET /tickets/:id`:
  - [ ] Return ticket + replies (tenant‑scoped).  
- [ ] Implement `PATCH /tickets/:id`:
  - [ ] Allow updating `status`, `priority`, `category`, `assignee_id` (tenant‑scoped).  

### Frontend

- [ ] Create layout with sidebar/topbar (e.g., Tickets, Team, Settings).  
- [ ] Tickets list page:
  - [ ] Fetch `/tickets`.  
  - [ ] Display columns: Subject, Customer, Status, Priority, Category, Assignee, CreatedAt.  
  - [ ] Row click → Ticket detail.  
- [ ] Ticket detail page:
  - [ ] Show ticket header (subject, customer, status, priority, category, assignee).  
  - [ ] Show ticket body.  
  - [ ] Show existing replies (if any).  
  - [ ] Provide manual reply form as fallback (POST `/tickets/:id/replies`).  

***

## Phase 5 – Workflow & AI integration (TicketTriageWorkflow)

### Backend – Workflow scaffolding

- [ ] Define `TicketTriageWorkflow` service/class:
  - [ ] Method: `run({ tenantId, ticketId, startedByUserId })`.  
- [ ] Add `WorkflowRun` creation:
  - [ ] On start, create `workflow_runs` row with `status = running`.  
- [ ] Add function to append `WorkflowStep` entries:
  - [ ] Save `step_type`, `input_snapshot`, `output_snapshot`.  

### Backend – LLM integration basics

- [ ] Choose LLM provider and SDK.  
- [ ] Set env variables for API keys.  
- [ ] Implement generic `callLLM(prompt, schema)` helper.  
- [ ] Implement error handling and retry for LLM calls (basic).

### Backend – Triaging steps

For each step, define **input**, **prompt**, **output JSON**, and persistence.

1. **Classification step**
   - [ ] Fetch ticket (tenant‑scoped).  
   - [ ] Build prompt for classification.  
   - [ ] Define output JSON:
     ```json
     {
       "category": "bug | feature_request | billing | general | other",
       "reason": "string"
     }
     ```  
   - [ ] Call LLM, parse JSON.  
   - [ ] Save `WorkflowStep` (`classification`).  

2. **Priority step**
   - [ ] Build prompt using ticket text + category.  
   - [ ] Define output JSON:
     ```json
     {
       "priority": "low | medium | high | urgent",
       "reason": "string"
     }
     ```  
   - [ ] Save `WorkflowStep` (`priority`).  

3. **Assignee suggestion step**
   - [ ] Fetch tenant’s users (id, name, role).  
   - [ ] Build prompt with ticket text + team snapshot.  
   - [ ] Define output JSON:
     ```json
     {
       "assignee_user_id": "uuid or null",
       "reason": "string"
     }
     ```  
   - [ ] Save `WorkflowStep` (`assignee_suggestion`).  

4. **Reply draft step**
   - [ ] Build prompt using ticket text, category, priority (and maybe simple “policies”).  
   - [ ] Define output JSON:
     ```json
     {
       "reply_body": "string"
     }
     ```  
   - [ ] Save `WorkflowStep` (`reply_draft`).  

5. **Persist final suggestions**
   - [ ] Update `Ticket` fields (`category`, `priority`, `assignee_id`) based on outputs.  
   - [ ] Create `TicketReply` with:
     - `tenant_id`, `ticket_id`, `author_type = "ai"`, `body = reply_body`.  
   - [ ] Mark `WorkflowRun.status = succeeded`, `finished_at = now()`.  
   - [ ] On any error:
     - Set `WorkflowRun.status = failed`, `error_message`.  

### Backend – Workflow endpoints

- [ ] Implement `POST /tickets/:id/workflows/triage`:
  - [ ] Validate ticket belongs to current tenant.  
  - [ ] Call `TicketTriageWorkflow.run`.  
  - [ ] Return:
    - `workflow_run`  
    - `ticket` (updated)  
    - `ai_reply_draft`  

- [ ] Implement `GET /workflows/runs/:id`:
  - [ ] Fetch `WorkflowRun` + `WorkflowStep[]` for current tenant.  

***

## Phase 6 – Frontend AI workflow UX

### Ticket detail – AI section

- [ ] If ticket has **no** triage workflow:
  - [ ] Show “Run AI Triage” button.  
  - [ ] On click:
    - [ ] Call `POST /tickets/:id/workflows/triage`.  
    - [ ] Show loading state while waiting.  

- [ ] After triage completes:
  - [ ] Show AI‑suggested:
    - Category (with reasoning tooltip).  
    - Priority (with reasoning tooltip).  
    - Assignee (with reasoning tooltip).  
  - [ ] Allow user to override category/priority/assignee (edits call `PATCH /tickets/:id`).  
  - [ ] Show AI reply draft in an editable textarea.  
  - [ ] Provide buttons:
    - [ ] “Save & Mark Replied” → create human reply (or reuse AI reply) and set `status = replied`.  
    - [ ] Optional: “Save Draft” without changing status.  

### Workflow history UI

- [ ] Create WorkflowRun detail view:
  - [ ] Show `status`, `started_at`, `finished_at`.  
  - [ ] Render list of steps in order:
    - Step name (classification, priority, etc.).  
    - Input summary.  
    - Output summary (category/priority/assignee/reply preview).  
- [ ] Add link “View Workflow History” on ticket detail (if workflow exists).

***

## Phase 7 – Observability & logging

- [ ] Add structured logs for each workflow run:
  - [ ] `tenant_id`, `ticket_id`, `workflow_run_id`, `step_type`, model, latency, success/error.  
- [ ] Optionally create `GET /admin/logs` (internal use) or rely on DB + app logs for now.  
- [ ] Add basic metrics collection hook (even if only logging to console in v1).

***

## Phase 8 – UX polish & guardrails

- [ ] Implement global loading & error states for API calls.  
- [ ] Validate forms (signup, login, create ticket, add user).  
- [ ] Add simple branding (logo + colors) and rename app as “OpsFlow Agent Desk” in UI.  
- [ ] Refine reply draft prompt to avoid:
  - [ ] Pricing promises.  
  - [ ] Hard deadlines.  
  - [ ] Refund/credit commitments.  
- [ ] Add copy hints in UI about human review (“You’re responsible for final approval of AI replies.”).

***

## Phase 9 – Demo data & documentation

- [ ] Create seed script:
  - [ ] Seed one demo tenant with 2–3 users (admin + members).  
  - [ ] Seed tickets representing common cases (bug, billing, feature request, general).  
- [ ] Capture screenshots/gifs of:
  - [ ] Ticket list.  
  - [ ] Ticket detail before triage.  
  - [ ] Ticket detail after triage.  
  - [ ] Workflow history view.  
- [ ] Update `README.md`:
  - [ ] Stack description.  
  - [ ] Multi‑tenant model explanation.  
  - [ ] TicketTriageWorkflow diagram.  
  - [ ] Setup/run instructions.  
  - [ ] “How to demo” steps.

***

## Phase 10 – Nice‑to‑have (optional for v1)

- [ ] Add simple settings page for tenant:
  - [ ] Update tenant name.  
  - [ ] Store minimal “policies” text used in prompts.  
- [ ] Add filter/search on ticket list.  
- [ ] Make triage workflow async via job queue (enqueue run, poll status).  
- [ ] Add more refined evaluation/guardrail logic for replies.

***

This `tasks.md` is meant to be executable: you can open it during sprints, tick things off, and extend it as you discover more.