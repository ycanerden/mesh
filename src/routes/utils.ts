import { checkRateLimitPersistent, isExemptFromRateLimit, verifyAdmin, getRoomPasswordHash, verifyRoomPassword } from "../rooms.js";

export const VERSION = "2.9.0";
export const startTime = Date.now();
export const SSE_ENABLED = process.env.SSE_DISABLED !== "true";

// Track active SSE connections
export let activeConnections = { count: 0 };

export function checkRateLimit(key: string, max: number, windowMs: number, name?: string): boolean {
  if (name && isExemptFromRateLimit(name)) return true;
  return checkRateLimitPersistent(key, max, windowMs);
}

// ── Admin page protection (per-room) ─────────────────────────────────────────
export function isValidPasswordSession(room: string, val: string): boolean {
  if (!val.startsWith("pwdsess_")) return false;
  const hash = getRoomPasswordHash(room);
  if (!hash) return false;
  return val === `pwdsess_${hash}`;
}

export function hasRoomAccess(c: any, room: string): boolean {
  // 1. Check admin cookie from login
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(new RegExp(`mesh_admin_${room}=([^;]+)`));
  if (match) {
    const val = decodeURIComponent(match[1] || "");
    if (verifyAdmin(room, val) || isValidPasswordSession(room, val)) return true;
  }
  // 2. Check access_token param/header
  const hash = getRoomPasswordHash(room);
  const accessToken = c.req.query("access_token") || c.req.header("x-room-token");
  if (hash && accessToken && accessToken === `${room}.${hash}`) return true;
  // 3. Check password query param directly
  const password = c.req.query("password");
  if (hash && password && verifyRoomPassword(room, password)) return true;
  // 4. Check admin token param/header
  const token = c.req.query("token") || c.req.header("x-admin-token");
  if (token && verifyAdmin(room, token)) return true;
  // 5. No password = open room
  if (!hash) return true;
  return false;
}

// ── Duplicate message dedup ────────────────────────────────────────────────────
const recentMsgHashes = new Map<string, { hash: string; ts: number }[]>();
export function isDuplicateMessage(room: string, name: string, content: string): boolean {
  const key = `${room}:${name}`;
  const now = Date.now();
  const windowMs = 60_000;
  // simple hash: first 80 chars normalized
  const hash = content.trim().slice(0, 80).toLowerCase().replace(/\s+/g, ' ');
  const history = (recentMsgHashes.get(key) || []).filter(e => now - e.ts < windowMs);
  if (history.some(e => e.hash === hash)) return true;
  history.push({ hash, ts: now });
  recentMsgHashes.set(key, history.slice(-20)); // keep last 20 entries
  return false;
}

// Pass-through — no analytics injection
export function injectAnalytics(html: string): string {
  return html;
}
