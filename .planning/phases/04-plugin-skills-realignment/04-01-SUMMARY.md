---
phase: 04-plugin-skills-realignment
plan: 01
subsystem: plugin-skills

# Dependency graph
requires: []
provides:
  - plugin/skills/jarvis-setup/SKILL.md with CLAUDE.md ref replaced, settled voice description
  - plugin/skills/jarvis-use/SKILL.md with settled voice description
  - plugin/skills/jarvis-use/references/tool-roster.md with getIndexStatus shape, typeHierarchy caveat, flat freshness
daffects: 04-02 (version bump, tag, validation)

actuals:
  tokens: 4500
  tasks: 1
  commits: 1

tech-stack:
  added:
  patterns:

key-files:
  created: []
  modified:
    - plugin/skills/jarvis-setup/SKILL.md
    - plugin/skills/jarvis-use/SKILL.md
    - plugin/skills/jarvis-use/references/tool-roster.md
    - .codex-plugin/plugin.json

key-decisions:
  - "jarvis-use description: prepended 'jarvis structural code intelligence' to preserve trigger surface (tool names, query types) while adding settled voice"
  - "getIndexStatus return shape expanded with flat freshness fields inline (stale, freshness, commit, generated_at, checked_at) rather than keeping stale nested {freshness: {...}} — consistent with Freshness section rewrite"
  - "tool-roster nav tool return shapes kept {freshness: {...}} placeholders — compact reference convention accepted per RESEARCH §5"

requirements-completed: [SKIL-01, SKIL-02, SKIL-03]

coverage:
  - id: D1
    description: "CLAUDE.md reference replaced with docs-site /guide/requirements/ deep link"
    requirement: SKIL-01
    verification:
      - kind: automated
        ref: "grep -rn 'CLAUDE.md' plugin/skills/ returns zero output"
        status: pass
    human_judgment: false
  - id: D2
    description: "jarvis-setup description uses 'structural code intelligence'"
    requirement: SKIL-02
    verification:
      - kind: automated
        ref: "grep -c 'structural code intelligence' plugin/skills/jarvis-setup/SKILL.md returns 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "jarvis-use description includes 'structural code intelligence'"
    requirement: SKIL-02
    verification:
      - kind: automated
        ref: "grep -c 'structural code intelligence' plugin/skills/jarvis-use/SKILL.md returns 1"
        status: pass
    human_judgment: false
  - id: D4
    description: "All reading-links retargeted from blob/main to blob/v0.7.3"
    requirement: SKIL-02
    verification:
      - kind: automated
        ref: "grep -rn 'blob/main/' plugin/skills/ .codex-plugin/plugin.json returns zero output"
        status: pass
    human_judgment: false
  - id: D5
    description: "Functional install command stays at main (exactly 1 match)"
    requirement: SKIL-02
    verification:
      - kind: automated
        ref: "grep -rc 'jarvis-index/main/setup.sh' plugin/skills/ | awk -F: '{s+=$2} END {print s}' returns 1"
        status: pass
    human_judgment: false
  - id: D6
    description: "getIndexStatus return shape includes last_index_run and capabilities"
    requirement: SKIL-03
    verification:
      - kind: automated
        ref: "grep -c 'last_index_run' tool-roster.md returns >=1; grep -c 'capabilities' tool-roster.md returns >=1"
        status: pass
    human_judgment: false
  - id: D7
    description: "typeHierarchy caveat reflects fork-fixed scip, not 'always errors'"
    requirement: SKIL-03
    verification:
      - kind: automated
        ref: "grep -c 'typeHierarchy.*error' tool-roster.md returns 0"
        status: pass
    human_judgment: false
  - id: D8
    description: "Freshness section describes flat fields, not nested object"
    requirement: SKIL-03
    verification:
      - kind: automated
        ref: "grep 'freshness object' tool-roster.md returns zero; section lists stale, freshness, commit, generated_at, checked_at"
        status: pass
    human_judgment: false
  - id: D9
    description: "setup.sh, MCP configs, and manifest versions unchanged"
    verification:
      - kind: automated
        ref: "git diff setup.sh empty; git diff plugin/.mcp.json plugin/mcp.json empty; all three manifests show 0.7.2"
        status: pass
    human_judgment: false

# Phase 04 Plan 01: Skill Content Realignment Summary

