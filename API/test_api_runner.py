"""Interactive endpoint tester for the API.

Usage:
  python API/test_api_runner.py

This script provides a simple numbered menu to exercise the API endpoints
with realistic example payloads. It prints the request payload (if any)
and the HTTP response (status + body). Use this to manually verify endpoints
and iterate until the API is fully implemented.

Note: the script uses `httpx`. Install with:
  python -m pip install httpx
"""
from __future__ import annotations

import json
import sys
from typing import Any, Dict

import httpx


BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 60.0


def pretty_print(title: str, data: Any) -> None:
    print("\n===", title, "===")
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(data)


def validate_analysis_response(response: Dict[str, Any]):
    """Validate analysis response structure and required fields"""
    print("\n" + "="*60)
    print("🔍 VALIDATING ANALYSIS RESPONSE")
    print("="*60)
    
    issues = []
    
    # Check top-level fields
    required_fields = ["ticket_id", "classification", "priority_prediction", "recommended_solutions"]
    for field in required_fields:
        if field not in response:
            issues.append(f"Missing required field: {field}")
        else:
            print(f"✅ Has '{field}'")
    
    # Check classification
    if "classification" in response:
        classification = response["classification"]
        if not classification.get("category"):
            issues.append("Classification missing 'category'")
        else:
            print(f"✅ Category: {classification.get('category')}")
        
        if not classification.get("reasoning") or classification.get("reasoning") == "":
            issues.append("Classification has empty 'reasoning'")
        else:
            print(f"✅ Reasoning length: {len(classification.get('reasoning', ''))} chars")
        
        conf = classification.get("confidence", 0)
        if conf < 0.5:
            issues.append(f"Classification confidence too low: {conf}")
        else:
            print(f"✅ Confidence: {conf}")
    
    # Check priority
    if "priority_prediction" in response:
        priority = response["priority_prediction"]
        if not priority.get("priority"):
            issues.append("Priority prediction missing 'priority' level")
        else:
            print(f"✅ Priority: {priority.get('priority')}")
        
        if "estimated_resolution_hours" not in priority:
            issues.append("Priority missing 'estimated_resolution_hours'")
    
    # Check solutions
    if "recommended_solutions" in response:
        solutions = response["recommended_solutions"]
        print(f"✅ Solutions count: {len(solutions)}")
        
        if len(solutions) == 0:
            issues.append("No solutions returned (KB may be empty)")
        else:
            # Check first solution structure
            first = solutions[0]
            if not first.get("title"):
                issues.append("Solution missing 'title'")
            if "steps" not in first:
                issues.append("Solution missing 'steps'")
    
    # Check for new UX fields
    if "summary" in response:
        print(f"✅ Has plain-English summary: {len(response['summary'])} chars")
    else:
        issues.append("Missing 'summary' field (plain-English summary)")
    
    if "action_items" in response:
        print(f"✅ Has action items: {len(response['action_items'])} items")
    else:
        issues.append("Missing 'action_items' field")
    
    if "resolution_timeline" in response:
        timeline = response["resolution_timeline"]
        print(f"✅ Has resolution timeline (SLA: {timeline.get('sla', 'N/A')})")
    else:
        issues.append("Missing 'resolution_timeline' field")
    
    if "warnings" in response and len(response["warnings"]) > 0:
        print(f"⚠️  Has confidence warnings: {len(response['warnings'])} warnings")
        for warning in response["warnings"]:
            print(f"   - {warning.get('type')}: {warning.get('message')}")
    
    # Check metadata
    metadata = response.get("analysis_metadata", {})
    if "workflow" in metadata:
        print(f"✅ Workflow: {metadata.get('workflow')}")
    
    if "model_used" in metadata:
        print(f"✅ Model: {metadata.get('model_used')}")
    
    if "total_documents_retrieved" in metadata:
        print(f"✅ Documents retrieved: {metadata.get('total_documents_retrieved')}")
    
    if "top_similarity_score" in metadata:
        print(f"✅ Top similarity: {metadata.get('top_similarity_score')}")
    
    # Summary
    if issues:
        print("\n⚠️  VALIDATION ISSUES FOUND:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("\n✅ ALL VALIDATION CHECKS PASSED!")
    print("="*60)


def validate_recommend_response(response: Dict[str, Any]):
    """Validate solution recommendation response structure"""
    print("\n" + "="*60)
    print("🔍 VALIDATING RECOMMENDATION RESPONSE")
    print("="*60)
    
    issues = []
    
    # Check top-level fields
    if "recommendations" not in response:
        issues.append("Missing 'recommendations' field")
    else:
        print("✅ Has 'recommendations'")
    
    if "total_results" not in response:
        issues.append("Missing 'total_results' field")
    else:
        print(f"✅ Total results: {response.get('total_results')}")
    
    # Check recommendations content
    if "recommendations" in response:
        recommendations = response["recommendations"]
        
        if len(recommendations) == 0:
            issues.append("⚠️  No recommendations returned (KB may be empty - run: python scripts/ingest_solutions.py)")
        else:
            print(f"✅ Recommendations count: {len(recommendations)}")
            
            # Check first recommendation structure
            first = recommendations[0]
            required_fields = ["solution_id", "title", "steps", "similarity_score", "estimated_time_minutes", "success_rate"]
            
            for field in required_fields:
                if field not in first:
                    issues.append(f"Recommendation missing '{field}'")
                else:
                    if field == "steps":
                        print(f"✅ Has steps: {len(first.get('steps', []))} steps")
                    elif field == "similarity_score":
                        print(f"✅ Similarity score: {first.get('similarity_score'):.3f}")
                    elif field == "estimated_time_minutes":
                        print(f"✅ Estimated time: {first.get('estimated_time_minutes')} minutes")
                    elif field == "success_rate":
                        print(f"✅ Success rate: {first.get('success_rate'):.1%}")
    
    # Summary
    if issues:
        print("\n⚠️  VALIDATION ISSUES FOUND:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("\n✅ ALL VALIDATION CHECKS PASSED!")
    print("="*60)


def call_get(path: str, params: Dict[str, Any] | None = None):
    url = BASE_URL + path
    pretty_print("REQUEST", {"method": "GET", "url": url, "params": params})
    try:
        r = httpx.get(url, params=params or {}, timeout=TIMEOUT)
        pretty_print("RESPONSE status", r.status_code)
        try:
            pretty_print("RESPONSE body", r.json())
        except Exception:
            pretty_print("RESPONSE body (text)", r.text)
    except Exception as e:
        pretty_print("ERROR", str(e))


def call_post(path: str, payload: Dict[str, Any] | None = None, validate: bool = False):
    url = BASE_URL + path
    pretty_print("REQUEST", {"method": "POST", "url": url, "json": payload})
    try:
        r = httpx.post(url, json=payload or {}, timeout=TIMEOUT)
        pretty_print("RESPONSE status", r.status_code)
        try:
            response_data = r.json()
            pretty_print("RESPONSE body", response_data)
            
            # If this is an analyze endpoint and validation requested, validate structure
            if validate and r.status_code == 200:
                if "tickets/analyze" in path:
                    validate_analysis_response(response_data)
                elif "solutions/recommend" in path:
                    validate_recommend_response(response_data)
        except Exception:
            pretty_print("RESPONSE body (text)", r.text)
    except Exception as e:
        pretty_print("ERROR", str(e))


def test_root():
    call_get("/")


def test_health():
    call_get("/api/v1/health")


def test_ledger():
    # Show stats only
    call_get("/api/v1/knowledge/ledger", params={"include_entries": False})


def test_kb_status():
    # Debug endpoint for knowledge base content/health
    call_get("/api/v1/debug/knowledge-base-status")


def test_analyze():
    """Test comprehensive ticket analysis with iPhone email sync issue"""
    payload = {
        "title": "Email not syncing on iPhone",
        "description": "User reports emails stop syncing since this morning. Send works but receive does not. Using iOS Mail app with corporate Exchange account.",
        "requester_info": {"name": "Sarah Johnson", "email": "sarah.johnson@example.com", "department": "Finance"},
        "additional_context": {"platform": "iOS", "app": "Mail", "device": "iPhone 14"}
    }
    print("\n🧪 Testing comprehensive workflow with email sync issue...")
    print("Expected: Category=Email Issues, Subcategory=Mobile Email Sync, Priority=High (Finance dept)")
    print("Expected: Non-empty solutions with detailed mobile email troubleshooting steps")
    print("Expected: Metadata shows 'langgraph' workflow with agents_executed list")
    call_post("/api/v1/tickets/analyze", payload, validate=True)


def test_classify():
    """Test classification with network issue"""
    payload = {"title": "Cannot connect to WiFi", "description": "Laptop cannot join corporate WiFi network. Getting 'Unable to connect' error."}
    print("\n🧪 Testing classification endpoint...")
    print("Expected: Category=Network Issues, Subcategory=WiFi, confidence>0.7")
    call_post("/api/v1/tickets/classify", payload)


def test_predict_priority():
    """Test priority prediction with critical payroll issue"""
    payload = {"title": "Payroll system down", "description": "Payroll service not reachable for Finance team. Multiple users affected."}
    print("\n🧪 Testing priority prediction endpoint...")
    print("Expected: Priority=Critical or High, estimated_resolution_hours<8, reasoning present")
    call_post("/api/v1/tickets/predict-priority", payload)


def test_bulk_process():
    """Test bulk processing with diverse ticket types"""
    payload = {
        "tickets": [
            {"title": "User cannot print", "description": "Printer queue shows error. HP LaserJet on 2nd floor."},
            {"title": "VPN not connecting", "description": "Remote users cannot establish VPN. Getting timeout error."},
            {"title": "Outlook keeps crashing", "description": "Outlook closes unexpectedly when opening large emails."}
        ],
        "options": None
    }
    print("\n🧪 Testing bulk processing endpoint...")
    print("Expected: 3 tickets processed, each with classification, priority, solutions")
    call_post("/api/v1/tickets/bulk-process", payload)


def test_recommend_solutions():
    """Test solution recommendation with email sync query"""
    payload = {"query": "email sync iphone not receiving", "category": "Email Issues", "max_results": 5}
    print("\n🧪 Testing solution recommendation endpoint...")
    print("Expected: Non-empty solutions with steps, similarity_score, estimated_time_minutes")
    print("\n⚠️  NOTE: If you get empty results, the knowledge base may be empty.")
    print("   Run: python scripts/ingest_solutions.py")
    print("   Then test endpoint /api/v1/debug/knowledge-base-status to verify KB has data\n")
    call_post("/api/v1/solutions/recommend", payload, validate=True)


def test_search_knowledge():
    call_get("/api/v1/solutions/search", params={"q": "wifi", "limit": 5})


def test_ingest_knowledge():
    payload = {"source": "https://example.com/guide.pdf", "source_type": "documentation", "metadata": {}}
    call_post("/api/v1/knowledge/ingest", payload)


def test_get_dashboard():
    call_get("/api/v1/analytics/dashboard", params={"days": 7})


def test_generate_reports():
    call_get("/api/v1/analytics/reports", params={"report_type": "summary"})


def test_models_status():
    call_get("/api/v1/models/status")


def test_models_reload():
    call_post("/api/v1/models/reload", payload={})


def test_agent_performance():
    call_get("/api/v1/agents/performance")


def test_agent_feedback():
    # Endpoint expects query params, not JSON body
    path = "/api/v1/agents/feedback?ticket_id=test_123&agent=classifier&actual=Network%20Issues&feedback_source=resolution"
    call_post(path, payload={})


def test_ticket_review():
    """Test ticket review retrieval"""
    call_get("/api/v1/review/test_ticket_456")


def test_analyze_hardware():
    """Test analysis with hardware failure (printer)"""
    payload = {
        "title": "Printer not printing color documents",
        "description": "HP Color LaserJet on 3rd floor prints black & white only. Color jobs stay in queue. Checked toner levels - all good.",
        "requester_info": {"name": "Mike Chen", "email": "mike.chen@example.com", "department": "Marketing"},
        "additional_context": {"device": "HP Color LaserJet Pro M454dn", "location": "3rd floor copy room"}
    }
    print("\n🧪 Testing analysis with hardware issue (printer)...")
    print("Expected: Category=Hardware, Subcategory=Printer, detailed printer troubleshooting steps")
    call_post("/api/v1/tickets/analyze", payload, validate=True)


def test_analyze_vpn():
    """Test analysis with VPN connectivity issue"""
    payload = {
        "title": "VPN connection keeps dropping",
        "description": "VPN connects successfully but drops after 5-10 minutes. Happens on home WiFi. Using Cisco AnyConnect.",
        "requester_info": {"name": "Lisa Park", "email": "lisa.park@example.com", "department": "Sales"},
        "additional_context": {"vpn_client": "Cisco AnyConnect", "network": "Home WiFi"}
    }
    print("\n🧪 Testing analysis with VPN issue...")
    print("Expected: Category=Network Issues, Subcategory=VPN, VPN-specific troubleshooting steps")
    call_post("/api/v1/tickets/analyze", payload, validate=True)


def test_analyze_software():
    """Test analysis with software installation issue"""
    payload = {
        "title": "Cannot install Microsoft Teams",
        "description": "Installation fails with error code 0x80070643. Tried uninstalling and reinstalling. Windows 11 Pro.",
        "requester_info": {"name": "John Davis", "email": "john.davis@example.com", "department": "IT"},
        "additional_context": {"os": "Windows 11 Pro", "error_code": "0x80070643"}
    }
    print("\n🧪 Testing analysis with software installation issue...")
    print("Expected: Category=Software Problems, Subcategory=Installation, software troubleshooting steps")
    call_post("/api/v1/tickets/analyze", payload, validate=True)


def test_analyze_access():
    """Test analysis with account access issue"""
    payload = {
        "title": "Account locked out after password attempts",
        "description": "User tried resetting password multiple times. Now account shows locked. Cannot login to any systems.",
        "requester_info": {"name": "Emma Wilson", "email": "emma.wilson@example.com", "department": "HR"},
        "additional_context": {"issue_type": "account_lockout"}
    }
    print("\n🧪 Testing analysis with access issue...")
    print("Expected: Category=Access & Permissions, Subcategory=Login or Password, account access steps")
    call_post("/api/v1/tickets/analyze", payload, validate=True)


MENU = [
    ("Root", test_root),
    ("Health Check", test_health),
    ("Ledger (stats)", test_ledger),
    ("KB Status (GET /api/v1/debug/knowledge-base-status)", test_kb_status),
    ("Analyze Ticket - Email Sync (POST /api/v1/tickets/analyze)", test_analyze),
    ("Analyze Ticket - Printer Issue (Hardware)", test_analyze_hardware),
    ("Analyze Ticket - VPN Issue (Network)", test_analyze_vpn),
    ("Analyze Ticket - Software Installation", test_analyze_software),
    ("Analyze Ticket - Account Access", test_analyze_access),
    ("Classify Ticket (POST /api/v1/tickets/classify)", test_classify),
    ("Predict Priority (POST /api/v1/tickets/predict-priority)", test_predict_priority),
    ("Bulk Process Tickets (POST /api/v1/tickets/bulk-process)", test_bulk_process),
    ("Recommend Solutions (POST /api/v1/solutions/recommend)", test_recommend_solutions),
    ("Search Knowledge Base (GET /api/v1/solutions/search)", test_search_knowledge),
    ("Ingest Knowledge (POST /api/v1/knowledge/ingest)", test_ingest_knowledge),
    ("Get Dashboard Data (GET /api/v1/analytics/dashboard)", test_get_dashboard),
    ("Generate Reports (GET /api/v1/analytics/reports)", test_generate_reports),
    ("Get Model Status (GET /api/v1/models/status)", test_models_status),
    ("Reload Models (POST /api/v1/models/reload)", test_models_reload),
    ("Get Agent Performance (GET /api/v1/agents/performance)", test_agent_performance),
    ("Log Agent Feedback (POST /api/v1/agents/feedback)", test_agent_feedback),
    ("Get Ticket Review (GET /api/v1/review/{ticket_id})", test_ticket_review),
]


def print_menu():
    print("\nAPI endpoint tester — base:", BASE_URL)
    for i, (label, _) in enumerate(MENU, start=1):
        print(f"{i}. {label}")
    print("0. Run all tests sequentially")
    print("q. Quit")


def run_all():
    for i, (label, fn) in enumerate(MENU, start=1):
        print(f"\n---- [{i}] {label} ----")
        try:
            fn()
        except Exception as e:
            pretty_print("ERROR while running", str(e))


def main():
    if len(sys.argv) > 1:
        # Allow running a single numeric test by passing its number
        arg = sys.argv[1]
        if arg.isdigit():
            idx = int(arg)
            if idx == 0:
                run_all()
                return
            if 1 <= idx <= len(MENU):
                MENU[idx - 1][1]()
                return

    while True:
        print_menu()
        choice = input("Select test number (or q): ").strip()
        if choice.lower() == "q":
            break
        if not choice:
            continue
        if choice == "0":
            run_all()
            continue
        if not choice.isdigit():
            print("Invalid selection")
            continue
        idx = int(choice)
        if 1 <= idx <= len(MENU):
            MENU[idx - 1][1]()
        else:
            print("Invalid selection")


if __name__ == "__main__":
    main()
