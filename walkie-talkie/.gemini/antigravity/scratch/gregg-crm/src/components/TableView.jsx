import { Building2, Mail, Phone, Clock, User } from 'lucide-react';
import { getAvatarColor, getInitials, getTagColor } from '../data/sampleContacts';

function relativeTime(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export default function TableView({ contacts, onSelectContact }) {
    return (
        <div className="table-view">
            <table className="contacts-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Tags</th>
                        <th>Last Contacted</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((contact) => {
                        const fm = contact.frontmatter;
                        const color = getAvatarColor(fm.name);
                        const initials = getInitials(fm.name);

                        return (
                            <tr key={contact.id} onClick={() => onSelectContact(contact.id)}>
                                <td>
                                    <div className="table-name-cell">
                                        <div className={`table-avatar ${color}`}>{initials}</div>
                                        <span className="table-name">{fm.name}</span>
                                    </div>
                                </td>
                                <td>{fm.company || '—'}</td>
                                <td>{fm.role || '—'}</td>
                                <td>
                                    {fm.status && (
                                        <span className={`status-badge ${fm.status}`}>{fm.status}</span>
                                    )}
                                </td>
                                <td>
                                    <div className="table-tags">
                                        {fm.tags?.slice(0, 2).map((tag) => (
                                            <span key={tag} className={`card-tag ${getTagColor(tag)}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                                    {relativeTime(fm.last_contacted)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
