# jarvis-index — Public Surface Rebuild

## What This Is

The public distribution surface for **jarvis**, a local-first code-intelligence MCP server (source lives in the private `../jarvis/` repo, ships to PyPI as `jarvis-mcp`). This repo owns the landing page, docs site, and plugin skills that introduce jarvis to developers and ship it to Claude Code, Codex, and Cursor. The current project is a full rebuild of that surface: a new landing identity, tutorial-first docs, realigned plugin skills, and updated maintainer docs — all sourced from the private repo's README, PDR, system-architecture, and CHANGELOG (jarvis 0.6.2).

## Core Value

A cold visitor can land, install, and make their first successful jarvis tool call using only the public pages — no external context required.

## Business Context

- **Customer**: Developers using coding agents (Claude Code, Codex CLI, Cursor) who want structural code intelligence without cloud services
- **Revenue model**: None — MIT open source; the surface exists to drive adoption
- **Success metric**: Cold-install path completed end-to-end from public pages (landing → setup → index → first tool call)
- **Strategy notes**: Product truth is `../jarvis/docs/` (PDR, system-architecture, roadmap); this repo is the only public voice

## Requirements

### Validated

Inferred from existing code (see `.planning/codebase/`):

- ✓ Installer distribution — `setup.sh` bootstraps pinned binaries (scip fork, zoekt, per-language indexers) with SHA256 verification; release assets published here — existing
- ✓ Plugin payload serves three clients — one `plugin/` tree adapted via triple manifests (Claude Code, Cursor, Codex), currently 0.7.2 — existing
- ✓ Auto-registration — plugin install registers `jarvis-server` via `uvx --from jarvis-mcp>=0.6.0` with no manual `mcp add` — existing
- ✓ Three plugin skills ship — `jarvis-setup`, `jarvis-use`, `jarvis-issues` — existing
- ✓ Docs site at `/docs/` (VitePress): quickstart, tools, CLI, concepts, integrations, troubleshooting — existing
- ✓ Landing page at `/` (single-file static HTML) — existing
- ✓ Pages CI assembles landing + docs into one GitHub Pages artifact — existing

### Active

Hypotheses until shipped and validated:

- [ ] New landing identity purpose-built for jarvis — replaces the opengsd.net-derived token system
- [ ] Landing content reflects jarvis 0.6.2: all 9 MCP tools (incl. `typeHierarchy`, `semanticSearch`, `blastRadius`), `jarvis watch`, plugin-install path, language support matrix, known upstream limitations
- [ ] Docs restructured tutorial-first: why → install → first query → per-client setup, with reference depth secondary
- [ ] Reference content completed from `../jarvis/` sources (README, PDR, system-architecture) — no stale claims
- [ ] Plugin skills (`jarvis-setup`, `jarvis-use`, `jarvis-issues`) realigned with new positioning and current product behavior
- [ ] Maintainer docs updated where they reference the old site structure
- [ ] Cold-install path verified end-to-end: a stranger following only public pages reaches a successful first tool call

### Out of Scope

- `setup.sh` edits — file is overwritten from the private repo on every release; never edit here
- jarvis runtime/indexer changes — live in `../jarvis/`, not this repo
- Cloud/hosted offering — deprioritized indefinitely per PDR
- New client integrations beyond Claude Code / Codex / Cursor — no fourth manifest
- Docs-stays-current sync mechanism — one-time rebuild chosen; upkeep stays manual
- Version bumps to the *private* repo's streams — plugin version (0.7.2) and package version (0.6.2) version independently

## Context

- **Brownfield with fresh map**: `.planning/codebase/` (ARCHITECTURE, STACK, STRUCTURE, CONVENTIONS, CONCERNS, INTEGRATIONS, TESTING) refreshed 2026-08-21 — read before planning phases.
- **Product truth**: `../jarvis/README.md` (canonical user-facing doc), `../jarvis/docs/project-overview-pdr.md` (positioning + scope), `../jarvis/docs/system-architecture.md` (deep architecture), `../jarvis/CHANGELOG.md` (0.6.2).
- **Org migration done**: everything lives under `jarvis-intelligence`; PyPI URLs and MCP registry entry (`io.github.jarvis-intelligence/jarvis`) already re-anchored — old `phuongddx` references in copy are stale.
- **Reusable assets**: `../jarvis/docs/assets/` carries canonical diagrams (jarvis-layers, index-pipeline, semantic-fusion in SVG/PNG/DOT).
- **Known drift**: current landing borrows opengsd.net's design wholesale (`docs/brand-spec.md` documents the extraction); docs pages are thin stubs (~1KB per tool); landing claims ("Know, remember, do") diverge from product reality (code intelligence).
- **Four distribution channels** exist today (PyPI, Claude plugin, Codex plugin, MCP Registry) — docs should cover install via all of them.

## Constraints

- **Hosting**: GitHub Pages static output via `deploy-pages.yml` — whatever stack wins, the deployable artifact stays static
- **Stack openness**: docs engine (VitePress today) and landing build step (none today) MAY change if the design demands it — decision deferred to phase planning
- **Plugin delivery**: any `plugin/` change ships only via a synchronized version bump in all three manifests (`plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`)
- **Ownership (hard)**: `setup.sh` source of truth is the private repo — never edited here
- **Version floor**: `--from jarvis-mcp>=0.6.0` in both MCP configs must remain a valid `>=` floor, never below 0.6.0
- **Cursor validator**: marketplace/plugin names lowercase kebab-case; declared paths must resolve relative to `plugin/`
- **Dual MCP config**: `plugin/.mcp.json` and `plugin/mcp.json` are duplicated real files — edit both or neither

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| New landing identity (drop opengsd-derived tokens) | Borrowed design can't carry jarvis positioning; reads as another tool's site | — Pending |
| Tutorial-first docs IA | Audience is both new users (conversion) and installed users (depth); narrative path serves the cold-install core value, reference stays secondary | — Pending |
| Stack open to change | Rebuild is design-led; forcing current stack could constrain the identity — decided in phase planning | — Pending |
| Plugin skills included in scope | One voice across landing, docs, and in-agent skills; positioning drift compounds otherwise | — Pending |
| One-time rebuild, no sync checklist | Manual upkeep accepted for now | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-21 after initialization*
