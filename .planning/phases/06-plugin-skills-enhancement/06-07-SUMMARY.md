---
phase: 06-plugin-skills-enhancement
plan: "07"
subsystem: plugin-release-guard
tags: [node, mcp, plugin, release, guard, semver, tag]
requires:
  - phase: 06-plugin-skills-enhancement plans 01-06
    provides: three manifests at 0.9.0 carrying the $schema key, Cursor hooks declaration, and corrected Codex longDescription; scripts/check-plugin.mjs with P1/P3/P4/P5 green behind one ok: line; both MCP configs byte-identical at jarvis-mcp>=0.9.0
provides:
  - Synchronized 0.9.1 release edit: all three plugin.json manifests and both Codex policy URLs (blob/v0.9.1/) in one commit (D-15/D-16/D-04)
  - Byte-identical jarvis-mcp>=0.9.1 floor in plugin/mcp.json and plugin/.mcp.json (D-03)
  - P2a guard dimension: the parsed jarvis-mcp requirement is a >= floor, carries no bracketed extra, is not below 0.6.0, and equals the manifest version — offline, every PR (D-12b)
  - P2b release gate behind --release / CHECK_PLUGIN_RELEASE=1: repository URL refs must pin v<manifestVersion> (one D-05 installer exemption) and the tag must exist on origin; unreachable remote skips with a note and never fails (D-12b)
affects: ["06-08 (release: push v0.9.1 tag, then node scripts/check-plugin.mjs --release goes green and the two URL 200 probes close D-04)"]
actuals:
  tokens: 4063   # chars/4 over the realized diff (16251 diff bytes, +227/-12 across 6 files)
  tasks: 3
  commits: 3
plan_head_before: e60bfa77f841d96ff12bb63eef48ab91e239debf
tech-stack:
  added: []
  patterns:
    - Natural red from plan ordering — manifests bumped before floors made P2a's first run fail on the real mid-plan tree with no scratch mutation
    - URL-shaped (not file-scoped) main exemption, so one D-05 decision covers the installer URL in every subject file
    - Skip-state tracking — a skipped network check never renders as a green ok:-line segment
key-files:
  created: []
  modified:
    - plugin/.claude-plugin/plugin.json
    - plugin/.cursor-plugin/plugin.json
    - .codex-plugin/plugin.json
    - plugin/mcp.json
    - plugin/.mcp.json
    - scripts/check-plugin.mjs
key-decisions:
  - "P2a's floor-to-version check is an identity, not a relation, because D-16 mirrored the server version into the plugin number; the header records that decoupling the two would turn it into a floor <= serverVersion relation"
  - "P2a deliberately does not re-assert three-way manifest equality or MCP-config byte-identity — scripts/check-manifests.mjs owns both, one contract one owner"
  - "The jarvis-mcp requirement is located by searching mcpServers.jarvis.args for the element naming the distribution, never by fixed index"
  - "P2b's main exemption belongs to the installer command URL shape, not to a file — the same D-05 URL lives in jarvis-setup/SKILL.md:22 and root README.md:45; any other main ref still fails everywhere"
  - "Tag existence comes from one non-comment git ls-remote --tags origin invocation, no HTTP client; an unreachable remote prints 'P2b: skipped (no remote reachable …)' and never fails"
  - "P2b's ok:-line segment renders only after the tag check actually ran and passed — a skipped check is never reported as a verified tag (T-06-41)"
requirements-completed: [D-03, D-04, D-05, D-12, D-13, D-15, D-16, SC-2, SC-5]
duration: 18m
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 07: Synchronized 0.9.1 Release Edit + P2 Guard Dimensions Summary

**One synchronized commit puts all three manifests and both Codex policy URLs at 0.9.1, both MCP configs carry the byte-identical `jarvis-mcp>=0.9.1` floor, and guard dimensions P2a (offline, every PR) and P2b (`--release`-gated) pin the floor and the repository URLs to that one number.**

## Performance

