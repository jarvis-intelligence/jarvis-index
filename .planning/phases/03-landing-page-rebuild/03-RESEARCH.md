# Phase 3: Landing Page Rebuild — Research

**Phase:** 3 — Landing Page Rebuild
**Status:** Complete
**Date:** 2026-08-22

> Recovered from the PhaseResearcherP3 agent transcript (agent exited before writing output; findings re-verified against the repo by the orchestrator).

## 1. Astro Componentization

**Finding:** The current landing is a single 444-line `src/pages/index.astro` with a global 521-line `src/styles/landing.css`. No `src/components/` directory exists yet (glob confirmed). Astro idioms apply cleanly:

- Extract repeated section markup into Astro components under `src/components/landing/` (e.g. `InstallWidget.astro`, `DemoPanel.astro`, `ToolShowcase.astro`, `LanguageMatrix.astro`, `Badges.astro`, `Diagram.astro`). Astro components are zero-JS by default — the page stays static.
- MDX support exists (`@astrojs/mdx` in `package.json`, `astro.config.mjs`), and **MDX can import Astro components** — this is the mount path for the quickstart channel widget if it needs markup beyond Starlight's built-in `Tabs`/`TabItem` (which are already MDX-usable and used in `install-matrix.mdx` and `quickstart.mdx`).
- Recommendation: keep global `landing.css` (it is token-driven and already themed); component-scoped styles would fragment the token cascade for no gain at this scale.

## 2. Starlight Tabs syncKey Mechanics (critical for LNDG-10)

**Source:** `node_modules/@astrojs/starlight/user-components/Tabs.astro` (60-268 lines).

- Storage format: `localStorage['starlight-synced-tabs__' + syncKey] = <tab label string>` (line 51 read, line 237-238 write; `#storageKeyPrefix = 'starlight-synced-tabs__'` at line 154).
- The stored value is the **visible tab label text**, matched on load by label equality.
- Sync groups are keyed ONLY by `syncKey` — **page-agnostic**. A tabs group on the landing page participates in the same sync group as one on quickstart **iff** it reads/writes the same localStorage key and dispatches/consumes the same restore flow.
- Starlight's Tabs is a custom element (`<starlight-tabs>`) with a `<starlight-tabs-restore>` script that reads storage before paint. Tab styles live in `@layer starlight.components` — they do NOT leak outside Starlight's layer, so the landing page must style its own widget (expected).
- **Live-verified in this session** (real Chrome): `starlight-synced-tabs__client` persisted tab selection across `install-matrix` → `quickstart`.
- **Recommendation for the landing widget:** implement a small Astro component that renders the same tab semantics (`role="tab"`/`aria-selected`, `<starlight-tabs>`-compatible label matching) and reads/writes `starlight-synced-tabs__channel`, dispatching a `CustomEvent` on change so multiple widgets on one page stay consistent. Quickstart side uses native Starlight `<Tabs syncKey="channel">` — zero changes to Starlight internals. Label strings MUST match exactly across both surfaces (e.g. "Installer + uv", "Plugin marketplace", "Manual uvx").

## 3. Copy-to-Clipboard (LNDG-08)

- Zero-dependency: `navigator.clipboard.writeText()` with a `document.execCommand('copy')` fallback for non-secure contexts (localhost/HTTP previews). Existing landing already implements the exact pattern: `.mono-box` with `data-copied="true"` state and "✓ copied" label reverting after ~2s (`src/pages/index.astro` script block; styles in `landing.css` `.mono-box .copy`). Reuse verbatim; extend to every new chip.

## 4. Diagrams (LNDG-09)

- `dot` IS available on this machine (graphviz). **But** generated SVG carries hardcoded fills (e.g. `fill="#eff6ff"`) and fixed text colors — not theme-aware.
- **Recommended approach:** hand-adapt the two existing SVGs (`../jarvis/docs/assets/jarvis-layers.svg`, `jarvis-index-pipeline.svg`) into inline Astro components: strip hardcoded hex fills/strokes, replace with `var(--jv-*)`-driven classes (the existing `.diagram`, `.box`, `.flow`, `.m-label` CSS classes in `landing.css` already provide token-driven styling), set `background: transparent`, use `currentColor` for text. Graphviz `dot` output is a useful geometry reference for the hand-adapted layout.
- The `.dot` sources: `jarvis-layers.dot` (45 lines, 7-layer architecture), `jarvis-index-pipeline.dot` (60 lines, index pipeline with failure semantics — has red/failure terminal nodes).

## 5. Demo Panel Data (LNDG-07)

