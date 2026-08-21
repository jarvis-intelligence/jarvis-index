---
gsd_state_version: 1.0
current_phase: 01
current_phase_name: Site Foundation & Identity
status: executing
stopped_at: Completed 01-05-PLAN.md (URL contract, manifest CI checks, redirect mechanism)
last_updated: "2026-08-21T11:44:19.631Z"
last_activity: 2026-08-21
state_head: 3df5cb0a5003b82af18f6d7a3c5ef199bf3a9aeb
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 5
  completed_plans: 5
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-21)

**Core value:** A cold visitor can land, install, and make their first successful jarvis tool call using only the public pages — no external context required.
**Current focus:** Phase 01 — Site Foundation & Identity

Phase: 01 (Site Foundation & Identity) — EXECUTING
Plan: 5 of 5 (01-03 complete; next: 01-04 theme storage-key unification)
Status: Ready to execute
Last activity: 2026-08-21

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 3
- Average duration: 16 min/plan
- Total execution time: 48 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3 | 48 min | 16 min |
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P04 | 10min | 2 tasks | 1 files |
| Phase 01 P05 | 55min | 3 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: engine decision closed — SITE-02 mandates unified Astro 5 + Starlight; Phase 1 builds it (npm pins + `/docs/` mount verification happen at Phase 1 planning)
- Roadmap: COMM-01/02 placed in Phase 5 with launch verification — video walkthrough doubles as the recorded VRFY-01 cold-install run
- Roadmap: URL contract decided in Phase 1 (SITE-06), executed in Phase 2 (DOCS-09), verified in Phase 5 (VRFY-03)
- Plan 01-01: smoke probe resolves absolute asset URLs against the origin (not BASE — VitePress emits absolute `/jarvis-index/docs/assets/*` hrefs; prefixing BASE would double `/jarvis-index`)
- Plan 01-01: probe asset regex matches both `assets/` (VitePress) and `_astro/` (Astro post-01-02) — step survives the stack swap unedited; asserts EVERY referenced hashed asset + live sitemap segment equality
- Plan 01-01: github-pages environment allows deploys from `main` only — dispatched proof from a phase branch requires a temporary deployment-branch-policy (added, used, deleted; restored to recorded original). Future dispatched deploys from non-main branches hit the same gate.
- Plan 01-02: build.format 'directory' (not the planned 'file') — 'file' would 404 the five live index URLs (/docs/, /docs/tools/, …); 'directory' keeps index URLs byte-exact and 301s old extensionless deep URLs (verified live both before and after the swap). Deep-page canonical form is now trailing-slash.
- Plan 01-02: Starlight docs collection REQUIRES schema: docsSchema() — without it the production draft-filter silently renders zero docs pages
- Plan 01-02: root-relative markdown links are rebased by a zero-dep rehype plugin inside astro.config.mjs (Astro, unlike VitePress, does not apply base to content links); Phase 2 content rewrite can retire it
- Plan 01-02: title frontmatter is mandatory on every Starlight page (derived from first h1 during migration); VitePress containers mechanically converted (warning→caution; code-groups unwrapped to bold labels — Tabs are Phase 2)
- Plan 01-02: deploy-pages.yml paths are src/**, public/**, design/**, astro.config.*, package*.json, self — public/ added (first-class artifact source), site/** and docs/** dropped
- Plan 01-03: Starlight customCss paths resolve against the Astro project root — entries are './design/tokens.css' + './src/styles/starlight-tokens.css' (the research's '../' form escapes the repo and breaks the build; verified in @astrojs/starlight virtual-user-config.ts)
- Plan 01-03: Fontsource variable families register as 'Geist Variable' / 'Geist Mono Variable' — token font stacks must use those names or the woff2 ships but never applies; Rajdhani (static 600/700) keeps its name. All three verified loading via document.fonts.check
- Plan 01-03: token values are PROVISIONAL (live palette transplanted under --jv-*); Phase 3 refines the same variables, never forks them; three non-token literals in landing.css (#9aa4ac, #000 mask) await Phase 3 tokenization
- Plan 01-03: harness shell grep (pi-uu-grep) treats parens as regex groups — use grep -F for parenthesized verify patterns on this machine
- [Phase 01]: Plan 01-04: landing theme re-keyed onto Starlight's starlight-theme/data-theme contract, anti-FOUC script moved to head is:inline; legacy jarvis-theme key fully removed
- [Phase 01]: Plan 01-04: Pagefind index lands at the build root pagefind directory (base-relative), not nested under the docs subpath as RESEARCH assumed - 01-05 verify-build.mjs must check the correct location
- [Phase 01]: Plan 01-05: url-contract.json enumerates the real build.format:'directory' trailing-slash URL form (not RESEARCH Pattern 7's stale extensionless enumeration) — same class of correction as 01-04's Pagefind-path fix
- [Phase 01]: Plan 01-05: Astro redirects destinations must be written as ${BASE}/... — Astro does not prepend base to a bare redirect destination automatically (verified on a scratch entry; a bare destination 404'd, missing /jarvis-index)
- [Phase 01]: Plan 01-05: verify-build.mjs V4 (font-origin) excludes dist/brand-logo.html — legacy public/ passthrough page still on Google Fonts CDN, deferred to Phase 2 DOCS-09 classification (tracked in WINDOWS.md id 4)

### Blockers/Concerns

- Dispatch-before-push runs the workflow against a stale remote ref (observed in 01-02: run 32462513702 built the old tree, green but meaningless). Always `git push` before `gh workflow run --ref <branch>`.
- `gh` needs the phuongddx account (admin) for workflow dispatch + Pages branch-policy APIs on jarvis-intelligence/jarvis-index; phuongdoanduy is read-only there.

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| docs-content | Pre-existing broken link `/tools/findReferences` (camelCase) — broken live under VitePress too; fix with Phase 2 content pass | acknowledged | 2026-08-21 | M1 |
| fonts | ~~Landing still references Google Fonts CDN~~ RESOLVED by 01-03: CDN links deleted, Fontsource self-hosted (17 woff2), zero third-party font requests | resolved | 2026-08-21 | M1 |

## Session Continuity

Last session: 2026-08-21T11:44:19.621Z
Stopped at: Completed 01-05-PLAN.md (URL contract, manifest CI checks, redirect mechanism)
Resume file: None
