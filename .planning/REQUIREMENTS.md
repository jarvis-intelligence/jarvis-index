# Requirements: jarvis-index Public Surface Rebuild

**Defined:** 2026-08-21
**Core Value:** A cold visitor can land, install, and make their first successful jarvis tool call using only the public pages — no external context required.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases (traceability below).

### SITE — Foundations & Infrastructure

- [ ] **SITE-01**: Docs base-path 404 fixed — deployed docs styled and loading assets; post-deploy smoke probe (`/` and `/docs/` → 200 + marker) proves it
- [ ] **SITE-02**: Unified Astro 5 + Starlight site — landing at `/` and docs at `/docs/` built as one project, deployed as one Pages artifact
- [ ] **SITE-03**: `design/tokens.css` — single design-token layer carrying the new jarvis identity, consumed by landing and docs
- [ ] **SITE-04**: Self-hosted fonts (Fontsource variable fonts) — no third-party font CDN requests
- [ ] **SITE-05**: Node 20→22 bump with `engines` field; `deploy-pages.yml` diff ships in the same commit as any stack change
- [ ] **SITE-06**: URL contract — existing public URLs enumerated, old→new redirect map built, meta-refresh stubs + lookup-table `404.html` shipped with the restructure
- [ ] **SITE-07**: Three CI checks — 3-manifest version agreement, `plugin/.mcp.json` ≡ `plugin/mcp.json`, manifest JSON parse
- [ ] **SITE-08**: Dark mode (toggle, persists) + local search (Pagefind) across docs

### DOCS — Docs Rebuild

- [ ] **DOCS-01**: Tutorial-first quickstart — why → install → `jarvis index` → register per client → first tool call, with expected output shown
- [ ] **DOCS-02**: Per-client install guides — Claude Code, Cursor, Codex CLI, generic stdio JSON
- [ ] **DOCS-03**: Four-channel install matrix — PyPI, Claude plugin, Codex plugin, MCP Registry
- [ ] **DOCS-04**: All 9 tool reference pages with request→response examples and the `{"error": ...}` contract
- [ ] **DOCS-05**: CLI reference — 7 commands with flags and examples
- [ ] **DOCS-06**: Requirements & limits stated before install, led by the language-support matrix (4 nav families / 10 search-only / per-language caveats)
- [ ] **DOCS-07**: Troubleshooting decision tree — symptom → diagnosis → fix, led by uvx cold-start, PATH, scip version-gate
- [ ] **DOCS-08**: Changelog page imported from `../jarvis/CHANGELOG.md`
- [ ] **DOCS-09**: Additive rebuild — every existing docs page classified keep / merge-with-redirect / retire; nav reaches every tool/CLI/troubleshooting page in one click
- [ ] **DOCS-10**: "You'll know it works when…" success/failure shapes inline — first tool call self-verifiable without leaving the page
- [ ] **DOCS-11**: `llms.txt` agent-consumable docs index — generated; ships only after docs content stabilizes (sequencing constraint, enforced by roadmap ordering)
- [ ] **DOCS-12**: MCP Registry deep-link table — registry entry location plus per-client deep links

### LNDG — Landing Page

- [ ] **LNDG-01**: Hero — one-line value prop + copyable primary install command
- [ ] **LNDG-02**: Tiered 9-tool showcase with honest `semanticSearch` (extra + reindex required) and `typeHierarchy` (fork-built scip + reindex required) gating
- [ ] **LNDG-03**: Compact language-support matrix on landing
- [ ] **LNDG-04**: Local-first privacy section — nothing leaves the machine
- [ ] **LNDG-05**: Badges — GitHub, PyPI, MIT, MCP Registry
- [ ] **LNDG-06**: Mobile responsive across all sections
- [ ] **LNDG-07**: Demo panel — simulated query→result with real recorded JSON shapes (deliberately not live)
- [ ] **LNDG-08**: Copy-to-clipboard on all install/command chips
- [ ] **LNDG-09**: Architecture diagrams section — reused from `../jarvis/docs/assets/`, dark-mode-safe rendering
- [ ] **LNDG-10**: Tabbed install widget — channel tabs (installer+uv / plugin marketplace / manual uvx) on hero and quickstart

### SKIL — Plugin Skills

