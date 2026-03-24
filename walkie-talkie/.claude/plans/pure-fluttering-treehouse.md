# VC & Accelerator Portfolio Aggregator — Implementation Plan

## Context

Build a full-stack web app that scrapes VC/accelerator portfolio pages, uses Claude API to extract structured company data from messy HTML, and presents it through a searchable frontend. The key innovation is LLM-powered extraction instead of per-site custom parsers.

**Working directory:** `/Users/canerden/scheduled tasks for claude code/vc-aggregator/`

---

## Phase 0: Scaffolding & Dependencies

### 0.1 Create directory structure
```
vc-aggregator/
├── backend/{database,scraper,api}/
└── frontend/ (via create-next-app)
```

### 0.2 Backend dependencies (`backend/requirements.txt`)
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
aiosqlite==0.20.0
anthropic==0.46.0
playwright==1.49.1
beautifulsoup4==4.12.3
apscheduler==3.10.4
thefuzz[speedup]==0.22.1
python-levenshtein==0.26.1
httpx==0.28.1
pydantic==2.10.4
pydantic-settings==2.7.1
```
Then: `python3 -m venv venv && pip install -r requirements.txt && playwright install chromium`

### 0.3 Frontend scaffold
```bash
npx create-next-app@14 frontend --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd frontend && npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input table badge select dialog tabs separator skeleton switch
npm install @tanstack/react-query lucide-react
```

---

## Phase 1: Data Pipeline

### 1.1 `backend/config.py`
- `pydantic_settings.BaseSettings` loading from `.env`
- Keys: `DATABASE_URL` (default sqlite), `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (claude-sonnet-4-20250514), `SCRAPE_DELAY_MIN/MAX`, `USER_AGENTS` list, `ENABLE_SCHEDULER`

### 1.2 `backend/database/connection.py`
- Async SQLAlchemy engine + session factory
- `init_db()`: create tables via `Base.metadata.create_all`, then raw SQL for FTS5 virtual table + sync triggers
- Enable WAL mode: `PRAGMA journal_mode=WAL`
- FTS5 virtual table on companies (name, description, sector columns)

### 1.3 `backend/database/models.py`
- 4 tables matching provided schema: `investors`, `companies`, `investments`, `scrape_logs`
- Add `domain` column to companies (extracted from website, used for dedup)
- Add `generate_slug()` utility
- Indexes on `companies.domain`, `companies.sector`, `companies.stage`

### 1.4 `backend/database/seed_sources.py`
- JSON seed data with 20 VCs/accelerators (as specified)
- `seed_investors()` function: upsert (skip if name exists)
- Called from `init_db()`

### 1.5 `backend/scraper/engine.py`
- `fetch_with_playwright(url)`: headless Chromium, random user-agent, block images/fonts, scroll-to-bottom for lazy loading (max 50 scrolls), return `page.content()`
- `fetch_with_httpx(url)`: simple GET fallback for static pages
- Rate limiting: `asyncio.sleep(random.uniform(2.0, 3.5))` between fetches

### 1.6 `backend/scraper/extractor.py` (CRITICAL FILE)
- `preprocess_html()`: BeautifulSoup strips scripts/styles/nav/footer/svg, keeps only href/src/alt/class attributes
- `chunk_html()`: split cleaned HTML into <=120K char chunks at natural break points
- `extract_companies()`: send each chunk to Claude API with extraction prompt, parse JSON response, merge results
- Prompt instructs Claude to return JSON array with normalized field values
- Error handling: retry once on invalid JSON, strip markdown fences

### 1.7 `backend/scraper/normalizer.py`
- `extract_domain(url)`: strip www prefix, extract clean domain
- `deduplicate_and_upsert()`:
  1. Domain match (primary dedup key)
  2. Fuzzy name match via `thefuzz` (ratio > 85)
  3. Insert new if no match
- Upsert: fill null fields from new data, don't overwrite existing
- Create `investments` junction record
- Return counts: {added, updated, skipped}

### 1.8 `backend/scraper/scheduler.py`
- APScheduler AsyncIOScheduler
- `scrape_investor(investor_id)`: full pipeline (fetch -> extract -> normalize -> store) with scrape_log recording
- Gate behind `ENABLE_SCHEDULER` env var
- Stagger jobs across the week

**TEST CHECKPOINT:** Run pipeline on 1-2 small investors (USV, First Round Capital)

---

## Phase 2: API Layer

