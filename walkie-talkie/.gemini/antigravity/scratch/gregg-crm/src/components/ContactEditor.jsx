import { useState } from 'react';
import { X } from 'lucide-react';

export default function ContactEditor({ onSave, onClose, initialData }) {
    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [company, setCompany] = useState(initialData?.company || '');
    const [role, setRole] = useState(initialData?.role || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [linkedin, setLinkedin] = useState(initialData?.linkedin || '');
    const [status, setStatus] = useState(initialData?.status || 'new');
    const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
    const [notes, setNotes] = useState(initialData?.notes || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const tags = tagsInput
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        onSave({
            name: name.trim(),
            email: email.trim(),
            company: company.trim(),
            role: role.trim(),
            phone: phone.trim(),
            linkedin: linkedin.trim(),
            status,
            tags,
            notes: notes.trim(),
        });
    };

    return (
        <div className="editor-overlay" onClick={onClose}>
            <div className="editor-panel" onClick={(e) => e.stopPropagation()}>
                <div className="editor-header">
                    <h2>{initialData ? 'Edit Contact' : 'New Contact'}</h2>
                    <button className="editor-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="editor-body">
                        <div className="editor-field">
                            <label>Name *</label>
                            <input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="editor-field">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+1-555-0123"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Company</label>
                                <input
                                    type="text"
                                    placeholder="Company name"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            <div className="editor-field">
                                <label>Role</label>
                                <input
                                    type="text"
                                    placeholder="Job title"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="new">New</option>
                                    <option value="warm">Warm</option>
                                    <option value="hot">Hot</option>
                                    <option value="cold">Cold</option>
                                </select>
                            </div>
                            <div className="editor-field">
                                <label>LinkedIn</label>
                                <input
                                    type="url"
                                    placeholder="https://linkedin.com/in/..."
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="editor-field">
                            <label>Tags</label>
                            <input
                                type="text"
                                placeholder="investor, technical, series-a (comma separated)"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                            />
                        </div>

                        <div className="editor-field">
                            <label>Notes</label>
                            <textarea
                                placeholder="How did you meet? What's important to remember?"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="editor-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
                            {initialData ? 'Save Changes' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