- Fixture JSON already lives in the repo as markdown code blocks: `quickstart.mdx` Step 5 has `getIndexStatus` (full shape incl. `last_index_run`/`capabilities`) and `goToDefinition` + ambiguous-candidates transcripts; `tools/find-references.md` has the findReferences shape.
- **Recommendation:** put the three scenario objects in `src/data/demo-scenarios.json` (single source, importable by the Astro component at build time — no runtime JS data fetch), with the stepper as progressive-enhancement JS (all three steps server-rendered, JS only toggles visibility; works without JS via `<noscript>`-friendly full render).

## 6. Badges (LNDG-05)

- Pattern: inline SVG per badge, icon + text, colors via `var(--jv-*)`, pill shape with `--jv-radius`. Existing inline SVGs in `index.astro` header (GitHub mark, PyPI box) are the style reference. Zero external requests preserved.

## 7. Mobile + A11y

- Matrix containment: `.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch }` with `min-width` on the table — no page-level scroll at 390px.
- Header condenses below 1060px (existing `landing.css` media queries hide `.header-nav`); keep a compact anchor row or a details-disclosure nav for mobile if the new section count needs it.
- Tabs a11y: `role="tablist"`/`role="tab"`/`aria-selected` + arrow-key roving tabindex (matches Starlight's own Tabs behavior).
- `prefers-reduced-motion: reduce` — existing landing css already respects it; the demo stepper must not auto-advance and transitions must collapse.

## 8. Build/Verify Impact

- `scripts/verify-build.mjs` (128 lines) runs V1-V10: page set vs `design/url-contract.json`, font-origin (zero third-party), sitemap equality, etc. Landing stays 1 page — url-contract unchanged. New components compile into the same `dist/index.html` (+ hashed assets). The quickstart edit adds no new page. **Watch:** the font-origin check scans all built HTML — any `@import`/external font link introduced by components would fail V4. Keep everything self-hosted.
- CI (`deploy-pages.yml`) triggers on `src/**`, `public/**`, `design/**`, `astro.config.*`, `package*.json`.

## 9. Token Refinement + Contrast

- The 3 literals: `#9aa4ac` at `landing.css:374,403,414` (`.mono-box .copy` idle, `.exchange-head`, `.ex-out`) and the `#000` mask at `landing.css:240-241`.
- **WCAG (researcher-computed):** `#9aa4ac` on light bg = **2.35:1 — FAILS AA** (needs 4.5:1 for text). Tokenization must pick a darker light-mode value (or accept as decorative-terminal-chrome and document). Dark-mode `--jv-muted` `#8c9399` on `#040506` ≈ 7+:1 (passes); `--jv-accent` `#5b86b7` on `#040506` ≈ 4.6:1 (passes large-text/interactive 3:1; borderline normal text).
- New tokens to add (UI-SPEC contract): `--jv-muted-soft` (light: AA-passing or documented-decorative; dark: `#5a6168`+), `--jv-mask-opaque: #000` (theme-invariant), optional `--jv-diagram-green`/`--jv-diagram-red` for pipeline semantics, `--jv-ease` if not present.

## 10. Execution Environment

- Node 22 (`node --version` v22.x). Executors have NO browser — verification must be structural: `npm run build` clean, `npm run verify` (V1-V10) green, grep-level assertions (aria attributes, token usage, syncKey labels equal across surfaces, copy-chip wiring). The real-Chrome smoke (copy works, tabs sync hero↔quickstart, 390px overflow, dark-mode contrast) belongs to the orchestrator's verification pass.

## Risks & Open Questions

| # | Risk | Mitigation |
|---|------|------------|
| R1 | Landing widget and Starlight Tabs drift out of label-sync (value is label text) | Pin the three channel labels as a shared constant; grep-assert equality across `index.astro` and `quickstart.mdx` in verification |
| R2 | Hand-adapted SVGs diverge from `.dot` sources | Treat `.dot` as spec; note file paths in the component header comment |
| R3 | `#9aa4ac` replacement changes terminal-chrome aesthetics | Choose token value that passes AA where text, keep decorative uses documented |
| R4 | Astro component extraction regresses FOUC/theme contract | Anti-FOUC inline script + `starlight-theme` toggle must move intact into the new layout |

## Recommendation Summary

1. Extract the landing into `src/components/landing/*.astro` components; keep global token-driven `landing.css`; mount the quickstart widget with native Starlight `<Tabs syncKey="channel">`.
2. Build the landing install-widget as an Astro component replicating Starlight's `starlight-synced-tabs__channel` localStorage contract (label-string values); pin labels in one constant used by both surfaces.
3. Hand-adapt the two graphviz SVGs to token-driven inline SVG components; `dot` output is geometry reference only.
4. Demo data in `src/data/demo-scenarios.json`; stepper = server-rendered content + visibility-toggle JS with reduced-motion respect.
5. Structural verification in executors (build + verify-build V1-V10 + grep assertions incl. label-sync); real-Chrome smoke left to orchestrator verification.

## RESEARCH COMPLETE
