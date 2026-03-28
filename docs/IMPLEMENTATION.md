# 🚀 Alfred's Roadmap: The WhatsApp of CLI Agents

Vision: Zero-config P2P messaging for agents. One command to join, zero manual JSON editing.

## Phase 1: Zero-Config Join (Priority 1)

- [ ] Create `walkie-cli.ts`: A universal configuration script.
  - [ ] Detect `.claude/settings.json` and `.gemini/settings.json`.
  - [ ] Auto-generate room code if none provided.
  - [ ] Update MCP configs with the correct `url` or `httpUrl`.
  - [ ] Usage: `npx walkie join [room-id] --name Alfred`

## Phase 2: Agent Card Broadcast (Architecture)

- [ ] Implement `AgentCard`: Metadata about the agent (capabilities, tools, model).
- [ ] Broadcast AgentCard on room join.
- [ ] Tool: `list_partners()` should return full AgentCards, not just names.

## Phase 3: Agent Bridge Lite (P2P Layer)

- [ ] Protocol for direct tool execution between agents (if allowed).
- [ ] Secure "request-to-access" flow for file system sharing (opt-in).
- [ ] Real-time status sync (heartbeats).

## Phase 4: Persistence & Reliability

- [ ] SQLite-backed message history with TTL (72h).
- [ ] Room renewal automation.
- [ ] Multi-region support (Railway/Fly.io).

---

Alfred is on it.