- **Duration:** 18m
- **Started:** 2026-09-12T04:20:37Z
- **Completed:** 2026-09-12T04:38:55Z
- **Tasks:** 3/3
- **Files modified:** 6 (5 manifests/configs, `scripts/check-plugin.mjs`)

## Accomplishments

- **Task 1 — synchronized bump (D-15/D-16/D-04):** `version` moved to `0.9.1` in all three `plugin.json` files in one commit; `privacyPolicyURL` and `termsOfServiceURL` retargeted to `blob/v0.9.1/` with owner, repository, path, and anchor segments unchanged. The 06-01 `longDescription` correction, the 06-03 Cursor `hooks` declaration, and the 06-04 `$schema` declaration all survived byte-identical; the MCP configs were deliberately left behind so P2a had a real red to fail on.
- **Task 2 — P2a + floor bump (D-03/D-12b/D-16):** P2a parses the `jarvis-mcp` requirement out of `plugin/mcp.json`'s `mcpServers.jarvis.args` by name (not index) and asserts four properties, each with its own `P2a: ` failure naming the offending value: `>=` operator (no exact pin), no bracketed extra, floor not below `0.6.0`, and floor **identical** to the version read only from the three `plugin.json` files (`plugin/hooks/cursor.json`'s numeric hook-schema version is never read — 06-03 constraint). Both MCP configs then moved to the byte-identical `jarvis-mcp>=0.9.1` floor with key order, `--python` floor, entry point, and 2-space indent unchanged.
- **Task 3 — P2b release gate (D-04/D-05/D-12b):** gated behind `--release` or `CHECK_PLUGIN_RELEASE=1` (flag test in the `verify-build.mjs:29-30` style, no argument parser). Ref half scans `.codex-plugin/plugin.json`, the three `SKILL.md`, `plugin/README.md`, and root `README.md` for both `blob/<ref>/` and raw `<owner>/<repo>/<ref>/` URLs into `jarvis-intelligence/jarvis-index`; refs must equal `v<manifestVersion>` except the installer command URL, which stays on `main` per D-05. Tag half asks the remote with a single `git ls-remote --tags origin` invocation (exactly one non-comment line; zero `fetch(` in the script) and fails naming the missing tag; any failure to reach the remote prints a skip note and never fails. The header entry records the ordering constraint (GitHub does not serve `blob/<ref>` before the ref exists — verified 404 vs 200) and why P2b can never be a PR-time check. `.github/workflows/checks.yml` is untouched and contains neither `P2b`, `--release`, nor `CHECK_PLUGIN_RELEASE`.
- **Single `ok:` line preserved and extended:** `ok: P1 (…), P2a (jarvis-mcp>=0.9.1 floor matches manifest version 0.9.1), P3 (…), P4 (…), P5 (…) all green`; a release-flagged run reports `P2b (2 repository URLs pinned at v0.9.1, tag present on origin)` separately from the always-on dimensions.

## Task Commits

1. **Task 1: Synchronized manifest bump to 0.9.1 and the tag-targeted Codex URLs** — `98da4f2` (feat)
2. **Task 2: Dimension P2a red, then the byte-identical 0.9.1 floor bump green** — `0a9cc92` (feat)
3. **Task 3: Dimension P2b — tag-referencing URLs and tag existence, gated behind --release** — `2389a7a` (feat)

## Red-Before-Green Evidence (D-13)

Three captures, each verbatim with its exit status.

### P2a — RED: natural mid-plan state (manifests at 0.9.1, floors still at >=0.9.0)

Produced by Task 1's deliberate ordering — no scratch mutation:

```text
$ node scripts/check-plugin.mjs; echo exit=$?
P2a: plugin/mcp.json: jarvis-mcp floor 0.9.0 does not equal the manifest version 0.9.1 — the floor and the release version must read as one fact
exit=1
```

### P2b — RED 1: release flag before the tag exists (real tree)

```text
$ node scripts/check-plugin.mjs --release; echo exit=$?
P2b: tag v0.9.1 does not exist on origin — push the release tag, then re-run this check
exit=1
```

