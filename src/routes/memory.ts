import type { Hono } from "hono";
import {
  appendDecision,
  appendShip,
  upsertAgentContext,
  appendDailyLog,
  getAgentContext,
  obsidianEnabled,
} from "../obsidian-memory.js";

export function registerMemoryRoutes(app: Hono) {
  // ── Obsidian Memory (S1) ─────────────────────────────────────────────────────
  app.post("/api/memory/write", async (c) => {
    if (!obsidianEnabled())
      return c.json({ ok: false, error: "obsidian_disabled" }, 400);

    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);

    const body = await c.req.json().catch(() => ({}));
    const type = (body.type || "").toString();

    if (type === "decision") {
      const { summary, rationale, options, recommendation, tags } = body;
      const result = await appendDecision(
        room,
        summary,
        rationale,
        options,
        recommendation,
        name,
        tags
      );
      return c.json(result, result.ok ? 200 : 400);
    }

    if (type === "ship") {
      const { title, notes, files_changed, tags } = body;
      const result = await appendShip(
        room,
        title,
        notes,
        files_changed,
        name,
        tags
      );
      return c.json(result, result.ok ? 200 : 400);
    }

    if (type === "context") {
      const { content, tags } = body;
      const result = await upsertAgentContext(name, content, tags);
      return c.json(result, result.ok ? 200 : 400);
    }

    if (type === "log") {
      const entry = (body.entry || body.content || "").toString();
      const result = await appendDailyLog(room, entry, name);
      return c.json(result, result.ok ? 200 : 400);
    }

    return c.json(
      {
        ok: false,
        error: "invalid_type",
        valid: ["decision", "ship", "context", "log"],
      },
      400
    );
  });

  app.get("/api/memory/context", async (c) => {
    if (!obsidianEnabled())
      return c.json({ ok: false, error: "obsidian_disabled" }, 400);

    const agent = c.req.query("agent");
    if (!agent) return c.json({ ok: false, error: "missing_agent" }, 400);

    const result = await getAgentContext(agent);
    return c.json(result, result.ok ? 200 : 400);
  });
}
