#!/bin/bash
# AgriGuard - Setup Script (Linux/macOS)

set -e

echo "========================================"
echo "   AgriGuard - Setup Script"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3.10+ from https://python.org"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "[OK] Python $PYTHON_VERSION found"
echo ""

# Setup backend
echo "Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
echo "[OK] Virtual environment created"

# Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt
echo "[OK] Backend dependencies installed"

# Copy .env if not already present
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Created backend/.env from template"
    echo ""
    echo "  ACTION REQUIRED: Open backend/.env and set your API key:"
    echo "    GROQ_API_KEY=<your key from https://console.groq.com>"
    echo "  (or GOOGLE_API_KEY from https://aistudio.google.com/app/apikey)"
fi

cd ..

# Setup frontend
echo ""
echo "Setting up frontend..."
cd frontend

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

npm install -q
echo "[OK] Frontend dependencies installed"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Created frontend/.env from template"
fi

cd ..

echo ""
echo "========================================"
echo "   Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env and add your free Groq API key:"
echo "       https://console.groq.com  (free, no credit card)"
echo ""
echo "  2. Start the backend:"
echo "       cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo ""
echo "  3. Start the frontend (in a new terminal):"
echo "       cd frontend && npm run dev"
echo ""
echo "  4. Open http://localhost:3000 in your browser"
echo ""
