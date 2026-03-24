# Calm Inbox - Architecture & Implementation Plan

## 1. System Architecture

### Components
1.  **Ingestion Service**: Handles incoming emails.
    *   *MVP approach*: An IMAP polling worker or an inbound webhook receiver (e.g., connected to Resend/SendGrid).
    *   *Responsibility*: Fetches raw emails, parses MIME types, extracts body/metadata, stores in DB.
2.  **Processing Pipeline (The "Calm" Engine)**:
    *   *Sanitizer*: Strips tracking pixels, ads (heuristic-based), and normalizes text.
    *   *Content Splitter*: Detects if an email is a digest of multiple links vs. a single long-read.
3.  **Intelligence Layer (AI)**:
    *   *Summarizer*: LLM (e.g., GPT-4o-mini / Claude Haiku / Gemnid Flash) to generating 3-5 bullet summaries.
    *   *Classifier*: Tags emails (Tech, News, Personal, Marketing).
    *   *Extractor*: Pulls out "Action Items" and "Events".
4.  **Database**:
    *   Stores `Users`, `Emails` (raw + processed), `Summaries`, `Digests`.
    *   *Tech*: SQLite for MVP (easy local run), Prisma ORM.
5.  **Digest Generator**:
    *   Runs daily (cron).
    *   Queries unread/processed summaries.
    *   Ranks by relevance (vector search or simple heuristic/user priorities).
    *   Generates a structured "Daily Calm" HTML page.
6.  **Web UI (Frontend)**:
    *   Single Page Application (Next.js).
    *   Views: "Today's Digest", "Archive", "Settings" (Topics, Frequency).

### Data Flow
`Email Server` -> `Ingestion (IMAP/Webhook)` -> `Raw Storage (DB)` -> `Processing (Cleaning)` -> `LLM (Summarization)` -> `Structured Storage` -> `Digest Generator` -> `Web UI / Email Delivery`

## 2. Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  settings  Settings? // Relation to settings
  digests   Digest[]
}

model Settings {
  id            String  @id @default(uuid())
  userId        String  @unique
  user          User    @relation(fields: [userId], references: [id])
  topics        String  // JSON: ["AI", "Tech", "Finance"]
  senderBlocklist String // JSON: ["spam@bad.com"]
  schedule      String  // "09:00"
}

model EmailItem {
  id          String   @id @default(uuid())
  rawSubject  String
  sender      String
  receivedAt  DateTime
  rawBody     String
  cleanedBody String?
  isProcessed Boolean  @default(false)
  
  // AI Extracted
  summary     String?  // The 3-5 bullets
  category    String?  // "News", "Update", etc.
  relevance   Int?     // 0-100 score
  readingTime Int?     // Minutes
  actionItems String?  // JSON list
  
  digestId    String?
  digest      Digest?  @relation(fields: [digestId], references: [id])
}

model Digest {
  id        String      @id @default(uuid())
  date      DateTime    @default(now())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  items     EmailItem[]
  
  // The final composed summary for the whole day
  intro     String?
  topReads  String?     // JSON or HTML of top 5
  deepDive  String?
}
```

## 3. Implementation Steps for MVP

### Step 1: Foundation
- Initialize Next.js project.
- Setup Prisma with SQLite.
- Create basic UI layout (Vanilla CSS, "Premium" Calm Aesthetic).

### Step 2: Ingestion & Processing (Backend)
- Create an API route `/api/ingest` to simulate receiving an email (or connect to IMAP).
- Implement `EmailParser` class to extract text from HTML emails.

### Step 3: Intelligence (LLM)
- Create `SummarizerService`.
- Use a mock LLM function for development (or real API if key provided) to perform the "Summarization Prompt" tasks.
- Implement the "Extraction" logic (Action items, events).

### Step 4: Digest Generation
- Create a "Generate Digest" button in UI (manual trigger for MVP instead of cron).
- Implement logic to aggregate `EmailItem`s into a `Digest`.

### Step 5: UI Implementation
- **Dashboard**: Show the latest "Daily Digest".
- **Settings**: Simple form to manage preferences.

## 4. Prompts (as requested)

### Summarization Prompt (System)
```text
You are a calm newsletter editor. Your goal is to convert noisy emails into serene, actionable insights.

Task: Summarize the input email.
Constraints:
- Max 5 bullet points.
- No emojis.
- Tone: Neutral, concise, human, non-marketing.
- Include 1 quote if highly relevant.
- Extract any clear "Action Items".

Input Email:
{{EMAIL_BODY}}
```

### Daily Digest Prompt (System)
```text
You are the editor of "Calm Inbox". 
Task: meaningful combine these {{COUNT}} email summaries into a single daily digest page.

Structure:
1. "Top 5 Relevant" (Title + 1-sentence summary + Link).
2. "News at a Glance" (Bullet points of other items).
3. "Action Items" (Aggregate list).
4. "Deep Dive" (Pick the most interesting 1 long-read and summarize more deeply, optional).

Content:
{{ALL_SUMMARIES}}
```
