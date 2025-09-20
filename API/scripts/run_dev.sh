#!/bin/bash
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
