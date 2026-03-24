# Plan: Habitat Cofounder AI — Skills + Web App

## Context
Habitat already has 11 founder skills (ideation → validation → build → pitch → launch).
The next layer is GTM and sales — what happens *after* you launch. We're adding 4 new skills
and building a "Cofounder AI" chat interface (Next.js) so founders can use all skills via a browser.

---

## Part 1: 4 New Skills

Location: `/Users/canerden/.claude/skills/habitat/skills/`

### 1. `mom-test/SKILL.md`
Customer discovery conversation framework based on Rob Fitzpatrick's Mom Test:
- How to structure discovery calls (don't pitch, ask about their life)
- Question templates that don't bias answers
- How to identify weak/strong signals (compliments vs. commitments)
- Synthesizing findings into a decision (build / pivot / stop)
- Related: `idea-validation`, `customer-segments`

### 2. `gtm-strategy/SKILL.md`
Full go-to-market playbook:
- ICP definition worksheet (firmographics, psychographics, buying triggers, deal-breakers)
- GTM motion selection (product-led, sales-led, community-led, content-led)
- Channel scoring matrix (reach × fit × cost × speed)
- Messaging framework (problem → solution → proof → CTA per segment)
- 30/60/90 day plan output
- Related: `customer-segments`, `launch-plan`, `pricing-early`

### 3. `sales-outreach/SKILL.md`
Cold outreach playbook generating actual sequences:
- Persona-specific email templates (problem-led, result-led, referral-led)
- LinkedIn connection + DM sequences
- Personalization variables and research hooks
- A/B subject line variants
- Reply handling (positive / neutral / negative)
- Related: `first-users`, `follow-up-tracks`

### 4. `follow-up-tracks/SKILL.md`
Post-contact follow-up sequences:
- 3 tracks: Warm Lead (showed interest), Ghosted (no reply after 3+ days), Objection (raised concern)
- Each track: day 0 → day 3 → day 7 → day 14 messages
- Meeting booked → pre-call prep checklist
- Post-demo follow-up (same day + day 3)
- Related: `sales-outreach`, `demo-script`

### Also update:
- `habitat/AGENTS.md` — add 4 skills to registry
- `habitat/README.md` — add to Phase 4 table as "Phase 5: Sales & GTM"

---

## Part 2: Next.js Cofounder AI Web App

Location: `/Users/canerden/chatting app for habitat/.claude/worktrees/mystifying-pare/`
(replaces bare `index.html`)

### Stack
- Next.js 15 (App Router)
- Tailwind CSS v4
- Anthropic SDK (server-side only via API route)
- TypeScript

### File Structure
```
├── app/
│   ├── layout.tsx          # Inter font, Habitat colors
│   ├── page.tsx            # Chat UI page
│   └── api/chat/route.ts   # POST → Anthropic API (streams)
├── components/
│   ├── Chat.tsx            # Message list + input
│   ├── Message.tsx         # User / assistant bubble
│   └── SkillTag.tsx        # Shows active skill badge
├── lib/
│   ├── skills.ts           # Skills catalog (name, description, content)
│   └── system-prompt.ts    # Builds the cofounder system prompt
├── skills/                 # Copied SKILL.md content as .ts exports
│   ├── mom-test.ts
│   ├── gtm-strategy.ts
│   ├── sales-outreach.ts
│   ├── follow-up-tracks.ts
│   └── ... (all 15 skills)
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── .env.local.example      # ANTHROPIC_API_KEY=
```

### System Prompt Design
The API route builds a system prompt that:
1. Sets persona: "You are the Cofounder AI for Habitat — a startup advisor with deep expertise..."
2. Injects skill descriptions so Claude knows when to apply each framework
3. Loads the full SKILL.md content for skills mentioned in the conversation
4. Tells Claude to show which skill it's applying (for the SkillTag component)

### UI Design
Match Habitat aesthetic from index.html:
- Background: `#f5f2eb`, accent: `#3a6e00`, font: Inter
- Chat messages: white bubbles (user right, assistant left)
- Assistant messages render markdown
- SkillTag shows in assistant messages: `[using: mom-test]`
- Input: textarea with Cmd/Ctrl+Enter to send
- Streaming responses (show typing indicator)
- Mobile responsive

### API Route (`/api/chat/route.ts`)
- POST with `{ messages, activeSkills? }`
- Uses `@anthropic-ai/sdk` with streaming
- System prompt = cofounder persona + all skill descriptions
- Returns streamed text

### Environment
- `.env.local` with `ANTHROPIC_API_KEY`
- `.env.local.example` committed to repo

---

## Verification
1. `npm run dev` → app loads at localhost:3000
2. Type "I want to validate my idea" → Claude applies `idea-validation` framework
3. Type "Help me build a GTM strategy" → Claude applies `gtm-strategy`
4. Type "Write me follow-up emails for a ghosted lead" → `follow-up-tracks`
5. Mobile: resize to 375px, verify chat works
6. Check skills folder updated with 4 new SKILL.md files
