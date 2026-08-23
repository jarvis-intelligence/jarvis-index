---
phase: 2
slug: docs-rebuild-tutorial-first-content
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-21
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 02-RESEARCH.md § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Zero-dep node assertion scripts (no test runner in this repo) |
| **Config file** | none — `scripts/verify-build.mjs`, `scripts/check-manifests.mjs` |
| **Quick run command** | `npm run build && npm run verify` |
| **Full suite command** | `npm run build && npm run verify && npm run check:manifests` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npm run verify`
- **After every plan wave:** Run `npm run build && npm run verify && npm run check:manifests` + targeted greps (see map)
- **Before `/gsd-verify-work`:** Full suite green + interactive preview pass (404 lookup renders, Tabs switch/sync, Pagefind finds new pages)
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 02-01 | 1 | DOCS-09, D-01, D-04 | — | N/A | build (V2/V4) | `npm run verify`; `! grep -q 'fonts.googleapis' public/brand-logo.html` | ✅ | ⬜ pending |
| TBD | 02-02 | 2 | DOCS-01/02/03/10/12 | — | N/A | build + grep | `npm run verify` + quickstart step-heading/shape greps; registry probe curl | ✅ | ⬜ pending |
| TBD | 02-03 | 2 | DOCS-04/05, WR-01 | — | N/A | grep guards | `grep -rL '"error"' src/content/docs/docs/tools/*.md`; per-page flag greps; `! grep -rq 'findReferences)' src/content/docs/docs/tools/index.md` | ✅ | ⬜ pending |
| TBD | 02-04 | 3 | DOCS-06/07/08 | — | N/A | build + diff | `npm run verify`; changelog verbatim `diff` vs `../jarvis/CHANGELOG.md` | ❌ W0 (rides with page) | ⬜ pending |
| TBD | 02-05 | 4 | DOCS-11 | — | N/A | script check | `test -f dist/llms.txt && head -2 dist/llms.txt \| grep -q '^# '` | ❌ W0 (rides with plan) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — the assertion harness (verify-build.mjs V2–V9, check-manifests.mjs) exists from Phase 1. Two per-plan additions ride with their content plans: the DOCS-08 verbatim-diff command (02-04) and the `dist/llms.txt` existence/format check (02-05).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quickstart reads as a coherent cold-visitor journey with success/failure shapes at every step | DOCS-01, DOCS-10 | Editorial judgment — greps prove presence, not readability | Read the built quickstart end-to-end as a stranger; every step must show expected output and "you'll know it works/broke when" |
| Tool pages match Product Truth shapes | DOCS-04 | Content accuracy vs `../jarvis/src/jarvis/server.py`/`models.py` — diff is semantic, not textual | Spot-check each page's response example against RESEARCH.md §Product Truth verbatim quotes |
| 404 lookup page renders with the retired-URL table; Tabs switch and sync; Pagefind finds new pages | DOCS-09, DOCS-02 | Interactive browser behavior | `npm run preview`, visit a retired/bogus URL, exercise tabs and search |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
