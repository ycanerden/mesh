import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

/**
 * Generate a project status summary using GPT
 */
export async function generateStatusSummary(data: {
    commits: { author: string; message: string }[];
    issues: { key: string; summary: string; status: string; assignee: string | null }[];
}): Promise<string> {
    const prompt = `You are an AI Scrum Master. Generate a concise, Slack-friendly project status summary based on this data:

**Recent GitHub Commits (last 24h):**
${data.commits.map((c) => `- ${c.author}: ${c.message}`).join('\n') || 'No commits'}

**Recent Jira Updates:**
${data.issues.map((i) => `- [${i.key}] ${i.summary} (${i.status}) - ${i.assignee || 'Unassigned'}`).join('\n') || 'No updates'}

Format the output as a brief Slack message with:
1. A one-line overall status (using emoji)
2. Key highlights (bullet points, max 5)
3. Any concerns or attention needed

Keep it under 200 words. Use Slack markdown (e.g., *bold*, \`code\`).`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
        });
        return response.choices[0].message.content || 'Unable to generate summary.';
    } catch (error) {
        console.error('OpenAI error:', error);
        return 'Failed to generate AI summary. Please check API configuration.';
    }
}

/**
 * Generate a pre-meeting brief
 */
export async function generateMeetingBrief(data: {
    meetingTitle: string;
    attendees: string[];
    relatedIssues: { key: string; summary: string; status: string }[];
    recentCommits: { author: string; message: string }[];
}): Promise<string> {
    const prompt = `You are an AI assistant preparing a founder for an important meeting.

**Meeting:** ${data.meetingTitle}
**Attendees:** ${data.attendees.join(', ')}

**Related Jira Issues:**
${data.relatedIssues.map((i) => `- [${i.key}] ${i.summary} → ${i.status}`).join('\n') || 'None found'}

**Recent Development Activity:**
${data.recentCommits.map((c) => `- ${c.author}: ${c.message}`).join('\n') || 'No recent commits'}

Create a brief that includes:
1. **Status Summary**: What's the actual state of work?
2. **Talking Points**: 3 key things to bring up
3. **Risks/Blockers**: Anything to be aware of
4. **Questions to Ask**: If this is a client meeting

Keep it actionable and under 250 words. Use Slack markdown.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 600,
        });
        return response.choices[0].message.content || 'Unable to generate brief.';
    } catch (error) {
        console.error('OpenAI error:', error);
        return 'Failed to generate meeting brief.';
    }
}
