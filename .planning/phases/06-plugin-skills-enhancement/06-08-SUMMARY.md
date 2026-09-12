---
phase: 06-plugin-skills-enhancement
plan: "08"
subsystem: plugin-release-guard
tags: [git-tag, release, github, mcp, plugin, cursor, codex]
requires:
  - phase: 06-plugin-skills-enhancement plan 07
    provides: synchronized 0.9.1 manifest edit, byte-identical jarvis-mcp>=0.9.1 floor, P2a (offline) and P2b (--release-gated) guard dimensions, both Codex policy URLs already retargeted to blob/v0.9.1/ and 404ing by construction
provides:
  - The v0.9.1 annotated, GPG-signed git tag pushed to origin, pointing at merge commit 7b569e7f6bc7d54d1a7c81f1798d2bfa060827f9
  - node scripts/check-plugin.mjs --release green for the first time, naming P2b alongside P1/P2a/P3/P4/P5 (D-04/D-13)
  - Both .codex-plugin/plugin.json policy URLs (README.md, LICENSE) confirmed HTTP 200 (D-04 closed)
  - Cursor submission checklist walked mechanically and by inspection (name identity, kebab-case, no parent-dir path segments, committed logo, README usage docs)
  - Full verdict table for the six CI-unprovable client verifications, each performed-with-result or outstanding-with-named-blocker (SC-3)
affects: []
actuals:
  tokens: 0   # no repository file was changed by this plan; the only artifact is this SUMMARY and a pushed git tag (not a commit)
  tasks: 3
  commits: 0
plan_head_before: 7b569e7f6bc7d54d1a7c81f1798d2bfa060827f9
tech-stack:
  added: []
  patterns:
    - "A release tag is proven by re-running the same offline guard with a flag (--release), never by a bespoke one-off script — P2b is the same scripts/check-plugin.mjs process the rest of the phase already trusts"
    - "URL probes read the literal strings out of the shipped manifest rather than reconstructing them, so a probe failure can only mean a real defect (wrong ref, missing path) and never a typo in the verification step itself"
key-files:
  created: []
  modified: []
key-decisions:
  - "Task 1 (blocking-human checkpoint) was answered 'push' by the operator before this execution began, with all four preconditions independently reconfirmed in this session: HEAD/main/origin main all resolve to 7b569e7 (PR #15, merged); git ls-remote --tags origin refs/tags/v0.9.1 printed nothing (name free); node scripts/check-manifests.mjs and node scripts/check-plugin.mjs both exited 0 at that commit"
  - "Codex end-to-end plugin-root resolution (checklist item 3) was not tested with a live codex plugin marketplace add / codex plugin add, even though codex-cli 0.153.4 is installed on this machine — that command mutates the operator's global ~/.codex/config.toml, a side effect outside this plan's repo scope and outside what was authorized. Recorded outstanding rather than attempted."
  - "Navigator answer quality (checklist item 5) was probed as far as this tool session allows: indexed jarvis-index itself and ran goToDefinition -> callHierarchy -> blastRadius against it directly. This exercises the underlying MCP tools, not the actual jarvis-navigator subagent persona invoked through a marketplace-installed client, so it is evidence toward the question, not a substitute answer to it."
requirements-completed: [D-04, D-15, D-16, SC-2, SC-3, SC-5]
duration: ~15m
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 08: Release Gate Closed — v0.9.1 Tag Pushed, Cursor Checklist Recorded Summary

**Pushed the annotated, GPG-signed `v0.9.1` tag to origin at merge commit `7b569e7`, turned `node scripts/check-plugin.mjs --release` green for the first time (naming P2b), confirmed both previously-404 Codex policy URLs now return HTTP 200, and recorded a full verdict table for the Cursor submission checklist plus all six CI-unprovable client verifications — four outstanding with named blockers, one (navigator quality) partially exercised via direct MCP tool calls, and one (README/checklist mechanics) fully confirmed.**

## Performance

- **Duration:** ~15m (subagent session; no separate start timestamp captured — first action was the git/branch/precondition check, last is this write)
- **Completed:** 2026-09-12T05:36:03Z
- **Tasks:** 3/3
- **Files modified:** 0 (this SUMMARY is the only artifact this plan writes to disk; the tag is a pushed ref, not a file change)

## Accomplishments

