# Greg CRM — Evolution Plan

## Context

Greg is an existing Next.js CRM (~2,000 LOC) that stores contacts as markdown files with a Claude AI agent. Habitat's team needs it to evolve into a sleek, open-source, AI-native CRM for tracking VCs, event organizers, and B2B leads. The current markdown-based approach doesn't scale for relationships, pipelines, and multi-user collaboration. We're transforming it into a Folk CRM-caliber product backed by PostgreSQL, designed for self-hosting and open-source distribution.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (keep) | Already invested, App Router |
| Database | PostgreSQL 17 | User choice, relational power |
| ORM | **Drizzle ORM** | Zero runtime, TS-native, lightweight Docker images |
| Auth | **Auth.js v5** | Native Next.js, open-source, Google OAuth built-in |
| UI | **shadcn/ui** | Radix primitives + Tailwind, copy-paste model |
| Server state | **TanStack Query v5** | Replace 3s polling with cache invalidation |
| Tables | **TanStack Table v8** | Sort, filter, inline edit, reusable |
| Drag & drop | **@dnd-kit/core** | Accessible, tree-shakeable |
| Toasts | **Sonner** | Works with shadcn, tiny |
| License | **AGPL-3.0** | Protects open-source, allows self-hosting |

---

## Phase 1: Foundation — DB + Auth + New API Layer

### 1.1 Install dependencies
```
drizzle-orm pg @auth/drizzle-adapter next-auth@5
@tanstack/react-query @tanstack/react-table
```

### 1.2 PostgreSQL schema (`lib/db/schema.ts`)

**Core tables:**
- `users` — id, email, name, avatar_url, timestamps
- `workspaces` — id, name, slug, owner_id, settings (JSONB), timestamps
- `workspace_members` — workspace_id, user_id, role (owner/admin/member)
- `companies` — id, workspace_id, name, domain, industry, size, linkedin_url, website, description, custom_fields (JSONB)
- `contacts` — id, workspace_id, company_id (FK), name, email, phone, title, avatar_url, linkedin_url, twitter_handle, source, last_contacted_at, next_action, next_action_date, notes, custom_fields (JSONB), created_by
- `tags` + `contact_tags` — flexible tagging with colors
- `interactions` — id, workspace_id, contact_id, user_id, type (note/email_sent/email_received/call/meeting/stage_change/ai_action), title, body, metadata (JSONB), occurred_at
- `pipelines` — id, workspace_id, name, description, is_default
- `pipeline_stages` — id, pipeline_id, name, color, position
- `pipeline_contacts` — pipeline_id, stage_id, contact_id, position, entered_stage_at, metadata (JSONB)
- `custom_field_definitions` — workspace_id, entity_type, name, field_type, options (JSONB), position

### 1.3 Auth.js v5 setup
- Google OAuth provider (reuse for Gmail/Calendar later)
- Email magic links
- JWT sessions
- Auth middleware protecting `(app)` routes

### 1.4 Rewrite API routes with Drizzle
- `app/api/contacts/route.ts` — GET (list with workspace scope), POST
- `app/api/contacts/[id]/route.ts` — GET, PUT, DELETE
- `app/api/companies/route.ts` + `[id]/route.ts`
- `app/api/pipelines/route.ts` + `[id]/route.ts` + `[id]/contacts/route.ts`
- `app/api/interactions/route.ts`
- `app/api/tags/route.ts`
- `app/api/agent/route.ts` — upgrade with DB context

### 1.5 TanStack Query hooks (`lib/hooks/`)
- `use-contacts.ts`, `use-companies.ts`, `use-pipelines.ts`, `use-interactions.ts`, `use-tags.ts`

### 1.6 Migration script (`scripts/migrate-markdown.ts`)
- Parse all `.md` files from `~/greg-contacts/`
- Create default workspace, auto-create companies by grouping contacts
- Parse Activity Log entries into `interactions` records
- `--dry-run` and `--verify` flags

**Files to modify:** `lib/types.ts` (expand), `package.json` (deps), `app/api/*` (rewrite all)
**Files to create:** `lib/db/schema.ts`, `lib/db/index.ts`, `lib/auth/index.ts`, `lib/queries/*.ts`, `lib/mutations/*.ts`, `lib/hooks/*.ts`, `scripts/migrate-markdown.ts`, `drizzle.config.ts`