- [ ] **SKIL-01**: Broken `CLAUDE.md` reference removed from jarvis-setup (no CLAUDE.md ships in the plugin)
- [ ] **SKIL-02**: All 3 skills realigned to new positioning; docs URLs updated and linked at tags (never `main`)
- [ ] **SKIL-03**: Skill commands/examples synced with the rebuilt docs
- [ ] **SKIL-04**: Triple-manifest version bump 0.7.2→0.7.3 + Cursor validator pass + `plugin/.mcp.json`≡`plugin/mcp.json` diff as definition of done

### VRFY — Launch Verification

- [ ] **VRFY-01**: Clean-machine cold-install run — fresh macOS/Linux env, public pages only, first successful tool call, honestly timed
- [ ] **VRFY-02**: Claims audit — every factual sentence on landing/docs traced to README/CHANGELOG/synced `setup.sh`/manifests
- [ ] **VRFY-03**: Old-URL crawl — every retired URL serves content or redirect; sitemap matches shipped pages
- [ ] **VRFY-04**: Maintainer docs updated where they reference the old site structure (deployment-guide, code-standards, system-architecture)

### COMM — Community & Outreach

- [ ] **COMM-01**: GitHub Discussions enabled and linked from docs troubleshooting as the support surface
- [ ] **COMM-02**: Video walkthrough — recorded cold-install run embedded on quickstart or landing

## v2 Requirements

(None currently — all formerly deferred items promoted to v1 per user decision, 2026-08-21.)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| `setup.sh` edits | Overwritten from private repo on every release — never edited here |
| jarvis runtime/indexer changes | Live in `../jarvis/`, not this repo |
| Cloud/hosted offering | Deprioritized indefinitely per PDR |
| Fourth client manifest | Three clients (Claude Code, Cursor, Codex) cover the audience |
| Docs-stay-current sync automation | One-time rebuild chosen; upkeep manual |
| Live/WASM in-browser demo | Wrong instrument; violates local-first positioning |
| Hosted search or analytics | Violates static + privacy positioning |
| Multi-version docs | One supported version; plugin floor `>=0.6.0` |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SITE-01 | Phase 1 | Planned |
| SITE-02 | Phase 1 | Planned |
| SITE-03 | Phase 1 | Planned |
| SITE-04 | Phase 1 | Planned |
| SITE-05 | Phase 1 | Planned |
| SITE-06 | Phase 1 | Planned |
| SITE-07 | Phase 1 | Planned |
| SITE-08 | Phase 1 | Planned |
| DOCS-01 | Phase 2 | Planned |
| DOCS-02 | Phase 2 | Planned |
| DOCS-03 | Phase 2 | Planned |
| DOCS-04 | Phase 2 | Planned |
| DOCS-05 | Phase 2 | Planned |
| DOCS-06 | Phase 2 | Planned |
| DOCS-07 | Phase 2 | Planned |
| DOCS-08 | Phase 2 | Planned |
| DOCS-09 | Phase 2 | Planned |
| DOCS-10 | Phase 2 | Planned |
| DOCS-11 | Phase 2 | Planned |
| DOCS-12 | Phase 2 | Planned |
| LNDG-01 | Phase 3 | Planned |
| LNDG-02 | Phase 3 | Planned |
| LNDG-03 | Phase 3 | Planned |
| LNDG-04 | Phase 3 | Planned |
| LNDG-05 | Phase 3 | Planned |
| LNDG-06 | Phase 3 | Planned |
| LNDG-07 | Phase 3 | Planned |
| LNDG-08 | Phase 3 | Planned |
| LNDG-09 | Phase 3 | Planned |
| LNDG-10 | Phase 3 | Planned |
| SKIL-01 | Phase 4 | Planned |
| SKIL-02 | Phase 4 | Planned |
| SKIL-03 | Phase 4 | Planned |
| SKIL-04 | Phase 4 | Planned |
| VRFY-01 | Phase 5 | Planned |
| VRFY-02 | Phase 5 | Planned |
| VRFY-03 | Phase 5 | Planned |
| VRFY-04 | Phase 5 | Planned |
| COMM-01 | Phase 5 | Planned |
| COMM-02 | Phase 5 | Planned |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40 ✓ (Phase 1: 8 · Phase 2: 12 · Phase 3: 10 · Phase 4: 4 · Phase 5: 6)
- Unmapped: 0

---
*Requirements defined: 2026-08-21*
*Last updated: 2026-08-21 — roadmap created; traceability filled (40/40 mapped)*