### 2.1 `backend/api/schemas.py`
- Pydantic models: `CompanyOut`, `CompanyListOut` (paginated), `InvestorOut`, `InvestorListOut`, `ScrapeLogOut`, `StatsOut`

### 2.2 `backend/api/routes.py`
```
GET  /api/companies          — search + filter + paginate (FTS5 for text search)
GET  /api/companies/{slug}   — detail with investors
GET  /api/investors           — list (filterable by type)
GET  /api/investors/{id}      — detail with portfolio
POST /api/scrape/{investor_id} — trigger manual scrape (BackgroundTasks)
POST /api/scrape/all          — trigger all
GET  /api/scrape/logs         — recent logs
GET  /api/stats               — dashboard stats
GET  /api/filters             — available filter values
```
- FTS5 search: `JOIN companies_fts ON companies.id = companies_fts.rowid WHERE companies_fts MATCH :query`
- Filters compose with AND

### 2.3 `backend/main.py`
- FastAPI app with CORS (allow localhost:3000)
- Startup: `init_db()`, optionally `setup_scheduler()`
- Include API router

**TEST CHECKPOINT:** Start uvicorn, test all endpoints via Swagger UI

---

## Phase 3: Frontend

### 3.1 Core files
- `frontend/lib/types.ts` — TypeScript interfaces matching API schemas
- `frontend/lib/api.ts` — fetch wrapper functions for all endpoints

### 3.2 Components
- `SearchBar.tsx` — debounced input, syncs with URL params
- `CompanyCard.tsx` — shadcn Card with name, description, badges, investor logos
- `FilterSidebar.tsx` — checkbox groups for sector/stage, select for investor
- `InvestorGrid.tsx` — investor card grid
- `DataTable.tsx` — shadcn Table alternative view

### 3.3 Pages
- `app/layout.tsx` — nav bar, theme provider, QueryClientProvider
- `app/page.tsx` — main search/browse: sidebar + card grid + pagination + stats banner
- `app/company/[slug]/page.tsx` — company detail with investors list
- `app/investors/page.tsx` — investor grid with type filter
- `app/investors/[id]/page.tsx` — investor detail with portfolio + scrape trigger

### Design: Clean/minimal (Linear aesthetic), shadcn/ui components, responsive, dark/light mode via next-themes

**TEST CHECKPOINT:** All 4 pages functional with real API data

---

## Phase 4: Polish

1. Activate scheduler with staggered weekly jobs
2. Scrape logs viewer (table on investors page or `/admin`)
3. Dark mode toggle in nav (sun/moon icon)
4. Loading/error/empty states throughout
5. Docker: `backend/Dockerfile` (Python 3.13 + Playwright deps), `frontend/Dockerfile` (Node 22), `docker-compose.yml`
6. `README.md` with setup instructions

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Large HTML (YC has thousands of companies) | Aggressive HTML preprocessing + chunking; consider YC API directly |
| Claude returning invalid JSON | Strip markdown fences, retry once, log raw response |
| Sites blocking scrapers | Random user agents, 2-5s delays, respect robots.txt |
| SQLite write locks during scrape | WAL mode, scrape one investor at a time |
| FTS5 availability | Python's bundled SQLite usually includes FTS5; verify at startup |
| Dedup failures | Domain-based primary key + fuzzy name fallback |
| Cost: ~$0.50-$2 per full scrape cycle (YC outlier at $5+) | Pre-process HTML aggressively |

---

## Verification Plan

1. **Backend pipeline:** Manually scrape 2-3 investors, verify companies appear in DB with correct dedup
2. **API:** Test all endpoints via FastAPI Swagger UI at `/docs`
3. **Frontend:** Visual check all 4 pages, test search/filter/pagination, test dark mode
4. **E2E:** Search for a company known to be in multiple portfolios, verify it shows all investors
5. **Scrape trigger:** Click "Scrape" on investor detail page, verify log entry created and companies updated

---

## File Creation Order

1. `backend/requirements.txt` + venv setup
2. `backend/.env`
3. `backend/config.py`
4. `backend/database/__init__.py`, `connection.py`, `models.py`, `seed_sources.py`
5. `backend/scraper/__init__.py`, `engine.py`, `extractor.py`, `normalizer.py`, `scheduler.py`
6. Test pipeline on 2 investors
7. `backend/api/__init__.py`, `schemas.py`, `routes.py`
8. `backend/main.py`
9. Test API endpoints
10. Frontend scaffold + shadcn setup
11. `frontend/lib/types.ts`, `api.ts`
12. All components
13. All pages
14. Test E2E
15. Polish: dark mode, Docker, README
