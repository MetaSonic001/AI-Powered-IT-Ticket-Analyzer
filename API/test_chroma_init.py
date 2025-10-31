"""
Diagnostic script for testing ChromaDB initialization and persistence
Run this before launching FastAPI to ensure your vector database works properly.
"""

import asyncio
from pathlib import Path
from core.config import get_settings
from services.knowledge_service import KnowledgeService


async def test_chroma_initialization():
    print("🔍 Starting ChromaDB diagnostic test...\n")

    # Load app settings
    settings = get_settings()

    print(f"🧩 Chroma persistence path:\n   {settings.chroma_persist_directory}\n")

    # Initialize the service
    service = KnowledgeService(settings)
    await service.initialize()

    # Health check
    health = await service.health_check()
    print("⚙️  Health check result:")
    for k, v in health.items():
        print(f"   {k}: {v}")
    print()

    # Add a few test documents
    print("🧠 Adding sample documents to ChromaDB...")
    await service.add_document(
        title="WiFi Connection Troubleshooting",
        content="Check your WiFi settings, restart router, and verify IP address.",
        category="Network Issues",
        tags=["wifi", "network", "troubleshooting"],
        source="diagnostic_test",
        metadata={"steps": ["Restart router", "Check IP", "Re-enter password"]}
    )

    await service.add_document(
        title="Outlook Crashes When Opening Emails",
        content="Repair the Outlook installation and disable conflicting add-ins.",
        category="Email Issues",
        tags=["email", "outlook", "crash"],
        source="diagnostic_test"
    )

    count = await service.get_document_count()
    print(f"✅ Documents successfully added: {count}\n")

    # Test search query
    print("🔎 Searching for 'wifi'...")
    results = await service.search(query="wifi", category="Network Issues", limit=3)
    if results:
        for r in results:
            print(f"   🔸 {r['title']}  |  score={r['score']:.3f}")
            print(f"      Snippet: {r['content_snippet'][:120]}...\n")
    else:
        print("❌ No results found — Chroma search failed or collection empty.\n")

    # Test persistence
    print("💾 Restarting service to test persistence...\n")
    await service.close()
    service2 = KnowledgeService(settings)
    await service2.initialize()
    health2 = await service2.health_check()
    count2 = await service2.get_document_count()

    print(f"🔁 After restart, Chroma health: {health2['backend']}, documents = {count2}")
    if count2 >= count:
        print("✅ Persistence verified — documents are retained across restarts.")
    else:
        print("⚠️ Persistence test failed — collection not persisted.")

    print("\n✅ Diagnostic test completed.\n")


if __name__ == "__main__":
    try:
        asyncio.run(test_chroma_initialization())
    except KeyboardInterrupt:
        print("\nCancelled by user.")
