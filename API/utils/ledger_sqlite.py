"""
SQLite-backed ingestion ledger for vector store syncing

Schema: ledger_entries
- doc_id TEXT PRIMARY KEY
- path TEXT
- source_type TEXT
- category TEXT
- content_hash TEXT
- status TEXT  -- 'synced' | 'added' | 'updated' | 'removed' | 'error'
- first_seen_at TEXT (ISO8601)
- last_seen_at TEXT (ISO8601)
- size INTEGER
- mtime REAL
- error TEXT

Convenience indexes on (path) to look up by file path.
"""
from __future__ import annotations
import sqlite3
from pathlib import Path
from typing import Optional, Dict, Any, Iterable, List
from datetime import datetime, timezone
 

def ISO(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

class SqliteLedger:
    def __init__(self, db_path: Path) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        return conn

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS ledger_entries (
                    doc_id TEXT PRIMARY KEY,
                    path TEXT,
                    source_type TEXT,
                    category TEXT,
                    content_hash TEXT,
                    status TEXT,
                    first_seen_at TEXT,
                    last_seen_at TEXT,
                    size INTEGER,
                    mtime REAL,
                    error TEXT
                );
                """
            )
            conn.execute("CREATE INDEX IF NOT EXISTS idx_ledger_path ON ledger_entries(path);")

    def has(self, doc_id: str) -> bool:
        with self._connect() as conn:
            cur = conn.execute("SELECT 1 FROM ledger_entries WHERE doc_id = ? AND status != 'removed'", (doc_id,))
            return cur.fetchone() is not None

    def upsert_synced(self, *, doc_id: str, path: str, source_type: str, category: Optional[str], content_hash: Optional[str], size: Optional[int], mtime: Optional[float]) -> None:
        now = ISO(datetime.now(timezone.utc))
        with self._connect() as conn:
            cur = conn.execute("SELECT doc_id FROM ledger_entries WHERE doc_id = ?", (doc_id,))
            if cur.fetchone():
                conn.execute(
                    """
                    UPDATE ledger_entries
                    SET path = ?, source_type = ?, category = ?, content_hash = ?, status = 'synced', last_seen_at = ?, size = ?, mtime = ?, error = NULL
                    WHERE doc_id = ?
                    """,
                    (path, source_type, category, content_hash, now, size, mtime, doc_id)
                )
            else:
                conn.execute(
                    """
                    INSERT INTO ledger_entries (doc_id, path, source_type, category, content_hash, status, first_seen_at, last_seen_at, size, mtime)
                    VALUES (?, ?, ?, ?, ?, 'synced', ?, ?, ?, ?)
                    """,
                    (doc_id, path, source_type, category, content_hash, now, now, size, mtime)
                )

    def mark_removed(self, doc_id: str) -> None:
        now = ISO(datetime.now(timezone.utc))
        with self._connect() as conn:
            conn.execute(
                "UPDATE ledger_entries SET status = 'removed', last_seen_at = ? WHERE doc_id = ?",
                (now, doc_id)
            )

    def all_doc_ids(self) -> List[str]:
        with self._connect() as conn:
            cur = conn.execute("SELECT doc_id FROM ledger_entries")
            return [row[0] for row in cur.fetchall()]

    def iter_entries(self) -> Iterable[Dict[str, Any]]:
        with self._connect() as conn:
            cur = conn.execute("SELECT doc_id, path, source_type, category, content_hash, status, first_seen_at, last_seen_at, size, mtime, error FROM ledger_entries")
            cols = [d[0] for d in cur.description]
            for row in cur.fetchall():
                yield {cols[i]: row[i] for i in range(len(cols))}

    def stats(self) -> Dict[str, Any]:
        with self._connect() as conn:
            cur = conn.execute("SELECT COUNT(*) FROM ledger_entries WHERE status = 'synced'")
            synced = cur.fetchone()[0]
            cur = conn.execute("SELECT COUNT(*) FROM ledger_entries WHERE status = 'removed'")
            removed = cur.fetchone()[0]
            cur = conn.execute("SELECT COUNT(*) FROM ledger_entries")
            total = cur.fetchone()[0]
            return {"synced": synced, "removed": removed, "total": total}
