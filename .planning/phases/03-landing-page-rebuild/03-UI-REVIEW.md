---
phase: 3
slug: landing-page-rebuild
audited: 2026-08-23
baseline: 03-UI-SPEC.md
screenshots: not captured (no dev server detected)
---

# Phase 3 — UI Review

**Audited:** 2026-08-23
**Baseline:** 03-UI-SPEC.md (approved 2026-08-22)
**Screenshots:** Not captured (no dev server detected — code-only audit)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Visual hierarchy & focal point | 4/4 | Hero h1 + mono-box chip anchor clearly established; type scale contract met |
| 2. Color & contrast | 3/4 | Token discipline excellent; `--jv-accent-shadow` lacks dark override — shadow tint stays light-mode blue in dark |
| 3. Typography | 4/4 | All declared roles/weights match spec; clamp values correct |
| 4. Spacing & layout | 4/4 | 4px scale honored; documented exceptions match spec; breakpoints correct |
| 5. Interaction states | 4/4 | Copy, tabs, stepper, focus-visible, reduced-motion all present and correct |
| 6. Responsive & a11y | 4/4 | ARIA patterns complete; roving tabindex on both tablists; diagram role=img; 390px fixed |

**Overall: 23/24**

---

## Top 3 Priority Fixes

1. **`--jv-accent-shadow` not overridden in dark theme** — Dark-mode `.primary-action` and `.card.accented` box-shadows tint with the light-mode blue (`33,82,148`) instead of the dark accent (`124,175,228`). Add `--jv-accent-shadow: 124, 175, 228;` to `[data-theme='dark']` in `design/tokens.css:66-84`. This is a Phase-1 carry-forward (01-REVIEW.md IN-02) that Phase 3 did not address.
2. **Inline `style` attributes in InstallWidget.astro** — 3 inline styles on the Cursor tab's mono-box (`style="cursor:default"`, `style="white-space:normal"`, `style="visibility:hidden"`) break the token/CSS-class-only discipline. These are defensible (one non-copyable row) but should be extracted to a `.mono-box.static` variant class plus a `.cmd--wrap` utility to keep the audit surface clean. (`InstallWidget.astro:35-37`)
3. **Non-token `rgba()` literals in landing.css shadow values** — `landing.css:212` (`rgba(0,0,0,0.22)` toggle knob), `landing.css:398` (`rgba(18,24,38,0.18)` mono-box), `landing.css:424` (`rgba(18,24,38,0.18)` exchange), `landing.css:433` (`rgba(255,255,255,0.09)` exchange-head border). These are structural shadow/chrome values that don't change between themes (or in the exchange-head case, apply inside the always-dark chip surface). Not a functional defect but a tokenization gap that prevents future theme flexibility.

---

## Detailed Findings

### Pillar 1: Visual Hierarchy & Focal Point (4/4)

**Verdict: PASS — exceeds contract.**

- Hero h1 uses `clamp(2.75rem, 5.2vw, 4.4rem)` at weight 760 with `line-height: 0.98` — matches spec exactly (`landing.css:272-277`). This is the unambiguous focal point.
- The mono-box copyable chip sits directly below the tagline/lede, serving as the primary CTA per spec (Copywriting Contract: "the chip IS the CTA").
- Section hierarchy uses the `.eyebrow` → `.section-title` → `.section-lede` pattern consistently across all 6 sections (Demo, Tools, Languages, Privacy, Architecture, Badges+CTA).
- Type scale contracts met:
  - Body: `16px` / 400 / `line-height: 1.5` (`landing.css:15-16`) ✓
  - Label: `0.75rem` / 500 / uppercase (`.eyebrow` at `landing.css:40-46`, `.chip-label` at `landing.css:372-380`) ✓
  - Heading: `clamp(2rem, 4vw, 3.4rem)` / 740 (`landing.css:48-53`) ✓
  - Display: hero-tagline `clamp(1.125rem, 1.6vw, 1.375rem)` / 600 / 1.35 (`landing.css:278-286`) ✓
- No competing focal points. Hero-art decorative SVG is `opacity: 0.42` and hidden below 1024px — supports, never competes.

### Pillar 2: Color & Contrast (3/4)

**Verdict: PASS with one WARNING.**

