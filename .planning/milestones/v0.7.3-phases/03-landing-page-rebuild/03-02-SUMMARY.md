---
phase: 03-landing-page-rebuild
plan: 02
subsystem: landing
tags: [astro, css, json, markdown]

# Dependency graph
requires:
  - phase: 03-01
    provides: design/tokens.css, landing.css class stubs (.demo-panel, .demo-step, .demo-nav, .gate-chip), index.astro with placeholder sections, InstallWidget.astro, Badges.astro
provides:
  - src/data/demo-scenarios.json with verbatim Phase-2 fixture JSON for 3 scenarios
  - DemoPanel.astro with click-through stepper, arrow-key roving tabindex, terminal-chrome JSON display
  - ToolShowcase.astro with 9-card grid, 2 gate chips with deep-links to requirements.md anchors
  - LanguageMatrix.astro with 14-row compact table mirroring requirements.md
  - index.astro filled demo/tools/languages/privacy sections
  - requirements.md semanticSearch anchor section (#semanticsearch-requires-the-semantic-extra)
affects: 03-03 (architecture diagrams use remaining placeholder), 03-04 (mobile responsive polish)

actuals:
  tokens: 4316
  tasks: 2
  commits: 2

tech-stack:
  added:
  patterns:

key-files:
  created:
    - src/data/demo-scenarios.json
    - src/components/landing/DemoPanel.astro
    - src/components/landing/ToolShowcase.astro
    - src/components/landing/LanguageMatrix.astro
  modified:
    - src/pages/index.astro
    - src/styles/landing.css
    - src/content/docs/docs/guide/requirements.md

key-decisions:
  - "Demo stepper uses aria-hidden + display toggle (not data-active attribute) — simpler, ARIA-correct"
  - "Gate chips are <a> elements (not <span>) so the entire chip is clickable and deep-links to requirements.md"
  - "Privacy section uses 3x .note callout boxes for zero-telemetry/zero-cloud/zero-network — clear visual rhythm"
  - "Demo exchange-head shows the actual MCP tool name per scenario (getIndexStatus/goToDefinition/findReferences)"
  - "semanticSearch anchor heading placed before 'Language detection' per plan spec"

requirements-completed: [LNDG-02, LNDG-03, LNDG-04, LNDG-07]

coverage:
  - id: D1
    description: "Demo panel with 3 scenarios using verbatim Phase-2 fixture JSON (getIndexStatus, goToDefinition, findReferences)"
    requirement: LNDG-07
    verification:
      - kind: automated
        ref: "grep -Fc '"index-status"' src/data/demo-scenarios.json returns 1; same for go-to-definition and find-references; npm run build exits 0; verify-build V2-V10 pass"
        status: pass
    human_judgment: false
  - id: D2
    description: "9-tool tiered showcase with gate chips on semanticSearch and typeHierarchy, exact gating text, deep-links to requirements.md"
    requirement: LNDG-02
    verification:
      - kind: automated
        ref: "grep -o 'gate-chip' dist/index.html | wc -l returns 2; grep -o 'semantic' dist/index.html | wc -l >= 1; grep -o 'fork-built scip' dist/index.html | wc -l >= 1; build + verify-build pass"
        status: pass
    human_judgment: false
  - id: D3
    description: "Language matrix with 14 data rows mirroring requirements.md verbatim, caveat deep-links to 4 anchors"
    requirement: LNDG-03
    verification:
      - kind: automated
        ref: "grep -o 'TypeScript / TSX' dist/index.html | wc -l >= 1; grep -o 'SQL<' dist/index.html | wc -l >= 1; grep -o 'androidgradle-no-scip-support' dist/index.html | wc -l >= 1; build + verify-build pass"
        status: pass
    human_judgment: false
  - id: D4
    description: "Privacy section with 'Nothing leaves your machine' zero-network positioning"
    requirement: LNDG-04
    verification:
      - kind: automated
        ref: "grep -o 'Nothing leaves' dist/index.html | wc -l >= 1; build + verify-build pass"
        status: pass
    human_judgment: false
  - id: D5
    description: "semanticSearch anchor added to requirements.md for gate chip deep-link target"
    requirement: LNDG-02
    verification:
      - kind: automated
        ref: "grep -c 'semanticSearch-requires-the-semantic-extra' src/content/docs/docs/guide/requirements.md returns 1; grep -c 'Language detection' src/content/docs/docs/guide/requirements.md returns 1 (anchor is before it)"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-08-22
status: complete
---

# Phase 03 Plan 02: Demo Panel, Tiered 9-Tool Showcase, Language Matrix, Privacy Section Summary

**Click-through demo panel with verbatim fixture JSON, honestly tiered 9-tool card grid with gate chips, 14-row language matrix mirroring requirements.md, and local-first privacy section.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-22T18:15:08Z
- **Completed:** 2026-08-22T18:27:34Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created demo-scenarios.json with 3 real fixture transcripts (getIndexStatus, goToDefinition, findReferences) copied verbatim from Phase-2 docs
- Built DemoPanel.astro: 3-step click-through stepper with terminal-chrome exchange styling, arrow-key roving tabindex, prev/next with disabled states
- Built ToolShowcase.astro: 9-card grid (7 plain + 2 gated), gate chips as clickable <a> elements with exact gating text and deep-links to requirements.md
- Built LanguageMatrix.astro: 14-row compact table in .table-wrap, 3 columns, caveat links to 4 requirements.md anchors
- Filled all 4 placeholder sections in index.astro (demo, tools, languages, privacy)
- Added semanticSearch anchor section to requirements.md for the gate chip deep-link target
- Expanded landing.css demo-panel styles: step-indicator pills, disabled button states, counter

## Task Commits

1. **Task 1: Simulated demo panel with real recorded JSON shapes** - `5a3f8f5` (feat)
2. **Task 2: Tiered 9-tool showcase, language matrix, privacy section** - `5212505` (feat)

## Files Created/Modified
- `src/data/demo-scenarios.json` — 3 scenario objects with verbatim Phase-2 fixture JSON (NEW)
- `src/components/landing/DemoPanel.astro` — Click-through stepper with terminal-chrome JSON display (NEW)
- `src/components/landing/ToolShowcase.astro` — 9-card grid with 2 gate chips (NEW)
- `src/components/landing/LanguageMatrix.astro` — 14-row compact table (NEW)
- `src/pages/index.astro` — Filled demo/tools/languages/privacy sections, added component imports
- `src/styles/landing.css` — Expanded demo-panel CSS (step buttons, disabled states, counter)
- `src/content/docs/docs/guide/requirements.md` — Added semanticSearch anchor section

## Decisions Made
- Demo stepper uses aria-hidden + display toggle instead of data-active attribute — simpler and ARIA-correct
- Gate chips are <a> elements (not <span>) so the entire chip is clickable, linking to requirements.md anchors
- Privacy section uses 3x .note callout boxes for zero-telemetry / zero-cloud / zero-network — clear visual rhythm without needing inline SVG icons
- Demo exchange-head shows the actual MCP tool name per scenario (getIndexStatus / goToDefinition / findReferences)
- semanticSearch anchor heading placed before 'Language detection' per plan spec

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Astro/esbuild build error on `undefined` attribute value**
- **Found during:** Task 1 (DemoPanel.astro creation)
- **Issue:** `data-active={i === 0 ? '' : undefined}` caused esbuild parse error: `Expected "}" but found ")"`
- **Fix:** Removed the `data-active` attribute entirely; visibility is controlled by `aria-hidden` + `display: none/block` which is both simpler and more ARIA-correct
- **Files modified:** src/components/landing/DemoPanel.astro
- **Verification:** `npm run build` exits 0 after fix
- **Committed in:** 5a3f8f5 (Task 1 commit)

**2. [Rule 1 - Bug] Duplicate CSS blocks after edit collision**
- **Found during:** Task 1 (landing.css demo-panel section expansion)
- **Issue:** Edit inserted new demo-panel CSS but failed to remove the old stub block, resulting in duplicate `.demo-panel`, `.demo-step`, `.demo-nav`, and `.demo-nav button` rules
- **Fix:** Manually deleted the duplicate block (old stub lines)
- **Files modified:** src/styles/landing.css
- **Verification:** No duplicate class definitions; build succeeds
- **Committed in:** 5a3f8f5 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- `data-active` attribute in Astro template is not esbuild-safe — `undefined` causes a parse error. Lesson: use `aria-hidden` for visibility toggling in Astro templates, not custom data attributes with `undefined` values.

## Next Phase Readiness
- Architecture section (#architecture) remains a placeholder for 03-03 (diagrams)
- All content sections now have real components; only diagrams + final polish remain
- All 9 tool cards, language matrix, and privacy prose are structurally complete
- Gate chip deep-links resolve to the new semanticSearch anchor and existing Swift anchor in requirements.md

---
*Phase: 03-landing-page-rebuild*
*Completed: 2026-08-22*