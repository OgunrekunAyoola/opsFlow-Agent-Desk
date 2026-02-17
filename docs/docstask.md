# DOCUMENTATION PAGE - BUILDER INSTRUCTIONS

**Goal:** Create a comprehensive, easy-to-navigate documentation site at `/docs`

---

## WHAT WE'RE BUILDING

A documentation site with:

1. **Homepage** - Overview and quick links
2. **Sidebar navigation** - Organized by sections
3. **Search functionality** - Find articles quickly
4. **Individual article pages** - Step-by-step guides with screenshots
5. **Mobile responsive** - Works on all devices

---

## STRUCTURE

```
/docs (homepage)
├── /docs/getting-started/what-is-opsflow
├── /docs/getting-started/quick-start
├── /docs/getting-started/core-concepts
├── /docs/setup/email-forwarding
├── /docs/setup/gmail-setup
├── /docs/setup/outlook-setup
├── /docs/setup/team-management
├── /docs/features/ai-triage
├── /docs/features/auto-reply
├── /docs/features/sentiment-analysis
├── /docs/features/metrics
├── /docs/integrations/zendesk
├── /docs/troubleshooting/faq
└── /docs/troubleshooting/common-issues
```

---

## PAGE LAYOUT

### **Docs Homepage (`/docs`)**

```
┌────────────────────────────────────────────────┐
│ [Logo] [Search bar..................] [Login] │ ← Header (sticky)
├────────────────────────────────────────────────┤
│                                                │
│         OpsFlow Documentation                  │
│   Everything you need to get started          │
│                                                │
│   [Search documentation...]                    │
│                                                │
│   Quick Links:                                 │
│   [🚀 Quick Start] [📧 Email Setup]           │
│   [🤖 AI Features] [❓ FAQ]                    │
│                                                │
│   Browse by Category:                          │
│                                                │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│   │ Getting │ │  Setup  │ │Features │        │
│   │ Started │ │ & Config│ │         │        │
│   │ 3 docs  │ │ 5 docs  │ │ 6 docs  │        │
│   └─────────┘ └─────────┘ └─────────┘        │
│                                                │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│   │Integra- │ │   Use   │ │Trouble- │        │
│   │ tions   │ │  Cases  │ │shooting │        │
│   │ 2 docs  │ │ 4 docs  │ │ 3 docs  │        │
│   └─────────┘ └─────────┘ └─────────┘        │
│                                                │
│   Popular Articles:                            │
│   1. How to forward emails (5 min)            │
│   2. Understanding AI confidence (3 min)       │
│   3. Setting up your team (4 min)             │
│                                                │
└────────────────────────────────────────────────┘
```

### **Article Page Layout**

```
┌────────────────────────────────────────────────┐
│ [Logo] [Search bar..................] [Login] │ ← Header (sticky)
├──────────┬─────────────────────────────────────┤
│          │                                     │
│ SIDEBAR  │  ARTICLE CONTENT                    │
│          │                                     │
│ Getting  │  # Email Forwarding Setup           │
│ Started  │                                     │
│ → What   │  Learn how to route support emails  │
│ → Quick  │  to OpsFlow.                        │
│ → Core   │                                     │
│          │  ## Prerequisites                   │
│ Setup    │  - Gmail or Outlook account         │
│ → Email  │  - 5 minutes                        │
│ → Gmail  │                                     │
│ → Outlook│  ## Step 1: Get Inbound Email       │
│ → Team   │  1. Go to Settings → Email          │
│          │  2. Copy your address               │
│ Features │                                     │
│ → AI     │  [Screenshot]                       │
│ → Auto   │                                     │
│          │  ## Step 2: Configure Gmail         │
│ (etc)    │  1. Open Gmail settings...          │
│          │                                     │
│          │  [Screenshot]                       │
│          │                                     │
│          │  💡 Tip: Keep copy in Gmail         │
│          │                                     │
│ [Help?]  │  ---                                │
│          │  Was this helpful? 👍 👎            │
│          │                                     │
│          │  Next: [Outlook Setup →]            │
│          │  Related: [Team Setup] [FAQ]        │
│          │                                     │
└──────────┴─────────────────────────────────────┘
```

---

## TECHNICAL REQUIREMENTS

### **1. Routing**

```
/docs → Docs homepage
/docs/[category]/[article] → Article page

Examples:
/docs/getting-started/quick-start
/docs/setup/gmail-setup
/docs/features/ai-triage
```

### **2. Data Storage**

**Option A: Markdown files** (Recommended - Simpler)

```
/content/docs/
├── getting-started/
│   ├── what-is-opsflow.md
│   ├── quick-start.md
│   └── core-concepts.md
├── setup/
│   ├── email-forwarding.md
│   ├── gmail-setup.md
│   └── outlook-setup.md
└── features/
    ├── ai-triage.md
    └── auto-reply.md
```

Each markdown file has frontmatter:

```markdown
---
title: 'Quick Start Guide'
category: 'Getting Started'
readTime: '5 min'
updatedAt: '2026-02-17'
---

# Quick Start Guide

Get OpsFlow running in 5 minutes...
```

**Option B: Database** (More flexible)

```
Database collection: docs
Each doc:
{
  id: "quick-start",
  title: "Quick Start Guide",
  category: "Getting Started",
  content: "markdown content here...",
  readTime: "5 min",
  updatedAt: "2026-02-17"
}
```

### **3. Components Needed**

**DocsLayout Component:**

```jsx
<DocsLayout>
  <DocsSidebar categories={categories} />
  <DocsContent>{/* Article content here */}</DocsContent>
</DocsLayout>
```

**DocsSidebar Component:**

