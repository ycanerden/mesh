# Meeting Notes App - Walkthrough

A sleek, minimal meeting notes application inspired by Granola. Built with Vite + vanilla JavaScript.

## What Was Built

### Features Implemented
- ✅ **Audio Recording** - Captures microphone + tab audio (for meeting participants)
- ✅ **Live Note-Taking** - Rich text editor for draft notes during meetings
- ✅ **AI Transcription** - Groq Whisper API converts audio to text
- ✅ **AI Enhancement** - Groq Llama 3.1 8B enhances notes with meeting context
- ✅ **Notes History** - Saves and retrieves past meeting notes

### Tech Stack
- **Frontend**: Vite + Vanilla JavaScript
- **Styling**: Custom CSS with dark theme + glassmorphism
- **Audio**: Web Audio API + MediaRecorder
- **AI**: Groq API (Whisper + Llama 3.1 8B)

---

## Screenshots

### Meeting View
Shows the recording panel, notes editor, and action buttons:

![Meeting View](file:///Users/canerden/.gemini/antigravity/brain/1bee3dea-43cf-43d9-858d-24762b2be392/meeting_view_1770316879850.png)

### Settings Modal
Configure your Groq API key:

![Settings Modal](file:///Users/canerden/.gemini/antigravity/brain/1bee3dea-43cf-43d9-858d-24762b2be392/settings_modal_1770316891160.png)

---

## Demo Recording

![App Walkthrough](file:///Users/canerden/.gemini/antigravity/brain/1bee3dea-43cf-43d9-858d-24762b2be392/final_screenshots_1770316861403.webp)

---

## How to Use

### 1. Start the App
```bash
cd /Users/canerden/.gemini/antigravity/scratch/meeting-notes-app
npm run dev
```
Then open http://localhost:5173

### 2. Configure API Key
1. Click **Settings** (gear icon) in the sidebar
2. Enter your Groq API key (get one free at [console.groq.com](https://console.groq.com))
3. Click **Save Settings**

### 3. Record a Meeting
1. Click **New Meeting**
2. Click **Enable Mic** to capture your voice
3. Click **Share Tab Audio** and select your Google Meet tab to capture participants
4. Click **Start Recording**
5. Take notes in the editor while recording
6. Click **Stop Recording** when done

### 4. Transcribe & Enhance
1. Click **Transcribe Audio** - converts recording to text
2. Click **Enhance with AI** - AI enhances your notes with transcript context
3. Click **Save Note** to save

---

## Project Structure

```
meeting-notes-app/
├── index.html          # Main HTML
├── style.css           # Dark theme + glassmorphism
├── src/
│   ├── main.js             # App entry point
│   ├── api/groq.js         # Groq API client
│   ├── components/recorder.js  # Audio recording
│   └── utils/storage.js    # LocalStorage helpers
└── package.json
```

---

## Cost Estimate

Per 1-hour meeting:
- **Transcription**: ~$0.04 (Whisper Large V3 Turbo)
- **Enhancement**: ~$0.01 (Llama 3.1 8B)
- **Total**: ~$0.05/meeting

Groq's free tier covers several meetings per day.
