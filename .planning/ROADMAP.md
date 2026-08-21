# Roadmap: jarvis-index — Public Surface Rebuild

## Overview

Horizontal layers, assembled at the end. Phase 1 lays the complete infrastructure layer: the live base-path bug fixed, landing and docs unified into one Astro 5 + Starlight project on Node 22, the jarvis identity token sheet with self-hosted fonts, dark mode and local search, the URL contract, and the CI checks that protect the rest of the build. Phase 2 pours the content layer onto that foundation: a tutorial-first, additive docs rebuild in which a cold visitor can reach a first successful tool call and no inbound link rots. Phase 3 cuts the landing over to the new identity with honest, copyable claims drawn from the settled docs. Phase 4 realigns the three plugin skills with the final voice and ships them as one synchronized 0.7.3 release. Phase 5 assembles and verifies the whole surface: a clean-machine cold-install run recorded as the walkthrough video, a claims audit, an old-URL crawl, maintainer-docs updates, and the community surfaces opened. Every phase deploys independently; the site stays live and protected throughout.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Site Foundation & Identity** - Live-deploy fix, unified Astro 5 + Starlight site on Node 22, design tokens + self-hosted fonts, dark mode + local search, URL contract, CI safety checks
- [ ] **Phase 2: Docs Rebuild — Tutorial-First Content** - Additive restructure to a tutorial-first IA: quickstart to first tool call, per-client guides, full tool/CLI reference, troubleshooting tree, redirects live, llms.txt last
- [ ] **Phase 3: Landing Page Rebuild** - New-identity conversion page: hero with copyable install, honestly tiered 9-tool showcase, language matrix, privacy, demo panel, diagrams, tabbed install widget
- [ ] **Phase 4: Plugin Skills Realignment & Release** - Three skills realigned to the final voice and docs, shipped as a synchronized 0.7.2→0.7.3 triple-manifest release
- [ ] **Phase 5: Launch Verification & Community** - Clean-machine cold-install run (recorded as video), claims audit, old-URL crawl, maintainer docs, Discussions enabled

## Phase Details

### Phase 1: Site Foundation & Identity
**Goal**: Deliver the complete infrastructure layer every later phase consumes: fix the verified live base-path 404, unify landing and docs into one Astro 5 + Starlight project deployed as one Pages artifact, establish `design/tokens.css` + self-hosted fonts as the single visual truth, wire dark mode and Pagefind search into the shell, decide the URL contract, and land the three CI checks before any content churn begins.
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, SITE-08
**Success Criteria** (what must be TRUE):
  1. The deployed docs load fully styled with working JS at `/docs/`, and the post-deploy smoke probe (`/` and `/docs/` → 200 + marker) passes — the live asset-404s observed on 2026-08-21 are gone
  2. Landing and docs build as one Astro 5 + Starlight project and deploy as one Pages artifact on Node 22, with the `deploy-pages.yml` diff shipped in the same commit as the stack change
  3. Dark mode toggle persists across visits, and Pagefind search returns hits across all docs pages
  4. Both surfaces render the new jarvis identity from one `design/tokens.css`, and the site makes zero third-party font requests
  5. The URL contract exists (every existing public URL enumerated + old→new redirect map) and CI fails loudly on three-manifest version disagreement, `plugin/.mcp.json` ≠ `plugin/mcp.json`, or unparseable manifest JSON
**Plans**: 5 plans

Plans:
- [ ] 01-01: Live base-path hotfix + post-deploy smoke probe (stack-independent; stop the bleeding today)
- [ ] 01-02: Unified Astro 5 + Starlight project — landing at `/`, docs at `/docs/`; Node 20→22 + `engines` field; `deploy-pages.yml` diff in the same commit
- [ ] 01-03: Identity layer — `design/tokens.css` carrying the new jarvis identity + Fontsource self-hosted variable fonts
- [ ] 01-04: Dark mode (persisting toggle) + Pagefind local search wired into the unified shell
- [ ] 01-05: URL contract + redirect map and lookup-table `404.html` mechanism; the three CI checks (manifest version agreement, dual-config diff, JSON parse)

