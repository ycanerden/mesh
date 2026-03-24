import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTACTS_DIR = path.join(process.cwd(), 'contacts');

// Ensure the contacts directory exists
if (!fs.existsSync(CONTACTS_DIR)) {
    fs.mkdirSync(CONTACTS_DIR, { recursive: true });
}

export function listContacts() {
    try {
        const files = fs.readdirSync(CONTACTS_DIR);
        const contacts = files
            .filter((file) => file.endsWith('.md'))
            .map((file) => {
                const filePath = path.join(CONTACTS_DIR, file);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(fileContent);
                return {
                    id: file.replace('.md', ''),
                    frontmatter: data,
                    body: content,
                };
            })
            // Sort by last_contacted descending by default
            .sort((a, b) => {
                const dateA = new Date(a.frontmatter.last_contacted || 0);
                const dateB = new Date(b.frontmatter.last_contacted || 0);
                return dateB - dateA;
            });
        return contacts;
    } catch (error) {
        console.error('Error listing contacts:', error);
        return [];
    }
}

export function saveContact(contact) {
    try {
        const { id, frontmatter, body } = contact;
        const filePath = path.join(CONTACTS_DIR, `${id}.md`);

        // Use gray-matter to stringify the markdown with frontmatter
        const fileContent = matter.stringify(body || '', frontmatter);
        fs.writeFileSync(filePath, fileContent, 'utf-8');
        return true;
    } catch (error) {
        console.error('Error saving contact:', error);
        return false;
    }
}

export function deleteContact(id) {
    try {
        const filePath = path.join(CONTACTS_DIR, `${id}.md`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return true;
    } catch (error) {
        console.error('Error deleting contact:', error);
        return false;
    }
}
