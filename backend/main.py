import os
import uuid
import subprocess
import tempfile
import asyncio
import time
from pathlib import Path
from datetime import datetime

import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure ffmpeg is in PATH (in case terminal wasn't restarted)
ffmpeg_winget_path = r"C:\Users\ABHIJEET RUPNAWAR\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
if os.path.exists(ffmpeg_winget_path) and ffmpeg_winget_path not in os.environ["PATH"]:
    os.environ["PATH"] += os.pathsep + ffmpeg_winget_path

# ── Supabase (optional) ───────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase connected")
else:
    print("⚠️  Supabase not configured — running without DB")

if SARVAM_API_KEY:
    print("✅ Sarvam API key found")
else:
    print("⚠️  SARVAM_API_KEY not set — Sarvam STT disabled")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Video Transcript API — Whisper + Sarvam")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(tempfile.gettempdir()) / "video_transcripts"
UPLOAD_DIR.mkdir(exist_ok=True)

SUPPORTED_VIDEO = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv", ".m4v"}
SUPPORTED_AUDIO = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac"}
MAX_FILE_SIZE   = 500 * 1024 * 1024
SARVAM_MAX_BYTES = 25 * 1024 * 1024   # Sarvam REST: ~30s / 25MB limit

# ── Supabase helpers ──────────────────────────────────────────────────────────
def db_insert(job_id, filename, whisper_model):
    if not supabase: return
    supabase.table("transcripts").insert({
        "id": job_id, "filename": filename,
        "whisper_model": whisper_model, "status": "processing",
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

def db_update(job_id, data):
    if not supabase: return
    supabase.table("transcripts").update(
        {**data, "updated_at": datetime.utcnow().isoformat()}
    ).eq("id", job_id).execute()

def db_all():
    if not supabase: return []
    res = supabase.table("transcripts").select("*").order("created_at", desc=True).execute()
    return res.data or []

def db_one(job_id):
    if not supabase: return None
    res = supabase.table("transcripts").select("*").eq("id", job_id).single().execute()
    return res.data

# ── Audio extract ─────────────────────────────────────────────────────────────
def extract_audio(video_path: str, audio_path: str):
    cmd = ["ffmpeg", "-y", "-i", video_path,
           "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg error: {r.stderr[:500]}")

# ── Whisper transcription ─────────────────────────────────────────────────────
def run_whisper(audio_path: str, model_size: str = "base") -> dict:
    import whisper
    t0 = time.time()
    m  = whisper.load_model(model_size)
    raw = m.transcribe(audio_path, verbose=False)
    elapsed = round(time.time() - t0, 2)

    segments = [
        {"id": s["id"], "start": round(s["start"], 2),
         "end": round(s["end"], 2), "text": s["text"].strip()}
        for s in raw.get("segments", [])
    ]
    return {
        "engine":   "whisper",
        "model":    model_size,
        "language": raw.get("language", "unknown"),
        "full_text": raw["text"].strip(),
        "segments": segments,
        "duration_seconds": segments[-1]["end"] if segments else 0,
        "elapsed_seconds":  elapsed,
    }

# ── Sarvam transcription ──────────────────────────────────────────────────────
async def run_sarvam(audio_path: str, language_code: str = "unknown") -> dict:
    """
    POST to https://api.sarvam.ai/speech-to-text
    Uses saaras:v3 (latest model).
    Max ~30s audio per request — for longer files we chunk & merge.
    """
    if not SARVAM_API_KEY:
        return {
            "engine": "sarvam",
            "model":  "saaras:v3",
            "error":  "SARVAM_API_KEY not set",
            "full_text": "", "segments": [],
            "language": "", "duration_seconds": 0, "elapsed_seconds": 0,
        }

    t0 = time.time()
    url = "https://api.sarvam.ai/speech-to-text"
    headers = {"api-subscription-key": SARVAM_API_KEY}

    file_size = os.path.getsize(audio_path)

    # If file is small enough → single request
    if file_size <= SARVAM_MAX_BYTES:
        chunks = [audio_path]
    else:
        # Split into 25-second chunks using ffmpeg
        chunks = _split_audio(audio_path)

    all_transcripts = []
    all_words: list = []
    detected_lang = language_code

    async with httpx.AsyncClient(timeout=120) as client:
        for i, chunk_path in enumerate(chunks):
            with open(chunk_path, "rb") as f:
                audio_bytes = f.read()

            files   = {"file": (Path(chunk_path).name, audio_bytes, "audio/wav")}
            payload = {
                "model":         "saaras:v3",
                "language_code": language_code,
                "mode":          "transcribe",
            }
            resp = await client.post(url, headers=headers, data=payload, files=files)

            if resp.status_code == 200:
                data = resp.json()
                text = data.get("transcript", "").strip()
                all_transcripts.append(text)
                if data.get("language_code"):
                    detected_lang = data["language_code"]
                # collect word timestamps if present
                ts = data.get("timestamps", {})
                words     = ts.get("words", [])
                starts    = ts.get("start_time_seconds", [])
                ends      = ts.get("end_time_seconds", [])
                # offset by chunk number × 25s
                offset = i * 25
                for w, s, e in zip(words, starts, ends):
                    all_words.append({
                        "word":  w,
                        "start": round(s + offset, 2),
                        "end":   round(e + offset, 2),
                    })
            else:
                all_transcripts.append(f"[Chunk {i+1} error: {resp.status_code}]")

    # Clean up chunk files (not the original)
    if len(chunks) > 1:
        for c in chunks:
            try: os.remove(c)
            except: pass

    full_text = " ".join(all_transcripts).strip()
    duration  = all_words[-1]["end"] if all_words else 0

    # Build segments from word timestamps (group every ~5 words)
    segments = _words_to_segments(all_words)

    elapsed = round(time.time() - t0, 2)
    return {
        "engine":           "sarvam",
        "model":            "saaras:v3",
        "language":         detected_lang,
        "full_text":        full_text,
        "segments":         segments,
        "duration_seconds": duration,
        "elapsed_seconds":  elapsed,
    }


def _split_audio(audio_path: str, chunk_secs: int = 25) -> list[str]:
    """Split WAV into N-second chunks, return list of paths."""
    base = audio_path.replace(".wav", "")
    pattern = f"{base}_chunk_%03d.wav"
    cmd = ["ffmpeg", "-y", "-i", audio_path,
           "-f", "segment", "-segment_time", str(chunk_secs),
           "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
           pattern]
    subprocess.run(cmd, capture_output=True)
    chunks = sorted(Path(audio_path).parent.glob("*_chunk_*.wav"))
    return [str(c) for c in chunks] if chunks else [audio_path]


def _words_to_segments(words: list, group: int = 8) -> list:
    """Group word-level timestamps into sentence-like segments."""
    if not words:
        return []
    segments = []
    for i in range(0, len(words), group):
        batch = words[i:i+group]
        text  = " ".join(w["word"] for w in batch)
        segments.append({
            "id":    i // group,
            "start": batch[0]["start"],
            "end":   batch[-1]["end"],
            "text":  text,
        })
    return segments

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {
        "status":  "ok",
        "supabase": "connected" if supabase else "disabled",
        "sarvam":  "ready" if SARVAM_API_KEY else "disabled (no API key)",
    }

@app.get("/models")
def list_models():
    return {"whisper_models": [
        {"id": "tiny",   "label": "Tiny",   "note": "Fastest, ~75MB"},
        {"id": "base",   "label": "Base",   "note": "Balanced, ~142MB"},
        {"id": "small",  "label": "Small",  "note": "Accurate, ~461MB"},
        {"id": "medium", "label": "Medium", "note": "Best, ~1.5GB"},
    ]}

@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    whisper_model: str = Query(default="base"),
    language_code: str = Query(default="unknown"),
):
    suffix   = Path(file.filename).suffix.lower()
    is_video = suffix in SUPPORTED_VIDEO
    is_audio = suffix in SUPPORTED_AUDIO

    if not is_video and not is_audio:
        raise HTTPException(400, f"Unsupported file type '{suffix}'")
    if whisper_model not in {"tiny", "base", "small", "medium"}:
        raise HTTPException(400, "Invalid whisper_model.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large. Max 500 MB.")

    job_id  = str(uuid.uuid4())
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir()

    db_insert(job_id, file.filename, whisper_model)

    input_path = str(job_dir / f"input{suffix}")
    with open(input_path, "wb") as f:
        f.write(content)

    try:
        # Step 2 — extract audio
        if is_video:
            audio_path = str(job_dir / "audio.wav")
            extract_audio(input_path, audio_path)
        else:
            audio_path = input_path

        # Step 3 — run Whisper + Sarvam in parallel
        loop = asyncio.get_event_loop()
        whisper_future = loop.run_in_executor(None, run_whisper, audio_path, whisper_model)
        sarvam_future  = run_sarvam(audio_path, language_code)

        whisper_result, sarvam_result = await asyncio.gather(whisper_future, sarvam_future)

        # Step 4 — save to Supabase
        db_update(job_id, {
            "status":         "done",
            "whisper_result": whisper_result,
            "sarvam_result":  sarvam_result,
            "language":       whisper_result.get("language", ""),
        })

        return JSONResponse({
            "job_id":   job_id,
            "filename": file.filename,
            "whisper":  whisper_result,
            "sarvam":   sarvam_result,
        })

    except Exception as e:
        db_update(job_id, {"status": "error", "error_message": str(e)})
        raise HTTPException(500, str(e))
    finally:
        import shutil
        shutil.rmtree(job_dir, ignore_errors=True)


@app.get("/history")
def history():
    return {"jobs": db_all()}

@app.get("/history/{job_id}")
def history_one(job_id: str):
    job = db_one(job_id)
    if not job: raise HTTPException(404, "Not found")
    return job

@app.delete("/history/{job_id}")
def delete_job(job_id: str):
    if not supabase: raise HTTPException(503, "Supabase not configured")
    supabase.table("transcripts").delete().eq("id", job_id).execute()
    return {"deleted": job_id}
