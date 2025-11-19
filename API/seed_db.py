import asyncio
import random
import uuid
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys
import os

# Add the parent directory to sys.path to allow imports from API modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from API.core.config import get_settings
from API.utils.database import TicketDatabase
from API.services.knowledge_service import KnowledgeService

# Setup logging
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
# Richer Data Definitions

IT_SCENARIOS = {
    "Network Issues": [
        {"title": "Wi-Fi dropping in Conference Room B", "desc": "The Wi-Fi connection keeps dropping intermittently when we are in Conference Room B. It happens every 10-15 minutes during video calls.", "subcategory": "Wi-Fi"},
        {"title": "VPN Connection Error 800", "desc": "I cannot connect to the corporate VPN. I am getting Error 800: Unable to establish the VPN connection. I have tried restarting my router.", "subcategory": "VPN"},
        {"title": "Slow Internet Speed on 4th Floor", "desc": "Internet speed is extremely slow on the 4th floor today. Loading web pages takes forever.", "subcategory": "Connectivity"},
        {"title": "Cannot access internal file server", "desc": "I can access the internet, but I cannot connect to the internal file server (\\\\fs01). It says 'Network path not found'.", "subcategory": "File Share"}
    ],
    "Software Problems": [
        {"title": "Excel crashes when opening large CSV", "desc": "Every time I try to open the monthly sales report CSV (about 50MB), Excel freezes and then crashes. I have 16GB of RAM.", "subcategory": "Office Suite"},
        {"title": "Zoom audio not working", "desc": "I can see people in Zoom meetings, but I cannot hear them, and they cannot hear me. My headset is selected in settings.", "subcategory": "Conferencing"},
        {"title": "Adobe Acrobat Reader update failed", "desc": "I keep getting a notification to update Acrobat Reader, but it fails with error code 1603 every time I try.", "subcategory": "Desktop Apps"},
        {"title": "Slack notifications not showing", "desc": "I am not getting any desktop notifications for Slack messages. I have checked my notification settings and they are on.", "subcategory": "Communication"}
    ],
    "Hardware Failures": [
        {"title": "Laptop battery draining too fast", "desc": "My laptop battery used to last 6 hours, now it barely lasts 1 hour. It is also getting very hot.", "subcategory": "Laptop"},
        {"title": "External monitor flickering", "desc": "My second monitor keeps flickering on and off. I have checked the HDMI cable connection.", "subcategory": "Peripherals"},
        {"title": "Keyboard keys stuck", "desc": "The 'E' and 'R' keys on my laptop keyboard are sticking and sometimes type double letters.", "subcategory": "Laptop"},
        {"title": "Mouse scroll wheel not working", "desc": "The scroll wheel on my wireless mouse has stopped scrolling pages. The click function still works.", "subcategory": "Peripherals"}
    ],
    "Security Incidents": [
        {"title": "Suspicious email attachment", "desc": "I received an email from 'CEO@company-update.com' asking me to download an invoice. It looks suspicious.", "subcategory": "Phishing"},
        {"title": "Antivirus warning popup", "desc": "My antivirus keeps popping up a warning about 'Trojan.Generic' found in my Downloads folder.", "subcategory": "Malware"},
        {"title": "Lost company phone", "desc": "I think I left my company iPhone in a taxi last night. It has access to my email.", "subcategory": "Lost Device"},
        {"title": "Account locked out", "desc": "My account is locked out. I think I typed my password wrong too many times on my mobile.", "subcategory": "Access Control"}
    ],
    "Account Access": [
        {"title": "Password reset link expired", "desc": "I requested a password reset link, but by the time I clicked it, it said it had expired. Please send a new one.", "subcategory": "Password Reset"},
        {"title": "Need access to Marketing Sharepoint", "desc": "I have transferred to the Marketing team and need access to their Sharepoint site.", "subcategory": "Permissions"},
        {"title": "MFA code not arriving", "desc": "I am trying to log in, but the SMS code for 2FA is not arriving on my phone.", "subcategory": "MFA"},
        {"title": "Salesforce login error", "desc": "I cannot log into Salesforce. It says 'Insufficient Privileges' when I try to access the Leads tab.", "subcategory": "SaaS Access"}
    ]
}

