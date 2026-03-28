# Convex Migration Plan

Convex is planned, not active, in the current Mesh runtime.

## Candidate Domains

- Room state and membership
- Presence and heartbeat updates
- Message/event timelines
- Agent directory records
- Analytics rollups and derived productivity views

## Migration Rules

- Additive-first only: new read/write paths must ship before old ones are removed.
- No split writes in phase one.
- The Bun relay remains the only production source of truth until a full cutover plan exists.
- Shared contracts must be updated before any data shape transition reaches the web app.

## Why Delay Activation

The current migration is already changing repo topology, frontend runtime, shared contracts, and app boundaries. Activating Convex at the same time would make it harder to attribute regressions and harder to maintain rollback clarity.

## Phase-Two Prerequisites

- Stable App Router pages for all primary product routes
- Typed relay contracts in regular use across the frontend
- Clear room/message/presence schema inventory from the current SQLite implementation
- Explicit rollout and rollback steps for each migrated domain
