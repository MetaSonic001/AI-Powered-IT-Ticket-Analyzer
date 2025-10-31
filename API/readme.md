# AI-Powered IT Ticket Analyzer & Auto-Suggester

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-supported-blue.svg)](https://www.docker.com/)

Enterprise-grade AI-powered system for automated IT ticket analysis, classification, priority prediction, and solution recommendation using multi-agent architecture.

## 🌟 Features

- **🤖 Multi-Agent AI System**: Using LangGraph for specialized ticket analysis agents with adaptive routing
- **📊 Multiple LLM Support**: Groq (primary), Gemini, Ollama with automatic fallbacks
- **🔍 Vector Search**: Weaviate (Docker) or ChromaDB (local) semantic search
- **📈 Real-time Analytics**: Comprehensive dashboard with ticket trends and insights
- **👤 Human-in-the-Loop**: Automatic review flagging for low-confidence predictions
- **📊 Performance Tracking**: Agent accuracy monitoring and ROI measurement
- **💰 Cost-Aware**: Smart model selection based on ticket complexity  
- **🔧 Auto-Classification**: Smart categorization of IT tickets into predefined categories
- **⚡ Priority Prediction**: Intelligent priority assignment with resolution time estimates
- **💡 Solution Recommendations**: RAG-powered solution suggestions from knowledge base
- **📚 Knowledge Management**: Automated ingestion from multiple data sources
- **🌐 RESTful API**: Complete FastAPI-based REST API with async support
- **🐳 Docker Ready**: Full containerization with docker-compose setup

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI API   │    │  Multi-Agent    │    │  Knowledge Base │
│                 │────│   LangGraph     │────│ (Weaviate/ChromaDB) │
│  - REST Endpoints│    │                 │    │                 │
│  - Async Support│    │ - Classifier    │    │ - Vector Search │
│  - Validation   │    │ - Prioritizer   │    │ - Semantic RAG  │
│  - Analytics    │    │ - Recommender   │    │ - Auto-indexing │
│  - HITL Review  │    │ - QA Reviewer   │    │ - Ledger Track  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Model Service  │
                    │                 │
                    │ - Groq (primary)│
                    │ - Gemini        │
                    │ - Ollama        │
                    │ - Auto-fallback │
                    │ - Cost-aware    │
                    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd it-ticket-analyzer
   ```

2. **Setup environment**
   ```bash
   python scripts/setup.py
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Access the API**
   - API Documentation: http://localhost:8000/api/docs
   - Weaviate Console: http://localhost:8080
   - Grafana Dashboard: http://localhost:3000

### Option 2: Local Development

1. **Prerequisites**
  - Python 3.11+
  - Ollama (optional but recommended)
  - Local mode uses ChromaDB (embedded, persistent) — no separate service required

2. **Setup**
   ```bash
   # Run setup script
   python scripts/setup.py
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Initialize system
   python scripts/initialize.py
   
   # Start development server
   ./scripts/run_dev.sh
   ```

## ▶️ Run the API — Exact step-by-step (Docker or Local)

These exact steps are tailored for Windows `cmd.exe` (your default shell). Commands are copy-paste ready.

Prerequisites
- Python 3.11+
- Git
- (Optional) Docker Desktop if you want to run via Docker Compose

1) Clone repository and open the `API` folder

   REM (Windows cmd.exe)
   git clone <repository-url>
   cd "AI-Powered IT-Ticket-Analyzer\API"

2) Option A — Run with Docker Compose (recommended for full-stack)

   REM Start containers (from `API` folder)
   docker-compose up -d --build

   REM Follow logs (optional)
   docker-compose logs -f

   REM Once ready, API docs will be available at:
   REM http://localhost:8000/api/docs

   REM To stop and remove containers:
   docker-compose down

