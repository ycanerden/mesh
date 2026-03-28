"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DirectoryAgent,
  LeaderboardEntry,
  Message,
  Metrics,
  PresenceAgent,
  RoomSummary,
  Task,
} from "@mesh/contracts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRelayBaseUrl, relayClient } from "@/lib/relay";
import { RoomCreator } from "@/components/live/room-creator";

type RelayView =
  | "dashboard"
  | "office"
  | "activity"
  | "analytics"
  | "watch"
  | "leaderboard"
  | "rooms"
  | "settings"
  | "team"
  | "demo"
  | "compact"
  | "master-dashboard"
  | "agent";

type RelayState = {
  metrics: Metrics | null;
  agents: PresenceAgent[];
  tasks: Task[];
  groupedTasks: Record<string, Task[]>;
  rooms: RoomSummary[];
  leaderboard: LeaderboardEntry[];
  events: Message[];
  directory: DirectoryAgent[];
  stats: Record<string, unknown> | null;
};

const emptyState: RelayState = {
  metrics: null,
  agents: [],
  tasks: [],
  groupedTasks: {},
  rooms: [],
  leaderboard: [],
  events: [],
  directory: [],
  stats: null,
};

export function RelaySnapshot({
  room,
  view,
  agentName,
}: {
  room: string;
  view: RelayView;
  agentName?: string;
}) {
  const [state, setState] = useState<RelayState>(emptyState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [metrics, presence, tasks, rooms, leaderboard, activity, directory, stats] =
        await Promise.all([
          relayClient.getMetrics(),
          relayClient.getPresence(room),
          relayClient.getTasks(room),
          relayClient.getRooms(),
          relayClient.getLeaderboard(),
          relayClient.getActivity(room),
          relayClient.getDirectory(),
          agentName ? relayClient.getAgentStats(agentName) : Promise.resolve({ stats: null }),
        ]);

      setState({
        metrics,
        agents: presence.agents,
        tasks: tasks.tasks,
        groupedTasks: tasks.grouped,
        rooms: rooms.rooms,
        leaderboard: leaderboard.leaderboard,
        events: activity.events,
        directory: directory.agents,
        stats: stats.stats ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown relay error");
    } finally {
      setLoading(false);
    }
  }, [agentName, room]);

  useEffect(() => {
    void fetchData();
    const interval = window.setInterval(() => {
      void fetchData();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  const overview = useMemo(
    () => [
      {
        label: "Active rooms",
        value: String(state.metrics?.active_rooms ?? state.rooms.length ?? 0),
      },
      {
        label: "Active agents",
        value: String(state.metrics?.active_agents ?? state.agents.length ?? 0),
      },
      {
        label: "Messages / min",
        value: String(state.metrics?.messages_per_minute ?? 0),
      },
      {
        label: "Latency",
        value: `${state.metrics?.avg_latency_ms ?? 0}ms`,
      },
    ],
    [state.agents.length, state.metrics, state.rooms.length],
  );

  return (
    <section className="mesh-shell space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="rounded-full border border-border/80 bg-white/70 px-3 py-1 font-mono"
          >
            room={room}
          </Badge>
          <Badge variant="outline" className="rounded-full bg-white/70 px-3 py-1 font-mono">
            relay={getRelayBaseUrl()}
          </Badge>
        </div>
        <Button
          variant="outline"
          className="rounded-full bg-white"
          onClick={() => void fetchData()}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert className="rounded-[2rem] border-destructive/30 bg-white/90">
          <AlertTitle>Relay fetch failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((item) => (
          <Card key={item.label} className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-3xl">{loading ? "..." : item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {view === "dashboard" || view === "master-dashboard" ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Live relay events from the current room.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTable events={state.events} />
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Presence</CardTitle>
              <CardDescription>Agents currently visible in the room.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.agents.map((agent) => (
                <div
                  key={agent.agent_name}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{agent.display_name || agent.agent_name}</p>
                    <p className="text-sm text-muted-foreground">{agent.role || "worker"}</p>
                  </div>
                  <Badge variant={agent.status === "online" ? "default" : "secondary"}>
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === "office" || view === "demo" || view === "watch" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.agents.map((agent) => (
            <Card key={agent.agent_name} className="rounded-[2rem] border-white/70 bg-white/90">
              <CardHeader>
                <CardDescription>Presence tile</CardDescription>
                <CardTitle>{agent.display_name || agent.agent_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Status: {agent.status}</p>
                <p>Role: {agent.role || "worker"}</p>
                <p>{agent.is_typing ? "Typing now" : "Idle"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {view === "activity" ? (
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Cross-room event feed</CardTitle>
            <CardDescription>
              The relay’s last 100 events with no browser-side polling hacks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTable events={state.events} />
          </CardContent>
        </Card>
      ) : null}

      {view === "analytics" ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Relay health</CardTitle>
              <CardDescription>Operational metrics exposed by the Bun relay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {Object.entries(state.metrics ?? {}).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-border/50 py-2 last:border-b-0"
                >
                  <span className="font-mono">{key}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Leaderboard slice</CardTitle>
              <CardDescription>
                Who is shipping and coordinating the most across the network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable leaderboard={state.leaderboard} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === "leaderboard" ? (
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              Current ranking based on the relay’s productivity reporting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderboardTable leaderboard={state.leaderboard} />
          </CardContent>
        </Card>
      ) : null}

      {view === "rooms" ? (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <RoomCreator />
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Active rooms</CardTitle>
              <CardDescription>Server-side room inventory from `/api/rooms`.</CardDescription>
            </CardHeader>
            <CardContent>
              <RoomsTable rooms={state.rooms} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === "settings" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Runtime configuration</CardTitle>
              <CardDescription>What the web app expects from the relay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Relay base URL: {getRelayBaseUrl()}</p>
              <p>Default room: {room}</p>
              <p>Room transport: Streamable MCP over HTTP + Bun relay APIs.</p>
              <p>Docs source for agents: `apps/web/AGENTS.md` + `node_modules/next/dist/docs/`.</p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Task groups</CardTitle>
              <CardDescription>Current server-side task buckets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(state.groupedTasks).map(([status, tasks]) => (
                <div
                  key={status}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold capitalize">{status.replaceAll("_", " ")}</p>
                    <Badge variant="secondary">{tasks.length}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === "team" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.directory.map((agent) => (
            <Card
              key={String(agent.id ?? agent.agent_name)}
              className="rounded-[2rem] border-white/70 bg-white/90"
            >
              <CardHeader>
                <CardDescription>Directory profile</CardDescription>
                <CardTitle>{String(agent.agent_name ?? agent.name ?? "Unknown")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Model: {String(agent.model ?? "unknown")}</p>
                <p>Status: {String(agent.status ?? "available")}</p>
                <p>Skills: {String(agent.skills ?? "n/a")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {view === "compact" ? (
        <Card className="rounded-[2rem] border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Compact relay summary</CardTitle>
            <CardDescription>
              Useful for the menu bar helper or a narrow side panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {state.agents.slice(0, 6).map((agent) => (
              <div
                key={agent.agent_name}
                className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
              >
                <p className="font-semibold">{agent.display_name || agent.agent_name}</p>
                <p className="text-muted-foreground">{agent.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {view === "agent" ? (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>{agentName}</CardTitle>
              <CardDescription>Relay stats for the selected agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {Object.entries(state.stats ?? {}).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-border/50 py-2 last:border-b-0"
                >
                  <span className="font-mono">{key}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Task context</CardTitle>
              <CardDescription>Tasks currently assigned in this room.</CardDescription>
            </CardHeader>
            <CardContent>
              <TasksTable tasks={state.tasks} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  );
}

function ActivityTable({ events }: { events: Array<Record<string, unknown>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>From</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.slice(0, 12).map((event, index) => (
          <TableRow key={String(event.id ?? index)}>
            <TableCell>{String(event.from ?? "system")}</TableCell>
            <TableCell>{String(event.room_code ?? "mesh")}</TableCell>
            <TableCell>{String(event.type ?? "message")}</TableCell>
            <TableCell className="max-w-md truncate">{String(event.content ?? "")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LeaderboardTable({ leaderboard }: { leaderboard: Array<Record<string, unknown>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Messages</TableHead>
          <TableHead>Tasks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.slice(0, 12).map((entry, index) => (
          <TableRow key={String(entry.agent_name ?? index)}>
            <TableCell>{String(entry.agent_name ?? "unknown")}</TableCell>
            <TableCell>{String(entry.score ?? entry.total_score ?? 0)}</TableCell>
            <TableCell>{String(entry.messages_sent ?? 0)}</TableCell>
            <TableCell>{String(entry.tasks_completed ?? 0)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RoomsTable({ rooms }: { rooms: Array<Record<string, unknown>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Agents</TableHead>
          <TableHead>Messages</TableHead>
          <TableHead>Last active</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room, index) => (
          <TableRow key={String(room.code ?? index)}>
            <TableCell className="font-mono">{String(room.code ?? "")}</TableCell>
            <TableCell>{String(room.agent_count ?? 0)}</TableCell>
            <TableCell>{String(room.message_count ?? 0)}</TableCell>
            <TableCell>{formatTimestamp(room.last_active)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TasksTable({ tasks }: { tasks: Array<Record<string, unknown>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.slice(0, 16).map((task, index) => (
          <TableRow key={String(task.task_id ?? index)}>
            <TableCell>{String(task.agent_name ?? "unknown")}</TableCell>
            <TableCell>{String(task.task_title ?? "")}</TableCell>
            <TableCell>{String(task.status ?? "pending")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatTimestamp(value: unknown) {
  if (typeof value !== "number") return "n/a";
  return new Date(value).toLocaleString();
}
