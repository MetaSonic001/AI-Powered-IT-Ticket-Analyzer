"""
Test configuration to ensure API packages are importable when running tests directly.

This adds the API directory to sys.path so `from core ...` works even when
pytest is invoked from a subfolder or an IDE test runner.
"""
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parents[1]
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))
