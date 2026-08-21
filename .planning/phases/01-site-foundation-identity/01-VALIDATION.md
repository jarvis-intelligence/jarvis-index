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
| 1-01-01 | 01-01 | 1 | SITE-01 | — | N/A | http-probe | smoke probe: `/` and `/docs/` → 200 + marker, one hashed asset → 200 | ❌ W0 (script created by plan) | ⬜ pending |
| 1-02-01 | 01-02 | 1 | SITE-02, SITE-05 | — | N/A | build | `npm run build` green on Node 22; single `dist/` artifact | ❌ W0 | ⬜ pending |
| 1-03-01 | 01-03 | 1 | SITE-03, SITE-04 | — | N/A | build-assert | verify-build: zero third-party font refs; woff2 under own origin | ❌ W0 | ⬜ pending |
| 1-04-01 | 01-04 | 2 | SITE-08 | — | N/A | build-assert + manual | verify-build: `pagefind.{js,json}` under `dist/docs/` + search markup; manual query interaction | ❌ W0 | ⬜ pending |
| 1-05-01 | 01-05 | 2 | SITE-06, SITE-07 | — | N/A | script | verify-build: built URL set ≡ 32-URL contract; check-manifests fails when broken (test-the-test) | ❌ W0 | ⬜ pending |

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
