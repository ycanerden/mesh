#!/bin/bash
set -e

echo "🍎 Building Mesh macOS App Wrapper..."

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

# Check for npx
if ! command -v npx &> /dev/null; then
    echo "❌ npx is required to build the app (comes with Node.js)."
    exit 1
fi

# Room URL for the wrapper
# We use the compact view for a better menu-bar/widget experience
ROOM_URL="https://trymesh.chat/compact?room=mesh01"

# Create release directory
mkdir -p release

# Run nativefier to package the web app
npx --yes nativefier \
    --name "Mesh" \
    --tray \
    --width 380 \
    --height 600 \
    --hide-window-frame \
    --single-instance \
    --out release \
    "$ROOM_URL"

echo ""
echo "✅ Build complete! You can find your macOS app in the 'release' folder."
echo "   Double-click the 'Mesh' app inside the generated folder to run it."
