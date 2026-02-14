Below is a ready‑to‑drop `docs/ui-spec-opsflow-v1.md` for your bright AI‑robot style.

---

# OpsFlow Agent Desk – UI Spec (v1)

Visual direction: **Bright, friendly AI robot** with light surfaces, colorful gradients, and playful but clean UI. This spec is the visual reference for all marketing and product screens.

---

## 1. Visual Concept

**Mood**

- Bright, airy, optimistic; feels like a helpful AI friend, not a dark hacker cockpit. [digitalupward](https://www.digitalupward.com/blog/2026-web-design-trends-glassmorphism-micro-animations-ai-magic/)
- Primary character: a simple, cute AI robot that appears in hero, empty states, and AI actions. [dribbble](https://dribbble.com/tags/ai-robot)

**Tone**

- Friendly and human: short, clear copy, no jargon.
- Interfaces should feel approachable for non‑technical agency people.

---

## 2. Design System

### 2.1 Colors

**Backgrounds**

- `bg.page`: `#F7F8FF` – main page background (very light, slightly blue).
- `bg.panel`: `rgba(255, 255, 255, 0.85)` – for cards/panels with glassmorphism. [onyx8agency](https://onyx8agency.com/blog/glassmorphism-inspiring-examples/)

**Gradients**

- `grad.main`: `linear-gradient(135deg, #FF80BF, #A855FF, #3B82F6)` – main CTA and highlight gradient. [uxpilot](https://uxpilot.ai/blogs/glassmorphism-ui)
- `grad.soft`: `linear-gradient(135deg, #FDE68A, #A5B4FC)` – secondary highlight or backgrounds.

**Accents**

- `accent.primary`: `#3B82F6` – primary blue.
- `accent.secondary`: `#F97316` – warm orange.
- `accent.pink`: `#EC4899`.

**Text**

- `text.primary`: `#0F172A`.
- `text.muted`: `#6B7280`.

**Status / priority chips**

- Success: `#22C55E`.
- Warning: `#FACC15`.
- Danger: `#EF4444`.

### 2.2 Typography

- Font family:
  - Headings & body: “Space Grotesk” or “Sora”. [bluecompass](https://www.bluecompass.com/blog/web-design-trends-to-watch-for)
  - Code/IDs/timestamps: “JetBrains Mono” or similar.

- Sizes (desktop):
  - Display: 40–56px (hero).
  - H1: 32px.
  - H2: 24px.
  - Body: 14–16px.
  - Caption: 12–13px.

### 2.3 Cards & Glassmorphism

- Card style (panels, modals, AI pods): [invernessdesignstudio](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026)
  - Background: `rgba(255, 255, 255, 0.85)`
  - Border: `1px solid rgba(148, 163, 184, 0.25)`
  - Backdrop blur: 18–24px.
  - Shadow: `0 18px 45px rgba(15, 23, 42, 0.08)`
  - Corner radius: 16px for large panels, 12px for small cards.

### 2.4 Buttons

- Primary button
  - Background: `grad.main`.
  - Text: white.
  - Radius: 999px (pill).
  - Shadow: soft, slightly elongated; on hover, increase shadow and slight scale (1.02).

- Secondary button
  - Background: transparent/white.
  - Border: `1px solid #CBD5F5`.
  - Text: `accent.primary`.
  - Radius: 999px.

### 2.5 Chips / Pills

- Status chips
  - Filled color backgrounds, white text, pill shape.
- Category / priority chips
  - Bright border, light background, bold label.

---

## 3. Robot Character

**Style**

- Rounded body, simple face (two glowing eyes, light bar mouth). [dribbble](https://dribbble.com/tags/robot-website)
- Flat‑3D with gradients and a subtle thick outline (neobrutalism touch). [mockflow](https://mockflow.com/blog/ui-design-trends)

**Key poses**

- Hero: floating, juggling ticket cards and chat bubbles.
- Empty state: sitting on a stack of blank cards, waving.
- AI triage running: “thinking” pose with small animated lines above head.
- Error state: holding a warning sign but still friendly.

Use the robot consistently as the visual embodiment of “AI”.

---

## 4. Marketing Site

### 4.1 Hero Section

**Layout**

- Two columns on desktop, stacked on mobile.
- Left: copy + CTAs.
- Right: robot + dashboard illustration.

**Background**

- Large, soft gradient blob behind the main content (use `grad.main`). [factdoor](https://www.factdoor.com/blogs/web-design-trends-for-2026-the-rise-of-glassmorphism-and-how-to-achieve-it-with-css)
- Light background overall (`bg.page`), no dark mode here.

**Content**

- H1:
  - “A friendly AI robot that triages your tickets for you.”
- Subtext:
  - 1–2 lines, e.g., “Built for small agencies that want fast, accurate replies without a huge support team.”
- CTAs:
  - Primary: “Start triaging” (primary button).
  - Secondary: “See it in action” (outlined).

**Right visual**

- Illustration:
  - Robot centered, surrounded by floating ticket cards and message bubbles.
  - Include a mini mock of the OpsFlow ticket panel behind/under the robot.

**Animation**

- Robot eyes blink slowly.
- Ticket cards gently float up and down on a 4–6s loop.
- Gradient background moves very subtly.

### 4.2 “How it works” strip

- Section with 3 colorful cards:

1. “Reads your tickets” – robot reading a card.
2. “Sorts and assigns them” – robot juggling colored tags.
3. “Writes the first reply” – robot at a keyboard.

Each card:

- Bright background (soft gradient), thick soft shadow, rounded corners. [refuelcreative.com](https://www.refuelcreative.com.au/blog/top-4-website-design-and-user-experience-trends-to-look-out-for-in-2026)
- On hover: slight lift, stronger shadow, small scale up.

---

## 5. App Shell (Logged‑in)

### 5.1 Layout

- Top bar
  - Full‑width white bar with subtle shadow.
  - Left: small logo (robot head + “OpsFlow”).
  - Center: page title (“Tickets”, “Team”, etc.).
  - Right: tenant pill (agency name) + user avatar menu.

- Sidebar
  - Floating panel on left, white/glass style.
  - Menu items: Dashboard (future), Tickets, Workflows (future), Team, Settings.
  - Active item: gradient background with small robot icon indicator.

### 5.2 Background

- Use `bg.page` as base.
- Optional: soft abstract blobs in corners (very low opacity).

---

## 6. Tickets List Screen

### 6.1 Header

- Title: “Tickets” (H1).
- Subtitle: “Your AI robot is ready to help.” (muted text).
- Right side of header:
  - Filter chips: All, New, Triaged, Replied.
  - Simple search input (placeholder: “Search by subject or customer…”).

### 6.2 Ticket List

Preferred: **soft table** (table with card‑like rows):

Columns:

- Subject (bold, main text).
- Customer (muted).
- Status chip (colorful).
- Priority chip (colorful).
- Category label.
- Assignee (avatar + name).
- AI badge (e.g., “AI triaged” with robot icon).

Row styling:

- White or light glass background.
- Rounded corners (8–12px).
- 8–12px vertical padding.

Interactions:

- Hover: row lifts slightly, shadow increases, left border becomes a gradient stripe (using `grad.main`).
- Click: navigates to Ticket detail.

---

## 7. Ticket Detail Screen

Two‑column layout on desktop, stacked on mobile.

### 7.1 Left Column – Ticket & Replies

**Header card**

- Subject as large heading.
- Under subject:
  - Chips:
    - Status (e.g., “New”, “Triaged”).
    - Priority.
    - Category.
    - Assignee (avatar + name).
- Meta line in small mono font: “Opened 2h ago · ID #TCK‑1234”.

**Message card**

- White/glass card with body text of the ticket.
- Use comfortable line spacing.

**Replies thread**

- Each reply inside its own rounded bubble/card:
  - AI reply:
    - Small robot icon, label “AI draft”.
  - Human reply:
    - User avatar, name, label “You” or “Team”.

### 7.2 Right Column – AI Robot Panel

This is the main AI UX.

**Panel header**

- Title: “What your AI robot suggests”
- Robot icon with small pulsing glow.

**States**

- Initial (no triage yet):
  - Illustration of robot sitting on empty cards.
  - Text: “No AI triage yet. Let me read this ticket for you?”
  - Big primary button: “Run AI triage”.

- Loading:
  - Robot in “thinking” pose.
  - Small text: “Reading ticket and planning response…”
  - Skeleton placeholders for 4 steps.

- Completed:
  - Show 4 stacked cards:

1. Category card
   - Label: “Category”
   - Large chip with category (e.g., “Billing”) and an icon.
   - One‑line reasoning below in muted text.

2. Priority card
   - Label: “Priority”
   - Big pill: “HIGH” / “URGENT” with bright color.
   - Small reason text.

3. Assignee card
   - Label: “Suggested owner”
   - Avatar + name, small tag with role.
   - Reason text.

4. Reply draft card
   - Label: “Robot’s reply draft”
   - Textarea prefilled with AI draft.
   - Buttons:
     - Primary: “Accept & mark replied”.
     - Secondary: “Edit first”.
     - Optional tertiary: “Regenerate draft”.

**Animations**

- When triage completes, each card slides up and fades in sequentially (small delay between them).
- Robot icon briefly “smiles” or changes expression.

---

## 8. Workflow History UI

Access: from Ticket detail, a link/button: “View workflow history”.

**Presentation**

- Right‑side drawer or modal over the ticket screen.
- Light background, white/glass cards.

**Content**

- Title: “How your AI robot decided”.
- Vertical timeline with 4 steps:

For each step:

- Small robot illustration with a relevant pose:
  - Classification: robot with magnifying glass.
  - Priority: robot holding a siren.
  - Assignee: robot pointing.
  - Reply: robot typing.
- Step title: “Step 1 · Category”, etc.
- Summary text:
  - e.g., “Category: Billing – because the message mentions invoice, payment and refund.”

---

## 9. Team & Settings Screens

### 9.1 Team

- Title: “Team”.
- Subtitle: “People in your workspace.”
- Table or card list of users: avatar, name, email, role chip.
- Button: “Invite teammate” → small modal with name/email/role fields.

### 9.2 Settings (Tenant)

- Card with tenant/agency name, slug.
- Optional: big textarea “Support tone & policies” (used later in prompts).
- Show robot in corner with tooltip like “I’ll use this to write better replies.”

---

## 10. Motion & Micro‑Interactions

Overall principles (based on current UI trends). [pros.squarespace](https://pros.squarespace.com/blog/glassmorphism-design-trend)

- **Hover**
  - Cards and buttons scale to 1.02, shadow increases; no crazy bounce.
- **Page transitions**
  - Fade + slight slide when moving between main screens (Tickets ↔ Ticket detail).
- **AI actions**
  - When triage runs, show small progress text and robot animation.
  - Use 300–500ms step animations for each AI card appearing.

---

## 11. Implementation Notes for Trae

When generating frontend code:

- Use this spec for colors, typography, and component shapes.
- Keep the feel **bright, friendly, and robot‑themed**, not dark or “hacker cockpit”.
- Always represent AI actions (triage, reply generation) via the robot visuals and the step cards in the AI panel.
- Do not simplify ticket views to plain, unstyled tables; preserve card‑like rows and chips.

---
