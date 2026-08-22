---
phase: 03-landing-page-rebuild
fixed: 2026-08-23T02:20:00Z
review_source: 03-REVIEW.md
findings: 6
fixed: 5
rejected: 1
status: all_resolved
---

# Phase 3: Code Review Fix Report

| ID | Severity | Disposition | Fix |
|----|----------|-------------|-----|
| CR-01 | critical | ✅ FIXED | Restored `--jv-chip-ring` in `design/tokens.css` — light `rgba(124,175,228,0.26)`, dark `rgba(124,175,228,0.18)`. Live-verified: `.mono-box` border renders 1px with the token color in both themes. |
| WR-01 | warning | ❌ REJECTED (false positive) | The built page's actual id is `id="java-maven-on-macos-requires-bash--44"` — double hyphen confirmed in `dist/docs/guide/requirements/index.html` (Starlight's GitHub-style slugger keeps the doubled hyphen from `bash >= 4.4`). The LanguageMatrix link and the Phase-2 locked anchor contract are both correct; the reviewer's slugify claim contradicts the build output. No change. |
| WR-02 | warning | ✅ FIXED | Restored dark `--jv-card-shadow: 0 18px 46px rgba(0,0,0,0.2)` in `[data-theme='dark']`. Live-verified: dark card box-shadow now `rgba(0,0,0,0.2)`. |
| WR-03 | warning | ✅ FIXED | Demo panel roving tabindex: `show()` sets `b.tabIndex = i === n ? 0 : -1`, template carries `tabindex={i === 0 ? '0' : '-1'}` on non-initial step buttons. Matches InstallWidget's pattern. |
| IN-01 | info | ✅ FIXED | Dead `.diagram .label-storage` rule removed (comment documents why). |
| IN-02 | info | ✅ FIXED | Gate-chip ambers tokenized: `--jv-gate-amber` / `--jv-gate-amber-strong` in tokens.css (light `#92610a`/`#b8860b`, dark `#d4a853`); `.gate-chip` references tokens, the `[data-theme="dark"]` override block deleted (token flip handles it). |

## Verification

- `npm run build` exits 0 (39 pages), `npm run verify` V1–V10 all green
- Real-Chrome computed-style evidence for CR-01/WR-02 (above)
- No hex literals remain in the gate-chip rules; grep gates from 03-03 still pass
