# Meeting Notes App (Granola Clone) - Implementation Plan

A minimal, sleek web app for recording meetings, taking notes, and enhancing them with AI.

## Overview

Build a Granola-inspired meeting notes application that captures both microphone and system audio (for participant voices in Google Meet, etc.), allows users to take draft notes, then uses AI to transcribe the audio and enhance the notes with meeting context.

### Core Features (MVP)
1. **Audio Recording** - Capture mic + system audio during meetings
2. **Live Note-Taking** - Simple text editor for draft notes
3. **AI Transcription** - Convert audio to text via Groq Whisper API
4. **AI Enhancement** - Enhance draft notes using Groq LLM
5. **Notes History** - View and manage past meeting notes

### Tech Stack
- **Frontend**: Vite + Vanilla JS (fast, minimal)
- **Styling**: Custom CSS with modern design (dark mode, glassmorphism)
- **Audio**: Web Audio API + MediaRecorder
- **AI**: Groq API (Whisper for transcription, Llama 3.1 8B for enhancement - cheapest options)

---

## User Review Required

> [!IMPORTANT]
> **Audio Recording Limitation**: Browser-based system audio capture requires the user to share a tab/screen via `getDisplayMedia()`. This is a browser security requirement - unlike Granola's native Mac app which can capture audio directly. The UX will be: "Share your Google Meet tab to capture participant audio."

> [!NOTE]
> **API Key Storage**: For MVP, the Groq API key will be stored in browser localStorage. This is acceptable for personal use but should be moved to a backend for production.

---

## Proposed Changes

### Project Structure

```
meeting-notes-app/
├── index.html          # Main entry point
├── style.css           # Global styles + design system
├── src/
│   ├── main.js         # App initialization
│   ├── components/
│   │   ├── recorder.js     # Audio recording logic
│   │   ├── editor.js       # Note-taking editor
│   │   ├── transcription.js # Groq Whisper integration
│   │   ├── enhancer.js     # Groq LLM note enhancement
│   │   └── history.js      # Meeting notes list
│   ├── utils/
│   │   ├── audio.js        # Audio utilities
│   │   └── storage.js      # LocalStorage helpers
│   └── api/
│       └── groq.js         # Groq API client
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

---

### UI/UX Design

#### [NEW] [index.html](file:///Users/canerden/.gemini/antigravity/scratch/meeting-notes-app/index.html)

Main HTML structure with:
- Sidebar for meeting notes history
- Main panel with:
  - Recording controls (start/stop, audio indicators)
  - Live note-taking editor
  - Action buttons (transcribe, enhance)
- Settings modal for API key

#### [NEW] [style.css](file:///Users/canerden/.gemini/antigravity/scratch/meeting-notes-app/style.css)

Premium dark-mode design featuring:
- Deep dark background with subtle gradients
- Glassmorphism cards with blur effects
- Smooth animations and transitions
- Green "dancing bars" animation during recording (Granola-style)
- Inter font family for modern typography

---

### Audio Recording Component

#### [NEW] [recorder.js](file:///Users/canerden/.gemini/antigravity/scratch/meeting-notes-app/src/components/recorder.js)

Handles audio capture:
- **Microphone capture**: `getUserMedia({ audio: true })`
- **System audio capture**: `getDisplayMedia({ audio: true, video: true })` (Chrome requires video for tab audio)
- **Stream merging**: Combine mic + tab audio using `AudioContext`
- **Recording**: `MediaRecorder` API to capture as WebM/Opus
- **Chunk handling**: Collect audio chunks for later processing

---

### Groq API Integration

#### [NEW] [groq.js](file:///Users/canerden/.gemini/antigravity/scratch/meeting-notes-app/src/api/groq.js)

API client for Groq services:

**Transcription endpoint**:
- Model: `whisper-large-v3-turbo` ($0.04/hour - best value)
- Input: Audio file (max 25MB for free tier)
- Output: Transcribed text

**Enhancement endpoint**:
- Model: `llama-3.1-8b-instant` ($0.05/M input, $0.08/M output - cheapest LLM)
- Input: Draft notes + transcript
- Output: Enhanced, structured notes with action items

---

### Note Editor Component

#### [NEW] [editor.js](file:///Users/canerden/.gemini/antigravity/scratch/meeting-notes-app/src/components/editor.js)

Simple markdown-style editor:
- Contenteditable div or textarea
- Auto-save to localStorage
- Keyboard shortcuts (Ctrl+S to save)
- Placeholder text when empty

---

### Enhancement Prompt

The AI enhancement will use this prompt approach:

```
You are a meeting notes assistant. Enhance the user's draft notes using context from the transcript.

Draft Notes:
{user_notes}

Meeting Transcript:
{transcript}

Create well-organized meeting notes that:
1. Incorporate the user's draft notes as anchors
2. Add relevant context from the transcript
3. Identify action items and mark them with "⚡ ACTION:"
4. Highlight key decisions with "✓ DECISION:"
5. Keep it concise but comprehensive
```

---

## Verification Plan

### Automated Tests

No automated tests for MVP - focus on manual verification due to browser API dependencies (audio, screen capture).

### Manual Verification

**1. Audio Recording Test**
1. Navigate to `http://localhost:5173`
2. Click "Start Recording" button
3. Grant microphone permission when prompted
4. Click "Share Tab Audio" and select a Chrome tab playing audio (e.g., YouTube)
5. Speak into microphone and play tab audio for ~10 seconds
6. Click "Stop Recording"
7. ✅ Verify: Recording indicator stops, audio blob is created

**2. Transcription Test**
1. After recording, enter your Groq API key in settings
2. Click "Transcribe" button
3. ✅ Verify: Loading indicator shows, transcript appears within ~5-10 seconds

**3. Note Enhancement Test**
1. Type some draft notes in the editor
2. Click "Enhance with AI" button
3. ✅ Verify: Notes are enhanced with transcript context, action items highlighted

**4. Notes History Test**
1. After completing a meeting note, verify it appears in the sidebar
2. Click on a past note
3. ✅ Verify: Note content loads correctly

---

## Cost Estimation

For a 1-hour meeting:
- **Transcription**: ~$0.04 (whisper-large-v3-turbo)
- **Enhancement**: ~$0.01 (llama-3.1-8b with ~10K tokens)
- **Total**: ~$0.05 per meeting

With Groq's free tier limits, you can process several meetings per day at no cost.
