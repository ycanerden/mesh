// LocalStorage helpers for meeting notes

const STORAGE_KEY = 'meeting_notes';

/**
 * Get all saved notes
 * @returns {Array} - Array of note objects
 */
export function getAllNotes() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load notes:', e);
        return [];
    }
}

/**
 * Get a single note by ID
 * @param {string} id - Note ID
 * @returns {Object|null} - Note object or null
 */
export function getNote(id) {
    const notes = getAllNotes();
    return notes.find(n => n.id === id) || null;
}

/**
 * Save a note (create or update)
 * @param {Object} note - Note object with id, title, content, transcript, enhanced, createdAt, updatedAt
 * @returns {Object} - The saved note
 */
export function saveNote(note) {
    const notes = getAllNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);

    const noteToSave = {
        ...note,
        updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
        notes[existingIndex] = noteToSave;
    } else {
        noteToSave.createdAt = noteToSave.createdAt || new Date().toISOString();
        notes.unshift(noteToSave); // Add to beginning
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return noteToSave;
}

/**
 * Delete a note by ID
 * @param {string} id - Note ID
 */
export function deleteNote(id) {
    const notes = getAllNotes();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Create a new note with default values
 * @returns {Object} - New note object
 */
export function createNewNote() {
    return {
        id: generateId(),
        title: 'Untitled Meeting',
        content: '',
        transcript: '',
        enhanced: '',
        audioBlob: null, // Not stored in localStorage
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Generate a unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date for display
 * @param {string} isoDate - ISO date string
 * @returns {string} - Formatted date
 */
export function formatDate(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}