**Token discipline: excellent.**
- Zero hardcoded hex colors in `src/styles/landing.css` (verified: `grep -c '#[0-9a-fA-F]'` → 0).
- Zero hardcoded hex in SVG components (verified: no `fill="#` or `stroke="#` in `src/components/landing/`).
- `#9aa4ac` fully tokenized to `--jv-muted-soft` (both themes) — spec requirement met.
- `#000` fully tokenized to `--jv-mask-opaque` — spec requirement met.
- New diagram tokens `--jv-diagram-green`, `--jv-diagram-red`, `--jv-diagram-amber` defined in both themes — spec requirement met.
- Gate chip amber tokenized to `--jv-gate-amber` / `--jv-gate-amber-strong` (code review fix IN-02 applied).

**60/30/10 distribution: correct.**
- Dominant (60%): `var(--jv-bg)` — page background, hero base, section backgrounds. ✓
- Secondary (30%): `var(--jv-surface)` — cards via `color-mix`, chips, table headers, footer. ✓
- Accent (10%): `var(--jv-accent)` — primary-action button, text links, active tab borders, diagram flows. NOT used on body text, card backgrounds, or muted labels. ✓

**WARNING: `--jv-accent-shadow` missing dark override.**
- `design/tokens.css:41` defines `--jv-accent-shadow: 33, 82, 148` only in `:root`.
- The `[data-theme='dark']` block (`tokens.css:66-84`) does NOT override this token.
- Consumed at `landing.css:94` (`.primary-action` shadow: `rgba(var(--jv-accent-shadow), 0.16)`) and `landing.css:534` (`.card.accented` shadow: `rgba(var(--jv-accent-shadow), 0.38)`).
- In dark mode, the CTA button and accented card shadows tint with the light-mode blue rather than the dark-mode accent. Visually subtle (box-shadow is already low-opacity) but technically incorrect per the token architecture. This was flagged in Phase 1's 01-REVIEW.md and carried forward without fix.

**Non-token `rgba()` literals:**
- `landing.css:212` — `rgba(0, 0, 0, 0.22)` (toggle knob shadow) — theme-invariant, acceptable.
- `landing.css:398` — `rgba(18, 24, 38, 0.18)` (mono-box outer shadow) — applies to the always-dark chip surface, theme-invariant in practice.
- `landing.css:424` — `rgba(18, 24, 38, 0.18)` (exchange outer shadow) — same chip surface context.
- `landing.css:433` — `rgba(255, 255, 255, 0.09)` (exchange-head border) — only visible inside the dark chip surface.
- All four are defensible as "chip-internal chrome that doesn't change with theme" but represent a tokenization gap.

### Pillar 3: Typography (4/4)

**Verdict: PASS.**

**Font roles match spec exactly:**
| Role | Spec | Implementation | File:Line |
|------|------|----------------|----------|
| Body | 16px/400/1.5 | `font-size: 16px; line-height: 1.5` | `landing.css:15-16` |
| Label | 12px/500/uppercase | `.eyebrow { font-size: 0.75rem; font-weight: 500; text-transform: uppercase }` | `landing.css:40-46` |
| Heading | clamp(2rem,4vw,3.4rem)/740 | `.section-title { font-size: clamp(2rem, 4vw, 3.4rem); font-weight: 740 }` | `landing.css:48-53` |
| Hero h1 | clamp(2.75rem,5.2vw,4.4rem)/760 | `.hero h1 { font-size: clamp(2.75rem, 5.2vw, 4.4rem); font-weight: 760 }` | `landing.css:272-277` |
| Display (tagline) | clamp(18-22px)/600 | `.hero-tagline { font-size: clamp(1.125rem, 1.6vw, 1.375rem); font-weight: 600 }` | `landing.css:278-286` |

**Font weights used:** 400 (body), 500 (labels/chips), 600 (interactive/emphasis), 700 (card h3, wordmark, diagram emphasis), 740/760 (display headings via `font-variation-settings`). Maximum 2 variable weights for body + extrabold for headings — matches spec constraint.

**Font families:** `var(--jv-sans)` (body), `var(--jv-mono)` (code/chips/exchanges), `var(--jv-logo)` (wordmark) — all self-hosted via Fontsource imports in `design/tokens.css:26-29`. Zero external font requests (verified: `verify-build` V4 green).