### Phase 2: Docs Rebuild — Tutorial-First Content
**Goal**: Rebuild docs content as a tutorial-first, additive restructure on the Phase 1 foundation: a quickstart that carries a cold visitor to a self-verifiable first tool call, per-client install guides and the four-channel matrix, complete 9-tool and 7-command reference depth, requirements/limits before install, a troubleshooting decision tree, redirects shipped with the restructure, and `llms.txt` generated only after content stabilizes.
**Depends on**: Phase 1
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, DOCS-07, DOCS-08, DOCS-09, DOCS-10, DOCS-11, DOCS-12
**Success Criteria** (what must be TRUE):
  1. A cold visitor following only the public quickstart goes why → install → `jarvis index` → register per client → a successful first tool call, with expected output and "you'll know it works when…" success/failure shapes shown inline at every step
  2. However a visitor arrives — PyPI, Claude plugin, Codex plugin, or MCP Registry — the four-channel install matrix and per-client guides (Claude Code, Cursor, Codex CLI, generic stdio JSON) give a working path, with registry deep links to each client's entry
  3. All 9 tools have reference pages with request→response examples and the `{"error": ...}` contract, and all 7 CLI commands are documented with flags and examples — each reachable from the nav in one click
  4. Requirements and limits, led by the language-support matrix (4 nav families / 10 search-only / per-language caveats), appear before any install step; the troubleshooting decision tree takes a stuck user symptom → diagnosis → fix, led by uvx cold-start, PATH, and the scip version-gate
  5. Nothing rots and nothing goes stale: every existing docs page is classified keep / merge-with-redirect / retire with stubs or the 404 lookup page served at every retired URL, the changelog page mirrors `../jarvis/CHANGELOG.md`, and `llms.txt` indexes the stabilized content
**Plans**: 5 plans

Plans:
- [ ] 02-01: Additive restructure — classify every existing docs page keep / merge-with-redirect / retire; ship meta-refresh stubs + lookup-table `404.html` (executes the Phase 1 URL contract)
- [ ] 02-02: Journey content — tutorial-first quickstart with inline success/failure shapes, per-client install guides, four-channel install matrix, MCP Registry deep-link table
- [ ] 02-03: Reference depth — 9 tool reference pages (request→response + error contract), CLI reference for 7 commands
- [ ] 02-04: Guardrails — requirements & limits with the language-support matrix placed before install; troubleshooting decision tree; changelog import
- [ ] 02-05: `llms.txt` generation — sequenced strictly last, after docs content stabilizes

### Phase 3: Landing Page Rebuild
**Goal**: Rebuild the landing as a single-scroll conversion surface on the shared identity, its claims drawn from the settled Phase 2 docs: hero with a copyable primary install, honestly tiered 9-tool showcase, compact language matrix, local-first privacy section, badges, simulated demo panel, dark-mode-safe architecture diagrams, and the tabbed install widget — mobile-responsive throughout.
**Depends on**: Phase 2
**Requirements**: LNDG-01, LNDG-02, LNDG-03, LNDG-04, LNDG-05, LNDG-06, LNDG-07, LNDG-08, LNDG-09, LNDG-10
**Success Criteria** (what must be TRUE):
  1. A first-time visitor gets the value proposition in one line and can copy the primary install command straight from the hero; every install/command chip on the page copies to clipboard
  2. The 9-tool showcase presents honest tiers — `semanticSearch` (extra + reindex required) and `typeHierarchy` (fork-built scip + reindex required) gated at point of claim — beside a compact language-support matrix
  3. The landing works on a phone: every section is usable at mobile widths with no horizontal scrolling
  4. A pre-install visitor sees the payoff and the proof: a simulated query→result demo with real recorded JSON shapes (deliberately not live), architecture diagrams reused from `../jarvis/docs/assets/` rendered dark-mode-safe, the local-first privacy section, and GitHub / PyPI / MIT / MCP Registry badges
  5. Channel choice happens in-page: the tabbed install widget (installer+uv / plugin marketplace / manual uvx) appears on the hero and on the docs quickstart
**Plans**: 4 plans

Plans:
- [ ] 03-01: Landing scaffold on `tokens.css` — hero with one-line value prop + copyable install, badges, copy-to-clipboard behavior
- [ ] 03-02: Tiered 9-tool showcase with honest gating, compact language-support matrix, local-first privacy section
- [ ] 03-03: Simulated demo panel (real recorded JSON shapes) + architecture diagrams section, dark-mode-safe
- [ ] 03-04: Tabbed install widget on hero and quickstart; mobile-responsiveness pass across all sections

### Phase 4: Plugin Skills Realignment & Release
**Goal**: Realign the three plugin skills (`jarvis-setup`, `jarvis-use`, `jarvis-issues`) with the final positioning vocabulary and the rebuilt docs — removing the broken CLAUDE.md reference, retargeting docs links at tags, syncing commands and examples — and ship everything as one synchronized release: 0.7.2 → 0.7.3 across all three manifests with the Cursor validator and dual-config diff as definition of done.
**Depends on**: Phase 3
**Requirements**: SKIL-01, SKIL-02, SKIL-03, SKIL-04
**Success Criteria** (what must be TRUE):
  1. An agent reading `jarvis-setup` finds no dangling CLAUDE.md reference (no CLAUDE.md ships in the plugin), and every docs link in all three skills resolves at a tag, never `main`
  2. All three skills speak the new positioning, and their commands and examples behave exactly as the rebuilt docs say they do
  3. The release is shippable and verifiable: all three `plugin.json` manifests agree at 0.7.3, the Cursor marketplace validator passes, and `plugin/.mcp.json` is byte-identical to `plugin/mcp.json`
