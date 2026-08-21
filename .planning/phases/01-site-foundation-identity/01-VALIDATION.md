---
phase: 1
slug: site-foundation-identity
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — build-output assertions + HTTP probes (deterministic, zero-dependency Node scripts: `scripts/verify-build.mjs`, `scripts/check-manifests.mjs`) |
| **Config file** | none — created by this phase's plans |
| **Quick run command** | `npm ci --silent && npm run build && node scripts/verify-build.mjs && node scripts/check-manifests.mjs` |
| **Full suite command** | quick + `npm run preview` + curl probes of `/`, `/docs/`, 3 sample deep URLs + deliberate-break test of check-manifests |
| **Estimated runtime** | ~60–90s quick; ~3 min full |

*Plan 01-01 (pre-Astro hotfix) uses the smoke-probe script against the live URL (`curl` loop, seconds) as its quick command.*

---

## Sampling Rate

- **After every task commit:** Run `npm ci --silent && npm run build && node scripts/verify-build.mjs && node scripts/check-manifests.mjs`
- **After every plan wave:** Run the full suite command (preview server + deep-URL probes + manifest test-the-test)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds (quick), 3 minutes (full)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01-01 | 1 | SITE-01 | T-01-02 | N/A | build-assert | `npm run docs:build` + asset-prefix grep + sitemap equality with ≥30 floor | — | ⬜ pending |
| 1-01-02 | 01-01 | 1 | SITE-01 | T-01-02 | N/A | http-probe | dispatched run green; live `/` `/docs/` `/docs/cli/forget` → 200 + marker | ❌ W0 (probe step created by plan) | ⬜ pending |
| 1-02-00 | 01-02 | 2 | SITE-02 | T-01-SC | N/A | checkpoint:human-verify | six-package legitimacy gate (manual npmjs.com publisher check) | — | ⬜ pending |
| 1-02-01 | 01-02 | 2 | SITE-02, SITE-05 | T-01-01 | N/A | build | `npm ci && npm run build` green on Node 22; single `dist/`; atomic stack commit | — | ⬜ pending |
| 1-02-02 | 01-02 | 2 | SITE-02 | T-01-04 | N/A | build-assert | exactly 32 dist docs pages; 8 maintainer files absent; renames detected | — | ⬜ pending |
| 1-02-03 | 01-02 | 2 | SITE-05 | T-01-01 | N/A | http-probe | dispatched deploy green + 3 deep URLs + brand-logo + sitemap-0.xml grep | — | ⬜ pending |
| 1-03-01 | 01-03 | 3 | SITE-03, SITE-04 | T-01-06 | N/A | build-assert | ≥3 woff2 same-origin; zero font-CDN refs; `--jv-accent` in built CSS (`grep -q`) | ❌ W0 (standing V4 lands with 01-05 verify-build) | ⬜ pending |
| 1-03-02 | 01-03 | 3 | SITE-03 | — | N/A | build-assert | landing.css consumes `var(--jv-*)`; zero `:root` in page; preview hero intact | — | ⬜ pending |
| 1-03-03 | 01-03 | 3 | SITE-03 | T-01-08 | N/A | file-assert | superseded-by header within first 5 lines of each of the 3 stale specs | — | ⬜ pending |
| 1-04-01 | 01-04 | 4 | SITE-08 | T-01-10 | N/A | build-assert + manual | built landing: `starlight-theme` present, legacy key count 0, `data-theme` + `prefers-color-scheme`; manual V6 | — | ⬜ pending |
| 1-04-02 | 01-04 | 4 | SITE-08 | T-01-09 | N/A | build-assert + manual | pagefind dir with ≥1 `.js` and ≥1 `.json` (`test -n "$(find …)"`), search markup, no `pagefind: false`; manual V5 | ❌ W0 (standing V5 lands with 01-05 verify-build) | ⬜ pending |
| 1-05-01 | 01-05 (tdd) | 4 | SITE-07 | T-01-11 | N/A | script, fail-first | check-manifests green on repo + green on clean scratch copy (cwd-seam); 3 RED proofs in SUMMARY | ❌ W0 (script created by plan) | ⬜ pending |
| 1-05-02 | 01-05 (tdd) | 4 | SITE-06 | T-01-12, T-01-14 | N/A | script, fail-first | verify-build green on real dist + V2-missing scratch proof exits 1; other scratch cases in SUMMARY | ❌ W0 (script created by plan) | ⬜ pending |
| 1-05-03 | 01-05 (tdd) | 4 | SITE-06 | T-01-12 | N/A | build-assert | `dist/404.html` exists; `redirects` key present; verify-build green after scratch-entry removal | ❌ W0 (depends on 1-05-02 script) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/verify-build.mjs` — dist tree walk + URL-contract diff + asset-resolution + font-origin + sitemap checks (V2/V3/V4/V9)
- [ ] `scripts/check-manifests.mjs` — 3-manifest version equality, `.mcp.json` ≡ `mcp.json`, JSON parse (V7)
- [ ] Post-deploy smoke probe step in `deploy-pages.yml` (V8)

*Created by plans 01-01/01-05; no test-framework install needed — instruments are build assertions and HTTP probes.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode persists across reload and `/` ↔ `/docs/` navigation (one storage key, `data-theme` flips) | SITE-08 | Browser interaction, two surfaces | Toggle on `/`, navigate to `/docs/`, reload both — state held in both directions (~2 min) |
| Pagefind search returns hits interactively | SITE-08 | JS-driven UI behavior | Open `/docs/`, type a query in search, confirm hits across multiple pages (~1 min) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
