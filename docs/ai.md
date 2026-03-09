Tenant‑Specific Learning + Multi‑LLM + Self‑Improving System\*\*

You are implementing the **intelligence layer** for my SaaS, with these goals:

- Each tenant’s AI gets better over time from **that tenant’s own tickets and decisions**.
- The system can use multiple LLMs via **LangChain**, with a clean abstraction, even if some models are not yet paid for.
- Everything is wired in a way that I can “just drop in” new API keys/models later without refactoring.

Use **MongoDB**, **Node/TypeScript**, **LangChain JS**, and my existing **Gemini API**. Design for multi‑tenant SaaS.

Implement everything below.

---

### 1. Use past tickets as knowledge (per tenant)

Goal: make the AI answer more like the tenant’s best agents by using **previous resolved tickets** in retrieval, alongside KB articles.

1. Extend the data model:
   - For each ticket, ensure we store:
     - `tenantId`
     - `messages` (conversation history)
     - `finalAnswer` (the final human‑sent reply)
     - `status` (e.g. `resolved`)
     - `intent`, `tags`, `createdAt`
   - Create a new collection or view for **ResolvedTicketSnippets**:
     - Fields: `tenantId`, `ticketId`, `intent`, `snippetText`, `finalAnswer`, `createdAt`, `embedding`, `metadata`.

2. Create a **ticket embedding pipeline** (background job):
   - For tickets with `status = resolved` and not yet embedded:
     - Build a text snippet from:
       - Original question + final human answer (shortened if needed).
     - Generate an embedding.
     - Store in a per‑tenant vector index (`resolved_ticket_snippets`) with metadata:
       - `tenantId`, `ticketId`, `intent`, `createdAt`.

3. Update RAG retrieval to use **two sources per tenant**:
   - KB articles index (docs).
   - Resolved ticket snippets index.
   - Retrieval logic:
     - Given a ticket and predicted intent:
       - Retrieve top N KB chunks for `tenantId`.
       - Retrieve top M resolved snippets for `tenantId`, filtered by intent when possible.
       - Merge + rerank (simple scoring is fine for now).
   - Pass both docs and resolved snippets into the answer generation prompt.

4. Update the answer prompt:
   - Explain to the model:
     - “You have two types of context:
       1. Official KB docs (source_of_truth).
       2. Past resolved tickets (examples of how this tenant answers).  
          Use KB as the authority for policies. Use past tickets to match style and phrasing, but do not contradict KB.”

---

### 2. Set up a multi‑LLM architecture with LangChain

Goal: design the code so we can use **multiple models** later (for classification, retrieval, answering) but only pay for what we use now.

1. Create a **ModelRouter** abstraction:
   - A single interface or factory, e.g. `getModel({ task, tenantId })` that returns a LangChain LLM instance.
   - Supported tasks:
     - `classification` (cheap, fast)
     - `answer_generation` (main answer)
     - `self_eval` (optional, hallucination/quality check)

2. Implement initial model routing:
   - For now:
     - Use **Gemini** (existing API) for all tasks.
   - But structure the code so we can easily plug in:
     - OpenAI GPT‑4.x / GPT‑4.1
     - Anthropic Claude
     - Other providers
   - Do not hard‑code provider names in business logic; only inside the ModelRouter.

3. Add configuration for **future models**:
   - Config file or env mapping:
     - `MODEL_CLASSIFICATION = "gemini-1.5-flash"` (cheap, fast)
     - `MODEL_ANSWER = "gemini-1.5-pro"` or similar
     - `MODEL_SELF_EVAL = "gemini-1.5-flash"` (or future cheap model)
   - Leave placeholders for:
     - `OPENAI_API_KEY`, `OPENAI_MODEL_ANSWER`
     - `ANTHROPIC_API_KEY`, etc.
   - The code should check if a provider API key is present; if not, fallback to Gemini.

4. Ensure **per‑task and per‑tenant routing** is possible:
   - The router should be able to:
     - Use cheaper models for classification/self‑eval.
     - Reserve best models for answer_generation when available.
     - In future, allow a specific tenant to opt into a more expensive model plan.

---

### 3. Design a simple self‑improving loop (learning from edits)