CATEGORIES = list(IT_SCENARIOS.keys())

PRIORITIES = ["Critical", "High", "Medium", "Low"]
STATUSES = ["Open", "In Progress", "Resolved", "Closed"]
DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance", "Marketing", "Operations"]

KB_DOCS = [
    {
        "title": "Troubleshooting Wi-Fi Connectivity in Conference Rooms",
        "content": "## Issue\nIntermittent Wi-Fi in conference rooms.\n\n## Resolution\n1. **Check Signal Strength**: Ensure you are not in a dead zone.\n2. **Forget Network**: Go to Settings > Wi-Fi, select the corporate network, and click 'Forget'. Re-connect and enter credentials.\n3. **Update Driver**: Ensure your network adapter driver is up to date.\n4. **Report**: If specific to one room (e.g., Room B), report to Network Engineering as it may be an AP issue.",
        "category": "Network Issues",
        "tags": ["wifi", "conference room", "network", "connectivity"]
    },
    {
        "title": "Fixing VPN Error 800",
        "content": "## Issue\nVPN Error 800: Unable to establish connection.\n\n## Causes\n- Firewall blocking VPN traffic.\n- Incorrect server address.\n\n## Resolution\n1. **Check Internet**: Ensure you have a stable internet connection.\n2. **Verify Server Address**: Ensure you are connecting to `vpn.company.com`.\n3. **Firewall**: Temporarily disable local firewall to test.\n4. **Reinstall Client**: Uninstall and reinstall the VPN client from the software center.",
        "category": "Network Issues",
        "tags": ["vpn", "error 800", "remote access"]
    },
    {
        "title": "Excel Crashing with Large Files",
        "content": "## Issue\nExcel crashes when opening large CSV or XLSX files.\n\n## Workaround\n1. **Disable Hardware Acceleration**: File > Options > Advanced > Display > Check 'Disable hardware graphics acceleration'.\n2. **Open in Safe Mode**: Hold `Ctrl` while opening Excel.\n3. **Use Power Query**: Instead of opening the CSV directly, use Data > Get Data > From Text/CSV to load it efficiently.",
        "category": "Software Problems",
        "tags": ["excel", "crash", "office", "csv"]
    },
    {
        "title": "Troubleshooting Zoom Audio Issues",
        "content": "## Issue\nNo audio in Zoom meetings.\n\n## Steps\n1. **Check Output**: In Zoom, click the arrow next to Mute > Audio Settings. Test Speaker.\n2. **Check System Sound**: Ensure system volume is not muted.\n3. **Privacy Settings**: Windows Settings > Privacy > Microphone > Allow apps to access microphone.\n4. **Rejoin**: Leave and rejoin the meeting, selecting 'Join with Computer Audio'.",
        "category": "Software Problems",
        "tags": ["zoom", "audio", "microphone", "conferencing"]
    },
    {
        "title": "Laptop Battery Health Check",
        "content": "## Diagnosis\nIf battery drains fast:\n1. **Run Battery Report**: Open CMD as Admin, type `powercfg /batteryreport`.\n2. **Check Usage**: Settings > System > Battery to see which apps are using power.\n3. **Hardware Check**: If battery health is < 60%, request a replacement via the Hardware Portal.",
        "category": "Hardware Failures",
        "tags": ["battery", "power", "laptop", "hardware"]
    },
    {
        "title": "Troubleshooting External Monitor Flickering",
        "content": "## Steps\n1. **Check Cables**: Ensure HDMI/DisplayPort cables are tight. Try a different cable.\n2. **Refresh Rate**: Settings > System > Display > Advanced Display Settings. Ensure refresh rate matches monitor specs (e.g., 60Hz).\n3. **Update Drivers**: Update Graphics Drivers via Device Manager.",
        "category": "Hardware Failures",
        "tags": ["monitor", "display", "flickering", "hardware"]
    },
    {
        "title": "Identifying Phishing Emails",
        "content": "## Signs of Phishing\n- **Urgency**: 'Act now or lose access'.\n- **Mismatched URL**: Hover over links to see the actual URL.\n- **Generic Greeting**: 'Dear Customer'.\n\n## Action\n1. Do NOT click links or download attachments.\n2. Forward the email to `phishing@company.com`.\n3. Delete the email.",
        "category": "Security Incidents",
        "tags": ["phishing", "email", "security", "scam"]
    },
    {
        "title": "Handling Lost Company Devices",
        "content": "## Immediate Actions\n1. **Report**: Contact IT Security immediately at x9999.\n2. **Remote Wipe**: IT will initiate a remote wipe command.\n3. **Change Passwords**: Reset your AD password immediately.\n4. **Police Report**: If stolen, file a police report and provide a copy to HR.",
        "category": "Security Incidents",
        "tags": ["lost device", "mobile", "security", "theft"]
    },
    {
        "title": "Password Reset Troubleshooting",
        "content": "## Issue\nPassword reset link expired or not working.\n\n## Resolution\n1. **Check Spam**: Ensure the email didn't go to Junk.\n2. **Clear Cache**: Try opening the link in Incognito mode.\n3. **Request New Link**: Links expire in 15 minutes. Request a new one at `password.company.com`.",
        "category": "Account Access",
        "tags": ["password", "reset", "account", "login"]
    },
    {
        "title": "Requesting SharePoint Access",
        "content": "## Process\n1. **Identify Owner**: Find the owner of the SharePoint site (usually the Team Lead).\n2. **Request Access**: Navigate to the site, you will see 'You need permission'. Click 'Request Access'.\n3. **Approval**: The owner will receive an email to approve your request.",
        "category": "Account Access",
        "tags": ["sharepoint", "access", "permissions"]
    }
]

