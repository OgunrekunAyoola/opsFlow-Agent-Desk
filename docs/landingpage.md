```markdown
# OpsFlow Landing Page - Futuristic Vision Spec

**File**: `docs/landing-page-spec-v2.md`  
**Last Updated**: February 14, 2026  
**Status**: Ready for Implementation

This document defines the complete design, copy, and structure for the OpsFlow futuristic landing page.

---

## Design System

### Colors
```

Background Gradient: #0A0E27 → #1A1F3A (deep space)
Primary Accent: #00F0FF (electric cyan)
Secondary Accent: #B026FF (neon purple)
Tertiary: #FF0080 (hot pink)
Text Primary: #FFFFFF (pure white)
Text Secondary: #A0AEC0 (soft gray)
Success: #00FF94
Warning: #FFD600

```

### Typography
```

Headlines: "Sora" or "Space Grotesk", 700 weight
Body: "Inter", 400-500 weight
Monospace: "JetBrains Mono" for technical details

```

### Motion Principles
```

- Parallax scrolling on hero (0.5x speed)
- Fade-in + slide-up for sections (0.6s ease-out)
- Particle effects on CTAs (continuous subtle animation)
- Holographic shimmer on product mocks (2s loop)
- Typing animation for AI demo (50ms per character)
- Hover effects: scale(1.02) + glow increase

```

### Component Patterns
```

- Cards: backdrop-blur(24px), border-radius: 16px, border: 1px rgba(255,255,255,0.1)
- Buttons: pill shape (border-radius: 999px), gradient background, soft shadow
- Sections: Full viewport height or min 100vh, generous padding (120px vertical)
- Grid: 12-column for desktop, single column for mobile

```

---

## Page Structure

### Navigation Bar
```

Position: Fixed top, glass morphism background
Height: 80px
Layout: Logo (left) | Links (center) | CTA (right)

Logo: OpsFlow icon + wordmark
Links: Features | Integrations | Pricing | Docs
CTA: "Start Free" button (gradient, glowing)

```

---

## Section 1: Hero - "The Future of Support is Here"

### Layout
```

Full viewport height (100vh)
Two columns on desktop (60/40 split)
Single column on mobile (content stacked)

````

### Content - Left Side

**Badge (floating above headline)**
```html
<div class="badge">
  🚀 NOW IN PUBLIC BETA
</div>
````

**Main Headline**

```
THE FUTURE OF SUPPORT
IS AUTONOMOUS
```

Style: 56px (desktop), 700 weight, line-height 1.1, letter-spacing -0.02em

**Subheadline**

```
Your AI copilot reads every ticket,
understands every customer,
and drafts every reply—instantly.
```

Style: 24px, 400 weight, text-secondary color

**CTA Buttons (horizontal stack)**

```
[Start Your Evolution →]  [See the Future ↓]
```

- Primary: Gradient background (#00F0FF → #B026FF), white text
- Secondary: Glass background, border, white text

**Micro-copy below CTAs**

```
Free forever -  No credit card -  2 minute setup
```

Style: 14px, muted color

### Content - Right Side

**Visual: 3D Dashboard Mock**

```
Elements:
- Floating holographic frame (perspective transform)
- Animated ticket cards flowing in from top
- AI robot in center processing tickets
- Glowing connection lines between elements
- Typing animation showing reply generation
- Subtle particle effects around edges

Technical:
- Use Three.js or Spline for 3D
- Canvas size: 800x600px
- Animation: Continuous loop, 4s cycle
- Glow effects: CSS box-shadow with blur
```

---

## Section 2: "What If Support Could Think?"

### Layout

```
Dark section with spotlight effect
Two columns: 60/40 split
Padding: 160px vertical
Background: Radial gradient from center
```

### Content - Left Side

**Section Label**

```
IMAGINE THE IMPOSSIBLE
```

Style: 12px uppercase, letter-spacing 2px, cyan color

**Headline**

```
WHAT IF SUPPORT
COULD THINK?
```

Style: 48px, 700 weight

**Body Copy (bullet list with icons)**

```
✓ Every ticket is read the moment it arrives
✓ Categories appear before you even think
✓ Priorities adjust in real-time
✓ Replies write themselves—perfectly
✓ Your team only touches what truly needs a human
```

Style: 20px, line-height 1.8, each line fades in on scroll

**Closing Line**

```
That world exists. You're looking at it.
```

Style: 24px, italic, gradient text

### Content - Right Side

**Visual: AI Brain Flowchart**

```
Animated diagram showing:
- Input: Ticket icon (top)
- AI Brain node (center, pulsing)
- 4 parallel branches:
  - Classify (purple glow)
  - Prioritize (cyan glow)
  - Route (pink glow)
  - Draft (green glow)
- Output: Happy customer icon (bottom)

