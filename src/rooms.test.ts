import { test, expect, beforeEach } from "bun:test";
import {
  createRoom,
  joinRoom,
  appendMessage,
  getMessages,
  getRoomStatus,
  sweepExpiredRooms,
  getRoomCount,
  publishCard,
  messageEvents,
  claimAgentName,
  setRoomReadOnly,
  setReaction,
  getPresenceRow,
  updatePresence,
  db,
} from "./rooms.js";

// Reset module state between tests by re-importing fresh — not possible with
// static imports, so we rely on unique room codes per test instead.

test("createRoom returns a 6-char code", () => {
  const { code } = createRoom();
  expect(code).toHaveLength(6);
  expect(code).toMatch(/^[a-z0-9]{6}$/);
});

test("createRoom codes are unique across calls", () => {
  const codes = new Set(Array.from({ length: 20 }, () => createRoom().code));
  expect(codes.size).toBe(20);
});

test("joinRoom returns null for unknown room", () => {
  expect(joinRoom("zzzzzz", "alice")).toBeNull();
});

test("joinRoom creates user state on first join", () => {
  const { code } = createRoom();
  const room = joinRoom(code, "alice");
  expect(room).not.toBeNull();
});

test("appendMessage: happy path", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  const result = appendMessage(code, "alice", "hello");
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.id).toHaveLength(36); // UUID
});

test("appendMessage: rejects messages over 10KB", () => {
  const { code } = createRoom();
  const big = "x".repeat(10 * 1024 + 1);
  const result = appendMessage(code, "alice", big);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toBe("message_too_large");
});

test("appendMessage: unknown room returns room_expired error", () => {
  const result = appendMessage("xxxxxx", "alice", "hi");
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toBe("room_expired_or_not_found");
});

test("getMessages: returns partner messages after cursor, not own", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");

  appendMessage(code, "alice", "msg from alice");
  appendMessage(code, "bob", "msg from bob");

  const result = getMessages(code, "bob"); // bob reads — should only see alice's
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.messages).toHaveLength(1);
    expect((result as any).messages[0].from).toBe("alice");
    expect((result as any).messages[0].content).toBe("msg from alice");
  }
});

test("getMessages: cursor advances — second call returns empty", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");
  appendMessage(code, "alice", "hi");

  getMessages(code, "bob"); // first read
  const second = getMessages(code, "bob"); // second read
  expect(second.ok).toBe(true);
  if (second.ok) expect(second.messages).toHaveLength(0);
});

test("getMessages: empty room returns []", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  const result = getMessages(code, "alice");
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.messages).toHaveLength(0);
    expect(result.quiet_ms).toBeNull();
  }
});

test("getMessages: quiet_ms is time since the last message in the room", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");
  appendMessage(code, "alice", "hi");
  const result = getMessages(code, "bob");
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.quiet_ms).not.toBeNull();
    expect(result.quiet_ms!).toBeGreaterThanOrEqual(0);
    expect(result.quiet_ms!).toBeLessThan(10_000);
  }
});

test("getMessages: unknown room returns room_expired error", () => {
  const result = getMessages("xxxxxx", "alice");
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toBe("room_expired_or_not_found");
});

test("getMessages: returns messages in timestamp order", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");

  appendMessage(code, "alice", "first");
  appendMessage(code, "alice", "second");
  appendMessage(code, "alice", "third");

  const result = getMessages(code, "bob");
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.messages!.map((m) => m.content)).toEqual([
      "first",
      "second",
      "third",
    ]);
  }
});

test("getRoomStatus: solo user shows not connected", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  const result = getRoomStatus(code, "alice");
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.connected).toBe(false);
    expect(result.partners).toHaveLength(0);
  }
});

test("getRoomStatus: two users shows connected with partner", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");
  const result = getRoomStatus(code, "alice");
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.connected).toBe(true);
    expect(result.partners![0].name).toBe("bob");
    expect(result.partners!.find(p => p.name === "alice")).toBeUndefined();
  }
});

test("getRoomStatus: unknown room returns room_expired error", () => {
  const result = getRoomStatus("xxxxxx", "alice");
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toBe("room_expired_or_not_found");
});

test("getRoomStatus: includes message_count", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  appendMessage(code, "alice", "a");
  appendMessage(code, "alice", "b");
  const result = getRoomStatus(code, "alice");
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.message_count).toBe(2);
});

test("publishCard: stores and broadcasts agent card", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");
  
  const card = { agent: { name: "Batman", model: "gemini-2.0-flash", tool: "gemini-cli" }, skills: ["investigation"] };
  const result = publishCard(code, "alice", card);
  expect(result.ok).toBe(true);
  
  const status = getRoomStatus(code, "bob");
  expect(status.ok).toBe(true);
  if (status.ok) {
    expect(status.partners).toHaveLength(1);
    expect(status.partners![0].name).toBe("alice");
    expect(status.partners![0].card).toEqual(card);
  }
});

test("publishCard: system message is posted on card update", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");
  
  const card = { agent: { name: "Batman", model: "gemini-2.0-flash" } };
  publishCard(code, "alice", card);
  
  const msgs = getMessages(code, "bob");
  expect(msgs.ok).toBe(true);
  if (msgs.ok) {
    // Should have 1 message (system)
    expect(msgs.messages).toHaveLength(1);
    expect((msgs as any).messages[0].from).toBe("system");
    expect((msgs as any).messages[0].content).toContain("Batman (gemini-2.0-flash) updated their Agent Card");
  }
});

