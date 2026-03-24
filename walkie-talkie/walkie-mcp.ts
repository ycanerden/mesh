/**
 * Walkie-Talkie stdio MCP bridge
 * Calls simple REST endpoints on the walkie-talkie server.
 *
 * Env vars:
 *   SERVER_URL — base URL (default: http://localhost:3001)
 *   ROOM       — room code
 *   NAME       — agent name
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";
const ROOM = process.env.ROOM || "";
const NAME = process.env.NAME || "Agent";
const BASE = `${SERVER_URL}/api`;

const mcp = new Server({ name: "walkie-talkie", version: "1.0.0" }, { capabilities: { tools: {} } });

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "room_status",
      description: "Check if your partner has joined the room.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "send_to_partner",
      description: "Send a message to your partner's AI.",
      inputSchema: {
        type: "object" as const,
        properties: { message: { type: "string", description: "The message to send" } },
        required: ["message"],
      },
    },
    {
      name: "get_partner_messages",
      description: "Get unread messages from your partner's AI.",
      inputSchema: { type: "object" as const, properties: {} },
    },
  ],
}));

mcp.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const params = `?room=${ROOM}&name=${NAME}`;

  try {
    if (name === "room_status") {
      const res = await fetch(`${BASE}/status${params}`);
      const data = await res.json();
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "get_partner_messages") {
      const res = await fetch(`${BASE}/messages${params}`);
      const data = await res.json() as { ok: boolean; messages?: Array<{from: string; content: string; ts: number}> };
      if (!data.ok || !data.messages?.length) {
        return { content: [{ type: "text" as const, text: "No new messages." }] };
      }
      const formatted = data.messages
        .map((m) => `[${m.from} @ ${new Date(m.ts).toISOString()}]\n${m.content}`)
        .join("\n\n---\n\n");
      return { content: [{ type: "text" as const, text: formatted }] };
    }

    if (name === "send_to_partner") {
      const { message } = args as { message: string };
      const res = await fetch(`${BASE}/send${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      return { content: [{ type: "text" as const, text: data.ok ? `Sent ✓ (id: ${data.id})` : `Error: ${data.error}` }] };
    }

    return { content: [{ type: "text" as const, text: `Unknown tool: ${name}` }] };
  } catch (e: unknown) {
    return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }] };
  }
});

const transport = new StdioServerTransport();
await mcp.connect(transport);
