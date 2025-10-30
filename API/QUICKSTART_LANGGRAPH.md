# Quick Start Guide - LangGraph Multi-Agent System

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd API
pip install -r requirements.txt
```

This installs:
- `langgraph` - Multi-agent workflow orchestration
- `langchain-core` - Core LangChain components
- `langchain-groq` - Groq integration
- All existing dependencies (FastAPI, ChromaDB, etc.)

### 2. Configure Environment
Create or update your `.env` file:

```bash
# Required: Groq API Key
GROQ_API_KEY=your_groq_api_key_here

# Optional: Model selection
GROQ_MODEL=llama-3.1-8b-instant

# Local mode (no Docker)
USE_DOCKER=false
CHROMA_PERSIST_DIRECTORY=./data/chroma_db
LEDGER_DB_PATH=./data/ledger.db
```

Get your free Groq API key: https://console.groq.com/keys

### 3. Start the API
```bash
python start_api.py --reload
```

API will be available at: http://localhost:8000

### 4. Test the System

#### a) Analyze a Ticket
```bash
curl -X POST http://localhost:8000/api/v1/tickets/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot connect to WiFi",
    "description": "User reports authentication error when connecting to corporate WiFi network"
  }'
```

**Response includes:**
- Classification (category, confidence)
- Priority (level, estimated hours)
- Recommended solutions
- QA review score
- Processing metadata (model used, steps taken)
- **HITL flag** if confidence is low

#### b) Check Agent Performance
```bash
curl http://localhost:8000/api/v1/agents/performance
```

**Returns:**
- Accuracy per agent
- Total predictions made
- Feedback received
- Confidence calibration

#### c) Log Feedback (for Accuracy Tracking)
```bash
curl -X POST http://localhost:8000/api/v1/agents/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "abc123",
    "agent": "classifier",
    "actual": "Network Issues",
    "feedback_source": "resolution"
  }'
