// Main Application Entry Point
import { AudioRecorder } from './components/recorder.js';
import { transcribeAudio, enhanceNotes, getApiKey, setApiKey, hasApiKey } from './api/groq.js';
import { getAllNotes, getNote, saveNote, createNewNote, formatDate } from './utils/storage.js';

// State
let currentNote = null;
let recorder = null;
let recordingStartTime = null;
let recordingTimer = null;
let audioBlob = null;

// DOM Elements
const elements = {
  // State containers
  welcomeState: document.getElementById('welcome-state'),
  meetingState: document.getElementById('meeting-state'),

  // Buttons
  newMeetingBtn: document.getElementById('new-meeting-btn'),
  welcomeNewMeetingBtn: document.getElementById('welcome-new-meeting-btn'),
  settingsBtn: document.getElementById('settings-btn'),
  startMicBtn: document.getElementById('start-mic-btn'),
  shareTabBtn: document.getElementById('share-tab-btn'),
  recordBtn: document.getElementById('record-btn'),
  transcribeBtn: document.getElementById('transcribe-btn'),
  enhanceBtn: document.getElementById('enhance-btn'),
  saveBtn: document.getElementById('save-btn'),

  // Recording UI
  meetingTitle: document.getElementById('meeting-title'),
  recordingTime: document.getElementById('recording-time'),
  micStatus: document.getElementById('mic-status'),
  tabStatus: document.getElementById('tab-status'),
  recordingIndicator: document.getElementById('recording-indicator'),

  // Editor
  editor: document.getElementById('editor'),

  // Panels
  transcriptPanel: document.getElementById('transcript-panel'),
  transcriptContent: document.getElementById('transcript-content'),
  toggleTranscript: document.getElementById('toggle-transcript'),

  // Notes list
  notesListItems: document.getElementById('notes-list-items'),

  // Modal
  settingsModal: document.getElementById('settings-modal'),
  closeSettings: document.getElementById('close-settings'),
  groqApiKey: document.getElementById('groq-api-key'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),

  // Loading
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingText: document.getElementById('loading-text'),
};

// Initialize
function init() {
  recorder = new AudioRecorder();
  setupEventListeners();
  loadNotesList();
  loadApiKey();

  // Set up recorder callbacks
  recorder.onRecordingStart = () => {
    elements.recordBtn.classList.add('recording');
    elements.recordBtn.innerHTML = '<span class="record-icon"></span>Stop Recording';
    elements.recordingIndicator.classList.remove('hidden');
    startTimer();
  };

  recorder.onRecordingStop = (blob) => {
    audioBlob = blob;
    elements.recordBtn.classList.remove('recording');
    elements.recordBtn.innerHTML = '<span class="record-icon"></span>Start Recording';
    elements.recordingIndicator.classList.add('hidden');
    stopTimer();

    // Enable transcribe button
    elements.transcribeBtn.disabled = false;
  };

  recorder.onError = (message) => {
    showError(message);
  };
}

// Event Listeners
function setupEventListeners() {
  // New meeting buttons
  elements.newMeetingBtn.addEventListener('click', startNewMeeting);
  elements.welcomeNewMeetingBtn.addEventListener('click', startNewMeeting);

  // Recording controls
  elements.startMicBtn.addEventListener('click', handleMicClick);
  elements.shareTabBtn.addEventListener('click', handleTabClick);
  elements.recordBtn.addEventListener('click', handleRecordClick);

  // Actions
  elements.transcribeBtn.addEventListener('click', handleTranscribe);
  elements.enhanceBtn.addEventListener('click', handleEnhance);
  elements.saveBtn.addEventListener('click', handleSave);

  // Editor
  elements.editor.addEventListener('input', () => {
    if (currentNote) {
      currentNote.content = elements.editor.innerText;
    }
  });

  elements.meetingTitle.addEventListener('input', () => {
    if (currentNote) {
      currentNote.title = elements.meetingTitle.value || 'Untitled Meeting';
    }
  });

  // Panels
  elements.toggleTranscript.addEventListener('click', () => {
    elements.transcriptPanel.classList.toggle('hidden');
    elements.toggleTranscript.textContent =
      elements.transcriptPanel.classList.contains('hidden') ? 'Show' : 'Hide';
  });

  // Settings
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.closeSettings.addEventListener('click', closeSettings);
  elements.settingsModal.querySelector('.modal-backdrop').addEventListener('click', closeSettings);
  elements.saveSettingsBtn.addEventListener('click', saveSettings);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  });
}

