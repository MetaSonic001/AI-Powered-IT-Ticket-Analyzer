# App folder — Next.js App Router notes

This folder uses the Next.js App Router pattern (folders are routes). The purpose of this README is to help contributors understand layout, server vs client components and where to find the major pages.

Layout & routing
- `layout.tsx` (root layout) wraps all pages. It's a good place for the theme provider and global wrappers.
- Each subfolder with a `page.tsx` file becomes a route (for example `app/dashboard/page.tsx` -> `/dashboard`).

Server vs Client
- Default components are server components. Add `"use client"` at the top of files that rely on browser-only APIs (state, effects, window, localStorage).
- Keep heavy UI and third-party client libraries inside client components to avoid server-side bundling issues.

Key pages (examples)
- `app/page.tsx` — landing page / root
- `app/dashboard/page.tsx` — analytics and KPIs
- `app/tickets/analyze/page.tsx` — single ticket analysis flow
- `app/tickets/bulk/page.tsx` — bulk ingest and processing UI
- `app/models/page.tsx` — model status and selection
- `app/agents/page.tsx` — agent manager and logs
- `app/knowledge/page.tsx` — knowledge base explorer

Types & API wiring
- Shared types live in `lib/types.ts` — update when backend models change.
- The UI expects `NEXT_PUBLIC_API_URL` to point to the backend. Prefer using `fetch()` wrappers in `lib/` or a small API client to centralize headers and error handling.

Developer tips
- If you get hydration mismatches, inspect where server-rendered text differs from client output — common causes: random IDs, Date.now(), or different initial theme state. `suppressHydrationWarning` can silence symptoms but fixing the root cause is preferred.
- Keep global state minimal; prefer server data fetches for dashboards and use client components for interactive controls.
- Tailwind config is at project root — re-run build if changing config.

— end app README —
