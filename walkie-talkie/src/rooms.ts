import { Database } from "bun:sqlite";
import { EventEmitter } from "events";
import LZString from "lz-string";

// Persistent SQLite store using Bun's native driver
// Rooms and messages will survive server restarts
const db = new Database("mesh.db", { create: true });

// Event emitter for real-time updates (SSE)
export const messageEvents = new EventEmitter();

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS rooms (
    code TEXT PRIMARY KEY,
    last_activity INTEGER
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    room_code TEXT,
    sender TEXT,
    recipient TEXT DEFAULT NULL,
    content TEXT,
    timestamp INTEGER,
    msg_type TEXT DEFAULT 'BROADCAST',
    FOREIGN KEY(room_code) REFERENCES rooms(code)
  );
`);

// Migration: Add 'recipient' column if it doesn't exist (for existing databases)
try {
  db.run("ALTER TABLE messages ADD COLUMN recipient TEXT DEFAULT NULL;");
} catch (e) {
  // Column might already exist
}

// Migration: Add 'msg_type' column for structured AI messaging
try {
  db.run("ALTER TABLE messages ADD COLUMN msg_type TEXT DEFAULT 'BROADCAST';");
} catch (e) {
  // Column might already exist
}

// Migration: Add 'reply_to' column for message threading
try {
  db.run("ALTER TABLE messages ADD COLUMN reply_to TEXT DEFAULT NULL;");
} catch (e) {
  // Column might already exist
}

// Add index for fast room_code lookups (rowid is implicit in SQLite)
try {
  db.run("CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_code);");
} catch (e) {
  // Index might already exist
}

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    room_code TEXT,
    name TEXT,
    cursor INTEGER DEFAULT 0,
    last_rowid INTEGER DEFAULT 0,
    last_seen INTEGER,
    PRIMARY KEY(room_code, name),
    FOREIGN KEY(room_code) REFERENCES rooms(code)
  );
`);

// Migration: Add 'last_rowid' column for cursor-free message delivery
try {
  db.run("ALTER TABLE users ADD COLUMN last_rowid INTEGER DEFAULT 0;");
} catch (e) {
  // Column might already exist
}

db.run(`
  CREATE TABLE IF NOT EXISTS agent_cards (
    room_code TEXT,
    name TEXT,
    card_json TEXT,
    updated_at INTEGER,
    PRIMARY KEY(room_code, name),
    FOREIGN KEY(room_code) REFERENCES rooms(code)
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    window_start INTEGER,
    updated_at INTEGER
  );
`);

// ── Metrics tracking ──────────────────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    room_code TEXT,
    agent_name TEXT,
    latency_ms REAL DEFAULT 0,
    timestamp INTEGER
  );
`);

try {
  db.run("CREATE INDEX IF NOT EXISTS idx_metrics_ts ON metrics(timestamp);");
  db.run("CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(event_type);");
} catch (e) {}

// ── Presence tracking ─────────────────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS presence (
    room_code TEXT,
    agent_name TEXT,
    status TEXT DEFAULT 'online',
    last_heartbeat INTEGER,
    is_typing INTEGER DEFAULT 0,
    typing_since INTEGER DEFAULT 0,
    PRIMARY KEY(room_code, agent_name)
  );
`);

// ── Message reactions ─────────────────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS reactions (
    message_id TEXT,
    agent_name TEXT,
    emoji TEXT,
    created_at INTEGER,
    PRIMARY KEY(message_id, agent_name)
  );