// Start new meeting
function startNewMeeting() {
  currentNote = createNewNote();
  audioBlob = null;

  // Reset UI
  elements.welcomeState.classList.add('hidden');
  elements.meetingState.classList.remove('hidden');
  elements.meetingTitle.value = '';
  elements.editor.innerText = '';
  elements.recordingTime.textContent = '00:00:00';
  elements.micStatus.textContent = 'Off';
  elements.micStatus.classList.remove('active');
  elements.tabStatus.textContent = 'Off';
  elements.tabStatus.classList.remove('active');
  elements.recordBtn.disabled = true;
  elements.transcribeBtn.disabled = true;
  elements.enhanceBtn.disabled = true;
  elements.transcriptPanel.classList.add('hidden');

  // Reset recorder
  if (recorder) {
    recorder.cleanup();
  }
  recorder = new AudioRecorder();
  recorder.onRecordingStart = () => {
    elements.recordBtn.classList.add('recording');
    elements.recordBtn.innerHTML = '<span class="record-icon"></span>Stop Recording';
    elements.recordingIndicator.classList.remove('hidden');
    startTimer();
  };
  recorder.onRecordingStop = (blob) => {
    audioBlob = blob;
    elements.recordBtn.classList.remove('recording');
    elements.recordBtn.innerHTML = '<span class="record-icon"></span>Start Recording';
    elements.recordingIndicator.classList.add('hidden');
    stopTimer();
    elements.transcribeBtn.disabled = false;
  };
  recorder.onError = showError;
}

// Handle microphone button
async function handleMicClick() {
  if (recorder.hasMicrophone()) {
    // Already enabled, do nothing
    return;
  }

  elements.startMicBtn.disabled = true;
  elements.startMicBtn.textContent = 'Enabling...';

  const success = await recorder.enableMicrophone();

  if (success) {
    elements.micStatus.textContent = 'Ready';
    elements.micStatus.classList.add('active');
    elements.startMicBtn.textContent = 'Mic Enabled ✓';
  } else {
    elements.startMicBtn.disabled = false;
    elements.startMicBtn.textContent = 'Enable Mic';
  }

  updateRecordButton();
}

// Handle tab audio button
async function handleTabClick() {
  if (recorder.hasTabAudio()) {
    return;
  }

  elements.shareTabBtn.disabled = true;
  elements.shareTabBtn.textContent = 'Sharing...';

  const success = await recorder.enableTabAudio();

  if (success) {
    elements.tabStatus.textContent = 'Ready';
    elements.tabStatus.classList.add('active');
    elements.shareTabBtn.textContent = 'Tab Shared ✓';
  } else {
    elements.shareTabBtn.disabled = false;
    elements.shareTabBtn.textContent = 'Share Tab Audio';
  }

  updateRecordButton();
}

// Update record button state
function updateRecordButton() {
  const hasAudio = recorder.hasMicrophone() || recorder.hasTabAudio();
  elements.recordBtn.disabled = !hasAudio;
}

// Handle record button
async function handleRecordClick() {
  if (recorder.isRecording) {
    recorder.stopRecording();
  } else {
    await recorder.startRecording();
  }
}

// Start timer
function startTimer() {
  recordingStartTime = Date.now();
  recordingTimer = setInterval(updateTimer, 1000);
}

// Stop timer
function stopTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
}

