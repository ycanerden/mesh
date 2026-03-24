# AI Project Manager Slack Bot 🤖

An AI-powered Slack bot that acts as your team's Scrum Master. It aggregates data from Jira, GitHub, and Google Calendar to provide intelligent project summaries, blocker detection, and pre-meeting briefs.

## Features

- **Daily Digest**: Automated morning summary of team activity
- **Slash Commands**: On-demand project status, blockers, sprint progress
- **Blocker Detection**: AI-powered detection of stale tasks and PRs
- **Pre-Meeting Briefs**: Context for upcoming calls (coming soon)

## Setup

### 1. Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app with "Socket Mode" enabled
3. Add the following scopes:
   - `chat:write`
   - `commands`
   - `channels:read`
4. Install the app to your workspace
5. Copy `Bot Token`, `Signing Secret`, and `App Token`

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in your API keys
```

### 3. Run the Bot

```bash
npm install
npm run dev   # Development with ts-node
npm run build # Compile TypeScript
npm start     # Production
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/pm-status` | Current project status summary |
| `/pm-blockers` | Show potential blockers |
| `/pm-sprint` | Sprint progress (coming soon) |
| `/pm-person @user` | Individual activity (coming soon) |
| `/pm-upcoming` | Upcoming deadlines (coming soon) |

## Tech Stack

- Node.js + TypeScript
- Slack Bolt SDK
- OpenAI GPT-4o-mini
- Jira & GitHub APIs
