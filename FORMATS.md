# Supported Formats & Export Options

## Input Formats

### Video Files
MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V

**File Size:** Max 500 MB

**Examples:**
- `lecture.mp4`
- `interview.mov`
- `podcast.mkv`

### Audio Files
MP3, WAV, M4A, OGG, FLAC, AAC

**Examples:**
- `song.mp3`
- `recording.wav`
- `podcast.m4a`

---

## Audio Specifications

All files are automatically converted to:
- **Sample Rate:** 16 kHz
- **Channels:** Mono
- **Codec:** Linear PCM (WAV)

No manual conversion needed. FFmpeg handles everything.

---

## Output Formats

### 1. Copy to Clipboard
**Format:** Plain text  
**Use:** Quick sharing, pasting into docs  
**Action:** Click "Copy" button in UI

```
Hello, this is a test. Welcome to TranscribeX.
This is the second sentence.
```

---

### 2. Download as TXT
**Format:** Plain text file  
**Use:** Simple text format, editing  
**Action:** Click "Download TXT" button

**File:** `transcript.txt`
```
Hello, this is a test. Welcome to TranscribeX.
This is the second sentence.
```

---

### 3. Download as SRT
**Format:** SubRip subtitle format  
**Use:** Video players, YouTube, subtitle syncing  
**Action:** Click "Download SRT" button

**File:** `transcript.srt`
```
1
00:00:00,000 --> 00:00:02,400
Hello, this is a test.

2
00:00:02,400 --> 00:00:04,800
Welcome to TranscribeX.

3
00:00:04,800 --> 00:00:06,200
This is the second sentence.
```

**Compatible with:**
- VLC Media Player
- ffmpeg
- YouTube Studio (upload as captions)
- Any video editor
- Most streaming platforms

---

## SRT Format Details

### Structure
```
[sequence number]
[start time] --> [end time]
[subtitle text]
[blank line]
```

### Time Format
- Hours: 00 (00-23)
- Minutes: 00 (00-59)
- Seconds: 00 (00-59)
- Milliseconds: 000 (000-999)

### Example
```
1
00:01:23,456 --> 00:01:27,890
This subtitle starts at 1 minute, 23.456 seconds
and ends at 1 minute, 27.890 seconds

2
00:01:28,000 --> 00:01:32,500
Next subtitle with proper timing
```

---

## JSON API Response

The backend also returns structured JSON (for programmatic access):

```json
{
  "full_text": "Complete transcript as one string",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 2.4,
      "text": "First segment text"
    },
    {
      "id": 1,
      "start": 2.4,
      "end": 5.8,
      "text": "Second segment text"
    }
  ],
  "language": "en",
  "duration_seconds": 45.2
}
```

**Use:** Custom processing, automation, API integration

---

## File Size Limits

| File Type | Max Size |
|-----------|----------|
| Video     | 500 MB   |
| Audio     | 500 MB   |

**Workaround:** Split large files into chunks using FFmpeg

---

## Recommendations

- **Casual use:** Use TXT
- **Video integration:** Use SRT
- **Programmatic:** Use JSON (API)
- **Quick share:** Use Clipboard

---

## Conversion Examples

### Batch Convert SRT to VTT (for WebVideo)
```bash
ffmpeg -i transcript.srt transcript.vtt
```

### Extract Audio for Local Processing
```bash
ffmpeg -i video.mp4 -q:a 0 -map a audio.mp3
```

### Convert Between Audio Formats
```bash
ffmpeg -i audio.mp3 audio.wav
```
