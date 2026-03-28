import { z } from "zod";

export const roomSummarySchema = z.object({
  code: z.string(),
  agent_count: z.number().default(0),
  message_count: z.number().default(0),
  last_active: z.number().default(0),
});

export const messageSchema = z
  .object({
    id: z.string().optional(),
    from: z.string().optional(),
    room_code: z.string().optional(),
    to: z.string().optional(),
    to_type: z.string().optional(),
    ts: z.number().optional(),
    content: z.string().optional(),
    type: z.string().optional(),
  })
  .passthrough();

export const presenceAgentSchema = z
  .object({
    agent_name: z.string(),
    status: z.string(),
    display_name: z.string().optional(),
    role: z.string().optional(),
    parent_agent: z.string().optional(),
    last_heartbeat: z.number().optional(),
    is_typing: z.number().optional(),
  })
  .passthrough();

export const taskSchema = z
  .object({
    room_code: z.string(),
    agent_name: z.string(),
    task_id: z.string(),
    task_title: z.string(),
    status: z.enum(["pending", "in_progress", "blocked", "done"]),
    assigned_at: z.number(),
    due_date: z.number().optional(),
  })
  .passthrough();

export const leaderboardEntrySchema = z
  .object({
    agent_name: z.string().optional(),
    score: z.number().optional(),
    total_score: z.number().optional(),
    messages_sent: z.number().optional(),
    tasks_completed: z.number().optional(),
  })
  .passthrough();

export const directoryAgentSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    agent_name: z.string().optional(),
    name: z.string().optional(),
    model: z.string().optional(),
    status: z.string().optional(),
    skills: z.string().optional(),
  })
  .passthrough();

export const statsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);
export const metricsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

export const roomsResponseSchema = z.object({ rooms: z.array(roomSummarySchema) });
export const presenceResponseSchema = z.object({
  ok: z.boolean().optional(),
  agents: z.array(presenceAgentSchema),
});
export const tasksResponseSchema = z.object({
  ok: z.boolean().optional(),
  tasks: z.array(taskSchema),
  grouped: z.record(z.string(), z.array(taskSchema)).default({}),
  total: z.number().optional(),
});
export const leaderboardResponseSchema = z.object({
  ok: z.boolean().optional(),
  leaderboard: z.array(leaderboardEntrySchema),
});
export const activityResponseSchema = z.object({
  ok: z.boolean().optional(),
  events: z.array(messageSchema),
});
export const directoryResponseSchema = z.object({
  ok: z.boolean().optional(),
  agents: z.array(directoryAgentSchema),
  count: z.number().optional(),
});
export const statsResponseSchema = z.object({
  ok: z.boolean().optional(),
  stats: statsSchema.nullish(),
});

export type RoomSummary = z.infer<typeof roomSummarySchema>;
export type Message = z.infer<typeof messageSchema>;
export type PresenceAgent = z.infer<typeof presenceAgentSchema>;
export type Task = z.infer<typeof taskSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type DirectoryAgent = z.infer<typeof directoryAgentSchema>;
export type Metrics = z.infer<typeof metricsSchema>;
export type RoomsResponse = z.infer<typeof roomsResponseSchema>;
export type PresenceResponse = z.infer<typeof presenceResponseSchema>;
export type TasksResponse = z.infer<typeof tasksResponseSchema>;
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
export type ActivityResponse = z.infer<typeof activityResponseSchema>;
export type DirectoryResponse = z.infer<typeof directoryResponseSchema>;
export type StatsResponse = z.infer<typeof statsResponseSchema>;
