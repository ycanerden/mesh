# Mesh Restart Guide — Next Session

Everything expires after a session ends: the room code, the localtunnel URL, the agents.
The code stays. Use this to get back up in 5 minutes.

---

## Step 1: Start the Server (Canerden's machine)

```bash
cd /Users/canerden/walkie-talkie
bun install  # only needed once
PORT=3001 bun run src/index.ts
```

Keep this terminal running.

---

## Step 2: Create Public Tunnel (new terminal)

```bash
npx localtunnel --port 3001
# Output: your url is: https://something.loca.lt
# SAVE THIS URL
```

Keep this terminal running.

---

## Step 3: Create a New Room

```bash
curl -s https://[YOUR_LOCALTUNNEL_URL]/rooms/new -H "bypass-tunnel-reminder: true"
# Output: {"room":"abc123", ...}
# SAVE THE ROOM CODE
```

---

## Step 4: Configure Alfred (Canerden's Claude Code)

Edit `/Users/canerden/walkie-talkie/.claude/settings.json`:

```json
{
  "mcpServers": {
    "walkie-talkie": {
      "command": "bun",
      "args": ["/Users/canerden/walkie-talkie/walkie-mcp.ts"],
      "env": {
        "SERVER_URL": "http://localhost:3001",
        "ROOM": "[ROOM_CODE]",
        "NAME": "Alfred"
      }
    }
  }
}
```

Restart Claude Code from `/Users/canerden/walkie-talkie`.

---

## Step 5: Share Room URL with Vincent

Send Vincent: `https://[YOUR_LOCALTUNNEL_URL]/rooms/new` → they create their own room or join yours.

For Jarvis to join YOUR room, Vincent adds to their Claude Code settings:
```json
{
  "mcpServers": {
    "walkie-talkie": {
      "url": "https://[YOUR_LOCALTUNNEL_URL]/mcp?room=[ROOM_CODE]&name=Jarvis"
    }
  }
}
```

---

## Step 6: Verify

```bash
curl -s "https://[YOUR_LOCALTUNNEL_URL]/api/status?room=[ROOM_CODE]&name=Alfred" \
  -H "bypass-tunnel-reminder: true"
# Should show: {"ok":true,"connected":true,"partners":["Jarvis"],...}
```

---

## Agent Bridge (Alfred ↔ Jarvis over WiFi)

Already configured. Both machines need to be on the same WiFi.
- Canerden's machine: agent-bridge runs on port 8788
- Vincent's machine: `PARTNER_IP` in their MCP config points to Canerden's IP

Check Canerden's IP: `ipconfig getifaddr en0`

---

## Quick Test After Restart

```bash
# Check room is live
curl -s "http://localhost:3001/health"

# Check tunnel works
curl -s "https://[TUNNEL_URL]/health" -H "bypass-tunnel-reminder: true"

# Check room status
curl -s "https://[TUNNEL_URL]/api/status?room=[ROOM]&name=Alfred" -H "bypass-tunnel-reminder: true"
```

All three should return `{"status":"ok"...}` or `{"ok":true...}`.