---

## Phase 2: UI Overhaul — Folk CRM-Inspired Design

### 2.1 shadcn/ui setup
Install: button, input, dialog, sheet, command, table, tabs, badge, avatar, dropdown-menu, popover, select, textarea, tooltip, separator, card, sonner

### 2.2 Design tokens (CSS variables in `globals.css`)
- Warm neutrals: `--background: #fafaf8`, `--background-secondary: #f5f4f0`
- Minimal borders: `--border: #e8e6e1`
- Dark mode: inverted palette via `.dark` class
- `--radius: 0.75rem` for consistent rounding

### 2.3 Layout architecture
```
┌─────────────────────────────────────────────┐
│ Sidebar (280px)  │  Main Content            │
│                  │                           │
│ [Workspace]      │  [Tab: Contacts |        │
│ [Ask Greg ⌘K]    │   Companies | Pipelines | │
│                  │   Activity]              │
│ NAVIGATION       │                           │
│  Contacts        │  [DataTable / Kanban]    │
│  Companies       │                           │
│  Pipelines       │        [Sheet panel →]   │
│  Activity        │                           │
│                  │                           │
│ TAGS             │                           │
│ [User menu]      │                           │
└─────────────────────────────────────────────┘
```

### 2.4 New components
**Layout:** `app-shell.tsx`, `sidebar.tsx`, `workspace-selector.tsx`, `nav-item.tsx`, `user-menu.tsx`
**Shared:** `data-table.tsx` (TanStack Table wrapper), `data-table-toolbar.tsx`, `data-table-pagination.tsx`, `inline-edit.tsx`, `tag-badge.tsx`, `tag-input.tsx`, `empty-state.tsx`, `loading-skeleton.tsx`
**Contacts:** `contacts-table.tsx`, `contacts-table-columns.tsx`, `contact-sheet.tsx` (slide-over), `contact-form.tsx`, `contact-avatar.tsx`
**Companies:** `companies-table.tsx`, `company-sheet.tsx`, `company-form.tsx`
**Pipelines:** `pipeline-board.tsx`, `pipeline-column.tsx`, `pipeline-card.tsx` (using @dnd-kit)
**Activity:** `activity-timeline.tsx`, `activity-item.tsx`, `activity-filters.tsx`

### 2.5 Key UI patterns
- **Slide-over panels** (shadcn Sheet) — contact/company detail slides in from right, table visible behind
- **Inline editing** — click any table cell to edit in-place
- **Command palette** (shadcn Command / cmdk) — search + commands + AI
- **No page navigation for detail views** — everything is overlays/panels

### 2.6 App Router pages
```
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(app)/layout.tsx          — AppShell with sidebar
app/(app)/contacts/page.tsx
app/(app)/companies/page.tsx
app/(app)/pipelines/page.tsx
app/(app)/pipelines/[id]/page.tsx
app/(app)/activity/page.tsx
app/(app)/settings/page.tsx
app/(app)/settings/integrations/page.tsx
```

---

## Phase 3: AI Agent Upgrade

### 3.1 Enhanced command bar
Replace `CommandBar.tsx` with shadcn `Command` component:
- **Search mode** (default) — fuzzy-find contacts, companies, stages
- **Command mode** (type `/`) — `/add`, `/log`, `/email`, `/move`
- **AI mode** (natural language) — falls through to Claude

### 3.2 Context-aware AI
- Pass currently viewed contact/company/pipeline as context
- Expanded action types: `create_contact`, `update_contact`, `log_interaction`, `draft_email`, `move_pipeline_stage`, `add_tag`, `remove_tag`, `bulk_update`
- Enhanced system prompt understanding full data model

### 3.3 AI features
- Relationship summaries ("summarize my history with [contact]")
- Pipeline status queries ("how's fundraising going?")
- Stale contact alerts ("who haven't I talked to in 30+ days?")
- Meeting prep briefs
- Inline action preview + batch approve/reject + undo via Sonner toast

**Files to modify:** `app/api/agent/route.ts`, `lib/ai/agent.ts` (extract), `lib/ai/prompts.ts` (new)
**Files to create:** `components/ai/command-bar.tsx`, `components/ai/action-review.tsx`, `components/ai/ai-chat-message.tsx`

