#!/usr/bin/env python3
"""
Setup and initialization scripts for IT Ticket Analyzer
"""

import os
import sys
import subprocess
import asyncio
import json
from pathlib import Path
from typing import List, Dict, Any

def create_directory_structure():
    """Create required directory structure"""
    
    directories = [
        "data",
        "data/kaggle", 
        "data/scraped",
        "data/processed",
        "data/exports",
        "logs",
        "models",
        "models/cache",
        "core",
        "services", 
        "agents",
        "utils",
        "tests",
        "docs",
        "scripts",
        "config",
        "ssl"
    ]
    
    print("📁 Creating directory structure...")
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"  ✅ Created: {directory}")
    
    print("✅ Directory structure created successfully")

def create_env_file():
    """Create .env file with example configuration"""
    
    env_content = """# Server Configuration
DEBUG=false
HOST=0.0.0.0
PORT=8000
WORKERS=1

# Model Configuration
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
USE_HUGGINGFACE=true
HUGGINGFACE_TOKEN=your_hf_token_here

# External AI APIs (optional - only use if you have API keys)
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama3-8b-8192
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-pro
OPENAI_API_KEY=your_openai_key_here

# Weaviate Vector Database
WEAVIATE_HOST=http://localhost:8080
WEAVIATE_API_KEY=your_weaviate_key_here
WEAVIATE_CLASS=ITKnowledge

# Data Sources
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_key
GITHUB_TOKEN=your_github_token

# Directories
DATA_DIR=./data
MODELS_DIR=./models
LOGS_DIR=./logs

# Performance
MAX_CONCURRENT_REQUESTS=5
BATCH_SIZE=32
EMBEDDING_DIMENSION=384
MAX_SEQUENCE_LENGTH=512

# Caching
ENABLE_CACHING=true
CACHE_TTL=3600

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# CrewAI Configuration
CREW_VERBOSE=true
CREW_MEMORY=true
MAX_AGENTS=5

# Database (Optional)
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/it_ticket_analyzer

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0

# Monitoring (Optional)
ENABLE_METRICS=true
METRICS_PORT=9000
"""
    
    if not Path(".env").exists():
        with open(".env", "w") as f:
            f.write(env_content)
        print("✅ Created .env file with example configuration")
        print("⚠️  Please edit .env file with your actual API keys and configuration")
    else:
        print("⚠️  .env file already exists, skipping creation")

def create_docker_files():
    """Create additional Docker configuration files"""
    
    # Nginx configuration
    nginx_conf = """
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /api/docs {
            proxy_pass http://api/api/docs;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
"""
    
    with open("nginx.conf", "w") as f:
        f.write(nginx_conf)
    
    # Prometheus configuration
    prometheus_conf = """
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'fastapi'
    static_configs:
      - targets: ['api:8000']
    scrape_interval: 5s
    metrics_path: '/metrics'
    
  - job_name: 'weaviate'
    static_configs:
      - targets: ['weaviate:8080']
    scrape_interval: 15s
    metrics_path: '/v1/meta'
"""
    
    with open("prometheus.yml", "w") as f:
        f.write(prometheus_conf)
    
    print("✅ Created Docker configuration files")

def install_dependencies():
    """Install Python dependencies"""
    
    print("📦 Installing Python dependencies...")
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=True)
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def setup_ollama_models():
    """Setup Ollama models"""
    
    print("🤖 Setting up Ollama models...")
    
    models_to_pull = [
        "nomic-embed-text:latest",
        "gemma2:2b"
    ]
    
    for model in models_to_pull:
        try:
            print(f"  Pulling {model}...")
            subprocess.run(["ollama", "pull", model], check=True)
            print(f"  ✅ {model} pulled successfully")
        except subprocess.CalledProcessError:
            print(f"  ❌ Failed to pull {model} (Ollama may not be installed or running)")
        except FileNotFoundError:
            print("  ⚠️  Ollama not found, skipping model setup")
            print("  💡 Install Ollama from https://ollama.ai")
            break

