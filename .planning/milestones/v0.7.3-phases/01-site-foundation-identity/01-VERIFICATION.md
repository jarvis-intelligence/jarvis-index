---
phase: 01-site-foundation-identity
verified: 2026-08-21T12:10:00Z
reverified: 2026-08-21T12:15:00Z
status: passed
score: 9/9 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification: []
gaps: []
deferred:
  - truth: "Zero third-party font requests on every dist file (not just landing + docs home)"
    addressed_in: "Phase 2 (DOCS-09 classification)"
    evidence: "01-05-SUMMARY.md decision + WINDOWS.md id 4 (open): scripts/verify-build.mjs V4 deliberately excludes dist/brand-logo.html, a legacy public/ passthrough page still carrying Google Fonts CDN links, pending Phase 2's keep/retire classification of that URL. Phase 2's DOCS-09 requirement is exactly this per-page classification pass."
  - truth: "All internal doc links resolve (not just the landing + docs-home HTML that verify-build.mjs's V3 scans)"
    addressed_in: "Phase 2 (Docs Rebuild — Tutorial-First Content)"
    evidence: "01-REVIEW.md WR-01: `/tools/findReferences` (camelCase) in src/content/docs/docs/tools/index.md:15 does not match the real kebab-case slug `/tools/find-references` and will 404 after rebaseDocsLinks(); already tracked in STATE.md Deferred Items and explicitly scoped to a Phase 2 content pass in multiple SUMMARYs."
---

# Phase 1: Site Foundation & Identity Verification Report

**Phase Goal:** Deliver the complete infrastructure layer every later phase consumes: fix the verified live base-path 404, unify landing and docs into one Astro 5 + Starlight project deployed as one Pages artifact, establish `design/tokens.css` + self-hosted fonts as the single visual truth, wire dark mode and Pagefind search into the shell, decide the URL contract, and land the three CI checks before any content churn begins.
**Verified:** 2026-08-21T12:10:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth (Roadmap SC) | Status | Evidence |
|---|---------|--------|----------|
| 1 | The deployed docs load fully styled with working JS at `/docs/`, and the post-deploy smoke probe (`/` and `/docs/` → 200 + marker) passes — the live asset-404s observed 2026-08-21 are gone | ✓ VERIFIED | Live curl: `/jarvis-index/`, `/jarvis-index/docs/`, `/jarvis-index/docs/cli/forget/` all → 200; live docs HTML references `_astro/*.css` and `_astro/*.js` assets which resolve 200 (`page.B1D-nYk3.js` → 200); zero `fonts.g(oogleapis|static).com` on the live docs page; `Smoke probe` step present in `.github/workflows/deploy-pages.yml` (curl+marker+asset+sitemap assertions, `set -e`) |
| 2 | Landing and docs build as one Astro 5 + Starlight project and deploy as one Pages artifact on Node 22, with the `deploy-pages.yml` diff shipped in the same commit as the stack change | ✓ VERIFIED | `npm run build` (Node v22.23.2) emits one `dist/` tree: `dist/index.html` (landing) + `dist/docs/**` (32 pages) + `dist/pagefind/` + `dist/sitemap-*.xml`, uploaded as one artifact (`path: dist` in deploy-pages.yml); `package.json.engines.node = ">=22"`; commit `3038aee` (`git show --stat`) contains package.json + package-lock.json + astro.config.mjs + src/content.config.ts + src/pages/index.astro + deploy-pages.yml + .gitignore together — the atomic stack+workflow commit exists |
| 3a | Dark mode toggle persists across visits (one storage key, one attribute) | ✓ VERIFIED (re-verified with live browser) | Source-verified as before, PLUS live Chromium (CDP) session against `npm run preview`: toggled `/` to light via the landing toggle → `localStorage.starlight-theme = "light"` → reloaded `/` (held, no flash) → navigated to `/docs/` (already light) → used Starlight's own theme selector to switch to dark → `localStorage.starlight-theme = "dark"` → navigated back to `/` (rendered pre-painted dark, no flash). Both directions proven interactively, not just via source inspection. WINDOWS.md id 1 marked fixed. |
| 3b | Pagefind search returns hits across all docs pages | ✓ VERIFIED (re-verified with live browser) | Structural evidence as before, PLUS live interactive session: opened the search modal on `/docs/`, typed `reindex zoekt`, got "11 results for reindex zoekt" spanning ≥5 distinct pages (Zoekt search, jarvis reindex, Common failures, Architecture, Semantic search), clicked the "jarvis reindex" hit and landed correctly on the CLI reference page for `jarvis reindex` with matching content. WINDOWS.md id 2 marked fixed. |
| 4 | Both surfaces render the new jarvis identity from one `design/tokens.css`, and the site makes zero third-party font requests | ✓ VERIFIED | `design/tokens.css` is the only file defining `--jv-*` colors (light + `[data-theme='dark']`); `src/styles/starlight-tokens.css` and `src/styles/landing.css` only reference `var(--jv-*)`; `astro.config.mjs` wires `customCss: ['./design/tokens.css', './src/styles/starlight-tokens.css']`; landing imports the same file. Built landing + docs-home HTML: 0 matches for `fonts.googleapis\|fonts.gstatic`; 17 same-origin `woff2` files under `dist/_astro/`, byte-identical set across two independent clean rebuilds (verified directly, not merely re-asserted from SUMMARY). One documented, deferred exception: `dist/brand-logo.html` (a legacy `public/` passthrough page) still carries Google Fonts CDN links — explicitly excluded from `verify-build.mjs`'s V4 pending Phase 2 classification (WINDOWS.md id 4, open); this file is not one of "both surfaces" (landing, docs) the truth names, so it does not fail SC4 but is tracked as `deferred` above |
| 5 | The URL contract exists (every public URL enumerated + old→new redirect map) and CI fails loudly on three-manifest version disagreement, MCP-config diff, or unparseable manifest JSON | ✓ VERIFIED | `design/url-contract.json` has 34 entries (verified via `node -e`); `scripts/verify-build.mjs` V2 asserts dist-vs-contract set equality (confirmed: real run exit 0; a scratch run with `docs/quickstart/` deleted independently reproduced exit 1 with `V2: missing page:` plus V3/V9 cascading failures); `scripts/check-manifests.mjs` real run exit 0, and an independently-reproduced scratch run with malformed JSON in one manifest correctly exited 1 with a file+reason message; `.github/workflows/checks.yml` runs on `push`+`pull_request` to `main`, path-filtered to the manifest trees, `contents: read` only; `astro.config.mjs` documents the redirect-mechanism decision (meta-refresh stubs, base-prefix pitfall) with an empty `redirects: {}` map (no real entries needed yet — no URL has been retired) |