**Plans**: 3 plans

Plans:
- [ ] 04-01: `jarvis-setup` realignment — remove the CLAUDE.md reference, retarget docs URLs at tags, sync the install path with the rebuilt quickstart
- [ ] 04-02: `jarvis-use` + `jarvis-issues` realignment — new positioning vocabulary, commands/examples synced with rebuilt docs
- [ ] 04-03: Release protocol — synchronized triple-manifest bump 0.7.2→0.7.3, Cursor validator pass, dual-config diff as definition of done

### Phase 5: Launch Verification & Community
**Goal**: Assemble and verify the finished surface: a clean-machine cold-install run using only public pages (recorded as the video walkthrough), a claims audit tracing every factual sentence to shipped artifacts, an old-URL crawl against the sitemap, maintainer docs updated to the new site structure, and the community surfaces opened — GitHub Discussions enabled and linked as the support surface.
**Depends on**: Phase 4
**Requirements**: VRFY-01, VRFY-02, VRFY-03, VRFY-04, COMM-01, COMM-02
**Success Criteria** (what must be TRUE):
  1. A stranger on a clean macOS and a clean Linux machine, guided only by the public pages, completes install → `jarvis index` → first successful tool call, honestly timed — and that run is captured as the video walkthrough embedded on the quickstart or landing
  2. Every factual sentence on the landing and docs traces to README / CHANGELOG / synced `setup.sh` / manifests — zero untraceable claims
  3. Every retired URL serves content or a redirect, and the sitemap matches the shipped pages exactly
  4. Maintainer docs (deployment-guide, code-standards, system-architecture) describe the new site structure, and GitHub Discussions is enabled and linked from the docs troubleshooting page as the support surface
**Plans**: 3 plans

Plans:
- [ ] 05-01: Clean-machine cold-install run (fresh macOS + Linux), honestly timed, screen-recorded as the walkthrough video
- [ ] 05-02: Claims audit (landing + docs → README/CHANGELOG/`setup.sh`/manifests) and old-URL crawl + sitemap-vs-shipped-pages check
- [ ] 05-03: Maintainer docs update; GitHub Discussions enabled and linked from troubleshooting; video walkthrough embedded

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Site Foundation & Identity | 0/5 | Not started | - |
| 2. Docs Rebuild — Tutorial-First Content | 0/5 | Not started | - |
| 3. Landing Page Rebuild | 0/4 | Not started | - |
| 4. Plugin Skills Realignment & Release | 0/3 | Not started | - |
| 5. Launch Verification & Community | 0/3 | Not started | - |

## Notes

- **Research alignment:** This roadmap follows the 5-phase shape proposed in `.planning/research/SUMMARY.md` (Implications for Roadmap): stabilization + identity → docs → landing → skills → verification, with the URL contract *decided* in Phase 1, *executed* in Phase 2, and *verified* in Phase 5; CI checks land in Phase 1, ahead of the skills release they protect; skills realign last so one voice lands everywhere.
- **Deviation — COMM items placed in Phase 5:** Research's Phase 5 was pure verification because COMM-01/02 were v2 at research time; both were promoted to v1 afterward. They land in Phase 5 rather than Phase 2/3 because COMM-02's video *is* the recorded VRFY-01 cold-install run (one run, two artifacts), and COMM-01's troubleshooting link plus COMM-02's embed are one-line docs edits naturally batched with the Phase 5 maintainer-docs pass.
- **Deviation — engine decided, not spiked:** Research Phase 1 included an Astro-vs-VitePress spike and decision. SITE-02 now mandates the unified Astro 5 + Starlight site, so Phase 1 builds it rather than deciding it. The remaining open items from research (npm version pins, Starlight-at-`/docs/` mount behavior, custom domain) are Phase 1 *planning* research, not roadmap forks; the two-Astro-builds fallback in STACK.md preserves URL layout if the mount proves brittle.
- **SITE-06 execution split:** SITE-06 is owned by Phase 1 (the contract: enumerated URLs, old→new redirect map, stub + `404.html` mechanism). Its "shipped with the restructure" half executes in Phase 2 under DOCS-09, whose success criteria cover stub shipment — matching the requirement's own sequencing text and research's decide/execute/verify split.

---
*Created: 2026-08-21*
