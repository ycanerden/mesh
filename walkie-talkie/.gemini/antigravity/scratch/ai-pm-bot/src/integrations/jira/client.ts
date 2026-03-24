import { config } from '../../config';

interface JiraIssue {
    key: string;
    summary: string;
    status: string;
    assignee: string | null;
    updated: string;
    created: string;
}

/**
 * Fetch issues from Jira (current sprint or recent)
 */
export async function getRecentIssues(projectKey: string): Promise<JiraIssue[]> {
    const jql = encodeURIComponent(`project = ${projectKey} AND updated >= -7d ORDER BY updated DESC`);
    const url = `https://${config.jira.domain}/rest/api/3/search?jql=${jql}&maxResults=50`;

    try {
        const auth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Jira API error: ${response.status}`);
            return [];
        }

        const data = await response.json() as { issues: any[] };
        return data.issues.map((issue: any) => ({
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            assignee: issue.fields.assignee?.displayName || null,
            updated: issue.fields.updated,
            created: issue.fields.created,
        }));
    } catch (error) {
        console.error('Failed to fetch Jira issues:', error);
        return [];
    }
}

/**
 * Detect stale "In Progress" issues (no updates for >3 days)
 */
export async function getStaleInProgressIssues(projectKey: string): Promise<JiraIssue[]> {
    const jql = encodeURIComponent(
        `project = ${projectKey} AND status = "In Progress" AND updated <= -3d ORDER BY updated ASC`
    );
    const url = `https://${config.jira.domain}/rest/api/3/search?jql=${jql}&maxResults=50`;

    try {
        const auth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Jira API error: ${response.status}`);
            return [];
        }

        const data = await response.json() as { issues: any[] };
        return data.issues.map((issue: any) => ({
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            assignee: issue.fields.assignee?.displayName || null,
            updated: issue.fields.updated,
            created: issue.fields.created,
        }));
    } catch (error) {
        console.error('Failed to fetch stale Jira issues:', error);
        return [];
    }
}
