import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    X,
    Mail,
    Phone,
    Linkedin,
    MessageSquarePlus,
    Edit3,
    Trash2,
    Save,
    Send,
    Calendar,
    FileText,
    Plus,
} from 'lucide-react';
import { getAvatarColor, getInitials, getTagColor } from '../data/sampleContacts';

// Parse activity entries from markdown body
function parseActivities(body) {
    const lines = body.split('\n');
    const activities = [];
    let inActivity = false;

    for (const line of lines) {
        if (line.trim().startsWith('## Activity')) {
            inActivity = true;
            continue;
        }
        if (line.trim().startsWith('## ') && inActivity) break;
        if (inActivity && line.trim().startsWith('- **')) {
            const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
            if (match) {
                const text = match[2].toLowerCase();
                let type = 'default';
                if (text.includes('email') || text.includes('sent')) type = 'email';
                else if (text.includes('call') || text.includes('zoom')) type = 'meeting';
                else if (text.includes('coffee') || text.includes('meeting') || text.includes('demo')) type = 'meeting';
                else if (text.includes('linkedin')) type = 'linkedin';
                else if (text.includes('deck') || text.includes('shared')) type = 'note';
                activities.push({ date: match[1], text: match[2], type });
            }
        }
    }
    return activities;
}

// Parse notes from markdown body
function parseNotes(body) {
    const lines = body.split('\n');
    const notes = [];
    let inNotes = false;
    for (const line of lines) {
        if (line.trim().startsWith('## Notes')) { inNotes = true; continue; }
        if (line.trim().startsWith('## ') && inNotes) break;
        if (inNotes && line.trim()) notes.push(line);
    }
    return notes.join('\n');
}

const activityIcons = {
    email: Mail,
    meeting: Calendar,
    linkedin: Linkedin,
    note: FileText,
    default: MessageSquarePlus,
};

const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'warm', label: 'Warm' },
    { value: 'hot', label: 'Hot' },
    { value: 'cold', label: 'Cold' },
];

