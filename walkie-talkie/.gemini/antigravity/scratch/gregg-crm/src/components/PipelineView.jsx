import { useState, useRef } from 'react';
import { Building2, Mail, Phone, Clock, User, GripVertical } from 'lucide-react';
import { getAvatarColor, getInitials, getTagColor } from '../data/sampleContacts';

// Helper: relative time
function relativeTime(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
}

// Pipeline stages
const stages = [
    { id: 'new', label: 'New', color: '#10b981' },
    { id: 'warm', label: 'Warm', color: '#f59e0b' },
    { id: 'hot', label: 'Hot', color: '#ef4444' },
    { id: 'cold', label: 'Inactive', color: '#6b7280' },
];

export default function PipelineView({ contacts, onSelectContact, onUpdateStatus }) {
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const dragCounterRef = useRef({});

    // Group contacts by status
    const grouped = {};
    stages.forEach((s) => {
        grouped[s.id] = contacts.filter((c) => c.frontmatter.status === s.id);
    });

    // Drag handlers
    const handleDragStart = (e, contactId) => {
        setDraggedId(contactId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', contactId);
        // Make the drag image slightly transparent
        if (e.target) {
            e.target.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e) => {
        if (e.target) {
            e.target.style.opacity = '1';
        }
        setDraggedId(null);
        setDragOverColumn(null);
        dragCounterRef.current = {};
    };

    const handleDragEnterColumn = (e, stageId) => {
        e.preventDefault();
        if (!dragCounterRef.current[stageId]) {
            dragCounterRef.current[stageId] = 0;
        }
        dragCounterRef.current[stageId]++;
        setDragOverColumn(stageId);
    };

    const handleDragLeaveColumn = (e, stageId) => {
        dragCounterRef.current[stageId]--;
        if (dragCounterRef.current[stageId] <= 0) {
            dragCounterRef.current[stageId] = 0;
            if (dragOverColumn === stageId) {
                setDragOverColumn(null);
            }
        }
    };

    const handleDragOverColumn = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const contactId = e.dataTransfer.getData('text/plain');
        if (contactId && onUpdateStatus) {
            onUpdateStatus(contactId, newStatus);
        }
        setDraggedId(null);
        setDragOverColumn(null);
        dragCounterRef.current = {};
    };

    return (
        <div className="pipeline-view">
            {stages.map((stage) => {
                const isOver = dragOverColumn === stage.id && draggedId;
                const isDragging = !!draggedId;

                return (
                    <div
                        key={stage.id}
                        className={`pipeline-column ${isOver ? 'drag-over' : ''}`}
                        onDragEnter={(e) => handleDragEnterColumn(e, stage.id)}
                        onDragLeave={(e) => handleDragLeaveColumn(e, stage.id)}
                        onDragOver={handleDragOverColumn}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="pipeline-column-header">
                            <div className="stage-indicator" style={{ background: stage.color }} />
                            <h3>{stage.label}</h3>
                            <span className="column-count">{grouped[stage.id]?.length || 0}</span>
                        </div>
                        <div className={`pipeline-cards ${isDragging ? 'dragging-active' : ''}`}>
                            {(grouped[stage.id] || []).map((contact) => {
                                const fm = contact.frontmatter;
                                const color = getAvatarColor(fm.name);
                                const initials = getInitials(fm.name);
                                const isBeingDragged = draggedId === contact.id;

                                return (
                                    <div
                                        key={contact.id}
                                        className={`pipeline-card ${isBeingDragged ? 'is-dragging' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, contact.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => onSelectContact(contact.id)}
                                    >
                                        <div className="pipeline-card-header">
                                            <div className="drag-handle">
                                                <GripVertical size={12} />
                                            </div>
                                            <div className={`pipeline-card-avatar ${color}`}>{initials}</div>
                                            <div className="pipeline-card-name">{fm.name}</div>
                                        </div>
                                        <div className="pipeline-card-body">
                                            {fm.company && (
                                                <div className="pipeline-card-detail">
                                                    <Building2 className="detail-icon" size={12} />
                                                    <span>{fm.company}</span>
                                                </div>
                                            )}
                                            {fm.email && (
                                                <div className="pipeline-card-detail">
                                                    <Mail className="detail-icon" size={12} />
                                                    <span>{fm.email}</span>
                                                </div>
                                            )}
                                            {fm.role && (
                                                <div className="pipeline-card-detail">
                                                    <User className="detail-icon" size={12} />
                                                    <span>{fm.role}</span>
                                                </div>
                                            )}
                                        </div>
                                        {fm.tags?.length > 0 && (
                                            <div className="pipeline-card-tags">
                                                {fm.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className={`card-tag ${getTagColor(tag)}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="pipeline-card-footer">
                                            <div className="pipeline-card-person">
                                                <User size={10} />
                                                <span>{fm.name.split(' ')[0]}</span>
                                            </div>
                                            <div className="pipeline-card-time">
                                                <Clock size={10} />
                                                <span>{relativeTime(fm.last_contacted)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Drop zone hint */}
                            {isOver && (
                                <div className="drop-zone-hint">
                                    Drop to move here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