Goal: whenever agents correct AI answers, we use that to improve future suggestions for that tenant.

1. Capture agent feedback:
   - For each ticket and suggestion, store:
     - `aiSuggestion` (original text, model, prompt version).
     - Whether the agent:
       - Used as is.
       - Used with edits.
       - Ignored.
   - If edited:
     - Save `finalHumanAnswer` separately and link it to the AI suggestion.

2. Create an `AiCorrection` collection:
   - Fields:
     - `tenantId`
     - `ticketId`
     - `originalQuestion`
     - `aiSuggestion`
     - `finalHumanAnswer`
     - `intent`, `tags`
     - `createdAt`

3. Use corrections in two ways:

   **a) As additional RAG data**
   - For tickets where `finalHumanAnswer` differs significantly from `aiSuggestion`:
     - Create a new resolved snippet (like in step 1) anchored to `finalHumanAnswer`.
     - Index them in the resolved ticket snippets vector store with high importance.
   - This means future answers will naturally pull in corrected patterns as examples.

   **b) To tune prompts and KB** (manual for now)
   - Later, we can add:
     - A script or dashboard that surfaces:
       - Intents with high edit rate.
       - Common phrases added by agents.
   - For now, just make sure data is collected and queryable.

---

### 4. Minimal eval + confidence scoring

Goal: give a basic trust score per answer so agents know when to be more careful, and we can later automate.

1. Add a **self‑evaluation step** (can use same Gemini model for now):
   - After generating an answer:
     - Call a second, quick LLM chain with:
       - The question.
       - Context docs.
       - The answer.
     - Ask it to output JSON with:
       - `faithfulness` (high/medium/low).
       - `completeness` (high/medium/low).
       - `risk` (low/medium/high).
   - Save this in `ticket.ai.confidence`.

2. Use this confidence in UI:
   - Show a small badge in the agent UI:
     - e.g. “AI confidence: High / Medium / Low”.
   - Agents can choose to trust high‑confidence answers more, and double‑check low‑confidence ones.

3. Log all of this for later:
   - For every suggestion, store:
     - `faithfulness`, `completeness`, `risk`.
     - Whether the agent still **used**, **edited**, or **ignored** the answer.

---

### 5. Prepare for future, more powerful models (without using them yet)

Goal: code structure is ready for best‑in‑class models when I can afford them.

1. In the ModelRouter config, add placeholders for:
   - `OPENAI_MODEL_ANSWER = ""`
   - `OPENAI_MODEL_CLASSIFICATION = ""`
   - `ANTHROPIC_MODEL_ANSWER = ""`
   - `COHERE_MODEL_RERANKER = ""` (optional future reranker)

2. Recommendations for future models (don’t call them yet, just prepare):
   - General answer generation:
     - OpenAI GPT‑4.1 (or latest GPT‑4.x)
     - Anthropic Claude 3.x (e.g. Opus/Sonnet)
   - Cheap classification / utility:
     - Gemini “flash” tier
     - OpenAI lower‑cost models
   - Reranking:
     - Cohere Rerank or similar (for better doc selection).

3. Make sure:
   - All calls to LLMs go through the ModelRouter.
   - No direct `new OpenAI(...)` sprinkled around business logic.
   - The only place that knows about providers is the router layer.

---

### 6. Multi‑tenant considerations

Apply multi‑tenant rules everywhere:

- All ticket, KB, snippet, and correction retrieval must filter by `tenantId`.
- Vector indexes must be logically separated per tenant (collections, namespaces, or at least metadata filters).
- Any future automation decisions are done **per tenant**, not globally.

---

### 7. Deliverables

Implement:

- Ticket embedding pipeline for resolved tickets (per tenant).
- Dual‑source RAG retrieval (KB + resolved tickets) and updated prompts.
- ModelRouter abstraction using LangChain JS with Gemini now and placeholders for future models.
- Feedback collection (`AiCorrection`), and using corrected answers as extra RAG data.
- Simple self‑eval / confidence scoring step and storage.
- Strict multi‑tenant scoping in all retrieval and storage.

Keep the implementation simple but clean and production‑oriented. The goal is not full autonomy yet, but a **self‑improving, tenant‑aware copilot** that will be ready to climb the autonomy ladder later.
