import type { Hono } from "hono";
import {
  createRoom,
} from "../rooms.js";
import {
  getRoomTasks,
  assignTask,
  updateTaskStatus,
  getAllRoomGroups,
  createRoomGroup,
  getRoomGroup
} from "../room-manager.js";

export function registerTaskRoutes(app: Hono) {
  // ── Tasks ──────────────────────────────────────────────────────────────
  app.get("/api/tasks", (c) => {
    const room = c.req.query("room");
    if (!room) return c.json({ error: "missing room" }, 400);
    const tasks = getRoomTasks(room);
    const grouped = {
      pending: tasks.filter((t) => t.status === "pending"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      blocked: tasks.filter((t) => t.status === "blocked"),
      done: tasks.filter((t) => t.status === "done"),
    };
    return c.json({ ok: true, tasks, grouped, total: tasks.length });
  });

  app.post("/api/tasks", async (c) => {
    const { room_code, agent_name, task_id, task_title, due_date } =
      await c.req.json();
    if (!room_code || !agent_name || !task_id || !task_title) {
      return c.json({ error: "missing required fields" }, 400);
    }
    const task = assignTask(
      room_code,
      agent_name,
      task_id,
      task_title,
      due_date || Date.now() + 24 * 60 * 60 * 1000
    );
    return c.json({ ok: true, task });
  });

  app.put("/api/tasks/:taskId/status", async (c) => {
    const { room_code, agent_name, status } = await c.req.json();
    const taskId = c.req.param("taskId");
    if (!room_code || !agent_name || !status) {
      return c.json({ error: "missing required fields" }, 400);
    }
    updateTaskStatus(room_code, agent_name, taskId, status);
    return c.json({ ok: true, task_id: taskId, new_status: status });
  });

  // ── Room Groups (WhatsApp-like AI agent groups) ────────────────────────────────
  app.get("/groups", (c) => {
    const groups = getAllRoomGroups();
    return c.json({ groups, count: groups.length });
  });

  app.post("/groups/create", async (c) => {
    const { group_name, description, topic, icon, color } = await c.req.json();
    const creator = c.req.query("creator") || "unknown";

    const { code: roomCode } = createRoom();
    const group = createRoomGroup(
      roomCode,
      group_name,
      description,
      topic,
      creator as string,
      icon || "🚀",
      color || "#4fc3f7"
    );

    return c.json(group, 201);
  });

  app.get("/groups/:roomCode", (c) => {
    const roomCode = c.req.param("roomCode");
    const group = getRoomGroup(roomCode);

    if (!group) {
      return c.json({ error: "group not found" }, 404);
    }

    const tasks = getRoomTasks(roomCode);
    return c.json({ group, tasks });
  });
}
