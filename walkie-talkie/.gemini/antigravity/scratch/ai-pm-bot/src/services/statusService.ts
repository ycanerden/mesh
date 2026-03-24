import { getRecentCommits } from '../integrations/github/client';
import { getRecentIssues } from '../integrations/jira/client';
import { generateStatusSummary } from '../rag/llm';

// TODO: Make these configurable per team
const GITHUB_OWNER = 'your-org';
const GITHUB_REPO = 'your-repo';
const JIRA_PROJECT = 'YOUR_PROJECT';

/**
 * Get aggregated project status for /pm-status command
 */
export async function getProjectStatus(): Promise<string> {
    // Fetch data from integrations
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [commits, issues] = await Promise.all([
        getRecentCommits(GITHUB_OWNER, GITHUB_REPO, yesterday),
        getRecentIssues(JIRA_PROJECT),
    ]);

    // Generate AI summary
    const summary = await generateStatusSummary({
        commits: commits.map((c) => ({ author: c.author, message: c.message })),
        issues: issues.map((i) => ({
            key: i.key,
            summary: i.summary,
            status: i.status,
            assignee: i.assignee,
        })),
    });

    return summary;
}
