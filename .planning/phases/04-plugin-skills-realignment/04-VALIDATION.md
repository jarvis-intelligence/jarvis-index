---
phase: 4
slug: plugin-skills-realignment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-23
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 04-RESEARCH.md § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Zero-dep node checks + external validators (no test runner) |
| **Config file** | none — `scripts/check-manifests.mjs`, Cursor plugin-template validator |
| **Quick run command** | `node scripts/check-manifests.mjs` |
| **Full suite command** | `node scripts/check-manifests.mjs && curl -fsSL https://raw.githubusercontent.com/cursor/plugin-template/main/scripts/validate-template.mjs -o /tmp/validate-template.mjs && node /tmp/validate-template.mjs` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After each task commit:** quick run (manifests + link-policy greps)
- **Before tag creation (release gate):** full suite + all link greps + `diff plugin/.mcp.json plugin/mcp.json`
- **After tag push:** `gh api .../refs/tags/v0.7.3` HTTP 200 + one reading-link curl spot check at the tag

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 04-01 | 1 | SKIL-01 | grep | `! grep -rn 'CLAUDE.md' plugin/skills/` (excluding self-references to the plugin's own absent file — zero expected) | ✅ | ⬜ pending |
| TBD | 04-01 | 1 | SKIL-02 | grep | `! grep -rn 'blob/main/' plugin/skills/ .codex-plugin/plugin.json` (reading links); `grep -c 'raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh' plugin/skills/jarvis-setup/SKILL.md` = 1 (functional command stays main) | ✅ | ⬜ pending |
| TBD | 04-01 | 1 | SKIL-03 | grep + read | vocabulary greps ("structural code intelligence", "9 tools", tier gating phrases present); command examples match quickstart strings | ✅ | ⬜ pending |
| TBD | 04-02 | 2 | SKIL-04 | script + validator + api | `node scripts/check-manifests.mjs`; `node /tmp/validate-template.mjs`; `diff plugin/.mcp.json plugin/mcp.json`; `git tag -l v0.7.3`; `gh api repos/jarvis-intelligence/jarvis-index/git/refs/tags/v0.7.3` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Interactive / Human Verification (orchestrator-held)

1. Tag-resolved URL spot check: one `blob/v0.7.3` link curl'd → HTTP 200
2. Docs-site links in skills resolve (curl or browser spot check against the live site after Phase 5 deploy — pre-deploy, resolve against preview or accept path validity)

---

## Wave 0 Gaps

None — check-manifests.mjs exists; the Cursor validator is fetched at run time per the deployment guide.
