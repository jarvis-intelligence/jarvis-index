---
phase: 01-site-foundation-identity
reviewed: 2026-08-21T11:53:50Z
depth: standard
files_reviewed: 55
files_reviewed_list:
  - .github/workflows/checks.yml
  - .github/workflows/deploy-pages.yml
  - .gitignore
  - astro.config.mjs
  - design/tokens.css
  - design/url-contract.json
  - docs/brand-spec.md
  - docs/superpowers/specs/2026-08-07-landing-page-design.md
  - package.json
  - plans/0807-2314-landing-page/plan.md
  - public/assets/jarvis-avatar-1024.png
  - public/assets/jarvis-avatar-512.png
  - public/assets/jarvis-avatar.svg
  - public/assets/jarvis-mark-inverse.svg
  - public/assets/jarvis-mark.svg
  - public/brand-logo.html
  - public/favicon.svg
  - scripts/check-manifests.mjs
  - scripts/verify-build.mjs
  - src/content.config.ts
  - src/content/docs/docs/cli/forget.md
  - src/content/docs/docs/cli/index-cmd.md
  - src/content/docs/docs/cli/index.md
  - src/content/docs/docs/cli/list.md
  - src/content/docs/docs/cli/reindex.md
  - src/content/docs/docs/cli/status.md
  - src/content/docs/docs/cli/watch.md
  - src/content/docs/docs/concepts/architecture.md
  - src/content/docs/docs/concepts/blast-radius.md
  - src/content/docs/docs/concepts/scip.md
  - src/content/docs/docs/concepts/semantic-search.md
  - src/content/docs/docs/concepts/zoekt.md
  - src/content/docs/docs/guide/install.md
  - src/content/docs/docs/index.md
  - src/content/docs/docs/integrations/claude-code.md
  - src/content/docs/docs/integrations/codex-cli.md
  - src/content/docs/docs/integrations/cursor.md
  - src/content/docs/docs/integrations/index.md
  - src/content/docs/docs/quickstart.md
  - src/content/docs/docs/tools/blast-radius.md
  - src/content/docs/docs/tools/call-hierarchy.md
  - src/content/docs/docs/tools/document-symbols.md
  - src/content/docs/docs/tools/find-references.md
  - src/content/docs/docs/tools/get-index-status.md
  - src/content/docs/docs/tools/go-to-definition.md
  - src/content/docs/docs/tools/index.md
  - src/content/docs/docs/tools/search-code.md
  - src/content/docs/docs/tools/semantic-search.md
  - src/content/docs/docs/tools/type-hierarchy.md
  - src/content/docs/docs/troubleshooting/common-failures.md
  - src/content/docs/docs/troubleshooting/index.md
  - src/content/docs/docs/troubleshooting/upstream-issues.md
  - src/pages/index.astro
  - src/styles/landing.css
  - src/styles/starlight-tokens.css
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-08-21T11:53:50Z
**Depth:** standard
**Files Reviewed:** 55
**Status:** issues_found

## Summary

