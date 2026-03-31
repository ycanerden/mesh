import type { Hono } from "hono";
import crypto from "node:crypto";
import {
  upsertSubscription,
  getSubscriptionByEmail,
  getSubscriptionByRoom,
  cancelSubscription,
  getSubscriptionStats,
  provisionPaidRoom,
} from "../rooms.js";

// ── Stripe Billing ────────────────────────────────────────────────────────────
// Activated when STRIPE_WEBHOOK_SECRET is set in Railway.
// Payment links (STRIPE_PRO_LINK / STRIPE_TEAM_LINK) are set separately.
//
// Webhook setup: in Stripe Dashboard → Webhooks → Add endpoint:
//   https://trymesh.chat/api/billing/webhook
//   Events: checkout.session.completed, customer.subscription.deleted, customer.subscription.updated

export function registerBillingRoutes(app: Hono) {
  // POST /api/billing/webhook — receives Stripe events
  app.post("/api/billing/webhook", async (c) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return c.json({ error: "stripe_not_configured" }, 503);

    const rawBody = await c.req.text();
    const sig = c.req.header("stripe-signature") || "";

    // Verify webhook signature using HMAC-SHA256
    // Stripe sig format: t=timestamp,v1=hash
    // Also enforce 300s replay window (Stripe's recommended tolerance)
    const STRIPE_TOLERANCE_SECS = 300;
    let verified = false;
    try {
      const parts = sig.split(",");
      const tPart = parts.find(p => p.startsWith("t="));
      const v1Part = parts.find(p => p.startsWith("v1="));
      if (tPart && v1Part) {
        const t = tPart.slice(2);
        const expectedSig = v1Part.slice(3);
        // Replay attack protection: reject events older than tolerance window
        const eventAge = Math.floor(Date.now() / 1000) - parseInt(t, 10);
        if (isNaN(eventAge) || eventAge > STRIPE_TOLERANCE_SECS) {
          return c.json({ error: "webhook_timestamp_expired", age_seconds: eventAge }, 400);
        }
        const payload = `${t}.${rawBody}`;
        const hmac = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");
        // Constant-time comparison to prevent timing attacks
        verified = hmac.length === expectedSig.length &&
          crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedSig, "hex"));
      }
    } catch {}

    if (!verified) return c.json({ error: "invalid_signature" }, 401);

    let event: any;
    try { event = JSON.parse(rawBody); } catch { return c.json({ error: "invalid_json" }, 400); }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_details?.email || session.customer_email || "";
      const customerId = session.customer || "";
      const subscriptionId = session.subscription || null;
      // Detect plan from metadata or price — default to pro
      const plan = session.metadata?.plan || (session.amount_total >= 2900 ? "team" : "room");
      const roomCode = session.metadata?.room_code || session.client_reference_id || null;

      if (email && customerId) {
        // Provision a private room for the paying customer
        const provisioned = provisionPaidRoom(email, plan, roomCode);

        upsertSubscription({
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          email,
          plan,
          status: "active",
          room_code: provisioned.room_code,
          current_period_end: null,
          room_password: provisioned.password,
        });
        console.log(`[billing] New ${plan} subscription: ${email} → room ${provisioned.room_code}`);
      }
    } else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      const status = sub.status === "active" ? "active" : "cancelled";
      if (sub.id) {
        upsertSubscription({
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer,
          email: sub.metadata?.email || "",
          plan: sub.metadata?.plan || "pro",
          status,
          room_code: sub.metadata?.room_code || null,
          current_period_end: sub.current_period_end ? sub.current_period_end * 1000 : null,
        });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      if (sub.id) cancelSubscription(sub.id);
      console.log(`[billing] Subscription cancelled: ${sub.id}`);
    }

    return c.json({ received: true });
  });

  // GET /api/billing/status?email=... or ?room=... — check subscription status
  app.get("/api/billing/status", (c) => {
    const email = c.req.query("email");
    const roomCode = c.req.query("room");
    if (email) {
      const sub = getSubscriptionByEmail(email);
      return c.json({ subscribed: !!sub, plan: sub?.plan || "free", status: sub?.status || "none", room_code: sub?.room_code || null });
    }
    if (roomCode) {
      const sub = getSubscriptionByRoom(roomCode);
      return c.json({ subscribed: !!sub, plan: sub?.plan || "free", status: sub?.status || "none", room_code: sub?.room_code || null });
    }
    return c.json({ error: "provide email or room param" }, 400);
  });

  // GET /api/billing/activation?email=...&session_id=... — returns room code + password for success page
  // Requires Stripe checkout session ID to prevent unauthorized access
  app.get("/api/billing/activation", (c) => {
    const email = c.req.query("email");
    const sessionId = c.req.query("session_id");
    if (!email) return c.json({ error: "provide email param" }, 400);
    const sub = getSubscriptionByEmail(email) as any;
    if (!sub) return c.json({ found: false });
    // Only return password if a valid session_id is provided (from Stripe checkout redirect)
    const includePassword = sessionId && sub.stripe_session_id && sessionId === sub.stripe_session_id;
    return c.json({ found: true, room_code: sub.room_code, plan: sub.plan, password: includePassword ? (sub.room_password || null) : "***hidden***" });
  });

  // GET /api/billing/stats — admin only, subscription counts
  app.get("/api/billing/stats", (c) => {
    const secret = c.req.header("x-mesh-secret") || c.req.query("secret");
    const ADMIN_CLAIM_SECRET = process.env.ADMIN_CLAIM_SECRET;
    if (!ADMIN_CLAIM_SECRET || secret !== ADMIN_CLAIM_SECRET) return c.json({ error: "unauthorized" }, 401);
    return c.json(getSubscriptionStats());
  });
}