The ref half is already green here: the two `blob/v0.9.1/` URLs pass and the installer URL's `main` ref is accepted in both subject files that carry it.

### P2b — RED 2: ref half, scratch worktree (script copied in; worktree at HEAD predates the uncommitted P2b)

Mutation A — `blob/v0.9.1/` → `blob/v0.8.0/` (a stale ref that exists on the remote):

```text
$ (scratch) node scripts/check-plugin.mjs --release; echo exit=$?
P2b: .codex-plugin/plugin.json: https://github.com/jarvis-intelligence/jarvis-index/blob/v0.8.0/plugin/README.md pins v0.8.0, expected v0.9.1
P2b: .codex-plugin/plugin.json: https://github.com/jarvis-intelligence/jarvis-index/blob/v0.8.0/plugin/LICENSE pins v0.8.0, expected v0.9.1
P2b: tag v0.9.1 does not exist on origin — push the release tag, then re-run this check
exit=1
```

Mutation B — `blob/v0.9.1/` → `blob/main/` (`main` outside the installer exemption):

```text
$ (scratch) node scripts/check-plugin.mjs --release; echo exit=$?
P2b: .codex-plugin/plugin.json: https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/README.md pins main — main is permitted only for the installer command URL; expected v0.9.1
P2b: .codex-plugin/plugin.json: https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/LICENSE pins main — main is permitted only for the installer command URL; expected v0.9.1
P2b: tag v0.9.1 does not exist on origin — push the release tag, then re-run this check
exit=1
```

Both scratch worktrees were removed (`git -c core.hooksPath=/dev/null worktree remove --force`); `git worktree list` shows only the main checkout and `git status --porcelain` lists no scratch directory. No tag was created by this plan.

Additional behavioral proofs: with a stubbed `git` failing on PATH, the release run prints `P2b: skipped (no remote reachable — Command failed: git ls-remote --tags origin)` and exits 0, with P2b omitted from the `ok:` line (never reported as verified); the upstream `scip` `v0.9.0` citations in `jarvis-use` are not flagged because the URL patterns only match this project's owner/repository.

## GREEN Evidence — Final Tree

| Command | Outcome |
| --- | --- |
| `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` | Exit 0; `ok:` names P1, P2a, P3, P4, P5 all green; zero `^P[0-9]` lines on stderr |
| `node scripts/check-plugin.mjs --release` | Exit 1 solely on tag existence (expected end-of-plan state; goes green after 06-08 pushes `v0.9.1`) |
| `cmp plugin/mcp.json plugin/.mcp.json` | Identical |
| Three manifests at `0.9.1`; `grep -c -F 'blob/v0.9.1/' .codex-plugin/plugin.json` | 2; `blob/v0.9.0/` count 0 |
| `claude plugin validate ./plugin --strict && claude plugin validate . --strict` | Exit 0 both |
| `grep -c -F 'fetch(' scripts/check-plugin.mjs` | 0 (no HTTP client) |
| `grep -v '^[[:space:]]*//' scripts/check-plugin.mjs \| grep -c -F 'ls-remote'` | 1 (one non-comment invocation) |
| `git status --porcelain -- .github/workflows/checks.yml` + content scan | Untouched; no `P2b`, `--release`, or `CHECK_PLUGIN_RELEASE` |

## The 404 Window (expected, deliberate)

Both Codex policy URLs now reference `blob/v0.9.1/…` and **return HTTP 404 from this commit until plan 06-08 pushes the `v0.9.1` tag at the merge commit**. No earlier ordering exists: GitHub resolves a ref against refs that exist — research verified the identical URL shape returns 404 for a missing tag (`blob/v0.9.0/…`) and 200 for an existing one (`blob/v0.8.0/…`) — so the commit carrying the URLs is necessarily the commit the tag points at. Softening the URLs to `main` was rejected (D-05/Phase 4 precedent: reading links pin to tags); plan 06-08 closes the window by pushing the tag and probing both URLs for 200.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] P2b's `main` exemption made URL-shaped instead of file-scoped**
- **Found during:** Task 3 implementation
- **Issue:** The plan permits a `main` ref "only in `plugin/skills/jarvis-setup/SKILL.md`", but the identical D-05 installer command URL also appears in root `README.md:45` (the quick-start `curl | sh`), which no plan in this phase edits. A file-scoped exemption would fail P2b on that URL forever, contradicting the plan's own end state ("`--release` exits 1 on tag existence" as the only expected failure) and D-05's rationale (the installer command stays on `main`).
- **Fix:** The exemption matches the installer URL shape (`raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh`) wherever it appears; any other `main` ref — above all a `blob/main/` reading link — still fails in every file, preserving T-06-38's substance. Success criterion "permits that ref in exactly one file" is satisfied as "exactly one URL".
- **Files modified:** `scripts/check-plugin.mjs`
- **Commit:** `2389a7a`

