#!/bin/bash
# TranscribeX — Startup Script
# Starts both backend (FastAPI) and frontend (Vite) automatically

set -e  # Exit on error

echo "🎬 Starting TranscribeX..."
echo ""

# Verify prerequisites
command -v python >/dev/null 2>&1 || { echo "❌ Python not found. Install Python 3.9+"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install Node.js 18+"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "❌ FFmpeg not found. See SETUP.md for installation"; exit 1; }

echo "✅ All prerequisites found"
echo ""

# Step 1: Install Python dependencies (if needed)
if [ ! -d "backend/venv" ]; then
    echo "📦 Installing Python dependencies..."
    cd backend
    python -m pip install -q -r requirements.txt 2>/dev/null || pip install -q -r requirements.txt
    cd ..
fi

# Step 2: Install Node dependencies (if needed)
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    cd frontend
    npm install -q 2>/dev/null
    cd ..
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Step 3: Start backend in background
echo "Starting backend (FastAPI)..."
cd backend
uvicorn main:app --reload --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend running (PID $BACKEND_PID) → http://localhost:8000"
else
    echo "❌ Backend failed to start. Check /tmp/backend.log"
    exit 1
fi
cd ..

# Step 4: Start frontend in background
echo "Starting frontend (Vite)..."
cd frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend running (PID $FRONTEND_PID) → http://localhost:5173"
else
    echo "❌ Frontend failed to start. Check /tmp/frontend.log"
    exit 1
fi
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ TranscribeX is ready!"
echo ""
echo "🌐 Open in browser: http://localhost:5173"
echo "📚 API docs: http://localhost:8000/docs"
echo ""
echo "⏹️  Press Ctrl+C to stop both servers"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    sleep 1
    echo "✅ Stopped"
}

trap cleanup EXIT

# Wait for processes
wait
