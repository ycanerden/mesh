import { Search, Users, Flame, Sparkles, Snowflake, Clock, Plus, LayoutGrid, Building2, Settings } from 'lucide-react';


export default function Sidebar({
    contacts,
    searchQuery,
    activeFilter,
    onSearchChange,
    onFilterChange,
    onClearFilter,
    onNewContact,
    onOpenPalette,
    onOpenSettings,
}) {
    const contactCount = contacts.length;

    // Groups (Folk-style)
    const groups = [
        { id: 'sales', label: 'Sales Pipeline', color: 'orange', icon: '💼' },
        { id: 'investors', label: 'Investors', color: 'blue', icon: '📊' },
        { id: 'partners', label: 'Partners', color: 'green', icon: '🤝' },
        { id: 'press', label: 'Press & Media', color: 'pink', icon: '📰' },
    ];

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">G</div>
                    <h1>Greg</h1>
                </div>
                <div className="sidebar-header-actions" style={{ display: 'flex', gap: 4 }}>
                    <button className="add-contact-btn" onClick={onOpenSettings} title="Settings">
                        <Settings size={15} />
                    </button>
                    <button className="add-contact-btn" onClick={onNewContact} title="New contact">
                        <Plus size={15} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="sidebar-search">
                <Search className="search-icon" size={13} />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <span className="search-count">{contactCount}</span>
            </div>

            {/* Main Nav */}
            <nav className="sidebar-nav">
                <div
                    className={`nav-item ${!activeFilter ? 'active' : ''}`}
                    onClick={onClearFilter}
                >
                    <LayoutGrid className="nav-icon" size={15} />
                    <span>All Contacts</span>
                    <span className="nav-count">{contactCount}</span>
                </div>
                <div
                    className={`nav-item ${activeFilter?.type === 'status' && activeFilter.value === 'hot' ? 'active' : ''}`}
                    onClick={() => onFilterChange({ type: 'status', value: 'hot' })}
                >
                    <Flame className="nav-icon" size={15} />
                    <span>Hot</span>
                </div>
                <div
                    className={`nav-item ${activeFilter?.type === 'status' && activeFilter.value === 'warm' ? 'active' : ''}`}
                    onClick={() => onFilterChange({ type: 'status', value: 'warm' })}
                >
                    <Sparkles className="nav-icon" size={15} />
                    <span>Warm</span>
                </div>
                <div
                    className={`nav-item ${activeFilter?.type === 'status' && activeFilter.value === 'cold' ? 'active' : ''}`}
                    onClick={() => onFilterChange({ type: 'status', value: 'cold' })}
                >
                    <Snowflake className="nav-icon" size={15} />
                    <span>Cold</span>
                </div>
                <div
                    className={`nav-item ${activeFilter?.type === 'stale' ? 'active' : ''}`}
                    onClick={() => onFilterChange({ type: 'stale' })}
                >
                    <Clock className="nav-icon" size={15} />
                    <span>Needs Follow-up</span>
                </div>
            </nav>

            {/* Groups (Folk-style) */}
            <div className="sidebar-groups">
                <div className="nav-section-label">Groups</div>
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className={`group-item ${activeFilter?.type === 'tag' && activeFilter.value === group.id ? 'active' : ''}`}
                        onClick={() => onFilterChange({ type: 'tag', value: group.id })}
                    >
                        <div className={`group-dot ${group.color}`} />
                        <span>{group.label}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-cmdk-hint" onClick={onOpenPalette}>
                    <span className="kbd-hint">⌘K</span>
                    <span>Search or command</span>
                </div>
            </div>
        </div>
    );
}
