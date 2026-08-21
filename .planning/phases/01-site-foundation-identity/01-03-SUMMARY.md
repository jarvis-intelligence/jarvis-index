---
phase: 01-site-foundation-identity
plan: 03
subsystem: ui
tags: [css, design-tokens, fontsource, self-hosted-fonts, starlight, astro, geist, rajdhani]

# Dependency graph
requires:
  - phase: 01-02
    provides: unified Astro 5 + Starlight project (landing at /, docs at /docs/, one dist/ tree) with the three Fontsource packages already installed and pinned
provides:
  - design/tokens.css — THE identity layer: full --jv-* custom-property set (light + [data-theme='dark'] overrides), values provisional (Phase 3 refines the same variables), Fontsource imports in-file
  - Zero third-party font requests on both surfaces — Geist, Geist Mono, Rajdhani ship as 17 same-origin hashed woff2 assets, deterministic across clean rebuilds
  - src/styles/starlight-tokens.css — --sl-* remap layer (var() references only; no color ever defined outside tokens.css)
  - src/styles/landing.css — the landing's 512-line layout CSS, fully re-tokened to var(--jv-*); src/pages/index.astro carries zero inline style/:root blocks
  - Superseded-by headers on the three opengsd-derived spec artifacts
affects: [01-04, 01-05, 02-docs-restructure, 03-landing-rebuild]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
# Same estimateTokens scale (chars/4 over the realized diff), never a harness token count.
actuals:
  tokens: 20555
  tasks: 3
  commits: 4

# Tech tracking
tech-stack:
  added: []  # consumes @fontsource-variable/geist@5.3.0, @fontsource-variable/geist-mono@5.3.0, @fontsource/rajdhani@5.3.0 pinned by 01-02
  patterns:
    - "Token layering (values → tokens → engine remap): design/tokens.css is the only color-definition site; starlight-tokens.css only remaps onto --sl-*; landing.css only references var(--jv-*)"
    - "Fonts wired through the token sheet: Fontsource @imports inside tokens.css mean every consumer of the tokens gets the fonts — one wiring point, both surfaces"
    - "Unlayered remap beats Starlight's @layer starlight.base variables in both light and dark mode (cascade layers, not specificity)"

key-files:
  created: [design/tokens.css, src/styles/starlight-tokens.css, src/styles/landing.css]
  modified: [astro.config.mjs, src/pages/index.astro, docs/brand-spec.md, plans/0807-2314-landing-page/plan.md, docs/superpowers/specs/2026-08-07-landing-page-design.md]

key-decisions:
  - "customCss paths are './design/tokens.css' + './src/styles/starlight-tokens.css', NOT the plan's '../design/tokens.css' — Starlight 0.37.7 resolves customCss entries against Astro's project root (verified in node_modules/@astrojs/starlight/integrations/virtual-user-config.ts resolveId); '../' escapes the repo and breaks the build"
  - "Font stacks use the Fontsource family names \"Geist Variable\" / \"Geist Mono Variable\" — the variable packages register suffixed families; keeping the live page's \"Geist\" / \"Geist Mono\" would have shipped woff2 assets that never apply (silent fallback). Rajdhani (static package) keeps its unsuffixed name"
  - "Values ship PROVISIONAL per the plan's flagged assumption: current live palette under the --jv-* architecture; Phase 3 refines the same variables, never forks them (recorded in the tokens.css header)"
  - "plans/0807-2314-landing-page/plan.md entered git in the Task-3 commit (was untracked since 2026-08-07) — committing it makes the supersession notice durable in history"
  - "Non-token literals retained in landing.css (#9aa4ac chip/exchange labels, #000 hero-art mask, a few rgba() shadows): pure mechanical swap, no value edits, no invented tokens — Phase 3 may tokenize them"

patterns-established:
  - "Single color-definition site: any literal color outside design/tokens.css is a SITE-03 regression (landing.css's three documented non-token literals excepted until Phase 3)"
  - "Supersession by header: stale specs get a first-line SUPERSEDED notice naming the live source of truth; the file body stays untouched as history"

requirements-completed: [SITE-03, SITE-04]

