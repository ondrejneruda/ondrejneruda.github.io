#!/bin/sh
# Renders tools/og-image.html to assets/og-image.png (1200×630) with headless Chrome.
cd "$(dirname "$0")/.." || exit 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot="$PWD/assets/og-image.png" "file://$PWD/tools/og-image.html"
