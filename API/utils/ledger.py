"""
Simple JSON-backed ingestion ledger to avoid re-ingesting the same documents.

- Stores entries keyed by doc_id with metadata (path, timestamp, source_type, category)
- Thread-safe for asyncio via a simple lock (best-effort)
- File path defaults to DATA_DIR/ingestion_ledger.json
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import asyncio

class JSONLedger:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._entries: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._loaded = False

    async def load(self) -> None:
        async with self._lock:
            if self._loaded:
                return
            self.path.parent.mkdir(parents=True, exist_ok=True)
            if self.path.exists():
                try:
                    self._entries = json.loads(self.path.read_text(encoding="utf-8"))
                except Exception:
                    # Corrupt file: rename and start fresh
                    backup = self.path.with_suffix(".bak")
                    try:
                        self.path.rename(backup)
                    except Exception:
                        pass
                    self._entries = {}
            self._loaded = True

    async def save(self) -> None:
        async with self._lock:
            tmp = self.path.with_suffix(".tmp")
            tmp.write_text(json.dumps(self._entries, ensure_ascii=False, indent=2), encoding="utf-8")
            tmp.replace(self.path)

    async def has(self, doc_id: str) -> bool:
        await self.load()
        return doc_id in self._entries

    async def record(self, doc_id: str, *, path: Optional[str] = None, source_type: Optional[str] = None, category: Optional[str] = None) -> None:
        await self.load()
        self._entries[doc_id] = {
            "path": path,
            "source_type": source_type,
            "category": category,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.save()

    async def get(self, doc_id: str) -> Optional[Dict[str, Any]]:
        await self.load()
        return self._entries.get(doc_id)

    async def stats(self) -> Dict[str, Any]:
        await self.load()
        return {
            "count": len(self._entries)
        }
