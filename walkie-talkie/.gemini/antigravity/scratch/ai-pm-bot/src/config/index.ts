import dotenv from 'dotenv';
dotenv.config();

export const config = {
    slack: {
        botToken: process.env.SLACK_BOT_TOKEN || '',
        signingSecret: process.env.SLACK_SIGNING_SECRET || '',
        appToken: process.env.SLACK_APP_TOKEN || '',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
    },
    supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
    },
    github: {
        token: process.env.GITHUB_TOKEN || '',
    },
    jira: {
        token: process.env.JIRA_API_TOKEN || '',
        domain: process.env.JIRA_DOMAIN || '',
        email: process.env.JIRA_EMAIL || '',
    },
};
