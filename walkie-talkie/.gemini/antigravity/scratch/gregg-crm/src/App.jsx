import { useState, useCallback } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import PipelineView from './components/PipelineView';
import TableView from './components/TableView';
import DetailPanel from './components/ContactDetail';
import CommandPalette from './components/CommandPalette';
import ContactEditor from './components/ContactEditor';
import EmptyState from './components/EmptyState';
import SettingsModal from './components/SettingsModal';
import { useContacts } from './hooks/useContacts';
import { useCommandPalette } from './hooks/useCommandPalette';
import { getStaleContactsSync } from './lib/contacts';
import { Plus, LayoutGrid, List } from 'lucide-react';

function App() {
    const {
        contacts,
        selectedContact,
        selectedId,
        searchQuery,
        activeFilter,
        tags,
        selectContact,
        setSearchQuery,
        setActiveFilter,
        clearFilter,
        createContact,
        updateContact,
        removeContact,
        logActivity,
        loadContacts,
        updateContactField,
    } = useContacts();

    const [showEditor, setShowEditor] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' | 'table'
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    }, []);

    const handleCreateContact = useCallback(
        async (data) => {
            const notes = data.notes || '';
            delete data.notes;
            const contact = await createContact(data);
            if (notes) {
                await updateContact({
                    ...contact,
                    body: `## Notes\n${notes}\n\n## Activity\n- **${new Date().toISOString().slice(0, 10)}** — Contact created`,
                });
            }
            setShowEditor(false);
            showToast(`${data.name} added`);
        },
        [createContact, updateContact, showToast]
    );

    const handleNavigate = useCallback(
        (target) => {
            if (target === 'all') clearFilter();
            else if (target === 'stale') setActiveFilter({ type: 'stale' });
        },
        [clearFilter, setActiveFilter]
    );

    const handleSelectContact = useCallback(
        (id) => {
            selectContact(id);
        },
        [selectContact]
    );

    const handleCloseDetail = useCallback(() => {
        selectContact(null);
    }, [selectContact]);

    const displayContacts =
        activeFilter?.type === 'stale' ? getStaleContactsSync(contacts, 30) : contacts;

    // Command palette
    const {
        isOpen: paletteOpen,
        query: paletteQuery,
        setQuery: setPaletteQuery,
        results: paletteResults,
        selectableItems: paletteSelectableItems,
        selectedIndex: paletteSelectedIndex,
        setSelectedIndex: setPaletteSelectedIndex,
        open: openPalette,
        close: closePalette,
    } = useCommandPalette({
        contacts: displayContacts,
        onSelectContact: handleSelectContact,
        onCreateContact: () => setShowEditor(true),
        onNavigate: handleNavigate,
    });

    // View title
    const getViewTitle = () => {
        if (activeFilter?.type === 'status') {
            return `${activeFilter.value.charAt(0).toUpperCase() + activeFilter.value.slice(1)} Contacts`;
        }
        if (activeFilter?.type === 'stale') return 'Needs Follow-up';
        if (activeFilter?.type === 'tag') {
            return activeFilter.value.charAt(0).toUpperCase() + activeFilter.value.slice(1);
        }
        return 'All Contacts';
    };

    return (
        <div className="app">
            <Sidebar
                contacts={displayContacts}
                searchQuery={searchQuery}
                activeFilter={activeFilter}
                tags={tags}
                onSearchChange={setSearchQuery}
                onFilterChange={setActiveFilter}
                onClearFilter={clearFilter}
                onNewContact={() => setShowEditor(true)}
                onOpenPalette={openPalette}
                onOpenSettings={() => setShowSettings(true)}
            />

            <div className="main-content">
                {/* View Header */}
                <div className="view-header">
                    <div className="view-header-left">
                        <h2>{getViewTitle()}</h2>
                        <div className="view-tabs">
                            <button
                                className={`view-tab ${viewMode === 'pipeline' ? 'active' : ''}`}
                                onClick={() => setViewMode('pipeline')}
                            >
                                <LayoutGrid size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                Pipeline
                            </button>
                            <button
                                className={`view-tab ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                <List size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                Table
                            </button>
                        </div>
                    </div>
                    <div className="view-header-right">
                        <button className="header-btn-primary header-btn" onClick={() => setShowEditor(true)}>
                            <Plus size={14} />
                            New Contact
                        </button>
                    </div>
                </div>

                {/* Content */}
                {displayContacts.length === 0 ? (
                    <EmptyState
                        onOpenPalette={openPalette}
                        onNewContact={() => setShowEditor(true)}
                    />
                ) : viewMode === 'pipeline' ? (
                    <PipelineView
                        contacts={displayContacts}
                        onSelectContact={handleSelectContact}
                        onUpdateStatus={(id, status) => {
                            updateContactField(id, 'status', status);
                            showToast('Status updated');
                        }}
                    />
                ) : (
                    <TableView
                        contacts={displayContacts}
                        onSelectContact={handleSelectContact}
                    />
                )}

                {/* Detail Panel (slide-in) */}
                {selectedContact && (
                    <DetailPanel
                        contact={selectedContact}
                        onClose={handleCloseDetail}
                        onUpdate={(updated) => {
                            updateContact(updated);
                            showToast('Contact updated');
                        }}
                        onDelete={(id) => {
                            const name = selectedContact.frontmatter.name;
                            removeContact(id);
                            showToast(`${name} deleted`);
                        }}
                        onLogActivity={(id, text) => {
                            logActivity(id, text);
                            showToast('Activity logged');
                        }}
                        onUpdateField={(id, field, value) => {
                            updateContactField(id, field, value);
                            if (field === 'status') showToast('Status updated');
                            else if (field === 'tags') showToast('Tags updated');
                        }}
                    />
                )}
            </div>

            {/* Command Palette */}
            <CommandPalette
                isOpen={paletteOpen}
                query={paletteQuery}
                results={paletteResults}
                selectableItems={paletteSelectableItems}
                selectedIndex={paletteSelectedIndex}
                onQueryChange={setPaletteQuery}
                onSelectIndex={setPaletteSelectedIndex}
                onClose={closePalette}
            />

            {/* Contact Editor */}
            {showEditor && (
                <ContactEditor
                    onSave={handleCreateContact}
                    onClose={() => setShowEditor(false)}
                />
            )}

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                    onSave={() => showToast('Settings saved')}
                />
            )}

            {/* Toast */}
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}

export default App;
