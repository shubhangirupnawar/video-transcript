# Project Structure & Documentation Guide

## 📚 Documentation Files

### For Users
| File | Purpose | Read Time |
|------|---------|-----------|
| [README.md](README.md) | Overview & features | 2 min |
| [QUICKSTART.md](QUICKSTART.md) | Get started in 2 minutes | 1 min |
| [SETUP.md](SETUP.md) | Detailed installation & troubleshooting | 5 min |

### For Developers  
| File | Purpose | Read Time |
|------|---------|-----------|
| [API.md](API.md) | API endpoints & examples | 5 min |
| [MODELS.md](MODELS.md) | Whisper model comparison & selection | 3 min |
| [FORMATS.md](FORMATS.md) | Supported file formats & exports | 3 min |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Code structure for AI agents | 10 min |

### Automation
| File | Purpose |
|------|---------|
| [start.sh](start.sh) | One-command startup script |

---

## 🚀 Quick Navigation

### "I just want to get started"
👉 [QUICKSTART.md](QUICKSTART.md)

### "I need detailed setup help"
👉 [SETUP.md](SETUP.md)

### "I want to understand the code"
👉 [IMPLEMENTATION.md](IMPLEMENTATION.md)

### "I need to call the API"
👉 [API.md](API.md)

### "Which model should I use?"
👉 [MODELS.md](MODELS.md)

### "What file formats are supported?"
👉 [FORMATS.md](FORMATS.md)

---

## 📋 One-Sentence Summary

**TranscribeX** = Upload video → Extract transcript with timestamps → Export as TXT/SRT

---

## ⚡ Start in 3 Steps

```bash
# Step 1: Verify prerequisites
python --version && node --version && ffmpeg -version

# Step 2: Start application
bash start.sh

# Step 3: Open browser
# → http://localhost:5173
```

---

## 🎯 Key Features

✅ Upload video/audio files  
✅ Automatic speech-to-text transcription  
✅ Timestamp-based segments  
✅ Export as TXT or SRT (subtitles)  
✅ Copy to clipboard  
✅ Works offline (no API key needed)  
✅ Supports 99+ languages  

---

## 🏗️ Technology Stack

**Frontend:** React + Vite  
**Backend:** FastAPI + Python  
**AI Engine:** OpenAI Whisper (local)  
**Audio Processing:** FFmpeg  
**Optional:** Supabase (database)

---

## 📖 Documentation Organization

### By User Type

**First-time Users:**
1. [README.md](README.md) - What is this?
2. [QUICKSTART.md](QUICKSTART.md) - How do I start?
3. [SETUP.md](SETUP.md) - Help, I'm stuck!

**Developers:**
1. [IMPLEMENTATION.md](IMPLEMENTATION.md) - How does it work?
2. [API.md](API.md) - How do I call it?
3. [MODELS.md](MODELS.md) + [FORMATS.md](FORMATS.md) - What are my options?

### By Task

**Get Started** → [QUICKSTART.md](QUICKSTART.md)  
**Troubleshoot** → [SETUP.md](SETUP.md)  
**Understand Code** → [IMPLEMENTATION.md](IMPLEMENTATION.md)  
**Build APIs** → [API.md](API.md)  
**Optimize Model Choice** → [MODELS.md](MODELS.md)  
**Handle File Formats** → [FORMATS.md](FORMATS.md)

---

## 💡 AI Agent Notes

For VS Code AI Agents implementing features:

1. **Read [IMPLEMENTATION.md](IMPLEMENTATION.md) first** - Explains code structure in agent-friendly format
2. **Then [API.md](API.md)** - Shows all endpoints & responses
3. **Check [MODELS.md](MODELS.md)** - For model selection logic
4. **Refer to [FORMATS.md](FORMATS.md)** - For export functionality

All written with clear step-by-step explanations for AI understanding.

---

## 📁 File Structure

```
vt-final/
├── 📖 README.md                # Main documentation
├── 📖 QUICKSTART.md            # 2-minute start
├── 📖 SETUP.md                 # Detailed setup
├── 📖 API.md                   # API reference
├── 📖 MODELS.md                # Model guide
├── 📖 FORMATS.md               # File formats
├── 📖 IMPLEMENTATION.md        # For AI agents
├── 📖 THIS_FILE                # Navigation guide
├── ⚙️  start.sh                # Startup script
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── ...
    ├── package.json
    └── vite.config.js
```

---

## 🔄 Workflow Summary

1. **User uploads video/audio** → Browser
2. **Frontend sends file to backend** → HTTP POST /transcribe  
3. **Backend extracts audio** → FFmpeg converts to WAV
4. **Transcription happens** → Whisper processes audio
5. **Results returned** → JSON with text + timestamps
6. **Frontend displays & exports** → Copy/TXT/SRT options

---

## 🎓 Learning Path

**Beginner (Just want to use it):**
- [README.md](README.md) (5 min)
- [QUICKSTART.md](QUICKSTART.md) (2 min)
- Done! 🎉

**Intermediate (Want to customize):**
- All of above
- [MODELS.md](MODELS.md) (3 min)
- [FORMATS.md](FORMATS.md) (3 min)

**Advanced (Want to extend/deploy):**
- All of above
- [IMPLEMENTATION.md](IMPLEMENTATION.md) (10 min)
- [API.md](API.md) (5 min)
- Ready to code! 🚀

---

## ✅ Verification Checklist

- [ ] Can I find the quick start? → [QUICKSTART.md](QUICKSTART.md)
- [ ] Can I find API docs? → [API.md](API.md)
- [ ] Can I find setup help? → [SETUP.md](SETUP.md)
- [ ] Can I find code explanation? → [IMPLEMENTATION.md](IMPLEMENTATION.md)
- [ ] Can I start the app? → `bash start.sh`

If all ✅, you're ready to go!

---

## 📞 Need Help?

1. **Getting started?** → [QUICKSTART.md](QUICKSTART.md)
2. **Installation errors?** → [SETUP.md](SETUP.md) → Troubleshooting
3. **How to call API?** → [API.md](API.md)
4. **Implementing features?** → [IMPLEMENTATION.md](IMPLEMENTATION.md)
5. **Which model to use?** → [MODELS.md](MODELS.md)
6. **File format questions?** → [FORMATS.md](FORMATS.md)