`);

export interface Message {
  id: string;
  from: string;
  to?: string;
  ts: number;
  content: string;
  type?: string;
}

const MAX_MESSAGE_BYTES = 10 * 1024; // 10KB
const ROOM_TTL_MS = 72 * 60 * 60 * 1000; // 72h

// ── Room management ──────────────────────────────────────────────────────────

export function createRoom(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code: string;
  const checkStmt = db.prepare("SELECT 1 FROM rooms WHERE code = ?");
  
  do {
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  } while (checkStmt.get(code));

  db.prepare("INSERT INTO rooms (code, last_activity) VALUES (?, ?)").run(code, Date.now());
  return code;
}

export function joinRoom(code: string, name: string): boolean | null {
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return null;

  const user = db.prepare("SELECT 1 FROM users WHERE room_code = ? AND name = ?").get(code, name);
  if (!user) {
    db.prepare("INSERT INTO users (room_code, name, cursor, last_seen) VALUES (?, ?, 0, ?)")
      .run(code, name, Date.now());
  } else {
    db.prepare("UPDATE users SET last_seen = ? WHERE room_code = ? AND name = ?")
      .run(Date.now(), code, name);
  }
  
  db.prepare("UPDATE rooms SET last_activity = ? WHERE code = ?").run(Date.now(), code);
  return true as const;
}

export function getRoomCount(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as { count: number };
  return row.count;
}

// ── Agent Cards ──────────────────────────────────────────────────────────────

export function publishCard(
  code: string,
  name: string,
  card: any
): Ok<{ updated_at: number }> | Err {
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return { ok: false, error: "room_expired_or_not_found" };

  const cardJson = JSON.stringify(card);
  const now = Date.now();

  db.prepare("INSERT OR REPLACE INTO agent_cards (room_code, name, card_json, updated_at) VALUES (?, ?, ?, ?)")
    .run(code, name, cardJson, now);

  // Optional: automatically post a system message when a card is updated
  const agentName = card?.agent?.name || name;
  const agentModel = card?.agent?.model || "unknown";
  appendMessage(code, "system", `${agentName} (${agentModel}) updated their Agent Card.`);

  return { ok: true, updated_at: now };
}

export interface AgentCard {
  agent?: { name: string; model: string; tool?: string };
  owner?: { name: string; role?: string };
  skills?: string[];
  availability?: string;
  capabilities?: { file_sharing?: boolean; task_assignment?: boolean; [key: string]: any };
  node?: { ip: string; port: number; hostname?: string };
  [key: string]: any;
}

export function getPartnerCards(
  code: string,
  name: string
): Ok<{ cards: Array<{ name: string; card: AgentCard; updated_at: number }> }> | Err {
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return { ok: false, error: "room_expired_or_not_found" };

  const rows = db.prepare("SELECT name, card_json, updated_at FROM agent_cards WHERE room_code = ? AND name != ?")
    .all(code, name) as Array<{ name: string; card_json: string; updated_at: number }>;

  const cards = rows.map(row => ({
    name: row.name,
    card: JSON.parse(row.card_json) as AgentCard,
    updated_at: row.updated_at,
  }));

  return { ok: true, cards };
}

export function getNodes(code: string): Ok<{ nodes: Array<{ name: string; node: any; updated_at: number }> }> | Err {
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return { ok: false, error: "room_expired_or_not_found" };

  const rows = db.prepare("SELECT name, card_json, updated_at FROM agent_cards WHERE room_code = ?")
    .all(code) as Array<{ name: string; card_json: string; updated_at: number }>;

  const nodes = rows
    .map(row => ({
      name: row.name,
      card: JSON.parse(row.card_json) as AgentCard,
      updated_at: row.updated_at,
    }))
    .filter(c => c.card.node)
    .map(c => ({
      name: c.name,
      node: c.card.node,
      updated_at: c.updated_at,
    }));

  return { ok: true, nodes };
}

// ── MCP tool operations ───────────────────────────────────────────────────────

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

export function appendMessage(
  code: string,
  from: string,
  content: string,
  to?: string,
  msgType: string = "BROADCAST",
  replyTo?: string
): Ok<{ id: string }> | Err {
  if (new TextEncoder().encode(content).length > MAX_MESSAGE_BYTES) {
    return { ok: false, error: "message_too_large" };
  }
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return { ok: false, error: "room_expired_or_not_found" };

  const id = crypto.randomUUID();
  const timestamp = Date.now();

  // Compress content for storage (transparent to agents). Fall back to raw if compression fails.
  let compressedContent: string;
  try {
    if (content.startsWith("lz:")) {
      compressedContent = content;
    } else {
      const compressed = LZString.compressToEncodedURIComponent(content);
      const verified = LZString.decompressFromEncodedURIComponent(compressed);
      compressedContent = verified === content ? `lz:${compressed}` : content;
    }
  } catch {
    compressedContent = content;
  }

  db.prepare("INSERT INTO messages (id, room_code, sender, recipient, content, timestamp, msg_type, reply_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, code, from, to || null, compressedContent, timestamp, msgType, replyTo || null);

  db.prepare("UPDATE rooms SET last_activity = ? WHERE code = ?").run(Date.now(), code);

  // Track metric
  trackMetric("message_sent", code, from);

  // Emit event for real-time listeners (SSE) with decompressed content (transparent compression)
  const messagePayload = { id, from: from, to: to || undefined, content, ts: timestamp, type: msgType, reply_to: replyTo || undefined };
  messageEvents.emit("message", { room_code: code, message: messagePayload });

  // Fire webhooks (async, non-blocking)
  fireWebhooks(code, "message", { message: messagePayload });

  return { ok: true, id };
}

export function getMessages(
  code: string,
  name: string,
  msgType?: string
): Ok<{ messages: Message[] }> | Err {
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return { ok: false, error: "room_expired_or_not_found" };

  const user = db.prepare("SELECT last_rowid FROM users WHERE room_code = ? AND name = ?").get(code, name) as { last_rowid: number } | undefined;
  if (!user) return { ok: false, error: "not_in_room" };

  // Fetch messages using rowid cursor (avoids skips on mixed broadcast+DM)
  let query = `
    SELECT rowid, id, sender as 'from', recipient as 'to', content, timestamp as ts, msg_type as 'type'
    FROM messages
    WHERE room_code = ?
    AND rowid > ?
    AND (recipient IS NULL OR recipient = ?)
  `;
  const params: any[] = [code, user.last_rowid, name];

  // Filter by message type if requested
  if (msgType) {
    query += " AND msg_type = ?";
    params.push(msgType);
  }

  query += " ORDER BY rowid ASC";

  const rows = db.prepare(query).all(...params) as any[];

  // Filter out own messages and decompress content
  const filtered = rows
    .filter(m => m.from !== name)
    .map(m => ({
      id: m.id,
      from: m.from,
      to: m.to,
      ts: m.ts,
      content: m.content.startsWith("lz:") ? LZString.decompressFromEncodedURIComponent(m.content.slice(3)) || m.content : m.content,
      type: m.type
    }));

  // Advance cursor to max rowid seen (eliminates skips)
  const maxRowid = rows.length > 0 ? rows[rows.length - 1].rowid : user.last_rowid;
  db.prepare("UPDATE users SET last_rowid = ?, last_seen = ? WHERE room_code = ? AND name = ?")
    .run(maxRowid, Date.now(), code, name);

  db.prepare("UPDATE rooms SET last_activity = ? WHERE code = ?").run(Date.now(), code);
  return { ok: true, messages: filtered };
}

export function getAllMessages(
  code: string
): Ok<{ messages: Message[] }> | Err {
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return { ok: false, error: "room_expired_or_not_found" };

  const messages = (db.prepare("SELECT id, sender as 'from', recipient as 'to', content, timestamp as ts, msg_type as 'type' FROM messages WHERE room_code = ?")
    .all(code) as Message[])
    .map(m => ({
      ...m,
      content: m.content.startsWith("lz:") ? LZString.decompressFromEncodedURIComponent(m.content.slice(3)) || m.content : m.content
    }));

  return { ok: true, messages };
}

export function getRoomStatus(
  code: string,
  name: string
): Ok<{ connected: boolean; partners: any[]; message_count: number }> | Err {
  const room = db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code);
  if (!room) return { ok: false, error: "room_expired_or_not_found" };

  const partners = db.prepare(`
    SELECT u.name, c.card_json 
    FROM users u
    LEFT JOIN agent_cards c ON u.room_code = c.room_code AND u.name = c.name
    WHERE u.room_code = ? AND u.name != ?
  `).all(code, name) as any[];

  const partnersWithCards = partners.map(p => ({
    name: p.name,
    card: p.card_json ? JSON.parse(p.card_json) : null
  }));

  const countRow = db.prepare("SELECT COUNT(*) as count FROM messages WHERE room_code = ?").get(code) as { count: number };

  return {
    ok: true,
    connected: partnersWithCards.length > 0,
    partners: partnersWithCards,
    message_count: countRow.count,
  };
}

// ── GC ────────────────────────────────────────────────────────────────────────

export function sweepExpiredRooms(): number {
  const now = Date.now();
  const threshold = now - ROOM_TTL_MS;

  const expired = db.prepare("SELECT code FROM rooms WHERE last_activity < ?").all(threshold) as { code: string }[];

  for (const row of expired) {
    db.prepare("DELETE FROM messages WHERE room_code = ?").run(row.code);
    db.prepare("DELETE FROM users WHERE room_code = ?").run(row.code);
    db.prepare("DELETE FROM rooms WHERE code = ?").run(row.code);
  }

  // Also clean up stale rate limit entries (older than 1 hour)
  const rateLimitThreshold = now - (60 * 60 * 1000);
  db.prepare("DELETE FROM rate_limits WHERE window_start < ?").run(rateLimitThreshold);

  return expired.length;
}

// ── Metrics ──────────────────────────────────────────────────────────────────

export function trackMetric(eventType: string, roomCode: string, agentName: string, latencyMs: number = 0) {
  db.prepare("INSERT INTO metrics (event_type, room_code, agent_name, latency_ms, timestamp) VALUES (?, ?, ?, ?, ?)")
    .run(eventType, roomCode, agentName, latencyMs, Date.now());
}

export function getMessagesPerMinute(): number {
  const oneMinuteAgo = Date.now() - 60_000;
  const row = db.prepare("SELECT COUNT(*) as count FROM metrics WHERE event_type = 'message_sent' AND timestamp > ?")
    .get(oneMinuteAgo) as { count: number };
  return row.count;
}

export function getAvgLatencyMs(): number {
  const fiveMinutesAgo = Date.now() - 300_000;
  const row = db.prepare("SELECT AVG(latency_ms) as avg FROM metrics WHERE event_type = 'api_request' AND timestamp > ? AND latency_ms > 0")
    .get(fiveMinutesAgo) as { avg: number | null };
  return Math.round((row.avg || 0) * 100) / 100;
}

export function getTotalMessagesSent(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM metrics WHERE event_type = 'message_sent'")
    .get() as { count: number };
  return row.count;
}

export function getActiveAgentsCount(): number {
  const fiveMinutesAgo = Date.now() - 300_000;
  const row = db.prepare("SELECT COUNT(DISTINCT agent_name) as count FROM presence WHERE last_heartbeat > ?")
    .get(fiveMinutesAgo) as { count: number };
  return row.count;
}

export function cleanOldMetrics() {
  const oneDayAgo = Date.now() - 86_400_000;
  db.prepare("DELETE FROM metrics WHERE timestamp < ?").run(oneDayAgo);
}

// ── Presence & Typing ────────────────────────────────────────────────────────

export function updatePresence(roomCode: string, agentName: string, status: string = "online") {
  const now = Date.now();
  db.prepare(`INSERT OR REPLACE INTO presence (room_code, agent_name, status, last_heartbeat, is_typing, typing_since)
    VALUES (?, ?, ?, ?, COALESCE((SELECT is_typing FROM presence WHERE room_code = ? AND agent_name = ?), 0),
    COALESCE((SELECT typing_since FROM presence WHERE room_code = ? AND agent_name = ?), 0))`)
    .run(roomCode, agentName, status, now, roomCode, agentName, roomCode, agentName);
}

export function setTyping(roomCode: string, agentName: string, isTyping: boolean) {
  const now = Date.now();
  db.prepare(`INSERT OR REPLACE INTO presence (room_code, agent_name, status, last_heartbeat, is_typing, typing_since)
    VALUES (?, ?, 'online', ?, ?, ?)`)
    .run(roomCode, agentName, now, isTyping ? 1 : 0, isTyping ? now : 0);
}

export function getRoomPresence(roomCode: string): Array<{ agent_name: string; status: string; is_typing: boolean; last_heartbeat: number }> {
  const fiveMinutesAgo = Date.now() - 300_000;
  const rows = db.prepare(`SELECT agent_name, status, is_typing, last_heartbeat FROM presence
    WHERE room_code = ? AND last_heartbeat > ?`).all(roomCode, fiveMinutesAgo) as any[];

  // Auto-expire typing after 10 seconds
  const now = Date.now();
  return rows.map(r => ({
    agent_name: r.agent_name,
    status: r.last_heartbeat > now - 60_000 ? r.status : "offline",
    is_typing: r.is_typing === 1 && r.last_heartbeat > now - 10_000,
    last_heartbeat: r.last_heartbeat,
  }));
}

// ── Reactions ────────────────────────────────────────────────────────────────

export function addReaction(messageId: string, agentName: string, emoji: string): { ok: boolean } {
  db.prepare("INSERT OR REPLACE INTO reactions (message_id, agent_name, emoji, created_at) VALUES (?, ?, ?, ?)")
    .run(messageId, agentName, emoji, Date.now());
  return { ok: true };
}

export function removeReaction(messageId: string, agentName: string): { ok: boolean } {
  db.prepare("DELETE FROM reactions WHERE message_id = ? AND agent_name = ?")
    .run(messageId, agentName);
  return { ok: true };
}

export function getMessageReactions(messageId: string): Array<{ agent_name: string; emoji: string; created_at: number }> {
  return db.prepare("SELECT agent_name, emoji, created_at FROM reactions WHERE message_id = ?")
    .all(messageId) as any[];
}

// ── Webhooks ─────────────────────────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS webhooks (
    room_code TEXT,
    agent_name TEXT,
    webhook_url TEXT,
    events TEXT DEFAULT 'message',
    created_at INTEGER,
    PRIMARY KEY(room_code, agent_name)
  );
`);

