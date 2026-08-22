---
phase: 03-landing-page-rebuild
reviewed: 2026-08-23T12:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/pages/index.astro
  - src/components/landing/Badges.astro
  - src/components/landing/DemoPanel.astro
  - src/components/landing/Diagrams.astro
  - src/components/landing/InstallWidget.astro
  - src/components/landing/LanguageMatrix.astro
  - src/components/landing/ToolShowcase.astro
  - src/styles/landing.css
  - design/tokens.css
  - src/data/demo-scenarios.json
  - src/content/docs/docs/quickstart.mdx
  - src/content/docs/docs/guide/requirements.md
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-23T12:00:00Z
**Depth:** standard
**Files Reviewed:** 12 (11 source + 1 data JSON)
**Status:** issues_found

## Summary

Reviewed all Phase 3 landing-page-rebuild source changes (commits a5a0b6b..099f571) across 6 Astro components, 1 CSS file, 1 token file, 2 doc files, and 1 data fixture. The two runtime defects already fixed during browser verification (hero grid overflow, arrow-key nav) are acknowledged but not re-reported.

Found one critical token-deletion regression (`--jv-chip-ring` removed from tokens.css but still referenced in landing.css), three warnings (broken anchor link, missing dark-mode card shadow, demo panel missing roving tabindex), and two info items (dead CSS class, gate-chip hardcoded colors).

## Critical Issues

### CR-01: Deleted token `--jv-chip-ring` still referenced in landing.css

**File:** `src/styles/landing.css:390,416,424`
**Issue:** Commit a5a0b6b replaced `--jv-chip-ring: rgba(124, 175, 228, 0.26)` with `--jv-muted-soft` and `--jv-mask-opaque` in `design/tokens.css`, but three references to `--jv-chip-ring` in `landing.css` were not updated. The token resolves to `initial` (empty), causing:
- `.mono-box` border (line 390) disappears — command chips render borderless
- `.mono-box.static:hover` border-color (line 416) is empty
- `.exchange` inset box-shadow border (line 424) disappears — demo panel terminal chrome loses its inner border

This affects both light and dark themes.

**Fix:** Restore `--jv-chip-ring` in `design/tokens.css` (both `:root` and dark override), or replace the three `landing.css` references with an equivalent token. The original value was `rgba(124, 175, 228, 0.26)` in light mode; the dark theme inherited the same value (was not separately overridden).

```css
/* design/tokens.css — :root */
--jv-chip-ring: rgba(124, 175, 228, 0.26);

/* design/tokens.css — [data-theme='dark'] */
--jv-chip-ring: rgba(124, 175, 228, 0.18);
```

## Warnings

### WR-01: Broken anchor link in LanguageMatrix — Java/Maven caveat

**File:** `src/components/landing/LanguageMatrix.astro:21`
**Issue:** The href `#java-maven-on-macos-requires-bash--44` contains a double hyphen (`--44`), but Starlight's heading slugify strips the `>=` characters and collapses consecutive hyphens, producing `#java-maven-on-macos-requires-bash-44` (single hyphen). The link scrolls to the wrong position (top of page) instead of the Java/Maven section in requirements.md.

Verified by running Starlight's slugify algorithm against the heading `Java (Maven) on macOS: requires bash >= 4.4`.

**Fix:**
```html
<!-- Line 21: change --44 to -44 -->
<a class="text-link" href="/jarvis-index/docs/guide/requirements/#java-maven-on-macos-requires-bash-44">Maven on macOS</a>
```

### WR-02: Dark-mode `--jv-card-shadow` removed — cards nearly invisible shadow

**File:** `design/tokens.css:64-78` (dark override block)
**Issue:** The dark-theme override for `--jv-card-shadow` (`0 18px 46px rgba(0, 0, 0, 0.2)`) was deleted during token refinement. Dark-mode cards now inherit the light-mode value (`0 18px 48px rgba(18, 24, 38, 0.08)`), which is a very subtle shadow designed for light backgrounds — nearly invisible against `#040506`. The 9 tool cards and accented cards all use `var(--jv-card-shadow)`.

**Fix:** Restore a dark-specific card shadow in `[data-theme='dark']`:
```css
[data-theme='dark'] {
  /* ... existing overrides ... */
  --jv-card-shadow: 0 18px 46px rgba(0, 0, 0, 0.2);
}
```

### WR-03: Demo panel tabs lack roving tabindex

**File:** `src/components/landing/DemoPanel.astro:7-18`
**Issue:** The `.demo-step-btn` buttons use `role="tab"` and `aria-selected`, and arrow-key navigation is implemented (lines 85-91), but all three buttons have implicit `tabIndex="0"` (default for `<button>`). In the ARIA tabs pattern, only the active tab should be in the tab order; inactive tabs should have `tabIndex="-1"`. Currently, pressing Tab cycles through all three step buttons instead of skipping directly past the tablist to the panel content.

The sibling `InstallWidget.astro` correctly implements roving tabindex (line 62: `t.tabIndex = match ? 0 : -1`).

**Fix:** Add roving tabindex to the `show()` function in the demo panel script:
```js
function show(n) {
  // ... existing aria-hidden/display logic ...
  btns.forEach(function (b, i) {
    b.setAttribute('aria-selected', i === n ? 'true' : 'false');
    b.tabIndex = i === n ? 0 : -1;
  });
  // ... rest unchanged ...
}
```
And add `tabindex="-1"` to the two non-initial buttons in the template (lines 10-11 equivalent).

## Info

### IN-01: Dead CSS class `.label-storage`

**File:** `src/styles/landing.css:644`
**Issue:** `.diagram .label-storage` is defined but no element in `Diagrams.astro` uses the class. It was likely intended for the storage seam label in the layers diagram but the diagram uses `.s` (generic secondary text) instead.

**Fix:** Remove the unused rule, or add `class="label-storage"` to the L4 storage label text in `Diagrams.astro` if the amber color was intended.

### IN-02: Gate-chip uses hardcoded hex colors instead of tokens

**File:** `src/styles/landing.css:505,508,511,512`
**Issue:** `.gate-chip` uses four hardcoded hex values (`#b8860b`, `#92610a`, `#d4a853`) instead of `--jv-*` tokens. This breaks the project's token discipline ("design/tokens.css: single source of truth for all colors" per tokens.css header comment). The UI-SPEC explicitly called for tokenizing diagram colors but gate-chip amber was overlooked.

**Fix:** Add gate-chip tokens to `design/tokens.css` (light and dark) and reference them. Low priority since the visual result is correct — this is a maintainability concern only.

---

_Reviewed: 2026-08-23T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_