---
phase: 03-landing-page-rebuild
plan: 01
subsystem: landing

# Dependency graph
requires:
  - phase: 02-docs
    provides: design/tokens.css with --jv-* token architecture, VitePress docs with quickstart.mdx, verify-build.mjs V1-V10 harness
provides:
  - design/tokens.css with --jv-muted-soft and --jv-mask-opaque tokens
  - landing.css with all literals tokenized, new CSS class stubs (demo-panel, gate-chip, badge-row, install-widget)
  - InstallWidget.astro with Starlight syncKey=channel sync
  - Badges.astro with 4 inline SVG badges
  - index.astro rewritten with hero+widget, placeholder sections, badges+CTA, updated header/footer
  - quickstart.mdx channel widget mounted above Step 1
affects: 03-02 (tool showcase, language matrix, privacy, demo panel use the class stubs), 03-03 (architecture diagrams), 03-04 (mobile responsive)

actuals:
  tokens: 11989
  tasks: 1
  commits: 1

tech-stack:
  added:
  patterns:

key-files:
  created:
    - src/components/landing/InstallWidget.astro
    - src/components/landing/Badges.astro
  modified:
    - design/tokens.css
    - src/styles/landing.css
    - src/pages/index.astro
    - src/content/docs/docs/quickstart.mdx

key-decisions:
  - "--jv-muted-soft light kept at #9aa4ac (decorative terminal chrome, 2.35:1 on bg — documented in UI-SPEC as acceptable)"
  - "--jv-muted-soft dark set to #626a71 (3.52:1 against chip-bg — decorative, not body text)"
  - "--jv-mask-opaque set to #000 in :root only (theme-invariant; mask is structurally invisible)"
  - "No dark-mode contrast bump needed — --jv-muted #8c9399 on #040506 = 6.56:1 passes AA"
  - "No accent punch needed — --jv-accent-strong #7cafe4 on #040506 = 8.85:1 is plenty"
  - "Hero h1 copy: 'Structural code intelligence, locally on your machine.' — consistent with Phase 2 docs voice"
  - "Plugin marketplace tab Cursor panel uses a static (non-copy) mono-box since it is a GUI deeplink"

requirements-completed: [LNDG-01, LNDG-05, LNDG-08, LNDG-10]

coverage:
  - id: D1
    description: "Tokenized all hardcoded hex literals in landing.css; added --jv-muted-soft and --jv-mask-opaque to tokens.css"
    requirement: LNDG-08
    verification:
      - kind: automated
        ref: "grep -c '#9aa4ac' src/styles/landing.css returns 0; grep -v 'rgba' src/styles/landing.css | grep -c '#000' returns 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Hero section with one-line value prop, tabbed install widget (3 channels), and copy-to-clipboard"
    requirement: LNDG-01
    verification:
      - kind: automated
        ref: "npm run build exits 0; grep -c 'data-copy' dist/index.html returns >= 3"
        status: pass
    human_judgment: false
  - id: D3
    description: "Install widget syncs hero ↔ quickstart via starlight-synced-tabs__channel localStorage key"
    requirement: LNDG-10
    verification:
      - kind: automated
        ref: "grep -c 'starlight-synced-tabs__channel' src/components/landing/InstallWidget.astro >= 1; grep -c 'syncKey=\"channel\"' quickstart.mdx == 1; label parity 4 occurrences across both files"
        status: pass
    human_judgment: false
  - id: D4
    description: "4 inline SVG badges (GitHub, PyPI, MIT, MCP Registry) with zero external requests"
    requirement: LNDG-05
    verification:
      - kind: automated
        ref: "grep -c 'shields.io' dist/index.html returns 0; Badges.astro uses var(--jv-*) colors"
        status: pass
    human_judgment: false
  - id: D5
    description: "Sticky header with new nav anchors (#demo, #tools, #languages, #privacy, #architecture) and Docs CTA"
    verification:
      - kind: automated
        ref: "grep -c 'id=\"demo\"' dist/index.html == 1; same for tools, languages, privacy, architecture"
        status: pass
    human_judgment: false
  - id: D6
    description: "Footer with MIT, GitHub, PyPI, MCP Registry, Discussions, Docs links per D-01"
    verification:
      - kind: automated
        ref: "Footer inner in dist/index.html contains all 6 links"
        status: pass
    human_judgment: false
  - id: D7
    description: "Anti-FOUC script and theme toggle script survive byte-identical"
    requirement: LNDG-08
    verification:
      - kind: automated
        ref: "grep -c 'starlight-theme' dist/index.html returns 2; grep -c 'theme-toggle' dist/index.html >= 1"
        status: pass
    human_judgment: false

# Phase 03 Plan 01: Token Refinement, Hero with Install Widget, Badges + Footer Scaffold Summary