export default function DetailPanel({ contact, onClose, onUpdate, onDelete, onLogActivity, onUpdateField }) {
    const [showActivityInput, setShowActivityInput] = useState(false);
    const [activityText, setActivityText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);

    if (!contact) return null;

    const fm = contact.frontmatter;
    const color = getAvatarColor(fm.name);
    const initials = getInitials(fm.name);
    const activities = parseActivities(contact.body);
    const notes = parseNotes(contact.body);

    const handleLogActivity = () => {
        if (activityText.trim()) {
            onLogActivity(contact.id, activityText.trim());
            setActivityText('');
            setShowActivityInput(false);
        }
    };

    const handleSaveEdit = () => {
        onUpdate({ ...contact, body: editBody });
        setIsEditing(false);
    };

    const handleStatusChange = (newStatus) => {
        if (onUpdateField) {
            onUpdateField(contact.id, 'status', newStatus);
        }
        setIsEditingStatus(false);
    };

    const handleRemoveTag = (tagToRemove) => {
        if (onUpdateField) {
            const newTags = (fm.tags || []).filter((t) => t !== tagToRemove);
            onUpdateField(contact.id, 'tags', newTags);
        }
    };

    const handleAddTag = (newTag) => {
        const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
        if (tag && onUpdateField && !(fm.tags || []).includes(tag)) {
            onUpdateField(contact.id, 'tags', [...(fm.tags || []), tag]);
        }
        setTagInput('');
        setShowTagInput(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="detail-panel-overlay">
            <div className="detail-panel-backdrop" onClick={onClose} />
            <div className="detail-panel">
                {/* Header */}
                <div className="detail-panel-header">
                    <div className={`detail-avatar ${color}`}>{initials}</div>
                    <div className="detail-header-info">
                        <div className="detail-name">{fm.name}</div>
                        <div className="detail-company">
                            {fm.role}{fm.company && ` · ${fm.company}`}
                        </div>
                    </div>
                    <button className="detail-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="detail-actions">
                    {fm.email && (
                        <a href={`mailto:${fm.email}`} className="detail-action-btn" style={{ textDecoration: 'none' }}>
                            <Mail className="action-icon" size={14} /> Email
                        </a>
                    )}
                    {fm.phone && (
                        <a href={`tel:${fm.phone}`} className="detail-action-btn" style={{ textDecoration: 'none' }}>
                            <Phone className="action-icon" size={14} /> Call
                        </a>
                    )}
                    {fm.linkedin && (
                        <a href={fm.linkedin} target="_blank" rel="noopener noreferrer" className="detail-action-btn" style={{ textDecoration: 'none' }}>
                            <Linkedin className="action-icon" size={14} />
                        </a>
                    )}
                    <button
                        className="detail-action-btn more"
                        onClick={() => setShowActivityInput(!showActivityInput)}
                        title="Log activity"
                    >
                        <MessageSquarePlus size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="detail-body">
                    {/* Meta rows */}
                    <div className="detail-meta">
                        <div className="detail-meta-row">
                            <div className="detail-meta-label">Email</div>
                            <div className="detail-meta-value">
                                {fm.email ? <a href={`mailto:${fm.email}`}>{fm.email}</a> : '—'}
                            </div>
                        </div>
                        <div className="detail-meta-row">
                            <div className="detail-meta-label">Phone</div>
                            <div className="detail-meta-value">{fm.phone || '—'}</div>
                        </div>
                        <div className="detail-meta-row">
                            <div className="detail-meta-label">Company</div>
                            <div className="detail-meta-value">{fm.company || '—'}</div>
                        </div>

                        {/* Inline editable status */}
                        <div className="detail-meta-row">
                            <div className="detail-meta-label">Status</div>
                            <div className="detail-meta-value">
                                {isEditingStatus ? (
                                    <select
                                        className="inline-status-select"
                                        value={fm.status || 'new'}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        onBlur={() => setIsEditingStatus(false)}
                                        autoFocus
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span
                                        className={`status-badge ${fm.status} clickable-status`}
                                        onClick={() => setIsEditingStatus(true)}
                                        title="Click to change status"
                                    >
                                        {fm.status || 'new'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Inline editable tags */}
                        <div className="detail-meta-row">
                            <div className="detail-meta-label">Tags</div>
                            <div className="detail-meta-value">
                                <div className="tag-editor-wrapper">
                                    {(fm.tags || []).map((tag) => (
                                        <span
                                            key={tag}
                                            className={`detail-tag ${getTagColor(tag)} tag-remove-btn`}
                                            onClick={() => handleRemoveTag(tag)}
                                            title="Click to remove"
                                        >
                                            {tag}<span className="tag-x">×</span>
                                        </span>
                                    ))}
                                    {showTagInput ? (
                                        <input
                                            className="tag-add-input"
                                            type="text"
                                            placeholder="tag name"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddTag(tagInput);
                                                if (e.key === 'Escape') { setShowTagInput(false); setTagInput(''); }
                                            }}
                                            onBlur={() => {
                                                if (tagInput.trim()) handleAddTag(tagInput);
                                                else { setShowTagInput(false); setTagInput(''); }
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <button
                                            className="add-tag-btn"
                                            onClick={() => setShowTagInput(true)}
                                            title="Add tag"
                                        >
                                            <Plus size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {isEditing ? (
                        <>
                            <div className="detail-section-label">Edit Notes</div>
                            <textarea
                                className="inline-edit-textarea"
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                autoFocus
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button className="btn btn-primary" onClick={handleSaveEdit}>
                                    <Save size={13} style={{ marginRight: 4 }} />Save
                                </button>
                                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </>
                    ) : notes ? (
                        <>
                            <div className="detail-section-label">Notes</div>
                            <div className="detail-notes">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                            </div>
                        </>
                    ) : null}

                    {/* Activity Timeline */}
                    {activities.length > 0 && (
                        <>
                            <div className="detail-section-label">Activity</div>
                            <div className="activity-timeline">
                                {activities.map((activity, i) => {
                                    const Icon = activityIcons[activity.type] || activityIcons.default;
                                    return (
                                        <div key={i} className="activity-item">
                                            <div className={`activity-icon-wrapper ${activity.type}`}>
                                                <Icon size={14} />
                                            </div>
                                            <div className="activity-content">
                                                <div className="activity-text">{activity.text}</div>
                                                <div className="activity-date">{formatDate(activity.date)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Activity Input */}
                {showActivityInput && (
                    <div className="activity-input-wrapper">
                        <input
                            className="activity-input"
                            type="text"
                            placeholder="Log an activity..."
                            value={activityText}
                            onChange={(e) => setActivityText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogActivity()}
                            autoFocus
                        />
                        <button className="btn btn-primary" onClick={handleLogActivity}>
                            <Send size={13} />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="detail-footer">
                    <button
                        className="detail-footer-btn"
                        onClick={() => { setEditBody(contact.body); setIsEditing(true); }}
                    >
                        <Edit3 size={13} /> Edit
                    </button>
                    {showDeleteConfirm ? (
                        <>
                            <button className="detail-footer-btn danger" onClick={() => { onDelete(contact.id); setShowDeleteConfirm(false); }}>
                                Yes, delete
                            </button>
                            <button className="detail-footer-btn" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button className="detail-footer-btn danger" onClick={() => setShowDeleteConfirm(true)}>
                            <Trash2 size={13} /> Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
