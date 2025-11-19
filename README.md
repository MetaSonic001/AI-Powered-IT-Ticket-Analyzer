# TicketFlow — AI‑Powered IT Ticket Analyzer

A concise, practical guide to this repository and how the pieces fit together.

Overview
- TicketFlow ingests IT support tickets, classifies and prioritizes them with an LLM-backed pipeline, recommends solutions (from a knowledge base or heuristics), and optionally performs automated remediation or human review.
- Built as a full-stack prototype intended for on-prem / cloud deployment with local developer comfort in mind.

Quick architecture (logical view)

API (FastAPI)  --->  Model Gateway (Groq/Gemini/Ollama/HF)  --->  Knowledge DB (Weaviate / Chroma)
     |                                                         
     +--> SQLite (tickets, solutions, agent_performance)  <-----+
     |                                                         
     +--> LangGraph (optional multi-agent orchestrator)         

Frontend (Next.js)  --->  Calls API endpoints (/api/v1/*) for analyze, KB, analytics, models, health

Tech stack (high level)
- Backend: Python 3.11+, FastAPI, LangGraph (optional), aiohttp, Groq/Gemini/Ollama/HuggingFace clients
- Persistence: SQLite (built-in, analytics + ticket ledger); Weaviate (docker) or ChromaDB for embeddings
- Frontend: Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui, framer-motion, Recharts
- Dev: Docker Compose for full stack (Weaviate, Redis, Ollama, NGINX, Prometheus), uvicorn for local dev

Folders
- `API/` — FastAPI backend (models, agents, services, utils)
- `website_ticketflow-ai/` — Next.js frontend (TypeScript + Tailwind)
- `website_ticketflow-ai/app/` — Next.js app router files (pages & dashboard)
- `mobile_app TicketFlow AI/` — mobile app assets (Expo) — optional

Running locally (Windows `cmd.exe`) — quickstart

1) Backend (development, recommended)
   - Open a cmd window in the repository root and run:

```cmd
cd API
python start_api.py --reload
```

   - Notes:
     - `start_api.py` sets safe dev defaults (USE_DOCKER=false, USE_SQLITE=true, etc.) and uses subprocess mode for reliable reload.
     - To run directly via uvicorn (production-like):

```cmd
cd API
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

2) Frontend (website)
   - Install and run the Next.js frontend:

```cmd
cd website_ticketflow-ai
npm install
npm run dev
```

   - The UI expects API at `http://localhost:8000` by default. You can set `NEXT_PUBLIC_API_URL` in your environment.

3) Full-stack (Docker Compose)
   - To bring up services (Weaviate, Ollama, Redis, etc.) use Docker Compose in the `API/` or root `weaviate/` folder depending on your selection:

```cmd
cd API
docker compose up --build
```

Important API endpoints (examples)
- POST /api/v1/tickets/analyze — analyze a single ticket
- POST /api/v1/tickets/bulk-validate — validate CSV bulk import
- POST /api/v1/tickets/bulk-process — queue/process bulk tickets
- GET  /api/v1/analytics/dashboard — dashboard metrics
- GET  /api/v1/agents/performance — agent performance statistics
- GET  /api/v1/models/status — model gateway status
- GET  /api/v1/health — overall health

Troubleshooting
- If LangGraph isn't installed, the WorkflowManager falls back to a safe direct-analysis path (the API remains functional).
- If provider API keys are missing, ModelService logs warnings and uses the configured fallback chain.
- Check `API/logs/` or the console output for initialization warnings about Ollama/Groq/Gemini/HuggingFace.

Next steps & contributors
- To add a new LLM provider: extend `API/services/model_service.py` and add configuration to `core/config.py`.
- To add new KB ingestion: update `API/services/knowledge_service.py` (noted in code) and check the ledger to avoid duplicates.

License & attribution
- This repository is a demo/prototype. Update license and contributor notes as needed.

— End of readme —
# TicketFlow AI — A Plain‑Language Guide and Demo Script

This document explains, in simple terms, what the project does, the problems it solves, how it works under the hood, and how you can try it. It is written to be spoken out loud in a demo or read like a friendly guide. There is no jargon and no unexplained abbreviations.

---

## What problem are we solving?

IT support teams deal with:
- Many tickets arriving at the same time.
- Inconsistent triage when different people are on duty.
- Slow, manual hunting for answers in documents, old tickets, and long webpages.
- A lack of clear, real‑time visibility into how well the system is working.

The result: tickets wait too long, urgent issues sometimes get missed, the same problems are solved over and over by hand, and leaders do not get a clear picture of performance.

---

## What does this project do?

TicketFlow AI speeds up and standardizes the “first mile” of support. When a new ticket comes in, the system:
- Understands and categorizes the ticket in plain language.
- Predicts how urgent it is and estimates how long it may take to fix.
- Suggests practical, step‑by‑step fixes based on past tickets and helpful documents.
- Clearly explains the reasoning and confidence levels.
- Stores the results and learns from what actually works over time.

This reduces the average time it takes to resolve a ticket, makes triage more consistent, and builds a knowledge base that gets better every week.

---

## A quick story: “Email not syncing on an iPhone”

Imagine Sarah from the Finance department opens a ticket: “My work email stopped syncing on my iPhone. I can send emails but cannot receive new ones.”

Here is what happens:
1. The API receives the ticket and checks the input.
2. The system classifies it into a category like “Email and Communication,” with a subcategory such as “Mobile sync issues,” and explains why it thinks so.
3. It looks at business impact (Finance is important) and recent patterns, then assigns a priority and estimates how long it might take to resolve.
4. It searches the knowledge base for similar problems and returns step‑by‑step guidance. For example: “Open Settings, choose Mail, toggle Mail off and on. If that does not work, remove and re‑add the account.”
5. If confidence is low, the system flags it for a quick human review before anything is sent back.
6. The final response is stored and shown on the dashboard. Effective solutions are learned so the next similar ticket improves.

The whole process takes seconds.

---

## How it works (plain language)

- The web app (built with Next.js and TypeScript) shows a landing page, a dashboard, and helpful pages like About, Customers, and Contact. Charts and counters on the dashboard make it easy to see trends at a glance.
- The backend (built with FastAPI in Python) exposes clear, well‑structured endpoints for analyzing a ticket, recommending solutions, bulk uploads, and analytics.
- A “knowledge service” stores helpful content and past tickets in a fast search database that finds similar items based on meaning, not just keywords. It can run locally on your machine or as a service in Docker.
- An “analysis workflow” runs a few specialized roles one after another: categorize the ticket, decide urgency, find relevant solutions, and review quality. Each role is focused on one task to keep results accurate and understandable.
- The system saves results to a simple database so the dashboard and reports can show totals, trends, and accuracy over time.

You can run everything locally on your laptop, or spin up a fuller setup using Docker with optional tools like a reverse proxy, monitoring, and dashboards.

---

## What you get on day one

- A single endpoint that analyzes a ticket and returns: category, urgency, a plain‑English summary, and step‑by‑step suggestions.
- Search and recommendation endpoints to find helpful solutions by meaning, not just exact words.
- Bulk processing for CSV uploads so you can test quickly with real tickets.
- Automatic ingestion of helpful documents and datasets, with a built‑in ledger to avoid duplicate indexing.
- A dashboard that shows total tickets, processing time, category breakdown, and more.

---

## What happens if something is not available?

The project is designed to keep working even when some parts are offline:
- If a preferred cloud‑based AI model is not available, the system tries another model provider or a local model.
- If the knowledge database service is not available, the system uses a local store on disk, and if needed, a small in‑memory cache. You can still get helpful suggestions.
- If the advanced “multi‑step” workflow is not available, the system uses a simpler path so you can still analyze tickets.

You get a useful response even in a degraded situation, and a clear message that explains which parts were unavailable.

---

## Why this approach helps

- Faster resolution: the first answer often includes a practical fix.
- Consistency: similar tickets get similar treatment regardless of who is on duty.
- Learning loop: successful steps are stored and suggested next time.
- Clear visibility: leaders see how the system is performing without manual reports.

---

## The roles in the analysis workflow (explained simply)

1. Ticket Classifier: Reads the title and description and decides what the ticket is about, with a confidence score and a short explanation.
2. Priority Decider: Looks at impact, keywords, and department to suggest an urgency level and an estimated time to resolve.
3. Solution Finder: Searches the knowledge base for similar cases and returns step‑by‑step instructions.
4. Quality Reviewer: Double‑checks the results, especially when confidence is low, and suggests improvements if needed.

Because each role focuses on one job, it is easier to test and improve them over time.

---

## The knowledge base (what it contains and how it grows)

- Documents from public sources like product help pages.
- Past tickets and the steps that actually worked.
- Small datasets from places like Kaggle.
- Synthetic (made‑up but realistic) examples to cover edge cases.

On startup, the system can scan your local folders (for example `data/kaggle`, `data/scraped`, `data/processed`, and `data/exports`), add anything new, and keep a ledger so it does not index the same file twice. As real tickets are solved, effective solutions are added back so the knowledge base gets more useful every week.

---

## What is on the dashboard

- Total number of tickets analyzed.
- Average processing time per ticket.
- How accurate the system has been so far, based on actual outcomes when available.
- Breakdown of ticket categories.
- Trends that show how things change over time.

All of this updates as you use the system.

---

## Try it quickly (Windows Command Prompt)

You can run the full stack with Docker or run the API locally. Here are simple options. Use the method that suits you.

### Option A — Full stack with Docker

```bat
REM From the repository root
cd API
docker-compose up -d --build
REM Open http://localhost:8000/api/docs when ready
```

To stop the containers:

```bat
docker-compose down
```

### Option B — Local development without Docker

```bat
REM From the repository root
cd API
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts\setup.py
python scripts\initialize.py
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
REM Open http://localhost:8000/api/docs
```

If you see any “service degraded” messages in the health endpoint, that is expected when optional providers are not configured yet. You can keep working.

---

## A few common questions

- What if we do not want to use any cloud‑based models?  
  You can use a local model provider. It runs on your machine and does not send text to the internet.

- What if we do not have a vector database running?  
  The project can use a local store on disk. If even that is not available, it uses an in‑memory cache for demos.

- How do we avoid high costs with paid model providers?  
  The system keeps prompts focused and limits the length of text it sends to external services. Local models do not use paid services at all.

- Will this help new support agents?  
  Yes. Because the system suggests clear, repeatable steps with plain‑English summaries, new agents can follow the same process as experienced ones.

---

## Endpoints in simple terms (not exhaustive)

- POST `/api/v1/tickets/analyze` — Send a ticket (title and description). You get back a category, urgency, suggested steps, and a summary.
- POST `/api/v1/tickets/classify` — Only do the category step.
- POST `/api/v1/tickets/predict-priority` — Only do the urgency step.
- GET `/api/v1/solutions/search` — Search the knowledge base by meaning, not just exact words.
- POST `/api/v1/solutions/recommend` — Ask for suggested steps given a query and (optionally) a category.
- POST `/api/v1/knowledge/ingest` — Add documents into the knowledge base.
- GET `/api/v1/analytics/dashboard` — See numbers used by the dashboard.
- GET `/api/v1/health` — Quick health check with a clear status message.

---

## Final note

This project is meant to be practical and forgiving. It works on a laptop or in Docker, it tells you what is happening, and it keeps improving with real use. If you want a short, live demo, you can read sections of this document out loud. It is written to sound natural and easy to follow.
