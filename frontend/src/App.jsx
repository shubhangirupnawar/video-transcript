import { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:8000'

const WHISPER_MODELS = [
  { id: 'tiny',   label: 'Tiny',   note: 'Fastest' },
  { id: 'base',   label: 'Base',   note: 'Balanced' },
  { id: 'small',  label: 'Small',  note: 'Accurate' },
  { id: 'medium', label: 'Medium', note: 'Best' },
]

const SARVAM_LANGS = [
  { code: 'unknown', label: 'Auto Detect' },
  { code: 'hi-IN',   label: 'Hindi' },
  { code: 'mr-IN',   label: 'Marathi' },
  { code: 'en-IN',   label: 'English (India)' },
  { code: 'bn-IN',   label: 'Bengali' },
  { code: 'ta-IN',   label: 'Tamil' },
  { code: 'te-IN',   label: 'Telugu' },
  { code: 'kn-IN',   label: 'Kannada' },
  { code: 'gu-IN',   label: 'Gujarati' },
  { code: 'pa-IN',   label: 'Punjabi' },
  { code: 'ml-IN',   label: 'Malayalam' },
]

const STEPS = [
  { n: '01', label: 'Upload' },
  { n: '02', label: 'Extract Audio' },
  { n: '03', label: 'Whisper + Sarvam' },
  { n: '04', label: 'Compare' },
]

const fmt     = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`
const fmtSize = (b) => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`
const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : ''

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button className="action-btn" onClick={() => {
      navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000)
    }}>{done ? '✓' : '⎘'} Copy</button>
  )
}

