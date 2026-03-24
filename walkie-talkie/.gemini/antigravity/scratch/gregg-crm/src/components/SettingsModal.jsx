import { useState, useEffect } from 'react';
import { X, Save, Key, Database, Sparkles, Server } from 'lucide-react';
import '../settings.css';

export default function SettingsModal({ onClose, onSave }) {
    const [settings, setSettings] = useState({
        LLM_API_KEY: '',
        LLM_PROVIDER: 'google',
        NOTION_API_KEY: '',
        NOTION_DATABASE_ID: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/api/settings')
            .then((res) => res.json())
            .then((data) => {
                setSettings({
                    LLM_API_KEY: data.LLM_API_KEY || '',
                    LLM_PROVIDER: data.LLM_PROVIDER || 'google',
                    NOTION_API_KEY: data.NOTION_API_KEY || '',
                    NOTION_DATABASE_ID: data.NOTION_DATABASE_ID || '',
                });
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load settings', err);
                setIsLoading(false);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                if (onSave) onSave();
                onClose();
            } else {
                alert('Failed to save settings');
            }
        } catch (e) {
            console.error('Save error', e);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>
                        <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                            <Server size={18} />
                        </div>
                        App Configuration
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="settings-body" style={{ alignItems: 'center', justifyContent: 'center', height: 200 }}>
                        <div style={{ color: 'var(--text-muted)' }}>Loading preferences...</div>
                    </div>
                ) : (
                    <div className="settings-body">
                        {/* Section 1: AI Agent */}
                        <div className="settings-section">
                            <h3 className="settings-section-title">
                                <Sparkles size={14} /> Local Agent (LLM)
                            </h3>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                The AI engine used to parse incoming texts and enrich your markdown contacts.
                            </div>

                            <div className="settings-field">
                                <label className="settings-label">Provider</label>
                                <select
                                    name="LLM_PROVIDER"
                                    value={settings.LLM_PROVIDER}
                                    onChange={handleChange}
                                    className="settings-input"
                                >
                                    <option value="google">Google Gemini</option>
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                </select>
                            </div>

                            <div className="settings-field">
                                <label className="settings-label">API Key</label>
                                <input
                                    type="password"
                                    name="LLM_API_KEY"
                                    value={settings.LLM_API_KEY}
                                    onChange={handleChange}
                                    placeholder="Enter your API key"
                                    className="settings-input"
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                />
                                <div className="settings-hint">Stored safely in local .env logic</div>
                            </div>
                        </div>

                        {/* Section 2: MCP Integrations */}
                        <div className="settings-section">
                            <h3 className="settings-section-title">
                                <Database size={14} /> Data Sources (MCP)
                            </h3>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Connect Gregor CRM to external tools via the Model Context Protocol.
                            </div>

                            <div className="settings-field">
                                <label className="settings-label">Notion Integration Token</label>
                                <input
                                    type="password"
                                    name="NOTION_API_KEY"
                                    value={settings.NOTION_API_KEY}
                                    onChange={handleChange}
                                    placeholder="secret_..."
                                    className="settings-input"
                                />
                                <div className="settings-hint">Requires an Internal Integration Secret from Notion Developers.</div>
                            </div>

                            <div className="settings-field">
                                <label className="settings-label">Notion CRM Database ID</label>
                                <input
                                    type="text"
                                    name="NOTION_DATABASE_ID"
                                    value={settings.NOTION_DATABASE_ID}
                                    onChange={handleChange}
                                    placeholder="e.g. 1a2b3c4d-5e6f..."
                                    className="settings-input"
                                />
                                <div className="settings-hint">The specific 32-character ID of your contacts database.</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="settings-footer">
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', padding: '8px 16px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, borderRadius: '6px' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary-solid"
                        onClick={handleSave}
                        disabled={isLoading || isSaving}
                    >
                        {isSaving ? 'Saving...' : (
                            <>
                                <Save size={16} /> Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
