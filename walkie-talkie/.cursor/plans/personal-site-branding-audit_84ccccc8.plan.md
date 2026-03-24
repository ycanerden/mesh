---
name: personal-site-branding-audit
overview: Review and improve your personal site as a founder-facing hub that promotes Habitat and Habitat Skills, focusing on design, code quality, content, and SEO.
todos:
  - id: design-nav-cta
    content: Refine navigation and home/about layout to foreground Habitat and Habitat Skills for founders while preserving the minimal aesthetic.
    status: completed
  - id: content-positioning
    content: Tighten homepage and about-page copy plus blog framing so your story clearly ladders into Habitat and Habitat Skills.
    status: completed
  - id: seo-foundations
    content: Standardize metadata, headings, and internal links to support SEO for AI-native founders and community-focused content.
    status: completed
isProject: false
---

### Goals

- **Position you clearly** as a founder-facing operator whose primary leverage is Habitat + Habitat Skills.
- **Tighten the site as a funnel** from personal credibility → interest in Habitat/Skills → clicks through.
- **Ensure the codebase and SEO setup** are solid so you can safely grow content over time.

### 1) Design & UX Review

- **Overall layout**
  - Keep the current minimal, single-column layout in `src/app/page.tsx` and `src/app/about/page.tsx` but assess whether the hierarchy (bio → philosophy → writing) matches your goal of promoting Habitat/Skills.
  - Evaluate the use of white space, font sizes, and tracking to ensure scan-ability on desktop and mobile.
- **Navigation & IA**
  - Review the `Navbar` in `src/components/Navbar.tsx` to confirm that key CTAs (Habitat, Skills) are discoverable from every page, potentially as a distinct nav item or subtle badge.
  - Check that routes `/`, `/about`, `/blog`, and blog detail pages create a coherent journey from "who is Can" → "what is he building" → "how do I engage?".
- **Visual identity**
  - Use existing pixel icons (`src/components/icons/`*) and muted color palette from `src/app/globals.css` to reinforce a recognizable, slightly playful AI-native brand.
  - Consider a very small set of accent treatments (e.g., tags, chips, icons) to consistently highlight Habitat/Skills references.

### 2) Code Quality & Architecture

- **App router usage**
  - Confirm that the Next.js 16 app-router structure (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/blog/[slug]/page.tsx`) follows best practices: server components by default, client components only where needed (`Navbar` is correctly client-side due to `usePathname`).
- **Content system**
  - Keep the simple markdown blog pipeline in `src/lib/posts.ts` (FS + `gray-matter` + `remark`) as your primary content engine, since it’s easy to extend and works well for thought-leadership.
  - Double-check type safety on `PostMeta`/`Post` and error handling around missing frontmatter or invalid dates.
- **Performance & DX**
  - Verify that `next.config.ts` with `output: 'export'` and `reactCompiler: true` is compatible with your deployment target and static export strategy.
  - Look for opportunities to remove any unnecessary `use client` components and keep styling co-located and minimal via Tailwind v4 and `globals.css` utilities.

### 3) Content & Positioning

- **Home page narrative**
  - Rework the bio in `src/app/page.tsx` to explicitly tie your identity (growth & strategy operator) to Habitat/Skills as your current, sharpest bets.
  - Tighten the "Philosophy" copy to make the "Founder as Director" and community angles the through-line that leads naturally into Habitat.
- **About page as sales page**
  - Use `src/app/about/page.tsx` to act as a lightweight founder sales page: what you’re building, proof you can execute (Rapider AI, Koç, hackathons), and clear links to learn more about Habitat/Skills.
  - Ensure the "Current Bets" and "Previous" sections explicitly answer: why should an AI-native founder or ecosystem partner care?
- **Writing strategy**
  - Treat the existing essays in `content/posts/*.md` as the start of a content cluster around AI-native founding and communities; map 3–5 follow-up topics that ladder directly to Habitat’s value prop (e.g., how to run AI-native hackathons, playbooks for directors vs executors).

### 4) SEO & Technical Discoverability

- **Metadata & titles**
  - Standardize `metadata` across `src/app/layout.tsx`, `src/app/blog/page.tsx`, `src/app/about/page.tsx`, and `src/app/blog/[slug]/page.tsx` so titles and descriptions consistently mention your name plus your role and Habitat/Skills context.
  - Ensure each blog post frontmatter (`content/posts/*.md`) has clear, keyword-conscious `title`, `excerpt`, `slug`, and `date` fields; keep slugs human-readable and aligned with how founders might search.
- **On-page SEO**
  - Check heading structure within `prose-content` (H1 for page/post title, H2/H3 for sections) to keep a logical hierarchy for search engines.
  - Make sure internal links point from posts back to `/about` and to Habitat/Skills URLs where relevant, to distribute authority and create clear topical relationships.
- **Static export & sharing**
  - Validate that static export works cleanly with the FS-based blog and that canonical URLs are stable so you can safely share posts on X/LinkedIn.

### 5) Concrete Next Steps (Post-Plan)

- **Design/UX**: Decide where Habitat/Skills should appear in nav and hero sections and add a small but consistent CTA pattern.
- **Content**: Rewrite home/about hero copy to sharpen positioning, then outline 3–5 additional essays in the same style as your existing posts.
- **SEO**: Normalize metadata, add a few strategic internal links in existing posts pointing to your key pages, and prepare for future sitemap/robots if you deploy on a custom domain.