**Fixed CLAUDE.md reference, adopted settled positioning vocabulary, retargeted reading-links to v0.7.3, and corrected three tool-roster drift items (getIndexStatus shape, typeHierarchy caveat, Freshness section).**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-23T19:00:00Z
- **Completed:** 2026-08-23T19:03:00Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- Replaced broken `See CLAUDE.md for the detail.` in jarvis-setup:31 with docs-site deep link to `/guide/requirements/`
- Updated jarvis-setup frontmatter description: "local-first structural code intelligence" (was "local-first code-intelligence MCP server")
- Updated jarvis-use frontmatter description: prepended "jarvis structural code intelligence" to existing trigger surface
- Retargeted two `blob/main` reading-links in `.codex-plugin/plugin.json` to `blob/v0.7.3` (privacy policy, terms of service)
- Added `last_index_run` and `capabilities` fields to getIndexStatus return shape in tool-roster
- Rewrote typeHierarchy caveat: now explains fork-fixed scip makes it work, not "always errors"
- Rewrote Freshness section: describes flat top-level fields (stale, freshness, commit, generated_at, checked_at) instead of nested object
- Expanded getIndexStatus return shape to include flat freshness fields inline (consistent with new Freshness section)

## Task Commits

1. **Tracer: Fix CLAUDE.md reference, align vocabulary/links, fix tool-roster drift** - `f9cf4aa` (docs)

## Files Created/Modified
- `plugin/skills/jarvis-setup/SKILL.md` — Description uses "structural code intelligence"; CLAUDE.md ref replaced with docs-site link
- `plugin/skills/jarvis-use/SKILL.md` — Description prepended with "jarvis structural code intelligence"
- `plugin/skills/jarvis-use/references/tool-roster.md` — getIndexStatus shape updated, typeHierarchy caveat corrected, Freshness section rewritten to flat fields
- `.codex-plugin/plugin.json` — Two blob/main reading-links retargeted to blob/v0.7.3

## Decisions Made
- jarvis-use description: prepended "jarvis structural code intelligence" to preserve trigger surface (tool names, query types) while adding settled voice
- getIndexStatus return shape expanded with flat freshness fields inline (stale, freshness, commit, generated_at, checked_at) rather than keeping stale nested {freshness: {...}} — consistent with Freshness section rewrite
- tool-roster nav tool return shapes kept {freshness: {...}} placeholders — compact reference convention accepted per RESEARCH §5


## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] getIndexStatus return shape still showed nested "freshness": {...}**
- **Found during:** Action 5 (getIndexStatus return shape update)
- **Issue:** Plan said to add `last_index_run` and `capabilities` to the existing return shape, but the existing shape also had `"freshness": {...}` which is incorrect — getIndexStatus uses flat fields. The Freshness section rewrite (action 7) would have contradicted the return shape.
- **Fix:** Expanded getIndexStatus return shape to show flat freshness fields (stale, freshness, commit, generated_at, checked_at) inline alongside the new last_index_run and capabilities fields.
- **Files modified:** plugin/skills/jarvis-use/references/tool-roster.md
- **Verification:** Freshness section and getIndexStatus return shape now consistent — both describe flat fields.
- **Committed in:** f9cf4aa

**2. [Rule 1 - Bug] Freshness section edit left orphan old text**
- **Found during:** Action 7 (Freshness section rewrite)
- **Issue:** PUT range replaced lines 42-44 but the old text on the original line 44 survived below the new content (the range didn't fully cover the old prose).
- **Fix:** CUT the orphan line 45.
- **Files modified:** plugin/skills/jarvis-use/references/tool-roster.md
- **Verification:** File ends cleanly after Freshness section.
- **Committed in:** f9cf4aa

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both were prose-correctness fixes within the planned scope. No scope creep.

## Issues Encountered
- `grep -c` on a directory fails (not recursive); used `grep -rc ... | awk` for the setup.sh install command count.

## Next Phase Readiness
- All 04-01 content changes committed; 04-02 picks up version bump (0.7.2→0.7.3), manifest description updates, Cursor validator, tag v0.7.3.
- setup.sh, MCP configs, marketplace files untouched — ready for 04-02 release mechanics.
- jarvis-issues SKILL.md not touched (minimal-touch per CONTEXT — zero URLs and no positioning language needed).

---
*Phase: 04-plugin-skills-realignment*
*Completed: 2026-08-23*
