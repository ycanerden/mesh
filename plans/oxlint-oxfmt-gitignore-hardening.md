# Harden Ignore Rules and Migrate to Oxlint/Oxfmt via Official Migration Paths

## Summary

Do one follow-up repo pass that:

1. hardens `.gitignore` coverage across the monorepo so local secrets, AI tool state, build artifacts, nested repo metadata, and app-specific runtime data cannot leak from the open-source tree;
2. migrates JS/TS linting and formatting to `oxlint` + `oxfmt` using the official migration workflows from the `migrate-oxlint` and `migrate-oxfmt` skills, adapted to `bun`/`bunx`;
3. stores this plan in `plans/`, validates the full workspace, and finishes with one clear commit.

Chosen default: full `oxlint` + `oxfmt` standardization, not a hybrid ESLint setup.

## Key Changes

- Add a new plan file in `plans/` for this pass before implementation.
- Normalize ignore rules:
  - Root `.gitignore` becomes the canonical workspace-level ignore file for `node_modules`, Bun cache, `.turbo`, `.next`, `dist`, `build`, coverage, logs, SQLite/db files, `.env*` with explicit examples allowed, AI agent state directories, editor/OS noise, `.vercel`, and accidental nested VCS metadata.
  - `apps/web/.gitignore`, `apps/relay/.gitignore`, and `apps/macos-menu/.gitignore` are reduced to app-local exceptions only.
  - Preserve tracked root `bun.lock`; do not ignore it.
  - Remove accidental nested Git metadata in `apps/web/.git`.
  - Remove remaining stale local junk such as the empty legacy `walkie-talkie` residue if it only contains ignored noise.
- Migrate linting with the official Ox migration path:
  - Run `bunx @oxlint/migrate` against the current ESLint flat config to generate `.oxlintrc.json`.
  - Review and trim the generated config for this repo: keep the useful built-in categories and rules, avoid carrying forward unnecessary Next/React plugin baggage if Ox handles it natively.
  - Add root `lint` script using `bunx oxlint@latest`.
  - Add root `lint:fix` only if the migrated rule set has useful autofixes and the repo wants that workflow.
  - Remove the obsolete ESLint app-local workflow from `apps/web` if Oxlint fully covers the repo’s intended lint surface.
- Migrate formatting with the official Ox migration path:
  - Since there is no Prettier/Biome config today, generate `.oxfmtrc.json` with the official Oxfmt path (`bunx oxfmt@latest --init` or `--migrate` only if a config source is discovered during implementation).
  - Configure root formatting scripts:
    - `bun run format` -> `bunx oxfmt@latest`
    - `bun run format:check` -> `bunx oxfmt@latest --check`
  - Keep the config minimal and explicit; only add options needed for repo consistency.
  - Use Oxfmt as the sole formatter for JS/TS/TOML/package manifests in the workspace.
- Align package scripts with the new root workflow:
  - Root scripts become the primary interface for lint/format.
  - Package-level scripts are reduced or delegated so there is one obvious quality path.
  - Keep `bun run typecheck`, `bun run test`, and `bun run build` as the verification gates for Next and relay behavior.

## Public Interfaces / Tooling Changes

- Canonical repo quality commands after migration:
  - `bun run lint`
  - `bun run format`
  - `bun run format:check`
  - `bun run typecheck`
  - `bun run test`
  - `bun run build`
- New config files at repo root:
  - `.oxlintrc.json`
  - `.oxfmtrc.json`
- Remove app-local ESLint config and related dependencies if they are no longer used by any script.

## Test Plan

- Ignore-rule validation:
  - Use `git check-ignore` on representative sensitive/local files: `.env.local`, `mesh.db`, `.claude/*`, `apps/web/.next/*`, `apps/relay/dist/*`, `.vercel/*`.
  - Confirm tracked files like root `bun.lock` are not ignored.
  - Confirm no nested Git metadata remains in `apps/web`.
- Migration validation:
  - `bun install`
  - `bun run lint`
  - `bun run format:check`
  - `bun run typecheck`
  - `bun run test`
  - `bun run build`
- Repo hygiene validation:
  - `git status` contains only intended tracked changes.
  - No stale `walkie-talkie` contents remain beyond intentionally ignored junk.
  - Ox configs are root-owned and package scripts are consistent.

## Assumptions

- The Ox migration will use the official skill-recommended tooling, but with `bunx` instead of `npx` to satisfy repo rules.
- The repo should fully standardize on Oxlint/Oxfmt rather than keep ESLint for Next-specific linting.
- If the migration tool generates extra rules/plugins that are noisy or redundant, implementation should simplify the config rather than preserve everything mechanically.
- Final commit message default: `chore: harden gitignores and migrate to oxlint/oxfmt`.
- Any destructive cleanup needed for nested `.git` or stale legacy junk should follow the repo safety confirmation flow during implementation.
