---
phase: 03-landing-page-rebuild
plan: 03-03
subsystem: ui
tags: [astro, svg, css, diagrams, mobile, a11y, tokens]

# Dependency graph
requires:
  - phase: 03-landing-page-rebuild
    provides: all landing sections with content, all components except Diagrams.astro
provides:
  - Two dark-mode-safe inline SVG architecture diagrams (jarvis-layers, jarvis-index-pipeline)
  - Three diagram semantic color tokens (--jv-diagram-green, --jv-diagram-red, --jv-diagram-amber) in both themes
  - Mobile responsiveness fixes (contained scroll regions, no page-level horizontal overflow)
  - Structural verification: all grep gates pass, build + verify-build V1-V10 green
affects: [phase-5-launch-verification]

# Actuals (#2632)
actuals:
  tokens: 4204
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Diagram SVGs hand-adapted from .dot sources, colors via CSS class references to --jv-* tokens"
    - "Diagram semantic CSS classes (.cluster-runtime, .cluster-index, .cluster-storage, .node-ok, .node-fail, .flow-fail, .diamond)"
    - "Contained scroll regions with -webkit-overflow-scrolling: touch for mobile"

key-files:
  created:
    - src/components/landing/Diagrams.astro
  modified:
    - design/tokens.css
    - src/styles/landing.css
    - src/pages/index.astro

key-decisions:
  - "SVG viewBox dimensions hand-composed from .dot structure (not graphviz output) to ensure CSS-class-only coloring"
  - "Pipeline diagram uses class-based edges (flow, flow-index, flow-fail) instead of inline color attributes"
  - "Dark-mode diagram tokens are brighter variants (4ade80, f87171, fbbf24) for adequate contrast on #040506 bg"
  - "Install widget tabs get overflow-x: auto with hidden scrollbar for 390px containment"

patterns-established:
  - "Diagram semantic color classes in landing.css referencing --jv-diagram-* tokens"
  - "Source-attribution comments on hand-adapted SVGs pointing to .dot files"

requirements-completed: [LNDG-06, LNDG-09]

# Coverage metadata
coverage:
  - id: D1
    description: "Two inline SVG architecture diagrams (jarvis-layers 7-layer, jarvis-index-pipeline) with token-driven dark-mode-safe colors"
    requirement: LNDG-09
    verification:
      - kind: other
        ref: "grep -c 'fill=\"#[0-9a-fA-F]' src/components/landing/Diagrams.astro returns 0"
        status: pass
      - kind: other
        ref: "grep -c 'role=\"img\"' src/components/landing/Diagrams.astro returns 2"
        status: pass
      - kind: other
        ref: "grep -c '--jv-diagram-' design/tokens.css returns 6"
        status: pass
      - kind: other
        ref: "npm run build exits 0, verify-build V1-V10 pass"
        status: pass
    human_judgment: false
  - id: D2
    description: "Mobile responsiveness: no page-level horizontal scroll at 390px, contained scroll regions for matrix and diagrams"
    requirement: LNDG-06
    verification:
      - kind: other
        ref: "grep -rc 'overflow-x.*auto' src/styles/landing.css returns 5"
        status: pass
      - kind: other
        ref: "grep -c 'prefers-reduced-motion' src/styles/landing.css returns 1"
        status: pass
    human_judgment: true
    rationale: "CSS structural assertions confirm containment; real-Chrome 390px visual verification deferred to orchestrator"
  - id: D3
    description: "Accessibility: role=tablist/tabpanel, aria-selected, aria-label on interactive elements"
    requirement: LNDG-06
    verification:
      - kind: other
        ref: "grep -c 'role=\"tablist\"' dist/index.html returns 3; grep -c 'aria-selected' returns 4; grep -c 'aria-label' returns 9"
        status: pass
    human_judgment: true
    rationale: "Structural a11y attributes verified via grep; real screen reader / keyboard nav testing deferred to orchestrator"
  - id: D4
    description: "Label sync: install widget channel labels identical in landing and quickstart"
    requirement: LNDG-10
    verification:
      - kind: other
        ref: "grep -oF 'Installer + uv' dist/index.html == grep -oF 'Installer + uv' dist/docs/quickstart/index.html"
        status: pass
    human_judgment: true
    rationale: "String equality verified in built output; runtime browser sync (hero to quickstart tab switch) deferred to orchestrator"

