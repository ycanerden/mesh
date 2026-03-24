# Migrate habitatv5 off Lovable → Fresh Supabase + Direct Gemini

## Context
Habitat's sprint framework currently depends on Lovable for: (1) a dev-only component tagger plugin, and (2) the AI gateway that proxies Gemini API calls. The goal is to remove all Lovable dependencies, set up a fresh Supabase project, swap the AI edge function to call Google Gemini directly, and update the env to point at the new project.

---

## Part A: Remove Lovable from code (3 edits)

### A1. `vite.config.ts` — remove lovable-tagger
- Delete `import { componentTagger } from "lovable-tagger"`
- Change plugins to just `plugins: [react()]`

### A2. `package.json` — remove lovable-tagger dep
- Delete `"lovable-tagger"` from `devDependencies`

### A3. `supabase/functions/generate-startup-content/index.ts` — swap to direct Gemini
- Endpoint: `https://ai.gateway.lovable.dev/...` → `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- Env var: `LOVABLE_API_KEY` → `GEMINI_API_KEY`
- Model: `google/gemini-3-flash-preview` → `gemini-2.0-flash`
- (Google's OpenAI-compatible endpoint uses same request/response format — no other changes needed)

---

## Part B: Fresh Supabase setup (guided, step by step)

### B1. User creates new Supabase project
- https://supabase.com/dashboard → New Project
- Pick org, name, region, DB password → Create

### B2. Update `.env` with new credentials
- From Project Settings → API: copy Project URL, anon key, project ref
- Update `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`

### B3. Update `supabase/config.toml`
- Replace `project_id` with new project ref

### B4. Run consolidated migration SQL
- Merge all 13 existing migrations into one clean `supabase/migrations/00000000000000_full_schema.sql`
- Delete the 13 old migration files
- User pastes the SQL into Supabase Dashboard → SQL Editor → Run
- Includes: enums, functions, tables, constraints, indexes, triggers, RLS policies, realtime, storage bucket, seed data (singleton timer row)

### B5. Deploy edge function
```
supabase link --project-ref <new-ref>
supabase secrets set GEMINI_API_KEY=<your-google-ai-key>
supabase functions deploy generate-startup-content
```

### B6. Create admin user
- First user to sign up gets admin role automatically (via `assign_first_admin` trigger)

---

## Part C: Clean up old migration files
- Remove all 13 individual migration files from `supabase/migrations/`
- Single consolidated file replaces them

---

## Files Modified
- `vite.config.ts` — remove lovable-tagger plugin
- `package.json` — remove lovable-tagger from devDependencies
- `supabase/functions/generate-startup-content/index.ts` — Gemini direct API
- `.env` — placeholder values for new Supabase project
- `supabase/config.toml` — placeholder project_id
- `supabase/migrations/00000000000000_full_schema.sql` — NEW consolidated migration
- `supabase/migrations/2026*` — DELETE all 13 old files

## Verification
1. `npm run build` succeeds (no lovable-tagger errors)
2. After Supabase setup + migration: `npm run dev` → app loads, timer works
3. Sign up → automatically get admin role
4. Create team → shows in admin dashboard
5. AI generate → calls Gemini directly (after edge function deploy)
