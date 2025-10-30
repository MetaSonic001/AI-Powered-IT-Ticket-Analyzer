"""
Dataset Utility Script

Download small/medium datasets (Kaggle or URLs), save to disk, and optionally ingest
documents into the knowledge base (ChromaDB in local mode or Weaviate in Docker mode).

Examples (Windows cmd.exe):
  # Download a Kaggle dataset and ingest
  python scripts/datasets.py --kaggle "suraj520/customer-support-ticket-dataset" --ingest

  # Download multiple URLs and save, then ingest
  python scripts/datasets.py --urls "https://example.com/guide.pdf" "https://example.com/page.html" --save-dir ./data/imports --ingest

  # Ingest all supported files in a folder
  python scripts/datasets.py --folder ./data/imports --ingest --category "Documentation"

Supported file types for ingestion: .txt, .md, .csv, .pdf, .docx, .html, .htm
"""

from __future__ import annotations
import argparse
import asyncio
import os
import importlib
import importlib.util
from pathlib import Path
from typing import List, Optional

import mimetypes
import re
import hashlib
import inspect

# Optional deps used for extraction
from bs4 import BeautifulSoup  # type: ignore
from pypdf import PdfReader  # type: ignore
from docx import Document  # type: ignore
import pandas as pd
import requests

# Embeddings
from sentence_transformers import SentenceTransformer
import numpy as np

# Project imports
from core.config import get_settings
from services.knowledge_service import KnowledgeService
from utils.logger import setup_logger
from utils.ledger import JSONLedger

logger = setup_logger(__name__)

# Kaggle (lazy import to avoid authenticate-on-import)
KAGGLE_AVAILABLE = importlib.util.find_spec("kaggle") is not None

# -------------------------
# Helpers
# -------------------------

SUPPORTED_SUFFIXES = {".txt", ".md", ".csv", ".pdf", ".docx", ".html", ".htm"}


def safe_filename(name: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9._-]+", "_", name.strip())
    return name[:120] if len(name) > 120 else name


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def guess_filename_from_url(url: str) -> str:
    base = url.split("?")[0].rstrip("/")
    fname = base.split("/")[-1] or "downloaded_file"
    return safe_filename(fname)


# -------------------------
# Downloaders
# -------------------------

def download_kaggle_dataset(dataset_id: str, dest_dir: Path) -> None:
    """Download a Kaggle dataset without requiring import-time authentication.

    Looks for credentials via environment (KAGGLE_USERNAME, KAGGLE_KEY) or a kaggle.json
    located either in %USERPROFILE%/.kaggle/ or in the repository root. If a repo-level
    kaggle.json exists, sets KAGGLE_CONFIG_DIR accordingly so authentication succeeds.
    """
    if not KAGGLE_AVAILABLE:
        raise RuntimeError("Kaggle API not available. Install and configure 'kaggle' first.")

    # Configure credentials source
    repo_kaggle_json = Path.cwd() / "kaggle.json"
    user_kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    if repo_kaggle_json.exists():
        os.environ.setdefault("KAGGLE_CONFIG_DIR", str(repo_kaggle_json.parent.resolve()))

    # Only attempt auth if env or a kaggle.json exists
    if not (os.getenv("KAGGLE_USERNAME") and os.getenv("KAGGLE_KEY")) and not repo_kaggle_json.exists() and not user_kaggle_json.exists():
        raise RuntimeError("Kaggle credentials not found. Set KAGGLE_USERNAME/KAGGLE_KEY or provide kaggle.json.")

    logger.info(f"Downloading Kaggle dataset: {dataset_id}")
    ensure_dir(dest_dir)
    kaggle = importlib.import_module("kaggle")  # type: ignore
    kaggle.api.authenticate()
    kaggle.api.dataset_download_files(dataset_id, path=str(dest_dir), unzip=True)
    logger.info(f"Kaggle dataset saved to {dest_dir}")


