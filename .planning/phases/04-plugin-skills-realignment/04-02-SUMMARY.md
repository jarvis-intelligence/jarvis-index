---
phase: 04-plugin-skills-realignment
plan: 02
subsystem: release-protocol

# Dependency graph
requires: [04-01]
provides:
  - plugin/.claude-plugin/plugin.json at version 0.7.3
  - plugin/.cursor-plugin/plugin.json at version 0.7.3
  - .codex-plugin/plugin.json at version 0.7.3
  - git tag v0.7.3 pushed to origin
daffects: []

actuals:
  tokens: 8000
  tasks: 1
  commits: 1

tech-stack:
  added:
  patterns:

key-files:
  created: []
  modified:
    - plugin/.claude-plugin/plugin.json
    - plugin/.cursor-plugin/plugin.json
    - .codex-plugin/plugin.json

key-decisions:
  - "All three manifest descriptions now use 'Local-first structural code intelligence over your own indexed repositories, with skills that teach the agent to prefer structural queries over grep.' — Claude variant says 'Claude', Cursor/Codex say 'the agent'"
  - "Used annotated tag (-a) because project requires tag messages"

requirements-completed: [SKIL-02, SKIL-04]

coverage:
  - id: R1
    description: "All three manifests at version 0.7.3"
    requirement: SKIL-04
    verification:
      - kind: automated
        ref: "jq -r '.version' on all three manifests prints 0.7.3 three times"
        status: pass
    human_judgment: false
  - id: R2
    description: "All three manifest descriptions contain 'structural code intelligence'"
    requirement: SKIL-02
    verification:
      - kind: automated
        ref: "jq -r '.description' on all three manifests shows the phrase"
        status: pass
    human_judgment: false
  - id: R3
    description: "check-manifests.mjs exits 0"
    requirement: SKIL-04
    verification:
      - kind: automated
        ref: "node scripts/check-manifests.mjs -> 'ok: 3 manifests agree on version, MCP config pair byte-identical'"
        status: pass
    human_judgment: false
  - id: R4
    description: "Cursor marketplace validator exits 0"
    requirement: SKIL-04
    verification:
      - kind: automated
        ref: "node /tmp/validate-template.mjs -> 'Validation passed.'"
        status: pass
    human_judgment: false
  - id: R5
    description: "MCP config byte-identical and floor preserved"
    requirement: SKIL-04
    verification:
      - kind: automated
        ref: "diff plugin/.mcp.json plugin/mcp.json empty; grep jarvis-mcp>=0.6.0 in both files"
        status: pass
    human_judgment: false
  - id: R6
    description: "Git tag v0.7.3 pushed to origin"
    requirement: SKIL-04
    verification:
      - kind: automated
        ref: "gh api repos/jarvis-intelligence/jarvis-index/git/refs/tags/v0.7.3 returns refs/tags/v0.7.3"
        status: pass
    human_judgment: false
  - id: R7
    description: "setup.sh never edited"
    verification:
      - kind: automated
        ref: "git diff setup.sh empty"
        status: pass
    human_judgment: false
  - id: R8
    description: "MCP configs byte-unchanged from pre-plan"
    verification:
      - kind: automated
        ref: "sha256sum pre-edit vs post-edit identical (46f70ce...)"
        status: pass
    human_judgment: false

# Phase 04 Plan 02: Release Protocol Summary

**Bumped all three plugin manifests from 0.7.2 to 0.7.3 with settled-voice descriptions, passed check-manifests and Cursor marketplace validator, created and pushed annotated git tag v0.7.3.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-23T19:05:00Z
- **Completed:** 2026-08-23T19:08:00Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Bumped `version` field from `"0.7.2"` to `"0.7.3"` in all three manifests
- Updated `description` in all three manifests: replaced "SCIP code navigation and Zoekt search" with "structural code intelligence" (settled voice per CONTEXT.md)
- Passed `node scripts/check-manifests.mjs` — 3 manifests agree, MCP config byte-identical
- Passed Cursor marketplace validator (`validate-template.mjs`) — only informational hook warning
- Verified MCP config floor `--from jarvis-mcp>=0.6.0` present and unchanged in both files
- Verified `diff plugin/.mcp.json plugin/mcp.json` empty
- Created annotated tag `v0.7.3` pointing at commit `651d66a` (manifest bump)
- Pushed tag to origin successfully
- Verified tag on remote via `gh api` — HTTP 200, returns `refs/tags/v0.7.3`

## Task Commits

1. **Bump plugin manifests 0.7.2 to 0.7.3, update descriptions to settled voice** - `651d66a` (chore)

## Files Created/Modified
- `plugin/.claude-plugin/plugin.json` — version `0.7.3`, description with "structural code intelligence"
- `plugin/.cursor-plugin/plugin.json` — version `0.7.3`, description with "structural code intelligence"
- `.codex-plugin/plugin.json` — version `0.7.3`, description with "structural code intelligence"

## Decisions Made
- All three descriptions unified to: "Local-first structural code intelligence over your own indexed repositories, with skills that teach [Claude/the agent] to prefer structural queries over grep."
- Used annotated tag (`git tag -a`) because bare `git tag` failed with "no tag message?" (project hook or config requires it)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Stray PUT directive line injected by edit tool**
- **Found during:** Action 1 (bumping Claude plugin manifest)
- **Issue:** The edit tool injected a literal `PUT <5: PUT` line into the JSON file, producing invalid JSON
- **Fix:** CUT the stray line 5 in a follow-up edit
- **Files modified:** plugin/.claude-plugin/plugin.json
- **Verification:** File parses as valid JSON after fix
- **Committed in:** 651d66a

**2. [Rule 1 - Bug] Bare git tag rejected**
- **Found during:** Action 4 (create git tag)
- **Issue:** `git tag v0.7.3` failed with `fatal: no tag message?` — project config or hook requires annotated tags
- **Fix:** Used `git tag -a v0.7.3 -m 'v0.7.3: plugin skills realignment + settled voice'`
- **Verification:** Tag created and pushed successfully

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** None — both were mechanical tool/config issues, not scope changes.

## Verification Evidence

```
$ node scripts/check-manifests.mjs
ok: 3 manifests agree on version, MCP config pair byte-identical

$ node /tmp/validate-template.mjs
Warnings:
- jarvis: no hooks/hooks.json file found (only needed when using hooks).

Validation passed.

$ jq -r '.version' plugin/.claude-plugin/plugin.json plugin/.cursor-plugin/plugin.json .codex-plugin/plugin.json
0.7.3
0.7.3
0.7.3

$ diff plugin/.mcp.json plugin/mcp.json
(empty)

$ git tag -l 'v0.7.3'
v0.7.3

$ gh api repos/jarvis-intelligence/jarvis-index/git/refs/tags/v0.7.3 --jq '.ref'
refs/tags/v0.7.3

$ git diff setup.sh
(empty)

$ grep 'jarvis-mcp>=0.6.0' plugin/.mcp.json plugin/mcp.json
plugin/.mcp.json:      "args": ["--from", "jarvis-mcp>=0.6.0", "jarvis-server"]
plugin/mcp.json:      "args": ["--from", "jarvis-mcp>=0.6.0", "jarvis-server"]
```

## Issues Encountered
- Bare `git tag` rejected (no tag message) — used `-a` flag.

## Next Phase Readiness
- Release is shippable: all three manifests at 0.7.3, tag v0.7.3 pushed, validators green.
- Plugin skills (04-01 content) + manifest bump (04-02) both committed; tag points at the commit containing both plans' changes.

---
*Phase: 04-plugin-skills-realignment*
*Completed: 2026-08-23*