def create_init_script():
    """Create initialization script"""
    
    init_script = """#!/usr/bin/env python3
'''
IT Ticket Analyzer - Initialization Script
Run this script to initialize the system with sample data
'''

import asyncio
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from core.config import get_settings
from services.knowledge_service import KnowledgeService
from services.data_service import DataService
from services.model_service import ModelService

async def initialize_system():
    '''Initialize the system with sample data'''
    
    print("🚀 Initializing IT Ticket Analyzer...")
    
    try:
        # Load settings
        settings = get_settings()
        print(f"✅ Loaded settings")
        
        # Initialize services
        print("🔧 Initializing services...")
        
        model_service = ModelService(settings)
        await model_service.initialize()
        print("✅ Model service initialized")
        
        knowledge_service = KnowledgeService(settings)
        await knowledge_service.initialize()
        print("✅ Knowledge service initialized")
        
        data_service = DataService(settings)
        await data_service.initialize()
        print("✅ Data service initialized")
        
        # Load initial datasets
        print("📊 Loading initial datasets...")
        await data_service.load_initial_datasets()
        
        # Get cached knowledge and add to knowledge base
        knowledge_items = await data_service.get_cached_knowledge()
        print(f"📚 Adding {len(knowledge_items)} items to knowledge base...")
        
        for item in knowledge_items:
            await knowledge_service.add_document(
                title=item["title"],
                content=item["content"],
                category=item.get("category"),
                tags=item.get("metadata", {}).get("tags", []),
                source=item.get("source", "initialization"),
                source_type=item.get("source_type", "manual"),
                metadata=item.get("metadata", {})
            )
        
        # Get statistics
        stats = await knowledge_service.get_statistics()
        print(f"✅ Knowledge base initialized with:")
        print(f"   📄 {stats['total_documents']} documents")
        print(f"   🏷️  {stats['total_categories']} categories")
        print(f"   🔧 Using Weaviate: {stats['using_weaviate']}")
        
        print("🎉 System initialization completed successfully!")
        print("🌐 You can now start the API server with: uvicorn main:app --reload")
        
    except Exception as e:
        print(f"❌ Initialization failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(initialize_system())
"""
    
    with open("scripts/initialize.py", "w") as f:
        f.write(init_script)
    
    # Make it executable
    os.chmod("scripts/initialize.py", 0o755)
    print("✅ Created initialization script")

def create_run_scripts():
    """Create convenience run scripts"""
    
    # Development run script
    dev_script = """#!/bin/bash
# Development run script

echo "🚀 Starting IT Ticket Analyzer in development mode..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run initialization if knowledge base is empty
if [ ! -f "data/.initialized" ]; then
    echo "🔧 Running first-time initialization..."
    python scripts/initialize.py
    touch data/.initialized
fi

# Start the server
echo "🌐 Starting FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
    
    with open("scripts/run_dev.sh", "w") as f:
        f.write(dev_script)
    os.chmod("scripts/run_dev.sh", 0o755)
    
    # Production run script
    prod_script = """#!/bin/bash
# Production run script

echo "🚀 Starting IT Ticket Analyzer in production mode..."

# Check for Docker
if command -v docker-compose &> /dev/null; then
    echo "🐳 Starting with Docker Compose..."
    docker-compose up -d
    echo "✅ Services started successfully"
    echo "🌐 API available at: http://localhost:8000"
    echo "📊 Weaviate available at: http://localhost:8080"
    echo "📈 Grafana available at: http://localhost:3000"
else
    echo "⚠️  Docker Compose not found"
    echo "📦 Starting with Python..."
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Start with Gunicorn
    gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
fi
"""
    
    with open("scripts/run_prod.sh", "w") as f:
        f.write(prod_script)
    os.chmod("scripts/run_prod.sh", 0o755)
    
    print("✅ Created run scripts")

def create_test_script():
    """Create test script to verify installation"""
    
    test_script = """#!/usr/bin/env python3
