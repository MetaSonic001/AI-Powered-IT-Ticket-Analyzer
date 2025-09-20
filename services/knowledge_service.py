"""
Knowledge Service - Weaviate Vector Database Integration (v4)
Handles RAG, knowledge base management, and semantic search
"""

import asyncio
import aiohttp
import json
import uuid
from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime
import numpy as np
from pathlib import Path
from datetime import datetime, timezone


# Weaviate v4 client
try:
    import weaviate
    import weaviate.classes as wvc
    from weaviate.classes.query import MetadataQuery
    from weaviate.classes.config import Property, DataType
    WEAVIATE_AVAILABLE = True
except ImportError:
    WEAVIATE_AVAILABLE = False

from core.config import Settings
from core.models import KnowledgeDocument, SearchResult
from utils.logger import setup_logger

logger = setup_logger(__name__)

class KnowledgeService:
    """Knowledge base service using Weaviate v4 vector database"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = None
        self.collection = None
        self.initialized = False
        
    async def initialize(self):
        """Initialize Weaviate v4 client and schema"""
        try:
            logger.info("🔍 Initializing Knowledge Service (v4)...")
            
            if not WEAVIATE_AVAILABLE:
                logger.warning("Weaviate not available, using fallback implementation")
                await self._init_fallback()
                return
            
            await self._connect_weaviate_v4()
            await self._ensure_schema_v4()
            
            self.initialized = True
            logger.info("✅ Knowledge Service (v4) initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Knowledge Service initialization failed: {str(e)}")
            await self._init_fallback()
    
    async def _connect_weaviate_v4(self):
        """Connect to Weaviate v4 instance"""
        try:
            # Parse the URL to get host and port
            url_parts = self.settings.weaviate_host.replace('http://', '').replace('https://', '')
            if ':' in url_parts:
                host, port = url_parts.split(':')
                port = int(port)
            else:
                host = url_parts
                port = 8080  # default port
            
            # Create connection parameters
            connection_params = {
                "host": host,
                "port": port,
                "grpc_port": 50051,  # default gRPC port
            }
            
            # Add authentication if provided
            if self.settings.weaviate_api_key:
                connection_params["auth_credentials"] = wvc.init.Auth.api_key(self.settings.weaviate_api_key)
            
            # For local development, use connect_to_local
            if 'localhost' in host or '127.0.0.1' in host:
                self.client = weaviate.connect_to_local(
                    host=host,
                    port=port,
                    grpc_port=50051,
                    headers={"X-OpenAI-Api-Key": self.settings.openai_api_key} if hasattr(self.settings, 'openai_api_key') else None
                )
            else:
                # For remote connections, use WeaviateClient
                self.client = weaviate.WeaviateClient(
                    connection_params=wvc.init.ConnectionParams.from_params(**connection_params)
                )
            
            # Connect to the client
            self.client.connect()
            
            if self.client.is_ready():
                logger.info("✅ Connected to Weaviate v4 successfully")
            else:
                raise Exception("Weaviate v4 is not ready")

        except Exception as e:
            logger.error(f"Weaviate v4 connection failed: {str(e)}")
            raise
    
    async def _ensure_schema_v4(self):
        """Ensure the knowledge base schema exists in v4"""
        try:
            class_name = self.settings.weaviate_class_name
            
            # Check if collection exists
            if self.client.collections.exists(class_name):
                self.collection = self.client.collections.get(class_name)
                logger.info(f"✅ Using existing collection: {class_name}")
                return
            
            # Define properties for the collection
            properties = [
                Property(name="title", data_type=DataType.TEXT, description="Title of the knowledge document"),
                Property(name="content", data_type=DataType.TEXT, description="Main content of the knowledge document"),
                Property(name="category", data_type=DataType.TEXT, description="Category classification"),
                Property(name="subcategory", data_type=DataType.TEXT, description="Subcategory classification"),
                Property(name="tags", data_type=DataType.TEXT_ARRAY, description="Tags associated with the document"),
                Property(name="source", data_type=DataType.TEXT, description="Source of the document"),
                Property(name="source_type", data_type=DataType.TEXT, description="Type of source (kaggle, github, etc.)"),
                Property(name="doc_type", data_type=DataType.TEXT, description="Document type (solution, ticket, documentation)"),
                Property(name="priority", data_type=DataType.TEXT, description="Priority level if applicable"),
                Property(name="resolution_steps", data_type=DataType.TEXT_ARRAY, description="Step-by-step resolution instructions"),
                Property(name="metadata", data_type=DataType.TEXT, description="Additional metadata as JSON string"),
                Property(name="created_at", data_type=DataType.DATE, description="Document creation timestamp"),
                Property(name="updated_at", data_type=DataType.DATE, description="Document update timestamp"),
            ]
            
            # Create collection with no vectorizer (we'll provide our own vectors)
            self.collection = self.client.collections.create(
                name=class_name,
                description="IT Knowledge Base for ticket analysis and solution recommendations",
                properties=properties,
                # No vectorizer - we provide our own vectors
                vectorizer_config=None
            )
            
            logger.info(f"✅ Created new collection: {class_name}")
            
        except Exception as e:
            logger.error(f"Schema creation failed: {str(e)}")
            raise
    
    async def _init_fallback(self):
        """Initialize fallback in-memory knowledge base"""
        self.fallback_storage = []
        self.initialized = True
        logger.info("✅ Fallback knowledge service initialized")
    
    async def add_document(
        self, 
        title: str, 
        content: str, 
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        source: str = "manual",
        source_type: str = "manual",
        metadata: Optional[Dict] = None,
        embeddings: Optional[np.ndarray] = None
    ) -> str:
        """Add a document to the knowledge base"""
        
        doc_id = str(uuid.uuid4())
        
        if not self.client:
            # Fallback storage
            document = {
                "doc_id": doc_id,
                "title": title,
                "content": content,
                "category": category,
                "tags": tags or [],
                "source": source,
                "source_type": source_type,
                "metadata": metadata or {},
                "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "embeddings": embeddings.tolist() if embeddings is not None else None
            }
            self.fallback_storage.append(document)
            logger.info(f"Added document to fallback storage: {title[:50]}...")
            return doc_id
        
        try:
            # Prepare document properties for Weaviate v4
            properties = {
                "title": title,
                "content": content,
                "category": category or "",
                "subcategory": "",
                "tags": tags or [],
                "source": source,
                "source_type": source_type,
                "doc_type": metadata.get("type", "knowledge") if metadata else "knowledge",
                "priority": metadata.get("priority", "") if metadata else "",
                "resolution_steps": metadata.get("steps", []) if metadata else [],
                "metadata": json.dumps(metadata or {}),
                "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            }
            
            # Insert document with optional vector
            if embeddings is not None:
                doc_id = self.collection.data.insert(
                    properties=properties,
                    vector=embeddings.tolist(),
                    uuid=doc_id
                )
            else:
                doc_id = self.collection.data.insert(
                    properties=properties,
                    uuid=doc_id
                )
            
            logger.info(f"Added document to Weaviate v4: {title[:50]}...")
            return str(doc_id)
            
        except Exception as e:
            logger.error(f"Failed to add document: {str(e)}")
            # Fallback to in-memory storage
            if not hasattr(self, 'fallback_storage'):
                self.fallback_storage = []
            
            document = {
                "doc_id": doc_id,
                "title": title,
                "content": content,
                "category": category,
                "tags": tags or [],
                "source": source,
                "source_type": source_type,
                "metadata": metadata or {},
                "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            }
            self.fallback_storage.append(document)
            return doc_id
    
    async def search(
        self, 
        query: str, 
        category: Optional[str] = None,
        limit: int = 10,
        min_similarity: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Search the knowledge base using v4 query API"""
        
        if not self.client:
            return await self._fallback_search(query, category, limit, min_similarity)
        
        try:
            # Build search query using v4 API
            search_query = self.collection.query.hybrid(
                query=query,
                limit=limit,
                return_metadata=MetadataQuery(score=True)
            )
            
            # Add category filter if specified
            if category:
                search_query = search_query.where(
                    wvc.query.Filter.by_property("category").equal(category)
                )
            
            # Execute search
            response = search_query
            
            results = []
            for item in response.objects:
                score = item.metadata.score if item.metadata else 0.5
                
                if score >= min_similarity:
                    results.append({
                        "doc_id": str(item.uuid),
                        "title": item.properties.get("title", ""),
                        "content_snippet": item.properties.get("content", "")[:500] + "...",
                        "category": item.properties.get("category", ""),
                        "tags": item.properties.get("tags", []),
                        "source": item.properties.get("source", ""),
                        "score": score,
                        "metadata": json.loads(item.properties.get("metadata", "{}"))
                    })
            
            logger.info(f"Found {len(results)} search results for: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Weaviate v4 search failed: {str(e)}")
            return await self._fallback_search(query, category, limit, min_similarity)
    
    async def _fallback_search(
        self, 
        query: str, 
        category: Optional[str] = None,
        limit: int = 10,
        min_similarity: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Fallback search using simple text matching"""
        
        if not hasattr(self, 'fallback_storage'):
            self.fallback_storage = []
        
        query_lower = query.lower()
        results = []
        
        for doc in self.fallback_storage:
            # Simple text similarity scoring
            title_lower = doc["title"].lower()
            content_lower = doc["content"].lower()
            
            # Calculate basic similarity score
            title_matches = sum(1 for word in query_lower.split() if word in title_lower)
            content_matches = sum(1 for word in query_lower.split() if word in content_lower)
            
            score = (title_matches * 2 + content_matches) / (len(query_lower.split()) * 3)
            
            # Category filter
            if category and doc.get("category") != category:
                continue
            
            if score >= min_similarity:
                results.append({
                    "doc_id": doc["doc_id"],
                    "title": doc["title"],
                    "content_snippet": doc["content"][:500] + "...",
                    "category": doc.get("category", ""),
                    "tags": doc.get("tags", []),
                    "source": doc.get("source", ""),
                    "score": min(score, 1.0),
                    "metadata": doc.get("metadata", {})
                })
        
        # Sort by score and limit
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]
    
    async def get_recommendations(
        self,
        query: str,
        category: Optional[str] = None,
        max_results: int = 5,
        min_similarity: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Get solution recommendations for a query"""
        
        # Search for solutions
        search_results = await self.search(
            query=query,
            category=category,
            limit=max_results * 2,  # Get more to filter
            min_similarity=min_similarity
        )
        
        # Convert to recommendation format
        recommendations = []
        for result in search_results[:max_results]:
            # Extract resolution steps if available
            steps = []
            metadata = result.get("metadata", {})
            if "steps" in metadata:
                steps = metadata["steps"]
            elif "resolution_steps" in metadata:
                steps = metadata["resolution_steps"]
            
            recommendation = {
                "solution_id": result["doc_id"],
                "title": result["title"],
                "description": result["content_snippet"],
                "category": result.get("category"),
                "steps": steps,
                "similarity_score": result["score"],
                "source": result.get("source", "knowledge_base"),
                "metadata": metadata
            }
            recommendations.append(recommendation)
        
        logger.info(f"Generated {len(recommendations)} recommendations for: {query[:50]}...")
        return recommendations
    
    async def get_similar_documents(
        self,
        doc_id: str,
        limit: int = 5,
        min_similarity: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Find documents similar to the given document using v4 API"""
        
        if not self.client:
            return await self._fallback_similar_docs(doc_id, limit, min_similarity)
        
        try:
            # Get similar documents using v4 near_object query
            search_query = self.collection.query.near_object(
                near_object=doc_id,
                limit=limit + 1,  # +1 because it will include the source document
                return_metadata=MetadataQuery(score=True)
            )
            
            response = search_query
            
            results = []
            for item in response.objects:
                if str(item.uuid) == doc_id:
                    continue  # Skip the source document
                
                score = item.metadata.score if item.metadata else 0.5
                if score >= min_similarity:
                    results.append({
                        "doc_id": str(item.uuid),
                        "title": item.properties.get("title", ""),
                        "content_snippet": item.properties.get("content", "")[:300] + "...",
                        "category": item.properties.get("category", ""),
                        "score": score,
                        "metadata": json.loads(item.properties.get("metadata", "{}"))
                    })
            
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Similar document search failed: {str(e)}")
            return await self._fallback_similar_docs(doc_id, limit, min_similarity)
    
    async def _fallback_similar_docs(
        self,
        doc_id: str,
        limit: int = 5,
        min_similarity: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Fallback similar document search"""
        
        if not hasattr(self, 'fallback_storage'):
            return []
        
        # Find source document
        source_doc = None
        for doc in self.fallback_storage:
            if doc["doc_id"] == doc_id:
                source_doc = doc
                break
        
        if not source_doc:
            return []
        
        # Simple similarity based on shared tags and category
        results = []
        source_tags = set(source_doc.get("tags", []))
        source_category = source_doc.get("category", "")
        
        for doc in self.fallback_storage:
            if doc["doc_id"] == doc_id:
                continue
            
            doc_tags = set(doc.get("tags", []))
            doc_category = doc.get("category", "")
            
            # Calculate similarity
            tag_similarity = len(source_tags & doc_tags) / max(len(source_tags | doc_tags), 1)
            category_similarity = 1.0 if source_category == doc_category else 0.0
            
            score = (tag_similarity + category_similarity) / 2
            
            if score >= min_similarity:
                results.append({
                    "doc_id": doc["doc_id"],
                    "title": doc["title"],
                    "content_snippet": doc["content"][:300] + "...",
                    "category": doc.get("category", ""),
                    "score": score,
                    "metadata": doc.get("metadata", {})
                })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]
    
    async def update_document(
        self,
        doc_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update an existing document using v4 API"""
        
        if not self.client:
            return await self._fallback_update_doc(doc_id, updates)
        
        try:
            # Prepare updates for Weaviate v4
            properties = {}
            if "title" in updates:
                properties["title"] = updates["title"]
            if "content" in updates:
                properties["content"] = updates["content"]
            if "category" in updates:
                properties["category"] = updates["category"]
            if "tags" in updates:
                properties["tags"] = updates["tags"]
            if "metadata" in updates:
                properties["metadata"] = json.dumps(updates["metadata"])
            
            properties["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            
            # Update in Weaviate v4
            self.collection.data.update(
                uuid=doc_id,
                properties=properties
            )
            
            logger.info(f"Updated document: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update document {doc_id}: {str(e)}")
            return await self._fallback_update_doc(doc_id, updates)
    
    async def _fallback_update_doc(self, doc_id: str, updates: Dict[str, Any]) -> bool:
        """Fallback document update"""
        
        if not hasattr(self, 'fallback_storage'):
            return False
        
        for doc in self.fallback_storage:
            if doc["doc_id"] == doc_id:
                doc.update(updates)
                doc["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                return True
        
        return False
    
    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document from the knowledge base using v4 API"""
        
        if not self.client:
            return await self._fallback_delete_doc(doc_id)
        
        try:
            self.collection.data.delete_by_id(doc_id)
            logger.info(f"Deleted document: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {doc_id}: {str(e)}")
            return await self._fallback_delete_doc(doc_id)
    
    async def _fallback_delete_doc(self, doc_id: str) -> bool:
        """Fallback document deletion"""
        
        if not hasattr(self, 'fallback_storage'):
            return False
        
        self.fallback_storage = [
            doc for doc in self.fallback_storage if doc["doc_id"] != doc_id
        ]
        return True
    
    async def get_document_count(self) -> int:
        """Get total number of documents in the knowledge base"""
        
        if not self.client:
            return len(getattr(self, 'fallback_storage', []))
        
        try:
            # Use v4 aggregate API
            response = self.collection.aggregate.over_all(total_count=True)
            return response.total_count or 0
            
        except Exception as e:
            logger.error(f"Failed to get document count: {str(e)}")
            return len(getattr(self, 'fallback_storage', []))
    
    async def get_categories(self) -> List[str]:
        """Get all unique categories in the knowledge base"""
        
        if not self.client:
            if not hasattr(self, 'fallback_storage'):
                return []
            
            categories = set()
            for doc in self.fallback_storage:
                if doc.get("category"):
                    categories.add(doc["category"])
            return sorted(list(categories))
        
        try:
            # Use v4 fetch API to get categories
            response = self.collection.query.fetch_objects(
                limit=1000,
                return_properties=["category"]
            )
            
            categories = set()
            for obj in response.objects:
                category = obj.properties.get("category")
                if category:
                    categories.add(category)
            
            return sorted(list(categories))
            
        except Exception as e:
            logger.error(f"Failed to get categories: {str(e)}")
            return []
    
    async def ingest_knowledge(
        self,
        source: str,
        source_type: str,
        metadata: Optional[Dict] = None,
        task_id: Optional[str] = None
    ):
        """Ingest knowledge from various sources"""
        
        logger.info(f"Starting knowledge ingestion from {source_type}: {source}")
        
        try:
            if source_type == "manual":
                # Manual knowledge entry
                await self._ingest_manual_knowledge(source, metadata)
            elif source_type == "web_scrape":
                # Web scraping
                await self._ingest_web_content(source, metadata)
            elif source_type == "kaggle":
                # Kaggle dataset
                await self._ingest_kaggle_dataset(source, metadata)
            else:
                logger.warning(f"Unsupported source type: {source_type}")
                
        except Exception as e:
            logger.error(f"Knowledge ingestion failed: {str(e)}")
            raise
    
    async def _ingest_manual_knowledge(self, content: str, metadata: Dict):
        """Ingest manually provided knowledge"""
        
        title = metadata.get("title", "Manual Entry")
        category = metadata.get("category", "General Support")
        tags = metadata.get("tags", [])
        
        await self.add_document(
            title=title,
            content=content,
            category=category,
            tags=tags,
            source="manual",
            source_type="manual",
            metadata=metadata
        )
    
    async def _ingest_web_content(self, url: str, metadata: Dict):
        """Ingest content from web scraping"""
        
        # This would use crawl4ai or similar to scrape content
        # For now, we'll create a placeholder
        title = metadata.get("title", f"Web Content from {url}")
        content = metadata.get("content", "Web scraped content would go here")
        
        await self.add_document(
            title=title,
            content=content,
            category=metadata.get("category", "Documentation"),
            tags=metadata.get("tags", ["web", "documentation"]),
            source=url,
            source_type="web_scrape",
            metadata=metadata
        )
    
    async def _ingest_kaggle_dataset(self, dataset_id: str, metadata: Dict):
        """Ingest Kaggle dataset"""
        
        # This would download and process Kaggle datasets
        # For now, we'll create a placeholder
        title = f"Kaggle Dataset: {dataset_id}"
        content = "Kaggle dataset content would be processed here"
        
        await self.add_document(
            title=title,
            content=content,
            category="Dataset",
            tags=["kaggle", "dataset"],
            source=dataset_id,
            source_type="kaggle",
            metadata=metadata
        )
    
    async def is_empty(self) -> bool:
        """Check if the knowledge base is empty"""
        count = await self.get_document_count()
        return count == 0
    
    async def health_check(self) -> bool:
        """Check if the knowledge service is healthy"""
        try:
            if self.client:
                return self.client.is_ready()
            else:
                # Fallback is always "healthy"
                return True
                
        except Exception as e:
            logger.error(f"Knowledge service health check failed: {str(e)}")
            return False
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        
        total_docs = await self.get_document_count()
        categories = await self.get_categories()
        
        return {
            "total_documents": total_docs,
            "total_categories": len(categories),
            "categories": categories,
            "using_weaviate": self.client is not None,
            "initialized": self.initialized,
            "version": "v4"
        }
    
    async def close(self):
        """Close the knowledge service"""
        if self.client:
            try:
                self.client.close()
                logger.info("Weaviate v4 client closed")
            except:
                pass