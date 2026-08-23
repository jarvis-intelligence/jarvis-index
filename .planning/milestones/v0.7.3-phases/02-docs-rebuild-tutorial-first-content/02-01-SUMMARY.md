---
phase: 02-docs-rebuild-tutorial-first-content
plan: 01
subsystem: docs
tags: [astro, starlight, url-contract, fonts, 404, docs-content]

requires:
  - phase: 01-site-foundation-identity
    provides: Astro + Starlight shell, url-contract.json + verify-build.mjs CI assertions, redirects mechanism, Fontsource self-hosted tokens
provides:
  - Self-hosted brand-logo.html fonts (public/fonts/ + inline @font-face), V4 exclusion removed
  - Lookup-table 404 page (src/content/docs/404.md) with zero-retire empty state + six-group nav
  - 34-URL classification audit (keep x34, zero retires)
  - WR-01 fix (tools/index.md findReferences link)
  - Five deepened concept pages (scip, zoekt, semantic-search, blast-radius, architecture)
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07]

actuals:
  tokens: 5800
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Static passthrough font self-hosting: copy stable-named woff2 out of dist/_astro/ hashed assets into public/fonts/, reference via relative url(fonts/...) in an inline @font-face block"
    - "Starlight custom 404 via src/content/docs/404.md with template: splash — no contract edit needed (V2 excludes 404.html)"
    - "34-URL classification audit as a plan-level artifact — keep-all-deepen-in-place confirmed empirically, zero flagged retires"

key-files:
  created:
    - public/fonts/geist-latin-wght-normal.woff2
    - public/fonts/geist-mono-latin-wght-normal.woff2
    - public/fonts/rajdhani-latin-600-normal.woff2
    - public/fonts/rajdhani-latin-700-normal.woff2
    - src/content/docs/404.md
  modified:
    - public/brand-logo.html
    - scripts/verify-build.mjs
    - design/url-contract.json
    - .planning/WINDOWS.md
    - src/content/docs/docs/tools/index.md
    - src/content/docs/docs/concepts/scip.md
    - src/content/docs/docs/concepts/zoekt.md
    - src/content/docs/docs/concepts/semantic-search.md
    - src/content/docs/docs/concepts/blast-radius.md
    - src/content/docs/docs/concepts/architecture.md

key-decisions:
  - "D-01 executed: brand-logo.html fonts self-hosted from public/fonts/, V4 exclusion removed, WINDOWS.md id 4 closed"
  - "D-02/D-03 executed: all 34 contract URLs classified keep, zero retires — matches RESEARCH's pre-planning expectation of no redundant pages"
  - "D-04 executed: 404 page uses Starlight's template: splash with the lookup table + six-group nav, no contract edit needed"

patterns-established:
  - "Font self-hosting for public/ passthrough pages: copy from dist/_astro/ hashed output with stable names, never reference the hash directly"
  - "404 lookup table stays a docs-content page (404.md), excluded from V2 by verify-build.mjs's explicit filter"

requirements-completed: [DOCS-09]

coverage:
  - id: D1
    description: "brand-logo.html self-hosts Geist/Geist Mono/Rajdhani from public/fonts/, zero third-party font CDN references, verify-build V4 scans it with no exclusion"
    requirement: "DOCS-09"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V4 dimension) + grep -qE 'fonts\\.(googleapis|gstatic)\\.com' public/brand-logo.html (expect no match)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Lookup-table 404 (src/content/docs/404.md) renders the zero-retire empty state and six sidebar-group links; dist/404.html is a root file, not a directory"
    requirement: "DOCS-09"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V2) + test -f dist/404.html && test ! -d dist/404 + grep -q 'No URLs have been retired yet' src/content/docs/404.md"
        status: pass
    human_judgment: true
    rationale: "Automated checks confirm the file exists at the right path with the right copy; visual rendering inside the Starlight shell (nav links clickable, table legible) is the phase-gate human-check item per the plan's <verify> block, not run in this non-interactive execution session."
  - id: D3
    description: "34-URL classification audit: every contract URL classified, zero retires executed without user confirmation"
    requirement: "DOCS-09"
    verification:
      - kind: other
        ref: "## Classification section below (34 rows) + design/url-contract.json unchanged urls array"
        status: pass
    human_judgment: false
  - id: D4
    description: "WR-01 fixed: tools/index.md's findReferences link targets /tools/find-references/ (kebab-case, trailing slash)"
    requirement: "DOCS-09"
    verification:
      - kind: other
        ref: "grep -q '/tools/find-references/' src/content/docs/docs/tools/index.md && ! grep -q 'findReferences)' src/content/docs/docs/tools/index.md"
        status: pass
    human_judgment: false
  - id: D5
    description: "Five concept pages deepened in place with unchanged URLs, no duplicate body H1, flat-freshness-only JSON, claims traced to ../jarvis sources"
    requirement: "DOCS-09"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V2 unchanged) + grep guards: no nested \"freshness\": {, no duplicate H1, no anchor-free non-trailing-slash internal links"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 01: Docs Restructure Mechanics Summary

