import type { Hono } from "hono";
import {
  db,
  verifyAdmin,
  appendMessage,
  setTelegramConfig,
  getTelegramConfig,
} from "../rooms.js";
import {
  createDecision,
  getDecision,
  getPendingDecisions,
  resolveDecision,
} from "../room-manager.js";

// ── Helpers ────────────────────────────────────────────────────────────────

// Raw Telegram API call with retry
async function telegramApiCall(token: string, method: string, body: any, maxRetries = 3): Promise<{ ok: boolean; result?: any; error?: string }> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json() as any;
      if (d.ok) return { ok: true, result: d.result };

      // If rate limited (429), wait for retry_after
      if (res.status === 429 && d.parameters?.retry_after) {
        const wait = d.parameters.retry_after * 1000;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      console.error(`[telegram] API error (${method}):`, d.description);
      if (i === maxRetries - 1) return { ok: false, error: d.description };
    } catch (e: any) {
      console.error(`[telegram] Network error (${method}):`, e.message);
      if (i === maxRetries - 1) return { ok: false, error: e.message };
    }
    // Exponential backoff
    const wait = Math.pow(2, i) * 1000;
    await new Promise(r => setTimeout(r, wait));
  }
  return { ok: false, error: "max_retries_exceeded" };
}

// Escape special HTML chars for Telegram HTML parse_mode
function tgEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Send a Telegram message to a room's configured chat
async function sendTelegramMessage(roomCode: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const { token, chatId } = getTelegramConfig(roomCode);
  if (!token || !chatId) return { ok: false, error: "not_configured" };

  const res = await telegramApiCall(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML"
  });

  return { ok: res.ok, error: res.error };
}

// Track Telegram sends per room to prevent spam (max 10/hour)
const telegramSendLog = new Map<string, number[]>();
function canSendTelegram(roomCode: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const log = telegramSendLog.get(roomCode) || [];
  const recent = log.filter(t => now - t < window);
  telegramSendLog.set(roomCode, recent);
  if (recent.length >= 10) return false;
  recent.push(now);
  return true;
}

// ── Routes ─────────────────────────────────────────────────────────────────

