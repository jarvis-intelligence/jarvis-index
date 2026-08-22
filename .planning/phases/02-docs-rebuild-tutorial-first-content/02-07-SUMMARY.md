---
phase: 02-docs-rebuild-tutorial-first-content
plan: 07
subsystem: docs
tags: [llms-txt, verify-build, tdd, url-contract, phase-capstone]

requires:
  - phase: 02-docs-rebuild-tutorial-first-content
    plan: "01"
    provides: "39-URL contract baseline this plan's V10 dimension and llms.txt read from (unchanged)"
  - phase: 02-docs-rebuild-tutorial-first-content
    plan: "06"
    provides: "Final stabilized page set (39 URLs incl. install-matrix) — the last content plan before this strictly-last index"
provides:
  - "public/llms.txt — agent-consumable docs index per llmstxt.org (H1, blockquote, ## sections, contract-derived absolute links)"
  - "V10 dimension in scripts/verify-build.mjs — permanent guard: file existence, H1+blockquote shape, every link on contract origin AND contract-enumerated path"
affects: []

actuals:
  tokens: 2323
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "TDD gate sequence on a build-assertion script itself (not application code): test(02-07) commit lands the V10 dimension failing (file absent) before feat(02-07) lands the file — same RED-then-GREEN discipline Phase 1's 01-05 applied to V2-V5/V9"
    - "llms.txt sections mirror the Starlight sidebar groups verbatim (Getting started/MCP Tools/CLI/Concepts/Integrations/Troubleshooting/Optional) so the agent index and the human nav stay in lockstep without a second source of truth"
    - "Link descriptions lifted verbatim from each page's own frontmatter `description` field — zero re-authored prose, zero drift risk"

key-files:
  created:
    - public/llms.txt
  modified:
    - scripts/verify-build.mjs

key-decisions:
  - "V10 placed after the V9 block per the plan's naming instruction (V2..V9 taken by history); reuses the already-parsed `contract` object and the existing `fail()` helper — zero new imports, matching the file's zero-dep style"
  - "llms.txt link origin is asserted against `contract.origin` (never a hardcoded hostname) so the guard and the content share the same source of truth as V2's page-set check"
  - "Docs home (`/docs/`) included as its own 'Getting started' entry alongside Quickstart/Requirements/Install/Install Channels — the plan requires every /docs/ contract URL to appear exactly once, and the home page is one of the 37 /docs/-prefixed contract URLs"
  - "`/` (landing) and `/brand-logo.html` deliberately excluded — plan explicitly scopes llms.txt to /docs/ URLs only; both are non-doc, non-agent-relevant surfaces"
  - "Changelog placed under a closing `## Optional` section (llmstxt.org convention for skippable entries) rather than mixed into 'Getting started' — it's reference material, not part of the install/first-call journey"

requirements-completed: [DOCS-11]

coverage:
  - id: T1
    description: "RED gate: V10 dimension added to verify-build.mjs, committed failing before public/llms.txt exists"
    requirement: "DOCS-11"
    verification:
      - kind: other
        ref: "npm run build && node scripts/verify-build.mjs exited 1 naming only 'V10: dist/llms.txt not found' (no other dimension in the failure output); git diff HEAD~1 --name-only excluded design/url-contract.json; commit 2c6af8f"
        status: pass
    human_judgment: false
  - id: T2
    description: "GREEN gate: public/llms.txt authored per llmstxt.org shape, every /docs/ contract URL present exactly once, verify green including V10"
    requirement: "DOCS-11"
    verification:
      - kind: other
        ref: "npm run build && npm run verify exited 0 with 'V10 (llms.txt)' in the ok line; all 37 /docs/ contract URLs matched via grep -qF \"$url)\" public/llms.txt with zero duplicates (python re count); design/url-contract.json untouched (no 'llms' string, no diff); git log confirms test(02-07) (2c6af8f) precedes feat(02-07) (7c25b1a)"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 07: llms.txt Agent Index + Its Standing Build Assertion Summary

**Shipped the phase's final, strictly-last deliverable: `public/llms.txt` (an llmstxt.org-shaped agent index covering all 37 `/docs/` contract URLs, sections mirroring the Starlight sidebar) plus a permanent `V10` dimension in `scripts/verify-build.mjs` that guards its existence, shape, and link-origin/path integrity — landed RED (file absent, assertion failing) in its own commit before GREEN (file present, full verify green).**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2
- **Files touched:** 2 (1 created, 1 modified)

## Accomplishments

