---
phase: 06-plugin-skills-enhancement
plan: "06"
subsystem: plugin-ci
tags: [node, mcp, plugin, ci, marketplace, frontmatter, guard]
requires:
  - phase: 06-plugin-skills-enhancement plans 02-04
    provides: two-key Agent Skills conformant skills, plugin/hooks/ with both hook configs and the executable probe, plugin/commands/ and plugin/agents/ components, Cursor manifest hooks declaration
provides:
  - P3 marketplace-manifest guard: both marketplace.json files parse, carry kebab-case name + owner.name + non-empty plugins array, entries match their resolved plugin.json name, sources stay ./-rooted inside the checkout, no component fields
  - P4 frontmatter guard: hand-rolled allowed-key enforcement over every skill, command, and agent, with the plugin-scope security exclusion (hooks/mcpServers/permissionMode) failing by name
  - P5 referenced-path guard: manifest, hook-config, and retrieval-command path targets resolve; hook scripts keep an execute bit; component markdown never empty
  - Single ok: summary line naming every green P-series dimension
affects: [06-07 (P2a/P2b join the same script and ok: line)]
actuals:
  tokens: 5400   # chars/4 over the realized diff (21538 diff chars, +442/-9 in one file)
  tasks: 3
  commits: 3
plan_head_before: e213b66b56eb7aaf9575709a0ea92b37415f1b9b
tech-stack:
  added: []
  patterns:
    - guard dimensions demonstrated red through the process.cwd() seam: scratch-copy mutations and a pre-phase worktree, script copied in unmodified
    - manifest path-field discovery by filtered walk (separator, no whitespace, no URL scheme) instead of hard-coded subject lists
    - two relativity families (plugin-root-relative vs repository-root-relative) resolved separately with the rationale commented in-script
key-files:
  created: []
  modified:
    - scripts/check-plugin.mjs
key-decisions:
  - "P3 asserts shape and resolution, not name availability: Claude Code's reserved-name list is re-checked by the client on every load and is deliberately not enumerated in-script (header states this)"
  - "P4 stays hand-rolled because claude plugin validate --strict was measured not to report unknown frontmatter keys (research C-4); the measured negative is recorded in the header so nobody deletes the guard believing the vendor validator covers it"
  - "P5 collects subjects from the manifests and hook configs by a filtered walk so future path fields are covered automatically; prose (Codex longDescription) and https URLs are excluded by the whitespace/scheme filters"
  - "Hook executable-bit assertion runs on every .sh target resolved out of the hook configs, not a hard-coded path; failure message names the hooks-not-firing symptom"
patterns-established:
  - "Red-before-green for a guard dimension with no natural pre-fix failure: mutate a scratch worktree copy, run the unmodified script through the cwd seam, capture the verbatim failure line and exit status, then remove the worktree"
  - "Multi-dimension guard summary: one ok: line naming P1, P3, P4, P5 all green (verify-build.mjs style)"
requirements-completed: [D-12, D-13, SC-3, SC-4]
coverage:
  - id: D1
    description: P3 covers both marketplace manifests with all six sub-assertions (parse, kebab-case name, owner.name + plugins array, entry-name equality via resolved source, source shape + resolution + expected manifest, no component fields)
    requirement: D-12
    verification:
      - kind: integration
        ref: node scripts/check-plugin.mjs
        status: pass
    human_judgment: false
  - id: D2
    description: P4 enforces the Agent Skills allowed set on all three skills and the documented command and agent key sets, with hooks/mcpServers/permissionMode rejected by the plugin-scope security exclusion
    requirement: D-12
    verification:
      - kind: integration
        ref: node scripts/check-plugin.mjs | grep -c -F 'P4'
        status: pass
    human_judgment: false
  - id: D3
    description: P5 proves every manifest/hook-config/retrieval-command referenced path resolves and the hook script is executable
    requirement: SC-3
    verification:
      - kind: integration
        ref: node scripts/check-plugin.mjs
        status: pass
    human_judgment: false
  - id: D4
    description: D-13 red-before-green — five demonstrations captured (two P3 scratch mutations, one P4 triple against the pre-phase worktree, two P5 scratch mutations)
    requirement: D-13
    verification:
      - kind: integration
        ref: verbatim captures in this SUMMARY, each with exit-1 status
        status: pass
    human_judgment: false
  - id: D5
    description: Guard stays hermetic — only node:fs and node:path imports, no import.meta.url, no HTTP; all previously green guards remain green
    requirement: SC-4
    verification:
      - kind: integration
        ref: grep import counts + node scripts/check-manifests.mjs && node scripts/check-plugin.mjs + claude plugin validate --strict (both targets)
        status: pass
    human_judgment: false
