# Restructure Mesh into a Bun-first Turborepo with Next 16.2.1 Web

## Summary

Rebuild the repo as a conventional Bun-based monorepo and normalize the accidental Finder-created structure. Keep the product name `Mesh`, but use conventional internal paths:

- `apps/web` for the Next.js 16.2.1 App Router frontend
- `apps/relay` for the existing Bun/Hono/SQLite backend
- `apps/macos-menu` for the existing macOS helper app
- `packages/contracts` for shared API/domain types
- `packages/typescript-config` and `packages/eslint-config` for shared config
- `docs/` at repo root for product, architecture, and migration docs

This is a hybrid migration:

- Bun/Hono/SQLite remains the live backend in phase 1.
- All current HTML pages in `Developer/walkie-talkie/public` are rewritten into `apps/web`.
- Convex is documented and prepared for later adoption, but not made the runtime source of truth in phase 1.

## Key Changes

### 1. Normalize the repo and remove accidental structure

- Treat `Developer/walkie-talkie` as the real source tree.
- Treat root `walkie-talkie/` as stale leftover content; preserve any unique files, then remove it only after parity is confirmed.
- Remove tracked runtime artifacts from versioned source during migration planning and implementation:
  - `node_modules/`
  - local SQLite db artifacts like `mesh.db`
  - stray `.DS_Store`
- Update root `.gitignore` so the repo no longer behaves like a pseudo-home-directory mirror.

### 2. Create the monorepo skeleton

- Root `package.json`:
  - `private: true`
  - `packageManager: bun`
  - scripts only delegate via `turbo run ...`
- Root `turbo.json`:
  - define package tasks for `dev`, `build`, `lint`, `test`, `typecheck`
  - no root-task business logic
- Root `bunfig.toml`:
  - standardize Bun behavior for workspace installs/scripts
- Workspaces:
  - `apps/*`
  - `packages/*`

### 3. Move the existing backend into `apps/relay`

- Move current Bun server code from `Developer/walkie-talkie/src` into `apps/relay/src`.
- Move operational scripts into `apps/relay/scripts`, keeping only scripts that still match the new structure.
- Preserve the current public HTTP API shape in phase 1 so the frontend migration does not require simultaneous backend rewrites.
- Split the large backend into clearer modules during migration:
  - HTTP routes
  - domain services
  - persistence/db access
  - MCP/tool definitions
- Keep SQLite in `apps/relay` for phase 1 with a dedicated data path and explicit dev/prod config.

### 4. Build `apps/web` on Next 16.2.1 with shadcn/ui

- Scaffold `apps/web` as a Next.js 16.2.1 App Router app using Bun only.
- Use Tailwind CSS and shadcn/ui in `apps/web`.
- Keep shadcn components app-local in `apps/web` rather than creating `packages/ui` yet; there is only one React app today.
- Rewrite the current static pages into typed routes/components:
  - marketing/home
  - setup/install
  - dashboard/office/activity/analytics
  - pricing, privacy, terms, changelog, leaderboard, waitlist, docs-like surfaces
- Replace inline HTML/CSS/JS pages with:
  - `app/(marketing)/*`
  - `app/(product)/*`
  - shared layout/components
  - typed API client against `apps/relay`
- Preserve existing external route paths where practical so deployed URLs do not churn.

### 5. Add agent-facing docs correctly

- Keep a repo-root `AGENTS.md` for workspace-wide rules:
  - Bun-only commands
  - monorepo boundaries
  - where backend, web, and docs live
  - no ad hoc package managers
- Add `apps/web/AGENTS.md` specifically for Next guidance.
- Generate the Next agent docs with:
  - `bunx @next/codemod@latest agents-md`
- Because Next.js docs currently show `16.2.1`, and the AI agents guide says newer setups generate agent docs automatically while older flows use the codemod, use the codemod in `apps/web` to make the app-local agent instructions explicit and version-matched.
- Add a short `apps/relay/AGENTS.md` for Bun/Hono/SQLite boundaries if needed.

### 6. Add Convex documentation without changing runtime ownership

- Add a repo doc describing where Convex could replace or complement the current relay later:
  - room/presence/message/event domains
  - migration constraints
  - additive rollout path
- Add Convex-specific agent guidance only as documentation and planning material in phase 1.
- Do not split live writes between SQLite and Convex in the first migration.

## Public Interfaces / Contracts

- Preserve existing relay endpoints in phase 1, including current `/api/*` routes used by the dashboards and setup flows.
- Introduce a typed shared contract package for:
  - room
  - message
  - presence
  - task
  - handoff
  - agent directory
  - analytics payloads used by the web app
- Web app consumes backend through typed fetch wrappers; no untyped route-by-route duplication.
- Product branding remains `Mesh`; internal folder names become conventional (`web`, `relay`, `macos-menu`).

## Test Plan

- Workspace validation:
  - `bun install`
  - `bun run build`
  - `bun run typecheck`
  - `bun run test`
- Backend:
  - keep and adapt existing `rooms.test.ts`
  - add API smoke tests for critical endpoints: room creation, join, send, read, stream/presence
- Frontend:
  - route smoke tests for every migrated page
  - key user-path tests for landing, setup, dashboard, room creation, and waitlist
- Integration:
  - web app against local relay using the shared contracts package
  - confirm preserved legacy URLs still render the new Next routes
- Repo hygiene:
  - no tracked `node_modules`
  - no tracked local db file
  - no duplicate `walkie-talkie` source trees remaining

## Assumptions

- External product name stays `Mesh`; only internal repo structure becomes more conventional.
- `apps/web` is a full rewrite of the current HTML surface in phase 1.
- `apps/relay` remains the production backend in phase 1.
- Convex is documented/prepared, not activated as the live backend in this first migration.
- All commands use `bun`/`bunx` only.
- shadcn/ui stays inside `apps/web` until there is a second React consumer that justifies a shared UI package.
