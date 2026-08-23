---
phase: 05-launch-verification
plan: 01
subsystem: verification
tags: [asciinema, url-crawl, claims-audit, maintainer-docs, discussions, astro, starlight]

requires:
  - phase: 02-docs-rebuild-tutorial-first-content
    provides: Astro + Starlight site with 39-page url-contract, all content pages
  - phase: 01-site-foundation-identity
    provides: verify-build.mjs V1-V10, design/url-contract.json, Astro config
provides:
  - Self-hosted asciinema-player 3.17.0 assets in public/assets/asciinea/
  - Discussions link in troubleshooting page (COMM-01)
  - scripts/crawl-urls.sh for VRFY-03 (39 canonical + 34 pre-rebuild URLs, sitemap equality)
  - scripts/claims-audit.py heuristic claim extractor
  - docs/claims-audit-table.md with 44-row VRFY-02 audit
  - Three maintainer docs updated with Astro + Starlight Channel 5 (VRFY-04)
affects: [05-02]

actuals:
  tokens: 58930
  tasks: 3
  commits: 3

tech-stack:
  added:
    - asciinema-player 3.17.0 (Apache-2.0, static JS/CSS only, no runtime dependency)
  patterns:
    - "Self-hosted asciinema player via npm pack + tarball extraction into public/assets/"
    - "POSIX-sh crawl script with dual URL sets (canonical from json, pre-rebuild embedded as here-doc)"

key-files:
  created:
    - public/assets/asciinema/asciinema-player.min.js
    - public/assets/asciinema/asciinema-player.css
    - scripts/crawl-urls.sh
    - scripts/claims-audit.py
    - docs/claims-audit-table.md
  modified:
    - src/content/docs/docs/troubleshooting/index.md
    - docs/system-architecture.md
    - docs/deployment-guide.md
    - docs/code-standards.md

key-decisions:
  - "D-01: asciinema-player 3.17.0 verified via npm view, assets downloaded via npm pack (not npm install — zero dependency changes) and committed into public/assets/asciinea/"
  - "D-02: Discussions already enabled (has_discussions: true); only the troubleshooting page link edit needed, landing footer already links there"
  - "D-03: crawl-urls.sh uses two URL sets — 39 from url-contract.json (expect 200) and 34 pre-rebuild from Phase-2 classification (expect 200 after following redirects) — covers the roadmap SC-3 'every retired URL serves content or a redirect' wording"
  - "D-04: claims-audit table has 44 rows covering landing (hero, tools, languages, privacy, architecture, footer), quickstart (steps 1-5), and requirements (language table, platform, caveats); 3 rows marked Needs review where judgment is required"
  - "D-05: maintainer docs get ADDITIONS describing the new Astro + Starlight structure (not corrections — RESEARCH verified zero stale refs)"

patterns-established:
  - "Static-player self-hosting pattern: npm pack → tar xzf → copy dist/bundle/ → commit into public/assets/ (no npm install, no dependency, no CI runtime cost)"
  - "Dual-set crawl: canonical from json (strict 200) + pre-rebuild embedded (lenient 200 after redirect follow)"

requirements-completed: [VRFY-02, VRFY-03, VRFY-04, COMM-01]

coverage:
  - id: D1
    description: "asciinema-player.min.js (185 KB) and asciinema-player.css (19 KB) exist in public/assets/asciinema/ (self-hosted, zero third-party requests)"
    requirement: "VRFY-02"
    verification:
      - kind: other
        ref: "test -f public/assets/asciinema/asciinema-player.min.js && test -f public/assets/asciinema/asciinema-player.css"
        status: pass
    human_judgment: false
  - id: D2
    description: "Troubleshooting page links to GitHub Discussions"
    requirement: "COMM-01"
    verification:
      - kind: other
        ref: "grep -F 'github.com/jarvis-intelligence/jarvis-index/discussions' src/content/docs/docs/troubleshooting/index.md"
        status: pass
    human_judgment: false
  - id: D3
    description: "scripts/crawl-urls.sh parses as valid POSIX sh and reads url-contract.json"
    requirement: "VRFY-03"
    verification:
      - kind: other
        ref: "bash -n scripts/crawl-urls.sh"
        status: pass
    human_judgment: false
  - id: D4
    description: "scripts/claims-audit.py parses as valid Python 3"
    requirement: "VRFY-02"
    verification:
      - kind: other
        ref: "python3 -c 'import ast; ast.parse(open(\"scripts/claims-audit.py\").read())'"
        status: pass
    human_judgment: false
  - id: D5
    description: "docs/claims-audit-table.md has >=15 claim rows with evidence artifacts"
    requirement: "VRFY-02"
    verification:
      - kind: other
        ref: "grep -c '|' docs/claims-audit-table.md (51 lines with |; 44 data rows + header)"
        status: pass
    human_judgment: false
  - id: D6
    description: "All three maintainer docs mention the Astro + Starlight site structure"
    requirement: "VRFY-04"
    verification:
      - kind: other
        ref: "grep -c 'Astro' docs/system-architecture.md (4), docs/deployment-guide.md (2), grep -c 'src/content/docs' docs/code-standards.md (1)"
        status: pass
    human_judgment: false
  - id: D7
    description: "npm run build succeeds with new assets and docs edits (no regressions before merge)"
    requirement: "VRFY-03"
    verification:
      - kind: other
        ref: "npm run build && npm run verify && node scripts/check-manifests.mjs (all green)"
        status: pass
    human_judgment: false

