---
phase: 06-plugin-skills-enhancement
plan: "03"
subsystem: plugin
tags: [session-start-hook, posix-sh, claude-code, codex, cursor, tap, plugin-hooks]

requires:
  - phase: 06-plugin-skills-enhancement plan 01
    provides: `scripts/check-plugin.mjs` P1 guard and the plugin-surface guard alias this plan re-runs
provides:
  - `plugin/hooks/jarvis-index-status.sh` — always-exit-0 POSIX SessionStart probe, silent in every no-signal state, one JSON object on stale/unindexed
  - `scripts/test-jarvis-index-status.sh` — repository-retained deterministic POSIX behavior harness, eight TAP cases, validated RED→GREEN
  - `plugin/hooks/hooks.json` — Claude Code + Codex auto-discovered hook config (PascalCase `SessionStart`, nested handler)
  - `plugin/hooks/cursor.json` — Cursor hook config (camelCase `sessionStart`, flat handler, top-level `version: 1`)
  - Cursor manifest `hooks: "./hooks/cursor.json"` declaration
  - README hook documentation with three honest client caveats and `>=0.9.1` prose floors
affects: [06-05 (CI strict validate), 06-06 (P5 executable-hook check), 06-07 (P2a version parse must not read cursor.json's top-level version as a plugin version)]

actuals:
  tokens: 76000   # chars/4 over the 6-file realized diff (300 insertions + 4 deletions + amended test file)
  tasks: 3
  commits: 4

tech-stack:
  added: []   # no new dependency — POSIX sh + TAP-by-hand, `claude plugin validate` CLI reused
  patterns:
    - "committed POSIX TAP harness as the TDD RED/GREEN instrument when no test framework exists (named-case `not ok` + `# tests/# pass/# fail` summary feeds `check tdd-red-evidence` directly)"
    - "hook silence contract: unconditional `exit 0`, zero stdout bytes unless actionable, no `uvx` fallback ever"

key-files:
  created:
    - scripts/test-jarvis-index-status.sh
    - plugin/hooks/jarvis-index-status.sh
    - plugin/hooks/hooks.json
    - plugin/hooks/cursor.json
  modified:
    - plugin/.cursor-plugin/plugin.json
    - plugin/README.md

key-decisions:
  - "Two hook files, never merged: measured `claude plugin validate --strict` exit 1 on a merged Pascal+camel file; re-proven on a mutated scratch copy this plan (unknown-hook-event warning → exit 1)"
  - "`hooks` manifest field added ONLY to the Cursor manifest — an explicit value replaces default discovery in Codex and triggers the ignored-folder warning in Claude Code"
  - "No `uvx` fallback when `jarvis` is absent: cold-cache resolution is a network call at session start and would break the README's local-first claim; the harness asserts a uvx sentinel stays absent"
  - "`jarvis list` TSV (path field = repo root, commit field vs `git rev-parse HEAD`) reproduces `getIndexStatus` staleness locally without the MCP server"
  - "Fixture shebangs use `/bin/sh`, not `#!/usr/bin/env sh`: the harness runs the target with a controlled `PATH`, so an `env`-resolved shebang cannot find `sh` inside that PATH"

patterns-established:
  - "Named-TAP-case RED evidence: one distinctly named case (`SessionStart hook is silent when jarvis is unavailable`) is the gate's targetTest; persisted JSON evidence + `gsd_run check tdd-red-evidence` authorize GREEN"
  - "Exit-0-silent probe contract for any future plugin hook: byte-silent on every advisory condition, exactly one JSON object on actionable conditions"

requirements-completed: [D-03, D-07, SC-2, SC-3]

coverage:
  - id: D1
    description: "SessionStart probe script: exit-0 always, zero-byte silence in all six no-signal states, one exact SessionStart JSON object for stale and unindexed, no uvx fallback, no network/write"
    requirement: D-07
    verification:
      - kind: unit
        ref: "scripts/test-jarvis-index-status.sh — 8/8 TAP cases pass (`sh scripts/test-jarvis-index-status.sh` exit 0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "RED→GREEN discipline: committed failing test validated by the TDD gate before production source existed; separate test/feat commits in order"
    requirement: D-07
    verification:
      - kind: unit
        ref: "gsd_run check tdd-red-evidence /tmp/06-03-hook-red-evidence.json → RED_EVIDENCE_OK; git order test(6-3) then feat(6-3)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Two client-shaped hook configs + single Cursor manifest `hooks` field; no hooks field on Claude or Codex manifests"
    requirement: SC-3
    verification:
      - kind: unit
        ref: "plan <verify> node JSON-shape assertions + grep counts (all exit 0); `claude plugin validate ./plugin --strict` exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "Vendor schema guard proven to guard: mutated scratch copy fails --strict with unknown-hook-event finding, exit 1"
    requirement: SC-3
    verification:
      - kind: unit
        ref: "scratch-copy mutation run (verbatim output in TDD Evidence & Verification Evidence below)"
        status: pass
    human_judgment: false
  - id: D5
    description: "README: hook subsection naming both config files and the script, silence + no-network stated, three caveats verbatim, no cross-client parity claim, three >=0.9.1 floors, lines 3/7/88 byte-unchanged, 113 lines total"
    requirement: D-03
    verification:
      - kind: unit
        ref: "plan <verify> greps: floors=3 old=0 script=1 trust=1 ten=1 localfirst=1 lines=113; `git diff --stat -- setup.sh plugin/mcp.json plugin/.mcp.json` empty"
        status: pass
    human_judgment: false
  - id: D6
    description: "Live session-start injection in Claude Code / Codex / Cursor (client runtime behavior, not CI-provable)"
    requirement: SC-3
    verification: []
    human_judgment: true
    rationale: "Manual-Only Verifications table in 06-VALIDATION.md: hook injection is client runtime behavior; Cursor publishes no sessionStart output-field schema; Codex skips untrusted plugin hooks. Needs a live install in each client."

duration: 25min
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 03: SessionStart Index Status Hook Summary

**Always-exit-0 POSIX SessionStart hook that surfaces stale/missing jarvis indexes once at session start, proven by a committed eight-case TAP harness through a validated RED→GREEN cycle, plus two client-schema hook configs and honest README caveats with `>=0.9.1` floors.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-09-12T03:48Z
- **Completed:** 2026-09-12T04:15Z
- **Tasks:** 3/3
- **Files modified:** 6

## TDD Gate Compliance

Task 1 was the TDD task. Both gates satisfied:

- **RED:** `27984f4` `test(6-3): add failing SessionStart hook behavior test` — committed before `plugin/hooks/jarvis-index-status.sh` existed (precondition verified absent).
- **GREEN:** `1f00637` `feat(6-3): add SessionStart index status hook` — committed only after the harness passed 8/8.

`gsd_run check tdd-red-evidence` verdict: **RED_EVIDENCE_OK** (reason: `target_test_failed`).

## TDD Evidence

Persisted record: `$TMPDIR/06-03-hook-red-evidence.json`

```json
{
  "command": "sh scripts/test-jarvis-index-status.sh",
  "exitCode": 1,
  "targetTest": "SessionStart hook is silent when jarvis is unavailable"
}
```

Run while the hook source was absent: all 8 cases `not ok`, each on the assertion
"expected exit 0 … got exit 127" (`/bin/sh: plugin/hooks/jarvis-index-status.sh: No such file
or directory`). TAP summary: `# tests 8 / # pass 0 / # fail 8 / # cancelled 0`, exit 1.
The target case name is distinct from the test filename and asserts the exact planned
behavior (exit 0, zero stdout bytes, no uvx fallback sentinel).

GREEN run (after implementation, before the `feat(6-3)` commit):

```
ok 1 - SessionStart hook is silent when jarvis is unavailable
ok 2 - SessionStart hook is silent when git is unavailable
ok 3 - SessionStart hook is silent outside a git repository
ok 4 - SessionStart hook is silent when jarvis list fails
ok 5 - SessionStart hook is silent when jarvis list is empty
ok 6 - SessionStart hook is silent when the index is current
ok 7 - SessionStart hook reports a stale index
ok 8 - SessionStart hook reports an unindexed repository
1..8
# tests 8
# pass 8
# fail 0
# cancelled 0
```

## Task Commits

1. **Task 1 RED:** `27984f4` — test(6-3): add failing SessionStart hook behavior test
2. **Task 1 GREEN:** `1f00637` — feat(6-3): add SessionStart index status hook
3. **Task 2:** `10d4f5b` — feat(6-3): configure client-specific SessionStart hooks
4. **Task 3:** `2f3f789` — docs(6-3): document SessionStart hook and floor 0.9.1 pins

Measured from ledger base `2dc67feeab2e06f5421384cd037620aaaba18027`: **4 commits**
(`gsd-plan-head-before-06-03`).

## Files Created/Modified

- `scripts/test-jarvis-index-status.sh` — repository-retained POSIX harness; locates the repo root from its own path, runs the real hook via `/bin/sh` with a controlled `PATH`, manufactures `git`/`jarvis`/`uvx` fixtures in `mktemp -d` (EXIT-trap cleanup), emits TAP with per-case `ok`/`not ok` + `# tests/# pass/# fail/# cancelled 0`, exits non-zero on any failure
- `plugin/hooks/jarvis-index-status.sh` — the probe: silent on absent jarvis / absent git / non-repo / failed or empty `list` / current commit; one `SessionStart` JSON object on stale (slug + both commits + `jarvis reindex` + `indexRepo`) and unindexed (`jarvis index` + `indexRepo`); no `uvx` fallback, no filesystem write, no network, unconditional `exit 0`
- `plugin/hooks/hooks.json` — Claude Code + Codex: `{ "hooks": { "SessionStart": [ { "hooks": [ { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}\"/hooks/jarvis-index-status.sh" } ] } ] } }`
- `plugin/hooks/cursor.json` — Cursor: `{ "version": 1, "hooks": { "sessionStart": [ { "command": "./hooks/jarvis-index-status.sh" } ] } }`. **The top-level `version` is Cursor's hook-file schema version, NOT a plugin version — plan 06-07's dimension P2a must not parse it as one.**
- `plugin/.cursor-plugin/plugin.json` — one new field after `mcpServers`: `"hooks": "./hooks/cursor.json"`; every other key byte-unchanged
- `plugin/README.md` — three `jarvis-mcp[semantic]>=0.9.1` floors; new "Session-start index status" subsection with the three caveats; lines 3, 7, 88 byte-unchanged; 113 lines

## Verification Evidence

Full-suite run (all from repo root, this session):

1. `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` → `ok: 3 manifests agree…` / `ok: P1 … green`, exit 0, no `^P1: ` stderr
2. `claude plugin validate ./plugin --strict` → `✔ Validation passed`, exit 0
3. `claude plugin validate . --strict` (marketplace root) → `✔ Validation passed`, exit 0
4. `sh scripts/test-jarvis-index-status.sh` → 8/8 pass, exit 0 (GREEN block above)
5. RED gate re-validated post-completion: `RED_EVIDENCE_OK`
6. `git diff --stat -- setup.sh plugin/mcp.json plugin/.mcp.json` → empty (untouched)

**Mutated-event-name scratch run (Task 2, `--strict` must guard):** copied `plugin/` to a
`mktemp -d` scratch dir, renamed `hooks/hooks.json`'s event key to `NotARealHookEvent`,
validated, deleted the scratch copy. Exit **1**, verbatim finding:

```
Validating hooks: …/plugin/hooks/hooks.json

⚠ Found 1 warning:

  ❯ hooks: hooks.NotARealHookEvent: unknown hook event; entry ignored at runtime

✘ Validation failed (--strict treats warnings as errors)
```

No scratch directory remains (`git status --porcelain` clean of scratch paths).

## Decisions Made

- Fixture scripts use `#!/bin/sh` instead of `#!/usr/bin/env sh`: the harness invokes the hook with a controlled fixture-only `PATH`, and an `env` shebang resolves `sh` through that same PATH — where no `sh` exists — yielding exit 127 before the case logic runs. This is harness-internal; the production hook keeps the mandated `env sh` shebang (it runs under the user's real PATH).
- The `fresh` fixture emits `$FIXTURE_HEAD` as the indexed commit so case 6 exercises the equality branch against a different stale-mode commit, not an accidentally-equal constant.
- RED commit was amended once (fixture shebang fix + fresh-row commit value) while still RED-observed and before any production code existed; the gate was validated against the final amended RED evidence.

## Deviations from Plan

None - plan executed exactly as written. (The Task 2 commit subject is
`feat(6-3): configure client-specific SessionStart hooks`; the plan's <action> prescribed exact
subjects only for Task 1's RED/GREEN pair, which were followed verbatim.)

## Issues Encountered

- Initial GREEN run failed cases 7–8: fixture shebangs (`#!/usr/bin/env sh`) could not resolve `sh` under the controlled PATH (exit 127, zero bytes). Root-caused with a minimal `/usr/bin/env sh` reproduction; fixed in the harness fixtures (see Decisions). Second run failed case 6 (fresh row used a constant `indexed-commit`, tripping the stale branch); fixed by emitting `$FIXTURE_HEAD`. Third run: 8/8.

## Known Stubs

None. All shipped behavior is real and exercised by the committed harness.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `plugin/hooks/` exists, so 06-05's whole-root CI `claude plugin validate --strict` step and 06-06's P5 executable-hook check have their subjects.
- 06-07 P2a must ignore `plugin/hooks/cursor.json`'s top-level `version` (Cursor hook schema version, not a plugin version).
- Live-client injection (D6) remains a manual end-of-phase check per 06-VALIDATION.md.

## Self-Check: PASSED

- All 4 commit hashes present in `git log` (27984f4, 1f00637, 10d4f5b, 2f3f789)
- All 6 key files exist on disk
- Ledger commit count (4) matches Task Commits

---
*Phase: 06-plugin-skills-enhancement*
*Plan: 03*
*Completed: 2026-09-12*
