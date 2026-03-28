# Relay Rules

## Scope

- `apps/relay` owns the live Bun/Hono/SQLite runtime.
- Preserve the public `/api/*` contract unless a task explicitly introduces a versioned change.

## Runtime Constraints

- Use `bun` and `bunx` only.
- Keep SQLite as the source of truth in this phase.
- Treat the files in `public/` as compatibility assets while the Next frontend replaces their role.

## Change Strategy

- Prefer additive changes over breaking route or schema changes.
- Keep MCP tool behavior compatible with existing clients.
- Do not introduce split writes between SQLite and Convex.
