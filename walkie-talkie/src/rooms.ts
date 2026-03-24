// In-memory room store
// Rooms expire after 72h of inactivity (covers full hackathon + sleep)
// Server restart = all rooms lost — MCP tools return explicit error, not silent []

export interface Message {
  id: string;
  from: string;
  ts: number;
  content: string;
}

interface UserState {
  cursor: number; // index of next unread message in room.messages
  lastSeen: number;
}

interface Room {
  code: string;
  messages: Message[];
  users: Map<string, UserState>;
  lastActivity: number;
}

const rooms = new Map<string, Room>();

const MAX_MESSAGE_BYTES = 10 * 1024; // 10KB
const ROOM_TTL_MS = 72 * 60 * 60 * 1000; // 72h

// ── Room management ──────────────────────────────────────────────────────────

export function createRoom(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code: string;
  do {
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  } while (rooms.has(code));

  rooms.set(code, {
    code,
    messages: [],
    users: new Map(),
    lastActivity: Date.now(),
  });
  return code;
}

export function joinRoom(code: string, name: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;

  if (!room.users.has(name)) {
    room.users.set(name, { cursor: 0, lastSeen: Date.now() });
  }
  room.lastActivity = Date.now();
  return room;
}

export function getRoomCount(): number {
  return rooms.size;
}

// ── MCP tool operations ───────────────────────────────────────────────────────

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

export function appendMessage(
  code: string,
  from: string,
  content: string
): Ok<{ id: string }> | Err {
  if (new TextEncoder().encode(content).length > MAX_MESSAGE_BYTES) {
    return { ok: false, error: "message_too_large" };
  }
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "room_expired_server_restarted" };

  const id = crypto.randomUUID();
  room.messages.push({ id, from, ts: Date.now(), content });
  room.lastActivity = Date.now();
  return { ok: true, id };
}

export function getMessages(
  code: string,
  name: string
): Ok<{ messages: Message[] }> | Err {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "room_expired_server_restarted" };

  const userState = room.users.get(name);
  if (!userState) return { ok: false, error: "not_in_room" };

  // Slice from cursor, filter out own messages, advance cursor
  const messages = room.messages
    .slice(userState.cursor)
    .filter((m) => m.from !== name);
  userState.cursor = room.messages.length;
  userState.lastSeen = Date.now();
  room.lastActivity = Date.now();
  return { ok: true, messages };
}

export function getRoomStatus(
  code: string,
  name: string
): Ok<{ connected: boolean; partners: string[]; message_count: number }> | Err {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "room_expired_server_restarted" };

  const partners = Array.from(room.users.keys()).filter((u) => u !== name);
  return {
    ok: true,
    connected: partners.length > 0,
    partners,
    message_count: room.messages.length,
  };
}

export function getAllMessages(
  code: string
): Ok<{ messages: Message[] }> | Err {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "room_expired_server_restarted" };
  return { ok: true, messages: room.messages };
}

// ── GC ────────────────────────────────────────────────────────────────────────

export function sweepExpiredRooms(): number {
  const now = Date.now();
  let swept = 0;
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS) {
      rooms.delete(code);
      swept++;
    }
  }
  return swept;
}
