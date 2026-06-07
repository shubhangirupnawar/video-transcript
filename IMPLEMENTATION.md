# Implementation Guide for AI Agents

This document explains the codebase structure in a format optimized for AI understanding and implementation.

---

## Architecture Overview

```
User Browser (React)
      ↓ (HTTP POST /transcribe)
FastAPI Backend
      ↓ (Extract audio + process)
FFmpeg (Extract WAV)
      ↓
Whisper (Transcribe)
      ↓ (Return JSON)
React Frontend
      ↓ (Display + Export)
User (Copy/Download TXT/SRT)
```

---

## Project Structure

```
vt-final/
├── backend/
│   ├── main.py                 # FastAPI app, /transcribe endpoint
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables (optional APIs)
│
├── frontend/
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite config
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── App.css             # Styling
│   │   └── main.jsx            # Entry point
│   └── public/                 # Static files
│
├── README.md                   # Main documentation
├── SETUP.md                    # Detailed setup guide
├── QUICKSTART.md               # 2-minute start guide
├── API.md                      # API reference
├── MODELS.md                   # Model comparison
├── FORMATS.md                  # File formats
├── start.sh                    # Automated startup script
└── supabase_schema.sql         # Optional database schema
```

---

## Backend Workflow

### Endpoint: `POST /transcribe`

**Step 1: Receive File**
```python
@app.post("/transcribe")
async def transcribe(file: UploadFile, model: str = "base"):
    # Input: file (binary), model (string)
    # Validation: check file size (<500MB), file type
```

**Step 2: Extract Audio**
```python
# Use FFmpeg to convert to WAV 16kHz mono
# Command: ffmpeg -i input.mp4 -acodec pcm_s16le -ar 16000 -ac 1 output.wav
```

**Step 3: Transcribe with Whisper**
```python
import whisper
model_instance = whisper.load_model(model)  # 'tiny', 'base', 'small', 'medium'
result = model_instance.transcribe(audio_path)
# Returns: {'text': '...', 'segments': [...], 'language': '...'} 
```

**Step 4: Return JSON**
```python
return {
    "job_id": "uuid",
    "filename": "original_filename.mp4",
    "language": "detected_language",
    "model": "model_used",
    "full_text": "Complete transcript...",
    "segments": [
        {"id": 0, "start": 0.0, "end": 2.4, "text": "First part..."},
        {"id": 1, "start": 2.4, "end": 5.8, "text": "Second part..."}
    ],
    "duration_seconds": 45.2
}
```

---

## Frontend Workflow

### React Component: `App.jsx`

**Step 1: File Input**
```jsx
<input type="file" onChange={handleFileChange} accept="video/*,audio/*" />
```

