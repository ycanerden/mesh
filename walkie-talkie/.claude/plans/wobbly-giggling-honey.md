# Personal Website: About Page + Navbar + Homepage Simplification

## Context
Homepage currently shows everything (bio, current bets, experience, philosophy, writing, socials). The goal is to strip the homepage to the essentials — 1-sentence bio, philosophy, writing — and move the full CV (bets, experience, socials) to a new `/about` page. A small minimal navbar ties all pages together.

---

## What Gets Built

### 1. Navbar (`src/components/Navbar.tsx`)
- Client Component (`'use client'`) so `usePathname()` can highlight the active link
- Layout: `Can Erden` name on the left, `Home · About · Blog` text links on the right
- No background, no border — just a flat row aligned with the `max-w-2xl` content column
- Active link = `text-black font-medium`, inactive = `text-muted hover:text-black`
- Rendered once in `layout.tsx` above `{children}` → appears on every page automatically

### 2. Simplified Homepage (`src/app/page.tsx`)
Remove: Current Bets section, Experience section, Socials section (and their imports)
Keep: 1-sentence bio + h1, Philosophy section (with PixelPhilosophyIcon), Writing section (with PixelBlogIcon + 3 latest posts)
Change: `pt-24` → `pt-16` on `<main>` (navbar now takes up top space)

### 3. About Page (`src/app/about/page.tsx`)
New page with full CV content:
- Full bio (2 paragraphs, Vlerick mention)
- Current Bets section (PixelBetsIcon + project cards with PixelArrowIcon)
- Previous Experience section (PixelExperienceIcon + 3 jobs)
- Social links (Twitter, GitHub, LinkedIn, Mail)
- Footer

---

## File Changes

| Operation | File |
|---|---|
| Create | `src/components/Navbar.tsx` |
| Create | `src/app/about/page.tsx` |
| Modify | `src/app/layout.tsx` — import + render `<Navbar />` above `{children}` |
| Modify | `src/app/page.tsx` — strip to bio + philosophy + writing, pt-24 → pt-16 |
| Modify | `src/app/blog/page.tsx` — pt-24 → pt-16, remove top back-link |
| Modify | `src/app/blog/[slug]/page.tsx` — pt-24 → pt-16, remove top back-link |

`globals.css`, icon components, `posts.ts`, `next.config.ts` — no changes.

---

## Key Technical Detail

`usePathname()` requires `'use client'`. The Navbar is the only Client Component. Active link logic:
- `/` → active only when `pathname === '/'`
- `/about` → active when `pathname.startsWith('/about')`
- `/blog` → active when `pathname.startsWith('/blog')` (covers `/blog/[slug]` too)

Works fine with `output: 'export'` — hydrates in browser, no SSR issues.

---

## Verification
1. `npm run dev`
2. Home (`/`) — shows 1-sentence bio, Philosophy, Writing only. Navbar at top with "Home" highlighted.
3. About (`/about`) — shows full bio, Current Bets, Experience, socials. "About" link highlighted in nav.
4. Blog (`/blog`) — "Blog" link highlighted in nav.
5. Individual post — "Blog" link still highlighted in nav.
6. `npm run build` — clean static export, `out/about/index.html` exists.
