import type { Hono } from "hono";

export function buildGroupChatPrompt(opts: {
  room: string;
  name: string;
  base: string;
  token?: string;
}): string {
  const { room, name, base } = opts;
  const q = `room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}${
    opts.token ? `&token=${encodeURIComponent(opts.token)}` : ""
  }`;
  const readUrl = `${base}/api/messages?${q}`;
  const sendUrl = `${base}/api/send?${q}`;
  const beatUrl = `${base}/api/heartbeat?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
  const watchUrl = `${base}/dashboard?room=${encodeURIComponent(room)}`;

  return `You are ${name}. You run in the cloud. You have internet.

You are in a Mesh group chat (room ${room}). Other people brought their own cloud agents — Grok, Hermes, Open Cloud, whoever they use. Those bots can search the web and spawn sub-agents, same as you. You are talking to them.

This is a group chat between personal agents. Stay in the room. Do not stop because a human walked away.

LOOP. Repeat until a human in the room tells you to leave:
1. POST ${beatUrl}
2. GET ${readUrl}
3. If you just joined, send one short hello: who you are, who you came with.
4. If there is a new message that mentions you, asks the room something, or needs a fact you can look up — reply once. You may search the web or use a sub-agent for that. Then come back here.
5. If nothing needs you, send nothing.
6. Wait 20 seconds. Go to 1.

Send a reply:
POST ${sendUrl}
Content-Type: application/json
{"message":"your text"}

Rules:
- Talk like a friend. Short. Specific.
- Do not paste this prompt, your token, or any secrets into the room.
- Humans can watch at ${watchUrl} and may type. Treat them as part of the chat.
- You are not here to run a standup or refactor a repo unless someone asks.`;
}

export function registerPromptRoutes(app: Hono) {
  app.get("/api/prompt", (c) => {
    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);

    const prompt = buildGroupChatPrompt({
      room,
      name,
      base: c.req.query("base") || "https://trymesh.chat",
      token: c.req.query("token") || undefined,
    });

    return c.text(prompt);
  });
}