no-command: duration: 6min
completed: 2026-08-23
status: complete
---

# Phase 5 Plan 01: Pre-deploy content, tooling, and maintainer docs Summary

**Self-hosted asciinema-player 3.17.0 assets, Discussions link in troubleshooting, URL crawl script with dual sets, claims-audit tooling with 44-row audit table, and Astro + Starlight Channel 5 sections in all three maintainer docs.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-23T18:51:00Z
- **Completed:** 2026-08-23T18:57:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Downloaded and committed asciinema-player 3.17.0 (Apache-2.0) static JS (185 KB) and CSS (19 KB) into `public/assets/asciinema/` — zero third-party requests preserved.
- Added "Getting help" paragraph with Discussions link to troubleshooting page; Discussions already enabled and landing footer already linked.
- Wrote `scripts/crawl-urls.sh`: POSIX-sh crawler with 39 canonical URLs from `url-contract.json` and 34 pre-rebuild URLs from Phase-2 classification, plus sitemap-equality check.
- Wrote `scripts/claims-audit.py`: Python 3 heuristic claim extractor emitting CSV.
- Produced `docs/claims-audit-table.md`: 44-row VRFY-02 audit covering landing (hero, tools, languages, privacy, architecture, footer), quickstart (steps 1-5), and requirements (language table, platform, caveats) with evidence artifacts and locators.
- Updated all three maintainer docs (`system-architecture.md`, `deployment-guide.md`, `code-standards.md`) with Astro + Starlight Channel 5 sections.
- `npm run build && npm run verify && node scripts/check-manifests.mjs` all green.

## Task Commits

Each task was committed atomically:

1. **Task 1: Self-host asciinema-player assets + Discussions link** — `674544a` (feat)
2. **Task 2: Crawl script + claims-audit script + claims audit table** — `541e652` (feat)
3. **Task 3: Update maintainer docs to Astro + Starlight structure** — `c9accb7` (docs)

## Files Created/Modified

- `public/assets/asciinema/asciinema-player.min.js` — asciinema-player 3.17.0 JS (185 KB, Apache-2.0)
- `public/assets/asciinema/asciinema-player.css` — asciinema-player 3.17.0 CSS (19 KB, Apache-2.0)
- `src/content/docs/docs/troubleshooting/index.md` — Added "Getting help" paragraph with Discussions link
- `scripts/crawl-urls.sh` — POSIX-sh crawler with 39 canonical + 34 pre-rebuild URL sets + sitemap equality
- `scripts/claims-audit.py` — Python 3 heuristic claim extractor (CSV output)
- `docs/claims-audit-table.md` — 44-row VRFY-02 claims audit with evidence artifacts
- `docs/system-architecture.md` — New "Docs & Landing site (Channel 5)" section
- `docs/deployment-guide.md` — New "Channel 5 — Docs & Landing site" section
- `docs/code-standards.md` — New "Site (Astro + Starlight)" section

## Decisions Made

- D-01: asciinema-player 3.17.0 verified via `npm view`, downloaded via `npm pack` (not `npm install` — avoids adding it as a dependency), tarball extracted, `dist/bundle/` files copied to `public/assets/asciinema/`, temp files cleaned up.
- D-02: Discussions already enabled (`has_discussions: true`); only the troubleshooting page link edit needed. Landing footer (`src/pages/index.astro:210`) already links there — no change.
- D-03: crawl script uses two URL sets — (a) 39 canonical from `url-contract.json` read via `python3 -c`, (b) 34 pre-rebuild embedded as a here-doc. Canonical set expects 200; pre-rebuild set follows redirects (`-L`) and expects final 200.
- D-04: 3 of 44 audit rows marked `Needs review` (rows 16, 29, 44) where judgment is required rather than clear artifact tracing.
- D-05: Maintainer docs receive additions only — RESEARCH confirmed zero stale VitePress references exist.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 05-01 deliverables ready for 05-02 (the live verification sequence).
- asciinema-player assets in `public/assets/asciinema/` ready for the quickstart embed (05-02's video task).
- crawl script ready to run against the live deployed site (requires ORIGIN env var).
- claims audit table provides the VRFY-02 evidence base for the orchestrator's review.

---
*Phase: 05-launch-verification*
*Completed: 2026-08-23*

## Self-Check: PASSED

All 10 claimed files verified present on disk; all 3 task commits (`674544a`, `541e652`, `c9accb7`) verified present in git log.
