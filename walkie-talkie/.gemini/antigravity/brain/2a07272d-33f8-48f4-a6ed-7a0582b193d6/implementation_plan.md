# Habitat Framework Migration Plan

Based on the [Habitat Lovable repo](https://github.com/robbeseg/habitatv5) and Garry Tan's founder skills (`mvp-scope`, `landing-page`), here is the plan to rebuild Habitat into a highly scalable, premium web application.

## Goal Description
Rebuild the Habitat framework into the `/Users/canerden/habitat-website/antigravity-habitat-framework-test2` directory (as requested). We will migrate from a Vite SPA to Next.js (App Router), replace local/mock contexts with actual Supabase Auth & Database, and revamp the UI to a premium aesthetic using modern Tailwind/Tailwind-animate features.

## Proposed Changes

### 1. Foundation
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion (for premium micro-animations)
- **Backend & Auth**: Supabase (PostgreSQL + Supabase Auth)

#### [NEW] `antigravity-habitat-framework-test2/` (Project Root)
- Initialize Next.js: `npx -y create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- Install Supabase SSR + Client: `@supabase/supabase-js`, `@supabase/ssr`
- Setup custom colors and premium gradients in `tailwind.config.ts` and `globals.css`

### 2. Core Routing & Pages
We will recreate the Lovable routes using Next.js App Router for better SEO and structural scalability.

#### [NEW] `src/app/(marketing)/page.tsx`
- The modern Landing Page (based on `landing-page/SKILL.md`). Clear value prop, waitlist/email capture or primary signup CTA leading to `/signup`.

#### [NEW] `src/app/(auth)/login/page.tsx` & `src/app/(auth)/signup/page.tsx`
- **Team Authentication**. Integrated directly with Supabase email/password or OAuth.

#### [NEW] `src/app/(dashboard)/layout.tsx`
- Protected layout utilizing Supabase Server-Side validation to ensure users have a session before viewing dashboard routes.

#### [NEW] `src/app/(dashboard)/dashboard/page.tsx`
- Main Dashboard view, displaying user stats and active track info.

#### [NEW] `src/app/(dashboard)/track-selection/page.tsx`
- Onboarding step to select a track if they haven't yet, saving to `public.teams` table in Supabase.

#### [NEW] `src/app/(dashboard)/leads/page.tsx`
- Leads view for teams.

#### [NEW] `src/app/(admin)/admin/page.tsx`
- Admin protective dashboard mirroring the `Admin.tsx` logic.

### 3. State & Backend Integration
- Move away from React Context-based mock-auth (`TeamAuthContext`, `AdminAuthContext`).
- Rely strictly on robust Supabase sessions + Middleware (`src/middleware.ts`) to redirect unauthenticated users back to `/login`.
- Manage query state via React Server Components (where applicable) and data mutation via Next.js Server Actions.

## Verification Plan

### Automated Tests
Since we are building from scratch, we will temporarily rely on Next.js build verification:
- `npm run build` will verify Type Safety and structural integrity.
- In `v1.1`, we will setup Playwright for E2E authentication flows.

### Manual Verification
1. Run `npm run dev`.
2. Open `http://localhost:3000` via the Browser subagent/manually.
3. Validate Landing Page styling (Premium, Framer Motion aesthetics).
4. Perform the User Signup Flow: Attempt varying Edge Cases, verify data reflects in the Supabase Dashboard.
5. Verify middleware protects `/dashboard` when logged out.

## User Review Required
> [!IMPORTANT]
> - Do you already have a Supabase Project created for this? If yes, I will need you to provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as `.env.local` files when we begin implementation.
> - Please confirm the Next.js `create-next-app` configurations look good to you before I proceed!
