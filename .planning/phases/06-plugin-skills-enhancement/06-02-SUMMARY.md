---
phase: 06-plugin-skills-enhancement
plan: "02"
subsystem: plugin-skills
tags: [agent-skills, mcp, documentation, plugin, jarvis-mcp]
requires:
  - phase: 06-plugin-skills-enhancement
    provides: P1 tool-roster guard and corrected ten-tool plugin surface
provides:
  - Agent-Skills-conformant two-key frontmatter across all shipped skills
  - On-demand setup troubleshooting with `indexRepo` and `universal-ctags` recovery guidance
  - 0.9.1-accurate navigation, package-floor, and issue-limitation instructions
affects: [06-06, 06-07, plugin-release]
actuals:
  tokens: 3647
  tasks: 3
  commits: 7
commits: 7
plan_head_before: 91aecd9819ee64e97c5fccbdf31028a88f3f3a1c
tech-stack:
  added: []
  patterns:
    - Skills use only the Agent Skills allowed-key set and require `name` plus `description`.
    - Detailed troubleshooting remains in a reference file reached by an exact on-demand retrieval command.
key-files:
  created:
    - plugin/skills/jarvis-setup/references/troubleshooting.md
  modified:
    - plugin/skills/jarvis-setup/SKILL.md
    - plugin/skills/jarvis-use/SKILL.md
    - plugin/skills/jarvis-issues/SKILL.md
    - .claude/CLAUDE.md
    - docs/code-standards.md
key-decisions:
  - "Removed the unsupported skill `version` frontmatter key instead of relocating it under metadata."
  - "Kept the setup installer URL on main while moving troubleshooting behind a loaded-on-demand reference."
  - "Corrected the typeHierarchy limitation to cover every missing-relationship-data case, not only unpatched SCIP."
patterns-established:
  - "Skill references use a named H2 anchor with a literal grep retrieval command."
requirements-completed: [D-02, D-03, D-05, D-10, D-11, D-18, SC-1, SC-2]
coverage:
  - id: D1
    description: All three skills have spec-conformant two-key frontmatter and the convention documents specify the allowed Agent Skills keys.
    requirement: D-11
    verification:
      - kind: other
        ref: grep frontmatter and convention assertions from Task 1
        status: pass
      - kind: integration
        ref: node scripts/check-plugin.mjs
        status: pass
    human_judgment: false
  - id: D2
    description: Setup troubleshooting is on demand and documents indexRepo recovery, ctags recovery, and the 0.9.1 package floor.
    requirement: D-02
    verification:
      - kind: other
        ref: Task 2 table, retrieval, floor, URL, and setup.sh-diff assertions
        status: pass
      - kind: integration
        ref: node scripts/check-plugin.mjs
        status: pass
    human_judgment: false
  - id: D3
    description: Jarvis-use explains syntax identifiers and removed-option behavior, and jarvis-issues carries current limitation guidance.
    requirement: D-18
    verification:
      - kind: integration
        ref: node scripts/check-manifests.mjs && node scripts/check-plugin.mjs && claude plugin validate ./plugin --strict
        status: pass
    human_judgment: false
duration: 4m 24s
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 02: Plugin & Skills Enhancement Summary

**Three shipped jarvis skills now use valid Agent Skills frontmatter and teach 0.9.1 recovery, navigation, dependency, and known-limitation behavior.**

## Performance

- **Duration:** 4m 24s
- **Started:** 2026-09-12T03:38:08Z
- **Completed:** 2026-09-12T03:42:32Z
- **Tasks:** 3/3
- **Files modified:** 6
- **Actual diff:** 14,586 characters / 4 = 3,647 estimate-scale tokens.
- **Ledger commits:** 7 measured from `91aecd9819ee64e97c5fccbdf31028a88f3f3a1c..HEAD`; three are concurrent 06-04 commits on the shared milestone branch. The four plan-owned commits are listed below.

## Accomplishments

- Removed the unsupported `version` skill-frontmatter key from all three skills and aligned both convention documents with the Agent Skills allowed-key contract.
- Moved setup troubleshooting into an on-demand reference, preserving the existing advice while adding the `universal-ctags` `sym:` recovery and the `indexRepo` missing-index path.
- Updated jarvis-use for the precise `syntax:` and removed-option contracts, raised prose package floors to `>=0.9.1`, and revalidated every jarvis-issues limitation against current 0.9.1 sources.

## Task Commits

1. **Task 1: Strip the off-spec frontmatter key and align conventions** — `c2d0047` (docs)
2. **Task 2: Move setup troubleshooting and document recovery paths** — `0ec408f` (docs)
3. **Task 3: Update current behavior and re-verify issue limitations** — `3cb2bbc` (docs) and `cf1d25b` (fix)

## Files Created/Modified

