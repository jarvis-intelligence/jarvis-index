---
phase: 01-site-foundation-identity
plan: 04
subsystem: ui
tags: [astro, starlight, theming, pagefind, dark-mode, search]

requires:
  - phase: 01-03
    provides: design/tokens.css identity layer with [data-theme='dark'] as the project-wide dark selector

provides:
  - Landing theme script re-keyed onto Starlight's storage key (starlight-theme) and data-theme attribute, applied pre-paint from <head>
  - Verified Pagefind local search index present and wired across the docs corpus (default Starlight behavior, no config change needed)

affects: [site-foundation-identity, docs-restructure]

actuals:
  tokens: 560
  tasks: 2
  commits: 1

tech-stack:
  added: []
  patterns:
    - "One storage key (starlight-theme), one attribute (data-theme) across landing + docs; anti-FOUC script lives in <head> as is:inline"

key-files:
  created: []
  modified:
    - src/pages/index.astro

key-decisions:
  - "Landing's inline theme script re-keyed from jarvis-theme to starlight-theme and moved (the initial-apply half) into <head> as is:inline for pre-paint application, matching Starlight's ThemeProvider semantics exactly (same key, same attribute, same prefers-color-scheme dark fallback)."
  - "Toggle click handler stays at its existing position at the end of body (button must exist in the DOM), now writing the shared starlight-theme key instead of a second key."
  - "Task 2 required zero code changes — Starlight's Pagefind integration is default-on and was already indexing the docs corpus correctly; the task's job was proving it against the built artifact, not implementing anything."

patterns-established:
  - "Anti-FOUC theme application always lives in a <head> is:inline script; toggle/interaction wiring can stay wherever the DOM elements it touches are guaranteed to exist."

requirements-completed: [SITE-08]

coverage:
  - id: D1
    description: "Landing theme script unified onto Starlight's storage key (starlight-theme) and data-theme attribute, with pre-paint anti-FOUC application in <head> and a prefers-color-scheme dark fallback; legacy jarvis-theme key fully removed"
    requirement: "SITE-08"
    verification:
      - kind: other
        ref: "npm run build && grep -c starlight-theme dist/index.html (>0) && grep -c jarvis-theme dist/index.html (=0) && grep data-theme dist/index.html && grep prefers-color-scheme dist/index.html — all pass"
        status: pass
    human_judgment: true
    rationale: "Automated source/build assertions all pass, but the plan's V6 cross-surface persistence check (toggle on /, reload, navigate to /docs/, toggle there, navigate back, reload both directions) requires a real browser session. No browser/CDP tool was available in this execution environment (argent MCP tools were not present in the session's tool list) to drive that interaction, so it was not performed and must be confirmed by a human or a future browser-equipped run."
  - id: D2
    description: "Pagefind local search index proven present across the built docs corpus and wired into the docs search UI, with zero external services"
    requirement: "SITE-08"
    verification:
      - kind: other
        ref: "npm run build && find dist/pagefind -name '*.js' (6 files) && find dist/pagefind -name '*.json' (1 file, plus 32 .pf_fragment files) && grep -qi search dist/docs/index.html && grep -q 'pagefind: false' astro.config.mjs (absent) — all pass"
        status: pass
    human_judgment: true
    rationale: "Index presence, asset counts, and search UI markup are all confirmed against the real build output (32 fragment files matching the docs page count is strong indirect evidence of multi-page indexing). The plan's interactive half of V5 (type a live query, confirm hits from multiple pages, click through) requires a browser and was not performed for the same reason as D1 — no browser tool was available in this session."

duration: ~10min
completed: 2026-08-21
status: complete
---

# Phase 1 Plan 4: Theme Unification & Pagefind Verification Summary

**Landing's dark-mode toggle re-keyed onto Starlight's own `starlight-theme`/`data-theme` contract (pre-paint, anti-FOUC), and Starlight's default-on Pagefind search index confirmed present and correctly wired across the docs corpus with zero code changes needed.**

## Performance