3) Option B — Run locally with Python (development)

   REM Create and activate a virtual environment (cmd.exe)
   python -m venv .venv
   .venv\Scripts\activate

   REM Install requirements
   pip install -r requirements.txt

   REM Create a .env file in the API folder. A ready-to-use template is provided as `.env.example`.
   REM Copy it and edit any provider keys you need:
   REM copy .env.example .env

   REM Example variables you may edit in `.env`:
   REM -------------------------
   REM USE_OLLAMA=false
   REM OLLAMA_HOST=http://localhost:11434
   REM USE_HUGGINGFACE=false
   REM HUGGINGFACE_TOKEN=
  REM # Vector DB (Docker uses Weaviate; local uses ChromaDB):
  REM #WEAVIATE_HOST=http://localhost:8080
   REM KAGGLE_USERNAME=
   REM KAGGLE_KEY=
   REM USE_DOCKER=false
  REM # Local vector DB (ChromaDB persistent directory):
  REM CHROMA_PERSIST_DIRECTORY=./data/chroma_db
  REM # Optional general app persistence (non-vector):
  REM USE_SQLITE=true
  REM SQLITE_DB_PATH=./data/app.db
   REM -------------------------

   REM Run setup/initialization (creates caches, directories)
   python scripts/setup.py
   python scripts/initialize.py

   REM Start the API with uvicorn (dev mode with reload)
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  REM --- Convenience: start script ---
  REM You can start the API using the included convenience script which sets
  REM sensible local defaults (Chroma path, SQLite path) and ensures the
  REM `API` package is on `sys.path`.
  REM From the repository root:
  python API/start_api.py --reload

  REM This is equivalent to running uvicorn but is handy for developers.
  REM Ensure `uvicorn` is installed in your venv (pip install -r requirements.txt).

   REM Visit API docs:
   REM <http://localhost:8000/api/docs>

  REM ------------------------------------------------------------------
  REM Run without Docker (ChromaDB persistent vector store)
  REM ------------------------------------------------------------------
  REM In local mode, the knowledge base uses ChromaDB with persistent storage.
  REM Set these in your `.env` (or use `.env.example`):
  REM   USE_DOCKER=false
  REM   CHROMA_PERSIST_DIRECTORY=./data/chroma_db
  REM
  REM Optional: If you need a general (non-vector) local DB, you can enable
  REM SQLite. It is NOT used for vector search:
  REM   USE_SQLITE=true
  REM   SQLITE_DB_PATH=./data/app.db
  REM
  REM Then start the API as above. Knowledge entries will persist in ChromaDB.

4) Run only the FastAPI service (explicit env vars example)

   REM Example: run with Ollama disabled
   set USE_OLLAMA=false
   set WEAVIATE_HOST=http://localhost:8080
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

5) Run tests (pytest)

  Recommended developer setup (one-time per machine)

  These steps ensure the `API` package is importable (so tests can import `core`, `services`, etc.) and install required test/dev dependencies.

  REM From the repository root (Windows `cmd.exe`) - create & activate a venv, install deps, then install the package in editable mode
  python -m venv .venv
  .venv\Scripts\activate
  python -m pip install --upgrade pip
  python -m pip install -r requirements.txt

  REM Install the local `API` package in editable mode so imports like `import core` work during development
  cd API
  python -m pip install -e .

  REM Run tests
  python -m pytest -q

  Notes and alternatives:
  - `API/tests/test_api_endpoints.py` contains lightweight unit-style tests that call endpoint functions directly with mocked service objects — these do not require Weaviate or LLM providers.
  - For end-to-end tests that hit HTTP endpoints, bring up Docker Compose so dependencies (Weaviate, models) are available, then use an HTTP test client or Postman against http://localhost:8000.
  - If you prefer not to install the package, you can run tests by setting PYTHONPATH to the `API` folder. From the repository root on Windows `cmd.exe`:

    REM Run a single test file without editable install (temporary)
    set PYTHONPATH=%CD%\API
    python -m pytest API\tests\test_api_endpoints.py -q

    This technique is useful for CI or quick runs but installing the package (`pip install -e .`) is recommended for consistent developer experience.

  - CI pipelines: in CI use `python -m pip install -r requirements.txt` and `python -m pip install -e API` (or `cd API && python -m pip install -e .`) before running tests.

6) (Optional) Configure Kaggle for dataset downloads

   REM Install kaggle CLI and set environment variables (cmd.exe)
   pip install kaggle
   setx KAGGLE_USERNAME "your_kaggle_username"
   setx KAGGLE_KEY "your_kaggle_key"

   REM After setting KAGGLE env vars, re-run initialization to allow dataset downloads
   python scripts/initialize.py

