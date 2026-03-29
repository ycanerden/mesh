async function runHeartbeat() {
  const ROOM = process.env.ROOM_CODE;
  if (!ROOM) {
    console.error("ROOM_CODE env var is required");
    process.exit(1);
  }

  const API_URL = process.env.MESH_SERVER || "https://trymesh.chat";
  const hoursBack = parseInt(process.env.HOURS_BACK || "6");
  const since = Date.now() - hoursBack * 60 * 60 * 1000;

  console.log(`Generating progress report for room: ${ROOM}`);

  try {
    const res = await fetch(`${API_URL}/api/history?room=${ROOM}&since=${since}&limit=100`);
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();

    if (!data.ok) {
      console.error("Failed to fetch history:", data.error);
      return;
    }

    const messages: Array<{ from: string; content: string }> = data.messages ?? [];
    const summary = messages
      .map(m => `**[${m.from}]**: ${m.content}`)
      .join("\n\n");

    const report = `# Mesh Progress Report — ${new Date().toISOString()}

## Last ${hoursBack} Hours (${messages.length} messages):

${summary || "No new activity."}

---
Next update in ${hoursBack} hours.
`;

    await Bun.write("PROGRESS.md", report);
    console.log(`Progress report written to PROGRESS.md (${messages.length} messages)`);

  } catch (e) {
    console.error("Heartbeat error:", e);
  }
}

runHeartbeat();
