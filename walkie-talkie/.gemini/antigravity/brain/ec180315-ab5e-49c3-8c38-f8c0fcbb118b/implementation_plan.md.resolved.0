# VC & Accelerator Portfolio Aggregator Implementation Plan

We are building a full-stack web application that aggregates startup portfolio data from VC and accelerator websites. We will utilize Python/FastAPI for the backend, Next.js for the frontend, and Anthropic's Claude to extract data directly from scraped HTML via Playwright.

## User Review Required
> [!IMPORTANT]
> Because you are working in a specific workspace, I plan to create the project in:
> `/Users/canerden/.gemini/antigravity/scratch/gym-buddy-gemini/vc-aggregator`
> Please confirm if this is the correct location before I begin.

## Proposed Changes

### Tech Stack Implementation
- **Backend Setup**: Create Python environment and install FastAPI, Uvicorn, SQLAlchemy, APScheduler, Playwright, BeautifulSoup, and Anthropic SDK.
- **Frontend Setup**: Initialize a Next.js 14 (App Router) app with Tailwind CSS and shadcn/ui.

### Backend Details
- `backend/main.py`: Entry point for FastAPI.
- `backend/database/*.py`: SQLAlchemy models (investors, companies, investments, scrape_logs), SQLite setup, DB connection logic.
- `backend/database/seed_sources.py`: JSON seeder script for the provided list of VCs.
- `backend/scraper/engine.py`: Core Playwright scraping logic to navigate, wait for renders, and extract HTML.
- `backend/scraper/extractor.py`: LLM logic invoking Claude to parse the HTML into structured JSON.
- `backend/scraper/normalizer.py`: Fuzzy matching, data deduplication, DB upserting.
- `backend/scraper/scheduler.py`: APScheduler tasks.
- `backend/api/*.py`: REST routes.

### Frontend Details
- `frontend/app/page.tsx`: Search/browse functionality.
- `frontend/app/company/[slug]/page.tsx`: Detail view of companies.
- `frontend/app/investors/page.tsx`: List of investors.
- Custom UI components utilizing shadcn/ui.

## Verification Plan
### Automated Tests
- Test endpoints locally with `/docs` (FastAPI Swagger UI).
- Run manual scraper processes (`POST /api/scrape/:investor_id`) to verify correct DB insertion and Claude data extraction.

### Manual Verification
- Spin up the Next.js development server and verify the UI aesthetics.
- Verify filtering, searching, and navigating through the locally populated database to ensure standard functionality.
