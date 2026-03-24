# HABITAT Sprint

A sprint and hackathon management platform that guides startup teams through a structured 4-phase process to go from idea to MVP in a single session.

## Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL in `supabase/schema.sql` in the SQL Editor
   - Copy your project URL and anon key to `.env.local`

4. **Run the dev server**
```bash
npm run dev
```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Features

- 🚀 **4-Phase Sprint Framework**
  - Phase 1: Idea & Business Model (60 min)
  - Phase 2: Build Prototype & Customer Discovery (90 min)
  - Phase 3: Demo & Pitch (20 min)
  - Phase 4: Extra Mile (Optional)

- 🤖 **AI Content Generation**
  - MVP Scope Generator
  - Lovable Prompt Generator
  - Target Customer Profile
  - Outreach Messages

- 👥 **Team Collaboration**
  - Simple team auth (name + password)
  - Real-time task progress
  - Global sprint timer

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API (GPT-4o-mini)
- **Language**: TypeScript

## Project Structure

```
src/
├── app/
│   ├── api/generate/      # AI content generation
│   ├── dashboard/         # Main sprint workspace
│   ├── login/             # Team login
│   ├── signup/            # Team registration
│   └── layout.tsx         # Root layout with providers
├── components/ui/         # shadcn/ui components
├── contexts/              # React contexts (TeamAuth)
├── data/                  # Sprint phases & tasks
├── lib/supabase/          # Supabase client
└── types/                 # TypeScript types
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `OPENAI_API_KEY` | OpenAI API key (optional, has mock fallback) |

## License

MIT - Built with ❤️ for [Habitat](https://joinhabitat.eu)