function EnginePanel({ data, color }) {
  const [activeSeg, setActiveSeg] = useState(null)
  if (!data) return null

  const isWhisper = data.engine === 'whisper'
  const hasError  = !!data.error

  const dlTxt = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([data.full_text], { type: 'text/plain' }))
    a.download = `${data.engine}_transcript.txt`; a.click()
  }
  const dlSRT = () => {
    if (!data.segments?.length) return
    const pad = (n,l=2) => String(n).padStart(l,'0')
    const ts  = (s) => `${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(Math.floor(s%60))},${pad(Math.round((s%1)*1000),3)}`
    const srt = data.segments.map((s,i) => `${i+1}\n${ts(s.start)} --> ${ts(s.end)}\n${s.text}\n`).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([srt], { type: 'text/plain' }))
    a.download = `${data.engine}_transcript.srt`; a.click()
  }

  return (
    <div className="engine-panel" style={{'--engine-color': color}}>
      {/* Header */}
      <div className="engine-header">
        <div className="engine-title-row">
          <div className="engine-name">
            <span className="engine-dot" />
            <span className="engine-label">{isWhisper ? '🤖 Whisper' : '🇮🇳 Sarvam'}</span>
            <span className="engine-model">{data.model}</span>
          </div>
          {!hasError && (
            <div className="engine-actions">
              <CopyBtn text={data.full_text} />
              <button className="action-btn" onClick={dlTxt}>↓ TXT</button>
              <button className="action-btn" onClick={dlSRT}>↓ SRT</button>
            </div>
          )}
        </div>
        {!hasError && (
          <div className="engine-meta">
            {data.language && <span className="meta-chip">🌐 {data.language.toUpperCase()}</span>}
            {data.duration_seconds > 0 && <span className="meta-chip">⏱ {fmt(data.duration_seconds)}</span>}
            {data.segments?.length > 0 && <span className="meta-chip">📝 {data.segments.length} segs</span>}
            <span className="meta-chip">⚡ {data.elapsed_seconds}s</span>
          </div>
        )}
      </div>

      {hasError ? (
        <div className="engine-error">⚠ {data.error}</div>
      ) : (
        <>
          {/* Full Text */}
          <div className="engine-section">
            <div className="section-label">FULL TEXT</div>
            <div className="full-text">{data.full_text || <span className="muted">No output</span>}</div>
          </div>

          {/* Segments */}
          {data.segments?.length > 0 && (
            <div className="engine-section">
              <div className="section-label">SEGMENTS</div>
              <div className="segments-list">
                {data.segments.map(seg => (
                  <div key={seg.id}
                    className={`segment ${activeSeg === seg.id ? 'active' : ''}`}
                    onClick={() => setActiveSeg(activeSeg === seg.id ? null : seg.id)}
                  >
                    <div className="seg-time">
                      <span>{fmt(seg.start)}</span><span className="seg-arrow">→</span><span>{fmt(seg.end)}</span>
                    </div>
                    <div className="seg-text">{seg.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function App() {
  const [tab, setTab]               = useState('new')
  const [file, setFile]             = useState(null)
  const [whisperModel, setWhisperModel] = useState('base')
  const [langCode, setLangCode]     = useState('unknown')
  const [status, setStatus]         = useState('idle')
  const [activeStep, setActiveStep] = useState(0)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')
  const [dragging, setDragging]     = useState(false)
  const [history, setHistory]       = useState([])
  const [histLoad, setHistLoad]     = useState(false)
  const [selJob, setSelJob]         = useState(null)
  const [srvStatus, setSrvStatus]   = useState(null)
  const fileInput = useRef(null)

  useEffect(() => {
    fetch(`${API}/`).then(r => r.json()).then(d => setSrvStatus(d)).catch(() => {})
  }, [])

  const handleFile = (f) => {
    if (!f) return
    setFile(f); setResult(null); setError(''); setStatus('idle'); setActiveStep(0)
  }
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0])
  }, [])

  const loadHistory = async () => {
    setHistLoad(true)
    try { const r = await fetch(`${API}/history`); const d = await r.json(); setHistory(d.jobs || []) }
    catch { setHistory([]) }
    finally { setHistLoad(false) }
  }
  useEffect(() => { if (tab === 'history') loadHistory() }, [tab])

  const transcribe = async () => {
    if (!file) return
    setError(''); setResult(null); setStatus('running'); setActiveStep(1)
    const form = new FormData()
    form.append('file', file)
    try {
      setActiveStep(2)
      await new Promise(r => setTimeout(r, 400))
      setActiveStep(3)
      const res = await fetch(`${API}/transcribe?whisper_model=${whisperModel}&language_code=${langCode}`, { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Failed') }
      const data = await res.json()
      setResult(data); setStatus('done'); setActiveStep(4)
    } catch (e) {
      setError(e.message); setStatus('error'); setActiveStep(0)
    }
  }

  const delJob = async (id) => {
    await fetch(`${API}/history/${id}`, { method: 'DELETE' })
    setHistory(h => h.filter(j => j.id !== id))
    if (selJob?.id === id) setSelJob(null)
  }

  const isProcessing = status === 'running'

  return (
    <div className="app">
      <div className="bg-grid" /><div className="bg-glow" />

      <header className="header">
        <div className="logo">
          <span className="logo-icon">▶</span>
          <span className="logo-text">TRANSCRIBE<span className="logo-accent">X</span></span>
        </div>
        <div className="header-right">
          <p className="header-sub">Whisper vs Sarvam STT · Side-by-Side Compare</p>
          <div className="status-badges">
            {srvStatus && <>
              <span className={`badge ${srvStatus.sarvam?.includes('ready') ? 'badge-on' : 'badge-off'}`}>
                🇮🇳 Sarvam {srvStatus.sarvam?.includes('ready') ? 'ON' : 'OFF'}
              </span>
              <span className={`badge ${srvStatus.supabase === 'connected' ? 'badge-on' : 'badge-off'}`}>
                🗄 Supabase {srvStatus.supabase === 'connected' ? 'ON' : 'OFF'}
              </span>
            </>}
          </div>
        </div>
      </header>

      <div className="tab-bar">
        <button className={`tab-btn ${tab==='new'?'active':''}`} onClick={()=>setTab('new')}>＋ New</button>
        <button className={`tab-btn ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>◷ History</button>
      </div>

      <main className="main">
        {tab === 'new' && (<>
          {/* Pipeline */}
          <div className="pipeline">
            {STEPS.map((step, i) => (
              <div key={i} className={`step ${activeStep > i ? 'done' : ''} ${activeStep === i+1 ? 'active' : ''}`}>
                <div className="step-num">{activeStep > i ? '✓' : step.n}</div>
                <div className="step-label">{step.label}</div>
                {i < STEPS.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          {/* Config row */}
          <div className="config-row">
            {/* Upload */}
            <div className="config-card">
              <label className="config-label">VIDEO / AUDIO</label>
              <div className={`dropzone ${dragging?'dragging':''} ${file?'has-file':''}`}
                onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDragging(true)}}
                onDragLeave={()=>setDragging(false)} onClick={()=>fileInput.current?.click()}>
                <input ref={fileInput} type="file" accept="video/*,audio/*" style={{display:'none'}}
                  onChange={e=>handleFile(e.target.files[0])} />
                {file ? (
                  <div className="file-info">
                    <span className="file-icon">🎬</span>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-meta">{fmtSize(file.size)}</span>
                    </div>
                    <button className="file-clear" onClick={e=>{e.stopPropagation();setFile(null);setResult(null);setStatus('idle');setActiveStep(0)}}>✕</button>
                  </div>
                ) : (<>
                  <div className="drop-icon">⬆</div>
                  <p className="drop-sub">MP4 · MOV · MP3 · WAV · M4A</p>
                  <span className="drop-btn">Browse</span>
                </>)}
              </div>
            </div>

            {/* Whisper config */}
            <div className="config-card">
              <label className="config-label">🤖 WHISPER MODEL</label>
              <div className="model-grid">
                {WHISPER_MODELS.map(m => (
                  <button key={m.id} className={`model-btn ${whisperModel===m.id?'selected':''}`} onClick={()=>setWhisperModel(m.id)}>
                    <span className="model-id">{m.label}</span>
                    <span className="model-note">{m.note}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sarvam config */}
            <div className="config-card">
              <label className="config-label">🇮🇳 SARVAM LANGUAGE</label>
              <select className="lang-select" value={langCode} onChange={e=>setLangCode(e.target.value)}>
                {SARVAM_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <div className="sarvam-info">
                <span className="info-chip">Model: saaras:v3</span>
                <span className="info-chip">Mode: transcribe</span>
              </div>
              {srvStatus?.sarvam?.includes('disabled') && (
                <div className="warn-small">Set SARVAM_API_KEY in .env to enable</div>
              )}
            </div>

            {/* Action */}
            <div className="config-card config-action">
              <button className={`transcribe-btn ${isProcessing?'processing':''}`}
                onClick={transcribe} disabled={!file||isProcessing}>
                {isProcessing
                  ? <><span className="spinner"/>{activeStep===2?'Extracting Audio...':'Running STT...'}</>
                  : <>▶ Transcribe<br/><small>Whisper + Sarvam</small></>}
              </button>
              {status === 'done' && <div className="success-box">✓ Done!</div>}
              {error && <div className="error-box">⚠ {error}</div>}
            </div>
          </div>

          {/* Compare output */}
          {result ? (
            <div className="compare-area">
              <div className="compare-header">
                <span className="compare-title">COMPARISON RESULTS</span>
                <span className="compare-file">🎬 {result.filename}</span>
              </div>
              <div className="compare-grid">
                <EnginePanel data={result.whisper} color="#7c5cfc" />
                <EnginePanel data={result.sarvam}  color="#00e5c3" />
              </div>
            </div>
          ) : (
            <div className="empty-compare">
              <div className="empty-engines">
                <div className="empty-engine-box" style={{'--c':'#7c5cfc'}}>
                  <span>🤖</span><p>Whisper</p><p className="muted">Local · Offline</p>
                </div>
                <div className="vs-badge">VS</div>
                <div className="empty-engine-box" style={{'--c':'#00e5c3'}}>
                  <span>🇮🇳</span><p>Sarvam</p><p className="muted">saaras:v3 · API</p>
                </div>
              </div>
              <p className="empty-sub">Upload a video and click Transcribe to compare</p>
            </div>
          )}
        </>)}

        {tab === 'history' && (
          <div className="history-layout">
            <section className="panel history-list">
              <div className="panel-title-row">
                <h2 className="panel-title">PAST JOBS</h2>
                <button className="action-btn" onClick={loadHistory}>↻</button>
              </div>
              {!srvStatus?.supabase?.includes('connected') && (
                <div className="warn-box">⚠ Supabase not connected. Set SUPABASE_URL + SUPABASE_KEY in .env</div>
              )}
              {histLoad
                ? <div className="empty-state"><span className="spinner"/></div>
                : history.length === 0
                  ? <div className="empty-state"><div className="empty-icon">◎</div><p className="empty-sub">No history yet</p></div>
                  : <div className="job-list">
                      {history.map(job => (
                        <div key={job.id}
                          className={`job-card ${selJob?.id===job.id?'selected':''} ${job.status}`}
                          onClick={()=>setSelJob(selJob?.id===job.id?null:job)}>
                          <div className="job-card-top">
                            <span className="job-filename">{job.filename}</span>
                            <div className="job-actions">
                              <span className={`job-status status-${job.status}`}>{job.status}</span>
                              <button className="del-btn" onClick={e=>{e.stopPropagation();delJob(job.id)}}>✕</button>
                            </div>
                          </div>
                          <div className="job-meta">
                            <span>🤖 {job.whisper_model}</span>
                            {job.language && <span>🌐 {job.language.toUpperCase()}</span>}
                            <span>🕐 {fmtDate(job.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>}
            </section>

            <section className="panel history-detail">
              <h2 className="panel-title">DETAIL</h2>
              {selJob?.status === 'done' && selJob.whisper_result ? (
                <div className="compare-grid">
                  <EnginePanel data={selJob.whisper_result} color="#7c5cfc" />
                  <EnginePanel data={selJob.sarvam_result}  color="#00e5c3" />
                </div>
              ) : selJob ? (
                <div className="empty-state"><p>Status: {selJob.status}</p></div>
              ) : (
                <div className="empty-state"><div className="empty-icon">◎</div><p className="empty-sub">Select a job</p></div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="footer">FastAPI · Whisper (local) · Sarvam saaras:v3 (API) · Supabase · Vite · React</footer>
    </div>
  )
}
