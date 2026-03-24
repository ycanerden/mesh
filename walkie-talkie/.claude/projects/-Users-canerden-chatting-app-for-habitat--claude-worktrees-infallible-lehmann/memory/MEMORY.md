# Memory — Greg CRM Project

## User Preferences
- Never use emojis in responses or code
- Non-technical founder, clean UI is non-negotiable
- Prefers concise, direct communication

## Project
- Greg is a markdown-first, agent-native CRM built at `/Users/canerden/greg`
- Contacts stored as `.md` files in `~/greg-contacts/` (YAML frontmatter + body)
- Next.js web app (switched from Electron due to black screen issue)
- Claude Haiku (`claude-haiku-4-5-20251001`) as the AI brain to save costs
- Folk CRM-inspired light/cream aesthetic

## Key Files
- `/Users/canerden/greg/lib/contacts.ts` — file system operations
- `/Users/canerden/greg/lib/types.ts` — Contact, AgentAction types
- `/Users/canerden/greg/components/` — all UI components
- `/Users/canerden/greg/.env.local` — ANTHROPIC_API_KEY

## Architecture Notes
- The contacts folder IS the database — any tool can write .md files there
- 3-second polling for file changes (no WebSockets needed)
- Agent always proposes actions first, user approves before any file writes
- Activity Log appended to each contact's .md file (full audit trail)
