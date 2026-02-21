# ANSWERS FOR BETTER AUTH SETUP

Here are the clear, definitive answers for your builder agent:

---

## 1. GOAL: Better Auth as Single Source of Truth

**Answer: YES - Better Auth becomes the ONLY auth system.**

**Replace ALL existing /auth/\* routes:**

- ✅ Login → Better Auth handles
- ✅ Signup → Better Auth handles
- ✅ Email verification → Better Auth handles
- ✅ Forgot/reset password → Better Auth handles
- ✅ 2FA → Better Auth handles
- ✅ Session management → Better Auth handles

**Delete current /auth/\* routes entirely.** No parallel systems.

---

## 2. BETTER AUTH CONFIGURATION

```typescript
betterAuth({
  // Base configuration
  basePath: '/api/auth',

  // Database
  database: mongodbAdapter(mongoClient, {
    provider: 'mongodb',
  }),

  // Core auth methods
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable later
    minPasswordLength: 8,
    autoSignIn: false,
  },

  // Session
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Plugins
  plugins: [
    organization(), // REQUIRED - for multi-tenant
    twoFactor(), // OPTIONAL - for 2FA (enable but not required)
  ],

  // Security
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.FRONTEND_URL,
    'http://localhost:3001', // Next.js dev
  ],

  // Advanced
  advanced: {
    cookiePrefix: 'opsflow',
    useSecureCookies: process.env.NODE_ENV === 'production',
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});
```

**Do NOT enable:**

- OAuth (no social login yet - add later)
- JWT plugin (use cookies only, not JWTs)

---

## 3. USER & TENANT MODEL DECISION

**Answer: A) Better Auth becomes the main user store**

**Specifics:**

- Better Auth `user` collection replaces your existing `User` model
- Better Auth `organization` collection replaces your existing `Client` model
- Better Auth `member` collection replaces your existing `TeamMember` model

**Migration approach:**

- Create migration script to copy existing users → Better Auth users
- Map existing clients → Better Auth organizations
- Map existing team members → Better Auth members
- Update all foreign keys in other collections (Tickets, Documents, etc.)
- Once migration confirmed working, archive old collections (don't delete immediately)

**Why this approach:**

- Cleaner architecture (one auth system)
- Use Better Auth's organization plugin fully
- Less complexity maintaining two user systems

---

## 4. 2FA REQUIREMENTS

**Answer: Optional per user, TOTP app-based**

**Specifics:**

- **Not required by default** - users can opt in
- **Method: TOTP** (Google Authenticator, Authy, 1Password)
- **No SMS/email codes** (too expensive for MVP)
- **Future consideration:** Require 2FA for admin role only (not now)

**Implementation:**

- Enable twoFactor() plugin
- Add "Enable 2FA" button in user settings
- Users scan QR code with authenticator app
- Login flow checks if 2FA enabled, prompts for code
- Recovery codes provided during setup

---

## 5. ENVIRONMENT / URLs

**Local Development:**

```env
# Backend (.env)
NODE_ENV=development
BETTER_AUTH_SECRET=generate-with-crypto-randomBytes-64-chars
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
MONGODB_URI=mongodb+srv://your-connection-string

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Production:**

```env
# Backend
NODE_ENV=production
BETTER_AUTH_SECRET=production-secret-different-from-dev
BETTER_AUTH_URL=https://api.opsflowai.com
FRONTEND_URL=https://opsflowai.com
MONGODB_URI=mongodb+srv://production-connection-string

# Frontend
NEXT_PUBLIC_API_URL=https://api.opsflowai.com
```

**Deployment setup:**

- Backend: Render.com (Node.js service)
- Frontend: Vercel (Next.js)
- Both run on HTTPS in production
- Cookies: `secure: true` in production, `secure: false` in dev

**CORS configuration:**

```
Backend allows:
- http://localhost:3001 (dev)
- https://opsflowai.com (prod)
- https://www.opsflowai.com (prod with www)

Credentials: true (required for cookies)
```

---

## 6. TESTS EXPECTED TO PASS

**Backend tests:**

```bash
# What to run:
npm run lint          # ESLint must pass
npm run test          # Unit tests must pass
npm run build         # TypeScript compilation must succeed

# What tests should cover:
- User can sign up
- User can sign in with correct password
- User cannot sign in with wrong password
- Protected routes require valid session
- Public routes work without session
- Session expires after 7 days
- Organization filtering works (no data leakage)
- 2FA setup and verification works
```

**Frontend tests:**

```bash
# What to run:
npm run lint          # ESLint must pass
npm run build         # Next.js build must succeed
npm run test          # (if you have tests)

# Manual verification needed:
- Can sign up from /signup page
- Can sign in from /login page
- Session persists on page refresh
- Protected routes redirect to /login if not authenticated
- Dashboard loads with user data
- Organization switcher works
- Logout works and clears session
```

**E2E tests (if exists):**

```bash
# Update tests/ui/auth.spec.ts to use Better Auth flows
npx playwright test

# Test scenarios:
- Full signup → login → dashboard flow
- Forgot password flow
- 2FA setup flow (if enabled)
- Organization switching
```

**Definition of Done:**
All above tests pass + manually verify full auth flow works in browser.

---

## 7. PERMISSION FOR BREAKING CHANGES

**Answer: YES - Full permission granted**

**You may:**

✅ **Change backend module setup**

- Refactor to ESM if Better Auth requires it
- Restructure auth module folder
- Update imports and exports
- Modify NestJS decorators

✅ **Replace existing auth routes**

- Delete `/auth/login`, `/auth/signup`, `/auth/verify`, etc.
- Remove JWT guards and strategies
- Remove JWT packages (jsonwebtoken, passport-jwt)
- Replace with Better Auth handlers

✅ **Replace authentication middleware**

- Remove `requireAuth` middleware
- Remove JWT verification logic
- Replace with Better Auth session checks
- Update all controllers using @UseGuards(AuthGuard)

✅ **Update database models**

- Archive old User, Client, TeamMember models
- Use Better Auth's user, organization, member models
- Update foreign key references across all collections

✅ **Modify frontend auth logic**

- Remove localStorage token storage
- Remove Authorization headers
- Replace with Better Auth cookies
- Update all API call configurations

✅ **Change environment variables**

- Add new Better Auth env vars
- Remove old JWT-related vars
- Update deployment configs

**Constraints:**

- ❌ Don't break existing ticket/client data (migrate, don't delete)
- ❌ Don't change public API endpoints outside of /auth/\* (tickets, settings, etc. stay same)
- ❌ Don't change UI/UX flows outside of auth pages (dashboard layout, ticket views stay same)

**Communication:**

- If you encounter a decision point not covered above, pause and ask
- Document all breaking changes in a MIGRATION.md file
- Provide rollback steps if something fails

---

## SUMMARY FOR BUILDER AGENT

```
1. Goal: Better Auth as single source of truth (replace all existing /auth/*)
2. Config: organization + twoFactor plugins, /api/auth base path, 7-day sessions, cookies only
3. Data model: Better Auth becomes main user store, migrate existing data
4. 2FA: Optional, TOTP only, not required
5. URLs: localhost:3000 (backend), localhost:3001 (frontend), HTTPS in prod
6. Tests: lint + build must pass, manual verification of auth flows
7. Breaking changes: Fully approved, go ahead
```

**Proceed with full implementation. You have everything you need.**
