# 🎬 TranscribeX — Video Transcript Extractor

Extract transcripts from videos automatically using AI. Upload a video, get a transcript with timestamps—in seconds.

**Tech Stack:** React + Vite | FastAPI | OpenAI Whisper (local) | FFmpeg

---

## ⚡ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- FFmpeg

### One-Command Setup

```bash
bash start.sh
```

Then open http://localhost:5173

**That's it!** The backend (port 8000) and frontend (port 5173) start automatically.

---

## 📋 How It Works

1. **Upload** → Video file to frontend
2. **Extract** → Audio extracted and converted (FFmpeg)
3. **Transcribe** → Local Whisper processes audio
4. **Display** → Full text + timestamps in UI
5. **Export** → Copy/Download as TXT or SRT

---

## 🔧 Manual Setup (If Needed)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** — Detailed setup & troubleshooting
- **[API.md](API.md)** — API endpoints & responses
- **[MODELS.md](MODELS.md)** — Whisper model comparison
- **[FORMATS.md](FORMATS.md)** — Supported file formats & export options

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and update values:

```bash
cd backend
cp .env.example .env
```

Optional APIs: Supabase, Sarvam STT (app works without them)

---

## 📦 Output Formats

✅ **Text** — Full transcript as plain text  
✅ **SRT** — Subtitle format with timestamps  
✅ **Clipboard** — Quick copy-paste

---

## 🚀 Performance

| Model  | Size  | Speed   | Accuracy | Use Case              |
|--------|-------|---------|----------|---------------------- |
| tiny   | 75MB  | ⚡⚡⚡  | Basic    | Quick preview         |
| base   | 142MB | ⚡⚡   | Good     | **Default (recommended)** |
| small  | 461MB | ⚡     | Better   | Better accuracy       |
| medium | 1.5GB | 🐢     | Best     | Maximum precision     |
