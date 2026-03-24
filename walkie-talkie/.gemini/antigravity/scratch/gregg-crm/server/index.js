import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { listContacts, saveContact, deleteContact } from './fs-storage.js';

// Load environment variables from .env if it exists
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure contacts directory exists on startup
const CONTACTS_DIR = path.join(process.cwd(), 'contacts');
if (!fs.existsSync(CONTACTS_DIR)) {
    fs.mkdirSync(CONTACTS_DIR, { recursive: true });
}

// ── Contact Endpoints ── //

app.get('/api/contacts', (req, res) => {
    try {
        const contacts = listContacts();
        res.json(contacts);
    } catch (error) {
        console.error('Failed to list contacts:', error);
        res.status(500).json({ error: 'Failed to list contacts' });
    }
});

app.post('/api/contacts', (req, res) => {
    try {
        const contact = req.body;
        if (!contact || !contact.id) {
            return res.status(400).json({ error: 'Invalid contact data' });
        }

        const success = saveContact(contact);
        if (success) {
            res.status(201).json({ message: 'Contact created successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save contact' });
        }
    } catch (error) {
        console.error('Failed to create contact:', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

app.put('/api/contacts/:id', (req, res) => {
    try {
        const contact = req.body;
        // The ID in the URL and body should match, but we trust the body for the full object
        if (!contact || contact.id !== req.params.id) {
            return res.status(400).json({ error: 'Invalid contact data or ID mismatch' });
        }

        const success = saveContact(contact);
        if (success) {
            res.json({ message: 'Contact updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to update contact' });
        }
    } catch (error) {
        console.error('Failed to update contact:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

app.delete('/api/contacts/:id', (req, res) => {
    try {
        const id = req.params.id;
        const success = deleteContact(id);
        if (success) {
            res.json({ message: 'Contact deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete contact' });
        }
    } catch (error) {
        console.error('Failed to delete contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// ── App Settings (API Keys) ── //

app.get('/api/settings', (req, res) => {
    // Read the current .env values (only safe ones for the frontend if needed, but here we just return them)
    // Note: In a real app, you wouldn't send API keys to the frontend, but for a local-first app, it's fine for the settings UI.
    const keys = {
        LLM_API_KEY: process.env.LLM_API_KEY || '',
        LLM_PROVIDER: process.env.LLM_PROVIDER || 'google',
        NOTION_API_KEY: process.env.NOTION_API_KEY || '',
        NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID || '',
    };
    res.json(keys);
});

app.post('/api/settings', (req, res) => {
    try {
        const newSettings = req.body;
        const envPath = path.join(process.cwd(), '.env');

        let envVars = {};
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    if (key) envVars[key] = value;
                }
            });
        }

        // Merge new settings
        envVars = { ...envVars, ...newSettings };

        // Write back to .env
        const newEnvContent = Object.entries(envVars)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        fs.writeFileSync(envPath, newEnvContent, 'utf-8');

        // Reload into active process.env
        dotenv.config({ override: true });

        res.json({ message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Failed to save settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

app.listen(PORT, () => {
    console.log(`Greg CRM Local Backend running on http://localhost:${PORT}`);
    console.log(`Contacts directory: ${CONTACTS_DIR}`);
});
