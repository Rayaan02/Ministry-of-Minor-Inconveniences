#!/bin/sh
# Art workflow: validate sprite grids, then regenerate the PNG previews.
#
#   ./art.sh            validate + regenerate + open the scenery sheet
#   ./art.sh all        also open the character and building sheets
#
# Edit the ROWS constants in src/world/art.ts, then run this.
set -e

export PATH="$HOME/.ministry-tools/node-v20.18.1-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")"

node scripts/check-art.mjs
node scripts/make-sprites.mjs

if [ "$1" = "all" ]; then
  open sprite-previews/sheet-characters.png
  open sprite-previews/sheet-buildings.png
fi
open sprite-previews/sheet-scenery.png

echo ""
echo "Previews regenerated in sprite-previews/ (they are git-ignored artefacts)."
