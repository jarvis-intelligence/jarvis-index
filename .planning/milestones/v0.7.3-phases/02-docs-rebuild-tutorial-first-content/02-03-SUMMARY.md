---
phase: 02-docs-rebuild-tutorial-first-content
plan: 03
subsystem: docs
tags: [astro, starlight, url-contract, cli-reference, docs-content]

requires:
  - phase: 02-docs-rebuild-tutorial-first-content
    provides: "Plan 02-01's clean 34-URL classification baseline (keep x34, zero retires) and deepened concept pages"
provides:
  - "7-command CLI reference: jarvis index, list, status, reindex, forget, watch (deepened) plus NEW jarvis-server page"
  - "CLI overview rewritten as a 7-row one-click table distinguishing jarvis (indexer CLI) from jarvis-server (MCP server)"
  - "design/url-contract.json grown by exactly one URL (34 -> 35): /docs/cli/jarvis-server/"
  - "astro.config.mjs CLI sidebar entry for jarvis-server, placed after jarvis watch"
affects: [02-04, 02-06, 02-07]

actuals:
  tokens: 4600
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "3-file atomic ADD proven again for a CLI page: content + url-contract URL + sidebar entry, one commit, V2 green"
    - "No duplicate body H1 on CLI reference pages (title renders the H1) — applied while deepening in place, dropping the pre-existing H1s that predated this convention"

key-files:
  created:
    - src/content/docs/docs/cli/jarvis-server.md
  modified:
    - design/url-contract.json
    - astro.config.mjs
    - src/content/docs/docs/cli/index-cmd.md
    - src/content/docs/docs/cli/watch.md
    - src/content/docs/docs/cli/index.md
    - src/content/docs/docs/cli/list.md
    - src/content/docs/docs/cli/status.md
    - src/content/docs/docs/cli/reindex.md
    - src/content/docs/docs/cli/forget.md

key-decisions:
  - "RESEARCH Open Question 1 executed: jarvis-server gets its own dedicated /docs/cli/jarvis-server/ page (not a CLI-overview section) — it's the command every MCP client config names"
  - "index_cli.py has grown since 02-RESEARCH was written (now 1328 lines; argparse block moved to build_parser() at lines 1256-1318, not the cited 1118-1177) — re-verified every flag string directly against the current file rather than trusting the stale line citation; all five index flags, four watch flags, and the two console-script entry points matched byte-for-byte"
  - "watch.md links the quickstart's Optional-extras tip (not a not-yet-existing /guide/requirements/ page — that page ships in a later wave-3 plan, 02-04) to avoid a dead link"

patterns-established:
  - "CLI page deepen-in-place drops the pre-existing body H1 (index-cmd.md, watch.md, list.md, status.md, reindex.md, forget.md all had one; frontmatter title already renders it in Starlight)"

requirements-completed: [DOCS-05]

