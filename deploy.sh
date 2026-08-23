#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Preparing the SKPortfolio static export..."

echo "Checking production dependencies for high or critical advisories..."
npm audit --omit=dev --audit-level=high

echo "Removing previous build output..."
rm -rf .next out

echo "Running the release gate..."
npm run qa

if [[ ! -d out ]]; then
  echo "Static export directory was not created." >&2
  exit 1
fi

for required_file in out/.htaccess out/robots.txt out/sitemap.xml out/index.html out/game/index.html; do
  if [[ ! -f "$required_file" ]]; then
    echo "Required deployment file is missing: $required_file" >&2
    exit 1
  fi
done

file_count="$(find out -type f | wc -l | tr -d ' ')"
echo "Static export ready: $file_count files in out/."
echo "Upload the contents of out/ to the Hostinger public_html directory."