Animation: Particles flow through connections
Technical: SVG with animated paths, GSAP for sequencing
```

---

## Section 3: "The Zero-Hour Support Desk"

### Layout

```
Split screen, 50/50
Height: 100vh
Vertical divider line (glowing)
```

### Left Side - "The Old Way"

**Style**: Grayscale filter, chaotic vibe

**Headline**

```
THE OLD WAY
```

**Timeline**

```
8:00 AM → 50 unread tickets
8:30 AM → Still sorting priorities
9:00 AM → Finally starting replies
12:00 PM → Still catching up

Result: Burnt out team, slow responses 😞
```

**Visual**

```
Screenshot of messy inbox (generic email client)
Overlaid with stress indicators: red alerts, timers, chaos icons
Desaturated colors
```

### Right Side - "The OpsFlow Way"

**Style**: Full color, calm and organized

**Headline**

```
THE OPSFLOW WAY
```

**Timeline**

```
8:00 AM → 50 tickets already triaged ✓
8:01 AM → Priorities set, owners assigned ✓
8:02 AM → Drafts ready for review ✓
8:15 AM → All 50 replies sent ✓

Result: Happy team, instant support 🚀
```

**Visual**

```
OpsFlow dashboard screenshot
Clean, organized, with checkmarks
Vibrant colors, glowing elements
Robot helper animation in corner
```

### Centered Tagline (overlapping divider)

```
From chaos to clarity in 60 seconds.
```

Style: Glass card, large text, centered

---

## Section 4: "Features From the Future"

### Layout

```
Bento grid: 3 columns × 3 rows on desktop
1 column on mobile (stacked)
Gap: 24px
Padding: 120px vertical
Background: Subtle grid pattern
```

### Section Header

```
FEATURES FROM THE FUTURE
Build once. Benefit forever.
```

### Feature Tile Component Structure

```html
<div class="feature-tile">
  <div class="icon">[Animated Icon]</div>
  <div class="status-badge">Available Now | Coming Q2 2026</div>
  <h3 class="feature-name">[Name]</h3>
  <p class="feature-description">[Description]</p>
  <div class="hover-glow"></div>
</div>
```

**Tile Style**:

```
- Glass card with border
- Hover: lift (translateY -8px), glow increase
- Icon: 48px, gradient fill, subtle pulse animation
- Status badge: Small pill, colored (green = live, purple = coming)
```

### Feature List

**Tile 1: Instant Triage**

```
Icon: ⚡ (animated lightning)
Name: Instant Triage
Description: AI reads, categorizes, and prioritizes every ticket in <2 seconds
Status: ✓ Available Now
Color: Cyan glow
```

**Tile 2: Context Memory**

```
Icon: 🧠 (animated brain)
Name: Context Memory
Description: Remembers every customer, every conversation, every detail
Status: ✓ Available Now
Color: Purple glow
```

**Tile 3: Smart Routing**

```
Icon: 🎯 (animated target)
Name: Smart Routing
Description: Assigns tickets to the perfect team member based on skills and workload
Status: ✓ Available Now
Color: Pink glow
```

**Tile 4: Reply Generation**

```
Icon: ✍️ (animated pen)
Name: Reply Generation
Description: Drafts perfect, personalized replies using your brand voice and knowledge base
Status: ✓ Available Now
Color: Green glow
```

**Tile 5: Workflow Engine**

```
Icon: 🔄 (animated cycle)
Name: Workflow Engine
Description: Trigger actions: create refunds, update CRMs, notify Slack—automatically
Status: Coming Q2 2026
Color: Purple glow
```

**Tile 6: Multi-Language**

```
Icon: 🌍 (rotating globe)
Name: Multi-Language
Description: Detect customer language, reply in their native tongue—35 languages supported
Status: Coming Q2 2026
Color: Cyan glow
```

**Tile 7: Predictive Analytics**

```
Icon: 📊 (animated chart)
Name: Predictive Analytics
Description: Know tomorrow's ticket volume today. Prevent issues before they explode.
Status: Coming Q2 2026
Color: Pink glow
```

**Tile 8: Sentiment Radar**

```
Icon: 💚 (pulsing heart)
Name: Sentiment Radar
Description: Track customer happiness in real-time. Catch churn risks before they leave.
Status: Coming Q2 2026
Color: Green glow
```

**Tile 9: Auto-Resolve**

```
Icon: 🚀 (animated rocket)
Name: Auto-Resolve
Description: Common questions answered instantly, no human needed. 40% of tickets solved autonomously.
Status: Coming Q2 2026
Color: Purple glow
```

### Section Footer

```
And we're just getting started.
Our AI learns every day. Your support desk gets smarter every hour.
```

Style: Centered, italic, gradient text

---

## Section 5: "The Limitless Possibilities"

### Layout

```
Centered content, max-width 1200px
Padding: 160px vertical
Background: Radial gradient spotlight
```

### Content

**Headline**

```
CONNECT EVERYTHING.
AUTOMATE ANYTHING.
```

Style: 48px, centered

**Subheadline**

```
OpsFlow doesn't live in isolation.
It's the brain of your entire support ecosystem.
```

Style: 20px, muted color, centered

### Visual: Integration Hub

**Structure**:

```
Central hub: OpsFlow logo (large, glowing)
Surrounding icons: 9-12 integration logos in orbit
Animated connection lines between hub and icons
Each icon pulses on hover, shows use case tooltip
```

**Integrations with Use Cases**:

```
Email → "Replies sent directly from your support@ address"
Slack → "Get notified instantly, reply without switching tabs"
Microsoft Teams → "Seamless team collaboration"
Stripe → "Process refunds in one click, no manual work"
Jira → "Turn bug reports into tickets automatically"
Linear → "Sync product issues in real-time"
Zendesk → "AI triage for your existing helpdesk"
Intercom → "Enhance your current setup with AI"
Notion → "Pull answers from your knowledge base"
Confluence → "Access company docs instantly"
Zapier → "Connect to 5,000+ apps"
n8n → "Build any workflow you can imagine"
Google Calendar → "Route tickets based on availability"
Airtable → "Log every interaction for reporting"
HubSpot → "Sync customer data automatically"
Salesforce → "Enterprise CRM integration"
```

**Technical**:

```
- Use canvas or SVG for dynamic connections
- Icons: 56px size, grayscale default, color on hover
- Connection lines: Animated gradient stroke
- Tooltip: Glass card, 16px text, appears on hover
```

### Closing Tagline

```
If it has an API, OpsFlow can orchestrate it.
The only limit is your imagination.
```

Style: Centered, large, gradient text

---

## Section 6: "Built for Tomorrow's Problems"

### Layout

```
Full-width, dark section
Two-column: copy (left), visual (right)
Padding: 200px vertical
Background: Deep space with stars
```

### Content - Left Side

**Section Label**

```
FUTURE-PROOF
```

**Headline**

```
THE WORLD IS ACCELERATING.
YOUR SUPPORT SHOULDN'T
FALL BEHIND.
```

Style: 48px, line-height 1.2

**Body Copy (arrows for each point)**

```
→ Customers expect instant replies
  (AI delivers in seconds)

