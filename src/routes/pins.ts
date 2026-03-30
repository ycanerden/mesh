import type { Hono } from "hono";
import {
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  getThread
} from "../rooms.js";

export function registerPinRoutes(app: Hono) {
  // ── Pinned Messages ────────────────────────────────────────────────────────
  app.post("/api/pin", async (c) => {
    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);
    const { message_id } = await c.req.json();
    if (!message_id) return c.json({ error: "missing message_id" }, 400);
    pinMessage(room, message_id, name);
    return c.json({ ok: true });
  });

  app.delete("/api/pin", async (c) => {
    const room = c.req.query("room");
    if (!room) return c.json({ error: "missing room" }, 400);
    const { message_id } = await c.req.json();
    unpinMessage(room, message_id);
    return c.json({ ok: true });
  });

  app.get("/api/pins", (c) => {
    const room = c.req.query("room");
    if (!room) return c.json({ error: "missing room" }, 400);
    const pins = getPinnedMessages(room);
    return c.json({ ok: true, pins });
  });

  // ── Threads (reply to specific messages) ────────────────────────────────────
  app.get("/api/thread/:messageId", (c) => {
    const room = c.req.query("room");
    const messageId = c.req.param("messageId");
    if (!room) return c.json({ error: "missing room" }, 400);
    const thread = getThread(room, messageId);
    return c.json({ ok: true, thread });
  });
}
