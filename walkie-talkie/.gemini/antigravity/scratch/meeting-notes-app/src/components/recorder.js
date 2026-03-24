// Audio Recording Component
// Handles microphone and system/tab audio capture

export class AudioRecorder {
    constructor() {
        this.micStream = null;
        this.tabStream = null;
        this.combinedStream = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioContext = null;

        // Callbacks
        this.onRecordingStart = null;
        this.onRecordingStop = null;
        this.onError = null;
    }

    /**
     * Request microphone access
     */
    async enableMicrophone() {
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                }
            });
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            if (this.onError) {
                this.onError('Microphone access denied. Please allow microphone access.');
            }
            return false;
        }
    }

    /**
     * Request tab/system audio via screen sharing
     * Chrome requires video: true to capture tab audio
     */
    async enableTabAudio() {
        try {
            this.tabStream = await navigator.mediaDevices.getDisplayMedia({
                video: true, // Required for Chrome to capture tab audio
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    sampleRate: 44100,
                }
            });

            // Stop video track immediately - we only need audio
            this.tabStream.getVideoTracks().forEach(track => track.stop());

            // Check if audio track exists
            const audioTracks = this.tabStream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio track captured. Make sure to check "Share tab audio" when sharing.');
            }

            return true;
        } catch (error) {
            console.error('Tab audio capture failed:', error);
            if (this.onError) {
                this.onError('Tab audio capture failed. Make sure to select "Share tab audio" in Chrome.');
            }
            return false;
        }
    }

    /**
     * Check if microphone is enabled
     */
    hasMicrophone() {
        return this.micStream && this.micStream.getAudioTracks().length > 0 &&
            this.micStream.getAudioTracks()[0].readyState === 'live';
    }

    /**
     * Check if tab audio is enabled
     */
    hasTabAudio() {
        return this.tabStream && this.tabStream.getAudioTracks().length > 0 &&
            this.tabStream.getAudioTracks()[0].readyState === 'live';
    }

    /**
     * Combine audio streams using AudioContext
     */
    _combineStreams() {
        this.audioContext = new AudioContext();
        const destination = this.audioContext.createMediaStreamDestination();

        if (this.micStream) {
            const micSource = this.audioContext.createMediaStreamSource(this.micStream);
            micSource.connect(destination);
        }

        if (this.tabStream) {
            const tabSource = this.audioContext.createMediaStreamSource(this.tabStream);
            tabSource.connect(destination);
        }

        this.combinedStream = destination.stream;
        return this.combinedStream;
    }

    /**
     * Start recording
     */
    async startRecording() {
        if (this.isRecording) return;

        if (!this.hasMicrophone() && !this.hasTabAudio()) {
            if (this.onError) {
                this.onError('Please enable at least one audio source before recording.');
            }
            return false;
        }

        try {
            // Combine available streams
            const stream = this._combineStreams();

            // Create MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            this.mediaRecorder = new MediaRecorder(stream, { mimeType });
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: mimeType });
                if (this.onRecordingStop) {
                    this.onRecordingStop(audioBlob);
                }
            };

            this.mediaRecorder.start(1000); // Collect chunks every second
            this.isRecording = true;

            if (this.onRecordingStart) {
                this.onRecordingStart();
            }

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            if (this.onError) {
                this.onError('Failed to start recording: ' + error.message);
            }
            return false;
        }
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;

        this.mediaRecorder.stop();
        this.isRecording = false;

        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    /**
     * Clean up all streams
     */
    cleanup() {
        this.stopRecording();

        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }

        if (this.tabStream) {
            this.tabStream.getTracks().forEach(track => track.stop());
            this.tabStream = null;
        }

        if (this.combinedStream) {
            this.combinedStream.getTracks().forEach(track => track.stop());
            this.combinedStream = null;
        }
    }
}
