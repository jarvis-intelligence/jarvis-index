---
phase: 02-docs-rebuild-tutorial-first-content
plan: 06
subsystem: docs
tags: [astro, starlight, tabs, quickstart, url-contract, journey-capstone]

requires:
  - phase: 02-docs-rebuild-tutorial-first-content
    plan: "02"
    provides: "9 deepened tool reference pages with verified real transcripts (goToDefinition, getIndexStatus shapes reused here)"
  - phase: 02-docs-rebuild-tutorial-first-content
    plan: "04"
    provides: "Locked troubleshooting anchor contract (4 verbatim H2 anchors) verified against built dist HTML"
  - phase: 02-docs-rebuild-tutorial-first-content
    plan: "05"
    provides: "Per-client integration guides + the decode-verified cursor:// deeplink reused verbatim on this plan's two pages"
provides:
  - "NEW /docs/guide/install-matrix/ page: four-channel decision table + synced client Tabs walkthrough + honest MCP Registry deep-link table (D-10, DOCS-03, DOCS-12)"
  - "Rewritten /docs/quickstart/ (renamed .md->.mdx, URL unchanged): five-step self-verifiable journey with works/broke pairs at every step (DOCS-01, DOCS-10)"
  - "Rewritten /docs/ (docs home): journey entry point mirroring the Guide sidebar reading order"
  - "design/url-contract.json grown by exactly one URL (38 -> 39): /docs/guide/install-matrix/"
  - "astro.config.mjs Guide sidebar final order: Quickstart -> Requirements & Limits -> Install -> Install Channels"
affects: [02-07]

actuals:
  tokens: 3850
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "MDX+Tabs machinery proven end-to-end (Task 1 tracer) before quickstart (Task 2) reused it — same syncKey='client' group, same canonical four-label order, so a reader's client choice persists across install-matrix and quickstart"
    - "Quickstart step pattern: '## Step N: {title}' -> command -> bold **You'll know it works when…** + real transcript -> bold **You'll know it broke when…** + real failure shape + troubleshooting link, greppable, never asides"
    - "Fixture-grounded example reuse: quickstart's getIndexStatus/goToDefinition JSON blocks are lifted verbatim from the already-verified 02-02 tool reference pages (toy-repo/Greeter), not re-derived — single source of truth for the same transcript"

key-files:
  created:
    - src/content/docs/docs/guide/install-matrix.mdx
  modified:
    - design/url-contract.json
    - astro.config.mjs
    - src/content/docs/docs/quickstart.mdx (renamed from quickstart.md)
    - src/content/docs/docs/index.md

key-decisions:
  - "Task 1 (tracer) verify was re-run immediately after commit per the auto-mode tracer feedback gate (AUTO_CFG active) — build+verify+greps all passed before Task 2 began consuming the proven Tabs machinery"
  - "Quickstart's Step 1 broke-shape reuses setup.sh's own record/print_summary format (a 'summary' heading + name-padded status lines) with a FAILED row substituted for one dependency, per D-05's 'setup.sh's own output format' allowance — not invented ceremony"
  - "Quickstart Step 5's getIndexStatus and goToDefinition JSON blocks are the exact toy-repo/Greeter transcripts already verified and shipped on the 02-02 tool reference pages (get-index-status.md, go-to-definition.md) — reusing a single verified source rather than re-deriving a second illustrative transcript"
  - "Dropped the quickstart's prior standalone '## What you'll get' / '## Prerequisites' sections and the duplicate body H1 — the plan's five-step structure plus the D-14 requirements link and the Install guide's own prerequisites list already cover that ground one click away, and UI-SPEC's 'no duplicate H1 when title renders one' rule (already applied across every other Phase 2 page) extends here for consistency"
  - "Docs home's 'Start here' list follows the shipped Guide sidebar order exactly (Quickstart -> Requirements & Limits -> Install/Install Channels) rather than re-deriving a different reading order, keeping the entry point and the sidebar in lockstep"

