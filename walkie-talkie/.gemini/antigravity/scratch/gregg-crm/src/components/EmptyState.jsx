import { Users } from 'lucide-react';

export default function EmptyState({ onOpenPalette, onNewContact }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Users size={24} />
            </div>
            <h2>Welcome to Greg</h2>
            <p>
                Your contacts are markdown files. Your agent does the work.
                Get started by creating your first contact.
            </p>
            <div className="empty-state-shortcut">
                <span>Press</span>
                <span className="kbd-hint">⌘K</span>
                <span>to search or run a command</span>
            </div>
            <button
                className="btn btn-primary"
                style={{ marginTop: 8 }}
                onClick={onNewContact}
            >
                Create Your First Contact
            </button>
        </div>
    );
}
