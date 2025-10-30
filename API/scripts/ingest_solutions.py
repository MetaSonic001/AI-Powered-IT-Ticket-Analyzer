"""Seed the knowledge base with a handful of common IT solutions.

Usage (from repo root):
  python -m API.scripts.ingest_solutions

This will connect to the configured KnowledgeService (ChromaDB by default)
and insert several troubleshooting guides so recommendations are never empty.
"""
from __future__ import annotations

import asyncio
from typing import List, Dict

from core.config import get_settings
from services.knowledge_service import KnowledgeService
from utils.logger import setup_logger

logger = setup_logger(__name__)


SAMPLE_SOLUTIONS: List[Dict] = [
    {
        "title": "Fix iPhone email not syncing (Exchange)",
        "content": (
            "If iOS Mail isn't receiving new messages with an Exchange account, verify network,"
            " server settings, and background app refresh. Remove and re-add profile if needed."
        ),
        "category": "Email Issues",
        "metadata": {
            "steps": [
                "Verify device has internet access (Wi‑Fi/cellular)",
                "Check Server, Domain, Username in account settings",
                "Enable Background App Refresh for Mail",
                "Toggle Mail sync off/on for the account",
                "Remove and re-add the Exchange account profile",
                "If corporate, confirm ActiveSync policy isn't blocking device"
            ],
            "estimated_time_minutes": 20,
            "type": "howto",
        },
    },
    {
        "title": "Troubleshoot Wi‑Fi connectivity on Windows 10/11",
        "content": (
            "When Windows can't connect to Wi‑Fi, ensure adapter is enabled, reset stack,"
            " and check network profile. Update drivers and forget/rejoin SSID."
        ),
        "category": "Network Issues",
        "metadata": {
            "steps": [
                "Toggle Airplane mode off and ensure Wi‑Fi adapter is enabled",
                "Run 'Network Reset' in Windows settings",
                "ipconfig /flushdns and netsh winsock reset (requires reboot)",
                "Update or reinstall the Wi‑Fi driver",
                "Forget and reconnect to the corporate SSID",
                "Verify VLAN, DHCP, and captive portal requirements"
            ],
            "estimated_time_minutes": 25,
            "type": "runbook",
        },
    },
    {
        "title": "VPN unable to connect (AnyConnect)",
        "content": (
            "For AnyConnect timeouts, confirm credentials, endpoint reachability, and local firewall."
            " Try switching networks and reinstalling the client."
        ),
        "category": "Network Issues",
        "metadata": {
            "steps": [
                "Check internet access and DNS resolution of VPN gateway",
                "Verify username/password and MFA status",
                "Temporarily disable local firewall/AV to test",
                "Try wired vs wireless or a mobile hotspot",
                "Reinstall Cisco AnyConnect client",
                "Check certificate trust and date/time sync"
            ],
            "estimated_time_minutes": 30,
            "type": "troubleshooting",
        },
    },
    {
        "title": "Outlook crashing on opening large emails",
        "content": (
            "Crashes can be due to add-ins or corrupted OST. Start Outlook in safe mode,"
            " repair Office, recreate profile, and reduce mailbox size."
        ),
        "category": "Software Problems",
        "metadata": {
            "steps": [
                "Start Outlook in Safe Mode (outlook.exe /safe)",
                "Disable non-essential add-ins",
                "Repair Office installation",
                "Rename or recreate Outlook profile",
                "Compact or archive oversized PST/OST",
                "Update Office to latest build"
            ],
            "estimated_time_minutes": 35,
            "type": "howto",
        },
    },
    {
        "title": "Cannot print — jobs stuck in queue",
        "content": (
            "Clear the print spooler and reinstall the printer. Verify driver and network connectivity"
            " to the print server or device."
        ),
        "category": "Hardware Issues",
        "metadata": {
            "steps": [
                "Stop Print Spooler service",
                "Delete files in C\\\Windows\\\System32\\\spool\\\PRINTERS",
                "Start Print Spooler service",
                "Remove and re-add the printer",
                "Install correct manufacturer driver",
                "Print test page and verify network path"
            ],
            "estimated_time_minutes": 15,
            "type": "runbook",
        },
    },
    {
        "title": "Account locked out — Active Directory",
        "content": (
            "Users can get locked after multiple failed attempts. Unlock in ADUC, reset password,"
            " and check for stale credentials on devices/services."
        ),
        "category": "Access & Permissions",
        "metadata": {
            "steps": [
                "Unlock the user in Active Directory Users and Computers",
                "Reset the password and enforce strong policy",
                "Identify lockout source using Event Viewer or lockout status tools",
                "Update saved credentials on mapped drives and services",
                "Ensure time sync across devices to avoid Kerberos issues"
            ],
            "estimated_time_minutes": 20,
            "type": "kb",
        },
    },
    {
        "title": "Install Microsoft Teams fails (0x80070643)",
        "content": (
            "The MSI may fail due to cached installers or policy. Clear Teams caches, remove leftovers,"
            " run installer as admin, and ensure Windows Installer service is healthy."
        ),
        "category": "Software Problems",
        "metadata": {
            "steps": [
                "Uninstall existing Teams/MSI remnants",
                "Delete %LocalAppData%\\\Microsoft\\\Teams caches",
                "Run the offline Teams MSI as Administrator",
                "Check Windows Installer service and pending reboots",
                "Review setup logs for specific error modules"
            ],
            "estimated_time_minutes": 25,
            "type": "kb",
        },
    },
]


async def main() -> None:
    settings = get_settings()
    ks = KnowledgeService(settings)
    await ks.initialize()

    inserted = 0
    for doc in SAMPLE_SOLUTIONS:
        try:
            await ks.add_document(
                title=doc["title"],
                content=doc["content"],
                category=doc["category"],
                metadata=doc["metadata"],
                source="seed",
                source_type="script",
            )
            inserted += 1
        except Exception as e:
            logger.warning(f"Failed to insert '{doc['title']}': {e}")

    health = await ks.health_check()
    count = await ks.get_document_count()
    logger.info(f"Seed complete. Inserted={inserted} Total={count} Backend={health.get('backend')}")


if __name__ == "__main__":
    asyncio.run(main())
