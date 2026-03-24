# Accelerator Portfolio Tracker — Execution Plan

## Context
All code is already written. We need to: configure API keys, create Supabase tables, then run the scraper. The scraper uses **Firecrawl** (not Algolia) to discover companies from YC's directory pages, then scrapes each company's YC profile + website.

## What's Already Built
- `config.py` — Supabase/Firecrawl/Anthropic clients, constants
- `country_utils.py` — location → country mapping
- `scrape_yc.py` — full pipeline: discover slugs → scrape YC profiles → scrape websites → classify → store
- `monitor_changes.py` — re-scrape + diff detection
- `generate_report.py` — markdown report from Supabase data
- `schema.sql` — 3 tables with indexes
- Dependencies already installed via `requirements.txt`

## Execution Steps

### Step 1: Fill in `.env` with real API keys
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
ANTHROPIC_API_KEY=sk-ant-...
FIRECRAWL_API_KEY=fc-...
```

### Step 2: Create tables in Supabase
Copy `schema.sql` contents into the Supabase SQL Editor and run it. Creates:
- `companies` (with UNIQUE on name+source+batch)
- `website_snapshots`
- `website_changes`
- 4 indexes

### Step 3: Run the scraper
```bash
cd "/Users/canerden/test for scraping"
python scrape_yc.py
```
This will:
1. For each batch (W25, S25, W26): scrape YC directory + use Firecrawl map to find company slugs
2. For each company: scrape YC profile page → extract details via Claude → scrape company website → classify sector → upsert to Supabase
3. Rate limiting: 1.5s between scrapes, exponential backoff on 429s

**Note on coverage:** The YC directory page may not expose all 200+ companies in a single scrape (JS-rendered infinite scroll). The code uses two strategies (directory scrape + Firecrawl map) to maximize coverage. If we get fewer companies than expected, we may need to add batch-filtered pagination or use the Algolia API as a fallback.

### Step 4: Verify data
Check Supabase dashboard — companies table should have rows with sectors, countries, and linked snapshots.

### Step 5: Generate first report
```bash
python generate_report.py
```
Outputs `report_2026-03-19.md` with sector distributions, country breakdown, AI trends.

## Potential Issue: YC Directory Coverage
The biggest risk is that Firecrawl may not capture all companies from the directory page (infinite scroll). If we see <100 companies per batch, we have options:
1. Use Firecrawl's `crawl_url` with a search pattern instead of `map_url`
2. Add the Algolia API as a fallback (public keys are available)
3. Scrape multiple paginated directory URLs

## Cost Estimate
- Firecrawl: ~$7.50 per full run (750 pages × $0.01)
- Claude Haiku: <$1 per run (extraction + classification)
- Supabase: free tier
- **Total: ~$10 per full scrape run**
