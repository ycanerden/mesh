# Helper - Meeting Assistant

**Helper** is your local-first meeting assistant. It runs directly in your browser (Chrome recommended) to record meetings, transcribe them, and generate beautiful summaries using AI.

## Features
- **Simple & Fast**: A distraction-free editor with the "Inter" font.
- **Microphone + System Audio**: Record yourself and other participants (via Tab/Screen share).
- **AI Powered**:
    - **Transcription**: Groq (**Whisper Large V3**).
    - **Summarization**: Google **Gemini 2.5 Flash** (2026 Model).
    - **Reliability**: Auto-retry logic for rate limits.
    - **Zero Config**: Your keys are pre-loaded!

## How to Use (Web App)
1. **Open the App**: Go to [http://localhost:3000](http://localhost:3000).
2. **Start a Meeting**:
    - Click **Record**.
    - **Permission Prompt**: Chrome will ask to use your microphone. Click **Allow**.
    - **System Audio**: A "Choose what to share" window will appear.
        - Select **"Chrome Tab"** (best for Google Meet/Zoom web) or **"Entire Screen"**.
        - **Critical**: Make sure **"Also share tab audio"** (or System Audio) is ticked.
3. **Take Notes**: Type while you talk.
4. **Finish**:
    - Click **Stop**.
    - Watch as your notes are magically enhanced using Gemini 2.5.

## Deployment / GitHub
The code is live at: [https://github.com/ycanerden/notetakertest](https://github.com/ycanerden/notetakertest)

### Local Development
```bash
git clone https://github.com/ycanerden/notetakertest.git
cd notetakertest
npm install
npm run dev
```

## Troubleshooting
- **No System Audio?**: Make sure you selected a Tab/Window with the "Share Audio" checkbox enabled.
- **Permissions**: If blocked, check the "lock" icon in the Chrome URL bar and reset permissions.
- **Rate Limits**: If usage is high, the "Retry" logic will kick in automatically. Just wait a few seconds.