coverage:
  - id: D1
    description: "New jarvis-server.md page ships as a 3-file atomic ADD (content + url-contract + sidebar), reachable one click from the CLI sidebar group after jarvis watch"
    requirement: "DOCS-05"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V2: 35 pages = contract) + test -f dist/docs/cli/jarvis-server/index.html + grep -q '\"/docs/cli/jarvis-server/\"' design/url-contract.json + grep -q 'docs/cli/jarvis-server' astro.config.mjs + git show --name-only 3860d1a lists all three files"
        status: pass
    human_judgment: false
  - id: D2
    description: "jarvis-server.md documents the uvx launch string (jarvis-mcp>=0.6.0 floor intact) and a getIndexStatus verify step, linking Integrations for per-client registration"
    requirement: "DOCS-05"
    verification:
      - kind: other
        ref: "grep -q 'jarvis-mcp>=0.6.0' src/content/docs/docs/cli/jarvis-server.md && grep -q 'getIndexStatus' src/content/docs/docs/cli/jarvis-server.md"
        status: pass
    human_judgment: false
  - id: D3
    description: "jarvis index and jarvis watch pages deepened with every flag/default/choice re-verified verbatim against index_cli.py's current build_parser(), plus the scip 0.9.0 version-gate rationale, language tie-break order, persisted-options behavior, and search-only fallback ladder"
    requirement: "DOCS-05"
    verification:
      - kind: other
        ref: "npm run build && npm run verify + grep -q -- '--semantic-include'/'--slug'/'--scheme'/'--language'/'--search-only' index-cmd.md + grep -q 'typescript' + grep -q '0.9.0' + grep -q -- '--debounce' watch.md + grep -q '5.0' watch.md"
        status: pass
    human_judgment: false
  - id: D4
    description: "CLI overview (cli/index.md) rewritten as a 7-row one-click table linking all seven command pages, distinguishing jarvis from jarvis-server"
    requirement: "DOCS-05"
    verification:
      - kind: other
        ref: "grep -q '/cli/jarvis-server/' src/content/docs/docs/cli/index.md + 7 distinct /cli/[a-z-]+/ link targets counted"
        status: pass
    human_judgment: false
  - id: D5
    description: "The four no-flag commands (list, status, reindex, forget) deepened with explicit 'No flags.' statements, real output shapes, status values (indexed/failed/partial) documented as settled behavior, staleness distinguished from status, and forget's irreversibility stated as a one-sentence fact per the UI-SPEC copy contract"
    requirement: "DOCS-05"
    verification:
      - kind: other
        ref: "grep -q 'removes the index permanently' forget.md + grep -q 'partial'/'indexed' status.md + grep -q 'persisted' reindex.md + grep -l 'No flags.' on all four pages + no ':::' asides on any of the four + npm run build && npm run verify"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 03: CLI Reference Deepening Summary

**Full 7-command CLI reference (6 `jarvis` subcommands + a new dedicated `jarvis-server` page) with every flag, default, and status value re-verified against the current `index_cli.py`, plus a rewritten one-click CLI overview.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-22T10:20:00Z
- **Completed:** 2026-08-22T10:23:25Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- New `/docs/cli/jarvis-server/` page shipped as a 3-file atomic ADD (content + `design/url-contract.json` + `astro.config.mjs` sidebar entry) — the tracer task proved the page-ADD machinery still holds for Wave 2 (V2 grew cleanly from 34 to 35 pages).
- `jarvis index` and `jarvis watch` deepened with the full verified flag surface (`--slug`, `--scheme`, `--semantic-include`, `--language`, `--search-only`, `--debounce`), the scip 0.9.0 version-gate rationale, language-detection tie-break order, persisted-options behavior, and the auto-search-only fallback ladder.
- CLI overview (`cli/index.md`) rewritten as a 7-row one-click table covering all six `jarvis` subcommands plus `jarvis-server`, with a one-sentence distinction between the two entry points.
- The four no-flag commands (`list`, `status`, `reindex`, `forget`) deepened in place: explicit "No flags." statements, real TSV/status output shapes, the three settled `status` values (`indexed`/`failed`/`partial`), staleness distinguished from status with a cross-link to `getIndexStatus`, and `forget`'s irreversibility stated as fact in one sentence with no confirmation-UI framing.
- All pre-existing duplicate body H1s on the six deepened CLI pages dropped to match the phase's frontmatter-title-renders-H1 convention.

## Task Commits

Each task was committed atomically:

1. **Task 1: New jarvis-server page end-to-end — 3-file atomic ADD through contract and sidebar** — `3860d1a` (feat)
2. **Task 2: Deepen the flag-bearing pages — jarvis index, jarvis watch — and the CLI overview** — `530fa8a` (feat)
3. **Task 3: Deepen the four no-flag command pages — list, status, reindex, forget** — `e0b2815` (docs)

**Plan metadata:** commit to follow (docs: complete plan)

## Files Created/Modified

