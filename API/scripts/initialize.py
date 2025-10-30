#!/usr/bin/env python3
'''
IT Ticket Analyzer - Initialization Script
Run this script to initialize the system with sample data
'''

import asyncio
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from core.config import get_settings
from services.knowledge_service import KnowledgeService
from services.data_service import DataService
from services.model_service import ModelService

async def initialize_system():
    '''Initialize the system with sample data'''
    
    print("🚀 Initializing IT Ticket Analyzer...")
    
    try:
        # Load settings
        settings = get_settings()
        print("✅ Loaded settings")
        
        # Initialize services
        print("🔧 Initializing services...")
        
        model_service = ModelService(settings)
        await model_service.initialize()
        print("✅ Model service initialized")
        
        knowledge_service = KnowledgeService(settings)
        await knowledge_service.initialize()
        print("✅ Knowledge service initialized")
        
        data_service = DataService(settings)
        await data_service.initialize()
        print("✅ Data service initialized")
        
        # Load initial datasets
        print("📊 Loading initial datasets...")
        await data_service.load_initial_datasets()
        
        # Get cached knowledge and add to knowledge base
        knowledge_items = await data_service.get_cached_knowledge()
        print(f"📚 Adding {len(knowledge_items)} items to knowledge base...")
        
        for item in knowledge_items:
            await knowledge_service.add_document(
                title=item["title"],
                content=item["content"],
                category=item.get("category"),
                tags=item.get("metadata", {}).get("tags", []),
                source=item.get("source", "initialization"),
                source_type=item.get("source_type", "manual"),
                metadata=item.get("metadata", {})
            )
        
        # Get statistics
        stats = await knowledge_service.get_statistics()
        print("✅ Knowledge base initialized with:")
        print(f"   📄 {stats['total_documents']} documents")
        print(f"   🏷️  {stats['total_categories']} categories")
        print(f"   🔧 Using Weaviate: {stats['using_weaviate']}")
        
        print("🎉 System initialization completed successfully!")
        print("🌐 You can now start the API server with: uvicorn main:app --reload")
        
    except Exception as e:
        print(f"❌ Initialization failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(initialize_system())