def download_url(url: str, dest_dir: Path, filename: Optional[str] = None) -> Path:
    ensure_dir(dest_dir)
    logger.info(f"Downloading: {url}")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()

    # Determine filename
    fname = filename or guess_filename_from_url(url)
    content_type = resp.headers.get("content-type", "")
    if not Path(fname).suffix:
        ext = mimetypes.guess_extension(content_type.split(";")[0].strip()) or ""
        if ext and not fname.endswith(ext):
            fname = fname + ext
    path = dest_dir / safe_filename(fname)

    with open(path, "wb") as f:
        f.write(resp.content)

    logger.info(f"Saved to: {path}")
    return path


# -------------------------
# Text extraction
# -------------------------

def extract_text_from_file(path: Path, max_chars: int = 200_000) -> str:
    suffix = path.suffix.lower()

    try:
        if suffix in {".txt", ".md"}:
            return path.read_text(encoding="utf-8", errors="ignore")[:max_chars]

        if suffix == ".csv":
            try:
                df = pd.read_csv(path)
            except Exception:
                df = pd.read_csv(path, encoding_errors="ignore")
            text = df.to_csv(index=False)
            return text[:max_chars]

        if suffix == ".pdf":
            reader = PdfReader(str(path))
            chunks = []
            for page in reader.pages:
                chunks.append(page.extract_text() or "")
            return "\n".join(chunks)[:max_chars]

        if suffix == ".docx":
            doc = Document(str(path))
            text = "\n".join(p.text for p in doc.paragraphs)
            return text[:max_chars]

        if suffix in {".html", ".htm"}:
            html = path.read_text(encoding="utf-8", errors="ignore")
            soup = BeautifulSoup(html, "html.parser")
            return soup.get_text(separator=" ")[:max_chars]

        # Fallback: read bytes and decode
        return path.read_text(encoding="utf-8", errors="ignore")[:max_chars]
    except Exception as e:
        logger.warning(f"Failed to extract text from {path.name}: {e}")
        return ""


# -------------------------
# Ingestion
# -------------------------

class Embedder:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> None:
        self.model = SentenceTransformer(model_name)

    def encode(self, text: str) -> np.ndarray:
        return np.asarray(self.model.encode(text, show_progress_bar=False, normalize_embeddings=True))


async def _ledger_has(ledger, doc_id: str) -> bool:
    if ledger is None:
        return False
    res = ledger.has(doc_id)
    if inspect.iscoroutine(res):
        return await res
    return bool(res)


async def _ledger_record_synced(ledger, *, doc_id: str, path: Path, source_type: str, category: Optional[str], content_hash: str) -> None:
    if ledger is None:
        return
    size = None
    mtime = None
    try:
        st = path.stat()
        size = st.st_size
        mtime = st.st_mtime
    except Exception:
        pass
    if hasattr(ledger, "upsert_synced"):
        res = ledger.upsert_synced(
            doc_id=doc_id,
            path=str(path),
            source_type=source_type,
            category=category,
            content_hash=content_hash,
            size=size,
            mtime=mtime,
        )
        if inspect.iscoroutine(res):
            await res
    elif hasattr(ledger, "record"):
        res = ledger.record(
            doc_id,
            path=str(path),
            source_type=source_type,
            category=category,
        )
        if inspect.iscoroutine(res):
            await res