duration: 19m
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 06: Guard Expansion Summary

**P3, P4, and P5 close the last unguarded drift classes — marketplace validity, component frontmatter key sets, and referenced-path resolution — each proven red before it was trusted green.**

## Performance

- **Duration:** 19m
- **Started:** 2026-09-12T03:57:59Z
- **Completed:** 2026-09-12T04:16:55Z
- **Tasks:** 3/3
- **Files modified:** 1 (`scripts/check-plugin.mjs`, +442/-9)

## Accomplishments

- **P3** reads both `marketplace.json` files by key (never by position) and asserts: JSON parse; lowercase kebab-case `name`; non-empty `owner.name` and `plugins` array; every `plugins[].name` equal to the `plugin.json` name reached through that entry's `source`; `source` beginning `./` with no `..` segment and no backslash — shape-checked **before** any resolution (T-06-29) — and resolving to an existing directory containing the expected client manifest; and no entry carrying `skills`/`commands`/`agents`/`hooks`/`mcpServers`. Header records the reserved-name limitation (T-06-33).
- **P4** parses frontmatter with zero dependencies (first line exactly `---`, closing `---` line, top-level keys from non-indented identifier-colon lines only) and enforces three module-level allowed sets with source-of-truth comments: the Agent Skills six (plus name-matches-parent-directory and 1–1024 char description), the documented command set minus `paths` plus `name` (with the Cursor-requires-`name` rationale), and the plugin-scope agent list. `hooks`/`mcpServers`/`permissionMode` are a separate forbidden set whose message names the plugin-scope security exclusion (T-06-30), not a generic unknown-key error. Subjects are enumerated by directory listing; an absent component directory is not a failure, an existing one with zero markdown files is. Header records the measured C-4 negative (T-06-34).
- **P5** collects path subjects from the manifests (filtered walk: separator present, no whitespace, no URL scheme — keeps prose like the Codex longDescription's "call/type hierarchy" and https URLs out), resolving the Cursor family against `plugin/` and the Codex family against the repository root, with the two families' rationale commented. Hook-config command strings are resolved by substituting `${CLAUDE_PLUGIN_ROOT}` with `plugin/` (quotes stripped, result normalized); `cursor.json`'s top-level `version: 1` is Cursor's hook-file schema version and is never read (06-03 constraint honored). Every `.sh` target resolved from a hook config must carry an execute bit (`mode & 0o111`), with the hooks-not-firing symptom in the message (T-06-32). Retrieval commands in any `SKILL.md` naming `references/<file>.md` must point at an existing file carrying the grepped heading (D-10's mechanical half, covering both `jarvis-use` and `jarvis-setup`; targets discovered by scanning — the script contains no literal reference filename). Existing `commands/`/`agents/` components must hold at least one non-zero-byte markdown file (T-06-31).
- The success summary is a single line naming every green dimension: `ok: P1 (10 roster tools agree across shipped surfaces), P3 (2 marketplace manifests valid with resolving sources), P4 (6 frontmatter blocks within allowed key sets), P5 (14 referenced paths resolve, hook script executable) all green`.

## Task Commits

1. **Task 1: Dimension P3 — both marketplace manifests are valid and their sources resolve** — `d45ff2d` (feat)
2. **Task 2: Dimension P4 — skill, command, and agent frontmatter against their allowed key sets** — `1a5f80f` (feat)
3. **Task 3: Dimension P5 — every referenced path resolves and the hook script is executable** — `7c28eb6` (feat)

## Red-Before-Green Evidence (D-13)

All demonstrations ran the current, dimension-bearing `scripts/check-plugin.mjs` unmodified through the `process.cwd()` seam against deliberately broken trees.

### P3 — RED demonstration 1: `plugins[0].source` pointed at a non-existent directory

Mutation: scratch worktree copy of the tree, `.claude-plugin/marketplace.json` `"source": "./plugin"` → `"./no-such-dir"`.

```text
$ (cd <scratch> && node scripts/check-plugin.mjs); echo exit=$?
exit=1
P3: .claude-plugin/marketplace.json: plugins[0]: source "./no-such-dir" does not resolve to an existing directory
```

### P3 — RED demonstration 2: component key injected into the marketplace entry

Mutation: same scratch copy restored, then `"source": "./plugin"` → `"source": "./plugin", "hooks": "./hooks"`.

```text
$ (cd <scratch> && node scripts/check-plugin.mjs); echo exit=$?
exit=1
P3: .claude-plugin/marketplace.json: plugins[0]: declares component field hooks — components belong in plugin.json, not the marketplace entry (conflicting manifests)
```

### P4 — RED demonstration (triple): pre-phase worktree at `4d93b21`

The commit immediately before phase 6 began, with the current script copied in. All three `SKILL.md` files still carried the key plan 06-02 deleted (`version: "0.1.0"` at line 4); `plugin/commands/` and `plugin/agents/` did not exist and produced no failure (absent component = not shipped).

```text
$ (cd <worktree at 4d93b21> && node scripts/check-plugin.mjs); echo exit=$?
exit=1
P4: plugin/skills/jarvis-issues/SKILL.md: unknown frontmatter key "version"
P4: plugin/skills/jarvis-setup/SKILL.md: unknown frontmatter key "version"
P4: plugin/skills/jarvis-use/SKILL.md: unknown frontmatter key "version"
```

(The same run printed the pre-phase tree's own P1 failures — README "nine", stale longDescription, snake_case trigger examples — exactly the findings plan 06-01 fixed; they are P1's evidence, not P4's.)

### P5 — RED demonstration 1: referenced asset deleted

Mutation: scratch worktree copy, `plugin/assets/app-icon.png` deleted. Both relativity families that reference it fire.

```text
$ (cd <scratch> && node scripts/check-plugin.mjs); echo exit=$?
exit=1
P5: plugin/.cursor-plugin/plugin.json: logo "assets/app-icon.png" resolves to missing plugin/assets/app-icon.png
P5: .codex-plugin/plugin.json: interface.logo "./plugin/assets/app-icon.png" resolves to missing plugin/assets/app-icon.png
```

### P5 — RED demonstration 2: hook script execute bits cleared

Mutation: asset restored, `chmod -x plugin/hooks/jarvis-index-status.sh`. Both hook configs that resolve to the script fire.

```text
$ (cd <scratch> && node scripts/check-plugin.mjs); echo exit=$?
exit=1
P5: plugin/hooks/hooks.json: hook script plugin/hooks/jarvis-index-status.sh has no execute bit — hooks silently do not fire when the script is not executable (chmod +x fixes it)
P5: plugin/hooks/cursor.json: hook script plugin/hooks/jarvis-index-status.sh has no execute bit — hooks silently do not fire when the script is not executable (chmod +x fixes it)
```

Both scratch worktrees were removed (`git worktree remove --force`); `git worktree list` shows none, `git status --porcelain` lists no scratch directory, and `plugin/assets/app-icon.png` / `plugin/assets/jarvis-small.svg` have no diff against HEAD.

## GREEN Evidence — Final Tree

| Command | Outcome |
| --- | --- |
| `node scripts/check-plugin.mjs` | Exit 0; ok line names P1, P3, P4, P5 all green; zero `P3:`/`P4:`/`P5:` lines on stderr |
| `node scripts/check-manifests.mjs` | Exit 0: 3 manifests agree on version, MCP config pair byte-identical |
| `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` | Exit 0 |
| `claude plugin validate ./plugin --strict` | Exit 0: validation passed |
| `claude plugin validate . --strict` | Exit 0: validation passed; no `unknown hook event` output |
| `grep -c -E "^import .* from 'node:(fs|path)'" scripts/check-plugin.mjs` | 2 (exactly `node:fs` and `node:path`) |
| `grep -c -F 'import.meta.url' scripts/check-plugin.mjs` | 0 |
| `grep -c -F 'fetch(' scripts/check-plugin.mjs` | 0 |
| `grep -c -F '0o111' scripts/check-plugin.mjs` | 1 (executable-bit assertion present) |
| `grep -c -F 'troubleshooting.md' scripts/check-plugin.mjs` | 0 (reference targets discovered by scanning, not hard-coded) |
| `git diff e213b66..HEAD --stat -- scripts/check-manifests.mjs` | Empty — byte-unchanged |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Seam comment contained the literal `import.meta.url`**
- **Found during:** Task 1
- **Issue:** The header comment written by plan 06-01 said "(not import.meta.url)", which trips this plan's own verify `grep -c -F 'import.meta.url' … fails_when the printed count is not 0` — the verify would have failed on a byte-unchanged 06-01 artifact.
- **Fix:** Reworded the comment to "resolve against process.cwd(), never against this file's own location" — same meaning, literal removed. Code paths were already seam-only.
- **Files modified:** `scripts/check-plugin.mjs` (comment only)
- **Commit:** `d45ff2d`

**2. [Rule 1 - Bug] Double slash in substituted hook-command paths**
- **Found during:** Task 3 (first P5 red capture showed `plugin//hooks/jarvis-index-status.sh`)
- **Issue:** Substituting `${CLAUDE_PLUGIN_ROOT}` with `plugin/` left a doubled separator in the resolved target and its failure message.
- **Fix:** `normalize()` the substituted target; red demonstration 2 was re-captured against the fixed script (same failure, clean message).
- **Files modified:** `scripts/check-plugin.mjs`
- **Commit:** `7c28eb6`

### Process Notes (not plan deviations in outcome)

- Scratch/worktree demonstrations required copying the current `scripts/check-plugin.mjs` into every scratch tree — a worktree at a commit predates its own uncommitted dimension, and the first P3 attempt ran the stale HEAD script and showed no failure until the current script was copied in (the plan's P4 section states this step explicitly; it applies to all scratch demos).
- `git worktree add` failed in this environment (exit 127) because a global git post-checkout hook invokes a missing `/opt/homebrew/Cellar/omp/18.1.17/bin/omp` binary. Worked around per-invocation with `git -c core.hooksPath=/dev/null worktree add …` for scratch worktrees only; no git configuration was changed and no repository hook exists to affect.

## TDD Gate Compliance

Plan frontmatter is `type: tdd` and tasks carry `tdd="true"`, and `workflow.tdd_mode` is on, so the runtime RED/GREEN gate is nominally active for all three tasks. This plan's RED protocol is **demonstration-based by design** (must_haves D-13; each task's `<action>`; the plan `<output>` requiring "all five verbatim red-before-green captures with their exit statuses"): the guard script is both test and implementation, the failing runs happen against deliberately broken trees through the `process.cwd()` seam, and committing any part of the scratch copies is explicitly forbidden. Consequently there is no `test(06-06)` commit touching a `*.test.*` file, and the TAP-shaped `check tdd-red-evidence` verifier cannot classify guard-run output (no test-runner summary exists to parse). Gate outcome per the canonical fallback (tdd.md § Gate Enforcement): RED and GREEN are evidenced by the captured demonstrations and the green table above rather than by commit shape; the feat commits are the GREEN gate commits (`d45ff2d`, `1a5f80f`, `7c28eb6`).

## Issues Encountered

None beyond the process notes above. No authentication gates.

## User Setup Required

None.

## Next Phase Readiness

- `scripts/check-plugin.mjs` now carries P1, P3, P4, P5; the header still reserves P2a/P2b with their 06-03 constraint note (ignore `cursor.json`'s schema-version key when version parsing) for plan 06-07, which should extend the same `ok:` line.
- 06-05 (CI wiring) and 06-08 (release) proceed untouched.

## Self-Check: PASSED

- `scripts/check-plugin.mjs` exists with P3/P4/P5 blocks (verified by the green run above).
- Commits `d45ff2d`, `1a5f80f`, `7c28eb6` exist on `gsd/v0.9.1-milestone` (`git log --oneline -4`).
- No scratch directory in `git status --porcelain`; no leftover worktree in `git worktree list`.
