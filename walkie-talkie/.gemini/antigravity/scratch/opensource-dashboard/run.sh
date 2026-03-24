#!/bin/bash
# Open Source Dashboard — One-command launcher
# Usage: ./run.sh

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Open Source Dashboard"
echo "========================"
echo ""

# Fetch fresh data
bash "$DIR/fetch-data.sh"

echo ""
echo "🌐 Starting local server..."
echo "   Dashboard: http://localhost:8787"
echo "   Press Ctrl+C to stop"
echo ""

# Start a simple HTTP server
cd "$DIR"
python3 -m http.server 8787