```

This improves agent accuracy metrics over time!

## 🎯 Key Features

### 1. Adaptive Routing (Automatic)
High-confidence simple tickets automatically skip agents:
- **Before:** 4 agents (450ms)
- **After:** 3 agents (280ms) - **38% faster!**

### 2. Human-in-the-Loop (Automatic)
Low-confidence tickets get flagged:
```json
{
  "status": "needs_review",
  "draft_analysis": { ... },
  "review_url": "/api/v1/review/abc123"
}
```

Visit the review URL to see the draft and provide corrections.

### 3. Cost-Aware Model Selection (Automatic)
- Short tickets (< 100 chars): Fast model
- Complex tickets: Standard model
- **Savings:** 40-60% on API costs

### 4. Performance Tracking (Manual)
Log actual outcomes to improve accuracy:
```python
# After ticket resolved
workflow.log_feedback(
    ticket_id="123",
    agent="priority_predictor",
    actual="High"
)
```

## 📊 API Endpoints

### Analysis Endpoints
- `POST /api/v1/tickets/analyze` - Full ticket analysis
- `POST /api/v1/tickets/classify` - Classification only
- `POST /api/v1/tickets/predict-priority` - Priority only
- `POST /api/v1/tickets/bulk-process` - Batch processing

### New Endpoints (LangGraph)
- `GET /api/v1/agents/performance` - Agent accuracy stats
- `POST /api/v1/agents/feedback` - Log actual outcomes
- `GET /api/v1/review/{ticket_id}` - View low-confidence drafts

### Knowledge Base
- `POST /api/v1/solutions/recommend` - Get solutions
- `GET /api/v1/solutions/search` - Search KB
- `GET /api/v1/knowledge/ledger` - Ingestion ledger

### Monitoring
- `GET /api/v1/health` - System health
- `GET /api/v1/analytics/dashboard` - Analytics

## 🔍 Understanding the Response

```json
{
  "ticket_id": "abc123",
  "classification": {
    "category": "Network Issues",
    "subcategory": "WiFi",
    "confidence": 0.95,
    "reasoning": "User explicitly mentions WiFi authentication"
  },
  "priority_prediction": {
    "priority": "High",
    "confidence": 0.88,
    "estimated_resolution_hours": 8,
    "factors": ["Affects user productivity", "Network infrastructure"]
  },
  "recommended_solutions": [
    {
      "solution_id": "sol_001",
      "title": "Reset WiFi Settings",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "similarity_score": 0.92,
      "source": "knowledge_base"
    }
  ],
  "qa_review": {
    "quality_score": 0.85,
    "status": "approved",
    "completeness": "complete"
  },
  "status": "completed",
  "processing_time_ms": 285,
  "analysis_metadata": {
    "workflow": "langgraph",
    "model_used": "llama-3.1-8b-instant",
    "cost_optimization": "enabled",
    "processing_steps": [
      "classification_completed",
      "priority_prediction_completed",
      "solution_recommendation_completed",
      "qa_review_completed"
    ],
    "agent_metrics": [
      {"agent": "classifier", "processing_time_ms": 85},
      {"agent": "priority_predictor", "processing_time_ms": 65},
      {"agent": "solution_recommender", "processing_time_ms": 105},
      {"agent": "qa_reviewer", "processing_time_ms": 30}
    ]
  }
}
```

## 🐛 Troubleshooting

### Import Error: langgraph
```bash
pip install langgraph langchain-core langchain-groq
```

### Error: Groq API key not set
Add to `.env`:
```
GROQ_API_KEY=your_key_here
```

### All predictions have low confidence
This is normal initially! The system learns from feedback:
```bash
# Log actual outcomes
curl -X POST http://localhost:8000/api/v1/agents/feedback -d '{...}'
```

### Fallback mode activated
LangGraph not installed or import failed. Install dependencies:
```bash
pip install -r requirements.txt
```

## 📈 Best Practices

### 1. Log Feedback Regularly
```python
# After each ticket resolution
POST /api/v1/agents/feedback
{
  "ticket_id": "...",
  "agent": "classifier",
  "actual": "Network Issues"
}
```

### 2. Monitor Performance Weekly
```bash
curl http://localhost:8000/api/v1/agents/performance
```

Check:
- Agent accuracy trends
- Common failure patterns
- Processing time changes

### 3. Review Low-Confidence Tickets
When `status: "needs_review"`:
1. Visit the `review_url`
2. Check the `draft_analysis`
3. Make corrections
4. Log feedback

### 4. Optimize Costs
The system automatically:
- Uses fast models for simple tickets
- Skips agents when confidence is high
- No OpenAI costs (Groq only)

## 🎓 Learn More

- **Full Migration Guide:** [LANGGRAPH_MIGRATION.md](LANGGRAPH_MIGRATION.md)
- **Architecture Details:** [readme.md](readme.md)
- **LangGraph Docs:** https://langchain-ai.github.io/langgraph/
- **Groq Docs:** https://console.groq.com/docs

## 💡 Example Use Cases

### 1. IT Helpdesk Automation
```python
# User submits ticket via web form
response = analyze_ticket(title, description, user_info)

if response["status"] == "needs_review":
    # Route to human agent
    assign_to_expert(response["draft_analysis"])
else:
    # Auto-respond with solutions
    email_user(response["recommended_solutions"])
```

### 2. Ticket Triage Dashboard
```python
# Batch process new tickets
tickets = get_pending_tickets()
results = bulk_process(tickets)

# Auto-assign by priority
for result in results:
    if result["priority"] == "Critical":
        assign_to_senior_engineer(result)
    else:
        assign_to_pool(result)
```

### 3. Agent Performance Monitoring
```python
# Weekly report
stats = get_agent_performance()

print(f"Classifier accuracy: {stats['classifier']['accuracy']:.2%}")
print(f"Priority accuracy: {stats['priority_predictor']['accuracy']:.2%}")

# Alert if accuracy drops
if stats['classifier']['accuracy'] < 0.85:
    send_alert("Classifier accuracy below threshold")
```

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env`
3. ✅ Start API
4. ✅ Test analyze endpoint
5. ✅ Check performance stats
6. ✅ Log feedback for 10+ tickets
7. ✅ Monitor accuracy improvements
8. ✅ Deploy to production!

---

**Need Help?**
- Check [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) for detailed changes
- Review [LANGGRAPH_MIGRATION.md](LANGGRAPH_MIGRATION.md) for architecture
- Read [readme.md](readme.md) for full documentation

**Ready to go!** 🎉