Notes on optional services
- Vector DB: Docker mode uses Weaviate (`WEAVIATE_HOST`); local mode uses ChromaDB persistently. If neither is available, the API falls back to in-memory for demo features.
- Ollama / LLM providers: set `USE_OLLAMA=true` and `OLLAMA_HOST` to enable model-backed analysis. If missing, model endpoints will report degraded status in `/api/v1/health`.

Troubleshooting
- If `/api/v1/health` shows degraded services, check logs (`docker-compose logs` or the uvicorn console) and environment variables. Disable optional providers (e.g., set `USE_OLLAMA=false`) to run without them.
- Windows networking: if you expose the API to other machines (e.g., mobile device testing), ensure Windows Firewall allows incoming connections on the chosen ports and Docker Desktop is configured to expose containers.

## 🔍 How It Works: Complete Workflow

### Real-World Scenario

Let's walk through a complete example: **A user submits a ticket about email sync issues on their mobile device.**

#### 📥 Step 1: Ticket Submission (Input)

**Input Format:**

```json
{
  "title": "Email not syncing on iPhone",
  "description": "My work emails stopped syncing on my iPhone since this morning. I can send emails but not receive new ones. Already tried restarting the phone.",
  "requester_info": {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@company.com",
    "department": "Finance",
    "location": "New York Office"
  }
}
```

**API Endpoint:** `POST /api/v1/tickets/analyze`

#### 🔄 Step 2: Request Flow Through the System

**2.1 API Layer (FastAPI - `main.py`)**

- Receives HTTP POST request
- Validates input using Pydantic models (`TicketAnalysisRequest`)
- Passes to `CrewManager` for processing

**2.2 Multi-Agent Processing (`agents/workflow_manager.py`)**

The system now orchestrates 4 specialized AI agents working with adaptive routing using LangGraph StateGraph:

**Agent 1: Ticket Classifier**

- **Input:** Ticket title + description
- **Process:** Uses LLM (Groq/Gemini/Ollama) to analyze content
- **Output:**
  ```json
  {
    "category": "Email & Communication",
    "subcategory": "Mobile Sync Issues",
    "confidence": 0.89,
    "reasoning": "User explicitly mentions email sync failure on mobile device"
  }
  ```

**Agent 2: Priority Predictor**

- **Input:** Ticket content + requester department
- **Process:** 
  - Analyzes keywords ("stopped", "can't receive")
  - Checks department (Finance = business-critical)
  - Estimates business impact
- **Output:**
  ```json
  {
    "priority": "High",
    "estimated_resolution_hours": 8,
    "confidence": 0.85,
    "factors": [
      "Finance department affected (business-critical)",
      "Prevents receiving emails (communication blocked)",
      "Multiple troubleshooting attempts failed"
    ]
  }
  ```

**Agent 3: Solution Recommender**

- **Input:** Ticket classification + description
- **Process:**
  1. Generates embedding vector of the problem
  2. Searches knowledge base (Weaviate/ChromaDB) for similar issues
  3. Retrieves top 5 relevant solutions with similarity scores
  4. Ranks by relevance and past success rate
- **Knowledge Base Query:**
  - Searches for: "iPhone email sync issues", "mobile email not receiving", "Exchange ActiveSync problems"
  - Uses semantic search (not just keyword matching)
- **Output:**
  ```json
  {
    "solutions": [
      {
        "solution_id": "sol_email_123",
        "title": "Fix iPhone Exchange Email Sync",
        "steps": [
          "Go to Settings > Mail > Accounts",
          "Select the work email account",
          "Toggle 'Mail' off, wait 10 seconds, toggle back on",
          "If issue persists: Delete account and re-add"
        ],
        "similarity_score": 0.92,
        "source": "knowledge_base",
        "successful_resolutions": 87
      }
    ],
    "alternatives": [...],
    "prevention": "Enable automatic iOS updates to prevent sync protocol mismatches"
  }
  ```

**Agent 4: Quality Assurance Reviewer**

- **Input:** Outputs from all previous agents
- **Process:**
  - Validates classification makes sense for the description
  - Checks priority justification is reasonable
  - Ensures solutions are actionable and relevant
  - Verifies response completeness
