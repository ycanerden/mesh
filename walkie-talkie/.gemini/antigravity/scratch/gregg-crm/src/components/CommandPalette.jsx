import { useEffect, useRef } from 'react';
import { Search, UserPlus, Users, Clock, User } from 'lucide-react';

const iconMap = {
    UserPlus: UserPlus,
    Users: Users,
    Clock: Clock,
    User: User,
};

export default function CommandPalette({
    isOpen,
    query,
    results,
    selectableItems,
    selectedIndex,
    onQueryChange,
    onSelectIndex,
    onClose,
}) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    let selectableIdx = -1;

    return (
        <div className="command-palette-overlay" onClick={onClose}>
            <div className="command-palette" onClick={(e) => e.stopPropagation()}>
                <div className="command-palette-input-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search contacts or type a command..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                    />
                    <span className="kbd-hint">ESC</span>
                </div>
                <div className="command-palette-results">
                    {results.length === 0 && query && (
                        <div style={{
                            padding: 'var(--space-6)',
                            textAlign: 'center',
                            color: 'var(--text-tertiary)',
                            fontSize: 'var(--text-sm)',
                        }}>
                            No results for "{query}"
                        </div>
                    )}
                    {results.map((item, i) => {
                        if (item.type === 'group') {
                            return (
                                <div key={`group-${item.label}`} className="command-group-label">
                                    {item.label}
                                </div>
                            );
                        }

                        selectableIdx++;
                        const isSelected = selectableIdx === selectedIndex;
                        const Icon = iconMap[item.icon] || User;

                        return (
                            <div
                                key={item.id}
                                className={`command-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                    item.action?.();
                                    onClose();
                                }}
                                onMouseEnter={() => {
                                    // Find the selectable index for this item
                                    const idx = selectableItems.findIndex((si) => si.id === item.id);
                                    if (idx >= 0) onSelectIndex(idx);
                                }}
                            >
                                <Icon className="command-item-icon" size={16} />
                                <span className="command-item-label">
                                    {item.label}
                                    {item.subtitle && (
                                        <span style={{ color: 'var(--text-tertiary)', marginLeft: 6, fontSize: 'var(--text-xs)' }}>
                                            {item.subtitle}
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
