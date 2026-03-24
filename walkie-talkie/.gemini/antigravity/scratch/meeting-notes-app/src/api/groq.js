// Groq API Client
// Uses Whisper for transcription and Llama for note enhancement

const GROQ_API_URL = 'https://api.groq.com/openai/v1';

// Models - using cheapest options
const WHISPER_MODEL = 'whisper-large-v3-turbo'; // $0.04/hour
const LLM_MODEL = 'llama-3.1-8b-instant'; // $0.05/M input, $0.08/M output

/**
 * Get the stored API key
 */
export function getApiKey() {
  return localStorage.getItem('groq_api_key') || '';
}

/**
 * Set the API key
 */
export function setApiKey(key) {
  localStorage.setItem('groq_api_key', key);
}

/**
 * Check if API key is configured
 */
export function hasApiKey() {
  return !!getApiKey();
}

/**
 * Transcribe audio using Groq Whisper API
 * @param {Blob} audioBlob - The audio blob to transcribe
 * @returns {Promise<string>} - The transcribed text
 */
export async function transcribeAudio(audioBlob) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Groq API key not configured. Please add your API key in Settings.');
  }

  // Convert blob to file
  const file = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', WHISPER_MODEL);
  formData.append('response_format', 'text');
  formData.append('language', 'en'); // Can be made configurable

  const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Transcription failed: ${response.status}`);
  }

  const text = await response.text();
  return text;
}

/**
 * Enhance notes using Groq LLM
 * @param {string} draftNotes - User's draft notes
 * @param {string} transcript - Meeting transcript
 * @returns {Promise<string>} - Enhanced notes
 */
export async function enhanceNotes(draftNotes, transcript) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Groq API key not configured. Please add your API key in Settings.');
  }

  const systemPrompt = `You are a meeting notes assistant. Your job is to enhance the user's draft notes using context from the meeting transcript.

Create well-organized, professional meeting notes that:
1. Use the user's draft notes as the foundation and expand on them
2. Add relevant context and details from the transcript
3. Identify action items and mark them with "⚡ ACTION:"
4. Highlight key decisions with "✓ DECISION:"
5. Add a brief summary at the top
6. Keep it concise but comprehensive
7. Use bullet points and headers for readability

Format the output in clean markdown.`;

  const userPrompt = `Here are my draft notes from the meeting:

${draftNotes || '(No draft notes provided)'}

---

Here is the meeting transcript:

${transcript}

---

Please enhance my notes with the context from the transcript.`;

  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more focused output
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Enhancement failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
}
