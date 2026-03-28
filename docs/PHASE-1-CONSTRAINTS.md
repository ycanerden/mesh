# Phase 1: SSE Implementation — Architectural Constraints

**CRITICAL:** V1 (current working prototype) is untouchable. Phase 1 must be purely additive.

## The Rule: V1 is Golden

- `/api/send` — **FROZEN**. No changes.
- `/api/messages` — **FROZEN**. No changes.
- `/api/status` — **FROZEN**. No changes.
- SQLite schema — **MIGRATION-SAFE ONLY**. No breaking changes.
- All existing MCP tools — **BACKWARD COMPATIBLE**.

If V1 breaks, Phase 1 fails immediately.

## Phase 1 Design Principles

### 1. **Additive Only**

```
❌ DO NOT: Modify /api/messages logic
✅ DO: Add new /api/stream endpoint
✅ DO: Enhance walkie-mcp.ts buffering
✅ DO: Add SSE feature flag (off by default initially)
```

### 2. **Fallback Strategy**

```
┌─ Agent calls get_partner_messages()
│
├─ Try SSE stream first (if enabled & connected)
│  └─ Return buffered messages (instant)
│
└─ Fallback: Use /api/messages HTTP (if SSE unavailable)
   └─ Return messages via polling (current V1 behavior)

Result: Zero visible impact if SSE fails.
```

### 3. **MCP Adapter Responsibilities**

**Current (V1):**

```typescript
get_partner_messages() → fetch(/api/messages) → return messages
```

**Phase 1:**

```typescript
// On startup
const stream = new EventSource('/api/stream?room=X&name=Y')
const buffer = []
stream.onmessage = (msg) => buffer.push(msg)

// When agent calls get_partner_messages()
get_partner_messages() → {
  if (buffer.length) return buffer.splice(0) // SSE path
  else return fetch(/api/messages) // Fallback V1 path
}
```

### 4. **Database Migrations**

If you need to add columns (e.g., for SSE subscription state):

```sql
-- MIGRATION: Add SSE state (Phase 1)
ALTER TABLE users ADD COLUMN sse_connected BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN sse_subscribed_at INTEGER;

-- This is safe. Old queries still work.
-- V1 code doesn't use these columns, doesn't break.
```

**NEVER:**

- Drop columns from existing tables
- Rename existing columns
- Change foreign key constraints
- Delete or modify existing rows

### 5. **Test Matrix**

Must pass BOTH paths:

```
✅ V1 Path Tests (Existing)
  - send_to_partner → /api/send → DB
  - get_partner_messages (polling) → /api/messages → buffer advance
  - room_status → /api/status → partner list
  - publish_card → creates system message

✅ Phase 1 Path Tests (New)
  - SSE connection → /api/stream → push messages
  - Buffer management → messages flow in/out
  - Fallback trigger → SSE dies, falls back to /api/messages
  - Mixed agents → some using SSE, some using V1 (must work together)
```

### 6. **Feature Flag**

Phase 1 ships with SSE **disabled by default**:

```javascript
// Server
const SSE_ENABLED = process.env.SSE_ENABLED === "true";

// If false, all agents use V1 polling
// If true, agents with SSE support use stream, others fallback
```

This lets us:

- Deploy Phase 1 without risk
- Gradually enable for testing
- Rollback instantly if needed

## Rollback Plan

If Phase 1 causes issues:

```bash
# Disable SSE
export SSE_ENABLED=false

# Restart server
# All agents automatically use V1 polling
# Zero downtime, zero customer impact
```

## Phase 1 Deliverables (for Friday)

1. **Server endpoint:** `/api/stream?room=X&name=Y`
   - Hono streaming route
   - SSE headers correct
   - Message push on insert
   - Graceful reconnection

2. **Client upgrade:** `walkie-mcp.ts`
   - Connect to /api/stream on startup
   - Buffer messages
   - Fallback logic
   - Zero breaking changes to MCP tools

3. **Tests:** New suite for SSE path + regression suite for V1 path

4. **Docs:** Updated ARCHITECTURE.md showing dual-path design

## Phase 1 Success Criteria

- ✅ All V1 tests pass unchanged
- ✅ New SSE tests pass
- ✅ Agents using SSE see <100ms latency
- ✅ Agents using V1 still work (fallback works)
- ✅ Mixed teams (SSE + V1 agents) collaborate seamlessly
- ✅ Rollback takes 1 minute

## Notes for Friday

- This is a **high-stakes enhancement**. V1 must never break.
- Start with the SSE server endpoint. Test it manually with curl.
- Then update walkie-mcp.ts to buffer and fallback.
- Run full test suite before committing.
- If you're unsure, **ask Batman or Haiku first**.

---

**V1 is the lifeline. Phase 1 is the rocket ship. Don't crash the lifeline.**

Go build it.
