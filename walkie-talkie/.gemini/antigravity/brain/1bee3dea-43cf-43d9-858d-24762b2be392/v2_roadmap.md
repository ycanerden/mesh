# Meeting Notes App V2 - Roadmap

## 🎯 Objective
Upgrade the MVP to a production-grade application featuring generic scheduling (Calendly alternative), Google Calendar deep integration, and a premium UI using Shadcn/UI.

## 🛠 Tech Stack Migration
- **Framework**: Next.js 14 (App Router) - *Required for Shadcn UI*
- **UI Library**: Shadcn/UI + Tailwind CSS - *For that premium "Vibe"*
- **Database**: Supabase (Postgres) - *To store user schedules and bookings*
- **Auth**: NextAuth.js / Supabase Auth - *For Google Calendar connection*
- **AI**: Groq API (Whisper + Llama 3) - *Retain our fast/cheap AI stack*

## 🚀 Key Features

### 1. UI/UX Overhaul (Shadcn/UI)
- **Dashboard**: Split view with "Upcoming Meetings" (from GCal) and "Recent Notes".
- **Shell**: Collapsible sidebar, command palette (`Cmd+K`) for quick navigation.
- **Theme**: consistent Dark/Light mode support.

### 2. Google Calendar Integration
- **OAuth Flow**: "Sign in with Google" to read calendar events.
- **Smart Context**: When you click a meeting, auto-pull the *attendees* and *description* into the notes context for the AI.
- **Auto-Title**: Notes are automatically named after the calendar event.

### 3. "Free Calendly Alternative"
- **Public Booking Page**: `app.domain.com/user/15min`
- **Availability**: Set your working hours.
- **Two-Way Sync**: Booked slots appear on your GCal; GCal busy times block bookings.

### 4. Improved User Journey
1.  **Onboarding**: Connect Calendar -> Set Availability.
2.  **Pre-Meeting**: Dashboard shows "Next: Strategy Sync in 5m". Click "Take Notes".
3.  **In-Meeting**: Recording starts. Draft notes.
4.  **Post-Meeting**: One-click "Enhance". AI emails the summary to attendees (optional).

## 📝 Implementation Phases

### Phase 1: Foundation (Next.js + Shadcn)
- [ ] Initialize Next.js project
- [ ] Install Shadcn/UI & Tailwind
- [ ] Port existing Recording/Transcribe logic to React hooks

### Phase 2: Calendar & Auth
- [ ] Set up Supabase
- [ ] Implement Google Login
- [ ] Fetch and display Google Calendar events

### Phase 3: Scheduling System
- [ ] Create Availability settings UI
- [ ] Build public booking page
- [ ] Handle booking logic (database insert + email invite)

### Phase 4: Polish
- [ ] Global search
- [ ] Keyboard shortcuts
- [ ] Mobile responsiveness
