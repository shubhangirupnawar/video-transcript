# Setup Guide

## Prerequisites Check

Verify your system has:

```bash
# Check Python version (need 3.9+)
python --version

# Check Node.js version (need 18+)
node --version

# Check FFmpeg installation
ffmpeg -version
```

If FFmpeg is missing:
- **Windows (Chocolatey):** `choco install ffmpeg`
- **Windows (Manual):** Download from https://ffmpeg.org/download.html
- **macOS:** `brew install ffmpeg`
- **Linux:** `sudo apt install ffmpeg`

---

## Step 1: Clone or Navigate to Project

```bash
cd video-transcript-v3/vt-final
```

---

## Step 2: Setup Backend

```bash
cd backend
pip install -r requirements.txt
```

**What happens:** Downloads Python packages (FastAPI, Whisper, etc.)

---

## Step 3: Setup Frontend

```bash
cd ../frontend
npm install
```

**What happens:** Downloads Node.js dependencies (React, Vite, etc.)

---

## Step 4: Configure Environment (Optional)

```bash
cd ../backend
cp .env.example .env
# Edit .env with your API keys (optional - app works without them)
```

---

## Step 5: Start the Application

**Option A: Automated (Recommended)**
```bash
cd ..
bash start.sh
```

**Option B: Manual (Separate Terminals)**

Terminal 1 (Backend):
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

---

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)

---

## Troubleshooting

### Issue: "FFmpeg not found"
**Solution:** Install FFmpeg (see Prerequisites section above)

### Issue: "Port 8000 already in use"
**Solution:** Stop other processes or use different port:
```bash
uvicorn main:app --reload --port 8001
```

### Issue: "ModuleNotFoundError"
**Solution:** Ensure you're in `backend` directory and requirements.txt is installed:
```bash
cd backend
pip install -r requirements.txt
```

### Issue: "npm install fails"
**Solution:** Clear npm cache and retry:
```bash
npm cache clean --force
npm install
```

### Issue: Whisper models not downloading
**Solution:** First transcription attempt downloads model (~75MB for base). On first use, the app may seem to hang—this is normal. Wait 2-5 minutes.

To pre-download models:
```bash
python -c "import whisper; whisper.load_model('base')"
```

---

## Performance Tips

1. Use `tiny` model for quick testing
2. Use `base` model for good speed/accuracy balance (default)
3. Use `small` or `medium` for better accuracy if you have time
4. Close unnecessary apps to free up RAM

---

## Next Steps

- See **[API.md](API.md)** for API endpoint details
- See **[FORMATS.md](FORMATS.md)** for supported file types
