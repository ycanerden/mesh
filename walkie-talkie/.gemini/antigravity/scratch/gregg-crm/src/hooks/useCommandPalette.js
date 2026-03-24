import { useState, useEffect, useCallback, useMemo } from 'react';

export function useCommandPalette({ contacts, onSelectContact, onCreateContact, onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Commands
    const commands = useMemo(
        () => [
            {
                id: 'new-contact',
                label: 'New Contact',
                icon: 'UserPlus',
                group: 'Actions',
                action: () => onCreateContact?.(),
            },
            {
                id: 'all-contacts',
                label: 'Show All Contacts',
                icon: 'Users',
                group: 'Actions',
                action: () => onNavigate?.('all'),
            },
            {
                id: 'stale-contacts',
                label: "Contacts I haven't talked to in 30 days",
                icon: 'Clock',
                group: 'Actions',
                action: () => onNavigate?.('stale'),
            },
        ],
        [onCreateContact, onNavigate]
    );

    // Build results: contacts + commands filtered by query
    const results = useMemo(() => {
        const q = query.toLowerCase().trim();
        const items = [];

        // Filter commands
        const matchedCommands = commands.filter(
            (cmd) => !q || cmd.label.toLowerCase().includes(q)
        );
        if (matchedCommands.length > 0) {
            items.push({ type: 'group', label: 'Commands' });
            matchedCommands.forEach((cmd) =>
                items.push({ type: 'command', ...cmd })
            );
        }

        // Filter contacts
        const matchedContacts = (contacts || []).filter((c) => {
            if (!q) return true;
            const fm = c.frontmatter;
            return (
                fm.name?.toLowerCase().includes(q) ||
                fm.company?.toLowerCase().includes(q) ||
                fm.email?.toLowerCase().includes(q)
            );
        });

        if (matchedContacts.length > 0) {
            items.push({ type: 'group', label: 'Contacts' });
            matchedContacts.forEach((c) =>
                items.push({
                    type: 'contact',
                    id: c.id,
                    label: c.frontmatter.name,
                    subtitle: c.frontmatter.company,
                    icon: 'User',
                    action: () => onSelectContact?.(c.id),
                })
            );
        }

        return items;
    }, [query, commands, contacts, onSelectContact]);

    // Selectable items only (not group headers)
    const selectableItems = results.filter((r) => r.type !== 'group');

    // Keyboard handler
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
                setQuery('');
                setSelectedIndex(0);
                return;
            }

            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                setIsOpen(false);
                setQuery('');
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < selectableItems.length - 1 ? prev + 1 : 0
                );
                return;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : selectableItems.length - 1
                );
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                const item = selectableItems[selectedIndex];
                if (item?.action) {
                    item.action();
                    setIsOpen(false);
                    setQuery('');
                }
                return;
            }
        },
        [isOpen, selectableItems, selectedIndex]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const open = useCallback(() => {
        setIsOpen(true);
        setQuery('');
        setSelectedIndex(0);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setQuery('');
    }, []);

    return {
        isOpen,
        query,
        setQuery,
        results,
        selectableItems,
        selectedIndex,
        setSelectedIndex,
        open,
        close,
    };
}
