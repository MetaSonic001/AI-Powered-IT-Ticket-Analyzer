"""
Core configuration settings for the IT Ticket Analyzer
"""
from pydantic_settings import SettingsConfigDict

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional, List, Dict, Any
import os
from pathlib import Path
import logging

class Settings(BaseSettings):
    # API Configuration
    api_title: str = "AI-Powered IT Ticket Analyzer"
    api_version: str = "1.0.0"
    api_debug: bool = Field(default=False, env="DEBUG")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    workers: int = Field(default=1, env="WORKERS")
    
    # Model Configuration
    use_ollama: bool = Field(default=True, env="USE_OLLAMA")
    ollama_host: str = Field(default="http://localhost:11434", env="OLLAMA_HOST")
    ollama_models: Dict[str, str] = {
        "embedding": "nomic-embed-text:latest",
        "llm": "gemma2:2b",
        "classification": "gemma2:2b"
    }
    
    # Hugging Face Configuration (fallback)
    use_huggingface: bool = Field(default=True, env="USE_HUGGINGFACE")
    hf_token: Optional[str] = Field(default=None, env="HUGGINGFACE_TOKEN")
    hf_models: Dict[str, str] = {
        "embedding": "sentence-transformers/all-MiniLM-L6-v2",
        "classification": "microsoft/DialoGPT-medium",
        "ner": "dslim/bert-base-NER"
    }
    
    # External API Configuration (optional)
    groq_api_key: Optional[str] = Field(default=None, env="GROQ_API_KEY")
    groq_model: str = Field(default="llama3-8b-8192", env="GROQ_MODEL")
    
    gemini_api_key: Optional[str] = Field(default=None, env="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-pro", env="GEMINI_MODEL")
    
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    
    # Weaviate Configuration
    weaviate_host: str = Field(default="http://localhost:8080", env="WEAVIATE_HOST")
    weaviate_api_key: Optional[str] = Field(default=None, env="WEAVIATE_API_KEY")
    weaviate_class_name: str = Field(default="ITKnowledge", env="WEAVIATE_CLASS")
    
    # Data Configuration
    data_dir: str = Field(default="data", env="DATA_DIR")
    models_dir: str = Field(default="models", env="MODELS_DIR")
    logs_dir: str = Field(default="logs", env="LOGS_DIR")
    
    # Knowledge Base Configuration
    knowledge_sources: List[str] = [
        "kaggle",
        "github",
        "stackoverflow",
        "documentation"
    ]
    
    # Kaggle Configuration
    kaggle_username: Optional[str] = Field(default=None, env="KAGGLE_USERNAME")
    kaggle_key: Optional[str] = Field(default=None, env="KAGGLE_KEY")
    
    # GitHub Configuration
    github_token: Optional[str] = Field(default=None, env="GITHUB_TOKEN")
    
    # Scraping Configuration
    max_concurrent_requests: int = Field(default=5, env="MAX_CONCURRENT_REQUESTS")
    request_delay: float = Field(default=1.0, env="REQUEST_DELAY")
    
    # ML Configuration
    embedding_dimension: int = Field(default=384, env="EMBEDDING_DIMENSION")
    max_sequence_length: int = Field(default=512, env="MAX_SEQUENCE_LENGTH")
    batch_size: int = Field(default=32, env="BATCH_SIZE")
    
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
    crew_verbose: bool = Field(default=True, env="CREW_VERBOSE")
    crew_memory: bool = Field(default=True, env="CREW_MEMORY")
    max_agents: int = Field(default=5, env="MAX_AGENTS")
    
    # Cache Configuration
    enable_caching: bool = Field(default=True, env="ENABLE_CACHING")
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")  # seconds
    
    # Logging Configuration
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"  # or "ignore" if you want to allow unknown env keys
    )
        
    @field_validator("data_dir", "models_dir", "logs_dir")
    def create_directories(cls, v):
        """Create directories if they don't exist"""
        path = Path(v)
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
        """Check if external LLM APIs are configured"""
        return bool(self.groq_api_key or self.gemini_api_key or self.openai_api_key)
    
    @property
    def primary_llm_provider(self) -> str:
        """Get primary LLM provider"""
        if self.use_ollama:
            return "ollama"
        elif self.groq_api_key:
            return "groq"
        elif self.gemini_api_key:
            return "gemini"
        elif self.openai_api_key:
            return "openai"
        else:
            return "huggingface"
    
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
# Server Configuration
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Model Configuration
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
USE_HUGGINGFACE=true
HUGGINGFACE_TOKEN=your_hf_token_here

# External APIs (optional)
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here

# Weaviate Configuration
WEAVIATE_HOST=http://localhost:8080
WEAVIATE_API_KEY=your_weaviate_key_here

# Data Sources
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_key
GITHUB_TOKEN=your_github_token

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