- Collapsible sections (Getting Started, Setup, Features, etc.)
- Active page highlighted
- Sticky sidebar (stays visible on scroll)

**DocsContent Component:**

- Renders markdown to HTML
- Syntax highlighting for code blocks
- Image support
- Anchor links for headings
- Table of contents (auto-generated from headings)

**DocsSearch Component:**

- Search input at top
- Search across all doc titles and content
- Show results with excerpts
- Use Algolia DocSearch (free for open source) or simple client-side search

### **4. Features**

**Must Have:**

- ✅ Markdown rendering (use: react-markdown or next-mdx-remote)
- ✅ Syntax highlighting for code (use: prism.js or highlight.js)
- ✅ Responsive sidebar (collapsible on mobile)
- ✅ Breadcrumbs (Home > Setup > Gmail Setup)
- ✅ "Was this helpful?" feedback buttons
- ✅ "Next" and "Related" article links
- ✅ Mobile responsive

**Nice to Have:**

- Search functionality
- Copy code button
- Dark mode toggle
- Progress bar (how far you've scrolled)
- Table of contents for long articles
- Last updated timestamp

### **5. Styling**

**Style Guide:**

```
Colors:
- Background: White (#FFFFFF)
- Sidebar bg: Light gray (#F8F9FA)
- Text: Dark gray (#1A1A1A)
- Links: Blue (#4169E1)
- Code blocks: Dark (#2D3748) with syntax colors

Typography:
- Headings: Bold, larger sizes
- Body: 16px, line-height 1.6
- Code: Monospace font (Fcourier, Monaco)

Spacing:
- Generous padding (24px between sections)
- Max content width: 800px (readable)
```

**Reference sites to copy style from:**

- stripe.com/docs (clean, professional)
- vercel.com/docs (modern, beautiful)
- tailwindcss.com/docs (excellent navigation)

---

## CONTENT TO CREATE

### **Phase 1 (Launch - Priority P0):**

Create these 8 articles first:

1. **Getting Started**
   - What is OpsFlow? (1 page)
   - Quick Start Guide (1 page)
   - Core Concepts (1 page)

2. **Setup**
   - Email Forwarding Setup (1 page)
   - Gmail Setup (1 page)
   - Outlook Setup (1 page)

3. **Troubleshooting**
   - FAQ (1 page)
   - Common Issues (1 page)

### **Phase 2 (Week 2-3):**

Add 10 more articles:

4. **Features**
   - AI Triage & Classification
   - Auto-Reply System
   - Sentiment Analysis
   - Metrics Dashboard
   - Team Management

5. **Integrations**
   - Zendesk Integration
   - Intercom Integration

6. **Use Cases**
   - For E-commerce
   - For SaaS Companies
   - For Agencies

---

## ACCEPTANCE CRITERIA

**Definition of Done:**

- [ ] Docs homepage displays with all categories
- [ ] At least 8 articles published (Phase 1)
- [ ] Sidebar navigation works
- [ ] Articles render markdown correctly
- [ ] Code blocks have syntax highlighting
- [ ] Screenshots display properly
- [ ] Mobile responsive (test on 375px width)
- [ ] Links work (no 404s)
- [ ] Search bar present (even if not functional yet)
- [ ] "Was this helpful?" buttons present
- [ ] Breadcrumbs show current location
- [ ] Can navigate between articles easily

---

## TOOLS & LIBRARIES

**Recommended Stack:**

```bash
# Markdown rendering
npm install react-markdown remark-gfm

# Syntax highlighting
npm install prismjs

# Or use Next.js MDX
npm install @next/mdx @mdx-js/loader @mdx-js/react

# Search (optional)
npm install fuse.js # Client-side search
# OR use Algolia DocSearch (free tier)
```

---

## EXAMPLE FILE STRUCTURE

```
src/
├── pages/
│   └── docs/
│       ├── index.tsx (docs homepage)
│       └── [...slug].tsx (catch-all for articles)
├── components/
│   └── docs/
│       ├── DocsLayout.tsx
│       ├── DocsSidebar.tsx
│       ├── DocsContent.tsx
│       ├── DocsSearch.tsx
│       └── DocsBreadcrumbs.tsx
├── content/
│   └── docs/ (markdown files here)
└── lib/
    └── docs.ts (helper functions to read markdown)
```

---

## FOUNDER'S RESPONSIBILITY

**👔 YOU will provide:**

1. **All written content** for the 8 articles (Phase 1)
   - Write in Google Docs or Notion
   - Include where screenshots should go: `[Screenshot: Gmail settings page]`
   - Send to builder

2. **Screenshots** for each article
   - Take screenshots of actual OpsFlow UI
   - Annotate with arrows/highlights using Figma or Snagit
   - Name files clearly: `gmail-forwarding-step1.png`

3. **Review and approve** once builder implements

---

## TIMELINE

**Week 1 (Builder):**

- Day 1-2: Set up docs routing and layout
- Day 3-4: Build sidebar, content rendering, search
- Day 5: Mobile responsive, final touches

**Week 1 (Founder - Parallel):**

- Day 1-3: Write all 8 article contents
- Day 4-5: Take and annotate screenshots
- Day 5: Send all content to builder

**Week 2:**

- Builder implements content
- Founder reviews and requests changes
- Launch docs page

---

## SIMPLEST MVP APPROACH

If time is tight, do this:

1. Create `/docs` page with simple layout
2. Use plain HTML (no markdown parser needed initially)
3. Write articles directly in JSX/TSX files
4. Add proper markdown rendering later
5. Focus on content quality over fancy features

**Priority:** Good content > Fancy features

---

**Questions for builder?**

- Prefer markdown files or database storage?
- Need help with markdown rendering library?
- Want example component code?
