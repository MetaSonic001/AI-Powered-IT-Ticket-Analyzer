"""
Knowledge Service - Vector Database Integration with ChromaDB
Handles RAG, knowledge base management, and semantic search

Vector DB Priority:
- Docker mode: Weaviate (full-featured vector DB)
- Local mode: ChromaDB (persistent local vector storage)
- Fallback: In-memory storage
"""

import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import numpy as np
from pathlib import Path

# Weaviate v4 client
try:
    import weaviate
    import weaviate.classes as wvc
    from weaviate.classes.query import MetadataQuery
    from weaviate.classes.config import Property, DataType
    WEAVIATE_AVAILABLE = True
except ImportError:
    WEAVIATE_AVAILABLE = False

# ChromaDB client for local vector storage
try:
    import chromadb
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False

from core.config import Settings
from utils.logger import setup_logger

logger = setup_logger(__name__)

class KnowledgeService:
    """Knowledge base service using Weaviate (Docker) or ChromaDB (local) for vector storage"""

    def __init__(self, settings: Settings):
        self.settings = settings
        # Weaviate client (Docker mode)
        self.client = None
        self.collection = None
        # ChromaDB client (Local mode)
        self.chroma_client = None
        self.chroma_collection = None
        self.initialized = False
        # Use ChromaDB by default when not running under Docker
        self._use_chroma = not bool(getattr(self.settings, 'use_docker', False))
        self._chroma_path = Path(getattr(self.settings, 'chroma_persist_directory', './data/chroma_db'))
        
    async def initialize(self):
        """Initialize vector database client"""
        try:
            logger.info("🔍 Initializing Knowledge Service...")
            # Prefer Weaviate only when running under Docker mode
            if getattr(self.settings, 'use_docker', False) and WEAVIATE_AVAILABLE:
                await self._connect_weaviate_v4()
                await self._ensure_schema_v4()
                self.initialized = True
                logger.info("✅ Knowledge Service (Weaviate) initialized successfully")
                return

            # If not using docker, initialize ChromaDB persistent store
            if self._use_chroma and CHROMA_AVAILABLE:
                await self._init_chroma()
                return

            # Fallback to in-memory storage
            logger.warning("Vector DB not available, using fallback in-memory implementation")
            await self._init_fallback()
        except Exception as e:
            logger.error(f"❌ Knowledge Service initialization failed: {str(e)}")
            await self._init_fallback()

    async def is_empty(self) -> bool:
        """Return True if the knowledge base has zero documents."""
        try:
            return (await self.get_document_count()) == 0
        except Exception:
            return False

    async def close(self):
        """Close connections if applicable (best-effort)."""
        try:
            if self.client:
                # Weaviate client
                try:
                    self.client.close()
                except Exception:
                    pass
                self.client = None
            if self.chroma_client:
                # chromadb PersistentClient has no explicit close; drop reference
                self.chroma_client = None
        except Exception:
            pass
    
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
                port = 8080
            
            # For local development, use connect_to_local
            if 'localhost' in host or '127.0.0.1' in host:
                self.client = weaviate.connect_to_local(
                    host=host,
                    port=port,
                    grpc_port=50051
                )
            else:
                connection_params = {
                    "host": host,
                    "port": port,
                    "grpc_port": 50051,
                }
                if self.settings.weaviate_api_key:
                    connection_params["auth_credentials"] = wvc.init.Auth.api_key(self.settings.weaviate_api_key)
                self.client = weaviate.WeaviateClient(
                    connection_params=wvc.init.ConnectionParams.from_params(**connection_params)
                )
            
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
                Property(name="title", data_type=DataType.TEXT),
                Property(name="content", data_type=DataType.TEXT),
                Property(name="category", data_type=DataType.TEXT),
                Property(name="subcategory", data_type=DataType.TEXT),
                Property(name="tags", data_type=DataType.TEXT_ARRAY),
                Property(name="source", data_type=DataType.TEXT),
                Property(name="source_type", data_type=DataType.TEXT),
                Property(name="doc_type", data_type=DataType.TEXT),
                Property(name="priority", data_type=DataType.TEXT),
                Property(name="resolution_steps", data_type=DataType.TEXT_ARRAY),
                Property(name="metadata", data_type=DataType.TEXT),
                Property(name="created_at", data_type=DataType.DATE),
                Property(name="updated_at", data_type=DataType.DATE),
            ]
            
            # Create collection
            self.collection = self.client.collections.create(
                name=class_name,
                description="IT Knowledge Base for ticket analysis",
                properties=properties,
                vectorizer_config=None  # We provide our own vectors
            )
            
            logger.info(f"✅ Created new collection: {class_name}")
            
        except Exception as e:
            logger.error(f"Schema creation failed: {str(e)}")
            raise
    
    async def _init_chroma(self):
        """Initialize local ChromaDB persistent vector storage"""
        try:
            # Create persistent ChromaDB client
            self._chroma_path.mkdir(parents=True, exist_ok=True)
            
            self.chroma_client = chromadb.PersistentClient(
                path=str(self._chroma_path)
            )
            
            # Get or create collection
            collection_name = "it_knowledge_base"
            try:
                self.chroma_collection = self.chroma_client.get_collection(name=collection_name)
                logger.info(f"✅ Using existing ChromaDB collection: {collection_name}")
            except Exception:
                self.chroma_collection = self.chroma_client.create_collection(
                    name=collection_name,
                    metadata={"hnsw:space": "cosine"}  # Use cosine similarity
                )
                logger.info(f"✅ Created new ChromaDB collection: {collection_name}")
            
            self.initialized = True
            logger.info(f"✅ ChromaDB initialized at {self._chroma_path}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {str(e)}")
            await self._init_fallback()
    
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
        embeddings: Optional[np.ndarray] = None,
        doc_id: Optional[str] = None,
    ) -> str:
        """Add a document to the knowledge base"""
        
        doc_id = doc_id or str(uuid.uuid4())
        
        # ChromaDB storage (local mode)
        if self.chroma_collection is not None:
            try:
                # Prepare metadata for ChromaDB
                chroma_metadata = {
                    "title": title,
                    "category": category or "",
                    "source": source,
                    "source_type": source_type,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                if tags:
                    chroma_metadata["tags"] = ",".join(tags)
                if metadata:
                    chroma_metadata["custom_metadata"] = json.dumps(metadata)
                
                # Add to ChromaDB
                self.chroma_collection.add(
                    ids=[doc_id],
                    documents=[content],
                    metadatas=[chroma_metadata],
                    embeddings=[embeddings.tolist()] if embeddings is not None else None
                )
                logger.info(f"Added document to ChromaDB: {title[:50]}...")
                return doc_id
            except Exception as e:
                logger.error(f"Failed to add document to ChromaDB: {str(e)}")

        # Weaviate storage (Docker mode)
        if self.client and self.collection:
            try:
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
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
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
                
                logger.info(f"Added document to Weaviate: {title[:50]}...")
                return str(doc_id)
                
            except Exception as e:
                logger.error(f"Failed to add document to Weaviate: {str(e)}")

        # Fallback storage
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
            "created_at": datetime.now(timezone.utc).isoformat(),
            "embeddings": embeddings.tolist() if embeddings is not None else None
        }
        self.fallback_storage.append(document)
        logger.info(f"Added document to fallback storage: {title[:50]}...")
        return doc_id
    
    async def search(
        self, 
        query: str, 
        category: Optional[str] = None,
        limit: int = 10,
        min_similarity: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Search the knowledge base"""
        
        # ChromaDB search (local mode)
        if self.chroma_collection is not None:
            return await self._chroma_search(query, category, limit, min_similarity)

        # Weaviate search (Docker mode)
        if self.client and self.collection:
            return await self._weaviate_search(query, category, limit, min_similarity)
        
        # Fallback search
        return await self._fallback_search(query, category, limit, min_similarity)

    async def _chroma_search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
        min_similarity: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Search using ChromaDB"""
        try:
            # Build where filter if category specified
            where = None
            if category:
                where = {"category": category}
            
            # Query ChromaDB
            results = self.chroma_collection.query(
                query_texts=[query],
                n_results=limit,
                where=where
            )
            
            # Format results
            formatted_results = []
            if results and results.get('ids') and len(results['ids']) > 0:
                ids = results.get('ids', [[]])[0]
                metadatas = results.get('metadatas', [[]])[0]
                documents = results.get('documents', [[]])[0]
                distances = results.get('distances', [[]])[0]
                for i, doc_id in enumerate(ids):
                    distance = distances[i] if i < len(distances) else 0.5
                    # Convert distance to similarity score (cosine similarity: 1 - distance)
                    score = 1.0 - distance
                    
                    if score >= min_similarity:
                        metadata = metadatas[i] if i < len(metadatas) else {}
                        document = documents[i] if i < len(documents) else ""
                        
                        formatted_results.append({
                            "doc_id": doc_id,
                            "title": metadata.get("title", ""),
                            "content_snippet": document[:500] + "..." if len(document) > 500 else document,
                            "category": metadata.get("category", ""),
                            "tags": metadata.get("tags", "").split(",") if metadata.get("tags") else [],
                            "source": metadata.get("source", ""),
                            "score": score,
                            "metadata": json.loads(metadata.get("custom_metadata", "{}"))
                        })
            
            logger.info(f"ChromaDB found {len(formatted_results)} results for: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"ChromaDB search failed: {str(e)}")
            return await self._fallback_search(query, category, limit, min_similarity)

    async def _weaviate_search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
        min_similarity: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Search using Weaviate"""
        try:
            search_query = self.collection.query.hybrid(
                query=query,
                limit=limit,
                return_metadata=MetadataQuery(score=True)
            )
            
            if category:
                search_query = search_query.where(
                    wvc.query.Filter.by_property("category").equal(category)
                )
            
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
            
            logger.info(f"Weaviate found {len(results)} results for: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Weaviate search failed: {str(e)}")
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
            title_lower = doc["title"].lower()
            content_lower = doc["content"].lower()
            
            # Calculate basic similarity score
            title_matches = sum(1 for word in query_lower.split() if word in title_lower)
            content_matches = sum(1 for word in query_lower.split() if word in content_lower)
            
            score = (title_matches * 2 + content_matches) / max(len(query_lower.split()) * 3, 1)
            
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
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]
    
    async def get_recommendations(
        self,
        query: str,
        category: Optional[str] = None,
        max_results: int = 5,
        min_similarity: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Get solution recommendations for a query with robust fallbacks"""

        # Attempt 1: With provided category and given threshold
        search_results = await self.search(
            query=query,
            category=category,
            limit=max_results * 2,
            min_similarity=min_similarity
        )

        # Attempt 2: If empty, try without category filter
        if not search_results:
            search_results = await self.search(
                query=query,
                category=None,
                limit=max_results * 2,
                min_similarity=max(min_similarity * 0.8, 0.4)
            )

        # Attempt 3: If still empty, lower threshold further
        if not search_results:
            search_results = await self.search(
                query=query,
                category=None,
                limit=max_results * 2,
                min_similarity=0.3
            )

        recommendations: List[Dict[str, Any]] = []
        for result in search_results[:max_results]:
            metadata = result.get("metadata", {})
            steps_raw = metadata.get("steps", metadata.get("resolution_steps", []))
            # Parse steps if they were stored as JSON string
            steps: List[str]
            if isinstance(steps_raw, str):
                try:
                    parsed = json.loads(steps_raw)
                    steps = parsed if isinstance(parsed, list) else [str(parsed)]
                except Exception:
                    steps = [steps_raw]
            else:
                steps = steps_raw or []

            recommendation = {
                "solution_id": result.get("doc_id", str(uuid.uuid4())),
                "title": result.get("title", "Untitled Solution"),
                "description": result.get("content_snippet", ""),
                "category": result.get("category"),
                "steps": steps or ["Refer to the linked knowledge base article for detailed steps"],
                "similarity_score": float(result.get("score", 0.0)),
                "source": result.get("source", "knowledge_base"),
                "metadata": metadata
            }
            recommendations.append(recommendation)

        logger.info(f"Generated {len(recommendations)} recommendations for: {query[:50]}...")
        return recommendations
    
    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document from the knowledge base"""
        
        # ChromaDB delete
        if self.chroma_collection is not None:
            try:
                self.chroma_collection.delete(ids=[doc_id])
                logger.info(f"Deleted document from ChromaDB: {doc_id}")
                return True
            except Exception as e:
                logger.error(f"Failed to delete document from ChromaDB {doc_id}: {str(e)}")

        # Weaviate delete
        if self.client and self.collection:
            try:
                self.collection.data.delete_by_id(doc_id)
                logger.info(f"Deleted document from Weaviate: {doc_id}")
                return True
            except Exception as e:
                logger.error(f"Failed to delete document from Weaviate {doc_id}: {str(e)}")

        # Fallback delete
        if hasattr(self, 'fallback_storage'):
            self.fallback_storage = [
                doc for doc in self.fallback_storage if doc["doc_id"] != doc_id
            ]
            return True
        
        return False
    
    async def get_document_count(self) -> int:
        """Get total number of documents"""
        
        # ChromaDB count
        if self.chroma_collection is not None:
            try:
                return self.chroma_collection.count()
            except Exception as e:
                logger.error(f"Failed to count documents in ChromaDB: {str(e)}")

        # Weaviate count
        if self.client and self.collection:
            try:
                response = self.collection.aggregate.over_all(total_count=True)
                return response.total_count or 0
            except Exception as e:
                logger.error(f"Failed to get Weaviate document count: {str(e)}")

        # Fallback count
        return len(getattr(self, 'fallback_storage', []))
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of knowledge service"""
        return {
            "initialized": self.initialized,
            "backend": "chroma" if self.chroma_collection else ("weaviate" if self.client else "fallback"),
            "document_count": await self.get_document_count(),
            "chroma_available": CHROMA_AVAILABLE,
            "weaviate_available": WEAVIATE_AVAILABLE
        }
    
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
                metadata = metadata or {}
                title = metadata.get("title", "Manual Entry")
                category = metadata.get("category", "General Support")
                tags = metadata.get("tags", [])
                
                await self.add_document(
                    title=title,
                    content=source,
                    category=category,
                    tags=tags,
                    source="manual",
                    source_type="manual",
                    metadata=metadata
                )
                
            else:
                logger.warning(f"Unsupported source type: {source_type}")
                
        except Exception as e:
            logger.error(f"Knowledge ingestion failed: {str(e)}")
            raise