async def ingest_folder(
    folder: Path,
    category: Optional[str],
    source_type: str,
    knowledge: KnowledgeService,
    embedder: Embedder,
    ledger: Optional[JSONLedger] = None,
) -> int:
    count = 0
    for path in folder.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES:
            text = extract_text_from_file(path)
            if not text or len(text.strip()) < 20:
                continue

            title = path.stem.replace("_", " ")
            try:
                emb = embedder.encode(text)
                # Deterministic ID based on file content + relative path to avoid duplicates on re-runs
                rel = str(path.relative_to(folder)) if folder in path.parents or folder == path.parent else path.name
                h = hashlib.sha1()
                h.update(rel.encode("utf-8", errors="ignore"))
                h.update(b"|")
                h.update(text[:100000].encode("utf-8", errors="ignore"))  # cap to keep memory reasonable
                doc_id = f"file-{h.hexdigest()}"

                # Skip if already in ledger
                if await _ledger_has(ledger, doc_id):
                    continue

                await knowledge.add_document(
                    title=title,
                    content=text,
                    category=category or "Documentation",
                    tags=[path.suffix.lower().lstrip(".")],
                    source=str(path),
                    source_type=source_type,
                    metadata={"filename": path.name, "relative_path": str(path.relative_to(folder)), "type": "documentation"},
                    embeddings=emb,
                    doc_id=doc_id,
                )
                await _ledger_record_synced(
                    ledger,
                    doc_id=doc_id,
                    path=path,
                    source_type=source_type,
                    category=category or "Documentation",
                    content_hash=h.hexdigest(),
                )
                count += 1
            except Exception as e:
                logger.error(f"Failed to ingest {path}: {e}")
    return count


# -------------------------
# CLI
# -------------------------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Download and ingest datasets into the knowledge base")
    p.add_argument("--kaggle", nargs="*", help="Kaggle dataset IDs (e.g., owner/dataset)")
    p.add_argument("--urls", nargs="*", help="URLs to download (PDF, HTML, CSV, etc.)")
    p.add_argument("--folder", type=str, help="Ingest all supported files from this folder")
    p.add_argument("--save-dir", type=str, default=None, help="Directory to save downloads (defaults to <API>/data/imports)")
    p.add_argument("--category", type=str, default=None, help="Optional category label for ingested documents")
    p.add_argument("--ingest", action="store_true", help="Ingest downloaded/files into the vector DB")
    return p.parse_args(argv)


async def main_async(args: argparse.Namespace) -> int:
    settings = get_settings()

    # Prepare paths (anchor relative paths to the API data directory)
    if args.save_dir:
        save_dir = Path(args.save_dir)
        if not save_dir.is_absolute():
            save_dir = Path(settings.data_dir) / save_dir
    else:
        save_dir = Path(settings.data_dir) / "imports"
    ensure_dir(save_dir)

    # Downloads
    if args.kaggle:
        for ds in args.kaggle:
            try:
                dest = save_dir / "kaggle" / ds.replace("/", "_")
                download_kaggle_dataset(ds, dest)
            except Exception as e:
                logger.error(f"Kaggle download failed for {ds}: {e}")

    if args.urls:
        url_dir = save_dir / "urls"
        for u in args.urls:
            try:
                download_url(u, url_dir)
            except Exception as e:
                logger.error(f"URL download failed for {u}: {e}")

    # Ingestion
    if args.ingest:
        knowledge = KnowledgeService(settings)
        await knowledge.initialize()

        embedder = Embedder()
        total = 0

        # Ingest downloaded Kaggle and URL files
        if (save_dir / "kaggle").exists():
            total += await ingest_folder(save_dir / "kaggle", args.category, "kaggle", knowledge, embedder)
        if (save_dir / "urls").exists():
            total += await ingest_folder(save_dir / "urls", args.category, "url", knowledge, embedder)

        # Ingest an arbitrary folder, if provided
        if args.folder:
            folder = Path(args.folder)
            if not folder.is_absolute():
                folder = Path(settings.data_dir) / folder
            if folder.exists():
                total += await ingest_folder(folder, args.category, "manual", knowledge, embedder)
            else:
                logger.warning(f"Folder not found: {folder}")

        health = await knowledge.health_check()
        logger.info(f"Ingestion complete. Added {total} documents. Backend={health.get('backend')} Count={health.get('document_count')}")

    return 0


def main() -> int:
    args = parse_args()
    try:
        return asyncio.run(main_async(args))
    except KeyboardInterrupt:
        logger.warning("Interrupted")
        return 130
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
