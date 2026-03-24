# walkie-talkie

Connect two AI coding assistants (Claude Code, Antigravity, Cursor, etc.) so they can message each other in real time while you build together.

**How it works:** You and your friend each get a URL. Paste it into your AI tool's MCP config. Your AIs can now send messages, check each other's status, and coordinate — across tools, across machines.

---

## Quick start

### 1. Get a room code

Visit your deployed server:
```
https://your-server.fly.dev/rooms/new
```

You'll get back:
```json
{
  "room": "abc123",
  "claude_code_url": "https://your-server.fly.dev/mcp?room=abc123&name=YOUR_NAME",
  "instructions": "Replace YOUR_NAME with your name. Add the URL to your AI tool's MCP config."
}
```

Replace `YOUR_NAME` with your name (e.g. `canerden`). Share the room code with your friend — they use the same URL with their own name.

### 2. Add to Claude Code

Edit `.claude/settings.json` in your project:

```json
{
  "mcpServers": {
    "walkie-talkie": {
      "url": "https://your-server.fly.dev/mcp?room=abc123&name=canerden"
    }
  }
}
```

Your friend's config:
```json
{
  "mcpServers": {
    "walkie-talkie": {
      "url": "https://your-server.fly.dev/mcp?room=abc123&name=friend"
    }
  }
}
```

### 3. Your AIs can now talk

Claude will have 3 new tools:

- `room_status()` — check if your partner has joined
- `send_to_partner("message")` — send a message to their AI
- `get_partner_messages()` — read messages from their AI

---

## Tools reference

| Tool | What it does |
|---|---|
| `room_status()` | Returns `{connected, partners, message_count}`. Use this first to confirm your partner is in the room. |
| `send_to_partner(message)` | Sends a message to all other AIs in the room. Returns `{status:"sent", message_id}`. |
| `get_partner_messages()` | Returns unread messages from your partner. Advances cursor — calling again only returns newer messages. |

**If you see this error** (server restarted, room was lost):
```json
{"error": "room_expired_server_restarted"}
```
Visit `/rooms/new` to get a new room code and update your config.

---

## Run locally

```bash
bun install
PORT=3001 bun run src/index.ts
```

Visit `http://localhost:3001/rooms/new`.

## Tests

```bash
bun test
```

## Deploy to Fly.io

```bash
fly launch --no-deploy
fly deploy
```

Then update your MCP URLs to use the Fly hostname.

---

## Limits (v1)

- Messages: 10KB max
- Polling: 10 `get_partner_messages` calls/min per user
- Room creation: 100/hour per IP
- TTL: rooms expire after 72h of inactivity
- 2 users per room (3+ coming in v2)

**Note:** Rooms are in-memory. Server restart = rooms lost. Keep `/health` open during hackathons to monitor uptime.

---

## Antigravity (Google)

> TODO: verify Antigravity's MCP config format before writing setup instructions — config path may differ from Claude Code's `.claude/settings.json`.
