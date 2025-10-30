import pytest
import main
from core.models import TicketAnalysisRequest, RequesterInfo

class DummyCrewScenario:
    async def classify_ticket(self, title, description):
        text = f"{title} {description}".lower()
        if "vpn" in text or "remote" in text:
            return {"category": "Network Issues", "subcategory": "VPN", "confidence": 0.9, "reasoning": "vpn matched"}
        return {"category": "General Support", "subcategory": "Other", "confidence": 0.6, "reasoning": "default"}

    async def predict_priority(self, title, description, requester_info=None):
        text = f"{title} {description}".lower()
        if "cannot connect" in text or "auth" in text:
            return {"priority": "High", "confidence": 0.85, "eta_hours": 8}
        return {"priority": "Medium", "confidence": 0.75, "eta_hours": 24}

    async def analyze_ticket(self, title, description, requester_info=None, additional_context=None):
        cls = await self.classify_ticket(title, description)
        pr = await self.predict_priority(title, description, requester_info)
        return {"ticket_id": "scenario-2", "classification": cls, "priority_prediction": pr, "recommended_solutions": [], "processing_time_ms": 37.0}

@pytest.mark.asyncio
async def test_vpn_issue_analysis_flow():
    req = TicketAnalysisRequest(
        title="VPN cannot connect",
        description="User reports VPN auth failure when working remotely.",
        requester_info=RequesterInfo(name="Alex", department="Engineering", location="Remote")
    )
    crew = DummyCrewScenario()
    result = await main.analyze_ticket(req, crew)
    assert result["classification"]["category"] == "Network Issues"
    assert result["classification"]["subcategory"] == "VPN"
    assert result["priority_prediction"]["priority"] in {"High","Medium"}
