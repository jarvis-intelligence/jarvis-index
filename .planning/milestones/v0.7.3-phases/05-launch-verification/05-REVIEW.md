---
phase: 05-launch-verification
reviewed: 2026-08-23T12:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - scripts/crawl-urls.sh
  - src/components/landing/ColdInstallPlayer.astro
  - src/components/landing/InstallWidget.astro
  - src/content/docs/docs/guide/install.md
  - src/content/docs/docs/guide/requirements.md
  - src/content/docs/docs/quickstart.mdx
  - src/content/docs/docs/troubleshooting/common-failures.md
  - docs/claims-audit-table.md
findings:
  critical: 0
  warning: 3
  info: 1
  total: 4
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-08-23T12:00:00Z
**Depth:** standard
**Files Reviewed:** 8

## Narrative Findings (AI reviewer)

### WN-01: crawl-urls.sh — `trap … EXIT` clobbers any prior EXIT trap

**File:** `scripts/crawl-urls.sh`
**Line:** 96
**Severity:** WARNING
**Issue:** The sitemap-equality section sets `trap 'rm -f "$sitemap_tmp"' EXIT` at line 96. If a prior EXIT trap was set (or is set earlier in the script by a caller sourcing it), this replaces it. In practice the script is only ever executed, never sourced, so this is benign today — but it violates the `setup.sh` convention documented in the project's own Shell Conventions ("Temp cleanup via trap, cleared on every exit path") and will bite if the pattern is copy-pasted into a context where a prior trap exists.

**Fix:** Append instead of replace: `trap 'rm -f "$sitemap_tmp"' EXIT` can stay as-is given the script is self-contained. No action required for this change, but note for future scripts.

---

### WN-02: `--python 3.13` pin inconsistent across docs surface

**File:** `src/content/docs/docs/troubleshooting/common-failures.md`
**Lines:** 19, 66, 78, 88
**Severity:** WARNING
**Issue:** The quickstart and install guide consistently pin `uv tool install --python 3.13 jarvis-mcp` (6 occurrences across `quickstart.mdx` and `install.md`). However, the troubleshooting page omits the pin in all four fix blocks:
- Line 19: `uv tool install jarvis-mcp` (cold-start fix)
- Line 66: `uvx --python 3.13 --from "jarvis-mcp[semantic]" jarvis-server` (semantic fix — pins the *uvx* but the surrounding text says "Pin the Python version explicitly in your MCP client's registration" without mentioning the `uv tool install` path)
- Line 78: `uv tool install "jarvis-mcp[semantic]"` (semantic fix — no pin)
- Line 88: `uv tool install "jarvis-mcp[watch]"` (watch fix — no pin)

The quickstart explicitly documents why the pin matters (line 104-107): without it, `uv tool install` on a machine with only Python 3.12 can resolve an older `jarvis-mcp` below the `>=0.6.0` floor. The troubleshooting page's `uv tool install` fix blocks are the most likely place a user hits this exact scenario (they're here because something broke).

**Fix:** Add `--python 3.13` to all `uv tool install` commands in `common-failures.md` (lines 19, 78, 88). The `uvx` line 66 is correct as-is (it's a runtime registration, not an install). Consistency with the quickstart is the user-expected behavior.

---

### WN-03: Node.js 18+ requirement may be stale

**File:** `src/content/docs/docs/guide/requirements.md`
**Line:** 34
**Severity:** WARNING
**Issue:** The requirements page states "Node.js 18+ (`npm`)". The project's own CLAUDE.md stack section and CI both pin Node 20 (`node-version: '20'` in `deploy-pages.yml`). The `scip-typescript` and `scip-python` npm packages may require 18+, but the only Node.js usage in this repo is VitePress (which requires 18+). No evidence in this repo confirms 18 is sufficient for the `scip-*` indexers — the private `jarvis/` repo would have that data. If scip-typescript/scip-python require 20+, the requirement floor is wrong.

**Fix:** Verify the actual minimum Node.js version required by `scip-typescript` and `scip-python` (check their `package.json` `engines` fields in the private repo). If 18 works, add a comment noting the VitePress floor vs. the indexer floor. If 20 is required, update to "Node.js 20+".

---

### IN-01: ColdInstallPlayer has no accessible name or fallback

**File:** `src/components/landing/ColdInstallPlayer.astro`
**Lines:** 9, 15-16
**Severity:** INFO
**Issue:** The player container `<div id="cold-install-player">` has no `role`, `aria-label`, or visible heading. The `data-cast` attribute is set via `getAttribute('data-cast')` in JS. While this is a static data value (no user input), the container is semantically anonymous to assistive technology. The nearby quickstart section has a `## Watch the cold install` heading, but the player div itself is not associated with it via `aria-labelledby`.

**Fix:** Add `role="region" aria-labelledby="cold-install-heading"` to the div and ensure the `## Watch the cold install` heading has `id="cold-install-heading"`. The heading is in the MDX, so the id may need to be set explicitly with an `{#id}` directive.

---

## Out-of-scope confirmations (no issues found)

- **crawl-urls.sh POSIX correctness:** `sh -n` passes clean. Quoting is consistent. Here-doc python embed uses single-quoted delimiter (`<<'URLS'`, `<<EOF`) so no shell expansion. Exit semantics: `exit 1` inside the `while` loop subshell (line 31, 87) correctly triggers the `|| failures=$((failures + 1))` pipe-fail pattern. The `set -eu` is present.
- **ColdInstallPlayer BASE_URL handling:** `import.meta.env.BASE_URL` is correct for Astro. Template literal in `data-cast` attribute is safe — the value is a compile-time constant from the build config.
- **ColdInstallPlayer XSS surface:** `data-cast` is set from a static template literal (`${base}/assets/asciinema/cold-install.cast`). No user input reaches this path. The `asciinema-player.min.js` processes a local `.cast` file with v2 JSON lines — all output-event strings. No injection risk from static data.
- **ColdInstallPlayer `is:inline` script:** IIFE pattern is correct. `AsciinemaPlayer` global is guarded by `typeof` check before use, with `window.addEventListener('load', ...)` fallback. Script order (CSS link → player JS → init script) is correct for non-module scripts.
- **Cold-start claim scoping:** Quickstart line 211-214 and troubleshooting line 12-15 are now consistent: both state that macOS and common Linux glibc platforms have prebuilt wheels (fast), and other platforms build from source (5+ min). This matches the corrected claim.
- **setup.sh untouched:** Confirmed — `git diff 4126993..HEAD -- setup.sh` is empty.
- **No third-party URLs introduced:** All new `https://` URLs in the diff point to known domains (github.com, pypi.org, astral.sh, sourcegraph).
- **claims-audit-table.md:** All 44 rows have Status = "Traced" with specific evidence locators. No evidence-less rows. Resolutions section at bottom correctly documents 3 rows that needed post-hoc correction. The `../jarvis/` references are expected (they point to the private repo for evidence). Table structure is sound.

## REVIEW COMPLETE: issues_found
- Critical: 0
- Warning: 3 (WN-01: trap clobber, WN-02: --python 3.13 pin inconsistency, WN-03: Node.js floor uncertain)
- Info: 1 (IN-01: ColdInstallPlayer a11y)
- **Top findings:** WN-02 is the most user-impacting — a user following the troubleshooting fix for cold-start will run an unpinned `uv tool install` which is the exact scenario the quickstart warns about.
