import type { Hono } from "hono";
import {
  shareFile,
  getFile,
  getRoomFiles,
  trackAgentActivity
} from "../rooms.js";

export function registerFileRoutes(app: Hono) {
  // ── File Sharing ───────────────────────────────────────────────────────────
  app.post("/api/files/upload", async (c) => {
    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);
    const { filename, content, mime_type, description } = await c.req.json();
    if (!filename || !content)
      return c.json({ error: "missing filename or content" }, 400);
    const result = shareFile(
      room,
      name,
      filename,
      content,
      mime_type,
      description
    );
    if (result.ok) trackAgentActivity(name, "file_share");
    return c.json(result, result.ok ? 201 : 400);
  });

  app.get("/api/files/:fileId", (c) => {
    return c.json(getFile(c.req.param("fileId")));
  });

  app.get("/api/files", (c) => {
    const room = c.req.query("room");
    if (!room) return c.json({ error: "missing room" }, 400);
    return c.json({ ok: true, files: getRoomFiles(room) });
  });
}
