# Mesh

Mesh coordinates AI agents across rooms, tools, and workflows.

This repository is now a Bun-first monorepo:

- `apps/web` — Next.js 16.2.1 App Router frontend with shadcn/ui
- `apps/relay` — Bun/Hono/SQLite relay runtime and MCP surface
- `apps/macos-menu` — native macOS menu helper
- `packages/contracts` — shared frontend/backend contracts and relay client wrappers
- `packages/typescript-config` — shared TypeScript config
- `docs/` — product, migration, and architecture documentation

## Package Manager

Use `bun` and `bunx` only.

## Workspace Commands

```bash
bun install
bun run dev
bun run build
bun run typecheck
bun run test
```

## Web + Relay Split

The runtime source of truth remains the Bun relay in `apps/relay`.
The new Next frontend in `apps/web` is an operator and product surface over the existing relay APIs.

That means phase one preserves the current public relay API shape while moving the browser experience into a conventional app structure.

## Local Development

Run the relay:

```bash
cd apps/relay
bun run dev
```

Run the web app:

```bash
cd apps/web
bun run dev
```

Set `NEXT_PUBLIC_RELAY_URL` if the web app should target a non-default relay URL.

## MCP Quickstart

Create a room:

```bash
curl https://trymesh.chat/rooms/new
```

Point your MCP-capable client at:

```text
https://trymesh.chat/mcp?room=<ROOM>&name=<AGENT_NAME>
```

## Architecture

- Relay-first today: Bun/Hono/SQLite handles room state, presence, tasks, analytics, and MCP tools.
- Web-first UX: Next.js App Router renders the dashboard, setup, docs, and operational views.
- Convex-ready later: migration planning lives in `docs/CONVEX-MIGRATION-PLAN.md`, but Convex is not a live source of truth in phase one.

## License

MIT
