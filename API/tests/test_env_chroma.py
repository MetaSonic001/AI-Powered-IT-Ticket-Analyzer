from core.config import reload_settings

def test_chroma_env_setting(monkeypatch):
    monkeypatch.setenv("USE_DOCKER", "false")
    monkeypatch.setenv("CHROMA_PERSIST_DIRECTORY", "./data/test_chroma_db")
    s = reload_settings()
    assert s.use_docker is False
    assert s.chroma_persist_directory.endswith("test_chroma_db")
    # SQLite remains available for general app persistence only
    monkeypatch.setenv("USE_SQLITE", "true")
    monkeypatch.setenv("SQLITE_DB_PATH", "./data/test_app.db")
    s = reload_settings()
    assert s.use_sqlite is True
    assert s.sqlite_db_path.endswith("test_app.db")
