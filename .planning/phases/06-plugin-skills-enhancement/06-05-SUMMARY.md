---
phase: 06-plugin-skills-enhancement
plan: 05
subsystem: infra
tags: [ci, github-actions, claude-code-cli, supply-chain, plugin-validate]

# Dependency graph
requires:
  - phase: 06-01
    provides: "manifest-checks job with Check manifests / Check plugin surface steps and the nine-entry path-filter blocks"
provides:
  - "Pinned Install Claude Code CLI step (@anthropic-ai/claude-code@2.1.268) in .github/workflows/checks.yml"
  - "Validate plugin + marketplace step running claude plugin validate --strict on ./plugin and on ."
  - "Workflow comment recording the supplement-not-replacement rationale for the vendor validator"
affects: [06-06, 06-07, 06-08]

# Actuals (#2632)
actuals:
  tokens: 557
  tasks: 2
  commits: 1

# Tech tracking
tech-stack:
  added: ["@anthropic-ai/claude-code@2.1.268 (CI-only, global npm install)"]
  patterns:
    - "Vendor CLI guards are added after hermetic Node guards in the same job, never before, so a registry outage cannot mask repo-owned invariants"
    - "Package-manager installs in CI require an explicit human-verify checkpoint when the phase's RESEARCH.md carries no Package Legitimacy Audit table"

key-files:
  created: []
  modified:
    - .github/workflows/checks.yml

key-decisions:
  - "D-17: adopted `claude plugin validate --strict` as a sixth, vendor-supplied CI guard, pinned to an exact version rather than a floating tag, placed after the two hermetic Node guards (Check manifests, Check plugin surface)."
  - "Task 1 human-verify gate: APPROVED. Package legitimacy independently confirmed against the npm registry this session (see Task 1 Verdict below) rather than deferred."
  - "The workflow comment above the install step explicitly states the validator does not report unknown SKILL.md / command / agent frontmatter keys, so it supplements dimension guards P1-P5 and never replaces them (per research finding C-4)."

patterns-established:
  - "Pattern: any CI step whose trigger reasoning is non-obvious (why this exists, what it does and does not catch, why it's pinned) gets an inline comment in the same register as the file's top-of-file header comment."

requirements-completed: [D-12, D-17, SC-4]

coverage:
  - id: D1
    description: "Task 1 human-verify gate: package identity, exact pinned version, and accepted cost were verified before any install step landed."
    verification:
      - kind: manual_procedural
        ref: "npmjs.com/package/@anthropic-ai/claude-code — publisher @anthropic-ai, 13 maintainers all @anthropic.com, homepage github.com/anthropics/claude-code, version 2.1.268 exists and is not deprecated (latest 2.1.269); local `claude --version` reports 2.1.268 exactly"
        status: pass
    human_judgment: true
    rationale: "Supply-chain package legitimacy is an operator judgment call by design (T-06-SC); this SUMMARY records the operator's explicit approval and the evidence reviewed, it does not re-derive the judgment."
  - id: D2
    description: "Install Claude Code CLI step added, pinned to @anthropic-ai/claude-code@2.1.268 (no floating tag), in the existing manifest-checks job after Check plugin surface."
    verification:
      - kind: other
        ref: "grep -c -F '@anthropic-ai/claude-code@2.1.268' .github/workflows/checks.yml -> 1; grep -c -E 'claude-code@(latest|\\^|~)' .github/workflows/checks.yml -> 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "Validate plugin + marketplace step runs both `claude plugin validate ./plugin --strict` and `claude plugin validate . --strict`, each exactly once, after the install step."
    verification:
      - kind: other
        ref: "grep -c -F 'claude plugin validate ./plugin --strict' -> 1; grep -c -F 'claude plugin validate . --strict' -> 1; local run: `claude plugin validate ./plugin --strict && claude plugin validate . --strict` -> both 'Validation passed'"
        status: pass
    human_judgment: false
  - id: D4
    description: "Exactly one actions/setup-node step remains (new steps live in the same job, not a second job); step order is Setup Node, Check manifests, Check plugin surface, Install Claude Code CLI, Validate plugin + marketplace; push/pull_request path-filter blocks remain textually identical; permissions block byte-unchanged; both hermetic Node guards still exit 0."
    verification:
      - kind: other
        ref: "grep -c -F 'actions/setup-node' -> 1; grep -n -E '^      - name:' order matches; node one-liner comparing push/pull_request paths blocks -> equal; node scripts/check-manifests.mjs && node scripts/check-plugin.mjs -> exit 0; git diff shows a pure 14-line addition, no other lines touched"
        status: pass
    human_judgment: false

duration: ~12min
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 05: Pin `claude plugin validate --strict` as a sixth CI guard Summary

