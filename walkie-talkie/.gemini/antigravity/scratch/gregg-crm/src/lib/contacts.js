// Contact CRUD operations using local Node.js backend

const API_BASE = 'http://localhost:3001/api';

// Get all contacts
export async function listContacts() {
    try {
        const response = await fetch(`${API_BASE}/contacts`);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        return await response.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

// Get single contact by id
export async function getContact(id) {
    const contacts = await listContacts();
    return contacts.find((c) => c.id === id) || null;
}

// Save (create) a contact
export async function saveContact(contact) {
    try {
        const response = await fetch(`${API_BASE}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact),
        });
        if (!response.ok) throw new Error('Failed to save contact');
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// Update a contact
export async function updateContactOnDisk(id, contact) {
    try {
        const response = await fetch(`${API_BASE}/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact),
        });
        if (!response.ok) throw new Error('Failed to update contact');
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// Delete a contact
export async function deleteContact(id) {
    try {
        const response = await fetch(`${API_BASE}/contacts/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete contact');
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// Search contacts by query
export async function searchContacts(query) {
    const contacts = await listContacts();
    const q = query.toLowerCase().trim();

    if (!q) return contacts;

    return contacts.filter((c) => {
        const fm = c.frontmatter;
        return (
            fm.name?.toLowerCase().includes(q) ||
            fm.company?.toLowerCase().includes(q) ||
            fm.email?.toLowerCase().includes(q) ||
            fm.role?.toLowerCase().includes(q) ||
            fm.tags?.some((t) => t.toLowerCase().includes(q)) ||
            (c.body && c.body.toLowerCase().includes(q))
        );
    });
}

// Filter contacts by tag
export async function filterByTag(tag) {
    const contacts = await listContacts();
    return contacts.filter((c) => c.frontmatter.tags?.includes(tag));
}

// Filter contacts by status
export async function filterByStatus(status) {
    const contacts = await listContacts();
    return contacts.filter((c) => c.frontmatter.status === status);
}

// Get all unique tags
export async function getAllTags() {
    const contacts = await listContacts();
    const tags = new Set();
    contacts.forEach((c) => {
        c.frontmatter.tags?.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
}

// Generate a slug id from a name
export function generateId(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Add activity entry to a contact
export async function addActivity(contactId, text) {
    const contact = await getContact(contactId);
    if (!contact) return null;

    const today = new Date().toISOString().slice(0, 10);
    const entry = `- **${today}** — ${text}`;

    // Find the Activity section and prepend the new entry
    if (contact.body && contact.body.includes('## Activity')) {
        const parts = contact.body.split('## Activity');
        contact.body = parts[0] + '## Activity\n' + entry + '\n' + parts[1];
    } else {
        contact.body = (contact.body || '') + `\n\n## Activity\n${entry}`;
    }

    contact.frontmatter.last_contacted = today;
    await updateContactOnDisk(contactId, contact);
    return contact;
}

// Get contacts not contacted in N days
export function getStaleContactsSync(contacts, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return contacts.filter((c) => {
        if (!c.frontmatter.last_contacted) return true;
        return new Date(c.frontmatter.last_contacted) < cutoff;
    });
}
