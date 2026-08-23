---
phase: 02-docs-rebuild-tutorial-first-content
fixed_at: 2026-08-22T16:28:00Z
review_path: .planning/phases/02-docs-rebuild-tutorial-first-content/02-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-08-22T16:28:00Z
**Source review:** .planning/phases/02-docs-rebuild-tutorial-first-content/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6 (CR-01, CR-02, WR-01, WR-02, WR-03, WR-04 — critical_warning scope; IN-01/IN-02 skipped as out of scope)
- Fixed: 6
- Skipped: 0

**Verification environment:** `workflow.use_worktrees` is `false` in `.planning/config.json`, so all edits, commits, and gate runs (`npm run build && npm run verify`) happened directly in the main checkout on branch `gsd/phase-1-site-foundation-identity` — no isolated worktree was created. These verification numbers are reproducible from this same checkout/branch.

## Fixed Issues

### CR-01: verify-build.mjs's V3 dimension cannot detect the missing-BASE-prefix bug it exists to catch

**Files modified:** `scripts/verify-build.mjs`
**Commit:** `4e502ab`
**Applied fix:** Changed the `ref.startsWith('/')` (missing-prefix) branch of `checkAssetResolution()` to call `fail('V3', ...)` and `continue` immediately, instead of silently setting `fromDistRoot = ref` and letting it resolve against `dist/` (which almost always succeeds because Astro's `base` isn't reflected in the physical directory layout). Matches the fix suggested in the review exactly.

Verified by reproducing the review's own repro: after `npm run build`, injected `<a href="/favicon.svg">test</a>` into `dist/index.html` and re-ran `node scripts/verify-build.mjs` directly — it now fails with `V3: absolute reference missing "/jarvis-index" prefix: "/favicon.svg" in index.html` and exit code 1 (previously exited 0). Restored `dist/index.html` afterward. A clean `npm run build && npm run verify` passes with the standard "all green" message and the 39-page URL contract intact.

### CR-02: `jarvis-server.md`'s documented command drops the version floor and pollutes the CWD

**Files modified:** `src/content/docs/docs/cli/jarvis-server.md`
**Commit:** `2c88ef7`
**Applied fix:** Quoted the version constraint: `uvx --from "jarvis-mcp>=0.6.0" jarvis-server`, matching the quoting convention already used everywhere else this string appears in the docs.

Verified with `sh -c 'set -x; : --from "jarvis-mcp>=0.6.0" jarvis-server'` — the shell now treats the whole string as one argument (no `>` redirection), confirmed no stray `=0.6.0` file is created. `npm run build && npm run verify` passes.

### WR-01: Broken anchor link to `typeHierarchy` entry in Upstream Issues

**Files modified:** `src/content/docs/docs/troubleshooting/index.md`
**Commit:** `6f115b0`
**Applied fix:** Appended the missing `-v090` suffix to the anchor: `#typehierarchy-empty-on-upstream-scip-v090`, matching the real Starlight-generated heading id confirmed in the built `dist/docs/troubleshooting/upstream-issues/index.html` (`id="typehierarchy-empty-on-upstream-scip-v090"`).

Verified against a real build: `grep` of the built HTML confirms both the heading `id` and the link `href` now match exactly. `npm run build && npm run verify` passes.

### WR-02: Inconsistent `kind` value casing in `documentSymbols` example response

**Files modified:** `src/content/docs/docs/tools/document-symbols.md`
**Commit:** `74195d6`
**Applied fix:** Changed the fourth `kind` entry (line 81) from `"Method"` to `"METHOD"`, matching the other three entries in the same JSON example and the upper-case convention used by every other tool page.

Verified all 4 JSON code blocks in the file still parse via `JSON.parse`. `npm run build && npm run verify` passes.

### WR-03: `typeHierarchy`'s nested `symbol.kind` example diverges from the sibling hierarchy tool's casing

**Files modified:** `src/content/docs/docs/tools/type-hierarchy.md`
**Commit:** `1b1fa7e`
**Applied fix:** Changed `"kind": "Interface"` to `"kind": "INTERFACE"` (upper-case, per the review's suggested options). Chose `INTERFACE` over `TYPE` because the surrounding prose explicitly describes `Animal` as an interface that `Greeter` implements — this keeps the example semantically accurate while fixing the casing inconsistency; no other page in the docs currently uses `INTERFACE` so this introduces no new conflict.

Verified all 5 JSON code blocks in the file still parse via `JSON.parse`. `npm run build && npm run verify` passes.

### WR-04: `astro.config.mjs`'s link-rebase plugin has no guard against links that already carry a scope prefix

**Files modified:** `astro.config.mjs`
**Commit:** `35b009b`
**Applied fix:** Added `href !== '/' && !href.startsWith(BASE)` to the `rebaseDocsLinks()` condition, exactly as suggested in the review, so a future link to the site root or an already-`BASE`-prefixed path is not double-rebased.

Verified: `node -c astro.config.mjs` passes syntax check; a full `npm run build && npm run verify` afterward confirms all 39 contract pages still build and every dimension (V2/V3/V4/V5/V9/V10) reports green — no regression from the added guard condition, since no current content link triggers the new exclusion branches.

## Skipped Issues

None — all 6 in-scope findings (CR-01, CR-02, WR-01, WR-02, WR-03, WR-04) were fixed. IN-01 and IN-02 were excluded by `fix_scope: critical_warning` and left untouched for a future info-tier pass.

---

_Fixed: 2026-08-22T16:28:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
