---
phase: 5
slug: launch-verification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-23
---

# Phase 5 — Validation Strategy

> Per-phase validation contract. Derived from 05-RESEARCH.md § Validation Architecture + plans.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Zero-dep node/shell scripts + live HTTP checks |
| **Quick run command** | `npm run build && npm run verify && node scripts/check-manifests.mjs` |
| **Full suite command** | quick + `bash scripts/crawl-urls.sh` (live) + claims-audit review |
| **Estimated runtime** | ~60s structural; crawl ~2min; cold-install run 10–30min (orchestrator) |

---

## Sampling Rate

- **After each 05-01 task commit:** quick run + task-specific greps
- **Pre-merge gate:** full structural suite green on the branch
- **Post-deploy (live):** sitemap equality + 39-contract-URL crawl + 34-old-URL redirect crawl all 200/301
- **Cold-install gate:** first tool call succeeds inside the container; cast file exists and parses

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 05-01 | 1 | VRFY-04 | grep + read | maintainer docs contain new-structure sections (Astro/Starlight, src/ tree, tokens) with no stale-path regressions | ❌ W1 | ⬜ pending |
| TBD | 05-01 | 1 | COMM-01 | grep | troubleshooting index links Discussions as the support surface | ✅ | ⬜ pending |
| TBD | 05-01 | 1 | VRFY-02 | script | claims-audit table rows ≥ claim count; every row has artifact column non-empty | ❌ W1 | ⬜ pending |
| TBD | 05-01 | 1 | VRFY-03 | script | `bash -n scripts/crawl-urls.sh`; crawl covers url-contract.json URLs + the 34 pre-rebuild URLs from the Phase-2 classification | ❌ W1 | ⬜ pending |
| TBD | 05-02 | 2 | VRFY-01 | orchestrator | Docker run: setup.sh → uv tool install → jarvis index → getIndexStatus success; timings recorded; .cast valid JSON | ❌ W2 | ⬜ pending |
| TBD | 05-02 | 2 | VRFY-03 | orchestrator | live crawl: 39 URLs → 200; 34 old URLs → 200/301; sitemap equals contract | ✅ (script from 05-01) | ⬜ pending |
| TBD | 05-02 | 2 | COMM-02 | orchestrator | quickstart embed renders player (real-Chrome); .cast loads (HTTP 200); zero third-party requests (V4 green) | ❌ W2 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Orchestrator-Held Verification (no subagent)

1. Merge → push → `gh run watch` deploy green → live pagefind page_count = 40 → live quickstart shows channel widget
2. Docker cold-install run with asciinema recording, honest timings
3. Live crawl execution + sitemap equality
4. Claims audit live review (table vs live pages)
5. Discussions: `gh api repos/jarvis-intelligence/jarvis-index --jq .has_discussions` true + links resolve

---

## Wave 0 Gaps

None blocking — verify-build harness exists; crawl/audit scripts are authored in 05-01 wave 1.
