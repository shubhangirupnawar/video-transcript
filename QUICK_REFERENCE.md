# Quick Reference Card

## 🎬 What is TranscribeX?

Upload video → Extract transcript → Export as TXT/SRT

---

## ⚡ Start in 3 Steps

```bash
# Step 1: Verify tools
python --version && node --version && ffmpeg -version

# Step 2: Start application  
cd vt-final && bash start.sh

# Step 3: Open browser
# → http://localhost:5173
```

**Done in 5 minutes!** 🎉

---

## 📚 Documentation Quick Links

### I want to...
- **Get started** → [QUICKSTART.md](QUICKSTART.md)
- **Understand setup** → [SETUP.md](SETUP.md) or [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
- **Understand code** → [IMPLEMENTATION.md](IMPLEMENTATION.md)
- **Use the API** → [API.md](API.md)
- **Choose a model** → [MODELS.md](MODELS.md)
- **Export formats** → [FORMATS.md](FORMATS.md)

### I'm on...
- **Windows** → [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
- **Mac/Linux** → [SETUP.md](SETUP.md)

---

## 🔧 Common Commands

```bash
# Start everything
bash start.sh

# Start backend only (port 8000)
cd backend && uvicorn main:app --reload --port 8000

# Start frontend only (port 5173)
cd frontend && npm run dev

# Check API docs (when backend running)
open http://localhost:8000/docs

# Kill port if stuck
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000
```

---

## 📋 Architecture in 30 Seconds

```
VIDEO UPLOAD
     ↓
FFmpeg (extract audio)
     ↓
Whisper (transcribe)
     ↓
JSON Response
     ↓
Export (TXT / SRT / Copy)
```

---

## 🎯 Models at a Glance

| Need | Use | Speed | Size |
|------|-----|-------|------|
| Quick test | tiny | ⚡⚡⚡ | 75MB |
| **Normal use** | **base** | **⚡⚡** | **142MB** |
| Better accuracy | small | ⚡ | 461MB |
| Best quality | medium | 🐢 | 1.5GB |

**Recommended: Use `base` (default)**

---

## 📤 Export Formats

| Format | Use | Download |
|--------|-----|----------|
| Copy | Quick share | Click "Copy" |
| TXT | Plain text | Click "Download TXT" |
| SRT | Subtitles | Click "Download SRT" |

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Port 8000 used" | Use different port: `--port 8001` |
| "FFmpeg not found" | Install: `brew install ffmpeg` or `choco install ffmpeg` |
| "First transcription hangs" | **Wait 5 min** - downloading model (normal) |
| "npm install fails" | `npm cache clean --force && npm install` |
| "Python not found" | Reinstall Python, check "Add to PATH" |

See [SETUP.md](SETUP.md) for more troubleshooting

---

## 🔌 API Quick Start

```bash
# Transcribe video
curl -X POST "http://localhost:8000/transcribe" \
  -F "file=@video.mp4" \
  -F "model=base"

# Get available models
curl "http://localhost:8000/models"
```

Response:
```json
{
  "full_text": "...",
  "segments": [{...}],
  "language": "en",
  "duration_seconds": 45.2
}
```

See [API.md](API.md) for complete reference

---

## ✅ Prerequisites

- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ FFmpeg installed
- ✅ 2 GB RAM minimum
- ✅ 2+ GB disk space

---

## 🎓 Learning Paths

### Path 1: Just Use It (5 min)
README → QUICKSTART → Go! ✅

### Path 2: Full Setup (20 min)
README → SETUP → QUICKSTART → Go! ✅

### Path 3: Develop (45 min)
README → SETUP → IMPLEMENTATION → API → Ready! ✅

### Path 4: Windows Setup (20 min)
README → WINDOWS_SETUP → QUICKSTART → Go! ✅

---

## 💡 Pro Tips

1. **First transcription takes longer** (model downloads)
2. **Use `tiny` model for testing** (fastest)
3. **Use `base` model normally** (best balance)
4. **Check API docs:** http://localhost:8000/docs
5. **Keep backend running** while using app
6. **SRT format works** in VLC, YouTube, etc.

---

## 📞 Need More Help?

| Question | Answer |
|----------|--------|
| How to start? | [QUICKSTART.md](QUICKSTART.md) |
| Setup issues? | [SETUP.md](SETUP.md) |
| Windows help? | [WINDOWS_SETUP.md](WINDOWS_SETUP.md) |
| API details? | [API.md](API.md) |
| Model info? | [MODELS.md](MODELS.md) |
| File formats? | [FORMATS.md](FORMATS.md) |
| Code explanation? | [IMPLEMENTATION.md](IMPLEMENTATION.md) |
| Doc index? | [DOCS_GUIDE.md](DOCS_GUIDE.md) |

---

## 🔗 Key URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **GitHub:** (add if applicable)

---

## 📊 File Support

**Video:** MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V  
**Audio:** MP3, WAV, M4A, OGG, FLAC, AAC  
**Max Size:** 500 MB  
**Languages:** 99+ (auto-detected)

---

## 🎯 Tech Stack

```
Frontend: React + Vite
Backend: FastAPI + Python  
AI: OpenAI Whisper (local)
Audio: FFmpeg
Optional: Supabase
```

---

## ✨ Status

✅ Documented  
✅ Professional  
✅ AI-friendly  
✅ Cross-platform  
✅ Production-ready  

---

**Quick Start:** `bash start.sh` then open http://localhost:5173

**Questions?** See [DOCS_MAP.md](DOCS_MAP.md) for full navigation
