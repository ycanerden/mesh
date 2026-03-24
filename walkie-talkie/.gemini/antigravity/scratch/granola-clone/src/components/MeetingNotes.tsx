import { ChevronLeft, FileText, List, MessageSquare, Download } from 'lucide-react';
import styles from './MeetingNotes.module.css';

interface MeetingNotesProps {
    transcript: string;
    notes: string;
    onBack: () => void;
    isProcessing?: boolean;
}

export function MeetingNotes({ transcript, notes, onBack, isProcessing = false }: MeetingNotesProps) {
    // Simple markdown renderer for the MVP
    const renderMarkdown = (text: string) => {
        // Process very basic bold and list
        const html = text
            .split('\n')
            .map(line => {
                if (line.trim().startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`;
                if (line.trim().startsWith('# ')) return `<h1>${line.replace('# ', '')}</h1>`;
                if (line.trim().startsWith('- ')) return `<li>${line.replace('- ', '')}</li>`;
                if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ')) {
                    return `<li class="ordered">${line.replace(/^\d+\.\s/, '')}</li>`;
                }
                if (line.trim() === '') return '<br />';

                let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return `<p>${processedLine}</p>`;
            })
            .join('');

        return { __html: html };
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={onBack} className={styles.backBtn}>
                    <ChevronLeft size={20} />
                    <span>Back to Meetings</span>
                </button>
                <h2 className={styles.title}>Recent Meeting Notes</h2>
                <button className={styles.exportBtn}>
                    <Download size={16} />
                    <span>Export</span>
                </button>
            </header>

            <div className={styles.contentWrapper}>
                {/* Left Pane: Structured Notes */}
                <div className={styles.pane}>
                    <div className={styles.paneHeader}>
                        <FileText size={18} className={styles.icon} />
                        <h3>AI Summary & Action Items</h3>
                    </div>
                    <div className={`${styles.paneContent} ${styles.notesPane}`}>
                        {isProcessing && !notes ? (
                            <div className={styles.loadingState}>
                                <div className={styles.spinner} />
                                <p>Analyzing transcript with LeMUR...</p>
                            </div>
                        ) : (
                            <div className={styles.markdownContent} dangerouslySetInnerHTML={renderMarkdown(notes || 'No notes generated.')} />
                        )}
                    </div>
                </div>

                {/* Right Pane: Transcript */}
                <div className={styles.pane}>
                    <div className={styles.paneHeader}>
                        <MessageSquare size={18} className={styles.icon} />
                        <h3>Transcript</h3>
                    </div>
                    <div className={`${styles.paneContent} ${styles.transcriptPane}`}>
                        {isProcessing && !transcript ? (
                            <div className={styles.loadingState}>
                                <div className={styles.spinner} />
                                <p>Transcribing audio...</p>
                            </div>
                        ) : (
                            <p className={styles.transcriptText}>{transcript || 'No transcript available.'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
