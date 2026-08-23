#!/usr/bin/env sh
# Crawl the live site against two URL sets:
#   (a) canonical URLs from design/url-contract.json (expect 200)
#   (b) pre-rebuild URLs from Phase-2 classification (expect 200 or 301/302)
# Append a sitemap-equality check.
# Usage: ORIGIN=https://... ./scripts/crawl-urls.sh

set -eu

ORIGIN="${ORIGIN:-https://jarvis-intelligence.github.io/jarvis-index}"
CONTRACT="${CONTRACT:-design/url-contract.json}"

failures=0

# --- Set A: canonical URLs from url-contract.json ---
echo "=== Canonical URLs (from ${CONTRACT}) ==="
if [ ! -f "$CONTRACT" ]; then
  echo "FAIL: contract file not found: $CONTRACT" >&2
  failures=$((failures + 1))
else
  # Extract URLs using python3 (POSIX-safe, no jq dependency)
  urls=$(python3 -c "import json,sys; [print(u) for u in json.load(sys.stdin)['urls']]" < "$CONTRACT")
  if [ -z "$urls" ]; then
    echo "FAIL: no URLs found in $CONTRACT" >&2
    failures=$((failures + 1))
  else
    echo "$urls" | while IFS= read -r url; do
      code=$(curl -s -o /dev/null -w "%{http_code}" "${ORIGIN}${url}")
      case "$code" in
        200) echo "  OK 200 $url" ;;
        *) echo "FAIL $code $url"; exit 1 ;;
      esac
    done || failures=$((failures + 1))
  fi
fi

# --- Set B: pre-rebuild URLs (Phase-2 keep-list, 34 entries) ---
# These are the URLs the old VitePress site served. After migration, each must
# still serve content (200) or redirect to a live page (301/302 → 200).
echo ""
echo "=== Pre-rebuild URLs (Phase-2 classification, 34 entries) ==="
pre_rebuild_urls=$(cat <<'URLS'
/
/brand-logo.html
/docs/
/docs/quickstart/
/docs/guide/requirements/
/docs/guide/install/
/docs/tools/
/docs/tools/blast-radius/
/docs/tools/call-hierarchy/
/docs/tools/document-symbols/
/docs/tools/find-references/
/docs/tools/get-index-status/
/docs/tools/go-to-definition/
/docs/tools/search-code/
/docs/tools/semantic-search/
/docs/tools/type-hierarchy/
/docs/cli/
/docs/cli/index-cmd/
/docs/cli/list/
/docs/cli/status/
/docs/cli/reindex/
/docs/cli/forget/
/docs/concepts/architecture/
/docs/concepts/blast-radius/
/docs/concepts/scip/
/docs/concepts/semantic-search/
/docs/concepts/zoekt/
/docs/integrations/
/docs/integrations/claude-code/
/docs/integrations/codex-cli/
/docs/integrations/cursor/
/docs/troubleshooting/
/docs/troubleshooting/common-failures/
/docs/troubleshooting/upstream-issues/
/docs/changelog/
URLS
)

echo "$pre_rebuild_urls" | while IFS= read -r url; do
  [ -z "$url" ] && continue
  # Follow redirects (-L) and check the final status code
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "${ORIGIN}${url}")
  case "$code" in
    200) echo "  OK 200 $url" ;;
    *) echo "FAIL $code $url"; exit 1 ;;
  esac
done || failures=$((failures + 1))

# --- Sitemap equality check ---
echo ""
echo "=== Sitemap equality ==="
SITEMAP_URL="${ORIGIN}/sitemap-0.xml"
sitemap_tmp=$(mktemp)
trap 'rm -f "$sitemap_tmp"' EXIT

curl -sf "$SITEMAP_URL" > "$sitemap_tmp" 2>/dev/null || {
  echo "FAIL: could not fetch $SITEMAP_URL" >&2
  failures=$((failures + 1))
}

if [ -f "$sitemap_tmp" ] && [ -s "$sitemap_tmp" ]; then
  # Extract <loc> URLs from sitemap
  sitemap_urls=$(grep -o '<loc>[^<]*</loc>' "$sitemap_tmp" | sed 's/<loc>//;s/<\/loc>//')
  # Build expected set from contract
  if [ -f "$CONTRACT" ]; then
    expected=$(python3 -c "
import json,sys
contract = json.load(sys.stdin)
for u in sorted(contract['urls']):
    print(f'{contract[\"origin\"]}{u}')
" < "$CONTRACT")
    # Compare (sort both, diff)
    diff_result=$(printf '%s\n' $sitemap_urls | sort | diff - <(printf '%s\n' $expected | sort) || true)
    if [ -n "$diff_result" ]; then
      echo "FAIL: sitemap does not match contract"
      echo "$diff_result"
      failures=$((failures + 1))
    else
      echo "  OK: sitemap matches contract ($(printf '%s\n' $expected | wc -l | tr -d ' ') entries)"
    fi
  fi
fi

echo ""
if [ "$failures" -gt 0 ]; then
  echo "FAILURES: $failures" >&2
  exit 1
else
  echo "All checks passed."
fi