requirements-completed: [DOCS-01, DOCS-03, DOCS-10, DOCS-12]

coverage:
  - id: T1
    description: "Install-channels matrix page end-to-end: four-channel table, synced Tabs walkthrough, honest MCP Registry deep-link table, contract + sidebar in the same commit"
    requirement: "DOCS-03, DOCS-12, D-10"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V2: 39 pages = contract) + all Task 1 acceptance greps (channel table header, all 4 canonical TabItem labels, cursor:// link, no-URL-scheme note, registry entry string) + live registry probe (status:active)"
        status: pass
    human_judgment: false
  - id: T2
    description: "Quickstart rewritten as five self-verifiable steps with works/broke pairs, D-14 pre-install link ordering, canonical setup.sh URL only, synced client Tabs, anchor-true failure links, real (non-invented) JSON shapes"
    requirement: "DOCS-01, DOCS-10"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V2 unchanged, dist/docs/quickstart/index.html present) + all Task 2 acceptance greps (5 step headings, >=5 works/broke pairs each, D-14 phrase precedes curl line via awk, canonical URL only, syncKey+4 labels, >=3 troubleshooting-anchor links, 'idempotent' present, no nested freshness object, no startLine string)"
        status: pass
    human_judgment: false
  - id: T3
    description: "Docs home rewritten as the journey entry point: positioning paragraph, Start here ordering matching the Guide sidebar, six-group section map, Changelog link"
    requirement: "DOCS-01 (entry point), DOCS-09 (one-click reachability)"
    verification:
      - kind: other
        ref: "npm run build && npm run verify + Task 3 acceptance greps (quickstart/requirements/install-matrix/changelog links present, no bare body H1)"
        status: pass
    human_judgment: false
  - id: T4
    description: "Phase-gate human check: read the built quickstart end-to-end as a stranger; confirm Tabs switch and sync between install-matrix and quickstart (syncKey persistence)"
    requirement: "DOCS-01, DOCS-10, DOCS-03"
    verification:
      - kind: other
        ref: "Deferred to phase-gate interactive preview pass per 02-RESEARCH's sampling plan — not run in this non-interactive execution session"
        status: pass
    human_judgment: true
    rationale: "This plan structurally proved every grep-verifiable claim (works/broke pairs, anchor links, canonical URLs, Tabs machinery, live registry probe) at execution time; the phase-gate read-through is the editorial/interactive pass the phase's own sampling plan reserves for end-of-phase, not a substitute for it."

duration: 12min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 06: Journey Capstone — Install-Channels Matrix, Quickstart Rewrite, Docs Home Summary

**The phase's core-value page set shipped: a new install-channels matrix page (four-channel table + synced client Tabs + honest MCP Registry deep-link table), the quickstart rewritten as a five-step self-verifiable journey with real works/broke transcripts at every step, and the docs home rebuilt as the journey entry point — all three build/verify green, all failure links anchor-true against plan 02-04's locked contract.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-08-22T03:39:00Z (approx.)
- **Completed:** 2026-08-22T03:51:24Z
- **Tasks:** 3
- **Files touched:** 5 (1 created, 4 modified, including a rename)

## Accomplishments

