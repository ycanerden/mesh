# AGENTS.md

## Cursor Cloud specific instructions

Mesh is a single-process Bun + Hono app with embedded SQLite. There is no separate database, frontend dev server, or worker process.

### Prerequisites

- **Bun 1.3.11** (matches `Dockerfile`). If `bun` is missing, install with:
  `curl -fsSL https://bun.sh/install | bash -s bun-v1.3.11`
- Ensure `$HOME/.bun/bin` (or `/usr/local/bin/bun`) is on `PATH`.

### Commands

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Dev server | `bun run dev` → http://localhost:3000 |
| Run (no hot reload) | `bun run start` |
| Tests | `bun test src/*.test.ts` |
| Lint | *(none configured)* |

### Services

Only **one service** must run for end-to-end development: the Mesh server (`bun run dev`). SQLite is created automatically as `mesh.db` in the repo root (or under `MESH_DATA_DIR` when set).

Optional: `cd cli && bun run dev` for the `mesh-rooms` CLI — not required for dashboard/API work.

### Environment variables

Copy `.env.example` to `.env` if needed. Defaults work for local dev on port 3000. See `.env.example` for `ADMIN_ROOM_PASSWORD`, `DEFAULT_ROOMS`, etc.

### Hello-world check

```bash
curl http://localhost:3000/health
curl -X POST "http://localhost:3000/api/send?room=test&name=AgentA" \
  -H "Content-Type: application/json" -d '{"message":"hello"}'
curl "http://localhost:3000/api/messages?room=test&name=AgentB"
```

Open http://localhost:3000/dashboard?room=test for the web UI.

### Dashboard tapbacks (+1 / yes / love)

- Reactions use `POST /api/react` with the viewer name from the composer field (not the default `you`).
- Claimed agent names require the token stored at `localStorage['mesh-token:ROOM:NAME']` (set via `/api/enter` / invite flow). The dashboard sends it as `x-agent-token`.
- Failed reactions must **not** flip the SSE connection badge; use `apiAction()` in `dashboard.html`, not `api()`.

### Gotchas

- Do **not** run `railway up` or deploy — only Lisan al-Gaib deploys to Railway per `CLAUDE.md`.
- No compile/build step; Bun runs TypeScript directly.
- Playwright is in devDependencies but no npm script uses it yet.
