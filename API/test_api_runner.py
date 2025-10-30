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


def call_post(path: str, payload: Dict[str, Any] | None = None):
    url = BASE_URL + path
    pretty_print("REQUEST", {"method": "POST", "url": url, "json": payload})
    try:
        r = httpx.post(url, json=payload or {}, timeout=TIMEOUT)
        pretty_print("RESPONSE status", r.status_code)
        try:
            pretty_print("RESPONSE body", r.json())
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


def test_analyze():
    payload = {
        "title": "Email not syncing on iPhone",
        "description": "User reports emails stop syncing since this morning. Send works but receive does not.",
        "requester_info": {"name": "Sarah Johnson", "email": "sarah.johnson@example.com", "department": "Finance"},
        "additional_context": {"platform": "iOS", "app": "Mail"}
    }
    call_post("/api/v1/tickets/analyze", payload)


def test_classify():
    payload = {"title": "Cannot connect to WiFi", "description": "Laptop cannot join corporate WiFi network"}
    call_post("/api/v1/tickets/classify", payload)


def test_predict_priority():
    payload = {"title": "Payroll system down", "description": "Payroll service not reachable for Finance team"}
    call_post("/api/v1/tickets/predict-priority", payload)


def test_bulk_process():
    payload = {
        "tickets": [
            {"title": "User cannot print", "description": "Printer queue shows error"},
            {"title": "VPN not connecting", "description": "Remote users cannot establish VPN"}
        ],
        "options": None
    }
    call_post("/api/v1/tickets/bulk-process", payload)


def test_recommend_solutions():
    payload = {"query": "email sync iphone", "category": "Email Issues", "max_results": 5}
    call_post("/api/v1/solutions/recommend", payload)


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


MENU = [
    ("Root", test_root),
    ("Health Check", test_health),
    ("Ledger (stats)", test_ledger),
    ("Analyze Ticket (POST /api/v1/tickets/analyze)", test_analyze),
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
