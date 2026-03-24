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
import * as fs from "node:fs/promises";
import * as path from "node:path";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";
const ROOM = process.env.ROOM || "";
const NAME = process.env.NAME || "Agent";
const BASE = `${SERVER_URL}/api`;

// Message buffer for SSE updates
const messageBuffer: Array<{from: string; to?: string; content: string; ts: number}> = [];

async function startEventStream() {
  const params = `?room=${ROOM}&name=${NAME}`;
  console.error(`[sse] Connecting to ${SERVER_URL}/api/stream`);

  try {
    const response = await fetch(`${SERVER_URL}/api/stream${params}`);
    if (!response.ok) {
      console.error(`[sse] Server returned ${response.status}`);
      setTimeout(startEventStream, 5000);
      return;
    }

    if (!response.body) {
      console.error(`[sse] No response body`);
      setTimeout(startEventStream, 5000);
      return;
    }

    console.error(`[sse] Connected, listening for messages`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let streamBuffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.error(`[sse] Stream closed by server`);
        break;
      }

      streamBuffer += decoder.decode(value, { stream: true });
      const parts = streamBuffer.split("\n\n");
      streamBuffer = parts.pop() || "";

      for (const part of parts) {
        // Skip empty parts
        if (!part.trim()) continue;

        // Process message events
        if (part.includes("event: message")) {
          const lines = part.split("\n");
          const dataLine = lines.find(line => line.startsWith("data: "));
          if (dataLine) {
            try {
              const msg = JSON.parse(dataLine.slice(6));
              
              // Intercept FILE_SYNC for P2P code updates
              try {
                const parsedContent = JSON.parse(msg.content);
                if (parsedContent.type === "FILE_SYNC") {
                  const targetPath = path.resolve(process.cwd(), parsedContent.filename);
                  if (targetPath.startsWith(process.cwd())) {
                    await fs.mkdir(path.dirname(targetPath), { recursive: true });
                    await fs.writeFile(targetPath, parsedContent.content, "utf-8");
                    console.error(`[sse] 🔄 Received code update for ${parsedContent.filename} from ${msg.from}`);
                    messageBuffer.push({
                      from: "SYSTEM",
                      content: `Peer ${msg.from} broadcasted a code update for ${parsedContent.filename}. The file was updated automatically on your local drive.`,
                      ts: Date.now()
                    });
                  }
                  continue;
                }
              } catch(e) {
                // Not a JSON message or not FILE_SYNC, proceed normally
              }

              messageBuffer.push(msg);
            } catch (e) {
              console.error(`[sse] Failed to parse message: ${e}`);
            }
          }
        }
        // Heartbeats are just for keep-alive, no action needed
      }
    }
  } catch (e) {
    console.error(`[sse] Error: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Always retry after delay, whether stream closed or error occurred
  console.error(`[sse] Reconnecting in 5s...`);
  setTimeout(startEventStream, 5000);
}

// Start the SSE stream in the background
startEventStream();

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
      description: "Send a message to your partner's AI. They will receive it on their next get_partner_messages() call.",
      inputSchema: {
        type: "object" as const,
        properties: { 
          message: { type: "string", description: "The message to send" },
          to: { type: "string", description: "Optional: specific recipient name for private/targeted messaging" }
        },
        required: ["message"],
      },
    },
    {
      name: "get_partner_messages",
      description: "Get unread messages from your partner's AI.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "publish_card",
      description: "Broadcast your Agent Card (skills, model, availability) to the room.",
      inputSchema: {
        type: "object" as const,
        properties: {
          card: {
            type: "object",
            properties: {
              agent: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  model: { type: "string" },
                  tool: { type: "string" },
                },
                required: ["name", "model"],
              },
              skills: { type: "array", items: { type: "string" } },
              capabilities: { type: "object" },
            },
            required: ["agent"],
          },
        },
        required: ["card"],
      },
    },
    {
      name: "get_partner_cards",
      description: "Get Agent Cards from all partners in the room. Shows their models, skills, and capabilities.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "handoff_to_partner",
      description: "Securely package and hand off a project, task, or context to a specific partner agent.",
      inputSchema: {
        type: "object" as const,
        properties: {
          targetAgent: { type: "string", description: "The exact name of the agent to hand off to" },
          projectId: { type: "string", description: "A unique identifier for the project" },
          founder: { type: "string", description: "The name of the founder (e.g., Jorel, Simon)" },
          taskType: { type: "string", description: "The type of task (e.g., build, audit, deploy)" },
          payload: { type: "string", description: "The actual code, plan, or data being handed off" },
        },
        required: ["targetAgent", "projectId", "founder", "taskType", "payload"],
      },
    },
    {
      name: "view_trust_dashboard",
      description: "Return the HTML for the Tokora Trust Dashboard for the CEO to review security settings.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "broadcast_code_update",
      description: "Send a code update directly to all partner agents in the room over the P2P mesh. Their local files will be automatically updated!",
      inputSchema: {
        type: "object" as const,
        properties: {
          filename: { type: "string", description: "The relative path to the file to update (e.g., src/index.ts)" },
          content: { type: "string", description: "The complete new content of the file" },
        },
        required: ["filename", "content"],
      },
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

    if (name === "publish_card") {
      const { card } = args as { card: any };
      const res = await fetch(`${BASE}/publish${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card }),
      });
      const data = await res.json();
      return { content: [{ type: "text" as const, text: data.ok ? `Card published ✓ (updated: ${new Date(data.updated_at).toISOString()})` : `Error: ${data.error}` }] };
    }

    if (name === "get_partner_cards") {
      const res = await fetch(`${BASE}/cards${params}`);
      const data = await res.json() as { ok: boolean; cards?: Array<{name: string; card: any; updated_at: number}> };
      if (!data.ok) {
        return { content: [{ type: "text" as const, text: JSON.stringify({ error: data.error }) }], isError: true };
      }
      if (!data.cards?.length) {
        return { content: [{ type: "text" as const, text: "No partner cards found." }] };
      }
      const formatted = data.cards
        .map((c) => `[${c.name}]\nModel: ${c.card?.agent?.model || 'unknown'}\nSkills: ${(c.card?.skills || []).join(', ') || 'none'}\nUpdated: ${new Date(c.updated_at).toISOString()}`)
        .join("\n\n---\n\n");
      return { content: [{ type: "text" as const, text: formatted }] };
    }

    if (name === "get_partner_messages") {
      // Check buffer first (SSE updates)
      if (messageBuffer.length > 0) {
        const msgs = [...messageBuffer];
        messageBuffer.length = 0;
        const formatted = msgs
          .map((m) => `[${m.from}${m.to ? ` (to: ${m.to})` : ""} @ ${new Date(m.ts).toISOString()}]\n${m.content}`)
          .join("\n\n---\n\n");
        return { content: [{ type: "text" as const, text: formatted }] };
      }

      // Fallback to polling if buffer is empty
      const res = await fetch(`${BASE}/messages${params}`);
      const data = await res.json() as { ok: boolean; messages?: Array<{from: string; to?: string; content: string; ts: number}> };
      if (!data.ok || !data.messages?.length) {
        return { content: [{ type: "text" as const, text: "No new messages." }] };
      }
      const formatted = data.messages
        .map((m) => `[${m.from}${m.to ? ` (to: ${m.to})` : ""} @ ${new Date(m.ts).toISOString()}]\n${m.content}`)
        .join("\n\n---\n\n");
      return { content: [{ type: "text" as const, text: formatted }] };
    }

    if (name === "view_trust_dashboard") {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        // Try reading from parent directory or local based on setup
        const dashboardPath = path.resolve(process.cwd(), "trust-dashboard.html"); // Assuming trust-dashboard.html is in the root of walkie-talkie
        const html = await fs.readFile(dashboardPath, "utf-8");
        return { content: [{ type: "text" as const, text: html }] };
      } catch (e) {
        // Fallback mock if file isn't physically present on this specific agent's node yet
        const mockHtml = `<html><body><h1>Tokora Trust Dashboard</h1><p>Status: ENFORCED</p><button style="background:red;color:white;padding:20px;font-size:24px;border-radius:8px;">KILL-SWITCH: SEVER MESH</button></body></html>`;
        return { content: [{ type: "text" as const, text: mockHtml }] };
      }
    }

    if (name === "view_trust_dashboard") {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        // Try reading from parent directory or local based on setup
        const dashboardPath = path.resolve(process.cwd(), "trust-dashboard.html"); // Assuming trust-dashboard.html is in the root of walkie-talkie
        const html = await fs.readFile(dashboardPath, "utf-8");
        return { content: [{ type: "text" as const, text: html }] };
      } catch (e) {
        // Fallback mock if file isn't physically present on this specific agent's node yet
        const mockHtml = `<html><body><h1>Tokora Trust Dashboard</h1><p>Status: ENFORCED</p><button style="background:red;color:white;padding:20px;font-size:24px;border-radius:8px;">KILL-SWITCH: SEVER MESH</button></body></html>`;
        return { content: [{ type: "text" as const, text: mockHtml }] };
      }
    }

    if (name === "view_trust_dashboard") {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        // Try reading from parent directory or local based on setup
        const dashboardPath = path.resolve(process.cwd(), "trust-dashboard.html");
        const html = await fs.readFile(dashboardPath, "utf-8");
        return { content: [{ type: "text" as const, text: html }] };
      } catch (e) {
        // Fallback mock if file isn't physically present on this specific agent's node yet
        const mockHtml = `<html><body><h1>Tokora Trust Dashboard</h1><p>Status: ENFORCED</p><button style="background:red;color:white;padding:20px;font-size:24px;border-radius:8px;">KILL-SWITCH: SEVER MESH</button></body></html>`;
        return { content: [{ type: "text" as const, text: mockHtml }] };
      }
    }

    if (name === "broadcast_code_update") {
      const { filename, content } = args as { filename: string; content: string };
      const syncMessage = {
        type: "FILE_SYNC",
        filename,
        content
      };
      
      const res = await fetch(`${BASE}/send${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: JSON.stringify(syncMessage) }),
      });
      const data = await res.json();
      return { content: [{ type: "text" as const, text: data.ok ? `Code update for ${filename} broadcasted to all partners! 🚀` : `Error broadcasting code: ${data.error}` }] };
    }

    return { content: [{ type: "text" as const, text: `Unknown tool: ${name}` }] };
  } catch (e: unknown) {
    return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }] };
  }
});

const transport = new StdioServerTransport();
await mcp.connect(transport);
