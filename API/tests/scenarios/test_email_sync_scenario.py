import pytest
import main
from core.models import TicketAnalysisRequest, RequesterInfo

class DummyCrewScenario:
    async def classify_ticket(self, title, description):
        text = f"{title} {description}".lower()
        if "email" in text and ("iphone" in text or "ios" in text or "mobile" in text):
            return {"category": "Email Issues", "subcategory": "Mobile Sync", "confidence": 0.9, "reasoning": "keywords matched"}
        return {"category": "General Support", "subcategory": "Other", "confidence": 0.6, "reasoning": "default"}

    async def predict_priority(self, title, description, requester_info=None):
        text = f"{title} {description}".lower()
        priority = "Medium"
        if "can't receive" in text or "not syncing" in text:
            priority = "High"
        return {"priority": priority, "confidence": 0.8, "eta_hours": 8 if priority=="High" else 24}

    async def analyze_ticket(self, title, description, requester_info=None, additional_context=None):
        cls = await self.classify_ticket(title, description)
        pr = await self.predict_priority(title, description, requester_info)
        return {
            "ticket_id": "scenario-1",
            "classification": cls,
            "priority_prediction": pr,
            "recommended_solutions": [],
            "processing_time_ms": 42.0,
        }

@pytest.mark.asyncio
async def test_email_sync_analysis_flow():
    req = TicketAnalysisRequest(
        title="Email not syncing on iPhone",
        description="Since this morning I can send but not receive emails on my iPhone.",
        requester_info=RequesterInfo(name="Sarah", department="Finance", location="NY")
    )
    crew = DummyCrewScenario()
    result = await main.analyze_ticket(req, crew)
    assert result["classification"]["category"] == "Email Issues"
    assert result["priority_prediction"]["priority"] in {"High","Medium"}