test("sweepExpiredRooms: does not delete active rooms", () => {
  createRoom();
  const after = getRoomCount();
  sweepExpiredRooms(); // nothing is expired
  expect(getRoomCount()).toBe(after);
});

test("sweepExpiredRooms: keeps rooms that have claimed bot names", () => {
  const { code } = createRoom();
  const claimed = claimAgentName(code, "can-grok");
  expect(claimed.ok).toBe(true);
  db.prepare("UPDATE rooms SET last_activity = ? WHERE code = ?").run(
    Date.now() - 80 * 60 * 60 * 1000,
    code
  );
  sweepExpiredRooms();
  expect(getRoomStatus(code, "can-grok").ok).toBe(true);
});

test("sweepExpiredRooms: keeps rooms that have messages", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  appendMessage(code, "alice", "still here next week");
  db.prepare("UPDATE rooms SET last_activity = ? WHERE code = ?").run(
    Date.now() - 80 * 60 * 60 * 1000,
    code
  );
  sweepExpiredRooms();
  expect(getRoomStatus(code, "alice").ok).toBe(true);
});

test("sweepExpiredRooms: deletes empty unused rooms after 72h", () => {
  const { code } = createRoom();
  db.prepare("UPDATE rooms SET last_activity = ? WHERE code = ?").run(
    Date.now() - 80 * 60 * 60 * 1000,
    code
  );
  sweepExpiredRooms();
  expect(getRoomStatus(code, "alice").ok).toBe(false);
});

test("appendMessage: read-only rooms reject agent messages", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  setRoomReadOnly(code, true);
  const blocked = appendMessage(code, "alice", "should fail");
  expect(blocked.ok).toBe(false);
  if (!blocked.ok) expect(blocked.error).toBe("room_read_only");
  const system = appendMessage(code, "system", "room is now read-only");
  expect(system.ok).toBe(true);
});

test("appendMessage: emits messageEvents for SSE streaming", async () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");

  const messagePromise = new Promise<any>((resolve) => {
    const handler = (data: any) => {
      if (data.room_code === code && data.message.from === "alice") {
        messageEvents.off("message", handler);
        resolve(data);
      }
    };
    messageEvents.on("message", handler);
  });

  appendMessage(code, "alice", "test message");
  const event = await Promise.race([
    messagePromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1000)),
  ]);

  expect(event).toBeTruthy();
  expect(event.message.from).toBe("alice");
  expect(event.message.content).toBe("test message");
  expect(event.message.id).toHaveLength(36); // UUID
});

test("getMessages: since+peek replays without consuming the inbox", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");
  appendMessage(code, "alice", "keep this");

  const first = getMessages(code, "bob");
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  expect(first.messages).toHaveLength(1);
  expect(typeof first.next_since).toBe("number");

  const empty = getMessages(code, "bob");
  expect(empty.ok).toBe(true);
  if (empty.ok) expect(empty.messages).toHaveLength(0);

  const replay = getMessages(code, "bob", undefined, { since: -1, peek: true });
  expect(replay.ok).toBe(true);
  if (!replay.ok) return;
  expect(replay.messages).toHaveLength(1);
  expect(replay.messages[0]?.content).toBe("keep this");

  const stillEmpty = getMessages(code, "bob");
  expect(stillEmpty.ok).toBe(true);
  if (stillEmpty.ok) expect(stillEmpty.messages).toHaveLength(0);
});

test("setReaction: tapback toggles and replaces", () => {
  const { code } = createRoom();
  joinRoom(code, "alice");
  joinRoom(code, "bob");
  const sent = appendMessage(code, "alice", "lock 6pm?");
  expect(sent.ok).toBe(true);
  if (!sent.ok) return;

  const up = setReaction(code, "bob", sent.id, "up");
  expect(up.ok).toBe(true);
  if (!up.ok) return;
  expect(up.removed).toBe(false);
  expect(up.reactions.up).toEqual(["bob"]);

  const love = setReaction(code, "bob", sent.id, "love");
  expect(love.ok).toBe(true);
  if (!love.ok) return;
  expect(love.reactions.up).toBeUndefined();
  expect(love.reactions.love).toEqual(["bob"]);

  const off = setReaction(code, "bob", sent.id, "love");
  expect(off.ok).toBe(true);
  if (!off.ok) return;
  expect(off.removed).toBe(true);
  expect(off.reactions.love).toBeUndefined();

  const bad = setReaction(code, "bob", sent.id, "fire");
  expect(bad.ok).toBe(false);
  if (!bad.ok) expect(bad.error).toBe("invalid_reaction");
});

test("getPresenceRow: first sighting only, later beats reuse the row", () => {
  const { code } = createRoom();
  expect(getPresenceRow(code, "Guest")).toBeNull();
  updatePresence(code, "Guest", "online");
  const row = getPresenceRow(code, "Guest");
  expect(row).not.toBeNull();
  const again = getPresenceRow(code, "Guest");
  expect(again?.last_heartbeat).toBeGreaterThan(0);
});
