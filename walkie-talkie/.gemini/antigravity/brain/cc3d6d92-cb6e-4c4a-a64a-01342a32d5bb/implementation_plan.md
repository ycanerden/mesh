# Granola Clone powered by AssemblyAI

Build a Next.js web application that serves as a beautiful, premium clone of Granola. The application will allow users to record audio via their browser, transcribe the audio using AssemblyAI, and automatically generate structured meeting notes (summaries, action items, etc.) using AssemblyAI's LeMUR framework.

## User Review Required

> [!IMPORTANT]
> - Is Next.js (App Router) + Vanilla CSS the stack you'd prefer for this web app, or would you like to build a desktop app (e.g., using Electron or Tauri)?
> - Do you already have an AssemblyAI API key handy to place in `.env.local`?
> - Let me know what specific aesthetics and layout elements from Granola you want to make sure we include.

## Proposed Changes

### 1. Initial Setup
Create a new Next.js project in `/Users/canerden/.gemini/antigravity/scratch/granola-clone`.
Install required dependencies like `assemblyai` and `lucide-react`.

### 2. Frontend UI (Components & Styles)
Build a sleek, native-feeling UI with dark mode, glassmorphism, and smooth animations using vanilla CSS.
- **Record Button & Waveform**: A dynamic recording interface.
- **Notes View**: A split-pane view (or seamless scroll) showing the transcription on one side and structured LeMUR notes on the other.

### 3. Audio Recording Logic
Implement a custom React hook `useAudioRecorder` utilizing the standard Web `MediaRecorder` API to capture standard `webm` audio blobs directly from the microphone.

### 4. API Routes (AssemblyAI Integration)
Create Next.js API routes (`/api/transcribe` and `/api/notes`) to:
1. Receive standard audio blobs and upload them directly to AssemblyAI via their Node.js SDK.
2. Wait for transcription completion and return the transcript.
3. Invoke AssemblyAI LeMUR (Large Language Model understood by AssemblyAI) to generate structured meeting notes based on the transcript.

## Verification Plan

### Automated Tests
- N/A for this initial MVP.

### Manual Verification
1. We will start the development server (`npm run dev`).
2. Visit `http://localhost:3000` locally.
3. Click the "Record" button, speak for 10-30 seconds mimicking a meeting.
4. Stop the recording.
5. Verify that the UI enters a "Processing..." state.
6. Verify that once complete, the transcript is accurate and the LeMUR notes extract key action items and a summary.
7. Review the UI to ensure it feels premium, fast, and visually stunning.
