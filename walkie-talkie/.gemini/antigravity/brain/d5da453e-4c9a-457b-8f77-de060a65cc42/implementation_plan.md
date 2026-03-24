# HABITAT Sprint App Build Plan

## Quick Answers to Your Questions

### Can you use habitat-skills here without Claude Code?
**Yes, absolutely!** Habitat-skills are markdown files that give AI agents specialized knowledge. I'm an AI agent (Antigravity) just like Claude Code, so I can read and apply those skills directly. 

In fact, I just read `prototype-sprint` and `mvp-scope` and I'll use them to guide this build! 

### Comments on habitat-skills
Your skills are **solid and well-structured**:
- Clear phase organization (Ideation → Building → Demo → Launch)
- Practical frameworks (the 5-hour sprint structure is excellent)
- Right level of opinionation (tech stack recommendations, time estimates)

**One suggestion**: Add a skill for "real-time collaborative features" since that's a key pattern in the Sprint app.

---

## MVP Scope (Using Your habitat-skills Framework)

**Product**: HABITAT Sprint — Real-time sprint management for startup hackathons

**Core hypothesis**: Teams will complete more at hackathons when guided by structured phases with AI assistance.

### Must-Have (The MVP)

| Feature | Simplest Implementation | Estimate |
|---------|------------------------|----------|
| Team auth | Name + password (no email) stored in Supabase | S (2hr) |
| 4-phase checklist | Static task list with checkbox state | S (2hr) |
| Content inputs | Form fields that save to Supabase | S (1hr) |
| AI content generation | API route calling Gemini/OpenAI | M (3hr) |
| Sprint timer | Shared countdown with admin controls | M (3hr) |
| Admin dashboard | View all teams + manage timer | M (3hr) |
| Real-time sync | Supabase realtime subscriptions | M (2hr) |

**Total**: ~16 hours of focused building

### Explicitly NOT in MVP
- ❌ Email authentication — Name + password is fine for events
- ❌ Multi-event support — One active sprint for now
- ❌ Habitat Helper chatbot — Add after core works
- ❌ Customer segments feature — Phase 2 scope
- ❌ Competitive analysis scraping — Complex, not core

---

## Tech Stack (Light Mode)

```
Next.js 15 (App Router) + TypeScript
↓
Tailwind CSS + shadcn/ui (light theme)
↓
Supabase (auth, database, realtime)
↓
OpenAI/Google AI for content generation
↓
Vercel deployment
```

---

## Build Order

```
1. Project Setup & Deploy              [30 min]
   → Next.js + Supabase + Vercel

2. Database Schema                     [1 hr]
   → teams, task_progress, sprint_timer

3. Team Auth Flow                      [2 hr]
   → /signup, /login, context/session

4. Sprint Dashboard Core               [3 hr]
   → 4 phases, task checklist, content inputs

5. AI Content Generation               [3 hr]
   → Edge function + 3 generator types

6. Sprint Timer (Global)               [2 hr]
   → Countdown, realtime sync

7. Admin Dashboard                     [3 hr]
   → Timer controls, team monitoring

8. Polish & Light Mode Styling         [2 hr]
   → Clean UI, responsive design
```

---

## Design Direction (Light Mode)

| Element | Value |
|---------|-------|
| **Background** | `#FAFAFA` / `white` |
| **Primary accent** | Habitat blue `#3B82F6` |
| **Text** | `#1F2937` (gray-800) |
| **Cards** | White with subtle shadow |
| **Phase colors** | Blue → Green → Purple → Orange |
| **Font** | Inter (UI), JetBrains Mono (timer) |

---

## Verification Plan

1. **Team signup/login** works with persistence
2. **Tasks save** when checked/content entered
3. **AI generates** valid content
4. **Timer syncs** across multiple browser tabs
5. **Admin can control** timer and view all teams
6. **Mobile responsive** (375px+)

---

> [!TIP]
> Ready to start building! I'll create the project in `/Users/canerden/.gemini/antigravity/scratch/habitat-sprint`
