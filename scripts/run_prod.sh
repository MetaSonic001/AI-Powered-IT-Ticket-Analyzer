#!/bin/bash
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