- `src/content/docs/docs/cli/jarvis-server.md` — NEW: usage, behavior (stdio MCP server entry point, `[project.scripts]` mapping), the exact `uvx --from jarvis-mcp>=0.6.0 jarvis-server` launch string, `getIndexStatus` verify step
- `design/url-contract.json` — `/docs/cli/jarvis-server/` added (34 → 35 URLs)
- `astro.config.mjs` — CLI sidebar entry `{ label: 'jarvis-server', link: 'docs/cli/jarvis-server' }` after `jarvis watch`
- `src/content/docs/docs/cli/index-cmd.md` — all five flags with verbatim help text, language tie-break order, scip 0.9.0 gate, search-only publishing, persisted options, atomic publish, worked example with `jarvis status` follow-up; body H1 dropped
- `src/content/docs/docs/cli/watch.md` — all four flags including `--debounce` (float, default 5.0), `[watch]` extra prerequisite, persisted-options reuse; body H1 dropped
- `src/content/docs/docs/cli/index.md` — rewritten as the 7-row one-click overview table
- `src/content/docs/docs/cli/list.md` — explicit "No flags.", real TSV output with status glyphs, cross-link to `jarvis status`; body H1 dropped
- `src/content/docs/docs/cli/status.md` — `indexed`/`failed`/`partial` status values, staleness vs. status distinction, cross-link to `getIndexStatus`; body H1 dropped
- `src/content/docs/docs/cli/reindex.md` — persisted-options reuse, "when to run it" guidance; body H1 dropped
- `src/content/docs/docs/cli/forget.md` — irreversibility stated as fact in one sentence, `zoekt.name` unpin behavior; body H1 dropped

## Decisions Made

- `jarvis-server` gets its own dedicated CLI page (RESEARCH Open Question 1's recommendation), not a CLI-overview section — it's the command every MCP client config names.
- `index_cli.py` has grown past the plan's cited line range (1118-1177 → the argparse block is now at 1256-1318 in a 1328-line file). Re-verified every flag string directly against the current source rather than trusting the stale citation; all five `index` flags, four `watch` flags, and both console-script entry points (`jarvis`, `jarvis-server`) matched byte-for-byte against the plan's verified table.
- `watch.md` links the quickstart's existing "Optional extras" tip for the `[watch]` extra rather than the not-yet-created `/guide/requirements/` page (that page ships in wave-3 plan 02-04) — avoids shipping a page that links to a URL that doesn't exist yet.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria for all three tasks passed on the first `npm run build && npm run verify` run per task.

## Issues Encountered

- Astro's content-layer cache emitted transient "Duplicate id" warnings on two of the three task builds (files edited mid-session while `.astro/` cache was stale). Confirmed non-blocking: a clean `rm -rf .astro && npm run build` after Task 2 reproduced only the pre-existing, unrelated `/404` route-priority warning — the duplicate-id warnings do not reproduce on a cold cache and did not affect V2/V3/V4/V5/V9 results (all green on every run).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 7 CLI commands are complete and one click from the CLI sidebar group; DOCS-05 is fully satisfied.
- `design/url-contract.json` sits at 35 URLs — the clean baseline for later 02-* plans (02-04's `guide/requirements.md` and `guide/install-matrix.mdx`, 02-05's `llms.txt`, 02-06's quickstart, 02-07) to add against without reorganization risk.
- `watch.md`'s link to the quickstart's Optional-extras tip should be revisited once 02-04 ships `/guide/requirements/` — not blocking, just a candidate follow-up link upgrade (noted here, not filed as a defect since the current link is valid and correct).
- Manual phase-gate item still pending per 02-RESEARCH's sampling plan: diff each Options table against `index_cli.py`'s current `build_parser()` — done in this plan's execution (see Decisions Made), but the phase-level closing pass should re-confirm no further drift before `/gsd-verify-work`.

---
*Phase: 02-docs-rebuild-tutorial-first-content*
*Completed: 2026-08-22*

## Self-Check: PASSED

All 10 claimed files verified present on disk; all 3 task commits (`3860d1a`, `530fa8a`, `e0b2815`) verified present in git log.