**2. [Rule 1 - Bug] Skipped tag check was rendered as a green summary segment**
- **Found during:** Task 3 (offline smoke with a stubbed failing `git` on PATH)
- **Issue:** On the skip path the run exited 0 but the `ok:` line still claimed `P2b (… tag present on origin)` although the tag check had never run — exactly the repudiation threat T-06-41 registers.
- **Fix:** Added `p2bTagPresent`, set only after `git ls-remote` succeeds and the tag is found; the `ok:` line includes P2b only when `RELEASE_MODE && p2bTagPresent`. The skip note alone documents a skipped run.
- **Files modified:** `scripts/check-plugin.mjs`
- **Commit:** `2389a7a`

### Process Notes (not plan deviations in outcome)

- Scratch-worktree demonstrations require copying the current `scripts/check-plugin.mjs` into every scratch tree — a worktree at HEAD predates its own uncommitted dimension (same lesson as 06-06).
- `git worktree add` requires `-c core.hooksPath=/dev/null` in this environment (global post-checkout hook invokes a missing `omp` binary; carried from 06-06).
- One scratch mutation briefly ran against the main checkout due to an empty shell variable; the real `.codex-plugin/plugin.json` was restored with a single-file `git checkout --` and `git diff HEAD` verified no residual mutation before the demo was re-run in a fresh scratch. No other file was touched.

## TDD Gate Compliance

Plan frontmatter is `type: execute` with `tdd="true"` tasks and `workflow.tdd_mode` is on, so the runtime RED/GREEN gate is nominally active for Tasks 2 and 3. As in 06-06, this plan's RED protocol is **demonstration-based by design** (D-13; each task's `<action>`; the plan `<output>` requiring verbatim captures with exit statuses): the guard script is both test and implementation, red runs happen against the natural mid-plan tree and through the `process.cwd()` seam in scratch worktrees, and the plan's success criteria forbid introducing a test framework. Consequently there is no `test(06-07)` commit touching a `*.test.*` file; the verbatim red captures and exit statuses above are the RED evidence, each GREEN is the same command against the final tree, and no REFACTOR was needed beyond the Rule 1 fixes documented above (both verified green in the same task).

## Issues Encountered

None beyond the process notes above. No authentication gates. `git ls-remote --tags origin` verified reachable from this working copy (tags: `v0.7.3`, `v0.8.0`, `scip-…`, `zoekt-…`).

## User Setup Required

None.

## Next Phase Readiness

- `scripts/check-plugin.mjs` now carries P1, P2a, P3, P4, P5 always-on plus P2b behind `--release`; the `ok:` line names every green dimension.
- 06-08 (release gate, non-autonomous) can proceed: push `v0.9.1` at the merge commit, then `node scripts/check-plugin.mjs --release` turns green and the two policy URLs must probe 200.
- 06-05 (human-gated) remains untouched, as required.

## Self-Check: PASSED

- All six modified files exist with the intended content (verified by the green battery above).
- Commits `98da4f2`, `0a9cc92`, `2389a7a` exist on `gsd/v0.9.1-milestone` (`git log --oneline -4`); `git rev-list --count e60bfa7..HEAD` = 3.
- No scratch directory in `git status --porcelain`; no leftover worktree in `git worktree list`; no tag created.