// Update timer display
function updateTimer() {
  const elapsed = Date.now() - recordingStartTime;
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  elements.recordingTime.textContent =
    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Handle transcription
async function handleTranscribe() {
  if (!audioBlob) {
    showError('No audio recorded yet.');
    return;
  }

  if (!hasApiKey()) {
    openSettings();
    showError('Please add your Groq API key first.');
    return;
  }

  showLoading('Transcribing audio...');

  try {
    const transcript = await transcribeAudio(audioBlob);
    currentNote.transcript = transcript;

    elements.transcriptContent.textContent = transcript;
    elements.transcriptPanel.classList.remove('hidden');
    elements.toggleTranscript.textContent = 'Hide';
    elements.enhanceBtn.disabled = false;

    hideLoading();
  } catch (error) {
    hideLoading();
    showError(error.message);
  }
}

// Handle enhancement
async function handleEnhance() {
  if (!currentNote.transcript) {
    showError('Please transcribe the audio first.');
    return;
  }

  if (!hasApiKey()) {
    openSettings();
    showError('Please add your Groq API key first.');
    return;
  }

  showLoading('Enhancing notes with AI...');

  try {
    const enhanced = await enhanceNotes(currentNote.content, currentNote.transcript);
    currentNote.enhanced = enhanced;

    hideLoading();

    // Trigger typewriter effect in the main editor
    await typewriterEffect(elements.editor, enhanced);

    // Update internal state
    currentNote.content = enhanced;
    handleSave(); // Auto-save after enhancement

  } catch (error) {
    hideLoading();
    showError(error.message);
  }
}

/**
 * Typewriter effect for rewriting notes
 */
async function typewriterEffect(element, text, speed = 10) {
  element.classList.add('writing');
  element.innerText = '';

  // Split by small chunks/words for better feel
  const chunks = text.split(/(\s+)/);
  let currentText = '';

  for (const chunk of chunks) {
    currentText += chunk;
    element.innerText = currentText;
    element.scrollTop = element.scrollHeight;

    // Slight pause between chunks
    await new Promise(resolve => setTimeout(resolve, speed));
  }

  element.classList.remove('writing');
}

// Handle save
function handleSave() {
  if (!currentNote) return;

  currentNote.title = elements.meetingTitle.value || 'Untitled Meeting';
  currentNote.content = elements.editor.innerText;

  saveNote(currentNote);
  loadNotesList();

  // Show feedback
  const originalText = elements.saveBtn.innerHTML;
  elements.saveBtn.innerHTML = '<span class="btn-icon">✓</span>Saved!';
  setTimeout(() => elements.saveBtn.innerHTML = originalText, 2000);
}

// Load notes list
function loadNotesList() {
  const notes = getAllNotes();

  if (notes.length === 0) {
    elements.notesListItems.innerHTML = '<p style="color: var(--text-muted); font-size: 12px; padding: 8px;">No notes yet</p>';
    return;
  }

  elements.notesListItems.innerHTML = notes.map(note => `
    <button class="note-item ${currentNote?.id === note.id ? 'active' : ''}" data-id="${note.id}">
      <span class="note-item-title">${escapeHtml(note.title)}</span>
      <span class="note-item-date">${formatDate(note.updatedAt)}</span>
    </button>
  `).join('');

  // Add click handlers
  elements.notesListItems.querySelectorAll('.note-item').forEach(item => {
    item.addEventListener('click', () => loadNote(item.dataset.id));
  });
}

// Load a specific note
function loadNote(id) {
  const note = getNote(id);
  if (!note) return;

  currentNote = note;
  audioBlob = null; // Audio not stored

  // Update UI
  elements.welcomeState.classList.add('hidden');
  elements.meetingState.classList.remove('hidden');
  elements.meetingTitle.value = note.title;
  elements.editor.innerText = note.content;

  // Reset recording controls
  elements.recordingTime.textContent = '00:00:00';
  elements.micStatus.textContent = 'Off';
  elements.micStatus.classList.remove('active');
  elements.tabStatus.textContent = 'Off';
  elements.tabStatus.classList.remove('active');
  elements.recordBtn.disabled = true;
  elements.startMicBtn.disabled = false;
  elements.startMicBtn.textContent = 'Enable Mic';
  elements.shareTabBtn.disabled = false;
  elements.shareTabBtn.textContent = 'Share Tab Audio';
  elements.transcribeBtn.disabled = true;

  // Show transcript if available
  if (note.transcript) {
    elements.transcriptContent.textContent = note.transcript;
    elements.transcriptPanel.classList.remove('hidden');
    elements.enhanceBtn.disabled = false;
  } else {
    elements.transcriptPanel.classList.add('hidden');
    elements.enhanceBtn.disabled = true;
  }


  // Reset recorder
  if (recorder) recorder.cleanup();
  recorder = new AudioRecorder();
  recorder.onRecordingStart = () => {
    elements.recordBtn.classList.add('recording');
    elements.recordBtn.innerHTML = '<span class="record-icon"></span>Stop Recording';
    elements.recordingIndicator.classList.remove('hidden');
    startTimer();
  };
  recorder.onRecordingStop = (blob) => {
    audioBlob = blob;
    elements.recordBtn.classList.remove('recording');
    elements.recordBtn.innerHTML = '<span class="record-icon"></span>Start Recording';
    elements.recordingIndicator.classList.add('hidden');
    stopTimer();
    elements.transcribeBtn.disabled = false;
  };
  recorder.onError = showError;

  loadNotesList();
}

// Settings
function openSettings() {
  elements.settingsModal.classList.remove('hidden');
  elements.groqApiKey.value = getApiKey();
}

function closeSettings() {
  elements.settingsModal.classList.add('hidden');
}

function saveSettings() {
  const key = elements.groqApiKey.value.trim();
  setApiKey(key);
  closeSettings();

  // Show feedback
  elements.saveSettingsBtn.textContent = 'Saved!';
  setTimeout(() => elements.saveSettingsBtn.textContent = 'Save Settings', 2000);
}

function loadApiKey() {
  elements.groqApiKey.value = getApiKey();
}

// Loading overlay
function showLoading(text = 'Processing...') {
  elements.loadingText.textContent = text;
  elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  elements.loadingOverlay.classList.add('hidden');
}

// Error handling
function showError(message) {
  alert(message); // Simple for MVP, can be improved
}

// HTML escaping
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start the app
init();