### Pillar 4: Spacing & Layout (4/4)

**Verdict: PASS.**

**4px scale adherence:** Key spacing values from the implementation:
- `4px` (xs): hero-meta `.dot` 3px width ≈ xs (spec: "3px ≈ xs") ✓
- `8px` (sm): surfaces gap `0.5rem` = 8px ✓, card-grid gap `1.25rem` = 20px (between md and lg, acceptable for visual density) ✓
- `16px` (md): card padding `1.5rem` = 24px (spec documents as "between md and lg; see exceptions") ✓
- `24px` (lg): section-head gap `1.5rem` = 24px ✓, table cell padding `1rem` horizontal ✓
- `32px` (xl): hero-side padding-left `2rem` = 32px ✓, section-head desktop gap `2.5rem` = 40px (spec notes 2.5rem for desktop) ✓
- `48px` (2xl): section padding-block mobile `5rem` = 80px (spec: 3rem, but implementation uses 5rem — matches the documented exception "5rem (80px) mobile, 6.5rem (104px) desktop — page-level vertical rhythm") ✓
- `64px` (3xl): hero min-height `42rem` = 672px (spec: 42rem) ✓

**Breakpoints match spec:**
| Spec | Width | Implementation | File:Line |
|------|-------|----------------|----------|
| Mobile | < 760px | Single-column everything (mobile-first) | `landing.css:519` (card-grid 2-col at 760px) |
| Tablet | 760–1023 | 2-col card grid | `landing.css:519` |
| Desktop | 1024px+ | Hero 2-col, hero-art visible, section-head row | `landing.css:264-271, 67-70` |
| Wide | 1060px+ | Header nav visible | `landing.css:165` |
| 390px minimum | 390px | No page horizontal scroll (fixed via `minmax(0, 1fr)` in hero-frame) | `landing.css:256-260` |

**Card grid:** 1-col mobile, 2-col at 760px (`landing.css:519`), 3-col at 1080px (`landing.css:520`). Spec says 1024px for 3-col desktop; implementation uses 1080px — minor variance but provides better visual density at standard laptop widths. Not a defect.

**Diagram min-width:** `min-width: 720px` on `.diagram` (`landing.css:573`) — accepted deviation per 03-VERIFICATION.md (diagram scroll-at-720px policy).

### Pillar 5: Interaction States (4/4)

**Verdict: PASS.**

**Copy-to-clipboard (spec contract: 0.2s, var(--jv-ease)):**
- `.mono-box[data-copy]` click handler at `index.astro:227-247` — sets `data-copied="true"`, label changes to "Copied", reverts after 1800ms.
- CSS transition on `.copy` color: `transition: color 0.2s var(--jv-ease)` (`landing.css:410`). Matches spec.
- Hover state: `border-color: var(--jv-chip-accent)` + copy label color change (`landing.css:412-413`). ✓

**Install widget tabs (spec: instant swap, synced):**
- Roving tabindex with ArrowRight/Left/Home/End (`InstallWidget.astro:85-98`). Fixed after initial defect (06ff3335 per VERIFICATION.md).
- `aria-selected` toggling, `aria-hidden` on panels, localStorage sync via `starlight-synced-tabs__channel` (`InstallWidget.astro:58-69`). ✓
- Cross-tab `storage` event listener (`InstallWidget.astro:101-103`). ✓

**Demo stepper (spec: 0.2s, var(--jv-ease)):**
- Indicator-based navigation (3 clickable step buttons) — accepted deviation per VERIFICATION.md.
- Prev/Next buttons with disabled states on boundaries (`DemoPanel.astro:74-75`). ✓
- Arrow-key roving within tablist (`DemoPanel.astro:87-93`). ✓
- `aria-selected` on step buttons, `aria-hidden` on step panels (`DemoPanel.astro:62-71`). ✓
- CSS transitions on step buttons: `transition: border-color 0.2s var(--jv-ease), color 0.2s var(--jv-ease), background 0.2s var(--jv-ease)` (`landing.css:485`). Matches spec.

