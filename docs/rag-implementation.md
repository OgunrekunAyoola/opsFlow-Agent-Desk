You're absolutely right. Let me restart this documentation properly - **no code**, strategic decisions only, and **consistent with your actual stack**.

---

# RAG IMPLEMENTATION DOCUMENTATION - OPSFLOW

**Version:** 1.0  
**Date:** February 18, 2026  
**Your Stack:** NestJS + MongoDB + Gemini AI + React

---

## PART 1: STRATEGIC DECISIONS

### **Decision 1: Embedding Provider**

**Problem:** Need to convert text into vectors (numbers) for similarity search.

**Options:**

```
A. OpenAI Embeddings ($0.02 per 1M tokens)
B. Google Gemini Embeddings (Free with Gemini API) ✓
C. Open source models (Free but need hosting)
```

**DECISION: Use Gemini Embeddings**

**Why:**

- You already use Gemini for AI generation
- It's FREE (included in your existing Gemini API key)
- Same provider = simpler billing, one API key
- Good quality (768 dimensions)
- No need for OpenAI account

**Strike my earlier recommendation of OpenAI** - that was wrong given you're already on Gemini. Stay consistent.

---

### **Decision 2: Vector Storage**

**Problem:** Where to store the vector embeddings?

**Options:**

```
A. Pinecone (managed, $70/month)
B. MongoDB Atlas Vector Search (you already have MongoDB) ✓
C. Weaviate/Qdrant (self-hosted, complex)
D. Supabase pgvector (you don't use Postgres)
```

**DECISION: MongoDB Atlas Vector Search**

**Why:**

- You already use MongoDB Atlas
- No additional service to manage
- No additional cost (included in your Atlas tier)
- Vectors stored alongside your existing data
- Simpler architecture (one database, not two)

---

### **Decision 3: Document Formats to Support**

**Phase 1 (MVP - Week 1-2):**

- Markdown files (.md) - for your docs
- Plain text (.txt) - for FAQs
- URLs (scrape websites) - for external docs

**Phase 2 (Week 3-4):**

- PDF files - for client manuals
- Word documents (.docx) - for client docs

**Phase 3 (Later):**

- Past successful tickets - learn from history
- Google Docs (via API) - for clients who use Google

**Rationale:** Start simple (text-based), add complexity as needed.

---

### **Decision 4: Chunking Strategy**

**Problem:** Documents too long for AI context window. Need to split.

**Strategy:**

```
Chunk size: 600 tokens (~500 words)
Overlap: 100 tokens (prevent losing context at boundaries)
Split at: Paragraph breaks, headings, sentences (semantic boundaries)
```

**Why 600 tokens:**

- Gemini context window: 32k tokens
- Typical ticket: 200 tokens
- 5 chunks retrieved: 3000 tokens
- Your prompt + instructions: ~500 tokens
- AI response: ~200 tokens
- Total: ~4000 tokens (well within limit, room to grow)

**Discard:** Chunks smaller than 100 tokens (too little context)

---

### **Decision 5: Retrieval Method**

**Phase 1: Vector Search Only**

- Search by semantic similarity
- Top 5 most relevant chunks
- Filter by organizationId (client-specific)

**Phase 2: Hybrid Search (Vector + Keyword)**

- Vector search: semantic meaning
- Keyword search: exact matches (product names, error codes)
- Combine results, re-rank

**Phase 3: Reranking Model**

- Cross-encoder model re-ranks results
- More accurate than vector similarity alone

**Start with Phase 1, iterate based on accuracy.**

---

## PART 2: SYSTEM ARCHITECTURE

### **Data Flow:**

```
INGESTION (one-time per document):
1. Client uploads PDF/DOCX/URL
2. Extract text from document
3. Split into 600-token chunks
4. Convert each chunk to vector (Gemini embeddings)
5. Store in MongoDB:
   - Original document
   - Chunks with vectors
   - Metadata (title, type, client)

RETRIEVAL (every ticket):
1. Ticket arrives: "Why was I charged twice?"
2. Convert ticket text to vector (Gemini)
3. Search MongoDB vector index
4. Find top 5 similar chunks (same client only)
5. Return chunks with metadata

GENERATION (after retrieval):
1. Build prompt:
   "Context: [5 retrieved chunks]
    Ticket: [customer message]
    Instructions: Answer using ONLY the context"
2. Send to Gemini
3. Gemini generates reply grounded in context
4. Return draft with citations
```

---

## PART 3: DATABASE DESIGN

### **Collections Needed:**

**1. documents (new collection)**

```
Purpose: Store original uploaded documents

Fields:
- _id
- organizationId (which client owns this)
- title (filename or doc title)
- content (full text extracted)
- type (uploaded, scraped, manual)
- url (if scraped from web)
- metadata (author, category, language)
- vectorized (boolean: has this been processed?)
- status (active, archived)
- createdAt, updatedAt
```

**2. chunks (new collection)**

