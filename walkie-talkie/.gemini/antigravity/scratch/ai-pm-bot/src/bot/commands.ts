import { App } from '@slack/bolt';
import { getProjectStatus } from '../services/statusService';
import { getBlockers } from '../services/blockerService';

/**
 * Register all slash commands for the AI PM Bot
 */
export function registerCommands(app: App) {
    // /pm-status - Get current project status summary
    app.command('/pm-status', async ({ command, ack, say }) => {
        await ack();
        await say(':hourglass_flowing_sand: Generating project status...');

        try {
            const status = await getProjectStatus();
            await say({
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*:chart_with_upwards_trend: Project Status*\n${status}`,
                        },
                    },
                ],
            });
        } catch (error) {
            await say(':x: Failed to generate status. Please try again later.');
        }
    });

    // /pm-blockers - Show current blockers across team
    app.command('/pm-blockers', async ({ command, ack, say }) => {
        await ack();
        await say(':mag: Scanning for blockers...');

        try {
            const blockers = await getBlockers();
            if (blockers.length === 0) {
                await say(':white_check_mark: No blockers detected! Team is flowing.');
            } else {
                const blockerList = blockers
                    .map((b: { assignee: string; summary: string; daysStuck: number }, i: number) => `${i + 1}. *${b.assignee}*: ${b.summary} (${b.daysStuck} days)`)
                    .join('\n');
                await say({
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `:warning: *Potential Blockers*\n${blockerList}`,
                            },
                        },
                    ],
                });
            }
        } catch (error) {
            await say(':x: Failed to scan for blockers.');
        }
    });

    // /pm-sprint - Sprint progress report
    app.command('/pm-sprint', async ({ command, ack, say }) => {
        await ack();
        await say(':runner: Fetching sprint progress...');
        // TODO: Implement sprint progress from Jira
        await say('Sprint progress feature coming soon!');
    });

    // /pm-person @username - Individual activity summary
    app.command('/pm-person', async ({ command, ack, say }) => {
        await ack();
        const username = command.text.trim();
        if (!username) {
            await say(':question: Usage: `/pm-person @username`');
            return;
        }
        await say(`:bust_in_silhouette: Fetching activity for ${username}...`);
        // TODO: Implement per-person summary
        await say(`Activity summary for ${username} coming soon!`);
    });

    // /pm-upcoming - What's due this week/next week
    app.command('/pm-upcoming', async ({ command, ack, say }) => {
        await ack();
        await say(':calendar: Checking upcoming deadlines...');
        // TODO: Implement deadline fetching
        await say('Upcoming deadlines feature coming soon!');
    });
}