→ Teams are smaller, tickets are more
  (AI scales infinitely)

→ Support is 24/7 global
  (AI never sleeps)

→ Data is everywhere
  (AI connects it all)
```

Style: 20px, each line slides in on scroll

**Closing Statement**

```
OpsFlow isn't built for today's support desk.
It's built for the one that doesn't exist yet.
```

Style: 24px, italic, gradient text

### Content - Right Side

**Visual: Futuristic Cityscape**

```
Illustration showing:
- Sci-fi city skyline at night
- Holographic support interfaces floating above buildings
- Data streams connecting interfaces
- AI nodes glowing across the scene
- Abstract representation of global, instant support

Style: Isometric or 2.5D illustration
Colors: Deep blues, cyans, purples with neon accents
Animation: Subtle floating and data flow
```

---

## Section 7: "The Intelligence Layer"

### Layout

```
Centered content
Max-width: 900px
Padding: 120px vertical
Background: Subtle radial glow
```

### Content

**Section Label**

```
UNDER THE HOOD
```

**Headline**

```
POWERED BY NEXT-GEN AI
```

Style: 48px, centered

**Intro Paragraph**

```
Our agentic workflow doesn't just "use AI."
It orchestrates multiple specialized agents working in parallel:
```

Style: 20px, centered

### Visual: Agent Workflow Diagram

**Structure**:

```
5 circular nodes arranged in a flowing pattern:

1. The Reader
   "Analyzes every word, detects urgency"
   Icon: Book/eye
   Color: Cyan

2. The Classifier
   "Understands intent with 98% accuracy"
   Icon: Tags/folders
   Color: Purple

3. The Strategist
   "Decides priority and routing"
   Icon: Chess piece/strategy
   Color: Pink

4. The Writer
   "Generates replies using your voice"
   Icon: Pen/message
   Color: Green

5. The Guardian
   "Checks for errors, tone, compliance"
   Icon: Shield/check
   Color: Blue
```

**Animation Sequence**:

```
1. Ticket appears at top (fade in)
2. Energy flows to all 5 nodes simultaneously
3. Each node pulses as it "processes"
4. Lines converge at bottom
5. Perfect reply emerges (fade in)
6. Text overlay: "All in under 3 seconds."
```

**Technical**:

```
- SVG or canvas animation
- GSAP for sequencing
- Particle effects on energy flows
- 4-second loop
```

### Closing
