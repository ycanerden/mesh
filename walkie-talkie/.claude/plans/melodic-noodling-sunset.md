# Greg — Build Plan

## Context
Greg is a local-first, agent-native CRM for founders. Contacts are markdown files on disk. A Claude-powered agent reads those files, takes actions (email, research, scheduling), and writes activity logs back to the files. The agent is the primary interface via Cmd+K. Clean desktop UI built with Electron + React on top of the markdown layer.

Non-technical founder building with Claude Code. UI must be polished from day one.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Desktop | **Electron** | Easier than Tauri, massive ecosystem, file system access |
| Frontend | **React + TypeScript + Tailwind CSS** | Standard, well-supported, fast to build UI |
| Agent | **Claude API** (`claude-haiku-4-5-20251001`) | The brain — fast + cheap |
| Markdown | **gray-matter** | Parse YAML frontmatter + body |
| File watching | **chokidar** | Watch contacts folder for changes |
| MCP client | **@modelcontextprotocol/sdk** | Gmail, Calendar, web search connectors |
| Build | **electron-vite** | Fast dev server + bundler for Electron |

**Project location:** `~/greg` (separate from existing projects)

---

## Contact File Schema

Every contact = one `.md` file in `~/greg-contacts/`

```markdown
---
name: Sarah Chen
email: sarah@acmecorp.com
company: Acme Corp
title: CEO
tags: [investor, warm, Series-A]
last_contacted: 2026-01-15
next_action: Follow up on deck
next_action_date: 2026-02-01
linkedin: https://linkedin.com/in/sarahchen
twitter: "@sarahchen"
source: a16z event Nov 2025
---

## Notes
Met at a16z event. Building in climate tech. Introduced me to Marcus at Sequoia.

## Activity Log
<!-- Greg appends here automatically — do not edit manually -->

### 2026-01-15 — Email Sent
Greg drafted follow-up re: Series A deck. Reviewed and approved before sending.
```

---

## Project Structure

```
greg/
├── src/
│   ├── main/                    # Electron main process (Node.js)
│   │   ├── agent/
│   │   │   ├── index.ts         # Claude agent loop
│   │   │   ├── tools.ts         # Tool definitions (read/write files, send email)
│   │   │   └── prompts.ts       # System prompt for Greg persona
│   │   ├── contacts/
│   │   │   ├── reader.ts        # Parse .md files with gray-matter
│   │   │   ├── writer.ts        # Write/update .md files
│   │   │   └── watcher.ts       # chokidar file watcher
│   │   ├── mcp/
│   │   │   └── client.ts        # MCP client (Gmail, Calendar)
│   │   └── index.ts             # Electron main entry
│   ├── renderer/                # React frontend
│   │   ├── components/
│   │   │   ├── ContactList/     # Left sidebar: list of contacts
│   │   │   ├── ContactDetail/   # Main panel: contact view + activity log
│   │   │   ├── CommandBar/      # Cmd+K overlay
│   │   │   └── ActionReview/    # "Greg wants to send this email — approve?"
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── shared/
│       └── types.ts             # Contact type, AgentAction type, etc.
├── greg-contacts/               # Default contacts directory
├── package.json
├── electron.vite.config.ts
└── .env                         # ANTHROPIC_API_KEY
```

---

## Build Order

### Phase 1 — Foundation (build first)
1. **Project scaffold** — electron-vite + React + TypeScript + Tailwind
2. **Contact reader** — parse all `.md` files from contacts folder with gray-matter
3. **Contact list UI** — left sidebar showing all contacts, sorted by last_contacted
4. **Contact detail UI** — right panel showing notes + activity log, rendered markdown
5. **Add/edit contact** — create new `.md` file via simple form

### Phase 2 — The Agent (core value)
6. **Claude agent loop** — main process agent that can read contact files + call tools
7. **Cmd+K command bar** — global shortcut opens overlay, user types in natural language
8. **Agent tools**: read_contact, list_contacts, write_activity_log, draft_email (no sending yet)
9. **Action review panel** — before any write, Greg shows a diff: "I'm going to add this to Sarah's log — approve?"

### Phase 3 — Connections
10. **Gmail via MCP** — read emails, send drafts (always draft mode by default)
11. **"Overdue contacts"** — agent proactively surfaces who you haven't talked to in 60+ days
12. **Web research** — look up a contact's company/LinkedIn via Exa MCP
13. **Contact import** — CSV import from Gmail contacts export

---

## Key UX Principles (non-negotiable)
- **Draft, don't send** — Greg never sends email without explicit user approval. Always shows a preview first.
- **Activity log is sacred** — everything Greg does gets appended to the contact's `.md` file. Full audit trail.
- **Cmd+K is the primary interface** — not forms, not buttons. Type what you want.
- **Files are always readable** — open any contact in VS Code, Obsidian, whatever. No lock-in.

---

## Verification / How to Test
1. Run `npm run dev` — Electron app opens
2. Drop a test `.md` contact file in `~/greg-contacts/` — appears in the list instantly (chokidar)
3. Click a contact — see their notes and activity log rendered
4. Hit Cmd+K — type "summarize my relationship with Sarah" — agent responds with a summary
5. Type "draft a follow-up email to Sarah about our last call" — agent shows draft, you click approve
6. Check `~/greg-contacts/sarah-chen.md` — activity log updated with timestamp of the draft