- **Output:**
  ```json
  {
    "quality_score": 0.91,
    "completeness": "All required fields present, solutions actionable",
    "improvements": ["Consider adding VPN troubleshooting if Exchange is remote"],
    "status": "approved"
  }
  ```

**2.3 Knowledge Base Interaction (`services/knowledge_service.py`)**

**Role of Dataset:**

During initialization and ingestion, the system builds a knowledge base from:

1. **Kaggle IT Ticket Datasets** (`data/kaggle/`)
   - Historical tickets with resolutions
   - Common problems and solutions
   - Categorization patterns
   - Example: 10,000+ real IT support tickets processed during setup

2. **Web-Scraped Documentation** (`data/scraped/`)
   - Microsoft support articles
   - Apple troubleshooting guides
   - Technical documentation
   - Extracted using Crawl4AI during initialization

3. **Synthetic Training Data** (`data/processed/`)
   - AI-generated realistic scenarios
   - Covers edge cases not in real data
   - Ensures coverage of all categories

**Storage & Retrieval:**

- **Docker Mode:** Weaviate vector database stores embeddings
- **Local Mode:** ChromaDB stores embeddings and metadata (persistent)
- **Search:** Semantic similarity using Hugging Face embeddings
  - Query: "email not syncing iPhone" 
  - Finds: "Exchange sync issues", "mobile mail problems", "iOS email troubleshooting"
  - Even if exact words don't match!

**2.4 LLM Provider Selection (`services/model_service.py`)**

**Provider Priority Chain:**

1. **Groq** (if API key set) → Fast, cost-effective, 70k tokens/min free tier
2. **Gemini** (if API key set) → Google's model, good for complex analysis
3. **Ollama** (if running locally) → Privacy-focused, no external calls
4. **Hugging Face** → Fallback for embeddings

**Token Optimization:**

For external APIs (Groq/Gemini), the system automatically:

- Condenses long ticket descriptions to ~3000 chars (keeps important parts)
- Limits output tokens (48 for classification, 256 for generation)
- Prevents hitting rate limits without losing accuracy

#### 📤 Step 3: Response to Client

**Final Output:**

```json
{
  "ticket_id": "tk_abc123",
  "classification": {
    "category": "Email & Communication",
    "subcategory": "Mobile Sync Issues",
    "confidence": 0.89
  },
  "priority_prediction": {
    "priority": "High",
    "estimated_resolution_hours": 8,
    "eta": "Expected resolution by 5:00 PM today"
  },
  "recommended_solutions": [
    {
      "solution_id": "sol_email_123",
      "title": "Fix iPhone Exchange Email Sync",
      "steps": ["..."],
      "similarity_score": 0.92
    }
  ],
  "quality_review": {
    "quality_score": 0.91,
    "status": "approved"
  },
  "analysis_metadata": {
    "processing_time_ms": 1847,
    "agents_used": ["classifier", "priority_predictor", "solution_recommender", "qa_reviewer"],
    "knowledge_sources": ["kaggle_dataset", "web_scraped", "knowledge_base"]
  }
}
```

### 🔄 Fallback Behavior

**If LangGraph workflow is unavailable:**

- System uses direct Groq calls for classification and priority
- Same functionality, slightly less sophisticated
- All endpoints remain operational

**If external LLMs are unavailable:**

- Falls back to local Ollama models
- Or uses Hugging Face transformers
- Or returns basic rule-based analysis

**If vector DB is unavailable:**

- Local mode defaults to ChromaDB persistent storage
- If ChromaDB also isn't available, falls back to in-memory cache
- Solutions still recommended from cached data where possible

### 📊 Analytics & Learning

**After Resolution:**

1. **Tracking:** System records success/failure of recommended solutions
2. **Accuracy Calculation:** `correct_predictions / total_predictions`
3. **Dashboard Update:** Metrics updated in real-time
4. **Knowledge Base Update:** Successful solutions get higher relevance scores

**Dataset Role in Improvement:**

- **Initial Training:** Kaggle datasets provide baseline knowledge
- **Continuous Learning:** New tickets improve recommendations
- **Pattern Recognition:** Identifies common issues across departments
- **Seasonal Trends:** Detects recurring problems (e.g., "VPN issues spike on Mondays")

