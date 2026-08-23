# Phase 3: Landing Page Rebuild - Context

**Gathered:** 2026-08-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the landing (`src/pages/index.astro` + `src/styles/landing.css`) as a single-scroll conversion surface on the shared identity, with claims drawn from the settled Phase 2 docs. Delivers LNDG-01..10: hero with copyable primary install, honestly tiered 9-tool showcase, compact language matrix, local-first privacy section, badges, simulated demo panel, dark-mode-safe architecture diagrams, tabbed install widget on hero + quickstart, mobile-responsive throughout. Out of scope: docs content changes beyond mounting the install widget on quickstart, plugin skills (Phase 4), launch verification (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Page Architecture & Scroll Narrative
- Section order top→bottom: Hero (one-line value prop + copyable install) → Demo panel → 9-tool tiered showcase → Language matrix → Local-first privacy → Architecture diagrams → Badges + final CTA → Footer
- Existing sections (pipeline / usage / skills / roadmap) are replaced wholesale: pipeline concept folds into the architecture-diagrams section; usage folds into the demo panel; skills fold into the showcase; roadmap drops (docs own it)
- Sticky header retained, re-anchored to: Demo, Tools, Languages, Privacy, Architecture + a Docs CTA button
- Slim footer: MIT, GitHub, PyPI, MCP Registry, Discussions, Docs link

### Hero & Install Widget
- Primary install command in hero: `curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh` (matches quickstart Step 1, the true cold-start entry)
- Widget channel tabs: **Installer+uv / Plugin marketplace / Manual uvx** — 3 channels, default Installer+uv; hero carries the compact widget; the docs quickstart gets the same widget synced via `syncKey="channel"` (Starlight Tabs on the MDX side)
- Quickstart integration: channel widget placed above Step 1 as a "choose your path" chooser; the existing per-client Step 4 tabs stay untouched (different concern: registration vs installation)
- Copy affordance: the whole command chip is click-to-copy with a ✓ "copied" state, on every install/command chip (LNDG-08)

### Honesty Tiers, Demo & Matrices
- Demo panel: interactive click-through stepper — pick a question → see the MCP tool call JSON → see the real recorded result JSON; 3 preset scenarios reusing Phase-2 fixture transcripts (getIndexStatus/goToDefinition/findReferences shapes); deliberately not live
- Tier treatment: 7 core tools plain; `semanticSearch` card gated with a "requires `[semantic]` extra + reindex" chip; `typeHierarchy` gated with "requires fork-built scip + reindex" chip — chips at the point of claim, deep-linking to the docs requirements-page anchors locked in Phase 2
- Language matrix: compact table reusing the docs' exact family rows (TypeScript/TSX, Java/Kotlin, Swift, Python get navigation; every other language gets search only) — one source of truth with `guide/requirements`
- Diagrams: re-render `jarvis-layers` + `jarvis-index-pipeline` from `../jarvis/docs/assets/` `.dot` sources as dark-mode-safe inline SVGs whose colors are driven by CSS variables, embedded inline in the page (no external asset fetch, no CSS filter hack)

### Identity, Badges & Mobile
- Token refinement: refine existing `--jv-*` values in place (accent punch, dark-mode contrast pass); tokenize the three leftover literals in landing.css (`#9aa4ac`, `#000` mask) — refine, never fork
- Badges: custom inline SVG badges for GitHub, PyPI, MIT, MCP Registry — preserves the site's zero-third-party-request property (no shields.io)
- Mobile: single-column collapse; language matrix in a contained horizontal-scroll region; condensed sticky header; no page-level horizontal scroll at 390px
- Verification bar: real-Chrome smoke test — hero copy works, channel tabs sync hero↔quickstart, 390px no horizontal overflow, dark-mode diagram contrast

### Claude's Discretion
- Exact hero copy wording, section spacing/rhythm, card layouts, and the demo panel's visual styling, as long as the one-line value prop and claim vocabulary stay consistent with the Phase-2 docs voice

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `design/tokens.css` — the single visual truth (`--jv-*` variables, light+dark via `[data-theme]`); Phase 1 marked values PROVISIONAL for this phase to refine in place
- `src/styles/landing.css` (521 lines) — current landing styles carrying the 3 non-token literals awaiting tokenization
- `src/pages/index.astro` (444 lines) — current landing: header/hero/pipeline/usage/skills/roadmap; the Phase-1 theme-toggle + anti-FOUC script are wired to Starlight's `starlight-theme`/`data-theme` contract and must survive the rebuild
- Starlight `Tabs`/`TabItem` MDX components (used with `syncKey="client"` on quickstart + install-matrix) — the pattern the channel widget syncs with (`syncKey="channel"`)
- Phase-2 fixture-derived JSON transcripts (quickstart Step 5, tool reference pages) — reuse verbatim in the demo panel; one source of truth
- `../jarvis/docs/assets/*.dot` — graphviz sources for jarvis-layers and jarvis-index-pipeline (SVG/PNG renders exist there too)
- `public/assets/jarvis-mark.svg`, brand SVG blades mark in the header — keep

### Established Patterns
- Self-hosted Fontsource fonts only (`Geist Variable` / `Geist Mono Variable` / Rajdhani); zero third-party requests is a verified property (verify-build V4)
- Theme persistence via `starlight-theme` localStorage key + `data-theme` attribute on `<html>`
- Base path `/jarvis-index` everywhere; absolute root-relative URLs
- Claims vocabulary: "9 tools", honest gating language for `semanticSearch` (extra + reindex) and `typeHierarchy` (fork-built scip + reindex) exactly as settled in Phase 2 docs

### Integration Points
- Quickstart (`src/content/docs/docs/quickstart.mdx`) gains the channel widget above Step 1
- Requirements-page anchors (locked in Phase 2 plan 02-04) are the deep-link targets for tier chips
- MCP Registry identity: `io.github.jarvis-intelligence/jarvis`
- `scripts/verify-build.mjs` — existing build assertions (V1–V10) must keep passing; landing changes shouldn't regress the page-set or font-origin checks

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the accepted grey-area decisions above — open to standard approaches for layout details.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
