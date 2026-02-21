---
name: "nextjs"
description: "Guides Next.js frontend in frontend-next. Invoke for Next.js pages, routing, or migration questions."
---

# Next.js Frontend Migration Skill

This skill helps you work with the Next.js app located at `frontend-next` in this repo. Use it whenever:

- You are creating or editing pages, layouts, or API routes in the Next.js app
- You are migrating screens from the existing `frontend` Vite React app
- You need to wire Next.js to the existing Express backend or Better Auth

## Project Layout

- Existing SPA: `frontend` (Vite + React + Tailwind, React Router)
- New Next app: `frontend-next` (Next.js App Router, TypeScript, Tailwind)
- Backend API: `backend` (Express + MongoDB, JWT + Better Auth helper)

The Next.js app was created with:

- TypeScript
- App Router (`src/app`)
- Tailwind CSS
- ESLint and React Compiler support

## Commands

Run these from the `frontend-next` directory:

- `npm run dev` – start Next.js dev server
- `npm run lint` – run ESLint (already verified once after creation)
- `npm run build` – production build of the Next app

## Conventions

- Pages live under `frontend-next/src/app`
  - `layout.tsx` defines root layout and shared UI
  - `page.tsx` under a folder defines the route for that path
- Use Next.js `Link` from `next/link` instead of `react-router-dom`
- Use `next/navigation` for router hooks, not React Router
- Keep styling consistent with existing Tailwind classes from `frontend`

## Migration Guidance

When migrating a page from `frontend` to `frontend-next`:

1. Identify the React component in `frontend/src/pages/*`
2. Create a matching route folder in `frontend-next/src/app`, for example:
   - `frontend/src/pages/Pricing.tsx` → `frontend-next/src/app/pricing/page.tsx`
3. Copy JSX and Tailwind classes, but:
   - Replace `import { Link } from 'react-router-dom'` with `import Link from 'next/link'`
   - Remove client-side routing wrappers that are specific to React Router
4. For calls to the backend API:
   - Keep using the existing Express API (`backend`) via `fetch` or `axios`
   - Prefer relative URLs that respect environment variables (e.g. `process.env.NEXT_PUBLIC_API_BASE_URL`)

## Backend Integration

Backend remains the source of truth:

- API routes live in `backend/src/routes`
- Authentication currently uses JWT with `/auth/*` endpoints plus a `betterAuth` helper

For Next.js pages that need auth:

- Use cookies or headers to send the existing JWT to the backend
- Long term, migrate to a Better Auth based session model when we build a dedicated Next.js auth flow

## When Not To Use This Skill

- Pure backend changes (Express routes, Mongo models) – use backend-oriented knowledge instead
- Changes limited to the existing Vite `frontend` app – use existing React/Tailwind patterns there

