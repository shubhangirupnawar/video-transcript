# API Reference

## Base URL
```
http://localhost:8000
```

## Authentication
Currently no authentication required. (Optional: Add via environment variables)

---

## Endpoints

### 1. Transcribe Video/Audio

**Endpoint:** `POST /transcribe`

**Description:** Upload a video or audio file and get transcript with timestamps.

**Request:**
```bash
curl -X POST "http://localhost:8000/transcribe" \
  -F "file=@myvideo.mp4" \
  -F "model=base"
```

**Parameters:**
| Name  | Type   | Default | Required | Description                              |
|-------|--------|---------|----------|------------------------------------------|
| file  | File   | —       | Yes      | Video/audio file (max 500 MB)            |
| model | string | base    | No       | Whisper model: tiny/base/small/medium    |

**Response (200 OK):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "myvideo.mp4",
  "language": "en",
  "model": "base",
  "full_text": "Hello, this is a test. Welcome to TranscribeX.",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 2.4,
      "text": "Hello, this is a test."
    },
    {
      "id": 1,
      "start": 2.4,
      "end": 4.8,
      "text": "Welcome to TranscribeX."
    }
  ],
  "duration_seconds": 45.2
}
```

**Response Fields:**
- `job_id` — Unique transaction ID
- `filename` — Uploaded file name
- `language` — Detected language code (e.g., "en", "es", "fr")
- `model` — Model used for transcription
- `full_text` — Complete transcript as single string
- `segments` — Array of timestamped text segments
- `duration_seconds` — Total audio duration

---

### 2. List Available Models

**Endpoint:** `GET /models`

**Description:** Get list of available Whisper models.

**Request:**
```bash
curl "http://localhost:8000/models"
```

**Response (200 OK):**
```json
{
  "models": ["tiny", "base", "small", "medium"]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "No file provided"
}
```

### 413 Payload Too Large
```json
{
  "detail": "File too large (max 500 MB)"
}
```

### 415 Unsupported Media Type
```json
{
  "detail": "File format not supported"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error processing file: [error message]"
}
```

---

## Example Requests

### Python
```python
import requests

files = {'file': open('video.mp4', 'rb')}
data = {'model': 'base'}
response = requests.post('http://localhost:8000/transcribe', files=files, data=data)
print(response.json())
```

### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('file', document.getElementById('file-input').files[0]);
formData.append('model', 'base');

const response = await fetch('http://localhost:8000/transcribe', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### cURL
```bash
curl -X POST "http://localhost:8000/transcribe" \
  -F "file=@video.mp4" \
  -F "model=base"
```

---

## Rate Limiting

No rate limiting currently implemented. Adjust based on server capacity.

---

## API Documentation

View interactive API docs at: http://localhost:8000/docs (Swagger UI)