**Self-hosted brand-logo.html fonts closing the last third-party-font gap, a lookup-table 404 page, a 34-URL classification audit (keep x34, zero retires), the WR-01 link fix, and five deepened concept pages — all traced to `../jarvis` source.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-22T02:56:00Z
- **Completed:** 2026-08-22T03:03:25Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- D-01 fully landed: `public/brand-logo.html` self-hosts Geist / Geist Mono / Rajdhani from `public/fonts/`; `scripts/verify-build.mjs` V4 now scans every built HTML/CSS file with no exclusion; WINDOWS.md id 4 closed.
- D-04 fully landed: `src/content/docs/404.md` (Starlight `template: splash`) serves the lookup-table 404 with the documented zero-retire empty state and a link list into all six sidebar groups. `dist/404.html` confirmed a root file, never a `/404/` directory.
- D-02/D-03 executed: every one of the 34 `design/url-contract.json` URLs audited and classified — see `## Classification` below. Zero retires executed; zero pages flagged as merge/retire candidates (matches 02-RESEARCH's pre-planning finding that no existing page is redundant).
- WR-01 fixed: `src/content/docs/docs/tools/index.md`'s `findReferences` link now targets `/tools/find-references/` (kebab-case, trailing slash) instead of the live-404ing camelCase target.
- All five concept pages (`scip`, `zoekt`, `semantic-search`, `blast-radius`, `architecture`) deepened in place with new sections sourced from `../jarvis/src/jarvis/index_cli.py`, `../jarvis/docs/system-architecture.md`, `../jarvis/README.md`, `setup.sh`, and `plugin/skills/jarvis-use/SKILL.md` — same URLs, no duplicate body H1.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end brand-logo font self-hosting (D-01)** — `9164c9e` (feat)
2. **Task 2: Lookup-table 404, WR-01 fix, 34-URL classification audit (D-04, D-02/D-03)** — `295bba0` (feat)
3. **Task 3: Deepen the five concept pages in place (D-02)** — `9b4ac76` (docs)

**Plan metadata:** commit to follow (docs: complete plan)

## Files Created/Modified

- `public/brand-logo.html` — Google Fonts CDN links replaced with an inline `@font-face` block against `public/fonts/`
- `public/fonts/geist-latin-wght-normal.woff2`, `geist-mono-latin-wght-normal.woff2`, `rajdhani-latin-600-normal.woff2`, `rajdhani-latin-700-normal.woff2` — copied with stable names from `dist/_astro/`'s hashed Fontsource output
- `scripts/verify-build.mjs` — V4's `V4_EXCLUDED` set and its filter clause removed; header comment updated
- `design/url-contract.json` — `generated_from` note updated to record the KEEP classification for `/brand-logo.html`
- `.planning/WINDOWS.md` — id 4 marked fixed
- `src/content/docs/404.md` — new lookup-table 404 page (`template: splash`)
- `src/content/docs/docs/tools/index.md` — WR-01 link fix
- `src/content/docs/docs/concepts/scip.md` — added the scip version-gate section, language-detection tie-break order
- `src/content/docs/docs/concepts/zoekt.md` — added trigram explanation, `zoekt-git-index` binary naming, collision rationale, `searchCode` hit shape
- `src/content/docs/docs/concepts/semantic-search.md` — added the second-MCP-server requirement, result entry shape, issue #9 chunking limitation
- `src/content/docs/docs/concepts/blast-radius.md` — added the dependents response shape
- `src/content/docs/docs/concepts/architecture.md` — added a component table and an index-to-tool-response data-flow section

## Classification

34-row audit of every URL in `design/url-contract.json` against the built page set and `02-PATTERNS.md`. **Result: keep × 34, zero retires, zero flagged candidates** — confirming 02-RESEARCH's pre-planning finding that no existing page is redundant.

| URL | Classification | Rationale |
|-----|-----------------|-----------|
| `/` | keep | Landing page — core entry point, out of this plan's DOCS-09 scope |
| `/brand-logo.html` | keep | D-01 executed this plan: fonts self-hosted, zero CDN refs, no longer V4-excluded |
| `/docs/` | keep | Docs home overview — sound, deepened by other 02-* plans |
| `/docs/quickstart/` | keep | Tutorial-first quickstart (DOCS-01) — deepened by a later 02-* plan |
| `/docs/guide/install/` | keep | Existing install guide — deepened by a later 02-* plan |
| `/docs/tools/` | keep | Tools overview — WR-01 link fixed this plan |
| `/docs/tools/blast-radius/` | keep | Distinct MCP tool surface |
| `/docs/tools/call-hierarchy/` | keep | Distinct MCP tool surface |
| `/docs/tools/document-symbols/` | keep | Distinct MCP tool surface |
| `/docs/tools/find-references/` | keep | Distinct MCP tool surface; WR-01's fixed link target |
| `/docs/tools/get-index-status/` | keep | Distinct MCP tool surface |
| `/docs/tools/go-to-definition/` | keep | Distinct MCP tool surface |
| `/docs/tools/search-code/` | keep | Distinct MCP tool surface |
| `/docs/tools/semantic-search/` | keep | Distinct MCP tool surface |
| `/docs/tools/type-hierarchy/` | keep | Distinct MCP tool surface |
| `/docs/cli/` | keep | CLI overview |
| `/docs/cli/index-cmd/` | keep | Distinct CLI command (`jarvis index`) |
| `/docs/cli/list/` | keep | Distinct CLI command (`jarvis list`) |
| `/docs/cli/status/` | keep | Distinct CLI command (`jarvis status`) |
| `/docs/cli/reindex/` | keep | Distinct CLI command (`jarvis reindex`) |
| `/docs/cli/forget/` | keep | Distinct CLI command (`jarvis forget`) |
| `/docs/cli/watch/` | keep | Distinct CLI command (`jarvis watch`) |
| `/docs/concepts/architecture/` | keep | Deepened this plan (D-02) — distinct concept, no other page covers the component map |
| `/docs/concepts/blast-radius/` | keep | Deepened this plan (D-02) — distinct concept, complements (not duplicates) the tool reference page |
| `/docs/concepts/scip/` | keep | Deepened this plan (D-02) — distinct concept, the SCIP/version-gate explainer |
| `/docs/concepts/semantic-search/` | keep | Deepened this plan (D-02) — distinct concept, complements (not duplicates) the tool reference page |
| `/docs/concepts/zoekt/` | keep | Deepened this plan (D-02) — distinct concept, the Zoekt search explainer |
| `/docs/integrations/` | keep | Integrations overview |
| `/docs/integrations/claude-code/` | keep | Distinct per-client install guide |
| `/docs/integrations/codex-cli/` | keep | Distinct per-client install guide |
| `/docs/integrations/cursor/` | keep | Distinct per-client install guide |
| `/docs/troubleshooting/` | keep | Decision-tree entry point |
| `/docs/troubleshooting/common-failures/` | keep | Distinct troubleshooting surface (D-13's two-page split: user-fixable) |
| `/docs/troubleshooting/upstream-issues/` | keep | Distinct troubleshooting surface (D-13's two-page split: not user-fixable) |

**Open questions for the user:** none — zero URLs were flagged as merge/retire candidates. All 34 pages map 1:1 to a distinct product surface; no reorganization is proposed.

## Decisions Made

- D-01 fully executed: brand-logo.html classified KEEP with fonts self-hosted (not retired, not left on CDN).
- D-02/D-03 fully executed: keep-all-deepen-in-place confirmed empirically across all 34 URLs — no redirects map entry was needed, matching 02-RESEARCH's prediction.
- D-04 implemented via the primary `template: splash` approach (no fallback to `src/pages/404.astro` was needed — the splash template held the table + nav body without issue).

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria for all three tasks passed on the first `npm run build && npm run verify` run per task.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The URL contract is settled ground truth: 34 keep, zero retires. Later 02-* plans can add new pages against this clean baseline without reorganization risk.
- The 404 page, brand-logo.html fonts, and WR-01 fix are all closed — no follow-up needed from this plan.
- Human check still pending (per the plan's own `<verify>` block): the interactive preview pass (`npm run preview`, visit a bogus URL under `/jarvis-index/docs/`) confirming the 404 lookup table, empty-state copy, and six group links render correctly inside the Starlight shell. This is deferred to the phase-gate human-check per 02-RESEARCH's sampling plan, not blocking for this plan's completion.
- Concept pages are deepened but their content will be cross-referenced by later plans building the tool reference pages (02-02/02-03) and the quickstart (02-06) — no conflicts expected since URLs and frontmatter contracts are unchanged.

---
*Phase: 02-docs-rebuild-tutorial-first-content*
*Completed: 2026-08-22*

## Self-Check: PASSED

All 15 claimed files verified present on disk; all 3 task commits (`9164c9e`, `295bba0`, `9b4ac76`) verified present in git log.
