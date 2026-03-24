import { getStaleInProgressIssues } from '../integrations/jira/client';
import { getStalePRs } from '../integrations/github/client';

interface Blocker {
    assignee: string;
    summary: string;
    daysStuck: number;
    source: 'jira' | 'github';
}

// TODO: Make these configurable
const GITHUB_OWNER = 'your-org';
const GITHUB_REPO = 'your-repo';
const JIRA_PROJECT = 'YOUR_PROJECT';

/**
 * Detect potential blockers across Jira and GitHub
 */
export async function getBlockers(): Promise<Blocker[]> {
    const [staleIssues, stalePRs] = await Promise.all([
        getStaleInProgressIssues(JIRA_PROJECT),
        getStalePRs(GITHUB_OWNER, GITHUB_REPO),
    ]);

    const blockers: Blocker[] = [];

    // Jira blockers
    for (const issue of staleIssues) {
        const daysSinceUpdate = Math.floor(
            (Date.now() - new Date(issue.updated).getTime()) / (1000 * 60 * 60 * 24)
        );
        blockers.push({
            assignee: issue.assignee || 'Unassigned',
            summary: `[${issue.key}] ${issue.summary}`,
            daysStuck: daysSinceUpdate,
            source: 'jira',
        });
    }

    // GitHub blockers (stale PRs)
    for (const pr of stalePRs) {
        const daysSinceCreated = Math.floor(
            (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        blockers.push({
            assignee: pr.author,
            summary: `PR #${pr.number}: ${pr.title}`,
            daysStuck: daysSinceCreated,
            source: 'github',
        });
    }

    // Sort by days stuck (worst first)
    return blockers.sort((a, b) => b.daysStuck - a.daysStuck);
}