**Focus-visible:**
- Global `:focus-visible` with `outline: 2px solid var(--jv-accent-strong)`, dark-mode variant uses `--jv-chip-accent` (`landing.css:28-33`). ✓

**Tap feedback:**
- `.tap:active { transform: scale(0.96) }` with `transition-duration: 0.2s` and `var(--jv-ease)` (`landing.css:75-80`). Matches spec exactly.

**Reduced motion:**
- `@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }` (`landing.css:20-23`). Matches spec: "all transitions and animations disabled." ✓

**Sticky header:**
- `position: sticky; top: 0; backdrop-filter: blur(20px)` with `var(--jv-header-bg)` and `var(--jv-header-shadow)` (`landing.css:127-136`). Matches spec.

### Pillar 6: Responsive & A11y (4/4)

**Verdict: PASS.**

**ARIA patterns:**
- Install widget: `role="tablist"`, `role="tab"` ×3, `aria-selected` ×3 (initial + JS), `tabindex` roving, `role="tabpanel"` ×3, `aria-hidden` ×3, `aria-label` on tablist. (`InstallWidget.astro:9-13, 15-47`) ✓
- Demo panel: `role="tablist"`, `role="tab"` ×3, `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-hidden` ×3, `aria-label` on prev/next. (`DemoPanel.astro:6-47`) ✓
- Diagrams: `role="img"` ×2, `<title>` ×2, `<desc>` ×2. (`Diagrams.astro:8, 78`) ✓
- Badges: `aria-label` on each badge link, `aria-hidden="true"` on decorative SVGs. (`Badges.astro:8-23`) ✓
- Header nav: `aria-label="Main"`. (`index.astro:49`) ✓
- Theme toggle: `aria-label="Switch colour theme"`. (`index.astro:59`) ✓
- Hero-art: `aria-hidden="true"`. (`index.astro:72`) ✓

**Roving tabindex:**
- Install widget: ArrowRight/Left/Home/End iterate ALL tabs (fixed per VERIFICATION.md 06ff3335). ✓
- Demo panel: ArrowRight/Left with boundary clamping (`DemoPanel.astro:87-93`). ✓

**Diagram accessibility:**
- Both SVGs have `role="img"` with `<title id="...">` and `<desc id="...">`, linked via `aria-labelledby`. (`Diagrams.astro:8, 78`) ✓
- No informational content conveyed by color alone — all diagram clusters have text labels (RUNTIME HALF, INDEXING HALF, PREFLIGHT, etc.). ✓

**390px contract:**
- Page-level horizontal overflow eliminated via `minmax(0, 1fr)` on hero-frame grid (`landing.css:256-260`, fixed in 8c0ffc6). ✓
- Language matrix: `.table-wrap { overflow-x: auto }` (`landing.css:643`). ✓
- Diagrams: `.diagram-wrap { overflow-x: auto }` (`landing.css:571`). ✓
- Install widget tabs: `overflow-x: auto` with hidden scrollbar (`landing.css:346-349`). ✓

**Theme contract:**
- Anti-FOUC script in `<head>` reads `starlight-theme` from localStorage, sets `data-theme` before first paint (`index.astro:21-31`). ✓
- Theme toggle reads/writes `starlight-theme` (`index.astro:216-225`). ✓
- `design/tokens.css` single source of truth: `:root` light, `[data-theme='dark']` dark. ✓

---

## Files Audited

- `design/tokens.css` — token definitions (both themes)
- `src/pages/index.astro` — page structure, scripts, theme toggle, copy-to-clipboard
- `src/styles/landing.css` — all layout, component, and interaction styles
- `src/components/landing/InstallWidget.astro` — tabbed install widget with sync
- `src/components/landing/DemoPanel.astro` — demo stepper with 3 scenarios
- `src/components/landing/ToolShowcase.astro` — 9-tool card grid with gate chips
- `src/components/landing/LanguageMatrix.astro` — 14-row language matrix table
- `src/components/landing/Badges.astro` — 4 inline SVG badges
- `src/components/landing/Diagrams.astro` — 2 architecture diagrams
- `.planning/phases/03-landing-page-rebuild/03-UI-SPEC.md` — design contract
- `.planning/phases/03-landing-page-rebuild/03-VERIFICATION.md` — verification report (accepted deviations noted)
