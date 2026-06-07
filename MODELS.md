# Whisper Models Guide

## Overview

OpenAI Whisper provides 4 model sizes. Larger models = better accuracy but slower + more disk space.

---

## Model Comparison

| Model  | Size   | Speed     | Accuracy | RAM Needed | Best For                       |
|--------|--------|-----------|----------|------------|--------------------------------|
| tiny   | 75MB   | ⚡⚡⚡   | 60%      | 1 GB       | Quick testing, real-time       |
| base   | 142MB  | ⚡⚡     | 90%      | 2 GB       | **General use (recommended)**   |
| small  | 461MB  | ⚡       | 95%      | 4 GB       | Production, high accuracy      |
| medium | 1.5GB  | 🐢       | 99%      | 8 GB       | Best quality, complex audio    |

---

## Choosing a Model

### Use `tiny` when:
- Rapid prototyping
- Very limited resources
- Speed over accuracy matters
- Testing the app

### Use `base` when: (RECOMMENDED)
- General transcription
- Good balance of speed & accuracy
- Standard use case
- Not sure which to pick

### Use `small` when:
- Need better accuracy than `base`
- Have 4+ GB RAM available
- Don't mind waiting 2-3 minutes for processing

### Use `medium` when:
- Maximum accuracy required
- Have 8+ GB RAM available
- Willing to wait 5-10 minutes
- Complex audio (accents, background noise, multiple speakers)

---

## Language Support

All models support 99+ languages including:
- English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, Dutch, Polish, Turkish, Korean, Italian, Russian, Greek, and many more

Language is automatically detected from audio.

---

## Accuracy by Language

| Language | Accuracy |
|----------|----------|
| English  | Highest  |
| Spanish  | High     |
| French   | High     |
| Other    | Good     |

English has the best support due to training data.

---

## Performance Metrics

### Processing Time (Approximate)

**For 10-minute audio file:**
- tiny: 30 seconds
- base: 2 minutes
- small: 5 minutes
- medium: 10 minutes

**Actual time depends on:** CPU speed, RAM, audio quality, language

---

## GPU Support

If you have NVIDIA GPU with CUDA:

```bash
# Enable GPU (in backend directory)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

This speeds up processing by 5-10x, especially for larger models.

---

## Model Management

### View Downloaded Models
```bash
ls ~/.cache/whisper
```

### Manually Download Model
```python
import whisper
model = whisper.load_model('base')  # Downloads if not present
```

### Delete Model to Free Space
```bash
rm ~/.cache/whisper/base.pt
```

---

## Recommendations

- **Development:** Use `tiny` for quick testing
- **Production:** Use `base` for most use cases
- **Critical:** Use `small` or `medium` if accuracy is critical
- **Real-time:** Use `tiny` for streaming/live transcription