This phase migrates the site from VitePress + a static `site/` landing page to a unified Astro + Starlight build. The infrastructure changes (`astro.config.mjs`, `scripts/verify-build.mjs`, `scripts/check-manifests.mjs`, the two workflow files, the token/CSS layer) are internally consistent and I could not find any correctness defect in the build/verification scripts themselves — the URL-contract math, asset-resolution candidate logic, and sitemap-count assertions all check out against the actual repo state (34 contract URLs = 32 docs + landing + `brand-logo.html`; sitemap total = 32 docs locs + 1 landing loc, matching the workflow's own arithmetic).

No Critical/BLOCKER issues found — this is a static site with no user input, no server code, and no secrets. The issues below are a genuine broken cross-reference link in migrated content (per the review brief, flagged in passing), a CI trigger-coverage gap that lets a change to the build-verification script itself ship unverified, and a handful of minor code-quality items (dead CSS, duplicated inline styles, a design-token asymmetry).

## Warnings

### WR-01: Broken internal doc link — `/tools/findReferences` does not match the actual page slug

**File:** `src/content/docs/docs/tools/index.md:15`
**Issue:** The MCP Tools overview table links `[`findReferences`](/tools/findReferences)`, but every other tool page in this same table (and the actual file on disk) uses kebab-case: the real file is `src/content/docs/docs/tools/find-references.md`, which resolves to `/tools/find-references`. After `astro.config.mjs`'s `rebaseDocsLinks()` rewrites this to `${BASE}/docs/tools/findReferences`, the link 404s — this is not caught by `scripts/verify-build.mjs` because V3 (asset/link resolution) only checks the landing page and the docs *home* page, not every docs page's outbound links.
**Fix:**
```diff
- | | [`findReferences`](/tools/findReferences) | Everywhere `X` is used | SCIP index |
+ | | [`findReferences`](/tools/find-references) | Everywhere `X` is used | SCIP index |
```

### WR-02: `deploy-pages.yml` push trigger does not watch `scripts/**`, so a change to the build-verification script itself is never re-run in CI

**File:** `.github/workflows/deploy-pages.yml:8-15`
**Issue:** The `push` path filter is `src/**`, `public/**`, `design/**`, `astro.config.*`, `package.json`, `package-lock.json`, `.github/workflows/deploy-pages.yml`. `scripts/verify-build.mjs` is invoked *inside* this same workflow (`node scripts/verify-build.mjs`), but it is not itself a trigger path, and no other workflow covers it either (`checks.yml`'s path filter is scoped to `plugin/**`/manifest files only). A commit that only edits `scripts/verify-build.mjs` — e.g. weakening a check, or introducing a bug in the V2/V3/V9 logic — will not trigger `deploy-pages.yml` on push to `main`, so the very instrument meant to catch build regressions can regress silently until the next unrelated `src/**`/`public/**` push.
**Fix:** Add `'scripts/**'` (or at minimum `'scripts/verify-build.mjs'`) to the `paths:` list under `push:` in `.github/workflows/deploy-pages.yml`.

### WR-03: `--jv-accent-shadow` is not redefined for dark mode, so a light-mode-tuned shadow tint is used in both themes

**File:** `design/tokens.css:41,60-73`
**Issue:** `--jv-accent-shadow: 33, 82, 148;` (the RGB triple used for `rgba(var(--jv-accent-shadow), …)` box-shadows in `src/styles/landing.css:96`) is defined only in the `:root` (light) block. The `[data-theme='dark']` block redefines `--jv-accent`, `--jv-accent-strong`, `--jv-accent-soft`, etc., but not `--jv-accent-shadow` — dark mode keeps the light-mode blue (`29,82,148`≈`#29527d`) as its shadow tint rather than the dark-mode accent (`#7cafe4` → would be `124,175,228`). This is called out as intentionally "verbatim" from the pre-migration page, so it may be a pre-existing cosmetic quirk rather than something introduced by this phase, but since `design/tokens.css` is now documented as "the single design-token layer" and "no other file may define a color," it's worth deciding deliberately rather than carrying forward silently.
**Fix:** Either add `--jv-accent-shadow: 124, 175, 228;` to the `[data-theme='dark']` block, or add a one-line comment in `tokens.css` next to the `:root` declaration noting the omission is intentional (shadow tint stays constant across themes).

## Info

### IN-01: Dead CSS rule — `.mono-box.static` is never applied

**File:** `src/styles/landing.css:380-381`
**Issue:** `.mono-box.static { cursor: default; }` and its `:hover` override have no corresponding `class="mono-box ... static"` usage anywhere in `src/pages/index.astro` (all 8 `mono-box` elements use `class="mono-box tap"`).
**Fix:** Remove the two rules, or use the class on a `mono-box` that is meant to be non-interactive if one is planned.

### IN-02: Repeated inline `style="…"` attributes duplicate CSS that could be a shared class

**File:** `src/pages/index.astro:316,389`
**Issue:** Two `<div>`s (`install-then` note, `closing` action row) carry identical or near-identical inline `style="display:flex;flex-wrap:wrap;…"` declarations instead of a shared utility class, inconsistent with the rest of the page which is fully class-driven (per `docs/code-standards.md`-style conventions elsewhere in this repo).
**Fix:** Extract a small utility class (e.g. `.flex-wrap-row`) into `landing.css` and use it in both places.

### IN-03: `@astrojs/mdx` is an installed devDependency with zero `.mdx` files and no integration registration

**File:** `package.json:17`, `astro.config.mjs:44-118`
**Issue:** `@astrojs/mdx` is pinned in `devDependencies` but never added to `integrations: […]` in `astro.config.mjs`, and there are no `.mdx` files anywhere under `src/content/docs/`. Per the phase's own research notes this is explicitly a forward-looking pin for Phase 2 (MDX Tabs), and Starlight auto-bundles MDX support regardless — so this is not a functional bug, just an inert dependency for the duration of this phase.
**Fix:** No action needed now; worth a one-line comment in `package.json`'s devDependencies (if the project's conventions allow package.json comments via a sibling doc) or a note in the phase's decision log, so a future contributor doesn't remove it as apparently-unused and doesn't re-add it thinking it's missing.

### IN-04: GitHub Actions steps are pinned to major-version tags (`@v4`, `@v5`), not commit SHAs

**File:** `.github/workflows/deploy-pages.yml:34-57`, `.github/workflows/checks.yml:34,37`
**Issue:** `actions/checkout@v4`, `actions/configure-pages@v5`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` are all pinned to floating major-version tags rather than commit SHAs. This is a supply-chain hardening nit, not a phase-specific regression — the project's own supply-chain discipline elsewhere (`setup.sh`'s exact-commit pins with SHA256 verification, `docs/code-standards.md` "Pin discipline") suggests this convention may be intentionally in scope for GitHub Actions too.
**Fix:** Consider pinning third-party/official Actions to commit SHAs (e.g. `actions/checkout@<sha> # v4.x.x`) if this repo's pin-discipline convention is meant to extend to CI, matching the rationale already applied to `setup.sh`'s dependency pins.

---

_Reviewed: 2026-08-21T11:53:50Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