---

## Phase 4: Integrations — Gmail, Calendar, Notion

### 4.1 Gmail
- Use Google OAuth token from Auth.js
- `app/api/integrations/gmail/route.ts` — fetch emails by contact email, auto-create `email_sent`/`email_received` interactions
- On-demand fetch when viewing a contact

### 4.2 Google Calendar
- Same OAuth token
- `app/api/integrations/calendar/route.ts` — list events with matching attendees, auto-create `meeting` interactions
- Create calendar events from CRM

### 4.3 Notion sync
- Upgrade existing import to bidirectional sync
- Store `notion_page_id` in contact `custom_fields`
- Settings UI for mapping Notion DB properties to Greg fields

### 4.4 Settings UI
- `app/(app)/settings/integrations/page.tsx` — connect/disconnect, sync status, configuration

---

## Phase 5: Open-Source Prep

### 5.1 Docker
- `docker-compose.yml` — Postgres 17 + Greg (Next.js standalone)
- `Dockerfile` — multi-stage build, ~150MB image
- `entrypoint.sh` — run Drizzle migrations on startup, then `node server.js`
- `next.config.ts` — add `output: 'standalone'`

### 5.2 Configuration
- `.env.example` with all variables documented
- Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`
- Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### 5.3 Documentation
- `README.md` — screenshots, quick-start, architecture
- `docs/SELF-HOSTING.md`, `docs/CONTRIBUTING.md`, `docs/API.md`
- GitHub issue/PR templates, CI with GitHub Actions

---

## Folder Structure

```
greg/
├── app/
│   ├── (auth)/login, signup
│   ├── (app)/contacts, companies, pipelines, activity, settings
│   ├── api/auth, contacts, companies, pipelines, interactions, tags, agent, integrations
│   ├── layout.tsx, page.tsx, globals.css
├── components/
│   ├── ui/           (shadcn — ~20 files)
│   ├── layout/       (app-shell, sidebar, workspace-selector, nav-item, user-menu)
│   ├── contacts/     (table, columns, sheet, form, avatar, card)
│   ├── companies/    (table, columns, sheet, form)
│   ├── pipelines/    (board, column, card, header)
│   ├── activity/     (timeline, item, filters)
│   ├── ai/           (command-bar, action-review, chat-message)
│   └── shared/       (data-table, tag-badge, inline-edit, empty-state, etc.)
├── lib/
│   ├── db/           (schema.ts, index.ts)
│   ├── auth/         (index.ts, providers.ts)
│   ├── queries/      (contacts.ts, companies.ts, pipelines.ts, etc.)
│   ├── mutations/    (contacts.ts, companies.ts, etc.)
│   ├── hooks/        (use-contacts.ts, use-companies.ts, etc.)
│   ├── ai/           (agent.ts, prompts.ts, actions.ts)
│   ├── utils/        (cn.ts, dates.ts, avatars.ts)
│   └── types/        (index.ts, api.ts)
├── drizzle/          (config, migrations/)
├── scripts/          (migrate-markdown.ts, seed.ts)
├── docker/           (Dockerfile, docker-compose.yml, entrypoint.sh)
├── docs/             (SELF-HOSTING.md, CONTRIBUTING.md, API.md)
└── .env.example, LICENSE (AGPL-3.0), README.md
```

---

## Verification

1. **Phase 1:** Run `scripts/migrate-markdown.ts --dry-run` → verify all contacts parsed. Run migration → query DB → confirm data integrity. Hit API routes → CRUD works.
2. **Phase 2:** `npm run dev` → navigate all pages, test inline edit, slide-over panels, dark mode toggle, Cmd+K opens command palette.
3. **Phase 3:** Open Cmd+K → search contacts, type `/add`, ask natural language question → verify actions proposed and executable.
4. **Phase 4:** Connect Google account → view contact → see email history. Check calendar → meetings appear as interactions.
5. **Phase 5:** `docker compose up` → fresh instance works. Run through full workflow as new user.

---

## Implementation Order

We start with **Phase 1** (foundation) since everything else depends on it. Then **Phase 2** (UI) as the top priority per user request. Phases 3-5 follow sequentially. Each phase is independently shippable — the app works after each phase.
