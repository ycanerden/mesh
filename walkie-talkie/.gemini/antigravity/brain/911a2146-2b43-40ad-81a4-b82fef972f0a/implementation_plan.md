# AI Project Manager Bot - Implementation Plan

## Goal
Build an AI-powered Slack bot that acts as a "Scrum Master", aggregating data from Jira, GitHub, and Google Workspace to provide daily digests, blocker alerts, and meeting briefs.

## User Review Required
> [!IMPORTANT]
> **Slack App Setup**: You will need to create a Slack App at `api.slack.com` and provide the `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET`.
> **Integration Keys**: Jira, GitHub, and Google APIs will require their own OAuth tokens or Personal Access Tokens.

## Proposed Stack
- **Runtime**: Node.js (TypeScript)
- **Framework**: `@slack/bolt` (Official Slack SDK)
- **Database**: Supabase (Postgres for user/team data, `pgvector` for RAG)
- **AI**: OpenAI (GPT-4o) for summarization and reasoning
- **Scheduling**: `node-cron` for Daily Digests

## Architecture

### 1. Project Structure
```text
/src
  /config      # Env vars & secrets
  /bot         # Slack listeners (commands, events)
  /services    # Logic for Digests, Briefs
  /integrations
     /github   # GitHub API client
     /jira     # Jira API client
     /google   # Google Calendar/Drive clients
  /rag         # Vector store & LLM interaction
  index.ts     # Entry point
```

### 2. Data Flow (RAG)
1.  **Ingestion**: Background jobs fetch data from integrations every X hours.
2.  **Indexing**: Summarize raw data (commits, tickets) -> Embedding -> Supabase Vector.
3.  **Retrieval**: When generating a Digest, query relevant vectors for "yesterday's work".
4.  **Generation**: LLM constructs the "Daily Digest" or "Pre-meeting Brief".

### 3. Core Features (MVP)
- **Daily Digest**: A scheduled job (e.g., 9 AM) fetches the last 24h of data and posts to a specific channel.
- **Slash Commands**: `/pm-status` triggers an immediate retrieval and summary generation.
- **Blocker Detection**: Heuristic check (e.g., "Ticket in Progress > 3 days") + LLM analysis of comments.

## Verification
- **Test**: Run the bot locally using `ngrok` or similar to tunnel Slack events.
- **Validation**: Verify the bot responds to `/pm-status` with dummy data first, then real integration data.