**Added a pinned `@anthropic-ai/claude-code@2.1.268` install and a `claude plugin validate --strict` step (both `./plugin` and `.`) to the existing `manifest-checks` job in `.github/workflows/checks.yml`, gated behind an approved human supply-chain review.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-09-12T05:27:24Z
- **Tasks:** 2/2
- **Files modified:** 1 (`.github/workflows/checks.yml`)

## Task 1 Verdict: APPROVED

The operator approved the pinned vendor-CLI install ("approve 06-05" / "approve all"), with the
following evidence independently confirmed against the npm registry and the local environment this
session:

- **Publisher/scope:** `@anthropic-ai` — the official scope, not a lookalike.
- **Maintainers:** 13 listed, all `@anthropic.com` email addresses.
- **Homepage/repository:** `https://github.com/anthropics/claude-code` (Anthropic-controlled).
- **Pinned version `2.1.268`:** exists in the registry, returns HTTP 200, and is **not deprecated**
  (latest published version is `2.1.269`).
- **Local CLI match:** `claude --version` on this machine reports `2.1.268 (Claude Code)` — an exact
  match to the version Task 2 pins, so CI validates with the same binary behavior research measured.

Per the plan's acceptance criteria, `.github/workflows/checks.yml` carried no diff at the end of
Task 1 — the file was untouched until Task 2's execution.

## Accomplishments
- Added `Install Claude Code CLI` step: `npm i -g @anthropic-ai/claude-code@2.1.268` (exact pin, no floating tag/caret/tilde).
- Added `Validate plugin + marketplace` step: `claude plugin validate ./plugin --strict` then `claude plugin validate . --strict`, both in one multi-line `run` block so either non-zero exit fails the job.
- Both steps placed after `Check plugin surface` (the last existing hermetic Node guard), so a registry outage or vendor incident can never mask this repo's own P1/P2a invariants.
- Added a workflow comment recording: (1) this validator is the only guard measured to catch hooks-schema drift (unknown-hook-event finding, exit 1 on a wrong event name); (2) it does **not** report unknown SKILL.md/command/agent frontmatter keys, so it supplements and never replaces dimensions P1-P5; (3) the version is pinned deliberately so a vendor release cannot turn CI red without a change in this repository.

## Task Commits

1. **Task 1: Verify the @anthropic-ai/claude-code package before any install step lands** — no commit (checkpoint:human-verify gate; no file changes by design — `.github/workflows/checks.yml` had no diff at the end of this task).
2. **Task 2: Pinned vendor-validator steps in the existing manifest-checks job** — `2302382` (feat)

_Note: no separate plan-metadata commit was made. STATE.md, ROADMAP.md, and REQUIREMENTS.md are shared state reconciled by the orchestrating session across all phase-06 subagents, per this plan's explicit execution constraints; this SUMMARY.md file itself is likewise left for that reconciliation pass rather than committed here, keeping this plan's git footprint to the single scoped `checks.yml` commit._

## Files Created/Modified
- `.github/workflows/checks.yml` - added `Install Claude Code CLI` (pinned) and `Validate plugin + marketplace` (strict, both paths) steps plus rationale comment; nothing else in the file changed (pure 14-line addition, verified via `git diff`).

## Decisions Made
- D-17 adopted exactly as specified: pinned exact-version install, placed after the hermetic guards, documented as supplementary rather than a P1-P5 replacement.
- No architectural changes (Rule 4) were triggered — this was a pure CI-workflow addition matching the plan's literal YAML shape.

## Deviations from Plan

None - plan executed exactly as written. The literal step names, step order, pin form, rationale-comment content, and path-filter/permissions non-changes all match the plan's `<action>` and `<acceptance_criteria>` verbatim.

## Issues Encountered

One tool-level slip during editing: an initial insertion anchor was placed one line too early (after the `Check plugin surface` step's `name:` line rather than after its `run:` line), which briefly interleaved the new steps mid-step. Caught immediately by re-reading the file before running any verification, corrected in a follow-up edit, and confirmed via the full grep/node/`claude plugin validate` verification suite before committing. No incorrect state was ever committed to git.

## User Setup Required

None - no external service configuration required. The pinned CLI install runs entirely inside the CI job; no secrets, tokens, or dashboard configuration are involved.

## Next Phase Readiness
- CI now enforces six guard layers: hermetic P1/P2a (this repo's own scripts) plus the vendor `claude plugin validate --strict` check for hooks-schema drift and manifest type errors.
- Phase 06-06 (P3/P4/P5 dimensions) and 06-07 (P2a/P2b, `--release` flag) build on the same `manifest-checks` job without needing further CI-workflow structural changes.
- No blockers for downstream plans.

---
*Phase: 06-plugin-skills-enhancement*
*Completed: 2026-09-12*
