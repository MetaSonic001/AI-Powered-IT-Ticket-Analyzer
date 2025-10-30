"""Start script for the API.

Usage (from repo root):
  python API/start_api.py --reload

This script ensures the `API` folder is on sys.path, sets common environment
defaults (so local mode runs without Docker), and starts uvicorn. It is a
convenience wrapper so developers can run the server with a single command.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def ensure_api_on_path() -> None:
    # If this file is executed from repo root as `python API/start_api.py`,
    # the script_dir is the API folder and should be inserted to sys.path so
    # `import main` works reliably.
    script_dir = Path(__file__).resolve().parent
    script_dir_str = str(script_dir)
    if script_dir_str not in sys.path:
        sys.path.insert(0, script_dir_str)


def set_defaults() -> None:
    """Set safe environment defaults for local development when not set."""
    api_root = Path(__file__).resolve().parent
    os.environ.setdefault("USE_DOCKER", "false")
    os.environ.setdefault("USE_SQLITE", "true")
    os.environ.setdefault("CHROMA_PERSIST_DIRECTORY", str(api_root / "data" / "chroma_db"))
    os.environ.setdefault("SQLITE_DB_PATH", str(api_root / "data" / "app.db"))
    os.environ.setdefault("LOG_LEVEL", os.environ.get("LOG_LEVEL", "info"))


def run_uvicorn_programmatic(host: str, port: int, log_level: str) -> None:
    # Import uvicorn and main.app directly and run in-process. This is
    # convenient, but if reload=True is requested we spawn uvicorn as a
    # subprocess because programmatic reload sometimes behaves differently.
    try:
        import uvicorn
        import main

        print(f"Starting uvicorn (programmatic) on http://{host}:{port} (log={log_level})")
        uvicorn.run(main.app, host=host, port=port, log_level=log_level)
    except Exception as exc:  # pragma: no cover - convenience script
        print("Failed to start uvicorn programmatically:", exc)
        raise


def run_uvicorn_subprocess(host: str, port: int, reload: bool, log_level: str) -> None:
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", host, "--port", str(port), "--log-level", log_level]
    if reload:
        cmd.append("--reload")

    print("Launching uvicorn subprocess:")
    print(" ", " ".join(cmd))
    # Use exec so Ctrl+C handling is simple for the user
    os.execv(sys.executable, cmd)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Start the API (convenience wrapper)")
    p.add_argument("--host", default="0.0.0.0", help="Host to bind")
    p.add_argument("--port", default=8000, type=int, help="Port to bind")
    p.add_argument("--reload", action="store_true", help="Run uvicorn with --reload (dev)")
    p.add_argument("--log-level", default=os.environ.get("LOG_LEVEL", "info"), help="uvicorn log level")
    return p.parse_args()


def main() -> None:
    ensure_api_on_path()
    set_defaults()
    args = parse_args()

    print("API start helper: using settings (partial view):")
    print("  USE_DOCKER=", os.environ.get("USE_DOCKER"))
    print("  USE_SQLITE=", os.environ.get("USE_SQLITE"))
    print("  CHROMA_PERSIST_DIRECTORY=", os.environ.get("CHROMA_PERSIST_DIRECTORY"))
    print("  SQLITE_DB_PATH=", os.environ.get("SQLITE_DB_PATH"))
    print()

    # If reload requested, exec uvicorn module so reload works as expected.
    if args.reload:
        run_uvicorn_subprocess(args.host, args.port, reload=True, log_level=args.log_level)
    else:
        run_uvicorn_programmatic(args.host, args.port, args.log_level)


if __name__ == "__main__":
    main()
