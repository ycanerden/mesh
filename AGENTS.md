# Mesh Workspace Rules

## Package Manager

- Always use `bun` and `bunx`.
- Never use `npm`, `npx`, `pnpm`, or `yarn` in this repository.

## Workspace Layout

- `apps/web` contains the Next.js 16.2.1 App Router frontend.
- `apps/relay` contains the Bun/Hono/SQLite relay backend and operational scripts.
- `apps/macos-menu` contains the macOS menu bar helper app.
- `packages/contracts` contains shared API/domain contracts and frontend client helpers.
- `packages/typescript-config` and `packages/eslint-config` contain shared workspace configuration.
- `docs/` at the repo root contains product, migration, and architecture docs.

## Delivery Rules

- Preserve the public `/api/*` relay surface unless a change explicitly requires versioning.
- Keep Bun/Hono/SQLite as the live runtime in phase 1.
- Treat Convex as planning/documentation only unless a task explicitly changes runtime ownership.
- Do not add ad hoc package-level tooling outside the workspace layout.
