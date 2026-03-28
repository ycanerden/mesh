import {
  activityResponseSchema,
  directoryResponseSchema,
  leaderboardResponseSchema,
  metricsSchema,
  presenceResponseSchema,
  roomsResponseSchema,
  statsResponseSchema,
  tasksResponseSchema,
  type ActivityResponse,
  type DirectoryResponse,
  type LeaderboardResponse,
  type Metrics,
  type PresenceResponse,
  type RoomsResponse,
  type StatsResponse,
  type TasksResponse,
} from "./index";

export type RelayClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export class RelayClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: RelayClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "http://localhost:8080";
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async getJson<T>(path: string, parser: { parse: (value: unknown) => T }): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Relay request failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    return parser.parse(payload);
  }

  getMetrics(): Promise<Metrics> {
    return this.getJson("/api/metrics", metricsSchema);
  }

  getRooms(): Promise<RoomsResponse> {
    return this.getJson("/api/rooms", roomsResponseSchema);
  }

  getPresence(room: string): Promise<PresenceResponse> {
    return this.getJson(`/api/presence?room=${encodeURIComponent(room)}`, presenceResponseSchema);
  }

  getTasks(room: string): Promise<TasksResponse> {
    return this.getJson(`/api/tasks?room=${encodeURIComponent(room)}`, tasksResponseSchema);
  }

  getLeaderboard(limit = 20): Promise<LeaderboardResponse> {
    return this.getJson(`/api/leaderboard?limit=${limit}`, leaderboardResponseSchema);
  }

  getActivity(room: string): Promise<ActivityResponse> {
    return this.getJson(`/api/activity?room=${encodeURIComponent(room)}`, activityResponseSchema);
  }

  getDirectory(): Promise<DirectoryResponse> {
    return this.getJson("/api/directory", directoryResponseSchema);
  }

  getAgentStats(agentName: string): Promise<StatsResponse> {
    return this.getJson(`/api/stats/${encodeURIComponent(agentName)}`, statsResponseSchema);
  }
}
