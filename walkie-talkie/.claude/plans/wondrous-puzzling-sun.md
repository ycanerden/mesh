# Habitat Evening Framework — Rebuild Plan

## Context
Rebuild the Habitat Evening Framework (sprint dashboard for founder events) with a cleaner UI, better structure, and Supabase for data persistence. The current app is a Vite+React app at `/Users/canerden/habitatv5/` — we'll port it to Next.js App Router with shadcn/ui and Supabase, keeping the proven patterns (team auth, realtime timer, task definitions) while cleaning up the architecture.

---

## Supabase Schema

### Tables

**`teams`** — Team accounts with hashed passwords and member names as text array
```sql
CREATE TABLE public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  member_names text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**`task_progress`** — Individual task responses and completion status
```sql
CREATE TYPE public.sprint_phase AS ENUM ('phase_1', 'phase_2', 'phase_3', 'phase_4');

CREATE TABLE public.task_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  phase sprint_phase NOT NULL,
  task_key text NOT NULL,
  content text,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id, task_key)
);
```

**`sprint_timer`** — Singleton row for global timer state
```sql
CREATE TABLE public.sprint_timer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'stopped' CHECK (status IN ('stopped', 'running', 'paused')),
  duration_seconds integer NOT NULL DEFAULT 14400,
  started_at timestamptz,
  paused_at timestamptz,
  elapsed_before_pause integer NOT NULL DEFAULT 0,
  display_phase text NOT NULL DEFAULT 'waiting',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.sprint_timer (id) VALUES ('00000000-0000-0000-0000-000000000001');
```

RLS: Permissive policies (anon access). Security at application layer. Realtime enabled on all 3 tables.

### Data Persistence
All team inputs are saved to Supabase and persist permanently. Teams can log back in after the event to:
- Review all their Phase 1-4 responses
- Access their generated MVP prompt
- See their outreach plan and contact list
- Continue working on Phase 4 (optional) tasks at their own pace

The dashboard works both during live events (with timer) and after (timer shows completed/no active session).

### Review/Summary Page (`/dashboard/summary`)
A clean, read-only summary of all team inputs across all 4 phases:
- Nicely formatted card layout with phase sections
- Shows all completed responses in a shareable report format
- Team name and event date at the top
- Can be shared as a link or exported/printed (print-friendly CSS)
- Accessible from dashboard via "View Summary" button (appears when tasks are completed)

---

## Project Structure

```
app/
├── layout.tsx                    # Root layout, fonts, TeamAuthProvider
├── page.tsx                      # Redirect to /login
├── globals.css                   # Tailwind + custom brutal styles
├── login/page.tsx                # Team login
├── signup/page.tsx               # Team creation (name, password, 1-5 members)
├── dashboard/page.tsx            # Sprint dashboard (team view)
├── dashboard/summary/page.tsx    # Read-only summary/report of all inputs
├── admin/page.tsx                # Admin dashboard
├── admin/login/page.tsx          # Admin login (simple password)
├── api/generate/route.ts         # AI prompt generation (Claude API)
components/
├── ui/                           # shadcn/ui primitives
├── sprint/
│   ├── sprint-timer.tsx          # Realtime countdown display
│   ├── phase-progress.tsx        # Phase 1-4 indicator
│   ├── phase-checklist.tsx       # Collapsible phase with tasks
│   ├── task-input-item.tsx       # Textarea/URL/checkbox task
│   └── ai-generated-task.tsx     # Phase 2 AI prompt generator
├── admin/
│   ├── timer-controls.tsx        # Start/pause/reset/duration
│   ├── stats-cards.tsx           # Aggregate stats
│   └── team-progress-card.tsx    # Per-team progress view
├── auth/
│   ├── team-member-inputs.tsx    # Dynamic 1-5 member name fields
│   └── protected-route.tsx       # Auth guard wrapper
hooks/
├── use-team-auth.ts              # Team session + CRUD
├── use-sprint-data.ts            # Task progress + realtime
├── use-sprint-timer.ts           # Timer state + realtime
├── use-admin-data.ts             # All teams data for admin
├── use-ai-generation.ts          # AI generation with cooldown
contexts/
└── team-auth-context.tsx         # React context for team auth
data/
└── sprint-tasks.ts               # Phase/task definitions
lib/
├── supabase/client.ts            # Browser client singleton
├── supabase/types.ts             # Generated DB types
├── utils.ts                      # cn(), formatTime()
└── constants.ts                  # Timer UUID, config
```

---

## Key Implementation Details

### Auth
- Team-based (not individual users) — team name as username, shared password
- Password hashed client-side with SHA-256 via `crypto.subtle.digest`
- Session in `sessionStorage` (clears on browser close — good for events)
- Admin auth: simple password check against `ADMIN_PASSWORD` env var

### Realtime
- **Timer**: All clients subscribe to singleton `sprint_timer` row. Client-side 1s interval when running.
- **Tasks**: Team dashboard subscribes to own `task_progress` rows. Optimistic updates on save.
- **Admin**: Subscribes to all `task_progress` and `teams` rows. Re-fetches on changes.

### AI (Phase 2 MVP Prompt)
- Next.js API route `/api/generate` with `@anthropic-ai/sdk`
- Takes Phase 1 inputs, generates an MVP prompt for tools like Lovable
- 10-second client-side cooldown between requests
- Locked until Phase 1 tasks are complete

### UI Style
- Clean monochromatic black & white with purple accents
- Neo-brutalist card styling (thick borders, box shadows) matching current brand
- shadcn/ui components as base

---

## Source Files to Port From

| New file | Port from (habitatv5) |
|---|---|
| `data/sprint-tasks.ts` | `src/data/sprintTasks.ts` |
| `contexts/team-auth-context.tsx` | `src/contexts/TeamAuthContext.tsx` |
| `hooks/use-sprint-timer.ts` | `src/hooks/useSprintTimer.ts` |
| `hooks/use-sprint-data.ts` | `src/hooks/useSprintData.ts` |
| `api/generate/route.ts` | `supabase/functions/generate-startup-content/index.ts` |

---

## Implementation Order

1. **Project setup** — `create-next-app`, install deps, shadcn/ui init, env vars, Supabase client
2. **Database** — Run migration SQL in Supabase, generate types
3. **Data layer** — Port task definitions, auth context, hooks from habitatv5
4. **Auth pages** — Login, signup, protected route wrapper
5. **Sprint dashboard** — Timer, phase progress, task inputs, phase checklists
6. **Admin dashboard** — Timer controls, stats, team progress cards
7. **AI integration** — Claude API route, generation hook, AI task component
8. **Polish** — Responsive design, error handling, deploy to Vercel

---

## Next Step: Configure & Connect

The app code is fully built. Remaining steps:
1. Write `.env.local` with the provided Supabase + Anthropic + Admin credentials
2. Run the SQL migration (`supabase/migrations/001_initial_schema.sql`) against Supabase
3. Verify the app works end-to-end

## Verification
- Create a team, log in, fill Phase 1 tasks → data persists in Supabase
- Open admin, start timer → timer syncs in real-time on team dashboard
- Complete Phase 1 → AI prompt generation unlocks and works
- Open 2 browser tabs → changes sync in real-time
- Admin sees all teams and their progress updating live