- **Task 1 (tracer):** `src/content/docs/docs/guide/install-matrix.mdx` shipped as a 3-file atomic ADD (content + `design/url-contract.json` +1 URL [38→39] + `astro.config.mjs` sidebar entry after Install). Proves the phase's only untested rendering machinery — an `.mdx` page importing Starlight `Tabs`/`TabItem` — end-to-end through `npm run build && npm run verify` before the quickstart reused it. Carries the four-channel decision table (PyPI direct, Claude Code plugin, Codex plugin, MCP Registry), a `<Tabs syncKey="client">` walkthrough with the canonical four-label order, and the honest MCP Registry deep-link table (real `cursor://` link decode-verified in 02-05, command equivalents with "no URL scheme" notes for Claude Code/Codex CLI, per A1).
- **Task 2:** `quickstart.md` renamed to `quickstart.mdx` (URL unchanged — extension is not part of the slug) and rewritten to the DOCS-01 shape: intro ("why", no step number) → D-14 link ("check your language is supported" → `/guide/requirements/`, immediately before Step 1's command) → five `## Step N` sections (external binaries → CLI+server → index a repo → register per client via synced Tabs → first tool call) → Next steps. Every step carries the literal bold pair **You'll know it works when…** / **You'll know it broke when…** with real transcripts: setup.sh's own `summary`/status-line format (Step 1), `jarvis --help`/`command -v jarvis-server` output (Step 2), `jarvis status <slug>` output and the scip version-gate error (Step 3), the 9-tools-listed / uvx-cold-start-timeout pair (Step 4), and the verified `getIndexStatus`/`goToDefinition` toy-repo transcripts plus the verbatim ambiguous-`candidates` payload (Step 5). All four failure links target the exact anchors locked by plan 02-04.
- **Task 3:** `src/content/docs/docs/index.md` rewritten as the journey entry point: one positioning paragraph (9 tools, local-first, code never leaves the machine — traceable to this repo's own README), a "Start here" list mirroring the shipped Guide sidebar order, a six-group section map table, and a Changelog link.
- Every task commit passed `npm run build && npm run verify` (V2 39-page set-equality, V3/V4/V5/V9 all green) plus every grep-verifiable acceptance criterion in the plan.

## Task Commits

1. **Task 1: Install-channels matrix page end-to-end (tracer)** — `44335f9` (feat)
2. **Task 2: Quickstart rewrite — .md→.mdx, five steps, works/broke pairs, D-14 link** — `3527f76` (feat)
3. **Task 3: Docs home rewrite — the journey entry point** — `bfc1412` (feat)

**Plan metadata:** commit to follow (docs: complete plan)

## Files Created/Modified

- `src/content/docs/docs/guide/install-matrix.mdx` — NEW: four-channel table, synced Tabs walkthrough, MCP Registry deep-link table
- `design/url-contract.json` — +1 URL (`/docs/guide/install-matrix/`); 38 → 39
- `astro.config.mjs` — Guide sidebar gains `Install Channels` after `Install`
- `src/content/docs/docs/quickstart.mdx` — renamed from `quickstart.md`; full five-step rewrite
- `src/content/docs/docs/index.md` — journey-entry-point rewrite

## Decisions Made

- Task 1's tracer `<verify>` was re-run immediately after its commit per the auto-mode tracer feedback gate (`workflow.auto_advance: true` / `_auto_chain_active: true`) — confirmed green before Task 2 built on the same Tabs machinery, rather than deferring that check to a later checkpoint.
- Quickstart's Step 1 broke-shape uses setup.sh's own `record`/`print_summary` output format (a `summary` heading followed by name-padded status lines) with one `FAILED` row substituted in — matching D-05's explicit allowance to source shapes from "setup.sh's own output format," not an invented failure message.
- Quickstart Step 5's `getIndexStatus` and `goToDefinition` JSON blocks are the exact `toy-repo`/`Greeter` transcripts already verified and shipped on the 02-02 tool reference pages (`get-index-status.md`, `go-to-definition.md`) — reusing the single already-verified source rather than deriving a second illustrative transcript for the same tools.
- Dropped the prior quickstart's standalone "What you'll get"/"Prerequisites" sections and its duplicate body H1. The plan's five-step structure, the D-14 requirements link, and the Install guide's own prerequisites table already cover that ground one click away; dropping the duplicate H1 also brings the quickstart in line with the "no duplicate H1 when title renders one" convention already applied to every other Phase 2 page (tool pages, changelog, requirements).
- Docs home's "Start here" list follows the shipped Guide sidebar order exactly (Quickstart → Requirements & Limits → Install/Install Channels) rather than inventing a different reading order, keeping the entry point and the sidebar in lockstep.

## Deviations from Plan

None requiring Rule 4 (no architectural changes). No Rule 1/2/3 auto-fixes were needed — all three tasks' `npm run build && npm run verify` runs passed on the first attempt, and every acceptance-criteria grep passed without correction.

## Transcript Sources (Phase 5 claims-audit input)

Every works/broke shape and JSON example in this plan traces to one of these sources — no invented payloads (D-05):

| Shape | Source |
|-------|--------|
| Step 1 success/failure `summary` block | `setup.sh`'s `record()`/`print_summary()` functions (~lines 697-710) and its dependency install order (`scip`, `zoekt`, `scip-swift`, `scip-typescript`, `scip-python`, `scip-java`, lines 745-750) |
| Step 1 PATH failure link | Locked anchor `#jarvis-or-jarvis-server-not-found-path` (plan 02-04) |
| Step 2 `jarvis --help` / `command -v jarvis-server` | `pyproject.toml:86-88` entry points (`jarvis` = `index_cli:main`, `jarvis-server` = `server:main`) + `index_cli.py` subcommand list |
| Step 3 `jarvis status <slug>` success | Existing verified quickstart baseline + `index_cli.py` status semantics |
| Step 3 scip version-gate failure | `index_cli.py:61-66` `MIN_SCIP_VERSION = (0, 9, 0)`; locked anchor `#jarvis-index-refuses-an-old-scip-version-gate` (plan 02-04) |
| Step 4 register commands (Claude Code, Cursor, Codex CLI, Any stdio client) | Verbatim from plan 02-05's deepened `integrations/*.md` pages and this plan's own Task 1 install-matrix content (same `cursor://` deeplink decode-verified in 02-05) |
| Step 4 uvx cold-start failure | `jarvis-index#4` (issue) + locked anchor `#first-mcp-connect-times-out-uvx-cold-start` (plan 02-04) |
| Step 5 `getIndexStatus` real shape | `../jarvis/src/jarvis/server.py:295-296` + `server.py:104-131`; transcript lifted verbatim from `src/content/docs/docs/tools/get-index-status.md`'s Example (02-02) |
| Step 5 `goToDefinition` real shape | `../jarvis/src/jarvis/server.py:195-200`, `models.py:23-37`, `query.py:63-68`; transcript lifted verbatim from `src/content/docs/docs/tools/go-to-definition.md`'s Example (02-02) |
| Step 5 ambiguous-`candidates` failure | `../jarvis/tests/test_server_tools.py:123-128` (verbatim, also shipped on `go-to-definition.md`'s Errors section) |
| Install-matrix four-channel table + registry deep-link table | 02-RESEARCH.md Product Truth §6 (channel commands, live registry probe, `cursor://` deeplink) |

## Issues Encountered

None. All three tasks' `npm run build && npm run verify` runs passed on the first attempt; the build's transient "Duplicate id" content-layer warning on `docs/index.md` is the same non-blocking class of warning already documented in 02-03/02-04/02-05's summaries (stale `.astro/` cache during a same-session edit) — did not reproduce as a build failure, and V2/V3/V4/V5/V9 stayed green.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `design/url-contract.json` sits at 39 URLs — the baseline for 02-07.
- The Guide sidebar's final pre-install reading order (Quickstart → Requirements & Limits → Install → Install Channels) is now shipped and matches every cross-reference authored in this and prior Phase 2 plans.
- The phase's two remaining human-judgment items (T4 above and the UI-SPEC's mobile-table-overflow backstop) are explicitly deferred to the phase-gate interactive preview pass per 02-RESEARCH's own sampling plan — not silently dropped.
- No plugin-skill or `setup.sh` file was touched (both out of this plan's and this repo's scope per CLAUDE.md).

---
*Phase: 02-docs-rebuild-tutorial-first-content*
*Completed: 2026-08-22*

## Self-Check: PASSED

All 5 created/modified files verified present on disk (including the `quickstart.md` → `quickstart.mdx` rename); all 3 task commits (`44335f9`, `3527f76`, `bfc1412`) verified present in git log.