### 🎯 Why Multi-Agent Architecture?

**Single Model Approach:**

```
Ticket → LLM → "Here's my best guess at everything"
```

**Multi-Agent Approach (This System):**

```
Ticket → Classifier (expert in categorization)
       → Priority Predictor (expert in urgency assessment)  
       → Solution Recommender (expert in knowledge retrieval)
       → QA Reviewer (expert in validation)
       → Comprehensive, validated response
```

**Benefits:**

- Each agent specializes in one task (better accuracy)
- Sequential processing allows context building
- QA agent catches errors before user sees them
- Easier to debug and improve individual components

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and edit as needed. The example is split into three parts to make setup clear for both Docker and local runs.

Common (Docker or Local)

```env
# Server
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Models
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
USE_HUGGINGFACE=true
HUGGINGFACE_TOKEN=

# Optional providers
GROQ_API_KEY=
GEMINI_API_KEY=

# Directories & logging
DATA_DIR=./data
MODELS_DIR=./models
LOGS_DIR=./logs
LOG_LEVEL=INFO
```

Docker-only

```env
# When using docker-compose
USE_DOCKER=true
# In Docker, Weaviate is reachable at http://weaviate:8080
WEAVIATE_HOST=http://weaviate:8080
WEAVIATE_API_KEY=
```

Local-only (no Docker)

```env
USE_DOCKER=false
# Local vector DB: ChromaDB persistent directory
CHROMA_PERSIST_DIRECTORY=./data/chroma_db

# Optional: general app persistence (non-vector)
USE_SQLITE=true
SQLITE_DB_PATH=./data/app.db

# If you run a local Weaviate manually instead of Chroma
#WEAVIATE_HOST=http://localhost:8080
```

### Ollama Setup & Models

**Quick Start:**