def generate_ticket_data(index):
    category = random.choice(CATEGORIES)
    scenario = random.choice(IT_SCENARIOS[category])
    
    priority = random.choice(PRIORITIES)
    status = random.choices(STATUSES, weights=[0.3, 0.3, 0.3, 0.1])[0]
    
    # Generate a random date within the last 60 days
    days_ago = random.randint(0, 60)
    created_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
    
    # Adjust resolution time based on status
    resolved_at = None
    actual_resolution_hours = None
    if status in ["Resolved", "Closed"]:
        resolution_hours = random.uniform(1, 72)
        resolved_at = created_at + timedelta(hours=resolution_hours)
        actual_resolution_hours = resolution_hours

    return {
        "ticket_id": f"TKT-{uuid.uuid4().hex[:8].upper()}",
        "title": scenario["title"],
        "description": scenario["desc"],
        "category": category,
        "subcategory": scenario["subcategory"],
        "classification_confidence": random.uniform(0.7, 0.99),
        "priority": priority,
        "priority_confidence": random.uniform(0.6, 0.95),
        "estimated_resolution_hours": random.randint(2, 48),
        "requester_name": f"User {random.randint(1, 50)}",
        "requester_email": f"user{random.randint(1, 50)}@example.com",
        "requester_department": random.choice(DEPARTMENTS),
        "status": status,
        "created_at": created_at,
        "resolved_at": resolved_at,
        "actual_resolution_hours": actual_resolution_hours,
        "processing_time_ms": random.randint(100, 2000)
    }

