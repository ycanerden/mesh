import { useState, useEffect, useCallback } from 'react';
import {
    listContacts,
    saveContact as saveContactToDisk,
    updateContactOnDisk,
    deleteContact as deleteContactFromDisk,
    searchContacts,
    filterByTag,
    filterByStatus,
    getAllTags,
    generateId,
    addActivity as addActivityToDisk,
} from '../lib/contacts';

export function useContacts() {
    const [contacts, setContacts] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState(null); // { type: 'tag'|'status', value: string }
    const [tags, setTags] = useState([]);

    // Load contacts asynchronously
    const loadContacts = useCallback(async () => {
        let result;

        if (activeFilter?.type === 'tag') {
            result = await filterByTag(activeFilter.value);
        } else if (activeFilter?.type === 'status') {
            result = await filterByStatus(activeFilter.value);
        } else if (searchQuery) {
            result = await searchContacts(searchQuery);
        } else {
            result = await listContacts();
        }

        setContacts(result);
        const uniqueTags = await getAllTags();
        setTags(uniqueTags);
    }, [searchQuery, activeFilter]);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    const selectedContact = contacts.find((c) => c.id === selectedId) || null;

    const selectContact = useCallback((id) => {
        setSelectedId(id);
    }, []);

    const createContact = useCallback(
        async (data) => {
            const id = generateId(data.name);
            const today = new Date().toISOString().slice(0, 10);
            const contact = {
                id,
                frontmatter: {
                    ...data,
                    created: today,
                    last_contacted: today,
                    status: data.status || 'new',
                    tags: data.tags || [],
                },
                body: `## Notes\n\n\n## Activity\n- **${today}** — Contact created`,
            };
            await saveContactToDisk(contact);
            await loadContacts();
            setSelectedId(id);
            return contact;
        },
        [loadContacts]
    );

    const updateContact = useCallback(
        async (contact) => {
            await updateContactOnDisk(contact.id, contact);
            await loadContacts();
        },
        [loadContacts]
    );

    const updateContactField = useCallback(
        async (id, field, value) => {
            const contact = contacts.find((c) => c.id === id);
            if (!contact) return;

            const updatedContact = {
                ...contact,
                frontmatter: {
                    ...contact.frontmatter,
                    [field]: value,
                },
            };

            await updateContact(updatedContact);
        },
        [contacts, updateContact]
    );

    const removeContact = useCallback(
        async (id) => {
            await deleteContactFromDisk(id);
            if (selectedId === id) {
                setSelectedId(null);
            }
            await loadContacts();
        },
        [selectedId, loadContacts]
    );

    const logActivity = useCallback(
        async (contactId, text) => {
            await addActivityToDisk(contactId, text);
            await loadContacts();
        },
        [loadContacts]
    );

    const clearFilter = useCallback(() => {
        setActiveFilter(null);
        setSearchQuery('');
    }, []);

    return {
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
        updateContactField,
        removeContact,
        logActivity,
        loadContacts,
    };
}
