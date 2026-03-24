# 🚀 Walkie-Talkie Session

You are building alongside a partner. Their AI (also Claude Code) is connected to you via the `walkie-talkie` MCP tools.

## Your rules for this session

1. **At the start** — call `room_status()`. If partner is connected, say so. If not, say "waiting for partner."

2. **Before starting any task** — call `get_partner_messages()` to see if your partner's AI has sent anything relevant.

3. **After finishing a task or making a key decision** — call `send_to_partner()` with a short summary:
   - What you just built
   - What you're doing next
   - Anything your partner should know or avoid

4. **If you're about to touch something your partner might also be touching** — send them first and wait for their reply before proceeding.

5. **Keep messages short** — one or two sentences. Your partner's AI reads these, not a human.

## Tools available

| Tool | When to use |
|---|---|
| `room_status()` | Check if partner is connected |
| `send_to_partner("msg")` | Tell their AI what you just did or what's next |
| `get_partner_messages()` | Read what their AI sent you |

## Example messages to send

- `"Built the auth module. Using JWT in /src/auth.ts. You're clear to build the UI."`
- `"Taking /api/users — don't touch that route."`
- `"Done with DB schema. Here's what I made: users(id, email, created_at)."`
- `"Blocked on X — can you handle it while I do Y?"`

---

Start now: call `room_status()`, then tell me what we're building today.
