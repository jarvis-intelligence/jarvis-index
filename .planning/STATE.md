---
gsd_state_version: 1.0
current_phase: 4
current_phase_name: Plugin Skills Realignment & Release
status: planning
stopped_at: Phase 3 complete, ready to plan Phase 4
last_updated: "2026-08-22T19:22:30.391Z"
last_activity: 2026-08-23
last_activity_desc: Phase 3 complete, transitioned to Phase 4
state_head: e3764b181b8fa907aa628f3fd94a48bcc198ea56
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 15
  completed_plans: 15
  percent: 60
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-21)

**Core value:** A cold visitor can land, install, and make their first successful jarvis tool call using only the public pages — no external context required.
**Current focus:** Phase 02 — Docs Rebuild — Tutorial-First Content

Phase: 4 — Plugin Skills Realignment & Release
Plan: Not started
Status: Ready to plan
Last activity: 2026-08-23 — Phase 3 complete, transitioned to Phase 4

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**

- Total plans completed: 15
- Average duration: 16 min/plan
- Total execution time: 48 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 5 | - | - |
| 2 | 7 | - | - |
| 3 | 3 | - | - |
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P04 | 10min | 2 tasks | 1 files |
| Phase 01 P05 | 55min | 3 tasks | 8 files |
| Phase 02 P01 | 8min | 3 tasks | 15 files |
| Phase 02 P02 | 15min | 3 tasks | 10 files |
| Phase 02 P03 | 4min | 3 tasks | 9 files |
| Phase 02 P03 | 4min | 3 tasks | 9 files |
| Phase 02 P04 | 12min | 3 tasks | 8 files |
| Phase 02 P05 | 6min | 2 tasks | 8 files |
| Phase 02 P06 | 12min | 3 tasks | 5 files |
| Phase 02 P07 | 12min | 2 tasks | 2 files |

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
- [Phase 01]: Verification: V5 (interactive Pagefind search) and V6 (cross-surface theme persistence) closed by re-running verification with a live Chromium (CDP) browser session against `npm run preview` — both proven interactively, not just structurally; WINDOWS.md ids 1/2 marked fixed, phase VERIFICATION.md upgraded human_needed → passed (9/9)
- [Phase 02]: Plan 02-01: 34-URL classification audit found zero redundant pages — keep x34, zero retires, confirming 02-RESEARCH's pre-planning prediction; no redirects map entry was needed
- [Phase 02]: Plan 02-01: brand-logo.html fonts self-hosted from public/fonts/ (stable names copied from dist/_astro/'s hashed Fontsource output); verify-build V4 exclusion removed, WINDOWS.md id 4 closed
- [Phase 02]: Plan 02-01: WR-01 fixed — tools/index.md's findReferences link now targets /tools/find-references/ (kebab-case, trailing slash)
- [Phase 2]: [Phase 02]: Plan 02-02: getIndexStatus's real shape now carries last_index_run and capabilities fields added to ../jarvis since 02-RESEARCH was written (2026-08-21) — documented the full current shape rather than the plan's now-stale contract subset (source wins per A4)
- [Phase 2]: [Phase 02]: Plan 02-02: all 9 tool reference pages deepened with real transcripts traced through ../jarvis source + test fixtures (TypeScript toy-repo); semanticSearch's D-08 caution is the sole aside across all 9 pages, typeHierarchy's prior danger aside removed
- [Phase 2]: [Phase 02]: Plan 02-03: index_cli.py's argparse block moved from the 02-RESEARCH-cited 1118-1177 to build_parser() at 1256-1318 in the now-1328-line file — all flags/entry-points re-verified against current source, matched byte-for-byte
- [Phase 2]: [Phase 02]: Plan 02-04: requirements.md matrix rows follow the plan's own family naming (TypeScript/TSX, Java/Kotlin as combined rows, not per-extension); caveat cells link forward to ### anchors; :::caution used exactly twice (Android/Gradle, Kotlin auto-degrades only)
- [Phase 2]: [Phase 02]: Plan 02-04: the locked anchor contract for common-failures.md was verified against the built dist HTML id= attributes (not just source markdown) before being handed to plan 02-06
- [Phase 2]: [Phase 02]: Plan 02-04: changelog.md body constructed via shell redirect (frontmatter + tail -n +2 of ../jarvis/CHANGELOG.md) rather than manual transcription, diff-proven byte-identical
- [Phase 2]: [Phase 02] Plan 02-05: Codex/Cursor plugin-marketplace commands sourced from this repo's own README.md (source of truth here), not the private jarvis repo which doesn't document per-client plugin commands
- [Phase 2]: [Phase 02] Plan 02-05: cursor:// deeplink base64 payload computed and decode-verified in the acceptance grep pipeline, not hand-typed — matches the changelog verbatim-diff pattern from 02-04
- [Phase 2]: [Phase 2]: [Phase 02] Plan 02-06: MDX+Tabs machinery proven via a tracer task (install-matrix.mdx) before the quickstart reused the same syncKey=client Tabs group — same canonical four-label order across both pages
- [Phase 2]: [Phase 2]: [Phase 02] Plan 02-06: quickstart's getIndexStatus/goToDefinition transcripts reused verbatim from the already-verified 02-02 tool reference pages (toy-repo/Greeter) rather than re-derived, keeping one source of truth
- [Phase 2]: [Phase 2]: [Phase 02] Plan 02-06: dropped quickstart's standalone What-you'll-get/Prerequisites sections and duplicate body H1 in favor of the five-step structure + D-14 requirements link, matching the no-duplicate-H1 convention already applied across Phase 2
- [Phase 2]: [Phase 02] Plan 02-07: V10 build-assertion dimension placed after V9 in verify-build.mjs, derives origin exclusively from contract.origin (never hardcoded) — the same single-source-of-truth pattern V2 uses for the page-set check, closing DOCS-11's link-poisoning threat (T-02-13)
- [Phase 2]: [Phase 02] Plan 02-07: llms.txt sections mirror the Starlight sidebar groups verbatim and every link description is copied from that page's own frontmatter description — zero re-authored prose, keeping the agent index and human nav in lockstep with no second source of truth
- [Phase 3]: Phase-02 human verification closed via real system Chrome against npm run preview: the harness's embedded headless Chromium blob-wraps Web Workers, breaking Pagefind worker-mode relative fetches while the site is fine — all Phase 5 browser verification must use real Chrome via app.path
- [Phase 4]: [Phase 03]: Landing rebuilt as single-scroll conversion surface — real-Chrome verification found+fixed 2 runtime defects (hero grid minmax(0,1fr) 8c0ffc6; widget roving tabindex 6ff3335); code review fixed 5/6 (WR-01 anchor claim rejected — built id IS bash--44); UI review 23/24 advisory, accent-shadow dark override + inline-style extraction applied

### Blockers/Concerns

- [Phase 01] Dispatch-before-push runs the workflow against a stale remote ref (observed in 01-02: run 32462513702 built the old tree, green but meaningless). Always `git push` before `gh workflow run --ref <branch>`.
- [Phase 01] `gh` needs the phuongddx account (admin) for workflow dispatch + Pages branch-policy APIs on jarvis-intelligence/jarvis-index; phuongdoanduy is read-only there.
- [Phase 01] `.planning/REQUIREMENTS.md` traceability rows for SITE-01..05 still read `Planned`/unchecked despite verified implementation — `gsd-tools requirements mark-complete` only recognizes `Pending`/`Gaps Found` as pre-complete states, so it silently no-ops on the `Planned` wording. Non-blocking (tracking-only); a maintainer should either reword REQUIREMENTS.md or file the gsd-tools compatibility fix.
- [Phase 02] `gsd-tools query state.advance-plan` cannot parse this STATE.md's `Plan: 02-02 complete (02-03 next)` prose format (expects legacy `Current Plan`/`Total Plans in Phase` fields or a `Plan: X of Y` compound) — errored with "Cannot parse Current Plan or Total Plans in Phase from STATE.md" during 02-03's close-out. Worked around by hand-editing the `Plan:` line directly; `state.update-progress`/`state.record-metric`/`state.add-decision`/`state.record-session` all worked fine (they don't depend on that field). Non-blocking; same class of format-compatibility gap as the REQUIREMENTS.md row above. Recurred identically at 02-05's close-out (still non-blocking, same workaround).
- [Phase 02] Plan 02-05: `requirements mark-complete DOCS-02` returned `not_found` for the same reason as the SITE-01..05 row above — DOCS-02's traceability row read `Planned` (not `Pending`/`Gaps Found`), so the CLI silently no-op'd. Hand-edited both the checkbox and the traceability Status cell to reflect verified completion. DOCS-01/03/04/09/10 rows carry the identical stale `Planned` wording and will hit the same gap when their owning plans complete.
- [Phase 02] Plan 02-06: `state.advance-plan` and `requirements mark-complete DOCS-01 DOCS-03 DOCS-10 DOCS-12` recurred identically (same two gaps documented above). Hand-edited the `Plan:` prose line and all four requirements' checkboxes + traceability Status cells. DOCS-04 and DOCS-09 rows still carry stale `Planned` wording (DOCS-04 belongs to already-complete plan 02-02 and was left as a pre-existing gap out of this plan's scope; DOCS-09 remains genuinely open).
- [Phase 02] Plan 02-07 (phase close-out): both gaps recurred one final time for this phase — `state.advance-plan` errored identically on the `Plan:` prose line, and `requirements mark-complete DOCS-11` returned `not_found` (its traceability row read `Planned`). Hand-edited the `Plan:` line and DOCS-11's checkbox + traceability Status cell. Phase 2 is now fully complete except DOCS-09, whose row still carries stale `Planned` wording — genuinely open, tracked for a future audit/maintainer pass, not silently dropped.
- [Phase 02] Verification pass (02-VERIFICATION.md): confirmed DOCS-04 and DOCS-09 were content-complete all along (never a real gap) — the 02-06 note above was itself the stale-wording symptom, not a missed requirement. Hand-edited both rows' checkboxes + traceability Status cells to `Complete`. All 12 DOCS-01..12 requirements now read `Complete` in REQUIREMENTS.md; the tooling-recognition gap itself (not the wording) remains open for a future gsd-tools fix.

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| docs-content | ~~Pre-existing broken link `/tools/findReferences` (camelCase)~~ RESOLVED by 02-01 (WR-01): link now targets `/tools/find-references/` | resolved | 2026-08-22 | M1 |
| fonts | ~~Landing still references Google Fonts CDN~~ RESOLVED by 01-03: CDN links deleted, Fontsource self-hosted (17 woff2), zero third-party font requests | resolved | 2026-08-21 | M1 |

## Session Continuity

Last session: 2026-08-22T17:11:15.002Z
Stopped at: Phase 3 complete, ready to plan Phase 4
Resume file: .planning/phases/03-landing-page-rebuild/03-UI-SPEC.md
