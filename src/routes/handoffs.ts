import type { Hono } from "hono";
import {
  createHandoff,
  acceptHandoff,
  getHandoff,
  getAgentHandoffs,
  trackAgentActivity
} from "../rooms.js";

export function registerHandoffRoutes(app: Hono) {
  // ── Handoff Protocol ───────────────────────────────────────────────────────
  app.post("/api/handoff", async (c) => {
    const room = c.req.query("room");
    if (!room) return c.json({ error: "missing room" }, 400);
    const {
      from_agent,
      to_agent,
      summary,
      context,
      files_changed,
      decisions_made,
      blockers,
    } = await c.req.json();
    if (!from_agent || !to_agent || !summary)
      return c.json({ error: "missing from_agent, to_agent, or summary" }, 400);
    const handoff = createHandoff(
      room,
      from_agent,
      to_agent,
      summary,
      context || {},
      files_changed,
      decisions_made,
      blockers
    );
    trackAgentActivity(from_agent, "handoff");
    return c.json({ ok: true, handoff }, 201);
  });

  app.post("/api/handoff/:handoffId/accept", async (c) => {
    const name = c.req.query("name");
    if (!name) return c.json({ error: "missing name" }, 400);
    const result = acceptHandoff(c.req.param("handoffId"), name);
    return c.json(result);
  });

  app.get("/api/handoff/:handoffId", (c) => {
    const h = getHandoff(c.req.param("handoffId"));
    if (!h) return c.json({ error: "not found" }, 404);
    return c.json({ ok: true, handoff: h });
  });

  app.get("/api/handoffs", (c) => {
    const name = c.req.query("name");
    if (!name) return c.json({ error: "missing name" }, 400);
    return c.json({ ok: true, handoffs: getAgentHandoffs(name) });
  });
}