# Coverage metadata (#1602) — one entry per shipped deliverable. Drives DETERMINISTIC UAT routing in verify-work.
coverage:
  - id: D1
    description: "design/tokens.css as the single identity source consumed by BOTH surfaces (--jv-* set, light+dark, provisional header; Starlight via customCss + --sl-* remap; landing via direct import)"
    requirement: SITE-03
    verification:
      - kind: integration
        ref: "grep: tokens.css carries --jv-accent/-strong/-soft, --jv-sans/--jv-mono/--jv-logo, [data-theme='dark'] block, PROVISIONAL header; starlight-tokens.css maps --sl-color-accent: var(--jv-accent) with zero hex values; astro.config.mjs customCss wires both files"
        status: pass
      - kind: integration
        ref: "Served CSS (preview :4323): shared bundle index.DFYCDxkI.css contains --jv-accent on both surfaces; Starlight bundle contains the literal remap --sl-color-accent: var(--jv-accent)"
        status: pass
      - kind: e2e
        ref: "Live DOM (headless Chromium): docs dark body bg = rgb(4,5,6) (--jv-bg dark), landing light bg = rgb(243,247,250), toggle flips bg — tokens drive both surfaces end-to-end"
        status: pass
  - id: D2
    description: "Zero third-party font requests: Google Fonts CDN links deleted from the landing head; Geist, Geist Mono, Rajdhani served as same-origin hashed woff2"
    requirement: SITE-04
    verification:
      - kind: integration
        ref: "Build: 17 woff2 under dist/_astro (≥3); identical woff2 set across two consecutive builds AND across an npm ci rebuild (deterministic, lockfile-pinned); zero fonts.googleapis|fonts.gstatic matches in dist/index.html and dist/docs/index.html; zero in src/pages/index.astro source"
        status: pass
      - kind: e2e
        ref: "Live DOM: document.fonts.check true for 'Geist Variable', 'Geist Mono Variable', AND '700 16px Rajdhani' — all three families actually load (Rajdhani wordmark not silently lost to Geist fallback); wordmark computed font-family = Rajdhani"
        status: pass
  - id: D3
    description: "Landing fully token-driven: inline style/:root/[data-theme] blocks deleted from src/pages/index.astro; layout CSS extracted to landing.css with all custom-property references renamed to --jv-*"
    requirement: SITE-03
    verification:
      - kind: integration
        ref: "grep -c ':root' src/pages/index.astro == 0; landing.css has 123 var(--jv-*) references, 0 residual old-name references, 0 double-prefixes; page imports tokens.css + landing.css (one chain per page)"
        status: pass
      - kind: e2e
        ref: "Preview :4323 landing: HTTP 200, id=\"hero\" present, favicon ref present, markup/script untouched (same 437-line page minus CSS)"
        status: pass
  - id: D4
    description: "Three stale spec artifacts carry first-line SUPERSEDED—HISTORICAL notices naming design/tokens.css; none publish (structurally outside src/content/docs/)"
    requirement: SITE-03
    verification:
      - kind: integration
        ref: "head -5 | grep -i superseded passes for docs/brand-spec.md, plans/0807-2314-landing-page/plan.md, docs/superpowers/specs/2026-08-07-landing-page-design.md; dist sweep (35 html files) contains none of the three"
        status: pass
  - id: D5
    description: "Visual sanity: both surfaces readable and correctly themed in light + dark after the CSS re-plumbing"
    requirement: SITE-04
    verification:
      - kind: automated_ui
        ref: "4 screenshots captured via headless Chromium (landing light/dark, docs light/dark) + computed-style probes (bg flips, fonts applied) — rendering is not broken"
        status: pass
    human_judgment: true
    rationale: "Computed styles prove token resolution, but readability/hierarchy/brand feel is a judgment call — routed to end-of-phase UAT per human_verify_mode: end-of-phase"

# Metrics
duration: 14min
completed: 2026-08-21
status: complete
---

# Plan 01-03: Identity Layer — Tokens + Self-Hosted Fonts Summary

**One --jv-* token sheet (design/tokens.css, provisional live values, light+dark) now feeds both the landing and Starlight docs, with all three fonts self-hosted as 17 deterministic same-origin woff2 assets — zero third-party font requests — and the three opengsd-derived specs marked superseded**

## Performance

- **Duration:** 14 min
- **Started:** 2026-08-21T08:32:39Z
- **Completed:** 2026-08-21T08:46:30Z
- **Tasks:** 3 (1 tracer + 2 auto)
- **Files modified:** 8 (3 created, 5 modified)

## Accomplishments

- design/tokens.css is provably the only color-definition site: full --jv-* set (25 properties incl. chip/radius/frame/shadow vars and the three font stacks) with [data-theme='dark'] overrides, provenance header marking values PROVISIONAL (Phase 3 refines, never forks)
- Zero third-party font requests, proven three ways: no CDN hostname in built landing or docs home HTML; 17 woff2 served same-origin under dist/_astro; live DOM shows all three Fontsource families actually loaded (not just shipped)
- Landing is fully token-driven: 512-line inline style block extracted to src/styles/landing.css with all 123 custom-property references mechanically renamed; zero inline CSS remains in src/pages/index.astro
- Starlight docs consume the same tokens through customCss + the --sl-* remap (var() references only) — live DOM confirms docs body renders jarvis bg/font in both themes

## Task Commits

Each task was committed atomically:

1. **Task 1 (tracer): tokens.css + Fontsource imports + customCss wiring on both surfaces** — `43cc603` (feat)
2. **Task 2: Landing re-token — inline CSS → landing.css** — `546bed4` (refactor)
3. **Task 3: Superseded-by headers on the three stale spec artifacts** — `dd60b7f` (docs)

Tracer feedback gate (auto mode): tracer `<verify>` re-run end-to-end after commit 43cc603 — PASS, then expansion proceeded.