```
Purpose: Store chunked text with vector embeddings

Fields:
- _id
- documentId (parent document)
- organizationId (client, for filtering)
- chunkIndex (position: 0, 1, 2...)
- content (chunk text, ~500 words)
- embedding (array of 768 numbers - Gemini vector)
- metadata (documentTitle, documentType, section)
- createdAt

Vector Index:
- Index on 'embedding' field
- Cosine similarity
- Filter by organizationId
```

**3. retrieval_cache (new collection, optional)**

```
Purpose: Cache search results for common queries

Fields:
- queryHash (MD5 of query text)
- organizationId
- results (array of chunk IDs)
- createdAt
- expiresAt (TTL index, auto-delete after 1 hour)

Why: Avoid re-embedding same questions
```

---

## PART 4: INTEGRATION WITH EXISTING SYSTEM

### **Where RAG Fits in Current OpsFlow:**

**Current AI Flow (without RAG):**

```
Ticket created
→ AI triage service (category, priority, sentiment)
→ AI draft service (generate reply with Gemini)
→ Store draft in ticket.aiDraft
```

**New RAG-Enhanced Flow:**

```
Ticket created
→ AI triage service (category, priority, sentiment)
→ **RAG SERVICE:**
   1. Search knowledge base (retrieve 5 chunks)
   2. Build context-aware prompt
   3. Generate reply with Gemini + context
→ Store draft + citations in ticket.aiDraft
```

**Changes to existing code:**

- AI draft service now calls RAG service first
- Prompt construction changes (add context section)
- Response now includes source citations
- Rest of system unchanged

---

## PART 5: KNOWLEDGE BASE SOURCES

### **What Knowledge to Ingest:**

**OpsFlow Global Knowledge (shared across all clients):**

```
1. Your product documentation
   - Getting Started guide
   - Email forwarding setup
   - Feature explanations (AI triage, auto-reply)
   - API documentation
   - Troubleshooting guides
   - FAQ

Location: /content/docs folder (markdown files)
OrganizationId: null (global)
```

**Client-Specific Knowledge (per organization):**

```
1. Client uploads their product docs
   - Client's user manual
   - Client's FAQ
   - Client's policies (refund, shipping, etc.)

2. Auto-generated from past tickets
   - Successful resolutions
   - Templates agent used
   - Common customer questions

Location: Uploaded via /dashboard/knowledge-base
OrganizationId: specific client ID
```

**Prioritization in retrieval:**

```
1. Client-specific docs (highest priority)
2. Past successful tickets from same client
3. OpsFlow global docs (if no client match)
```

---

## PART 6: PROMPT ENGINEERING

### **Prompt Structure with RAG:**

**Template:**

```
ROLE:
You are an AI support agent for [Client Name].

CONTEXT (from knowledge base):
[Chunk 1 - Source: Setup Guide]
[relevant text...]

[Chunk 2 - Source: FAQ]
[relevant text...]

[Chunk 3 - Source: Product Manual]
[relevant text...]

CUSTOMER TICKET:
From: customer@email.com
Subject: [ticket subject]
Message: [ticket body]

INSTRUCTIONS:
1. Answer the customer's question using ONLY the context provided above
2. If context doesn't contain the answer, say: "I don't have enough information. A human agent will help you."
3. Include citations: [Source: Setup Guide] when referencing context
4. Be helpful, concise, professional
5. Match [Client Name]'s tone: [formal/casual/friendly]

DRAFT REPLY:
```

**Key Principles:**

```
✓ Ground response in retrieved context
✓ Prevent hallucination (don't make up info)
✓ Cite sources (transparency)
✓ Graceful degradation (admit when don't know)
✓ Client-specific tone
```

---

## PART 7: USER EXPERIENCE

### **For Clients (Dashboard):**

**New Page: /dashboard/knowledge-base**

```
Sections:
1. Upload Documents
   - Drag-drop or file picker
   - Supported: PDF, DOCX, TXT, URLs
   - Progress bar during processing
   - "Indexing... 73% complete"

2. Document Library
   - List all uploaded docs
   - Show: title, type, upload date, status
   - Actions: view, delete, re-index
   - Search/filter by category

3. Statistics
   - Total documents: 24
   - Total chunks: 486
   - AI using knowledge: 87% of replies
   - Most referenced doc: "Product Manual v2"
```

**AI Draft Display (Enhanced):**

```
[Existing ticket detail page]

AI Draft Reply:
[generated text with inline citations]

"To reset your password, go to Settings > Security [Source: Setup Guide].
Click 'Reset Password' and check your email for the link [Source: FAQ]."

Sources Used:
• Setup Guide (uploaded 2 weeks ago)
• FAQ (uploaded 1 month ago)

[Buttons: Send as-is | Edit | Discard]
```

---

## PART 8: IMPLEMENTATION PHASES

### **Phase 1: Foundation (Week 1-2)**

**Goal:** Basic RAG working with your OpsFlow docs

**Tasks - Builder:**