export function registerWebhook(roomCode: string, agentName: string, webhookUrl: string, events: string = "message") {
  db.prepare("INSERT OR REPLACE INTO webhooks (room_code, agent_name, webhook_url, events, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(roomCode, agentName, webhookUrl, events, Date.now());
}

export function removeWebhook(roomCode: string, agentName: string) {
  db.prepare("DELETE FROM webhooks WHERE room_code = ? AND agent_name = ?")
    .run(roomCode, agentName);
}

export function getRoomWebhooks(roomCode: string): Array<{ agent_name: string; webhook_url: string; events: string }> {
  return db.prepare("SELECT agent_name, webhook_url, events FROM webhooks WHERE room_code = ?")
    .all(roomCode) as any[];
}

export async function fireWebhooks(roomCode: string, event: string, payload: any) {
  const hooks = getRoomWebhooks(roomCode);
  for (const hook of hooks) {
    if (hook.events.includes(event) || hook.events === "*") {
      try {
        fetch(hook.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, room: roomCode, ...payload, ts: Date.now() }),
        }).catch(() => {}); // fire and forget
      } catch (e) {}
    }
  }
}

// ── Global Agent Directory ───────────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS agent_directory (
    agent_id TEXT PRIMARY KEY,
    agent_name TEXT,
    model TEXT,
    skills TEXT,
    description TEXT,
    contact_room TEXT,
    status TEXT DEFAULT 'available',
    reputation_score REAL DEFAULT 100.0,
    tasks_completed INTEGER DEFAULT 0,
    last_seen INTEGER,
    registered_at INTEGER
  );