- **Duration:** ~10 min (approximate — start time not captured at session boundary; based on commit timestamps and task scope)
- **Completed:** 2026-08-21T11:20:39Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- One storage key (`starlight-theme`) and one attribute (`data-theme`) now govern dark mode on both `/` and `/docs/` — the landing's script is semantically identical to Starlight's `ThemeProvider`: same key, same fallback to `prefers-color-scheme: dark`, same attribute.
- The anti-FOUC half of the theme script now runs in `<head>` as `is:inline`, before first paint, so there is no external-fetch delay and no flash of the wrong theme on initial load.
- Zero occurrences of the legacy `jarvis-theme` key remain anywhere in the built landing page.
- Confirmed (via actual build inspection, not assumption) that Pagefind is default-on, un-disabled, and indexes the full docs corpus: 6 JS assets, 1 entry JSON, and 32 per-page `.pf_fragment` files matching the docs page count.
- Corrected a stale path assumption from the plan/research against this project's actual configuration: Pagefind's output lands at `dist/pagefind/` (relative to the Astro `base`), not `dist/docs/pagefind/` — see Deviations below. This matters for 01-05's permanent `verify-build.mjs` assertion (same wave, different files).

## Task Commits

Each task was committed atomically:

1. **Task 1: Unify the landing theme script onto Starlight's key and attribute** - `b063933` (feat)
2. **Task 2: Verify Pagefind local search across docs pages** - no commit; zero files required changes (search already worked by default — see Deviations)

**Plan metadata:** committed with this SUMMARY.

## Files Created/Modified

- `src/pages/index.astro` - Head now carries an `is:inline` anti-FOUC script that reads `starlight-theme` from `localStorage`, resolves `auto`/missing values via `prefers-color-scheme: dark`, and sets `data-theme` on `<html>` before first paint. The toggle click handler at the end of `<body>` was updated to write the same `starlight-theme` key (previously `jarvis-theme`).

## Decisions Made

- Split the original single inline script into two: a `<head>` script for pre-paint theme application (anti-FOUC, matches Starlight `ThemeProvider` exactly), and the existing end-of-body script retained only for the click handler and the copy-to-clipboard buttons (unrelated to theming, left untouched).
- Did not attempt to replicate Starlight's three-way (`light`/`dark`/`auto`) `ThemeSelect` UI on the landing — the landing's binary toggle button still only ever writes `light` or `dark`, which is compatible with (a subset of) Starlight's value vocabulary for the shared key. No behavior change to the toggle's visible interaction was requested or made.
- Task 2 made no file changes. Per the plan's own instruction ("no file should need changing when green; treat any required change as a fix-forward with the reason recorded"), the task was pure verification against `dist/`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1-adjacent — verify-command path mismatch, not a code bug] Plan's Task 2 automated verify checks the wrong directory for this project's configuration**
- **Found during:** Task 2 (Verify Pagefind local search)
- **Issue:** The plan's `<verify><automated>` command asserts `test -d dist/docs/pagefind`. In this project, Starlight is mounted at `base: '/jarvis-index'` with docs content nested under a `/docs/` sub-route (`src/content/docs/docs/**`), but Pagefind's own output directory is emitted relative to the Astro `base`, i.e. at `dist/pagefind/` — NOT nested under `dist/docs/`. This is a structural fact of how Starlight's bundled Pagefind integration resolves its output path in this specific mount configuration (verified directly against the real build), not a misconfiguration introduced by this plan.
- **Fix:** No code fix was needed or applied — nothing is broken. I re-ran the verification against the actual, correct path (`dist/pagefind/`) and confirmed: `dist/pagefind/*.js` (6 files: `pagefind.js`, `pagefind-ui.js`, `pagefind-modular-ui.js`, `pagefind-component-ui.js`, `pagefind-highlight.js`, `pagefind-worker.js`), `dist/pagefind/pagefind-entry.json` (1 file), and `dist/pagefind/fragment/*.pf_fragment` (32 files, one per indexed docs page). Search UI markup (`<site-search>`, `data-open-modal`, `#starlight__search` dialog) is present in `dist/docs/index.html`. `astro.config.mjs` contains no `pagefind: false`.
- **Files modified:** None — verification-only; no source change was warranted.
- **Verification:** Manually re-ran the corrected path assertions (above) against `npm run build` output; all pass.
- **Follow-up for 01-05:** the permanent `verify-build.mjs` pagefind-presence assertion (V5) that 01-05 is adding to the same wave should check `dist/pagefind/` rather than `dist/docs/pagefind/`, or derive the path from the configured Astro `base` so it stays correct if the mount ever changes. Recorded in the broken-windows ledger as a `deviation` entry so this is visible before 01-05 lands its check.