'''
Test script to verify IT Ticket Analyzer installation
'''

import asyncio
import sys
import json
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

async def test_installation():
    '''Test the installation'''
    
    print("🧪 Testing IT Ticket Analyzer installation...")
    
    try:
        # Test imports
        print("📦 Testing imports...")
        
        from core.config import get_settings
        from core.models import TicketAnalysisRequest
        from services.model_service import ModelService
        from services.knowledge_service import KnowledgeService
        from services.data_service import DataService
        
        print("✅ All imports successful")
        
        # Test configuration
        print("⚙️  Testing configuration...")
        settings = get_settings()
        print(f"✅ Configuration loaded (Primary LLM: {settings.primary_llm_provider})")
        
        # Test model service
        print("🤖 Testing model service...")
        model_service = ModelService(settings)
        await model_service.initialize()
        
        # Test classification
        test_text = "My computer is running very slowly and applications take a long time to load"
        categories = ["Network Issues", "Software Problems", "Hardware Failures", "System Performance"]
        
        result = await model_service.classify_text(test_text, categories)
        print(f"✅ Text classification working: {result['category']} (confidence: {result['confidence']:.2f})")
        
        # Test knowledge service
        print("📚 Testing knowledge service...")
        knowledge_service = KnowledgeService(settings)
        await knowledge_service.initialize()
        
        # Test adding a document
        doc_id = await knowledge_service.add_document(
            title="Test Document",
            content="This is a test document for verifying the knowledge service",
            category="General Support",
            source="test"
        )
        print(f"✅ Knowledge service working: Added document {doc_id}")
        
        # Test data service
        print("📊 Testing data service...")
        data_service = DataService(settings)
        await data_service.initialize()
        
        stats = await data_service.get_processing_stats()
        print(f"✅ Data service working: {stats['available_features']}")
        
        # Test complete pipeline with a sample ticket
        print("🎫 Testing complete ticket analysis pipeline...")
        
        sample_ticket = {
            "title": "Email not working on mobile device",
            "description": "I cannot receive emails on my iPhone. The mail app shows an error when trying to sync with the company Exchange server.",
            "requester_info": {
                "name": "Test User",
                "department": "Sales"
            }
        }
        
        # This would normally use CrewManager, but for testing we'll use individual services
        classification = await model_service.classify_text(
            f"{sample_ticket['title']} {sample_ticket['description']}", 
            settings.ticket_categories
        )
        
        recommendations = await knowledge_service.get_recommendations(
            query=f"{sample_ticket['title']} {sample_ticket['description']}",
            max_results=3
        )
        
        print(f"✅ Complete pipeline test successful:")
        print(f"   🏷️  Category: {classification['category']}")
        print(f"   💡 Recommendations: {len(recommendations)}")
        
        print("🎉 All tests passed! Installation is working correctly.")
        
        # Cleanup test document
        await knowledge_service.delete_document(doc_id)
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_installation())
    sys.exit(0 if success else 1)
