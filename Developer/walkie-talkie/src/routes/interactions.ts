import type { Hono } from "hono";
import crypto from "node:crypto";
import {
  joinRoom,
  appendMessage,
  updatePresence,
  setTyping,
  getRoomPresence,
  addReaction,
  removeReaction,
  getMessageReactions,
  setDisplayName,
  verifyAdmin,
  messageEvents,
} from "../rooms.js";
import { CREATORS } from "./admin.js";

// System agents that should not trigger join notifications
const SYSTEM_AGENT_NAMES = new Set(["Scout", "Pulse", "Archie", "system"]);

export function registerInteractionRoutes(app: Hono) {
  // ── Heartbeat / Presence ────────────────────────────────────────────────

  app.post("/api/heartbeat", async (c) => {
    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);
    joinRoom(room, name);
    let hostname: string | undefined, role: string | undefined, parentAgent: string | undefined;
    try {
      const body = await c.req.json();
      hostname = body.hostname;
      role = body.role;
      parentAgent = body.parent;
    } catch {}
    // Enforce creator role for known creators
    if (CREATORS.has(name)) role = "creator";

    // Emit join notification when a real agent comes online from offline (skip viewers/sentinels)
    const isSystemAgent = name.endsWith("-viewer") || name.startsWith("Viewer")
      || SYSTEM_AGENT_NAMES.has(name) || name.includes("synthetic") || name.includes("anti-");
    if (!isSystemAgent) {
      const existing = getRoomPresence(room).find(a => a.agent_name === name);
      const wasOffline = !existing || existing.last_heartbeat < Date.now() - 300_000;
      if (wasOffline) {
        appendMessage(room, "system", `→ ${name} joined`, undefined, "SYSTEM");
      }
    }

    updatePresence(room, name, "online", hostname, role, parentAgent);
    return c.json({ ok: true, status: "online" });
  });

  app.post("/api/typing", async (c) => {
    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);
    const { is_typing } = await c.req.json();
    setTyping(room, name, is_typing !== false);
    return c.json({ ok: true });
  });

  app.get("/api/presence", (c) => {
    const room = c.req.query("room");
    if (!room) return c.json({ error: "missing room" }, 400);
    const token = c.req.query("token") || c.req.header("x-admin-token");
    const isAdmin = token && verifyAdmin(room, token);
    const agents = getRoomPresence(room).map(a => ({
      ...a,
      // Strip hostname for non-admins — leaks machine names
      hostname: isAdmin ? a.hostname : undefined,
    }));
    return c.json({ ok: true, agents });
  });

  // ── Display Name / Rename ──────────────────────────────────────────────

  app.post("/api/rename", async (c) => {
    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);
    const { display_name } = await c.req.json();
    if (!display_name || typeof display_name !== "string") return c.json({ error: "missing display_name" }, 400);
    const ok = setDisplayName(room, name, display_name.trim().slice(0, 32));
    return c.json({ ok });
  });

  // ── Reactions ──────────────────────────────────────────────────────────

  app.post("/api/react", async (c) => {
    const { message_id, emoji } = await c.req.json();
    const name = c.req.query("name");
    if (!name || !message_id || !emoji) return c.json({ error: "missing name, message_id, or emoji" }, 400);
    addReaction(message_id, name, emoji);

    // Emit reaction event for SSE
    const room = c.req.query("room");
    if (room) {
      messageEvents.emit("message", {
        room_code: room,
        message: { id: crypto.randomUUID(), from: name, content: `reacted ${emoji} to message`, ts: Date.now(), type: "REACTION", reply_to: message_id }
      });
    }
    return c.json({ ok: true });
  });

  app.delete("/api/react", async (c) => {
    const { message_id } = await c.req.json();
    const name = c.req.query("name");
    if (!name || !message_id) return c.json({ error: "missing name or message_id" }, 400);
    removeReaction(message_id, name);
    return c.json({ ok: true });
  });

  app.get("/api/reactions/:messageId", (c) => {
    const messageId = c.req.param("messageId");
    const reactions = getMessageReactions(messageId);
    return c.json({ ok: true, reactions });
  });
}
