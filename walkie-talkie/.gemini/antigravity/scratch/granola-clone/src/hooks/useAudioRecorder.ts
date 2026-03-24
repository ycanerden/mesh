import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Audio context for visualization
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Setup AudioContext for visualizer
            const audioContext = new window.AudioContext();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            const bufferLength = analyser.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            const updateLevel = () => {
                if (!analyserRef.current || !dataArrayRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
                const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
                const avg = sum / dataArrayRef.current.length;
                setAudioLevel(avg);
                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const type = mediaRecorder.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
            };

            mediaRecorder.start(200); // chunk size in ms
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error starting recording:', err);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        setIsRecording(false);
        setIsPaused(false);
        setAudioLevel(0);
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    return {
        isRecording,
        isPaused,
        recordingTime,
        audioUrl,
        audioBlob,
        audioLevel,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
    };
}
