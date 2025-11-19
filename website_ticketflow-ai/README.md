# Website — TicketFlow UI

This folder contains the Next.js frontend for TicketFlow. It implements the dashboard, ticket analysis flows, knowledge views and admin pages used in the demo and local development.

Purpose
- Provide a responsive UI for analyzing tickets, viewing analytics and managing models/knowledge.
- Communicate with the FastAPI backend (default: http://localhost:8000).

Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui primitives
- Recharts for charts, framer-motion for animations
- Optional: Vercel or static export for deployment

Quick start (Windows `cmd.exe`)
1) Install dependencies:

```cmd
cd website_ticketflow-ai
npm install
```

2) Run dev server (hot reload):

```cmd
npm run dev
```

3) Build and start (production-like):

```cmd
npm run build
npm start
```

Environment variables
- `NEXT_PUBLIC_API_URL` — base URL for the backend API (default `http://localhost:8000`).

Key folders & files
- `app/` — Next.js App Router pages and layouts (primary UI code).
- `lib/` — shared utilities and `types.ts` for interfaces.
- `components/` or UI primitives under `app/` — small, reusable UI building blocks.
- `public/` — static assets and icons.

Common tasks
- Lint: `npm run lint`
- Add a page: create a folder under `app/` with `page.tsx` and optional `layout.tsx`.

Troubleshooting
- If the UI cannot reach the API, ensure `NEXT_PUBLIC_API_URL` is set and the FastAPI server is running.
- If you see hydration warnings, check server components vs client components and `suppressHydrationWarning` usage. Theme provider is expected to be in the app layout.

— end website README —