- `plugin/skills/jarvis-setup/SKILL.md` — adds `indexRepo` recovery guidance and a one-line loaded-on-demand troubleshooting entry point.
- `plugin/skills/jarvis-setup/references/troubleshooting.md` — retains the eight prior symptom rows, updates the floor, and adds the ctags/index-time recovery row.
- `plugin/skills/jarvis-use/SKILL.md` — states the syntax-identifier acceptance boundary, exit-2 removed-option contract, and semantic `>=0.9.1` floors.
- `plugin/skills/jarvis-issues/SKILL.md` — removes unsupported frontmatter and corrects the hierarchy limitation to all missing-relationship-data causes.
- `.claude/CLAUDE.md` and `docs/code-standards.md` — define the shared Agent Skills frontmatter convention.

## Decisions Made

- Removed `version: "0.1.0"` rather than adding `metadata.version`: the key has no consumer, while claude.ai and the Skills API reject unexpected frontmatter keys.
- Kept the installer command on `main` by Phase 4 precedent; only reading links are tag-pinned.
- Treated the `typeHierarchy` issue-copy as stale because missing relationship data can result from more than an unpatched SCIP build.

## D-18 Limitation Verification

| Limitation | Verdict | Settling source |
| --- | --- | --- |
| `typeHierarchy` / unpatched SCIP recovery | Corrected: an unpatched build is one cause; all missing relationship data causes the capability error. Fresh patched-SCIP reindex remains the bug-filing threshold. | `../jarvis/src/jarvis/server.py:513-517` |
| Single-tenant `PROJECT` / `BRANCH` pins | Unchanged: both values remain fixed to `_`. | `../jarvis/src/jarvis/config.py:22-23` |
| One language per repo; no multi-language merge | Unchanged: detection selects the most common supported extension, with a deterministic tie-break. | `../jarvis/src/jarvis/index_cli.py:171-198` |
| `blastRadius` freshness is `unknown` | Unchanged: its graph has no per-node timestamp. | `../jarvis/src/jarvis/server.py:788-795` |
| Windows unsupported | Unchanged: the released distribution advertises only macOS and POSIX Linux. | `../jarvis/pyproject.toml:38-39` |

## Verification

| Command / assertion | Outcome |
| --- | --- |
| Task 1 frontmatter and convention greps | Passed: all three skills have four-line, two-key frontmatter; allowed keys are documented and stale three-key literals are absent. |
| `node scripts/check-plugin.mjs` | Passed: `ok: P1 (10 roster tools agree across shipped surfaces) green`. |
| `claude plugin validate ./plugin --strict` | Passed after Tasks 1 and 3. |
| Task 2 reference/table/floor/retrieval/URL/section checks | Passed: 11 table lines in the reference, zero in `SKILL.md`, one retrieval command, ctags and 0.9.1 floors present, installer URL and numbered H2 sequence preserved. |
| `git diff --stat -- setup.sh` | Passed with no output; the sync-owned installer is unchanged. |
| `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` | Passed: manifests agree, dual MCP configs remain byte-identical, and P1 is green. |
| Task 3 prose and limitation greps | Passed: both semantic floors are `>=0.9.1`, the upstream SCIP citation and roster retrieval command remain intact, and the five limitation bullets contain no TODO. |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected over-specific `typeHierarchy` limitation wording**
- **Found during:** Task 3 (jarvis-issues limitation re-verification)
- **Issue:** The documented copy attributed hierarchy errors only to indexes built with an unpatched SCIP binary, but the source returns an error whenever relationship data is absent.
- **Fix:** Kept the patched-SCIP reindex recovery and explicit bug-filing condition while describing the complete missing-data condition.
- **Files modified:** `plugin/skills/jarvis-issues/SKILL.md`
- **Verification:** Current server docstring at `../jarvis/src/jarvis/server.py:513-517`; final plugin guards and strict validation pass.
- **Committed in:** `cf1d25b`

---

**Total deviations:** 1 auto-fixed (Rule 1 bug).
**Impact on plan:** The correction prevents the issues skill from filing or dismissing reports based on an incomplete server contract; no scope expansion occurred.

## Issues Encountered

- The shared milestone branch received three concurrent 06-04 commits after this plan's ledger base was captured. The measured ledger count is therefore seven; source ownership and the four plan-owned task commits remain isolated.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 06-06 can guard the now-conformant skill frontmatter and the troubleshooting reference artifact.
- Plan 06-07 can enforce the newly consistent `>=0.9.1` prose floor alongside manifest and tag contracts.
- Deliberate `.claude/CLAUDE.md` exclusion: its stale nine-tool statement at `:204`, stale `>=0.6.0` floors at `:17`, `:132`, `:198`, and `:298`, and `:68`'s old plugin version remain untouched because no `checks.yml` guard reads them; this plan updated only the frontmatter conventions it owns.

---
*Phase: 06-plugin-skills-enhancement*
*Completed: 2026-09-12*

## Self-Check: PASSED

- Confirmed all six plan-owned source/reference files and this summary exist.
- Confirmed task commits `c2d0047`, `0ec408f`, `3cb2bbc`, and `cf1d25b` exist.
