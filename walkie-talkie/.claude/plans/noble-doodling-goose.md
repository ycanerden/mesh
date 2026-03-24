# Plan: Speedrun gstack — Full Sprint Cycle

## Context
Master gstack by speedrunning a full sprint cycle in a fresh project. Install, plan, build, review, QA, and ship — all in one go.

---

## Step 1: Setup (~5 min)

1. Create fresh folder, init git:
   ```bash
   mkdir ~/gstack-playground && cd ~/gstack-playground && git init
   ```

2. Install Bun (if not installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. Clone & setup gstack:
   ```bash
   git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
   cd ~/.claude/skills/gstack && ./setup
   ```

4. Vendor into project + create CLAUDE.md listing skills

---

## Step 2: Sprint Cycle — Build a Simple App

Pick something small (e.g., a todo app or landing page) and blast through the full cycle:

1. **`/office-hours`** — Frame the idea (2 min)
2. **`/plan-ceo-review`** — Quick scope check (2 min)
3. **`/plan-eng-review`** — Architecture lock (3 min)
4. **Build** — Scaffold and implement (10-15 min)
5. **`/review`** — Code review + auto-fixes (3 min)
6. **`/qa`** — Real browser testing (5 min)
7. **`/ship`** — Open PR (2 min)
8. **`/retro`** — Retrospective (2 min)

Total: ~30-40 minutes for a full cycle.

---

## Step 3: Explore Remaining Skills

After the sprint, try the skills we skipped:
- `/careful`, `/freeze`, `/guard` — Safety tools
- `/browse` — Manual browser navigation
- `/investigate` — Debugging workflow
- `/benchmark` — Performance testing
- `/design-consultation` — Full design system generation
- `/canary` — Post-deploy monitoring

---

## Verification
- gstack setup completes without errors
- Each skill in the sprint cycle runs and produces output
- `/ship` successfully creates a PR (or at least stages one)
