---
phase: 05-launch-verification
plan: 02
subsystem: launch

# Dependency graph
requires:
  - phase: 05-01
    provides: asciinema player assets, crawl/audit tooling, maintainer docs, Discussions link
provides:
  - Merged main (v0.7.3 milestone) deployed live, deploy green ×3
  - Cold-install recording (public/assets/asciinema/cold-install.cast) + quickstart player embed
  - Docs fixes surfaced by the honest cold run: --python 3.13 pin, Node.js requirement, scoped uvx cold-start claim
  - Live crawl results + sitemap equality (all green)
  - Claims audit fully resolved (44 rows Traced, 3 Needs-review resolved with evidence)

actuals:
  tokens: 21000
  tasks: 2
  commits: 7

key-files:
  created:
    - public/assets/asciinema/cold-install.cast
    - src/components/landing/ColdInstallPlayer.astro
    - .planning/phases/05-launch-verification/crawl-results.txt
    - .planning/phases/05-launch-verification/sitemap-diff.txt
  modified:
    - src/content/docs/docs/quickstart.mdx
    - src/content/docs/docs/guide/install.md
    - src/content/docs/docs/guide/requirements.md
    - src/content/docs/docs/troubleshooting/common-failures.md
    - src/components/landing/InstallWidget.astro
    - scripts/crawl-urls.sh
    - docs/claims-audit-table.md

key-decisions:
  - "Docker daemon unavailable (Rancher Desktop failed to start) — used the CONTEXT-documented fallback: macOS temp-HOME isolated run with prerequisites-only PATH; environment stated in the recording header and quickstart copy. No silent substitution."
  - "First cold attempt exposed two real docs defects: (1) uv tool install without --python pin resolved jarvis-mcp 0.5.1 on a python-less machine (below the >=0.6.0 registration floor) — fixed by pinning --python 3.13 everywhere the command appears; (2) Node.js/npm was not listed as a platform requirement despite scip-typescript/scip-python being npm packages — added to requirements.md. Second run followed the published pages verbatim and succeeded end-to-end (jarvis-mcp 0.6.2, repo indexed, first getIndexStatus tool call returned real data over stdio JSON-RPC)."
  - "Asciinema embed: MDX mangles inline JS braces — used an Astro component (ColdInstallPlayer.astro) with is:inline scripts; BASE_URL-prefixed asset URLs (root-absolute paths 404 under /jarvis-index)."
  - "Crawl sitemap-equality aligned with verify-build V9 semantics: sitemap ⊆ contract, contract ⊆ sitemap + passthrough (brand-logo.html is a public/ passthrough — served and crawled, not sitemapable)."
  - "Row 29 claims correction: PyPI publishes cp312–cp314 wheels for macOS + manylinux glibc; the 5+-minute source build only applies to no-wheel platforms — quickstart + troubleshooting scoped accordingly."

verification:
  - "Merge + 3 deploys green: runs 32619570086, 32620190106, 32620370805"
  - "Live smoke: / 200, /docs/ 200, /docs/quickstart/ 200; cast + player assets 200; quickstart embed present live"
  - "Cold install (final): setup.sh 15s → uv tool install 3s (jarvis-mcp 0.6.2) → jarvis index 12s (indexed) → first tool call 5s (getIndexStatus: indexed=true, freshness=fresh)"
  - "Crawl: exit 0 — all canonical 200s, retired URLs 200/301 with final-200, sitemap matches (38 entries + 1 passthrough documented)"
  - "Claims audit: 44/44 Traced, 0 Needs review"
  - "Discussions: has_discussions=true; troubleshooting links it live"
  - "npm run build + verify V1–V10 green at every step"
