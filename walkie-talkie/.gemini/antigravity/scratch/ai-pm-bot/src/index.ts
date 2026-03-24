import { App, LogLevel } from '@slack/bolt';
import { config } from './config';
import { registerCommands } from './bot/commands';
import { scheduleDailyDigest } from './services/dailyDigest';

// Initialize Slack App
const app = new App({
    token: config.slack.botToken,
    signingSecret: config.slack.signingSecret,
    socketMode: true,
    appToken: config.slack.appToken,
    logLevel: LogLevel.INFO,
});

// Register slash commands
registerCommands(app);

// Start the app
(async () => {
    await app.start();
    console.log('⚡️ AI PM Bot is running!');

    // Schedule Daily Digest (runs at 9 AM)
    scheduleDailyDigest(app);
})();
