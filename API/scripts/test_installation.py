#!/usr/bin/env python3
'''
Test script to verify IT Ticket Analyzer installation
'''

import asyncio
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

async def verify_installation():
    '''Verify the installation (manual script, not a pytest test).'''
    
    print("🧪 Testing IT Ticket Analyzer installation...")
    
    try:
        # Test imports
        print("📦 Testing imports...")
        
        from core.config import get_settings
        from services.model_service import ModelService
        from services.knowledge_service import KnowledgeService
        from services.data_service import DataService
        
        print("✅ All imports successful")
        
        # Test configuration
        print("⚙️  Testing configuration...")
        settings = get_settings()
        print(f"✅ Configuration loaded (Primary LLM: {settings.primary_llm_provider})")
        
        # Test model service
        print("🤖 Testing model service...")
        model_service = ModelService(settings)
        await model_service.initialize()
        
        # Test classification
        test_text = "My computer is running very slowly and applications take a long time to load"
        categories = ["Network Issues", "Software Problems", "Hardware Failures", "System Performance"]
        
        result = await model_service.classify_text(test_text, categories)
        print(f"✅ Text classification working: {result['category']} (confidence: {result['confidence']:.2f})")
        
        # Test knowledge service
        print("📚 Testing knowledge service...")
        knowledge_service = KnowledgeService(settings)
        await knowledge_service.initialize()
        
        # Test adding a document
        doc_id = await knowledge_service.add_document(
            title="Test Document",
            content="This is a test document for verifying the knowledge service",
            category="General Support",
            source="test"
        )
        print(f"✅ Knowledge service working: Added document {doc_id}")
        
        # Test data service
        print("📊 Testing data service...")
        data_service = DataService(settings)
        await data_service.initialize()
        
        stats = await data_service.get_processing_stats()
        print(f"✅ Data service working: {stats['available_features']}")
        
        # Test complete pipeline with a sample ticket
        print("🎫 Testing complete ticket analysis pipeline...")
        
        sample_ticket = {
            "title": "Email not working on mobile device",
            "description": "I cannot receive emails on my iPhone. The mail app shows an error when trying to sync with the company Exchange server.",
            "requester_info": {
                "name": "Test User",
                "department": "Sales"
            }
        }
        
        # This would normally use CrewManager, but for testing we'll use individual services
        classification = await model_service.classify_text(
            f"{sample_ticket['title']} {sample_ticket['description']}", 
            settings.ticket_categories
        )
        
        recommendations = await knowledge_service.get_recommendations(
            query=f"{sample_ticket['title']} {sample_ticket['description']}",
            max_results=3
        )
        
        print("✅ Complete pipeline test successful:")
        print(f"   🏷️  Category: {classification['category']}")
        print(f"   💡 Recommendations: {len(recommendations)}")
        
        print("🎉 All tests passed! Installation is working correctly.")
        
        # Cleanup test document
        await knowledge_service.delete_document(doc_id)
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(verify_installation())
    sys.exit(0 if success else 1)