async def seed_database():
    logger.info("🌱 Starting database seeding...")
    
    settings = get_settings()
    db_path = Path(settings.data_dir) / "tickets.db"
    
    # 1. Clear SQLite Data
    logger.info(f"Cleaning SQLite database at {db_path}...")
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    tables = ["tickets", "ticket_solutions", "agent_performance"]
    for table in tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'") # Reset auto-increment
            logger.info(f"Cleared table: {table}")
        except sqlite3.OperationalError:
            logger.warning(f"Table {table} might not exist yet.")
            
    conn.commit()
    conn.close()
    
    # Re-initialize DB to ensure tables exist if they were missing
    ticket_db = TicketDatabase(str(db_path))
    
    # 2. Seed Knowledge Base via API (preferred) or File (fallback)
    logger.info("Seeding Knowledge Base...")
    
    # Prepare docs payload
    docs_payload = KB_DOCS + []
    
    # We already have high-quality docs in KB_DOCS, so we don't need to generate generic ones.
    logger.info(f"Prepared {len(docs_payload)} high-quality KB documents for ingestion.")

    import aiohttp
    api_url = "http://localhost:8000/api/v1/knowledge/ingest"
    
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "source": "seed_script",
                "source_type": "manual",
                "metadata": {"documents": docs_payload}
            }
            async with session.post(api_url, json=payload) as resp:
                if resp.status == 200:
                    logger.info(f"✅ Successfully triggered KB ingestion via API: {resp.status}")
                else:
                    logger.warning(f"API returned {resp.status}, falling back to file generation.")
                    raise Exception("API Error")
    except Exception as e:
        logger.warning(f"Could not seed KB via API ({e}). Writing to data/imports for auto-ingest.")
        
        # Fallback: Write to data/imports
        imports_dir = Path(settings.data_dir) / "imports"
        imports_dir.mkdir(parents=True, exist_ok=True)
        
        # Write as individual text files for easier inspection/ingest
        for i, doc in enumerate(docs_payload):
            safe_title = "".join([c if c.isalnum() else "_" for c in doc['title']])
            file_path = imports_dir / f"seed_{i}_{safe_title}.txt"
            with open(file_path, "w") as f:
                f.write(f"Title: {doc['title']}\n")
                f.write(f"Category: {doc['category']}\n")
                f.write(f"Tags: {','.join(doc.get('tags', []))}\n\n")
                f.write(doc['content'])
        
        logger.info(f"✅ Wrote {len(docs_payload)} files to {imports_dir} for auto-ingestion.")

    # Collect all KB docs for solution matching
    all_kb_docs = docs_payload
    
    # 3. Seed Tickets (using raw SQL to force dates)
    logger.info("Seeding Tickets...")
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    tickets_to_create = 50
    
    for i in range(tickets_to_create):
        t = generate_ticket_data(i)
        
        # Insert Ticket
        cursor.execute("""
            INSERT INTO tickets (
                ticket_id, title, description,
                category, subcategory, classification_confidence,
                priority, priority_confidence, estimated_resolution_hours,
                requester_name, requester_email, requester_department,
                status, created_at, resolved_at, actual_resolution_hours,
                processing_time_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t['ticket_id'], t['title'], t['description'],
            t['category'], t['subcategory'], t['classification_confidence'],
            t['priority'], t['priority_confidence'], t['estimated_resolution_hours'],
            t['requester_name'], t['requester_email'], t['requester_department'],
            t['status'], t['created_at'].isoformat(), 
            t['resolved_at'].isoformat() if t['resolved_at'] else None,
            t['actual_resolution_hours'], t['processing_time_ms']
        ))
        
        # Insert Solutions (60% chance)
        if random.random() > 0.4:
            # Find matching KB docs by category
            matching_docs = [doc for doc in all_kb_docs if doc['category'] == t['category']]
            
            # Fallback to random docs if no match (shouldn't happen often with our seed data)
            if not matching_docs:
                matching_docs = random.sample(all_kb_docs, min(3, len(all_kb_docs)))
            
            # Pick 1-3 solutions
            num_solutions = random.randint(1, min(3, len(matching_docs)))
            selected_solutions = random.sample(matching_docs, num_solutions)
            
            for sol_doc in selected_solutions:
                sol_id = f"SOL-{uuid.uuid4().hex[:8].upper()}"
                cursor.execute("""
                    INSERT INTO ticket_solutions (
                        ticket_id, solution_id, title, description,
                        category, similarity_score, source, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    t['ticket_id'], sol_id,
                    sol_doc['title'],
                    sol_doc['content'][:200] + "..." if len(sol_doc['content']) > 200 else sol_doc['content'],
                    sol_doc['category'], # Use the solution's category
                    random.uniform(0.7, 0.95),
                    "knowledge_base",
                    json.dumps({"confidence": random.uniform(0.8, 0.99), "original_doc_title": sol_doc['title']})
                ))

        # Add some random performance tracking
        if random.random() > 0.5:
            cursor.execute("""
                INSERT INTO agent_performance (
                    ticket_id, agent_name, predicted_value, confidence, is_correct, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                t['ticket_id'], 'classification', t['category'], t['classification_confidence'], 
                1 if random.random() > 0.1 else 0, # 90% accuracy
                t['created_at'].isoformat()
            ))
            
    conn.commit()
    conn.close()
    
    logger.info(f"✅ Created {tickets_to_create} tickets.")
    logger.info("🎉 Database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
