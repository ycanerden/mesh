#!/bin/bash
# ========================================
# Vibe Coder — Tool Discovery & Update Script
# Uses Brave Search API to find new tools
# and updates Firebase Firestore
# ========================================

set -euo pipefail

# --- Configuration ---
BRAVE_API_KEY="${BRAVE_API_KEY:-}"
FIREBASE_PROJECT="${FIREBASE_PROJECT_ID:-}"
DATA_DIR="$(cd "$(dirname "$0")" && pwd)/data"

mkdir -p "$DATA_DIR"

# Colors
ORANGE='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${ORANGE}[vibe-coder]${NC} $1"; }
ok()  { echo -e "${GREEN}[✓]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; }

# --- Check Dependencies ---
if [ -z "$BRAVE_API_KEY" ]; then
  err "BRAVE_API_KEY not set!"
  echo ""
  echo "Get your free API key:"
  echo "  1. Go to https://brave.com/search/api/"
  echo "  2. Sign up for the Free plan"
  echo "  3. Copy your API key"
  echo "  4. Run: export BRAVE_API_KEY='your-key-here'"
  echo ""
  exit 1
fi

# --- Brave Search Function ---
brave_search() {
  local query="$1"
  local count="${2:-10}"

  curl -s "https://api.search.brave.com/res/v1/web/search" \
    -H "Accept: application/json" \
    -H "Accept-Encoding: gzip" \
    -H "X-Subscription-Token: ${BRAVE_API_KEY}" \
    --data-urlencode "q=${query}" \
    --data-urlencode "count=${count}" \
    --compressed
}

# --- Search Queries ---
QUERIES=(
  "best no-code AI app builder tools 2025"
  "new AI coding assistant tools for beginners 2025"
  "no-code automation platform alternatives 2025"
  "best low-code web development tools 2025"
  "AI-powered design tools for non-engineers 2025"
  "best free backend as a service platforms 2025"
)

log "Starting tool discovery..."
echo ""

# --- Run Searches ---
ALL_RESULTS="$DATA_DIR/brave-search-results.json"
echo '{"queries": [], "results": [], "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > "$ALL_RESULTS"

for query in "${QUERIES[@]}"; do
  log "Searching: ${query}"

  RESULT=$(brave_search "$query" 5)

  if [ $? -eq 0 ] && echo "$RESULT" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
    # Extract web results
    echo "$RESULT" | python3 -c "
import sys, json

data = json.load(sys.stdin)
web_results = data.get('web', {}).get('results', [])

tools = []
for r in web_results:
    tools.append({
        'title': r.get('title', ''),
        'url': r.get('url', ''),
        'description': r.get('description', ''),
        'query': '$query'
    })

# Append to existing results
with open('$ALL_RESULTS', 'r') as f:
    existing = json.load(f)
existing['queries'].append('$query')
existing['results'].extend(tools)
with open('$ALL_RESULTS', 'w') as f:
    json.dump(existing, f, indent=2)

print(f'  Found {len(tools)} results')
"
    ok "Done"
  else
    err "Search failed for: $query"
  fi

  # Rate limit: 1 request per second (free tier)
  sleep 1.5
done

echo ""

# --- Process & Deduplicate Results ---
log "Processing results..."

python3 -c "
import json

with open('$ALL_RESULTS', 'r') as f:
    data = json.load(f)

# Deduplicate by URL
seen = set()
unique = []
for r in data['results']:
    url = r['url'].rstrip('/')
    if url not in seen:
        seen.add(url)
        unique.append(r)

data['results'] = unique
data['total_unique'] = len(unique)

with open('$ALL_RESULTS', 'w') as f:
    json.dump(data, f, indent=2)

print(f'Total unique results: {len(unique)}')
print(f'Queries run: {len(data[\"queries\"])}')
"

ok "Results saved to $ALL_RESULTS"

# --- Update Firebase (if configured) ---
if [ -n "$FIREBASE_PROJECT" ]; then
  log "Updating Firebase Firestore..."

  python3 -c "
import json, urllib.request, os

PROJECT = os.environ.get('FIREBASE_PROJECT_ID', '')
if not PROJECT:
    print('No FIREBASE_PROJECT_ID set, skipping Firestore update')
    exit(0)

with open('$ALL_RESULTS', 'r') as f:
    data = json.load(f)

# Use Firestore REST API
base_url = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents'

updated = 0
for result in data['results']:
    doc_id = result['url'].replace('https://', '').replace('http://', '').replace('/', '-').replace('.', '-')[:128]

    doc_data = {
        'fields': {
            'title': {'stringValue': result.get('title', '')},
            'url': {'stringValue': result.get('url', '')},
            'description': {'stringValue': result.get('description', '')},
            'query': {'stringValue': result.get('query', '')},
            'source': {'stringValue': 'brave-search'},
        }
    }

    req = urllib.request.Request(
        f'{base_url}/discovered-tools/{doc_id}',
        data=json.dumps(doc_data).encode(),
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    try:
        urllib.request.urlopen(req)
        updated += 1
    except Exception as e:
        print(f'  Failed to update {doc_id}: {e}')

print(f'Updated {updated} documents in Firestore')
" && ok "Firebase updated!" || err "Firebase update failed (check FIREBASE_PROJECT_ID)"
else
  log "Skipping Firebase update (FIREBASE_PROJECT_ID not set)"
  echo "  To enable: export FIREBASE_PROJECT_ID='your-project-id'"
fi

echo ""
ok "Tool discovery complete! Results in: $ALL_RESULTS"
echo ""
echo "  📊 Review results: cat $ALL_RESULTS | python3 -m json.tool"
echo "  🔄 Re-run anytime: ./update-tools.sh"
echo ""