`);

try {
  db.run("CREATE INDEX IF NOT EXISTS idx_agent_dir_skills ON agent_directory(skills);");
  db.run("CREATE INDEX IF NOT EXISTS idx_agent_dir_status ON agent_directory(status);");
} catch (e) {}

export interface AgentProfile {
  agent_id: string;
  agent_name: string;
  model: string;
  skills: string;
  description: string;
  contact_room: string;
  status: string;
  reputation_score: number;
  tasks_completed: number;
  last_seen: number;
  registered_at: number;
}

export function registerAgent(profile: Omit<AgentProfile, "registered_at" | "last_seen" | "reputation_score" | "tasks_completed">): AgentProfile {
  const now = Date.now();
  const full: AgentProfile = { ...profile, reputation_score: 100.0, tasks_completed: 0, last_seen: now, registered_at: now };
  db.prepare(`INSERT OR REPLACE INTO agent_directory
    (agent_id, agent_name, model, skills, description, contact_room, status, reputation_score, tasks_completed, last_seen, registered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(full.agent_id, full.agent_name, full.model, full.skills, full.description, full.contact_room, full.status, full.reputation_score, full.tasks_completed, full.last_seen, full.registered_at);
  return full;
}

export function searchAgents(query: string): AgentProfile[] {
  const q = `%${query.toLowerCase()}%`;
  return db.prepare(`SELECT * FROM agent_directory WHERE
    LOWER(agent_name) LIKE ? OR LOWER(skills) LIKE ? OR LOWER(description) LIKE ? OR LOWER(model) LIKE ?
    ORDER BY reputation_score DESC, tasks_completed DESC LIMIT 20`)
    .all(q, q, q, q) as AgentProfile[];
}