**2. [Rule 3 - Blocking, tooling] `requirements mark-complete` could not flip SITE-08 automatically**
- **Found during:** state-update step (post-Task 2)
- **Issue:** `gsd-tools query requirements.mark-complete SITE-08` reported `not_found`. Root cause: REQUIREMENTS.md's traceability table uses the status word `Planned` for every row (SITE-01 through DOCS-10+), but the tool's mark-complete logic only transitions a row out of `Pending` or `Gaps Found` — `Planned` is not in its recognized "not yet complete" vocabulary, so the write is rejected and (per the tool's own consistency rule) an already-flipped checkbox gets rolled back to avoid the checkbox and table diverging. This is a systemic, pre-existing convention mismatch between this project's REQUIREMENTS.md (authored with `Planned`) and gsd-tools (which expects `Pending`) — it is not something this plan introduced, and SITE-01 through SITE-07 show the same still-unchecked `[ ]` boxes, suggesting prior plans (01-01/01-02/01-03) hit the identical silent `not_found` and did not correct it.
- **Fix:** Manually applied the exact edit `mark-complete` would have made, scoped to only this plan's requirement: `- [ ] **SITE-08**` → `- [x] **SITE-08**` and the traceability row `| SITE-08 | Phase 1 | Planned |` → `| SITE-08 | Phase 1 | Complete |`. Did NOT touch SITE-01..SITE-07 or any DOCS-* row — reconciling the wider `Planned`-vs-`Pending` vocabulary mismatch across the whole file is out of this plan's scope and belongs to whoever owns REQUIREMENTS.md conventions (or a gsd-tools fix to also accept `Planned` as a valid pre-complete state).
- **Files modified:** `.planning/REQUIREMENTS.md` (2 lines: checkbox + traceability Status cell, SITE-08 only)
- **Verification:** Re-read the file; both surfaces now read consistently as complete for SITE-08 only, all other rows untouched.
- **Committed in:** final docs commit (this SUMMARY's accompanying commit)

---

**Total deviations:** 2 (1 verify-path correction, 1 blocking tooling workaround)
**Impact on plan:** No scope creep — the search-path correction changes no code, and the requirements-tracking workaround touches exactly the one row this plan owns. The underlying SITE-08 requirement was already satisfied by Starlight's default behavior; both deviations are documentation/tracking corrections, not implementation changes.

## Issues Encountered

- No browser or CDP-capable tool was available in this execution session (no `mcp__argent__*` tools were present in the session's tool list) to perform the two manual/interactive checks the plan calls for: V6 (theme persistence across `/` ↔ `/docs/` in both directions, checked by toggling and reloading in a real browser) and the interactive half of V5 (typing a live search query and confirming multi-page hits). Both are flagged in the `coverage` block above (`human_judgment: true`) and recorded in the broken-windows ledger as `unrun-verify` entries rather than being silently skipped or falsely marked as performed. Strong indirect/automated evidence supports both (identical key/attribute mechanics to Starlight's own already-working toggle; 32 indexed fragments matching the docs page count) but a human (or a future browser-equipped session) should perform the actual interaction before this is fully closed out.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SITE-08's mechanism half (unified theme key/attribute, verified-present search index) is complete and committed.
- Two manual browser checks remain open (see Issues Encountered / broken-windows ledger) and should be picked up either by a human during end-of-phase verification (`human_verify_mode: end-of-phase` per project config) or by 01-05/verify-work if a browser instrument becomes available.
- 01-05 should use `dist/pagefind/` (not `dist/docs/pagefind/`) when it adds the permanent Pagefind-presence assertion to `scripts/verify-build.mjs`.

---
*Phase: 01-site-foundation-identity*
*Completed: 2026-08-21*

## Self-Check: PASSED

- FOUND: `.planning/phases/01-site-foundation-identity/01-04-SUMMARY.md`
- FOUND: commit `b063933` (Task 1)
