import { config } from '../../config';

interface GitHubCommit {
    sha: string;
    message: string;
    author: string;
    date: string;
    repo: string;
}

interface GitHubPR {
    number: number;
    title: string;
    author: string;
    state: string;
    createdAt: string;
    repo: string;
}

/**
 * Fetch recent commits from a GitHub repository
 */
export async function getRecentCommits(owner: string, repo: string, since?: Date): Promise<GitHubCommit[]> {
    const sinceParam = since ? `&since=${since.toISOString()}` : '';
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50${sinceParam}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${config.github.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            console.error(`GitHub API error: ${response.status}`);
            return [];
        }

        const data = await response.json() as any[];
        return data.map((commit: any) => ({
            sha: commit.sha.slice(0, 7),
            message: commit.commit.message.split('\n')[0], // First line only
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            repo: `${owner}/${repo}`,
        }));
    } catch (error) {
        console.error('Failed to fetch GitHub commits:', error);
        return [];
    }
}

/**
 * Fetch open PRs from a GitHub repository
 */
export async function getOpenPRs(owner: string, repo: string): Promise<GitHubPR[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=50`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${config.github.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            console.error(`GitHub API error: ${response.status}`);
            return [];
        }

        const data = await response.json() as any[];
        return data.map((pr: any) => ({
            number: pr.number,
            title: pr.title,
            author: pr.user.login,
            state: pr.state,
            createdAt: pr.created_at,
            repo: `${owner}/${repo}`,
        }));
    } catch (error) {
        console.error('Failed to fetch GitHub PRs:', error);
        return [];
    }
}

/**
 * Detect stale PRs (no activity for >3 days)
 */
export async function getStalePRs(owner: string, repo: string): Promise<GitHubPR[]> {
    const prs = await getOpenPRs(owner, repo);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    return prs.filter((pr) => new Date(pr.createdAt) < threeDaysAgo);
}