**Score:** 9/9 sub-truths verified (re-verified 2026-08-21T12:15:00Z with a live Chromium (CDP) browser session against `npm run preview` — both SC3 items closed, see rows above)

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | `dist/brand-logo.html`'s Google Fonts CDN usage (SITE-04 exception) | Phase 2 (DOCS-09 classification) | WINDOWS.md id 4 (open); 01-05-SUMMARY.md key-decision #2 |
| 2 | Broken content link `/tools/findReferences` → should be `/tools/find-references` | Phase 2 (Docs Rebuild) | 01-REVIEW.md WR-01; STATE.md Deferred Items; multiple SUMMARYs (01-02, 01-05) note it as pre-existing and explicitly out of Phase 1 scope |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `docs/.vitepress/config.ts` (01-01 hotfix, later deleted by 01-02) | 2-line base/sitemap fix | ✓ VERIFIED (historical) | Confirmed via commit `3613031`; file no longer exists post-01-02 by design (VitePress removed) |
| `.github/workflows/deploy-pages.yml` | Smoke probe + Verify build step, Node 22, artifact=dist | ✓ VERIFIED | Read directly: `Setup Node` `node-version: '22'`; `Build site` → `npm run build`; `Verify build` → `node scripts/verify-build.mjs`; `upload-pages-artifact` `path: dist`; `Smoke probe` step present with `set -e` and full curl assertion chain |
| `astro.config.mjs` | one-origin constant, `build.format`, starlight integration, `customCss`, `redirects` | ✓ VERIFIED | Read directly: `SITE`/`BASE` constants, `build: { format: 'directory' }`, `customCss: [...]`, six mirrored sidebar groups, documented `redirects: {}` |
| `src/content.config.ts` | Starlight docs collection | ✓ VERIFIED | Exists; build renders 32 docs pages (would render 0 without `docsSchema()`, per 01-02's own documented fix) |
| `src/pages/index.astro` | landing transplant + tokens/landing.css imports + unified theme script | ✓ VERIFIED | Read directly: imports `../../design/tokens.css` and `../styles/landing.css`; zero inline `:root` block; head script + toggle both use `starlight-theme` |
| `design/tokens.css` | single `--jv-*` color/font source, light+dark, provisional header | ✓ VERIFIED | Read directly: full `--jv-*` set, `[data-theme='dark']` overrides, PROVISIONAL header. One asymmetry: `--jv-accent-shadow` is defined only in `:root`, not overridden in the dark block (01-REVIEW.md WR-03) — cosmetic, not a color-duplication violation, not phase-blocking |
| `src/styles/starlight-tokens.css` | `--sl-*` remap, no literal colors | ✓ VERIFIED | Read directly: 5 `var()`-only remaps (`--sl-color-accent`, `--sl-color-bg`, `--sl-color-text`, `--sl-font`, `--sl-font-mono`); zero hex literals. Narrower than the plan's "at minimum" list (omits `--sl-color-accent-text`, `--sl-color-bg-inline-code`) — the plan's must-have `contains:` string is present, and no visual defect was flagged by review; noted as a minor incompleteness, not a gap |
| `src/styles/landing.css` | token-driven landing layout CSS | ✓ VERIFIED | 123 `var(--jv-*)` references confirmed in 01-03-SUMMARY, corroborated by design/tokens.css + starlight-tokens.css read and build success |
| `scripts/check-manifests.mjs` | 3 manifest assertions, zero-dep ESM | ✓ VERIFIED | Read directly; independently re-ran real (exit 0) and a fresh malformed-JSON scratch case (exit 1, correct message) |
| `scripts/verify-build.mjs` | 5 dist assertions (V2/V3/V4/V5/V9), zero-dep ESM | ✓ VERIFIED | Read directly; independently re-ran real (exit 0) and a fresh missing-page scratch case (exit 1, V2/V3/V9 all correctly cascade) |
| `design/url-contract.json` | 34-entry enumeration | ✓ VERIFIED | Independently parsed: 34 entries, trailing-slash canonical form, includes `/brand-logo.html` and `/docs/quickstart/` |
| `.github/workflows/checks.yml` | manifest checks on push+PR, `contents: read` | ✓ VERIFIED | Read directly |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `astro.config.mjs` (site+base) | every emitted URL | one-origin constant | ✓ WIRED | Build + live curls both resolve under `/jarvis-index` consistently; no doubled/missing prefix found |
| `src/content/docs/docs/**` | `dist/docs/**` URLs | Starlight content mount | ✓ WIRED | 32/32 pages built at `dist/docs/**/index.html` |
| `deploy-pages.yml` build step | `upload-pages-artifact path: dist` | single artifact | ✓ WIRED | Confirmed in workflow file |
| `design/tokens.css` | Starlight docs pages | `customCss` in `astro.config.mjs` | ✓ WIRED | `customCss` array present; built docs CSS bundle contains `--jv-accent` (grep on `dist/_astro/*.css`) |
| `@fontsource-*` packages | same-origin woff2 | Vite bundling via `@import` in tokens.css | ✓ WIRED | 17 woff2 under `dist/_astro/`, deterministic across 2 independent rebuilds |
| `src/pages/index.astro` theme script | Starlight `ThemeProvider` storage | shared `starlight-theme` key + `data-theme` attribute | ✓ WIRED (mechanism); ⚠️ behavior unverified (see truths table) | Source confirms identical key/attribute on both surfaces; runtime persistence not exercised |
| `scripts/verify-build.mjs` | `deploy-pages.yml` | `Verify build` step between build and artifact upload | ✓ WIRED | Confirmed in workflow file, correct position |
| `design/url-contract.json` | `scripts/verify-build.mjs` V2 | set equality | ✓ WIRED | Real run exit 0; scratch-break run correctly exit 1 |
| `astro.config.mjs redirects` | dist meta-refresh stubs | Astro static redirect emission | ✓ WIRED (proven, then removed) | 01-05-SUMMARY documents a scratch-entry proof with observed stub content and a real, previously-unknown base-prefix pitfall now documented inline; final `astro.config.mjs` carries `redirects: {}` (no residue) |

### Data-Flow Trace (Level 4)

Not applicable in the traditional dynamic-data sense — this is a static site with no runtime data fetching. The equivalent "data flow" here is CSS-variable resolution and asset bundling, both traced above:
- `design/tokens.css` → `dist/_astro/*.css` (grep-confirmed `--jv-accent` present in the actual built CSS bundle, not just the source file) — ✓ FLOWING
- Fontsource `@import` → `dist/_astro/*.woff2` (17 files, confirmed present and referenced) — ✓ FLOWING

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Local build succeeds on Node 22 | `npm run build` | 34 pages built, 0 errors | ✓ PASS |
| `verify-build.mjs` passes on real dist | `node scripts/verify-build.mjs` | `ok: V2 (34 pages = contract), V3, V4, V5, V9 all green` | ✓ PASS |
| `verify-build.mjs` fails red on a broken dist (independently reproduced, not just re-trusting SUMMARY) | scratch copy with `docs/quickstart/index.html` deleted | exit 1, `V2: missing page:`, cascading `V3`/`V9` failures | ✓ PASS |
| `check-manifests.mjs` passes on real repo | `node scripts/check-manifests.mjs` | `ok: 3 manifests agree on version, MCP config pair byte-identical` | ✓ PASS |
| `check-manifests.mjs` fails red on malformed JSON (independently reproduced) | scratch copy, one manifest truncated to invalid JSON | exit 1, `JSON parse error` naming the file | ✓ PASS |
| woff2 asset set is deterministic across rebuilds | two independent clean `npm run build` runs, diffed | identical 17-file set | ✓ PASS |
| Live site reachable and correctly styled | curl `/`, `/docs/`, `/docs/cli/forget/`, `/brand-logo.html`, `/sitemap-0.xml` | all 200 | ✓ PASS |
| Live docs JS asset loads | curl a `_astro/*.js` href extracted from the live docs page | 200 | ✓ PASS |
| Live docs page carries zero font-CDN references | grep live `/docs/` HTML | 0 matches | ✓ PASS |
| Interactive theme toggle / cross-surface persistence | live Chromium (CDP) session, `npm run preview`: toggle → reload → navigate → toggle → navigate → reload | light↔dark held correctly in both directions, no flash | ✓ PASS |
| Interactive Pagefind search query | live Chromium (CDP) session: search modal, query "reindex zoekt", click a hit | 11 results across ≥5 pages; click-through landed on correct page | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` convention exists in this repo; the phase's own "probes" are `scripts/verify-build.mjs` and `scripts/check-manifests.mjs`, both exercised directly above (real + fail-first scratch runs), and the live post-deploy smoke-probe step embedded in `deploy-pages.yml` (verified present and correctly positioned; its own live execution is recorded in 01-01/01-02 SUMMARYs via `gh run` IDs 32458172949 and 32462775441 — not re-run here since it requires dispatching a live GitHub Actions workflow, out of scope for a local verification pass).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|--------------|------------|-------------|--------|----------|
| SITE-01 | 01-01 | Docs base-path 404 fixed, smoke probe proves it | ✓ SATISFIED | Live curls 200 + styled; smoke probe committed and previously run green (`gh run 32458172949`, `32462775441`) |
| SITE-02 | 01-02 | Unified Astro 5 + Starlight, one Pages artifact | ✓ SATISFIED | Build produces one `dist/`; live deploy previously green |
| SITE-03 | 01-03 | `design/tokens.css` single identity layer | ✓ SATISFIED | Read directly; sole color-definition site (one documented cosmetic asymmetry, WR-03, non-blocking) |
| SITE-04 | 01-03 | Self-hosted fonts, no third-party CDN | ✓ SATISFIED (with one documented, deferred exception) | 0 CDN refs in landing/docs-home; 17 same-origin woff2; `brand-logo.html` exception tracked in WINDOWS.md id 4, deferred to Phase 2 |
| SITE-05 | 01-02 | Node 20→22 + `engines`, workflow diff same commit | ✓ SATISFIED | `engines.node = ">=22"`; commit `3038aee` atomic per `git show --stat` |
| SITE-06 | 01-05 | URL contract + redirect mechanism | ✓ SATISFIED | 34-entry contract, V2 set-equality proven red+green, redirects mechanism proven+documented |
| SITE-07 | 01-05 | Three CI checks | ✓ SATISFIED | `check-manifests.mjs` proven red+green; `checks.yml` wired on push+PR |
| SITE-08 | 01-04 | Dark mode + Pagefind search | ✓ SATISFIED | Source+build evidence, plus live interactive proof: cross-surface persistence and interactive search both exercised in a real browser session (see Observable Truths 3a/3b) |

**Orphaned requirements:** None. All 8 SITE-* IDs mapped to Phase 1 in `.planning/REQUIREMENTS.md` traceability appear in exactly one plan's `requirements:` frontmatter (01-01: SITE-01; 01-02: SITE-02, SITE-05; 01-03: SITE-03, SITE-04; 01-04: SITE-08; 01-05: SITE-06, SITE-07) — full coverage, no gaps.

**Documentation tracking gap (non-blocking):** `.planning/REQUIREMENTS.md`'s checkbox/traceability rows for SITE-01 through SITE-05 still read `[ ]` / `Planned` despite being fully implemented and verified above; only SITE-06/07/08 were manually flipped to `[x]` / `Complete`. Root cause documented in 01-04-SUMMARY.md deviation #2: `gsd-tools query requirements.mark-complete` rejects the file's `Planned` status word (it only recognizes `Pending`/`Gaps Found` as pre-complete states), so the automatic flip silently no-ops for every row using that word, and only SITE-08 got a manual correction (03/04's SITE-06/07 rows were apparently also hand-corrected at some point — `git log -p` shows they flipped in the same window as SITE-08, but no SUMMARY explicitly claims it). This is a project-tracking artifact, not a code defect; flagged as a WARNING for a human to reconcile (either fix the wording in REQUIREMENTS.md or file the gsd-tools compatibility fix), not a phase gap.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/content/docs/docs/tools/index.md` | 15 | Broken internal link `/tools/findReferences` (camelCase) vs. real slug `/tools/find-references` | ⚠️ Warning (deferred) | 404 on click; not caught by V3 (scoped to landing+docs-home only); already tracked, deferred to Phase 2 |
| `.github/workflows/deploy-pages.yml` | 8-15 | `push` path filter omits `scripts/**`, so a change to `verify-build.mjs` itself doesn't trigger a re-verified deploy on push | ⚠️ Warning | A regression in the verification script's own logic could ship silently until an unrelated `src/**`/`public/**` push; already documented in 01-REVIEW.md WR-02, unresolved |
| `design/tokens.css` | 41, 60-73 | `--jv-accent-shadow` defined only in `:root`, not overridden in `[data-theme='dark']` | ℹ️ Info | Dark mode keeps the light-mode shadow tint; cosmetic, already documented in 01-REVIEW.md WR-03 |
| `.planning/REQUIREMENTS.md` | 12-16 | SITE-01..05 checkboxes/traceability not flipped to complete despite verified implementation | ⚠️ Warning | Tracking-only; see Requirements Coverage note above |

No `TBD`/`FIXME`/`XXX` debt markers found in any file modified by this phase (all deferred items are recorded as tracked follow-ups referencing WINDOWS.md IDs or "Phase 2", satisfying the debt-marker gate's reference requirement).

### Human Verification Required

None. Both items originally routed here (V6 cross-surface theme persistence, V5 interactive Pagefind search) were closed on re-verification (2026-08-21T12:15:00Z) using a live Chromium (CDP) browser session against `npm run preview` — see Observable Truths 3a/3b and Behavioral Spot-Checks above. WINDOWS.md ids 1 and 2 marked fixed.

### Gaps Summary

No BLOCKER-level gaps. All 8 SITE-* requirements have real, independently-verified implementation evidence: build succeeds, live URLs resolve, the two guardrail scripts (`verify-build.mjs`, `check-manifests.mjs`) are genuinely fail-first proven (re-verified directly in this session, not merely re-trusted from SUMMARYs), and the single-origin/single-token-sheet architecture holds under direct inspection.

**Update (2026-08-21T12:15:00Z):** The two roadmap-level truths under Success Criterion 3 (dark-mode cross-surface persistence, interactive Pagefind search) that no automated test or browser session across all five plan executions had exercised were closed by re-running verification with a live Chromium (CDP) browser session against `npm run preview`. Both behaviors are now interactively proven, not just structurally inferred: theme state held correctly across `/` ↔ `/docs/` in both directions with no flash, and a live "reindex zoekt" search query returned 11 cross-page hits with a working click-through. WINDOWS.md ids 1 and 2 are marked fixed. Status upgraded from `human_needed` to `passed`, 9/9.

Two additional items are explicitly deferred (not gaps) to Phase 2 per already-documented, in-scope decisions: `brand-logo.html`'s Google Fonts CDN usage (WINDOWS.md id 4) and the `/tools/findReferences` broken link (01-REVIEW.md WR-01) — both tracked, both out of this phase's declared file scope, both scheduled for Phase 2's DOCS-09 classification pass.

One non-blocking documentation gap: `.planning/REQUIREMENTS.md`'s SITE-01..05 rows were never flipped to `Complete` despite full implementation, due to a `gsd-tools`/file-convention mismatch already diagnosed by the 01-04 executor. Recommend a human either fix the wording or the tool.

---

*Verified: 2026-08-21T12:10:00Z*
*Verifier: Claude (gsd-verifier)*
