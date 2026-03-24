---
name: Habitat project overview
description: What Habitat is — founder acceleration ecosystem for Belgium/Europe with in-person events, hackathons, residency, and AI tools
type: project
---

Habitat is a founder acceleration ecosystem built around the philosophy "Europe's builder sprint — No equity. No fluff. Just ship." Canerden is the founder/builder.

**Why:** Help founders move from zero to shipped product in compressed timeframes. No equity taken, funded by sponsors seeking deal flow.

**How to apply:** Always frame suggestions in context of Habitat's core values: no equity, meritocratic, action over advice, "Founder as Director" AI philosophy.

## Three Core Programs

1. **Habitat Evenings** — 5-hour sprint events across Belgium. Founders come with ideas, leave with working prototypes. 300+ builders waitlist, sells out in 48h, 100+ prototypes launched.
2. **Technical Hackathons** — Deep-dive building events for technical founders, feed into residency.
3. **Habitat Residency** — 7-day live-in intensive for post-MVP founders, cohorts of 5, Demo Day with investors. Launching 2026.

## Supporting Products (all built by Canerden)

- **Habitat Skills** — 26+ AI skills (markdown files with YAML frontmatter) for Claude Code covering marketing, CRO, SEO, growth, strategy. Firecrawl integration for autonomous competitor research. Simple Mode for non-technical founders. Public: `ycanerden/habitat-skills`. Near-production ready (demo scheduled).
- **Habitat Cofounder AI** — Next.js chat interface using Claude API, acts as strategic co-founder. v0.1.0, less mature.
- **Habitat Skills Web** — Next.js landing page for Skills product.
- **Habitat Residency Web** — Next.js landing page for residency program.
- **Habitat Website** — Main brand site (static HTML), covers all programs.
- **habitatv5** — Vite + React + Supabase app, appears to be sprint tracking/coordination for events.

## Tech Stack
- Next.js 15-16, React 19, TypeScript, Tailwind CSS 4
- Radix UI, Shadcn-ui, Framer Motion, Lucide
- Claude API (@anthropic-ai/sdk), Firecrawl, Supabase, Vercel
- Vite (habitatv5), Playwright testing

## Key Directories
- `/Users/canerden/habitat-skills/` — AI skills framework
- `/Users/canerden/habitatv5/` — Event app
- `/Users/canerden/habitat-cofounder-ai/` — Chat interface
- `/Users/canerden/habitat-skills-web/` — Skills landing page
- `/Users/canerden/habitat-residency-web/` — Residency landing page
- `/Users/canerden/habitat-website/` — Main brand site
- `/Users/canerden/habitat-participants/` — Participant showcase

## State as of March 2026
- Habitat Skills: demo-ready, 26 skills, Friday demo scheduled
- habitatv5: functional but less documented
- Residency: launching 2026
- Open questions: pricing model (currently free/open-source), expansion beyond Belgium, skill discovery for non-technical users