export function registerTelegramRoutes(app: Hono) {

  // ── Telegram Decision Bot: Create Decision ─────────────────────────────────
  app.post("/api/decisions", async (c) => {
    const room = c.req.query("room");
    const name = c.req.query("name");
    if (!room || !name) return c.json({ error: "missing room or name" }, 400);

    try {
      const { description, notifyList } = await c.req.json();
      if (!description || !notifyList || !Array.isArray(notifyList)) {
        return c.json({ error: "missing description or notifyList" }, 400);
      }

      const decision = createDecision(room, name, description, notifyList);

      // Post decision message to room
      const mentions = notifyList.map((u: string) => `@${u}`).join(" ");
      const decisionMsg = `🚨 DECISION REQUIRED: ${description}\n\nNotified: ${mentions}\nID: ${decision.id}`;
      appendMessage(room, name, decisionMsg, undefined, "DECISION");

      // Notify via Telegram — rate limited to 10/hour to prevent spam
      if (canSendTelegram(room)) {
        const tgText = `🚨 <b>DECISION NEEDED</b> — ${tgEscape(room)}\n\n${tgEscape(description)}\n\nReply with:\n/approve ${decision.id}\n/reject ${decision.id}\n/hold ${decision.id}`;
        await sendTelegramMessage(room, tgText);
      }

      return c.json({ ok: true, decision });
    } catch (e) {
      return c.json({ error: "invalid_request", detail: String(e) }, 400);
    }
  });

  // ── Telegram Test Ping (no decision created, no rate limit impact) ───────────
  const telegramTestHandler = async (c: any) => {
    const code = c.req.param("code");
    const token = c.req.header("x-mesh-secret") || c.req.query("token") || (await c.req.json().catch(() => ({} as any))).secret;
    if (!verifyAdmin(code, token || "")) return c.json({ ok: false, error: "unauthorized" }, 401);
    const result = await sendTelegramMessage(code, `✅ Mesh test ping — room <b>${code}</b> is connected.`);
    if (!result.ok) {
      return c.json({ ok: false, error: result.error }, 400);
    }
    return c.json({ ok: true, message: "Test ping sent! Check your Telegram." });
  };
  app.get("/api/rooms/:code/telegram/test", telegramTestHandler);
  app.post("/api/rooms/:code/telegram/test", telegramTestHandler);

  // ── Telegram Decision Bot: Get Pending Decisions ────────────────────────────
  app.get("/api/decisions", (c) => {
    const room = c.req.query("room");
    if (!room) return c.json({ error: "missing room" }, 400);

    const decisions = getPendingDecisions(room);
    return c.json({ ok: true, decisions });
  });

  // ── Telegram Decision Bot: Resolve Decision ────────────────────────────────
  app.post("/api/decisions/:id", async (c) => {
    const id = c.req.param("id");
    const room = c.req.query("room");
    const name = c.req.query("name");

    if (!id || !room || !name) {
      return c.json({ error: "missing id, room, or name" }, 400);
    }

    const decision = getDecision(id);
    if (!decision) return c.json({ error: "decision not found" }, 404);
    if (decision.status !== "pending") {
      return c.json({ error: "decision already resolved" }, 409);
    }

    try {
      const { status, text } = await c.req.json();
      if (!["approved", "rejected", "hold"].includes(status)) {
        return c.json({ error: "invalid status" }, 400);
      }

      resolveDecision(id, status, text || "", name);

      // Post resolution to room
      const emojiMap: Record<string, string> = { approved: "✅", rejected: "❌", hold: "⏸️" };
      const emoji = emojiMap[status] || "ℹ️";
      const resolutionMsg = `${emoji} DECISION RESOLVED:\n${decision.description}\n**${status.toUpperCase()}** by @${name}${text ? `: ${text}` : ""}`;
      appendMessage(room, name, resolutionMsg, undefined, "RESOLUTION");

      return c.json({ ok: true, decision: getDecision(id) });
    } catch (e) {
      return c.json({ error: "invalid_request", detail: String(e) }, 400);
    }
  });

  // ── Telegram Integration ───────────────────────────────────────────────────

  app.post("/api/rooms/:code/telegram", async (c) => {
    const code = c.req.param("code");
    const token = c.req.header("x-mesh-secret") || c.req.query("secret");

    // Verify admin token
    if (!verifyAdmin(code, token || "")) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const { telegram_token, telegram_chat_id } = await c.req.json();
    if (!telegram_token || !telegram_chat_id) {
      return c.json({ ok: false, error: "missing_fields" }, 400);
    }

    setTelegramConfig(code, telegram_token, telegram_chat_id);

    // Try to set webhook automatically with secret_token for security
    const baseUrl = process.env.PUBLIC_URL || c.req.url.split("/api")[0];
    const webhookUrl = `${baseUrl}/api/webhook/telegram/${code}`;
    // Use first 12 chars of admin token as webhook secret
    const webhookSecret = (token || "mesh").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);

    try {
      const res = await fetch(`https://api.telegram.org/bot${telegram_token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, secret_token: webhookSecret }),
      });
      const d = await res.json();
      console.log(`[telegram] Webhook set to ${webhookUrl}:`, d);
    } catch (e) {
      console.error("[telegram] Failed to set webhook:", e);
    }

    return c.json({ ok: true, webhook_url: webhookUrl });
  });

  // GET /api/rooms/:code/telegram/status — check if Telegram is configured
  app.get("/api/rooms/:code/telegram/status", async (c) => {
    const code = c.req.param("code");
    const token = c.req.header("x-mesh-secret") || c.req.query("token");
    if (!verifyAdmin(code, token || "")) return c.json({ ok: false, error: "unauthorized" }, 401);
    const { token: botToken, chatId } = getTelegramConfig(code);
    const connected = !!(botToken && chatId);
    return c.json({ ok: true, connected, has_token: !!botToken, has_chat_id: !!chatId });
  });

  app.post("/api/webhook/telegram/:code", async (c) => {
    const code = c.req.param("code");

    // Security: Verify secret token from Telegram
    const secret = c.req.header("x-telegram-bot-api-secret-token");
    const roomAdminToken = db.prepare("SELECT admin_token FROM rooms WHERE code = ?").get(code) as { admin_token: string } | undefined;
    const expectedSecret = (roomAdminToken?.admin_token || "mesh").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);

    if (secret !== expectedSecret) {
      console.warn(`[telegram] Webhook rejected: invalid secret token for room ${code}`);
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const body = await c.req.json();

    if (body.message && body.message.text) {
      const msg = body.message;
      const from = msg.from?.first_name || msg.from?.username || "Unknown";
      const text = msg.text.trim();

      // Chat ID verification — only accept messages from configured chat
      const { chatId: configuredChatId } = getTelegramConfig(code);
      if (configuredChatId && String(msg.chat?.id) !== String(configuredChatId)) {
        console.warn(`[telegram] Rejected message from unknown chat ${msg.chat?.id} (expected ${configuredChatId})`);
        return c.json({ ok: true }); // Silently ignore, don't reveal config
      }

      // Decision commands: /approve <id>, /reject <id>, /hold <id>
      const cmdMatch = text.match(/^\/(approve|reject|hold)\s+(\S+)/i);
      if (cmdMatch) {
        const [, action, decisionId] = cmdMatch;
        // Map command verb → decision status
        const statusMap: Record<string, "approved" | "rejected" | "hold"> = {
          approve: "approved",
          reject: "rejected",
          hold: "hold",
        };
        const status = statusMap[action.toLowerCase()];
        if (!status) return c.json({ ok: true });
        const decision = getDecision(decisionId);
        if (decision && decision.status === "pending") {
          resolveDecision(decisionId, status, `Via Telegram by ${from}`, from);
          const emojiMap: Record<string, string> = { approved: "✅", rejected: "❌", hold: "⏸️" };
          const emoji = emojiMap[status] || "ℹ️";
          const roomMsg = `${emoji} DECISION ${status.toUpperCase()} by ${from} (via Telegram):\n${decision.description}`;
          appendMessage(code, `${from} (Telegram)`, roomMsg, undefined, "RESOLUTION");
          await sendTelegramMessage(code, `${emoji} Got it — decision <b>${tgEscape(status)}</b>.\n${tgEscape(decision.description)}`);
        } else {
          await sendTelegramMessage(code, `⚠️ Decision <code>${tgEscape(decisionId)}</code> not found or already resolved.`);
        }
        return c.json({ ok: true });
      }

      // Regular message → post to Mesh room + auto-ack to sender
      appendMessage(code, `${from} (Telegram)`, text, undefined, "BROADCAST");
      const baseUrl = process.env.PUBLIC_URL || "https://trymesh.chat";
      await sendTelegramMessage(code, `✓ Posted to #${code}. View replies: ${baseUrl}/dashboard?room=${code}`);
    }

    return c.json({ ok: true });
  });
}
