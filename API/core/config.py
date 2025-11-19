"""
Core configuration settings for the IT Ticket Analyzer
"""
from pydantic_settings import SettingsConfigDict

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, AliasChoices
from typing import Optional, List, Dict, Any
from pathlib import Path
import logging

# Anchor all default paths relative to the API directory (project root for the API app)
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # API Configuration
    api_title: str = "AI-Powered IT Ticket Analyzer"
    api_version: str = "1.0.0"
    api_debug: bool = Field(default=False, validation_alias=AliasChoices("DEBUG"))
    
    # Server Configuration
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    workers: int = Field(default=1)
    
    # Model Configuration
    # LLM Provider flags (enable/disable each provider)
    use_groq: bool = Field(default=True)
    use_gemini: bool = Field(default=False)
    use_ollama: bool = Field(default=False)
    use_huggingface: bool = Field(default=True)
    
    # Provider-specific settings
    ollama_host: str = Field(default="http://localhost:11434")
    ollama_models: Dict[str, str] = {
        "embedding": "nomic-embed-text:latest",
        "llm": "gemma2:2b",
        "classification": "gemma2:2b"
    }
    
    # Hugging Face Configuration (fallback)
    use_huggingface: bool = Field(default=True)
    hf_token: Optional[str] = Field(default=None, validation_alias=AliasChoices("HUGGINGFACE_TOKEN"))
    hf_models: Dict[str, str] = {
        "embedding": "sentence-transformers/all-MiniLM-L6-v2",
        "classification": "microsoft/DialoGPT-medium",
        "ner": "dslim/bert-base-NER"
    }
    
    # External API Configuration (optional)
    groq_api_key: Optional[str] = Field(default=None)
    groq_model: str = Field(default="openai/gpt-oss-20b")
    
    gemini_api_key: Optional[str] = Field(default=None)
    gemini_model: str = Field(default="gemini-pro")
    
    # Twilio Configuration
    twilio_account_sid: Optional[str] = Field(default=None)
    twilio_auth_token: Optional[str] = Field(default=None)
    twilio_phone_number: Optional[str] = Field(default=None)
    
    # Weaviate Configuration
    weaviate_host: str = Field(default="http://localhost:8080")
    weaviate_api_key: Optional[str] = Field(default=None)
    weaviate_class_name: str = Field(default="ITKnowledge", validation_alias=AliasChoices("WEAVIATE_CLASS"))

    # Deployment mode
    use_docker: bool = Field(default=False)
    # Local persistence options (non-vector)
    # NOTE: SQLite is only for general app persistence when needed, not for vector search
    use_sqlite: bool = Field(default=True)
    sqlite_db_path: str = Field(default=str((BASE_DIR / "data" / "app.db").resolve()))  
    # Ledger (SQLite) for auto-sync bookkeeping
    ledger_db_path: str = Field(default=str((BASE_DIR / "data" / "ledger.db").resolve()))
    # ChromaDB persistent directory for local vector storage (used when not using Docker/Weaviate)
    chroma_persist_directory: str = Field(default=str((BASE_DIR / "data" / "chroma_db").resolve()))
    
    # Data Configuration
    data_dir: str = Field(default=str((BASE_DIR / "data").resolve()))
    models_dir: str = Field(default=str((BASE_DIR / "models").resolve()))
    logs_dir: str = Field(default=str((BASE_DIR / "logs").resolve()))
    
    # Knowledge Base Configuration
    knowledge_sources: List[str] = [
        "kaggle",
        "github",
        "stackoverflow",
        "documentation"
    ]
    
    # Kaggle Configuration
    kaggle_username: Optional[str] = Field(default=None)
    kaggle_key: Optional[str] = Field(default=None)
    
    # GitHub Configuration
    github_token: Optional[str] = Field(default=None)
    
    # Scraping Configuration
    max_concurrent_requests: int = Field(default=5)
    request_delay: float = Field(default=1.0)
    
    # ML Configuration
    embedding_dimension: int = Field(default=384)
    max_sequence_length: int = Field(default=512)
    batch_size: int = Field(default=32)
    
    # Categories Configuration
    ticket_categories: List[str] = [
        "Network Issues",
        "Software Problems",
        "Hardware Failures",
        "Security Incidents",
        "Account Access",
        "Email Issues",
        "Printer Problems",
        "Application Errors",
        "System Performance",
        "Mobile Device Support",
        "Database Issues",
        "Backup & Recovery",
        "General Support"
    ]
    
    priority_levels: List[str] = [
        "Critical",
        "High",
        "Medium",
        "Low"
    ]
    
    # CrewAI Configuration
    crew_verbose: bool = Field(default=True)
    crew_memory: bool = Field(default=True)
    max_agents: int = Field(default=5)
    
    # Cache Configuration
    enable_caching: bool = Field(default=True)
    cache_ttl: int = Field(default=3600)  # seconds
    
    # Logging Configuration
    log_level: str = Field(default="INFO")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    model_config = SettingsConfigDict(
        env_file=str((BASE_DIR / ".env").resolve()),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"  # or "ignore" if you want to allow unknown env keys
    )
    
    @field_validator("sqlite_db_path")
    def ensure_sqlite_parent(cls, v):
        """Ensure the parent directory for the SQLite DB exists"""
        try:
            p = Path(v)
            if not p.is_absolute():
                p = (BASE_DIR / p).resolve()
            parent = p.parent
            parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logging.getLogger(__name__).warning(f"Could not ensure SQLite parent dir for {v}: {e}")
        return str(p)
    
    @field_validator("chroma_persist_directory")
    def ensure_chroma_dir(cls, v):
        """Ensure the ChromaDB persistence directory exists"""
        try:
            path = Path(v)
            if not path.is_absolute():
                path = (BASE_DIR / path).resolve()
            path.mkdir(parents=True, exist_ok=True)
            return str(path)
        except Exception as e:
            logging.getLogger(__name__).warning(f"Could not ensure Chroma directory {v}: {e}")
            return v
        
    @field_validator("ledger_db_path")
    def ensure_ledger_parent(cls, v):
        """Ensure the parent directory for the ledger DB exists."""
        try:
            p = Path(v)
            if not p.is_absolute():
                p = (BASE_DIR / p).resolve()
            parent = p.parent
            parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logging.getLogger(__name__).warning(f"Could not ensure Ledger parent dir for {v}: {e}")
        return str(p)
        
    @field_validator("data_dir", "models_dir", "logs_dir")
    def create_directories(cls, v):
        """Create directories if they don't exist"""
        path = Path(v)
        if not path.is_absolute():
            path = (BASE_DIR / path).resolve()
        path.mkdir(parents=True, exist_ok=True)
        return str(path)
    
    @field_validator("log_level")
    def validate_log_level(cls, v):
        """Validate log level"""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"Log level must be one of {valid_levels}")
        return v.upper()
    
    @property
    def has_external_llm(self) -> bool:
        """Check if external LLM APIs are configured and enabled"""
        groq_enabled = self.use_groq and bool(self.groq_api_key)
        gemini_enabled = self.use_gemini and bool(self.gemini_api_key)
        return groq_enabled or gemini_enabled
    
    @property
    def primary_llm_provider(self) -> str:
        """Get primary LLM provider based on enabled flags and API keys"""
        # Check Groq first (fast and cost-effective)
        if self.use_groq and self.groq_api_key:
            return "groq"
        # Then Gemini
        elif self.use_gemini and self.gemini_api_key:
            return "gemini"
        # Then Ollama (local)
        elif self.use_ollama:
            return "ollama"
        # Fallback to HuggingFace
        elif self.use_huggingface:
            return "huggingface"
        else:
            return "none"
    
    @property
    def enabled_llm_providers(self) -> List[str]:
        """Get list of enabled LLM providers in priority order"""
        providers = []
        
        if self.use_groq and self.groq_api_key:
            providers.append("groq")
        if self.use_gemini and self.gemini_api_key:
            providers.append("gemini")
        if self.use_ollama:
            providers.append("ollama")
        if self.use_huggingface:
            providers.append("huggingface")
        
        return providers
    
    @property
    def knowledge_base_config(self) -> Dict[str, Any]:
        """Get knowledge base configuration"""
        return {
            "host": self.weaviate_host,
            "api_key": self.weaviate_api_key,
            "class_name": self.weaviate_class_name,
            "embedding_dimension": self.embedding_dimension
        }
    
    def get_model_config(self, model_type: str) -> Dict[str, Any]:
        """Get model configuration for a specific type"""
        config = {
            "provider": self.primary_llm_provider,
            "batch_size": self.batch_size,
            "max_length": self.max_sequence_length
        }
        
        if self.primary_llm_provider == "ollama":
            config.update({
                "host": self.ollama_host,
                "model": self.ollama_models.get(model_type, self.ollama_models["llm"])
            })
        elif self.primary_llm_provider == "groq":
            config.update({
                "api_key": self.groq_api_key,
                "model": self.groq_model
            })
        elif self.primary_llm_provider == "gemini":
            config.update({
                "api_key": self.gemini_api_key,
                "model": self.gemini_model
            })
        elif self.primary_llm_provider == "huggingface":
            config.update({
                "token": self.hf_token,
                "model": self.hf_models.get(model_type, self.hf_models["classification"])
            })
        
        return config