- **Task 1 — decision recorded, preconditions reconfirmed:** The operator had already approved pushing the `v0.9.1` tag ("approve all", then explicitly "let merge when ci green" for PR #15 gating it). This execution independently reconfirmed all four preconditions the checkpoint requires before acting: (1) current branch `main` at `7b569e7` = `origin/main` = merge commit for PR #15 ("Merge pull request #15 from jarvis-intelligence/gsd/v0.9.1-milestone"); (2) `git ls-remote --tags origin refs/tags/v0.9.1` printed nothing — tag name free; (3) `node scripts/check-manifests.mjs` exited 0 (`ok: 3 manifests agree on version, MCP config pair byte-identical`); (4) `node scripts/check-plugin.mjs` (offline) exited 0 (`ok: P1 (...), P2a (...), P3 (...), P4 (...), P5 (...) all green`). Decision: **push**.
- **Task 2 — tag created, pushed, and the release proven:** Created annotated tag `v0.9.1` (GPG-signed, `git tag -v` reports "Good signature") at `7b569e7f6bc7d54d1a7c81f1798d2bfa060827f9` with a one-line message naming the release contents. Pushed it (`git push origin refs/tags/v0.9.1` -> `[new tag] v0.9.1 -> v0.9.1`). Verified on the remote with peeling (`git ls-remote --tags origin refs/tags/v0.9.1 refs/tags/v0.9.1^{}`): the tag object dereferences to exactly `7b569e7...`, the merge commit. `node scripts/check-plugin.mjs --release` then exited 0, naming P2b for the first time. Both Codex policy URLs returned HTTP 200. All always-on guards and both strict `claude plugin validate` runs stayed green at the tagged commit; `cmp plugin/mcp.json plugin/.mcp.json` stayed identical; `git status --porcelain` showed no plan-caused change (only the pre-existing, out-of-scope session artifacts that were present before this execution began).
- **Task 3 — Cursor checklist and six client verifications recorded:** All four mechanical Cursor-checklist assertions passed (name identity + kebab-case, committed logo, no parent-directory path segments, `--release` still green). `plugin/README.md` read in full: it documents install for all three clients, the tool roster, a `## Privacy` section matching the `#privacy` anchor in the manifest's `privacyPolicyURL`, and the exact three hook caveats named in the plan's read list — confirmed still accurate. Of the six CI-unprovable client verifications: one (navigator quality) was partially exercised with real tool calls against a freshly indexed copy of this repo; one (Codex end-to-end) was deliberately not attempted to avoid mutating the operator's global Codex config; the rest (commands-in-client-surface, hook live injection, any Cursor claim, `openai.yaml` `interface:` shape) have no live-client path available in this environment. All six are recorded below with their exact blocker — none inferred, none omitted.

## Task Commits

None. This plan's `files_modified: []` frontmatter is exact: no repository file was created or edited by any of the three tasks. The only mutation this plan makes is the pushed `v0.9.1` git tag, which is a ref, not a commit — `git rev-list --count 7b569e7..HEAD` is `0` because `HEAD` never moved. Per the executor protocol, a `0`-commit count with no code changes (this plan is verification/release-tagging only) is the legitimate case, not a defect.

This SUMMARY intentionally is **not** committed here: `.planning/STATE.md` and `.planning/ROADMAP.md` are explicitly out of scope for this execution ("main reconciles after"), and the standard `final_commit` step bundles the SUMMARY with those two files plus `REQUIREMENTS.md`. Committing the SUMMARY alone, ahead of that reconciliation, would leave `.planning/ROADMAP.md`/`STATE.md` referencing a not-yet-recorded plan across a commit boundary. The file is written to disk and ready for that reconciliation pass.

## Files Created/Modified

- `.planning/phases/06-plugin-skills-enhancement/06-08-SUMMARY.md` — this file (created)
- No other file in the repository was created, edited, or deleted by this plan.

## Green Evidence — Task 2

### Tag creation and remote verification

```text
$ git tag -a v0.9.1 -m "v0.9.1: 10-tool surface realignment, new /jarvis:index and /jarvis:status commands, SessionStart hook, jarvis-navigator subagent, five plugin guard dimensions (P1-P5), jarvis-mcp>=0.9.1 floor" 7b569e7f6bc7d54d1a7c81f1798d2bfa060827f9

$ git tag -v v0.9.1
gpg: Signature made Sat Sep 12 12:33:44 2026 +07
gpg:                using EDDSA key 7AEF32BD17B37F28045D46D410D5CA8B1E645168
gpg: Good signature from "Phuong Doan <95doanphuong@gmail.com>" [ultimate]
object 7b569e7f6bc7d54d1a7c81f1798d2bfa060827f9
type commit
tag v0.9.1
tagger PhuongDoan <95doanphuong@gmail.com> 1789191224 +0700

v0.9.1: 10-tool surface realignment, new /jarvis:index and /jarvis:status commands, SessionStart hook, jarvis-navigator subagent, five plugin guard dimensions (P1-P5), jarvis-mcp>=0.9.1 floor

$ git push origin refs/tags/v0.9.1
To github.com-phuongddx:jarvis-intelligence/jarvis-index.git
 * [new tag]         v0.9.1 -> v0.9.1

$ git ls-remote --tags origin refs/tags/v0.9.1 refs/tags/v0.9.1^{}
6bc0eb0d93be049cb5ca391cf8217c3f33b3a75a	refs/tags/v0.9.1
7b569e7f6bc7d54d1a7c81f1798d2bfa060827f9	refs/tags/v0.9.1^{}
```

The `^{}` peel confirms the tag object dereferences to `7b569e7...` — the merge commit — not a divergent ref.

### `--release` gate — RED (before push, this session) then GREEN (after)

RED, captured immediately before the push in this same session (matches 06-07's end-of-plan red exactly):

```text
$ node scripts/check-plugin.mjs --release; echo exit=$?
P2b: tag v0.9.1 does not exist on origin — push the release tag, then re-run this check
exit=1
```

GREEN, captured after the push:

```text
$ node scripts/check-plugin.mjs --release; echo exit=$?
ok: P1 (10 roster tools agree across shipped surfaces), P2a (jarvis-mcp>=0.9.1 floor matches manifest version 0.9.1), P3 (2 marketplace manifests valid with resolving sources), P4 (6 frontmatter blocks within allowed key sets), P5 (14 referenced paths resolve, hook script executable), P2b (2 repository URLs pinned at v0.9.1, tag present on origin) all green
exit=0
```

`node scripts/check-plugin.mjs --release | grep -c -F 'P2b'` -> `1` (P2b is reported explicitly, not silently folded in).

### URL probes — 200 on both, using the strings read from `.codex-plugin/plugin.json`

`privacyPolicyURL` = `https://github.com/jarvis-intelligence/jarvis-index/blob/v0.9.1/plugin/README.md#privacy`; `termsOfServiceURL` = `https://github.com/jarvis-intelligence/jarvis-index/blob/v0.9.1/plugin/LICENSE` (fragment stripped for the probe per the plan's literal `<automated>` command; GitHub's HTTP status is identical with or without a `#` fragment).

```text
$ curl -o /dev/null -s -w '%{http_code}\n' -L https://github.com/jarvis-intelligence/jarvis-index/blob/v0.9.1/plugin/README.md
200
$ curl -o /dev/null -s -w '%{http_code}\n' -L https://github.com/jarvis-intelligence/jarvis-index/blob/v0.9.1/plugin/LICENSE
200
```

Both previously-404 URLs (per 06-07's "404 Window" section) now resolve. D-04 is closed.

### Regression sweep at the tagged commit

```text
$ node scripts/check-manifests.mjs && node scripts/check-plugin.mjs
ok: 3 manifests agree on version, MCP config pair byte-identical
ok: P1 (...), P2a (...), P3 (...), P4 (...), P5 (...) all green

$ claude plugin validate ./plugin --strict && claude plugin validate . --strict
✔ Validation passed (plugin manifest)
✔ Validation passed (marketplace manifest)

$ cmp plugin/mcp.json plugin/.mcp.json
(no output — identical)

$ git status --porcelain
 M .planning/config.json
?? .claude/.ckignore
?? .gsd/
?? .planning/intel/
?? .planning/research/.cache/
?? .planning/state.json
?? .planning/ui-reviews/
```

The seven lines above are unrelated session artifacts present before this execution began (confirmed by an identical `git status --short` at the very start of this task, before any command in this plan ran). No file this plan is responsible for is listed. Nothing was staged, edited, or committed by Task 2, matching its "edit no file" contract.

## Cursor Submission Checklist (Task 3)

| Item | Verdict | Evidence |
|---|---|---|
| Plugin `name` unique, lowercase kebab-case, identical in `.cursor-plugin/marketplace.json` and `plugin/.cursor-plugin/plugin.json` | **Pass** | Both files carry `"name": "jarvis"`; automated check `node --input-type=module -e "..."` (plan's literal script) exits 0 — names match, matches `^[a-z0-9]+(-[a-z0-9]+)*$` |
| Every path field in the Cursor manifest (logo, skills, mcpServers, hooks) relative, no parent-directory segment, resolves | **Pass** | `plugin/.cursor-plugin/plugin.json`: `logo: "assets/app-icon.png"`, `skills: "./skills/"`, `mcpServers: "./mcp.json"`, `hooks: "./hooks/cursor.json"` — all relative; `grep -c -F '..' plugin/.cursor-plugin/plugin.json` -> `0` |
| Referenced logo committed | **Pass** | `git ls-files --error-unmatch plugin/assets/app-icon.png` exits 0, prints the path |
| `plugin/README.md` documents usage | **Pass (human judgment)** | Read in full: covers what the plugin gives you (10 tools), install steps for Codex CLI, Claude Code, and Cursor (team marketplace + local symlink paths), optional `[semantic]`/`[watch]` extras, the `SessionStart` hook with its three stated caveats, a `## Privacy` section (anchor matches the manifest's `#privacy` reference), and links. Reads as genuinely usable documentation to a reviewer, not filler. |
| Uniqueness on the marketplace (no other `jarvis` plugin already registered under this name) | **Outstanding** | No API or CLI in this environment queries the live Cursor marketplace for name collisions; this is a submission-time check Cursor itself performs. Not fabricated as passed. |

## Six CI-Unprovable Client Verifications (Task 3)

| # | Verification | Verdict | Evidence / Blocker |
|---|---|---|---|
| 1 | `/jarvis:index` and `/jarvis:status` appear and run in Claude Code's `/` menu and in Cursor's command surface, after a real marketplace install | **Outstanding** | No marketplace-installed Claude Code or Cursor client is available in this tool session (this session reaches jarvis's MCP tools directly, not through a marketplace-installed plugin's command surface). CI already proves the two commands' frontmatter parses (P4); rendering in a live client's menu needs that live client. |
| 2 | The `SessionStart` hook actually injects its context into a live session (staleness note on a stale/absent index, silence when nothing to report) | **Outstanding** | Same constraint as #1 — no marketplace-installed session with the hook wired through `hooks.json`/`cursor.json` is available here to observe injected vs. silent output. |
| 3 | Codex end-to-end: does a marketplace install sourced at `./plugin` resolve the plugin root to `plugin/` (hook discovered) or the repository root (hook not discovered); Codex additionally requires a human trust action even once discovered | **Outstanding** | `codex-cli 0.153.4` is installed and `codex plugin marketplace add`/`codex plugin add` do exist (confirmed via `--help`; no `validate` subcommand exists, matching the research finding). A live `codex plugin marketplace add <path>` was deliberately **not** run: it writes to the operator's global `~/.codex/config.toml`, a persistent side effect outside this repository and outside what this plan's scope or the assignment authorized. `plugin/README.md`'s three-caveat hook section (Codex trust-gate, unresolved plugin-root question, Cursor schema silence) was re-read and still matches the current state of knowledge — no new information changes it. |
| 4 | Any Cursor claim at all (submission is manual review; no validator CLI exists) | **Outstanding** | `cursor --version` confirms no Cursor IDE installation on this machine ("Error: No Cursor IDE installation found"). Must be routed to a human on a Cursor machine. |
| 5 | Navigator subagent produces useful multi-hop answers (definition -> call hierarchy -> blast radius) | **Outstanding, partially exercised** | Indexed `jarvis-index` itself live in this session (`jarvis indexRepo`, outcome `degraded`). Ran the underlying chain directly: `goToDefinition("readManifestVersion")` succeeded (tree-sitter, `scripts/check-plugin.mjs:167`); `callHierarchy` on the same symbol failed — `"no SCIP call-edge data in this snapshot"` (this workstation's local `scip-typescript` enrichment failed during indexing, a real local-toolchain gap, recoverable via `jarvis reindex jarvis-index --scip`, not a plugin defect); `blastRadius` failed — `"'jarvis-index' has no packages registered at all"` (this repo isn't registered in a multi-repo package-dependency graph, so that hop has no data regardless of SCIP status). This exercises the same underlying MCP tools the `jarvis-navigator` subagent calls, but not the subagent persona itself invoked through a marketplace-installed client — so it is supporting evidence, not a substitute verdict, for "does the navigator produce useful answers." |
| 6 | `interface:` nesting in `plugin/skills/*/agents/openai.yaml` — real OpenAI skill-manifest shape or inert decoration (research open question 6) | **Outstanding** | Read all three files (`jarvis-use`, `jarvis-setup`, `jarvis-issues`); each ships exactly the `interface: {display_name, short_description, default_prompt}` block the research flagged — OpenAI's published docs show `dependencies.tools` but never this block, and OpenAI publishes no schema or validator for it. No live OpenAI skills install is available in this environment to answer it. Recorded outstanding with the no-published-schema/no-validator blocker; YAML-parses-cleanly is explicitly not treated as evidence of validity, per the plan's instruction. |

No item above is marked passed on inference; every outstanding row names its specific blocker.

## Decisions Made

- Task 1's decision was **push**, already given by the operator before this execution, with all four preconditions independently reconfirmed here rather than taken on trust (see Task 1 accomplishment above).
- The Codex live-install test (verification #3) was deliberately withheld rather than attempted, because the only way to answer it — `codex plugin marketplace add`/`codex plugin add` — mutates the operator's global Codex configuration, a side effect this plan's scope does not cover. This is a scope decision, not a missed opportunity.
- The navigator-quality probe (verification #5) was run directly against the underlying MCP tools rather than left completely untouched, because those tools were reachable in this session and a partial, honestly-caveated result is more informative than a bare "outstanding" — but it is reported as partial, not as a pass, because it does not exercise the actual subagent persona.
- Per this execution's explicit constraints, `.planning/STATE.md`, `.planning/ROADMAP.md`, and `.planning/REQUIREMENTS.md` were left untouched and no commit was made in this session; the parent session reconciles those and performs the final metadata commit.

## Deviations from Plan

None — plan executed exactly as written. Task 2 edited no file (verified: `git status --porcelain` identical before and after). All `<automated>` verify commands from the plan's Task 2 and Task 3 blocks were run verbatim and passed. Task 3's manual verifications were recorded exactly as the plan's acceptance criteria require: no row omitted, no row marked passed on inference; where the assignment's own framing anticipated "no live Cursor/Codex install… most of these will be outstanding," that framing held, with one exception (#5) where partial live evidence was gathered and reported as partial.

## Issues Encountered

None that blocked completion. Two environment observations worth carrying forward (not defects in this phase's deliverables):

- `scip-typescript` enrichment failed during the live `indexRepo` call used for verification #5 ("SCIP enrichment failed — scip-typescript index failed... The syntax baseline and search were still published (exit-0 degraded)"). This is a local toolchain gap on this workstation, unrelated to the plugin surface this phase built.
- `jarvis-index` is not currently registered in any multi-repo package-dependency graph on this workstation, so `blastRadius` has no data to traverse regardless of SCIP status — expected for a single-repo local check, not a defect.

## User Setup Required

None from this plan. Verification #3 (Codex) and #4 (Cursor) genuinely need a human with the respective client installed; verification #1 and #2 need a real marketplace install in either client. These are pre-existing, structurally-manual items the validation strategy already named — this plan records their status, it does not resolve them.

## Next Phase Readiness

- **Phase 06 is functionally closed by this plan's proof obligations:** the `v0.9.1` tag exists on origin at the correct commit, the release gate is green, both policy URLs resolve, and the Cursor checklist's mechanical half is fully green.
- **Six items remain genuinely outstanding** (five fully outstanding, one partially exercised) — all client-verification items no CI or this tool session can close. They are not phase blockers per the plan's own design (`workflow.human_verify_mode: end-of-phase`; these were always intended to land in the phase's end-of-phase UAT record, not as a mid-flight halt), but they should be surfaced to a human with live Claude Code, Cursor, and Codex installs before the plugin is announced as fully verified across all three clients.
- `.planning/STATE.md`, `.planning/ROADMAP.md`, and `.planning/REQUIREMENTS.md` still need the standard end-of-plan reconciliation (plan-advance, progress bar, requirement checkboxes for D-04/D-15/D-16/SC-2/SC-3/SC-5, and the final metadata commit) — explicitly deferred to the parent session per this execution's constraints.

## Self-Check: PASSED

- Tag exists on remote and dereferences correctly: `git ls-remote --tags origin refs/tags/v0.9.1 refs/tags/v0.9.1^{}` -> `6bc0eb0d... refs/tags/v0.9.1` / `7b569e7f... refs/tags/v0.9.1^{}` (re-verified at SUMMARY-write time, same result as during Task 2).
- `node scripts/check-plugin.mjs --release` re-run at SUMMARY-write time: exit 0, names P2b.
- `git status --short` at SUMMARY-write time (pre-write) is byte-identical to the pre-execution snapshot, confirming no plan-caused file change: only `.planning/config.json` (modified) and six untracked session-artifact paths, none of which this plan touches.
- This SUMMARY file exists at `.planning/phases/06-plugin-skills-enhancement/06-08-SUMMARY.md` (verified by the write tool's own confirmation).

---
*Phase: 06-plugin-skills-enhancement*
*Completed: 2026-09-12*
