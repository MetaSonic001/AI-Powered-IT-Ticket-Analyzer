import json
import pytest

from core.models import TicketAnalysisRequest, SolutionRecommendationRequest, BulkTicketRequest, KnowledgeIngestRequest
from fastapi import BackgroundTasks

import main
from core.config import reload_settings


class DummyCrew:
    async def classify_ticket(self, title, description):
        return {
            "category": "Network Issues",
            "subcategory": "WiFi",
            "confidence": 0.95,
            "reasoning": "Mocked classification"
        }

    async def analyze_ticket(self, title, description, requester_info=None, additional_context=None):
        return {
            "ticket_id": "test-1",
            "classification": {
                "category": "Network Issues",
                "subcategory": "WiFi",
                "confidence": 0.95
            },
            "priority_prediction": {
                "priority": "High",
                "confidence": 0.9
            },
            "recommended_solutions": [],
            "processing_time_ms": 123.4
        }

    async def predict_priority(self, title, description, requester_info=None):
        return {
            "priority": "High",
            "confidence": 0.9,
            "eta_hours": 4
        }

    async def process_bulk_tickets(self, tickets, task_id: str, options=None):
        # Simulate background processing
        return True


class DummyKnowledge:
    async def get_recommendations(self, query, category=None, max_results=5, min_similarity=0.7):
        return [
            {
                "solution_id": "s1",
                "title": "Reboot WiFi",
                "description": "Restart the access point",
                "similarity_score": 0.88,
                "source": "synthetic"
            }
        ]

    async def search(self, query, category=None, limit=10):
        return [
            {
                "doc_id": "d1",
                "title": "WiFi Troubleshooting",
                "content_snippet": "Reboot the router",
                "score": 0.8,
                "source": "internal"
            }
        ]

    async def ingest_knowledge(self, source, source_type, metadata=None, task_id: str = ""):
        return True


class DummyDataService:
    async def get_dashboard_analytics(self, days=30):
        return {
            "metrics": {
                "total_tickets_analyzed": 10,
                "avg_processing_time_ms": 100.0,
                "accuracy_rate": 0.9,
                "knowledge_base_size": 25,
                "active_solutions": 5
            },
            "category_stats": [],
            "priority_stats": [],
            "trends": [],
            "recent_tickets": []
        }

    async def generate_report(self, report_type: str = "summary", start_date=None, end_date=None):
        return {"report_type": report_type, "items": 3}


@pytest.mark.asyncio
async def test_root_endpoint():
    result = await main.root()
    assert isinstance(result, dict)
    assert "message" in result


@pytest.mark.asyncio
async def test_health_endpoint_with_no_services():
    # When services are not initialized the health endpoint should return a JSONResponse
    response = await main.health_check()
    assert hasattr(response, "body")
    body = json.loads(response.body.decode())
    assert "status" in body and "services" in body


@pytest.mark.asyncio
async def test_classify_ticket_direct_call():
    req = TicketAnalysisRequest(
        title="Cannot connect to WiFi",
        description="User cannot connect to corporate WiFi when on site."
    )
    dummy = DummyCrew()
    res = await main.classify_ticket(req, dummy)
    assert isinstance(res, dict)
    assert res.get("category") == "Network Issues"


@pytest.mark.asyncio
async def test_recommend_solutions_direct_call():
    req = SolutionRecommendationRequest(query="wifi issues", category=None)
    dummy = DummyKnowledge()
    res = await main.recommend_solutions(req, dummy)
    assert isinstance(res, dict)
    assert "recommendations" in res
    assert len(res["recommendations"]) >= 1


@pytest.mark.asyncio
async def test_search_knowledge_direct_call():
    dummy = DummyKnowledge()
    res = await main.search_knowledge_base(q="wifi", category=None, limit=5, knowledge=dummy)
    assert isinstance(res, dict)
    assert res["total_results"] >= 1


@pytest.mark.asyncio
async def test_get_dashboard_data_direct_call():
    dummy = DummyDataService()
    dashboard = await main.get_dashboard_data(days=7, data_service=dummy)
    # Should return a pydantic model instance (DashboardResponse)
    assert hasattr(dashboard, "metrics")
    assert dashboard.metrics.total_tickets_analyzed == 10


@pytest.mark.asyncio
async def test_predict_priority_direct_call():
    req = TicketAnalysisRequest(title="Outlook not sending emails", description="User cannot send emails.")
    dummy = DummyCrew()
    res = await main.predict_priority(req, dummy)
    assert res.get("priority") == "High"


@pytest.mark.asyncio
async def test_bulk_process_direct_call():
    req = BulkTicketRequest(tickets=[{"title": "t1", "description": "d1"}], options=None)
    bg = BackgroundTasks()
    dummy = DummyCrew()
    res = await main.bulk_process_tickets(req, bg, dummy)
    assert "task_id" in res and res["status"] == "processing"


@pytest.mark.asyncio
async def test_ingest_knowledge_endpoint():
    # Use a valid SourceType value per the enum (e.g., 'documentation')
    req = KnowledgeIngestRequest(source="http://example.com", source_type="documentation", metadata={})
    bg = BackgroundTasks()
    dummy = DummyKnowledge()
    res = await main.ingest_knowledge(req, bg, dummy)
    assert res["status"] == "processing"


@pytest.mark.asyncio
async def test_generate_reports_direct_call():
    dummy = DummyDataService()
    res = await main.generate_reports(report_type="summary", data_service=dummy)
    assert res["report_type"] == "summary"


def test_settings_local_sqlite(monkeypatch):
    """Ensure local mode flags are respected without Docker."""
    monkeypatch.setenv("USE_DOCKER", "false")
    monkeypatch.setenv("USE_SQLITE", "true")
    monkeypatch.setenv("SQLITE_DB_PATH", "./data/test_knowledge.db")
    s = reload_settings()
    assert s.use_docker is False
    assert s.use_sqlite is True
    assert s.sqlite_db_path.endswith("test_knowledge.db")


@pytest.mark.asyncio
async def test_ledger_endpoint_direct_call(tmp_path, monkeypatch):
    """Ensure the ledger endpoint returns stats and optional entries without crashing."""
    # Point ledger to a temporary db
    monkeypatch.setenv("LEDGER_DB_PATH", str(tmp_path / "ledger_test.db"))
    res = await main.get_ledger(include_entries=False)
    assert isinstance(res, dict)
    assert "stats" in res and set(res["stats"]).issuperset({"synced", "removed", "total"})

    # Request with entries (should be empty initially)
    res2 = await main.get_ledger(include_entries=True, limit=10)
    assert "entries" in res2
    assert isinstance(res2["entries"], list)
