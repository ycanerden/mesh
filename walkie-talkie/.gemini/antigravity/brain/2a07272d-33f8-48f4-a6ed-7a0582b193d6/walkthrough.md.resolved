# Habitat Network Rewrite — Walkthrough

The Habitat MVP code has been entirely successfully ported from a Vite SPA into a highly scalable **Next.js 14 App Router** application with server side rendering and full **Supabase API Integration**.

## 1. Foundation & Aesthetic System
The project is scaffolded in `/Users/canerden/habitat-website/antigravity-habitat-framework-test2`.
We mapped the specific colors and typography directly from your `habitat-website` static build:
- **Typography:** Configured `Outfit` and `Space Mono` via `next/font/google` for optimal web rendering without layout shift.
- **Color System:** Integrated `--color-habitat-accent`, `--color-habitat-bg`, `--color-habitat-coral` etc. into `globals.css` using the latest Tailwind v4 syntax.

## 2. Core Routing & Logic
The layout is split into two logical zones:
- **Marketing Zone:** `src/app/page.tsx` now contains a rebuilt, premium Landing Page utilizing Framer Motion for scroll animations, mimicking the design language of your updated frontend.
- **Auth Zone (`(auth)`):** Protected login and signup forms routing via Next.js Action endpoints (`actions.ts`).
- **Dashboard Zone (`(dashboard)`):** Protected with Server-Side redirection via Supabase's `middleware.ts`. Includes standard layout wrapping the Dashboard, Leads dashboard (`leads/page.tsx`), and the Track Selection (`track-selection/page.tsx`).

## 3. Server Actions & Supabase Auth
The system replaces arbitrary React Context overrides with real Server Session checking. Users trying to visit `/dashboard` when not authenticated are natively bounced back to `/login`.

```typescript
// src/app/(auth)/actions.ts
export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const { error } = await supabase.auth.signInWithPassword(data)
  // ... redirects safely to /dashboard
}
```

## Next Steps
In order to fully test the authentication system:
1. Ensure you have created a Supabase instance for Habitat.
2. Edit `/Users/canerden/habitat-website/antigravity-habitat-framework-test2/.env.local`.
3. Provide your real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `npm run dev` and start interacting via the browser!