- **Task 1 (RED):** Added the `V10` dimension to `scripts/verify-build.mjs`, placed after the existing V9 block, reusing the file's `fail()` helper and already-parsed `contract` object (zero new imports). Checks: `dist/llms.txt` exists; line 1 is an H1 (`^# `); a blockquote (`^> `) appears in the first 4 lines; every markdown link's URL starts with `contract.origin` and its origin-stripped path is a member of `contract.urls`. Ran `npm run build && node scripts/verify-build.mjs`: it failed with exactly `V10: dist/llms.txt not found` — no other dimension regressed. Committed failing as `test(02-07)`.
- **Task 2 (GREEN):** Hand-authored `public/llms.txt`: `# jarvis` H1, a positioning blockquote, then `##` sections mirroring the six Starlight sidebar groups (Getting started, MCP Tools, CLI, Concepts, Integrations, Troubleshooting) plus a closing `## Optional` section for the Changelog. Every entry is `[Title](absolute contract-origin URL): description`, with descriptions copied verbatim from each page's own frontmatter `description` field — no re-authored prose. All 37 `/docs/` contract URLs appear exactly once; `/` and `/brand-logo.html` are deliberately excluded (plan scope). `npm run build && npm run verify` went green with `V10 (llms.txt)` in the ok summary line. Committed as `feat(02-07)`. No refactor gate was needed — the V10 implementation needed no cleanup.

## Task Commits

1. **Task 1 (RED): V10 dimension, committed failing** — `2c6af8f` (test)
2. **Task 2 (GREEN): public/llms.txt authored, verify green** — `7c25b1a` (feat)

**Plan metadata:** commit to follow (docs: complete plan)

## Files Created/Modified

- `scripts/verify-build.mjs` — +V10 dimension (existence, H1+blockquote shape, link origin+path guard against `design/url-contract.json`); final ok line now lists V10
- `public/llms.txt` — NEW: 61-line llmstxt.org-shaped index, 37 links, one per `/docs/` contract URL

## Decisions Made

- V10 sequenced immediately after V9 in both the header comment and the assertion body, matching the plan's explicit naming instruction (V2..V9 already taken by Phase 1 history).
- The assertion derives the origin exclusively from `contract.origin` — never a hardcoded hostname — keeping the spoofing guard (T-02-13) anchored to the same single source of truth V2 already uses for the page-set check.
- Docs home (`/docs/`) is included as its own "Getting started" entry: the plan's must-have ("every `/docs/` URL in the contract appears exactly once") counts it as one of the 37 `/docs/`-prefixed URLs, so it needed a link like every other page.
- Changelog was placed under a trailing `## Optional` section per the llmstxt.org convention for skippable/reference entries, rather than folded into "Getting started" — it documents release history, not the install/first-call journey.
- No third-party generator, no new package: the file was hand-authored directly against `design/url-contract.json` and each page's frontmatter, matching the plan's zero-dep constraint and the project's no-sync-mechanism decision.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' `npm run build && npm run verify` runs passed on the intended attempt (RED failed for the intended single reason; GREEN passed fully), and every acceptance-criteria check (grep-per-URL loop, duplicate-count check, contract-untouched check, commit-order check) passed without correction.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Phase Completion

This is the last plan (02-07) in Phase 2 — Docs Rebuild — Tutorial-First Content. All 7 plans (02-01 through 02-07) are now complete:

- 02-01: Page classification audit + brand-logo.html font self-hosting (D-01, WR-01)
- 02-02: 9 tool reference pages deepened with verified transcripts
- 02-03: CLI reference (7 commands)
- 02-04: Requirements & limits page + troubleshooting deepening
- 02-05: Per-client install guides + generic stdio page
- 02-06: Install-channels matrix + quickstart rewrite + docs home (journey capstone)
- 02-07: `llms.txt` agent index + its standing V10 build assertion (this plan)

`design/url-contract.json` remains at 39 URLs (unchanged by this plan, as required — Pitfall 4). `scripts/verify-build.mjs` now carries six permanent dimensions (V2/V3/V4/V5/V9/V10), all green.

## Next Phase Readiness

- DOCS-11 is the last Phase 2 requirement to close; DOCS-09 (additive-rebuild classification/nav-reachability) remains the one requirement still tracked `Planned` in `.planning/REQUIREMENTS.md` — pre-existing gap noted by prior plans in this phase, out of this plan's scope.
- Phase 3 (landing-page identity/content rebuild) and Phase 4 (plugin skills realignment) can proceed against a fully stabilized, agent-indexed docs surface.

---
*Phase: 02-docs-rebuild-tutorial-first-content*
*Completed: 2026-08-22*

## Self-Check: PASSED

Both created/modified files verified present on disk (`scripts/verify-build.mjs`, `public/llms.txt`); both task commits (`2c6af8f`, `7c25b1a`) verified present in git log.