# Global settings instance
_settings: Optional[Settings] = None

def get_settings() -> Settings:
    """Get global settings instance"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

def reload_settings() -> Settings:
    """Reload settings from environment"""
    global _settings
    _settings = Settings()
    return _settings

# Example .env file content
ENV_EXAMPLE = """
# ========== Common (Docker or Local) ==========
# Server Configuration
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Model Configuration
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
USE_HUGGINGFACE=true
HUGGINGFACE_TOKEN=your_hf_token_here

# External providers (optional)
GROQ_API_KEY=
GEMINI_API_KEY=

# Directories
DATA_DIR=./data
MODELS_DIR=./models
LOGS_DIR=./logs

# Logging
LOG_LEVEL=INFO

# Performance
MAX_CONCURRENT_REQUESTS=5
BATCH_SIZE=32
ENABLE_CACHING=true
CACHE_TTL=3600


# ========== Docker-only ==========
# Set to true when running via docker-compose
USE_DOCKER=false
# In Docker, the Weaviate service is reachable at http://weaviate:8080
#WEAVIATE_HOST=http://weaviate:8080
WEAVIATE_API_KEY=


# ========== Local-only (no Docker) ==========
# Keep USE_DOCKER=false for local mode
CHROMA_PERSIST_DIRECTORY=./data/chroma_db
# Optional: general app persistence (non-vector)
USE_SQLITE=true
SQLITE_DB_PATH=./data/app.db
# Ledger DB for auto-sync bookkeeping
LEDGER_DB_PATH=./data/ledger.db
# If you run a local Weaviate outside Docker (instead of Chroma), point to localhost
#WEAVIATE_HOST=http://localhost:8080


# Data Sources (optional)
KAGGLE_USERNAME=
KAGGLE_KEY=
GITHUB_TOKEN=
"""

if __name__ == "__main__":
    # Create example .env file
    if not Path(".env").exists():
        with open(".env", "w") as f:
            f.write(ENV_EXAMPLE)
        print("Created example .env file")
    
    # Test settings
    settings = get_settings()
    print(f"Primary LLM Provider: {settings.primary_llm_provider}")
    print(f"Has External LLM: {settings.has_external_llm}")
    print(f"Data Directory: {settings.data_dir}")
    print(f"Ticket Categories: {len(settings.ticket_categories)}")
