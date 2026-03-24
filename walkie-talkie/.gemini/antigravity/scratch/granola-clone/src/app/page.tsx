'use client';

import { useState } from 'react';
import { Mic, FileAudio, Search, Clock, Plus } from 'lucide-react';
import { RecordModal } from '../components/RecordModal';
import { MeetingNotes } from '../components/MeetingNotes';
import styles from './page.module.css';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<{ transcript: string, notes: string, isProcessing: boolean } | null>(null);

  // Example placeholder meetings
  const recentMeetings = [
    { id: 1, title: 'Sync with Product Team', date: 'Today, 10:00 AM', duration: '45m' },
    { id: 2, title: 'Interview: Frontend Engineer', date: 'Yesterday, 2:30 PM', duration: '1h 15m' },
    { id: 3, title: 'Weekly Standup', date: 'Oct 12, 9:00 AM', duration: '15m' },
  ];

  const handleRecordingFinished = async (blob: Blob, duration: number) => {
    setIsRecording(false);

    // Switch to notes view with processing state
    setActiveMeeting({ transcript: '', notes: '', isProcessing: true });

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'meeting.webm');

      // 1. Transcribe
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();

      setActiveMeeting(prev => prev ? { ...prev, transcript: data.text } : null);

      // 2. Generate Notes
      const notesRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId: data.transcriptId }),
      });

      if (!notesRes.ok) throw new Error('Notes generation failed');
      const notesData = await notesRes.json();

      setActiveMeeting(prev => prev ? { ...prev, notes: notesData.response, isProcessing: false } : null);

    } catch (error) {
      console.error(error);
      setActiveMeeting(prev => prev ? { ...prev, isProcessing: false, notes: 'Error occurred during processing.' } : null);
    }
  };

  if (activeMeeting) {
    return (
      <MeetingNotes
        transcript={activeMeeting.transcript}
        notes={activeMeeting.notes}
        isProcessing={activeMeeting.isProcessing}
        onBack={() => setActiveMeeting(null)}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Sidebar / Nav */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>Granola</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>
            <FileAudio size={18} />
            <span>All Meetings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className="gradient-text">Meetings</h1>
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search meetings..." className={styles.searchInput} />
          </div>
        </header>

        <section className={styles.meetingList}>
          {recentMeetings.map((meeting) => (
            <div key={meeting.id} className={`glass-panel ${styles.meetingCard}`}>
              <div className={styles.meetingInfo}>
                <h3 className={styles.meetingTitle}>{meeting.title}</h3>
                <div className={styles.meetingMeta}>
                  <Clock size={14} />
                  <span>{meeting.date} • {meeting.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Floating Action / Record Button */}
        <div className={styles.recordActionContainer}>
          <div className={styles.recordHint}>Start new meeting</div>
          <button
            className={`${styles.recordButton} ${isRecording ? 'recording-pulse' : ''}`}
            onClick={() => setIsRecording(true)}
          >
            <Mic size={24} color="#ffffff" className={isRecording ? styles.animateMic : ''} />
          </button>
        </div>

        {isRecording && (
          <RecordModal
            onClose={() => setIsRecording(false)}
            onFinish={handleRecordingFinished}
          />
        )}
      </main>
    </div>
  );
}