**Step 2: Submit to Backend**
```jsx
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('model', selectedModel);

const response = await fetch('http://localhost:8000/transcribe', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Step 3: Display Results**
```jsx
// Show:
// - Full transcript (data.full_text)
// - Segments with timestamps (data.segments)
// - Language (data.language)
// - Duration (data.duration_seconds)
```

**Step 4: Export Options**

**Option A: Copy to Clipboard**
```jsx
navigator.clipboard.writeText(data.full_text);
```

**Option B: Download as TXT**
```jsx
const blob = new Blob([data.full_text], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
// Trigger download as "transcript.txt"
```

**Option C: Download as SRT (Subtitle Format)**
```jsx
const srtContent = data.segments
  .map(seg => `${seg.id}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text}`)
  .join('\n\n');
// Download as "transcript.srt"
```

---

## Key Technology Decisions

### Why FastAPI?
- Lightweight, fast
- Built-in API documentation (/docs)
- Easy async handling
- Simple multipart file upload

### Why Whisper (Local)?
- No API key needed
- Privacy (data stays local)
- No rate limiting
- Works offline
- Costs nothing

### Why FFmpeg?
- Converts ANY audio format to standard 16kHz WAV
- Works cross-platform (Windows/Mac/Linux)
- Extracts audio from video files
- Lightweight and reliable

### Why React + Vite?
- Fast development
- Vite hot reload
- Modern tooling
- Easy UI for file upload + results display

---

## Adding New Features

### Add New Whisper Model Option

**Frontend (App.jsx):**
```jsx
<select onChange={(e) => setModel(e.target.value)}>
  <option value="tiny">Tiny (Fast)</option>
  <option value="base">Base (Recommended)</option>
  <option value="small">Small (Better)</option>
  <option value="medium">Medium (Best)</option>
  <option value="large">Large (Highest) // ADD HERE</option>
</select>
```

**Backend (main.py):**
- No changes needed. Whisper automatically supports "large" model
- It will auto-download on first use

### Add Progress Tracking

**Backend:**
```python
@app.post("/transcribe")
async def transcribe(file, model):
    # After file upload
    emit_progress(10)  # 10% complete
    
    # After FFmpeg extraction
    emit_progress(30)  # 30% complete
    
    # After Whisper processing
    emit_progress(90)  # 90% complete
    
    # Return result
    emit_progress(100)  # 100% complete
```

**Frontend:**
```jsx
const eventSource = new EventSource('/progress/' + job_id);
eventSource.onmessage = (e) => {
  const progress = JSON.parse(e.data);
  setProgressBar(progress.percent);
};
```

### Add Database Storage (Supabase)

See `supabase_schema.sql` for schema.

```python
# In backend/main.py, after transcription:
from supabase import create_client
db = create_client(SUPABASE_URL, SUPABASE_KEY)

db.table('transcripts').insert({
  'job_id': job_id,
  'filename': filename,
  'full_text': full_text,
  'language': language,
  'created_at': datetime.now()
}).execute()
```

---

## Environment Variables

**Backend (.env file):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SARVAM_API_KEY=optional-for-indian-languages
```

All are optional. App works without them.

---

## Error Handling Strategy

**File Upload Errors:**
- Check file size (max 500 MB)
- Validate file type (video/audio only)
- Return 413 if too large
- Return 415 if unsupported format

**Processing Errors:**
- FFmpeg might fail (corrupt file, unsupported codec)
- Whisper might fail (insufficient memory)
- Return 500 with error message

**Frontend Error Handling:**
```jsx
try {
  const response = await fetch('/transcribe', { method: 'POST', body: formData });
  if (!response.ok) {
    const error = await response.json();
    setError(error.detail);  // Show error to user
  }
} catch (e) {
  setError('Network error: ' + e.message);
}
```

---

## Performance Optimization Tips

1. **Model Selection:** tiny (fast) → base → small → medium (slower)
2. **Concurrent Requests:** Use async/await in FastAPI
3. **Caching:** Cache downloaded Whisper models
4. **GPU:** Enable CUDA for 5-10x speedup
5. **Audio Quality:** Lower quality → faster processing

---

## Testing Checklist

- [ ] Test with MP4 video file
- [ ] Test with MP3 audio file
- [ ] Test with unsupported format (should fail)
- [ ] Test with file >500 MB (should fail)
- [ ] Test all Whisper models (tiny, base, small, medium)
- [ ] Test all export formats (Copy, TXT, SRT)
- [ ] Test with different languages
- [ ] Test API with curl/Postman
- [ ] Test with slow network (simulate latency)

---

## Debugging

**Backend Logs:**
```bash
cd backend
uvicorn main:app --reload --port 8000 --log-level debug
```

**Frontend Issues:**
```bash
cd frontend
npm run dev  # Vite auto-shows errors
# Open browser console (F12) for frontend errors
```

**API Testing:**
```bash
# In another terminal:
curl -X POST "http://localhost:8000/transcribe" \
  -F "file=@test.mp4" \
  -F "model=tiny"
```

---

## Deployment Checklist

- [ ] Update `SUPABASE_URL` and keys in `.env`
- [ ] Set `--reload` to false in uvicorn (production)
- [ ] Build frontend: `npm run build`
- [ ] Serve frontend with nginx/Apache
- [ ] Run backend with gunicorn (not uvicorn)
- [ ] Set up reverse proxy (nginx)
- [ ] Enable CORS properly
- [ ] Set rate limiting
- [ ] Monitor disk space (models + uploaded files)
