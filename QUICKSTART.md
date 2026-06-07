# Quick Start (2 Minutes)

## Step 1: Check Prerequisites

```bash
python --version        # Need 3.9+
node --version          # Need 18+
ffmpeg -version         # Should be installed
```

If any are missing → See [SETUP.md](SETUP.md)

---

## Step 2: Start Application

```bash
cd vt-final
bash start.sh
```

**Wait for:**
```
✅ Backend running → http://localhost:8000
✅ Frontend running → http://localhost:5173
```

---

## Step 3: Open in Browser

Click or paste: **http://localhost:5173**

---

## Step 4: Use It

1. Click "Choose File" button
2. Select a video or audio file
3. Click "Transcribe"
4. Wait for result (1-2 min for base model, first time takes longer)
5. Copy, Download as TXT, or Download as SRT

---

## Done! 🎉

**Next:**
- See [MODELS.md](MODELS.md) to learn about model choices
- See [FORMATS.md](FORMATS.md) for export options
- See [API.md](API.md) for programmatic access

---

## Troubleshooting

### "Port 8000 already in use"
Open [SETUP.md](SETUP.md) → Troubleshooting section

### "Waiting for first transcription (takes longer)"
This is normal. Whisper model downloads on first use (~75 MB). Wait 2-5 minutes.

### Other issues
See [SETUP.md](SETUP.md) → Troubleshooting section