- [ ] Install Gemini SDK with embeddings
- [ ] Create documents and chunks collections
- [ ] Set up MongoDB Atlas Vector Search index
- [ ] Build document ingestion service (markdown parser)
- [ ] Build chunking service (split text into 600-token chunks)
- [ ] Build embedding service (Gemini text-embedding)
- [ ] Build vector search service (MongoDB Atlas query)
- [ ] Integrate into AI draft generation
- [ ] Test with 10 sample docs

**Tasks - Founder:**

- [ ] Gather 15-20 key OpsFlow documentation articles
- [ ] Convert to markdown format
- [ ] Organize by category (Setup, Features, Troubleshooting)
- [ ] Test: ask questions, verify AI uses docs

**Success Metric:**

- AI references documentation in 70%+ of replies
- Responses are more specific and helpful
- No hallucinations about features that don't exist

---

### **Phase 2: Client Upload (Week 3-4)**

**Goal:** Clients can upload their own knowledge base

**Tasks - Builder:**

- [ ] Build /dashboard/knowledge-base UI
- [ ] Support PDF and DOCX parsing
- [ ] Support URL scraping (Puppeteer)
- [ ] Filter retrieval by organizationId
- [ ] Add document management (view, delete)
- [ ] Background job for processing (BullMQ queue)
- [ ] Show processing status in UI

**Tasks - Founder:**

- [ ] Create "How to Add Knowledge Base" guide
- [ ] Onboard 2-3 beta clients with their docs
- [ ] Measure accuracy improvement with client docs
- [ ] Collect feedback on upload experience

**Success Metric:**

- Client can upload docs in <3 minutes
- AI accuracy improves from 70% to 85% with client docs
- No data leakage (client A never sees client B docs)

---

### **Phase 3: Hybrid Search (Week 5-6)**

**Goal:** Better retrieval accuracy with keyword + vector

**Tasks - Builder:**

- [ ] Add MongoDB full-text search index
- [ ] Implement keyword search alongside vector
- [ ] Combine results (hybrid fusion)
- [ ] Add optional reranking model
- [ ] A/B test: vector-only vs hybrid
- [ ] Optimize chunk size (test 400, 600, 800)

**Tasks - Founder:**

- [ ] Create test set: 50 questions with known answers
- [ ] Measure precision and recall
- [ ] Target: 90%+ accuracy on test set

**Success Metric:**

- Retrieval accuracy improves by 10-15%
- Edge cases (product names, error codes) handled better

---

### **Phase 4: Learning Loop (Week 7-8)**

**Goal:** System learns from human corrections

**Tasks - Builder:**

- [ ] Track when agent edits AI draft
- [ ] Store feedback: (query, retrieved docs, AI draft, human edit)
- [ ] Build analytics: which docs most useful
- [ ] Add "Was this helpful?" button on drafts
- [ ] Dashboard: RAG performance metrics

**Tasks - Founder:**

- [ ] Review "unhelpful" drafts monthly
- [ ] Identify knowledge gaps
- [ ] Add missing documentation
- [ ] Iterate on prompt engineering

**Success Metric:**

- AI accuracy increases 5% per month
- Time-to-resolution decreases
- Customer satisfaction increases

---

## PART 9: COST ESTIMATION

**Monthly Costs (at scale):**

```
Gemini Embeddings: FREE (included in Gemini API)

MongoDB Atlas Vector Search:
- Free tier: 512MB storage (enough for ~50K chunks)
- M10 tier: $57/month (5GB storage, ~500K chunks)
- Estimate: $0-57/month depending on doc volume

Gemini API (generation):
- Current: ~$X/month (you're already paying this)
- Additional: 10-20% increase (longer prompts with context)
- Estimate: +$20-50/month

Total Additional Cost: $20-100/month
ROI: Massive (better AI accuracy = fewer human interventions)
```

---

## PART 10: SUCCESS METRICS

**Track These KPIs:**

```
Retrieval Quality:
- Retrieval precision: % of retrieved docs actually relevant
- Retrieval recall: % of relevant docs successfully retrieved
- Target: >85% precision, >75% recall

Generation Quality:
- AI draft acceptance rate: % of drafts sent without editing
- Human edit rate: % of drafts requiring editing
- Citation accuracy: % of citations actually relevant
- Target: >70% acceptance, <30% edit

Business Impact:
- Tickets resolved by AI (no human touch): %
- Average response time: decrease
- Customer satisfaction: increase
- Agent time saved: hours/week
```

---

## PART 11: RISKS & MITIGATION

**Risk 1: Poor retrieval quality**

```
Symptom: AI retrieves irrelevant documents
Causes: Bad chunking, wrong query formulation
Mitigation: Test with real tickets, optimize chunk size, improve query extraction
```

**Risk 2: Data leakage between clients**

```
Symptom: Client A sees Client B's documents
Causes: Missing organizationId filter
Mitigation: Always filter by organizationId, add tests, security audit
```

**Risk 3: Slow response time**

```
Symptom: AI takes >5 seconds to reply
Causes: Embedding generation, vector search, LLM generation all serial
Mitigation: Cache embeddings for common queries, batch processing, optimize index
```