"""
    
    with open("scripts/test_installation.py", "w") as f:
        f.write(test_script)
    os.chmod("scripts/test_installation.py", 0o755)
    print("✅ Created test script")

def create_readme():
    """Create comprehensive README.md"""
    
    readme_content = """# AI-Powered IT Ticket Analyzer & Auto-Suggester

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-supported-blue.svg)](https://www.docker.com/)

Enterprise-grade AI-powered system for automated IT ticket analysis, classification, priority prediction, and solution recommendation using multi-agent architecture.

## 🌟 Features

- **🤖 Multi-Agent AI System**: Using CrewAI for specialized ticket analysis agents
- **📊 Multiple LLM Support**: Ollama, Hugging Face, Groq, Gemini with automatic fallbacks
- **🔍 Vector Search**: Weaviate-powered knowledge base with semantic search
- **📈 Real-time Analytics**: Comprehensive dashboard with ticket trends and insights  
- **🔧 Auto-Classification**: Smart categorization of IT tickets into predefined categories
- **⚡ Priority Prediction**: Intelligent priority assignment with resolution time estimates
- **💡 Solution Recommendations**: RAG-powered solution suggestions from knowledge base
- **📚 Knowledge Management**: Automated ingestion from multiple data sources
- **🌐 RESTful API**: Complete FastAPI-based REST API with async support
- **🐳 Docker Ready**: Full containerization with docker-compose setup

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI API   │    │  Multi-Agent    │    │  Knowledge Base │
│                 │────│   CrewAI        │────│   (Weaviate)    │
│  - REST Endpoints│    │                 │    │                 │
│  - Async Support│    │ - Classifier    │    │ - Vector Search │
│  - Validation   │    │ - Prioritizer   │    │ - Semantic RAG  │
│  - Analytics    │    │ - Recommender   │    │ - Auto-indexing │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Model Service  │
                    │                 │
                    │ - Ollama        │
                    │ - Hugging Face  │
                    │ - Groq/Gemini   │
                    │ - Auto-fallback │
                    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd it-ticket-analyzer
   ```

2. **Setup environment**
   ```bash
   python scripts/setup.py
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Access the API**
   - API Documentation: http://localhost:8000/api/docs
   - Weaviate Console: http://localhost:8080
   - Grafana Dashboard: http://localhost:3000

### Option 2: Local Development

1. **Prerequisites**
   - Python 3.11+
   - Ollama (optional but recommended)
   - Weaviate instance (or use Docker)

2. **Setup**
   ```bash
   # Run setup script
   python scripts/setup.py
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Initialize system
   python scripts/initialize.py
   
   # Start development server
   ./scripts/run_dev.sh
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (automatically generated by setup script):

```env
# Model Configuration
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
USE_HUGGINGFACE=true
HUGGINGFACE_TOKEN=your_token_here

# External APIs (optional)
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# Vector Database
WEAVIATE_HOST=http://localhost:8080

# Data Sources
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_key
```

### Ollama Models

The system uses these Ollama models (automatically pulled):
- `nomic-embed-text:latest` - For embeddings
- `gemma2:2b` - For text generation and classification

## 📋 API Endpoints

### Core Ticket Analysis
- `POST /api/v1/tickets/analyze` - Complete ticket analysis
- `POST /api/v1/tickets/classify` - Classification only
- `POST /api/v1/tickets/predict-priority` - Priority prediction
- `POST /api/v1/tickets/bulk-process` - Batch processing

### Knowledge Management
- `POST /api/v1/solutions/recommend` - Get solution recommendations
- `GET /api/v1/solutions/search` - Search knowledge base
- `POST /api/v1/knowledge/ingest` - Ingest new knowledge

### Analytics & Monitoring
- `GET /api/v1/analytics/dashboard` - Dashboard data
- `GET /api/v1/analytics/reports` - Generate reports
- `GET /api/v1/health` - Health check
- `GET /api/v1/models/status` - Model status

## 💡 Usage Examples

### Analyze a Ticket

```python
import httpx

ticket_data = {
    "title": "Cannot connect to WiFi network",
    "description": "User reports being unable to connect to corporate WiFi. Getting authentication error.",
    "requester_info": {
        "name": "John Doe",
        "department": "Sales",
        "location": "New York Office"
    }
}

response = httpx.post("http://localhost:8000/api/v1/tickets/analyze", json=ticket_data)
analysis = response.json()

print(f"Category: {analysis['classification']['category']}")
print(f"Priority: {analysis['priority_prediction']['priority']}")
print(f"Solutions: {len(analysis['recommended_solutions'])}")
```

### Get Solution Recommendations

```python
response = httpx.post("http://localhost:8000/api/v1/solutions/recommend", json={
    "query": "email synchronization issues mobile device",
    "category": "Email Issues",
    "max_results": 5
})

recommendations = response.json()
for solution in recommendations['recommendations']:
    print(f"- {solution['title']} (Score: {solution['similarity_score']:.2f})")
```

## 📊 Data Sources

The system automatically ingests data from:

- **Kaggle Datasets**: IT helpdesk and support ticket datasets
- **Synthetic Data**: Generated realistic IT support scenarios  
- **Web Scraping**: Technical documentation and knowledge articles
- **Manual Input**: Custom knowledge base entries

## 🤖 Multi-Agent Architecture

### Specialized Agents

1. **Ticket Classifier Agent**
   - Categorizes tickets into predefined categories
   - Identifies subcategories and technical domains
   - Provides confidence scores and reasoning

2. **Priority Predictor Agent**
   - Assesses business impact and urgency
   - Estimates resolution timeframes
   - Considers user context and historical patterns

3. **Solution Recommender Agent**
   - Searches knowledge base for relevant solutions
   - Provides step-by-step troubleshooting guides
   - Ranks solutions by relevance and effectiveness

4. **Quality Assurance Agent**
   - Reviews and validates analysis results
   - Ensures completeness and accuracy
   - Provides quality metrics

## 📈 Analytics & Reporting

### Dashboard Metrics
- Total tickets analyzed
- Average processing time
- Classification accuracy
- Knowledge base size
- Category distribution
- Priority trends

### Available Reports
- Summary reports with key metrics
- Category analysis with deep insights  
- Trend analysis over time periods
- Performance analytics

## 🔍 Advanced Features

### RAG (Retrieval-Augmented Generation)
- Semantic search using Weaviate vector database
- Context-aware solution recommendations
- Knowledge base auto-expansion

### Model Flexibility  
- Multiple LLM providers with automatic fallbacks
- Local and cloud-based model support
- Performance optimization for different use cases

### Scalability
- Async FastAPI with high concurrency
- Containerized architecture  
- Horizontal scaling support
- Caching and optimization

## 🧪 Testing

Run the test suite to verify installation:

```bash
python scripts/test_installation.py
```

## 📚 Documentation

- **API Documentation**: Available at `/api/docs` when server is running
- **Model Documentation**: See `docs/models.md`
- **Deployment Guide**: See `docs/deployment.md`
- **Configuration Reference**: See `docs/configuration.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Issues**: GitHub Issues for bug reports and feature requests
- **Documentation**: Comprehensive docs in `/docs` directory
- **Examples**: Sample code in `/examples` directory

## 🎯 Roadmap

- [ ] Mobile app support
- [ ] Advanced ML model fine-tuning
- [ ] Integration with popular ITSM tools
- [ ] Advanced analytics with ML insights
- [ ] Multi-language support
- [ ] Voice-to-ticket conversion

---

**Built with ❤️ using FastAPI, CrewAI, Weaviate, and modern AI/ML technologies**
"""
    
    with open("README.md", "w") as f:
        f.write(readme_content)
    print("✅ Created comprehensive README.md")

def main():
    """Main setup function"""
    
    print("🚀 IT Ticket Analyzer Setup Script")
    print("===================================")
    
    # Create directory structure
    create_directory_structure()
    
    # Create configuration files  
    create_env_file()
    create_docker_files()
    
    # Create scripts
    create_init_script()
    create_run_scripts()
    create_test_script()
    
    # Create documentation
    create_readme()
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Edit .env file with your API keys and configuration")
    print("2. Install Ollama and pull models: ollama pull nomic-embed-text:latest && ollama pull gemma2:2b")
    print("3. Run: python scripts/initialize.py")
    print("4. Start the server: ./scripts/run_dev.sh")
    print("\nFor Docker deployment: docker-compose up -d")
    print("\nDocumentation: http://localhost:8000/api/docs")

if __name__ == "__main__":
    main()