**Token refinement, tabbed install widget syncing with quickstart, inline SVG badges, and rebuilt page skeleton with hero + placeholders.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-22T17:50:02Z
- **Completed:** 2026-08-23T01:08:26Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments
- Refined design/tokens.css with --jv-muted-soft (light/dark) and --jv-mask-opaque; verified dark-mode contrast compliance
- Tokenized all 4 hardcoded hex literals (#9aa4ac x3, #000 x1) in landing.css — zero remain outside comments
- Created InstallWidget.astro: 3-tab widget reading/writing starlight-synced-tabs__channel localStorage, with arrow-key roving tabindex
- Created Badges.astro: 4 self-contained inline SVG badges (GitHub, PyPI, MIT, MCP Registry) using --jv-* tokens
- Rewrote index.astro: new section order, hero with InstallWidget, 5 placeholder sections, badges+CTA closing, updated header nav and footer
- Mounted channel widget on quickstart.mdx with syncKey=channel (native Starlight Tabs) — label parity verified across surfaces
- Added CSS class stubs for future plans: .demo-panel/.demo-step/.demo-nav, .gate-chip (amber warning tone), .badge-row/.badge

## Task Commits

1. **Tracer: Token refinement + hero with install widget + badges/footer scaffold** - `a5a0b6b` (feat)

## Files Created/Modified
- `design/tokens.css` — Added --jv-muted-soft (light #9aa4ac, dark #626a71) and --jv-mask-opaque (#000, :root only)
- `src/styles/landing.css` — All 4 hex literals tokenized; added .install-widget*, .demo-panel, .demo-step, .demo-nav, .gate-chip, .badge-row, .badge classes
- `src/components/landing/InstallWidget.astro` — Tabbed install widget with localStorage sync and roving tabindex (NEW)
- `src/components/landing/Badges.astro` — 4 inline SVG badges, zero external requests (NEW)
- `src/pages/index.astro` — Full rewrite: hero+widget, 5 placeholder sections, badges+CTA, updated header/footer
- `src/content/docs/docs/quickstart.mdx` — Channel widget (<Tabs syncKey=channel>) mounted above Step 1

## Decisions Made
- --jv-muted-soft light kept at #9aa4ac (decorative terminal chrome, 2.35:1 on bg — documented in UI-SPEC as acceptable)
- --jv-muted-soft dark set to #626a71 (3.52:1 against chip-bg — decorative, not body text)
- --jv-mask-opaque set to #000 in :root only (theme-invariant; mask is structurally invisible)
- No dark-mode contrast bump needed — --jv-muted #8c9399 on #040506 = 6.56:1 passes AA
- No accent punch needed — --jv-accent-strong #7cafe4 on #040506 = 8.85:1 is plenty
- Hero h1 copy: 'Structural code intelligence, locally on your machine.' — consistent with Phase 2 docs voice
- Plugin marketplace tab Cursor panel uses a static (non-copy) mono-box since it is a GUI deeplink


## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate CSS blocks caused by incremental edit failures**
- **Found during:** Task 1 (tokenization of landing.css)
- **Issue:** Multiple edit operations on landing.css created duplicate CSS blocks and syntax errors (missing closing braces)
- **Fix:** Rewrote entire landing.css file via write tool with all tokenization + new class stubs in one clean pass
- **Files modified:** src/styles/landing.css
- **Verification:** build succeeds, all grep gates pass
- **Committed in:** a5a0b6b (tracer commit)

**2. [Rule 3 - Blocking] Cursor plugin panel cannot be a copyable chip**
- **Found during:** Task 1 (InstallWidget.astro creation)
- **Issue:** Plan said every command chip should be a `.mono-box[data-copy]`, but Cursor install is a GUI deeplink — not a terminal command
- **Fix:** Made the Cursor panel a static mono-box with `style="cursor:default"` and `visibility:hidden` on the copy label
- **Files modified:** src/components/landing/InstallWidget.astro
- **Verification:** Widget renders correctly in build output
- **Committed in:** a5a0b6b (tracer commit)

**3. [Rule 2 - Missing Critical] quickstart.mdx edit corrupted — line truncation**
- **Found during:** Task 1 (quickstart.mdx channel widget insertion)
- **Issue:** Incremental edit produced truncated line content (Plugin marketplace tab panel cut off mid-sentence)
- **Fix:** Rewrote entire quickstart.mdx with channel widget correctly positioned above Step 1
- **Files modified:** src/content/docs/docs/quickstart.mdx
- **Verification:** build succeeds, syncKey=channel present, label parity confirmed
- **Committed in:** a5a0b6b (tracer commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 1 blocking, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep. Cursor deeplink handling is a minor content decision documented here.

## Issues Encountered
- BSD grep's `-c` flag uses extended regex by default, making `grep -c 'Installer + uv'` match differently than expected (the `+` is a regex quantifier). Used `grep -Fc` (fixed string count) for the label parity verification gate.

## Next Phase Readiness
- All CSS class stubs (.demo-panel, .demo-step, .demo-nav, .gate-chip) ready for 03-02 population
- Card grid (.card-grid.cols-3) and table classes (.table-wrap, .table-matrix) already exist
- Exchange terminal chrome (.exchange) pattern available for demo panel reuse
- Page skeleton with correct section IDs in place — 03-02 adds content to the placeholder sections

---
*Phase: 03-landing-page-rebuild*
*Completed: 2026-08-23*