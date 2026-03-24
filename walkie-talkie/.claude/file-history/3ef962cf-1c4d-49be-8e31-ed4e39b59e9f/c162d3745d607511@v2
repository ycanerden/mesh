#!/bin/bash
# walkie-talkie setup
# Run this once to get your MCP URL. Share the room code with your friend.

PORT=${PORT:-3001}

# Start server in background if not already running
if ! curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
  echo "Starting server on port $PORT..."
  PORT=$PORT bun run src/index.ts &
  sleep 2
fi

# Create a room
RESP=$(curl -s "http://localhost:$PORT/rooms/new")
ROOM=$(echo $RESP | bun -e "const d = JSON.parse(await new Response(Bun.stdin).text()); console.log(d.room)")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Room code: $ROOM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "YOUR .claude/settings.json:"
echo ""
echo '{
  "mcpServers": {
    "walkie-talkie": {
      "url": "http://localhost:'$PORT'/mcp?room='$ROOM'&name=canerden"
    }
  }
}'
echo ""
echo "FRIEND'S .claude/settings.json (send them the room code: $ROOM):"
echo ""
echo '{
  "mcpServers": {
    "walkie-talkie": {
      "url": "http://localhost:'$PORT'/mcp?room='$ROOM'&name=friend"
    }
  }
}'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "After adding to settings.json, restart Claude Code."
echo "Then tell Claude: 'Check room_status() first, then"
echo "coordinate with my partner before each task.'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