export function getAvailableAgents(): AgentProfile[] {
  const fiveMinutesAgo = Date.now() - 300_000;
  return db.prepare("SELECT * FROM agent_directory WHERE status = 'available' AND last_seen > ? ORDER BY reputation_score DESC")
    .all(fiveMinutesAgo) as AgentProfile[];
}

export function updateAgentStatus(agentId: string, status: string) {
  db.prepare("UPDATE agent_directory SET status = ?, last_seen = ? WHERE agent_id = ?")
    .run(status, Date.now(), agentId);
}

export function incrementAgentTasks(agentId: string) {
  db.prepare("UPDATE agent_directory SET tasks_completed = tasks_completed + 1, last_seen = ? WHERE agent_id = ?")
    .run(Date.now(), agentId);
}

export function getAgentProfile(agentId: string): AgentProfile | null {
  return db.prepare("SELECT * FROM agent_directory WHERE agent_id = ?").get(agentId) as AgentProfile | null;
}

export function getAllAgents(): AgentProfile[] {
  return db.prepare("SELECT * FROM agent_directory ORDER BY reputation_score DESC, last_seen DESC LIMIT 100").all() as AgentProfile[];
}

// ── Pinned Messages ──────────────────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS pinned_messages (
    room_code TEXT,
    message_id TEXT,
    pinned_by TEXT,
    pinned_at INTEGER,
    PRIMARY KEY(room_code, message_id)
  );