# Metrics
duration: 12min
completed: 2026-08-22
status: complete
---

# Phase 3 Plan 03: Architecture Diagrams, Mobile Responsiveness, Structural Verification Summary

**Two dark-mode-safe inline SVG architecture diagrams hand-adapted from .dot sources, with diagram semantic color tokens and mobile responsiveness fixes**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-22T18:33:55Z
- **Completed:** 2026-08-22T18:46:36Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Two architecture diagrams (jarvis-layers 7-layer, jarvis-index-pipeline with failure semantics) as inline SVGs using CSS class-driven coloring — zero hardcoded hex
- Three diagram semantic color tokens (--jv-diagram-green/red/amber) with tuned dark-mode variants
- Mobile responsiveness: contained scroll regions on install widget tabs, diagram wraps, and table wraps
- Full structural verification: all grep gates pass, build + verify-build V1-V10 green

## Task Commits

Each task was committed atomically:

1. **Task 1: Dark-mode-safe architecture diagrams from .dot sources** - `cf26745` (feat)
2. **Task 2: Mobile responsiveness pass and structural verification** - `b724589` (style)

## Files Created/Modified
- `src/components/landing/Diagrams.astro` - Two inline SVG diagrams hand-adapted from jarvis-layers.dot and jarvis-index-pipeline.dot
- `design/tokens.css` - Added --jv-diagram-green, --jv-diagram-red, --jv-diagram-amber tokens (both light and dark themes)
- `src/styles/landing.css` - Added diagram semantic CSS classes (cluster-runtime/index/storage, node-ok/fail, flow-fail/index, diamond, label-runtime/index/storage); mobile overflow-x auto on install-widget-tabs, table-wrap, diagram-wrap
- `src/pages/index.astro` - Imported Diagrams component, filled architecture placeholder section with heading + lede + Diagrams

## Decisions Made
- SVG viewBox dimensions hand-composed from .dot structure rather than using graphviz `dot -Tsvg` output — ensures CSS-class-only coloring without any hardcoded hex leakage
- Pipeline diagram uses dedicated .flow-fail and .flow-index CSS classes for semantic edge colors instead of inline color attributes
- Dark-mode diagram tokens use brighter variants (4ade80, f87171, fbbf24) for adequate contrast against #040506 background
- Preflight cluster in pipeline diagram uses existing .box class (neutral) since it's neither runtime nor indexing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Accidentally replaced LanguageMatrix import with Diagrams import**
- **Found during:** Task 1 (building after first edit)
- **Issue:** `PUT` edit on index.astro line 10 replaced the LanguageMatrix import line instead of inserting after ToolShowcase
- **Fix:** Re-edited to include both Diagrams and LanguageMatrix imports
- **Files modified:** src/pages/index.astro
- **Committed in:** `cf26745` (part of task 1 commit)

**2. [Rule 1 - Bug] Misplaced -webkit-overflow-scrolling property in CSS**
- **Found during:** Task 2 (mobile responsiveness pass)
- **Issue:** Edit tool placed `-webkit-overflow-scrolling: touch` inside `.diagram .flow-index-cap` rule instead of `.table-wrap` or `.diagram-wrap`
- **Fix:** Removed from wrong location, added to `.table-wrap` and `.diagram-wrap` declarations
- **Files modified:** src/styles/landing.css
- **Committed in:** `b724589` (part of task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bug)
**Impact on plan:** Both were tool-usage bugs in the executor, not plan issues. No scope changes.

## Issues Encountered

None beyond the auto-fixed tool-usage bugs above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All LNDG-06 and LNDG-09 deliverables structurally verified
- Real-Chrome smoke test (diagram dark-mode contrast, 390px no-overflow, tab sync hero to quickstart) deferred to orchestrator verification pass
- Phase 3 landing page rebuild is complete — ready for Phase 5 launch verification

---
*Phase: 03-landing-page-rebuild*
*Completed: 2026-08-22*
