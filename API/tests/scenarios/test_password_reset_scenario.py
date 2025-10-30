import pytest
import main
from core.models import TicketAnalysisRequest, RequesterInfo

class DummyCrewScenario:
    async def classify_ticket(self, title, description):
        text = f"{title} {description}".lower()
        if "password" in text or "reset" in text or "locked" in text:
            return {"category": "Account Access", "subcategory": "Password Reset", "confidence": 0.9, "reasoning": "password reset"}
        return {"category": "General Support", "subcategory": "Other", "confidence": 0.6, "reasoning": "default"}

    async def predict_priority(self, title, description, requester_info=None):
        text = f"{title} {description}".lower()
        if "locked" in text or "cannot login" in text:
            return {"priority": "High", "confidence": 0.8, "eta_hours": 4}
        return {"priority": "Low", "confidence": 0.7, "eta_hours": 72}

    async def analyze_ticket(self, title, description, requester_info=None, additional_context=None):
        cls = await self.classify_ticket(title, description)
        pr = await self.predict_priority(title, description, requester_info)
        return {"ticket_id": "scenario-3", "classification": cls, "priority_prediction": pr, "recommended_solutions": [], "processing_time_ms": 25.0}

@pytest.mark.asyncio
async def test_password_reset_flow():
    req = TicketAnalysisRequest(
        title="Account locked after failed attempts",
        description="User cannot login and account is locked, needs password reset.",
        requester_info=RequesterInfo(name="Priya", department="HR", location="LA")
    )
    crew = DummyCrewScenario()
    result = await main.analyze_ticket(req, crew)
    assert result["classification"]["category"] == "Account Access"
    assert result["classification"]["subcategory"] == "Password Reset"
