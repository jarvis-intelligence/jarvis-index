---
phase: 3
slug: landing-page-rebuild
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-23
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 03-RESEARCH.md § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Zero-dep node assertion scripts (no test runner in this repo) |
| **Config file** | none — `scripts/verify-build.mjs` (V1–V10), `scripts/check-manifests.mjs` |
| **Quick run command** | `npm run build && npm run verify` |
| **Full suite command** | `npm run build && npm run verify && npm run check:manifests` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npm run verify`
- **After every plan wave:** Run `npm run build && npm run verify && npm run check:manifests` + targeted greps (see map)
- **Before `/gsd-verify-work`:** Full suite green + real-Chrome smoke pass (hero chip copies, channel tabs sync landing↔quickstart, 390px no horizontal overflow, dark-mode diagram contrast) — browser pass owned by the orchestrator
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 03-01 | 1 | LNDG-01, LNDG-05, LNDG-08, LNDG-10, D-04 | threat_model (03-01) | N/A (static) | build + grep | `npm run verify`; `grep -q 'curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh' src/pages/index.astro`; `! grep -q '#9aa4ac' src/styles/landing.css`; `grep -q -- '--jv-muted-soft' design/tokens.css` | ✅ | ⬜ pending |
| TBD | 03-02 | 2 | LNDG-02, LNDG-03, LNDG-04, LNDG-07 | threat_model (03-02) | N/A (static) | build + grep | `npm run verify`; `grep -q 'requires \`[semantic]\` extra + reindex' src/components/landing/ToolShowcase.astro`; `test -f src/data/demo-scenarios.json`; `grep -q 'Nothing leaves your machine' src/pages/index.astro` | ❌ W2 (rides with components) | ⬜ pending |
| TBD | 03-03 | 3 | LNDG-06, LNDG-09 | threat_model (03-03) | N/A (static) | build + grep | `npm run verify`; `! grep -q 'fill="#' src/components/landing/Diagrams.astro`; `grep -q 'overflow-x: auto' src/styles/landing.css`; label-equality grep across widget + quickstart | ❌ W3 (rides with components) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Interactive / Human Verification (deferred to orchestrator)

Executors are browser-less. The following are verified at phase verification time in **real system Chrome** (per STATE.md decision: the harness headless browser blob-wraps workers — always use real Chrome):

1. Hero install chip copies to clipboard ("✓ copied" state)
2. Channel tab selection on landing hero syncs to quickstart widget and back (localStorage `starlight-synced-tabs__channel`)
3. 390px viewport: no page-level horizontal scroll; matrix scrolls within containment
4. Dark mode: diagrams render with correct contrast (no CSS filter), tokens flip cleanly

---

## Wave 0 Gaps

None blocking — the V1–V10 assertion harness exists from Phases 1–2. Per-plan additions ride with their content: `demo-scenarios.json` existence/format check (03-02) and the diagram no-hex grep (03-03).