`);

export function pinMessage(roomCode: string, messageId: string, pinnedBy: string) {
  db.prepare("INSERT OR REPLACE INTO pinned_messages (room_code, message_id, pinned_by, pinned_at) VALUES (?, ?, ?, ?)")
    .run(roomCode, messageId, pinnedBy, Date.now());
}

export function unpinMessage(roomCode: string, messageId: string) {
  db.prepare("DELETE FROM pinned_messages WHERE room_code = ? AND message_id = ?")
    .run(roomCode, messageId);
}

export function getPinnedMessages(roomCode: string): Array<{ message_id: string; pinned_by: string; pinned_at: number }> {
  return db.prepare("SELECT message_id, pinned_by, pinned_at FROM pinned_messages WHERE room_code = ? ORDER BY pinned_at DESC")
    .all(roomCode) as any[];
}

// ── Persistent Rate Limiting ──────────────────────────────────────────────────

export function checkRateLimitPersistent(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const state = db.prepare("SELECT count, window_start FROM rate_limits WHERE key = ?").get(key) as { count: number; window_start: number } | undefined;

  // If no entry or window expired, reset
  if (!state || now - state.window_start > windowMs) {
    db.prepare("INSERT OR REPLACE INTO rate_limits (key, count, window_start, updated_at) VALUES (?, 1, ?, ?)")
      .run(key, now, now);
    return true;
  }

  // Check if limit exceeded
  if (state.count >= max) {
    return false;
  }

  // Increment count
  db.prepare("UPDATE rate_limits SET count = count + 1, updated_at = ? WHERE key = ?")
    .run(now, key);
  return true;
}