1. **Install Ollama** from [ollama.ai](https://ollama.ai)
2. **Start Ollama server**: Run `ollama serve` in a terminal (keeps running in background)
3. **Models auto-pull**: When API requests them, Ollama automatically downloads:
   - `nomic-embed-text:latest` - For embeddings (~274MB)
   - `gemma2:2b` - For text generation and classification (~1.6GB)
4. **Optional pre-pull**: `ollama pull nomic-embed-text:latest && ollama pull gemma2:2b`

**How it works:**
- **One terminal**: Just run `ollama serve` once - models load on-demand
- **Automatic fallback**: If Ollama is off (`USE_OLLAMA=false`), system uses Groq → HuggingFace
- **No separate model terminal needed**: Ollama manages models automatically

**Configuration:**
```env
USE_OLLAMA=true                          # Enable Ollama provider
OLLAMA_HOST=http://localhost:11434       # Default Ollama endpoint
```

## 📋 API Endpoints

### Core Ticket Analysis

- `POST /api/v1/tickets/analyze` - Complete ticket analysis
- `POST /api/v1/tickets/classify` - Classification only
- `POST /api/v1/tickets/predict-priority` - Priority prediction
- `POST /api/v1/tickets/bulk-process` - Batch processing

### Knowledge Management

- `POST /api/v1/solutions/recommend` - Get solution recommendations
- `GET /api/v1/solutions/search` - Search knowledge base
- `POST /api/v1/knowledge/ingest` - Ingest new knowledge
- `GET /api/v1/knowledge/ledger` - Ledger stats (optional entries with filters)
- `GET /api/v1/debug/knowledge-base-status` - Quick KB health + sample document

### Analytics & Monitoring

- `GET /api/v1/analytics/dashboard` - Dashboard data
- `GET /api/v1/analytics/reports` - Generate reports
- `GET /api/v1/health` - Health check
- `GET /api/v1/models/status` - Model status
- `GET /api/v1/knowledge/ledger` - Ledger stats (optional entries with filters)

## 💡 Usage Examples

### Analyze a Ticket

```python
import httpx

ticket_data = {
    "title": "Cannot connect to WiFi network",
    "description": "User reports being unable to connect to corporate WiFi. Getting authentication error.",
    "requester_info": {
        "name": "John Doe",
        "department": "Sales",
        "location": "New York Office"
    }
}

response = httpx.post("http://localhost:8000/api/v1/tickets/analyze", json=ticket_data)
analysis = response.json()

print(f"Category: {analysis['classification']['category']}")
print(f"Priority: {analysis['priority_prediction']['priority']}")
print(f"Solutions: {len(analysis['recommended_solutions'])}")
```

### Get Solution Recommendations

```python
response = httpx.post("http://localhost:8000/api/v1/solutions/recommend", json={
    "query": "email synchronization issues mobile device",
    "category": "Email Issues",
    "max_results": 5
})

recommendations = response.json()
for solution in recommendations['recommendations']:
    print(f"- {solution['title']} (Score: {solution['similarity_score']:.2f})")
```

## 📊 Data Sources

The system automatically ingests data from:

- **Kaggle Datasets**: IT helpdesk and support ticket datasets
- **Synthetic Data**: Generated realistic IT support scenarios  
- **Web Scraping**: Technical documentation and knowledge articles
- **Manual Input**: Custom knowledge base entries

## 📥 Dataset ingestion helper

Use the utility script `scripts/datasets.py` to download small/medium datasets and ingest them into the knowledge base. In local mode, vectors are stored persistently in ChromaDB; in Docker mode, Weaviate is used.

Supported file types for ingestion: .txt, .md, .csv, .pdf, .docx, .html, .htm

Windows (cmd.exe) examples:

```bat
REM Download a Kaggle dataset and ingest
python scripts/datasets.py --kaggle "suraj520/customer-support-ticket-dataset" --ingest

REM Download URLs (PDF/HTML/CSV) and ingest
python scripts/datasets.py --urls "https://example.com/guide.pdf" "https://example.com/page.html" --save-dir .\data\imports --ingest

REM Ingest an existing folder of docs into the vector DB
python scripts/datasets.py --folder .\data\imports --ingest --category "Documentation"
```

Notes:
- Requires `sentence-transformers`, `pandas`, `requests`, `beautifulsoup4`, `PyPDF2`, and `python-docx` (already listed in `requirements.txt`).
- Kaggle downloads need the Kaggle CLI configured (set `KAGGLE_USERNAME` and `KAGGLE_KEY`).
- Embeddings are generated with `sentence-transformers/all-MiniLM-L6-v2` and saved via the API’s `KnowledgeService`.

### Seed the knowledge base quickly (recommended for local dev)

To avoid empty recommendations on a fresh setup, seed a few common solutions:

Windows (cmd.exe):

```bat
REM From repository root
python -m API.scripts.ingest_solutions
```

This inserts several troubleshooting guides (email sync, Wi‑Fi, VPN, printing, AD lockouts, Teams install) into the persistent ChromaDB store so RAG results are available immediately.

Note: The solutions endpoint now defaults to a similarity threshold of 0.4. You can pass a higher `min_similarity` in the request if you want stricter matches.

### Auto-sync on API startup

When the API starts, it automatically scans common data folders and ingests new documents into the vector store. A dedicated SQLite ledger keeps a record of what was synced to avoid duplicates and to track removals.

What it does:

- Scans: `data/kaggle`, `data/scraped`, `data/processed`, `data/imports`, `data/exports`
- Extracts text from supported file types (.txt, .md, .csv, .pdf, .docx, .html, .htm)
- Generates embeddings and upserts into the vector store (Chroma in local mode)
- Records each doc in a ledger (SQLite at `data/ledger.db`) with status `synced`
- Marks ledger entries as `removed` if the corresponding file disappears

Configuration (in `.env`):

```env
USE_DOCKER=false
CHROMA_PERSIST_DIRECTORY=./data/chroma_db
LEDGER_DB_PATH=./data/ledger.db
```

Logs during startup will show how many documents were added and removed, for example:

```text
Auto-sync: ingested 3 docs from data\imports
Auto-sync complete. Added 5, removed 1. Backend=chroma Count=123
```

You can still run manual ingestion via `scripts/datasets.py` if you want to target a specific folder.

### Quick sync for existing local data (manual, optional)

If you already have files under `./data/` (e.g., `data/kaggle`, `data/scraped`, `data/processed`, `data/imports`, `data/exports`), you can sync them into the vector store in one shot:

```bat
REM Ingest common data folders into ChromaDB (idempotent)
python scripts/sync_local_data.py

REM Or specify folders explicitly
python scripts/sync_local_data.py --folders data\kaggle data\scraped --category Documentation
```

This sync uses deterministic IDs (based on file path + content) to avoid duplicates when re-running.

## 🤖 LangGraph Multi-Agent Workflow

### Intelligent Workflow Orchestration

The system uses LangGraph StateGraph for advanced multi-agent orchestration with adaptive routing, HITL, and performance tracking.

**Key Advantages:**

1. **Adaptive Routing**: High-confidence simple tickets skip agents (⚡ 30-40% faster)
2. **Human-in-the-Loop**: Low-confidence tickets flagged for review (QA score < 0.75)
3. **Performance Tracking**: Real-time agent accuracy and ROI measurement
4. **Cost-Aware**: Automatic model selection based on ticket complexity
5. **Groq-Only**: Uses Groq Cloud exclusively (no OpenAI dependency)

### The Four Specialized Agents

When the LangGraph workflow is active, four specialized agents collaborate:

1. **Ticket Classifier Agent**
   - Categorizes tickets into predefined categories
   - Identifies subcategories and technical domains
   - Provides confidence scores and reasoning

2. **Priority Predictor Agent**
   - Assesses business impact and urgency
   - Estimates resolution timeframes (Critical: 2h, High: 8h, Medium: 24h, Low: 72h)
   - Considers user department context and historical patterns
   - Uses keyword-based analysis for priority scoring

3. **Solution Recommender Agent**
   - Searches knowledge base for relevant solutions
   - Provides step-by-step troubleshooting guides
   - Ranks solutions by relevance and effectiveness

4. **Quality Assurance Agent**
   - Reviews and validates analysis results from other agents
   - Ensures completeness and accuracy
   - Provides quality metrics and improvement suggestions
   - Final validation before results are returned

### Fallback Mode

When LangGraph is not available or fails, the system automatically falls back to direct Groq calls, ensuring the API remains operational. All endpoint functionality (classification, priority prediction, solution recommendation) works in both modes.

### New Endpoints

**Performance Tracking:**
- `GET /api/v1/agents/performance` - Get agent accuracy stats
- `POST /api/v1/agents/feedback` - Log actual outcomes for ROI tracking

**Human Review:**
- `GET /api/v1/review/{ticket_id}` - View draft analysis for low-confidence tickets

**Example - Track Agent Accuracy:**
```python
# After ticket resolution, log actual outcome
httpx.post("/api/v1/agents/feedback", json={
    "ticket_id": "abc123",
    "agent": "priority_predictor",
    "actual": "High",
    "feedback_source": "resolution"
})

# Check accuracy
stats = httpx.get("/api/v1/agents/performance").json()
print(f"Classifier accuracy: {stats['agents']['classifier']['accuracy']:.2%}")
```

## 🧠 LLM Provider Selection & Token Optimization

### Provider Priority

The system intelligently selects LLM providers based on availability and configuration:

1. **Groq** (if `GROQ_API_KEY` is set) - Preferred for fast, cost-effective inference
2. **Gemini** (if `GEMINI_API_KEY` is set) - Secondary option for cloud-based models
3. **Ollama** (if `USE_OLLAMA=true` and no external keys) - Local models for privacy/offline use
4. **Hugging Face** (if `USE_HUGGINGFACE=true`) - Final fallback for embeddings and classification

### Token Optimization for External APIs

When using Groq or Gemini (external paid APIs), the system automatically:

- **Condenses prompts** using head+tail preservation (keeps first ~1200 and last ~1200 chars)
- **Reduces max_tokens** output (48 for classification, 256 for generation)
- **Prevents quota exhaustion** without sacrificing accuracy
- **Uses full parameters** for local models (Ollama) where token limits don't apply

This ensures cost-effective operation while maintaining high-quality results.

## 📈 Analytics & Reporting

### Dashboard Metrics

- Total tickets analyzed
- Average processing time
- Classification accuracy (calculated from actual processing stats when available, falls back to mock 0.92)
- Knowledge base size
- Category distribution
- Priority trends

### Available Reports

- Summary reports with key metrics
- Category analysis with deep insights
- Trend analysis over time periods
- Performance analytics

### Accuracy Tracking

The system tracks classification accuracy dynamically:

- When `DataService.processing_stats` is populated (from actual ticket processing), accuracy is calculated as `correct/total`
- Falls back to a baseline 0.92 (92%) when no stats are available yet
- Accuracy improves as more tickets are processed and validated

## 🔍 Advanced Features

### Enhanced UX & Response Formatting

**New in this release:**

- **Plain-English Summaries**: Every analysis includes a non-technical summary explaining the issue, priority, and next steps in user-friendly language
- **Action Items**: Clear, prioritized list of what to do next (e.g., "Contact IT Help Desk", "Try recommended solution", "Escalate if issue persists")
- **Resolution Timelines**: Estimated start time, completion time, and SLA based on priority level
- **Confidence Warnings**: Automatic flagging when classification, priority, or solution confidence is below threshold, with suggestions for manual review
- **Response Formatter**: Centralized `utils/response_formatter.py` module for consistent, user-friendly response formatting

Example enhanced response:
```json
{
  "classification": {"category": "Email Issues", "confidence": 0.89},
  "priority_prediction": {"priority": "High", "estimated_resolution_hours": 8},
  "recommended_solutions": [...],
  "summary": "We identified this as an **Email Issues** issue. This should be addressed soon as it's blocking your work...",
  "action_items": [
    {"priority": 1, "action": "📞 Contact IT Support soon", "urgency": "Address within 4 hours"},
    {"priority": 2, "action": "Try recommended solution: Fix iPhone Exchange Email Sync", "estimated_time": "15 minutes"}
  ],
  "resolution_timeline": {
    "estimated_start": "Within 4 hours",
    "estimated_completion": "15 minutes to 30 minutes",
    "sla": "8 hours maximum"
  },
  "warnings": [
    {"type": "low_solution_relevance", "message": "Recommended solutions have low similarity - may not be relevant"}
  ]
}
```

### RAG (Retrieval-Augmented Generation)

- Semantic search using Weaviate vector database
- Context-aware solution recommendations
- Knowledge base auto-expansion

### Model Flexibility  

- Multiple LLM providers with automatic fallbacks
- Local and cloud-based model support
- Performance optimization for different use cases

### Scalability

- Async FastAPI with high concurrency
- Containerized architecture  
- Horizontal scaling support
- Caching and optimization

## 🧪 Testing

Run the test suite to verify installation:

```bash
python scripts/test_installation.py
```

### Manual endpoint tester (interactive)

A convenient interactive script exercises common endpoints and validates responses:

```bat
REM From repository root while the API is running on port 8000
python API\test_api_runner.py
```

Use the numbered menu to run individual tests or choose 0 to run them all.

### Developer tests (pytest)

There is a small pytest suite in `API/tests/` that exercises core endpoints using lightweight mocks (it calls the endpoint functions directly and avoids starting the full FastAPI lifespan). To run the tests:

Windows (cmd.exe):

   cd API
   python -m pytest -q

Notes:

- These unit-style tests do not require external services (Weaviate, Ollama). They mock the service layer where necessary.
- For end-to-end tests you can bring up the full stack via Docker and then run HTTP requests against <http://localhost:8000>.

## 📚 Documentation

- **API Documentation**: Available at `/api/docs` when server is running
- **Model Documentation**: See `docs/models.md`
- **Deployment Guide**: See `docs/deployment.md`
- **Configuration Reference**: See `docs/configuration.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Issues**: GitHub Issues for bug reports and feature requests
- **Documentation**: Comprehensive docs in `/docs` directory
- **Examples**: Sample code in `/examples` directory

## 🎯 Roadmap

- [ ] Mobile app support
- [ ] Advanced ML model fine-tuning
- [ ] Integration with popular ITSM tools
- [ ] Advanced analytics with ML insights
- [ ] Multi-language support
- [ ] Voice-to-ticket conversion

---

**Built with ❤️ using FastAPI, LangGraph, Groq, ChromaDB, and modern AI/ML technologies**

**See [LANGGRAPH_MIGRATION.md](LANGGRAPH_MIGRATION.md) for full details on the LangGraph upgrade and new features.**
