#API\services\knowledge_service.py
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

# Weaviate v4 client (optional for Docker mode)
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
    from chromadb.config import Settings as ChromaSettings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False

from core.config import Settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class KnowledgeService:
    """Knowledge base service using Weaviate (Docker) or ChromaDB (local) for vector storage."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = None                # Weaviate client
        self.collection = None            # Weaviate collection
        self.chroma_client = None         # ChromaDB PersistentClient
        self.chroma_collection = None     # ChromaDB Collection
        self.initialized = False
        self._use_chroma = not bool(getattr(self.settings, "use_docker", False))
        self._chroma_path = Path(getattr(self.settings, "chroma_persist_directory", "./data/chroma_db"))

    # --------------------------------------------------------------------------
    # Initialization
    # --------------------------------------------------------------------------
    async def initialize(self):
        """Initialize vector database client."""
        try:
            logger.info("🔍 Initializing Knowledge Service...")

            # Prefer Weaviate only under Docker
            if getattr(self.settings, "use_docker", False) and WEAVIATE_AVAILABLE:
                await self._connect_weaviate_v4()
                await self._ensure_schema_v4()
                self.initialized = True
                logger.info("✅ Knowledge Service (Weaviate) initialized successfully")
                return

            # Otherwise, initialize ChromaDB locally
            if self._use_chroma and CHROMA_AVAILABLE:
                await self._init_chroma()
                return

            # Fallback
            logger.warning("Vector DB not available — using in-memory fallback.")
            await self._init_fallback()

        except Exception as e:
            logger.error(f"❌ Knowledge Service initialization failed: {str(e)}")
            await self._init_fallback()

    async def close(self):
        """Close connections if applicable."""
        try:
            if self.client:
                try:
                    self.client.close()
                except Exception:
                    pass
                self.client = None
            if self.chroma_client:
                self.chroma_client = None
        except Exception:
            pass

    # --------------------------------------------------------------------------
    # ChromaDB Initialization (Fixed)
    # --------------------------------------------------------------------------
    async def _init_chroma(self):
        """Initialize local ChromaDB persistent vector storage (robust version)."""
        try:
            self._chroma_path.mkdir(parents=True, exist_ok=True)

            logger.info(f"🧠 Initializing ChromaDB at {self._chroma_path}")

            # Create persistent client with telemetry disabled
            self.chroma_client = chromadb.PersistentClient(
                path=str(self._chroma_path),
                settings=ChromaSettings(anonymized_telemetry=False)
            )

            collection_name = "it_knowledge_base"

            # Try loading or recreating collection
            try:
                self.chroma_collection = self.chroma_client.get_collection(name=collection_name)
                logger.info(f"✅ Using existing ChromaDB collection: {collection_name}")
            except Exception as e:
                logger.warning(f"Recreating Chroma collection due to error: {str(e)}")
                try:
                    self.chroma_client.delete_collection(name=collection_name)
                except Exception:
                    pass
                self.chroma_collection = self.chroma_client.create_collection(
                    name=collection_name,
                    metadata={"hnsw:space": "cosine"}
                )
                logger.info(f"✅ Created new ChromaDB collection: {collection_name}")

            self.initialized = True
            logger.info(f"✅ ChromaDB initialized successfully at {self._chroma_path}")

        except Exception as e:
            logger.error(f"❌ Failed to initialize ChromaDB: {str(e)}")

            # Optional: auto-clean corrupted Chroma DB directory
            import shutil
            try:
                shutil.rmtree(self._chroma_path, ignore_errors=True)
            except Exception:
                pass
            await self._init_fallback()

    async def _init_fallback(self):
        """Initialize in-memory fallback knowledge base."""
        self.fallback_storage = []
        self.initialized = True
        logger.info("✅ Fallback knowledge service initialized (in-memory).")

    # --------------------------------------------------------------------------
    # Weaviate (Docker mode)
    # --------------------------------------------------------------------------
    async def _connect_weaviate_v4(self):
        """Connect to Weaviate v4 instance."""
        try:
            url_parts = self.settings.weaviate_host.replace("http://", "").replace("https://", "")
            if ":" in url_parts:
                host, port = url_parts.split(":")
                port = int(port)
            else:
                host, port = url_parts, 8080

            if "localhost" in host or "127.0.0.1" in host:
                self.client = weaviate.connect_to_local(host=host, port=port, grpc_port=50051)
            else:
                params = {"host": host, "port": port, "grpc_port": 50051}
                if self.settings.weaviate_api_key:
                    params["auth_credentials"] = wvc.init.Auth.api_key(self.settings.weaviate_api_key)
                self.client = weaviate.WeaviateClient(
                    connection_params=wvc.init.ConnectionParams.from_params(**params)
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
        """Ensure Weaviate schema exists."""
        try:
            class_name = self.settings.weaviate_class_name
            if self.client.collections.exists(class_name):
                self.collection = self.client.collections.get(class_name)
                logger.info(f"✅ Using existing Weaviate collection: {class_name}")
                return

            properties = [
                Property(name="title", data_type=DataType.TEXT),
                Property(name="content", data_type=DataType.TEXT),
                Property(name="category", data_type=DataType.TEXT),
                Property(name="source", data_type=DataType.TEXT),
                Property(name="metadata", data_type=DataType.TEXT),
                Property(name="created_at", data_type=DataType.DATE),
            ]
            self.collection = self.client.collections.create(
                name=class_name,
                description="IT Knowledge Base for ticket analysis",
                properties=properties,
                vectorizer_config=None
            )
            logger.info(f"✅ Created new Weaviate collection: {class_name}")

        except Exception as e:
            logger.error(f"Schema creation failed: {str(e)}")
            raise

    # --------------------------------------------------------------------------
    # CRUD Operations
    # --------------------------------------------------------------------------
    async def get_recommendations(
        self,
        query: str,
        category: Optional[str] = None,
        max_results: int = 5,
        min_similarity: float = 0.4,
    ) -> List[Dict[str, Any]]:
        """Return solution-style recommendations based on a query.

        Uses the vector search when available; falls back to keyword search.
        Maps raw search results into a standardized solution shape expected by the app.
        """
        try:
            results = await self.search(query=query, category=category, limit=max_results, min_similarity=min_similarity)
            solutions: List[Dict[str, Any]] = []
            for i, r in enumerate(results):
                # Extract steps if present in metadata or derive simple bullets from content
                meta = r.get("metadata", {}) or {}
                steps = meta.get("steps")
                if not steps and r.get("content_snippet"):
                    content = r.get("content_snippet", "")
                    # Heuristic: split into lines and take 3-5 plausible steps
                    lines = [ln.strip(" -•\t") for ln in content.split("\n") if ln.strip()]
                    steps = lines[:5] if lines else None

                solutions.append({
                    "solution_id": r.get("doc_id", f"rec_{i}"),
                    "title": r.get("title") or "Suggested Solution",
                    "description": (r.get("content_snippet") or "")[:300],
                    "steps": steps or [],
                    "similarity_score": float(r.get("score", 0.0)),
                    "estimated_time_minutes": 15,
                    "success_rate": 0.75,
                    "source": r.get("source", "knowledge_base"),
                    "category": r.get("category") or category or "General Support",
                    "metadata": meta,
                })
            return solutions
        except Exception as e:
            logger.error(f"get_recommendations failed: {e}")
            return []

    async def ingest_knowledge(
        self,
        source: str,
        source_type: str = "manual",
        metadata: Optional[Dict[str, Any]] = None,
        task_id: str = "",
    ) -> bool:
        """Lightweight ingestion entrypoint used by the API.

        - If metadata contains a "documents" list, each item should have title/content/category
          and will be added.
        - Otherwise this acts as a no-op acknowledging the request (other scripts handle bulk ingestion).
        """
        try:
            docs = []
            if metadata and isinstance(metadata, dict):
                docs = metadata.get("documents", []) or []
            if not docs:
                logger.info("ingest_knowledge called with no documents; acknowledged.")
                return True

            for doc in docs:
                title = doc.get("title") or "Untitled"
                content = doc.get("content") or ""
                category = doc.get("category") or "Documentation"
                tags = doc.get("tags") or []
                await self.add_document(
                    title=title,
                    content=content,
                    category=category,
                    tags=tags,
                    source=source,
                    source_type=source_type,
                    metadata=doc.get("metadata") or {},
                )
            logger.info(f"✅ Ingested {len(docs)} documents via API task={task_id}")
            return True
        except Exception as e:
            logger.error(f"ingest_knowledge failed: {e}")
            return False
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
        """Add a document to the knowledge base."""
        doc_id = doc_id or str(uuid.uuid4())

        # ChromaDB Mode
        if self.chroma_collection is not None:
            try:
                chroma_metadata = {
                    "title": title,
                    "category": category or "",
                    "source": source,
                    "source_type": source_type,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                if tags:
                    chroma_metadata["tags"] = ",".join(tags)
                if metadata:
                    chroma_metadata["custom_metadata"] = json.dumps(metadata)

                self.chroma_collection.add(
                    ids=[doc_id],
                    documents=[content],
                    metadatas=[chroma_metadata],
                    embeddings=[embeddings.tolist()] if embeddings is not None else None,
                )
                logger.info(f"✅ Added document to ChromaDB: {title[:60]}")
                return doc_id
            except Exception as e:
                logger.error(f"Failed to add document to ChromaDB: {str(e)}")

        # Fallback storage
        if not hasattr(self, "fallback_storage"):
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
            "embeddings": embeddings.tolist() if embeddings is not None else None,
        }
        self.fallback_storage.append(document)
        logger.info(f"✅ Added document to fallback storage: {title[:60]}")
        return doc_id

    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
        min_similarity: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """Search the knowledge base."""
        if self.chroma_collection is not None:
            return await self._chroma_search(query, category, limit, min_similarity)
        return await self._fallback_search(query, category, limit, min_similarity)

    async def _chroma_search(self, query, category, limit, min_similarity):
        """Search using ChromaDB."""
        try:
            where = {"category": category} if category else None
            results = self.chroma_collection.query(
                query_texts=[query],
                n_results=limit,
                where=where,
            )
            formatted_results = []
            if results and results.get("ids") and len(results["ids"]) > 0:
                ids = results.get("ids", [[]])[0]
                metadatas = results.get("metadatas", [[]])[0]
                documents = results.get("documents", [[]])[0]
                distances = results.get("distances", [[]])[0]
                for i, doc_id in enumerate(ids):
                    score = 1.0 - float(distances[i]) if i < len(distances) else 0.5
                    if score < min_similarity:
                        continue
                    metadata = metadatas[i] if i < len(metadatas) else {}
                    document = documents[i] if i < len(documents) else ""
                    formatted_results.append(
                        {
                            "doc_id": doc_id,
                            "title": metadata.get("title", ""),
                            "content_snippet": (document[:500] + "...") if len(document) > 500 else document,
                            "category": metadata.get("category", ""),
                            "tags": metadata.get("tags", "").split(",") if metadata.get("tags") else [],
                            "source": metadata.get("source", ""),
                            "score": score,
                            "metadata": json.loads(metadata.get("custom_metadata", "{}")),
                        }
                    )
            logger.info(f"🔎 Chroma search found {len(formatted_results)} results for '{query[:40]}...'")
            return formatted_results
        except Exception as e:
            logger.error(f"Chroma search failed: {str(e)}")
            return []

    async def _fallback_search(self, query, category, limit, min_similarity):
        """Basic keyword fallback search."""
        if not hasattr(self, "fallback_storage"):
            return []
        query_lower = query.lower()
        results = []
        for doc in self.fallback_storage:
            title_lower = doc["title"].lower()
            content_lower = doc["content"].lower()
            score = sum(w in title_lower or w in content_lower for w in query_lower.split()) / max(
                len(query_lower.split()), 1
            )
            if category and doc.get("category") != category:
                continue
            if score >= min_similarity:
                results.append(
                    {
                        "doc_id": doc["doc_id"],
                        "title": doc["title"],
                        "content_snippet": doc["content"][:500],
                        "category": doc.get("category", ""),
                        "tags": doc.get("tags", []),
                        "source": doc.get("source", ""),
                        "score": score,
                        "metadata": doc.get("metadata", {}),
                    }
                )
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    async def get_document_count(self) -> int:
        """Get total document count."""
        if self.chroma_collection:
            try:
                return self.chroma_collection.count()
            except Exception as e:
                logger.warning(f"Chroma count failed: {str(e)}")
        return len(getattr(self, "fallback_storage", []))

    async def health_check(self) -> Dict[str, Any]:
        """Check health of the knowledge service."""
        return {
            "initialized": self.initialized,
            "backend": "chroma" if self.chroma_collection else "fallback",
            "document_count": await self.get_document_count(),
            "chroma_available": CHROMA_AVAILABLE,
            "weaviate_available": WEAVIATE_AVAILABLE,
        }