**Plan metadata:** SUMMARY commit follows this file (docs commit).

## Files Created/Modified

- `design/tokens.css` — the identity layer: --jv-* tokens (light + dark), Fontsource @imports, provisional-status header
- `src/styles/starlight-tokens.css` — --sl-* remap (never defines a color; unlayered so it wins over Starlight's `@layer starlight.base` in both modes)
- `src/styles/landing.css` — extracted landing layout CSS, 123 var(--jv-*) references
- `astro.config.mjs` — starlight customCss: ['./design/tokens.css', './src/styles/starlight-tokens.css']
- `src/pages/index.astro` — Google Fonts links deleted; tokens + landing.css imported; inline style/:root/dark blocks removed; markup and theme script untouched
- `docs/brand-spec.md`, `plans/0807-2314-landing-page/plan.md`, `docs/superpowers/specs/2026-08-07-landing-page-design.md` — first-line SUPERSEDED notices (bodies untouched; the 0807 plan enters git here)

## Decisions Made

See key-decisions in frontmatter. Beyond the plan text: the customCss path prefix and the Fontsource family-name adaptation were forced by verified package behavior (details under Deviations); everything else followed the plan exactly, including leaving the landing theme script's `jarvis-theme` storage key alone (01-04 scope).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] customCss entry path must be './design/tokens.css', not '../design/tokens.css'**
- **Found during:** Task 1 (wiring)
- **Issue:** Starlight 0.37.7 resolves customCss entries starting with '.' against Astro's project root (`virtual-user-config.ts` → `resolveId(id, base = root)`); the plan's '../design/tokens.css' resolves to the repo's parent directory — Vite import of a nonexistent absolute path, build-breaking
- **Fix:** `customCss: ['./design/tokens.css', './src/styles/starlight-tokens.css']` — same files, same order, correct base
- **Files modified:** astro.config.mjs
- **Verification:** green build; docs pages reference the tokens bundle (served-CSS grep + live DOM probes)
- **Committed in:** 43cc603

**2. [Rule 1 - Bug] Font stacks must use Fontsource's registered family names**
- **Found during:** Task 1 (authoring tokens.css)
- **Issue:** @fontsource-variable packages register families as 'Geist Variable' / 'Geist Mono Variable' (verified in their index.css @font-face rules); the live stacks' 'Geist' / 'Geist Mono' names would never match the self-hosted faces — woff2 shipped but never applied, silent system-font fallback (the exact brand-erosion class the plan's Rajdhani prohibition warns about)
- **Fix:** --jv-sans / --jv-mono / --jv-logo reference "Geist Variable" / "Geist Mono Variable" (Rajdhani static keeps 'Rajdhani'); minimal value edit beyond the pure rename, recorded in the tokens.css header
- **Files modified:** design/tokens.css
- **Verification:** document.fonts.check true for all three families; wordmark computed font = Rajdhani; landing body font = Geist Variable
- **Committed in:** 43cc603

---

**Total deviations:** 2 auto-fixed (1 Rule 3 blocking, 1 Rule 1 bug)
**Impact on plan:** Both were correctness requirements of the wiring itself — same architecture, same files, verified against installed package source. No scope creep.

## Issues Encountered

- The harness's shell grep (pi-uu-grep 0.2.0) treats parentheses as regex groups in default mode, so the plan's verify pattern `'--sl-color-accent: var(--jv-accent)'` matches nothing even when present (POSIX grep treats the parens literally). Worked around with `grep -F`; all acceptance criteria proven with fixed-string matches. Reported via the harness report channel. Future plans on this machine should use `-F` for parenthesized patterns.
- 17 woff2 assets rather than "3": Fontsource variable packages ship per-subset files (latin, latin-ext, cyrillic, …) — the ≥3 assertion holds; count is stable across rebuilds.
- Browser tool first-open timed out once; retry succeeded (screenshots + computed-style probes captured).
- The plan's Task-2 verify command's `:root` grep uses `grep -c ':root' src/pages/index.astro` — passes (0). The `id="hero"` and favicon assertions pass against dist/index.html and the preview-served page.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **01-04 (theme storage-key unification):** the landing script still reads/writes `localStorage['jarvis-theme']` (deliberately untouched here); Starlight uses `starlight-theme`. Both already share the `data-theme` attribute, so the swap is contained in the one inline script
- **01-05 (verify-build):** V4's repo-wide font-origin grep will pass from day one (zero matches in dist); the URL contract enumeration from 01-02's D3 evidence is ready to mechanize
- **Phase 3 (landing rebuild):** refine the SAME --jv-* variables (provisional status recorded in tokens.css header); the three non-token literals in landing.css (#9aa4ac, #000) are candidates for tokenization then
- Both surfaces render correctly themed in light + dark (screenshots + computed-style probes); the 1-minute human visual check routes to end-of-phase UAT per config

---
*Phase: 01-site-foundation-identity*
*Completed: 2026-08-21*
