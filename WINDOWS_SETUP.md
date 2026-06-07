# Windows Setup Guide

If you're on Windows, follow this specific guide.

---

## Step 1: Install Prerequisites

### Python
1. Download: https://www.python.org/downloads/
2. **IMPORTANT:** Check "Add Python to PATH" during installation
3. Verify: Open PowerShell and run:
   ```powershell
   python --version
   ```

### Node.js
1. Download: https://nodejs.org/ (LTS version recommended)
2. Install normally
3. Verify: Open PowerShell and run:
   ```powershell
   node --version
   npm --version
   ```

### FFmpeg
Choose ONE method:

**Option A: Chocolatey (Easiest)**
```powershell
choco install ffmpeg
```

**Option B: Manual Download**
1. Go to https://ffmpeg.org/download.html
2. Download Windows build
3. Extract to `C:\ffmpeg`
4. Add to PATH:
   - Open Settings → Environment Variables
   - Click "Edit the system environment variables"
   - Click "Environment Variables..."
   - Select "Path" → Click "Edit..."
   - Click "New" → Add `C:\ffmpeg\bin`
   - Click OK on all windows

5. Verify: Open PowerShell and run:
   ```powershell
   ffmpeg -version
   ```

---

## Step 2: Navigate to Project

Open PowerShell and run:
```powershell
cd $env:USERPROFILE\Downloads\video-transcript-v3\vt-final
```

Or navigate manually:
1. Open File Explorer
2. Go to Downloads → video-transcript-v3 → vt-final
3. Right-click → "Open PowerShell here"

---

## Step 3: Install Dependencies

### Install Python packages
```powershell
cd backend
pip install -r requirements.txt
cd ..
```

**Wait for:** All packages install successfully (no errors in red)

### Install Node packages
```powershell
cd frontend
npm install
cd ..
```

**Wait for:** npm finishes (may take 1-2 minutes)

---

## Step 4: Start the Application

### Option A: Automated (Recommended)

If you have Git Bash or WSL:
```powershell
bash start.sh
```

### Option B: Manual (If Option A doesn't work)

Open TWO PowerShell windows:

**Window 1 (Backend):**
```powershell
cd backend
uvicorn main:app --reload --port 8000
```

**Window 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

---

## Step 5: Open in Browser

Go to: **http://localhost:5173**

---

## Windows-Specific Troubleshooting

### Error: "python command not found"

**Fix:**
1. Add Python to PATH (see Python installation above)
2. OR use full path: `C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe`
3. Restart PowerShell after adding to PATH

---

### Error: "pip command not found"

**Fix:**
```powershell
python -m pip install -r requirements.txt
```

---

### Error: "ffmpeg command not found"

**Fix:** Follow FFmpeg manual installation steps above (add to PATH)

---

### Error: "Port 8000 already in use"

**Find what's using port 8000:**
```powershell
netstat -ano | findstr :8000
```

**Kill the process** (replace PID with actual number):
```powershell
taskkill /PID <PID> /F
```

**Or use different port:**
```powershell
cd backend
uvicorn main:app --reload --port 8001
```

Then update frontend to use port 8001:
- Open `frontend/src/App.jsx`
- Find: `http://localhost:8000`
- Change to: `http://localhost:8001`

---

### Error: "npm install fails"

**Fix:**
```powershell
npm cache clean --force
npm install
```

---

### Error: "Cannot find module" or other Node errors

**Fix:**
```powershell
cd frontend
rm -r node_modules
npm install
npm run dev
```

---

### Whisper Model Hangs on First Use

**Why:** Model downloads (~75-1500 MB depending on size) on first transcription attempt

**Solution:** Wait 5-10 minutes on first use. This is normal.

---

## Useful Windows PowerShell Commands

```powershell
# Check Python version
python --version

# Check Node version
node --version

# Check if port is in use
netstat -ano | findstr :8000

# Kill process
taskkill /PID <number> /F

# Change directory
cd <path>

# List files
dir

# Go back one folder
cd ..

# Open current folder in File Explorer
explorer .
```

---

## Quick Checklist

- [ ] Python installed & in PATH? (`python --version` works)
- [ ] Node.js installed? (`node --version` works)
- [ ] FFmpeg installed? (`ffmpeg -version` works)
- [ ] In project folder? (vt-final)
- [ ] Backend dependencies installed? (backend/requirements.txt)
- [ ] Frontend dependencies installed? (frontend/node_modules exists)
- [ ] Both services running? (Backend on 8000, Frontend on 5173)
- [ ] Can open http://localhost:5173? ✅

---

## If Still Stuck

1. Check [SETUP.md](SETUP.md) for general troubleshooting
2. Check error messages carefully (they usually tell you what's wrong)
3. Try the manual setup (Option B above) instead of start.sh
4. Verify each prerequisite individually:
   ```powershell
   python --version
   node --version
   npm --version
   ffmpeg -version
   ```

All should show version numbers. If any say "not found", reinstall that tool.

---

## Pro Tips for Windows Users

### Use Windows Terminal (instead of PowerShell)
- Better display, faster, more features
- Download from Microsoft Store (search "Windows Terminal")

### Keep two terminals open
- Terminal 1: Backend (don't close while using app)
- Terminal 2: Frontend (don't close while using app)

### Make batch file for one-click start (Advanced)
Create file: `start.bat`
```batch
@echo off
echo Starting TranscribeX...
cd backend
start cmd /k "uvicorn main:app --reload --port 8000"
cd ../frontend
start cmd /k "npm run dev"
cd ..
echo Done! Open http://localhost:5173
```

Save in vt-final folder. Double-click to start everything.

---

## Next Steps

- Upload a video file and test the transcription
- See [FORMATS.md](FORMATS.md) for export options
- See [MODELS.md](MODELS.md) for faster/better transcription choices
