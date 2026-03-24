import { useEffect, useState } from 'react';
import { Mic, Square, Pause, Play, ChevronDown } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import styles from './RecordModal.module.css';

interface RecordModalProps {
    onClose: () => void;
    onFinish: (blob: Blob, duration: number) => void;
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function RecordModal({ onClose, onFinish }: RecordModalProps) {
    const {
        isRecording,
        isPaused,
        recordingTime,
        audioLevel,
        audioBlob,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording
    } = useAudioRecorder();

    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        // Start automatically when opening the modal
        if (!hasStarted) {
            startRecording();
            setHasStarted(true);
        }
    }, [hasStarted, startRecording]);

    const handleStop = () => {
        stopRecording();
        // In a real app we might want to wait for audioBlob to be set, 
        // but the hook sets it asynchronously. Let's assume onStop finishes quickly.
        // For MVP, we'll let the user manually hit a "Save" or just pass it to the parent in a setTimeout or use an effect.
    };

    // When audioBlob is created after stopRecording
    useEffect(() => {
        if (!isRecording && audioBlob && hasStarted) {
            onFinish(audioBlob, recordingTime);
        }
    }, [isRecording, audioBlob, hasStarted, onFinish, recordingTime]);

    // Calculate visualizer scale based on audio volume
    const visualizerScale = 1 + (audioLevel / 128) * 0.5; // Audio level is 0-255

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.statusBadge}>
                        <div className={`${styles.statusDot} ${isRecording && !isPaused ? styles.recording : ''}`} />
                        <span>{isPaused ? 'Paused' : 'Recording...'}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={() => { stopRecording(); onClose(); }}>
                        <ChevronDown size={20} />
                    </button>
                </div>

                <div className={styles.visualizerContainer}>
                    <div className={styles.timeDisplay}>
                        {formatTime(recordingTime)}
                    </div>

                    <div className={styles.micCircleWrapper}>
                        <div
                            className={styles.glowRing}
                            style={{
                                transform: `scale(${isPaused ? 1 : visualizerScale})`,
                                opacity: isPaused ? 0.3 : 0.8
                            }}
                        />
                        <div className={`${styles.micCircle} ${isRecording && !isPaused ? styles.pulseGlow : ''}`}>
                            <Mic size={32} color="#fff" />
                        </div>
                    </div>
                </div>

                <div className={styles.controls}>
                    {isPaused ? (
                        <button className={styles.controlBtn} onClick={resumeRecording}>
                            <Play size={20} fill="currentColor" />
                        </button>
                    ) : (
                        <button className={styles.controlBtn} onClick={pauseRecording}>
                            <Pause size={20} fill="currentColor" />
                        </button>
                    )}

                    <button className={`${styles.controlBtn} ${styles.stopBtn}`} onClick={handleStop}>
                        <Square size={16} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}
