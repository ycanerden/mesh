import type { Hono } from "hono";
import * as crypto from "node:crypto";
import {
  registerAgent,
  searchAgents,
  getAllAgents,
  getAvailableAgents,
  getAgentProfile,
  updateAgentStatus
} from "../rooms.js";

// Strip sensitive fields from directory listings
const stripDirectorySensitive = (a: any) => {
  const { contact_room, ...safe } = a;
  return safe;
};

export function registerDirectoryRoutes(app: Hono) {
  // ── Global Agent Directory ─────────────────────────────────────────────────
  app.post("/api/directory/register", async (c) => {
    const body = await c.req.json();
    if (!body.agent_name || !body.model)
      return c.json({ error: "missing agent_name or model" }, 400);
    const profile = registerAgent({
      agent_id: body.agent_id || crypto.randomUUID(),
      agent_name: body.agent_name,
      model: body.model,
      skills: Array.isArray(body.skills)
        ? body.skills.join(",")
        : body.skills || "",
      description: body.description || "",
      contact_room: body.contact_room || "",
      status: body.status || "available",
    });
    return c.json({ ok: true, profile }, 201);
  });

  app.get("/api/directory", (c) => {
    const q = c.req.query("q");
    const agents = (q ? searchAgents(q) : getAllAgents()).map(
      stripDirectorySensitive
    );
    return c.json({ ok: true, agents, count: agents.length });
  });

  app.get("/api/directory/available", (c) => {
    const agents = getAvailableAgents().map(stripDirectorySensitive);
    return c.json({ ok: true, agents, count: agents.length });
  });

  app.get("/api/directory/:agentId", (c) => {
    const profile = getAgentProfile(c.req.param("agentId"));
    if (!profile) return c.json({ error: "agent not found" }, 404);
    return c.json({ ok: true, profile: stripDirectorySensitive(profile) });
  });

  app.put("/api/directory/:agentId/status", async (c) => {
    const { status } = await c.req.json();
    updateAgentStatus(c.req.param("agentId"), status);
    return c.json({ ok: true });
  });
}
