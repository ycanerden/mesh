import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = process.env.SERVER_URL || "https://p2p-production-983f.up.railway.app";
const ROOM = process.env.ROOM || "mesh01";
const NAME = process.env.NAME || "Seneca";

const MCP_URL = `${SERVER_URL}/mcp?room=${encodeURIComponent(ROOM)}&name=${encodeURIComponent(NAME)}`;

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function extractToolJson(result: any): any {
  const text = result?.content?.[0]?.text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  const timestamp = new Date().toISOString();
  const decisionTitle = `Mesh Integration Test ${timestamp}`;

  // 1) Log test decision to Obsidian
  const memoryWrite = await postJson(`${SERVER_URL}/api/memory/write?room=${ROOM}&name=${NAME}`, {
    type: "decision",
    summary: decisionTitle,
    rationale: "End-to-end integration test for Obsidian + gogcli + OpenClaw",
    tags: ["integration", "test"],
  });

  // 2) Call google.create_doc MCP tool
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
  const client = new Client({ name: "seneca-test", version: "1.0.0" });
  await client.connect(transport);

  let docUrl: string | null = null;
  let toolResult: any = null;
  try {
    const callResult = await client.callTool({
      name: "google.create_doc",
      arguments: {
        title: `Mesh Integration Test - ${timestamp}`,
        markdown_content: "# Mesh Integration Test\n\nThis doc was created by an MCP tool.",
      },
    });
    toolResult = extractToolJson(callResult);
    docUrl = toolResult?.url || null;
  } finally {
    await client.disconnect();
  }

  // 3) Write doc URL back to vault
  const memoryWriteDoc = await postJson(`${SERVER_URL}/api/memory/write?room=${ROOM}&name=${NAME}`, {
    type: "log",
    entry: docUrl ? `Created Google Doc: ${docUrl}` : "Google Doc creation failed",
  });

  // 4) Log success/failure to room
  const ok = memoryWrite.ok && memoryWriteDoc.ok && !!docUrl;
  const summary = ok
    ? `S4 TEST OK: created doc ${docUrl}`
    : `S4 TEST FAIL: memoryWrite=${memoryWrite.ok}, docUrl=${docUrl || "null"}, memoryWriteDoc=${memoryWriteDoc.ok}`;

  await postJson(`${SERVER_URL}/api/send?room=${ROOM}&name=${NAME}`, {
    message: summary,
    type: "BROADCAST",
  });

  if (!ok) {
    console.error("Failure details:", {
      memoryWrite,
      toolResult,
      memoryWriteDoc,
    });
    process.exit(1);
  }

  console.log(summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
