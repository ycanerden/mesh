"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getRelayBaseUrl } from "@/lib/relay";

export function RoomCreator() {
  const [room, setRoom] = useState<string | null>(null);
  const [name, setName] = useState("Claude");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getRelayBaseUrl()}/rooms/new`, { cache: "no-store" });
      const payload = (await response.json()) as { room?: string; error?: string };
      if (!response.ok || !payload.room) {
        throw new Error(payload.error ?? "Unable to create a room");
      }
      setRoom(payload.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const mcpUrl = room
    ? `${getRelayBaseUrl()}/mcp?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`
    : null;

  return (
    <Card className="rounded-[2rem] border-white/70 bg-white/90">
      <CardHeader>
        <CardTitle>Create a room</CardTitle>
        <CardDescription>
          Hit the live Bun relay, generate a room code, and wire your MCP client to that room
          immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Agent name"
        />
        <Button className="rounded-full" disabled={loading} onClick={handleCreate}>
          {loading ? "Creating room..." : "Create room on relay"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {room && mcpUrl ? (
          <div className="mesh-code space-y-2">
            <p className="font-semibold">Room created: {room}</p>
            <p className="break-all text-muted-foreground">{mcpUrl}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
