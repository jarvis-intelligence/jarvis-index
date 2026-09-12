---
phase: 06-plugin-skills-enhancement
plan: 04
subsystem: plugin-distribution
tags: [claude-code, cursor, codex, plugin-commands, subagent, json-schema]
requires:
  - phase: 06-01
    provides: plugin manifest and surface guard baseline
provides:
  - deterministic index and status slash commands under the plugin root
  - a read-only multi-hop structural navigator agent
  - a live SchemaStore declaration for the Claude plugin manifest
affects: [06-05, 06-06, plugin-validation, marketplace-distribution]
actuals:
  tokens: 946
  tasks: 3
  commits: 3
plan_head_before: 91aecd9819ee64e97c5fccbdf31028a88f3f3a1c
tech-stack:
  added: []
  patterns:
    - plugin-root commands and agents rely on client default discovery instead of manifest component fields
    - read-only plugin agents deny write-capable tools without pinning namespaced MCP tool identifiers
key-files:
  created:
    - plugin/commands/index.md
    - plugin/commands/status.md
    - plugin/agents/jarvis-navigator.md
  modified:
    - plugin/.claude-plugin/plugin.json
key-decisions:
  - "Commands and the navigator remain manifest-free so default component discovery is not replaced."
  - "The navigator denies Write and Edit instead of allow-listing unstable namespaced MCP tool identifiers."
  - "Only the Claude manifest declares $schema: Codex carries unsupported skills/interface keys, Cursor publishes no schema URL, and the candidate Claude marketplace schema URL returned HTTP 404."
patterns-established:
  - "Command frontmatter uses exactly name, description, argument-hint, and disable-model-invocation."
  - "Plugin-root agent frontmatter uses only supported read-only controls."
requirements-completed: [D-06, D-08, D-09, SC-3]
coverage:
  - id: D1
    description: Deterministic plugin index and status slash commands
    requirement: D-06
    verification:
      - kind: other
        ref: "claude plugin validate ./plugin --strict; node scripts/check-manifests.mjs && node scripts/check-plugin.mjs"
        status: pass
    human_judgment: false
  - id: D2
    description: Read-only multi-hop navigator plugin agent
    requirement: D-08
    verification:
      - kind: other
        ref: "claude plugin validate ./plugin --strict; sidecar diff and manifest exclusion checks"
        status: pass
    human_judgment: false
  - id: D3
    description: Live Claude manifest schema declaration with deliberate exclusions
    requirement: D-09
    verification:
      - kind: other
        ref: "curl -o /dev/null -s -w '%{http_code}' -L https://json.schemastore.org/claude-code-plugin-manifest.json; claude plugin validate ./plugin --strict; claude plugin validate . --strict"
        status: pass
    human_judgment: false
duration: 4min
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 04: Plugin Commands, Navigator, and Schema Summary

**Two deterministic plugin slash commands, a read-only structural navigator, and a live Claude manifest schema declaration ship without replacing default component discovery.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-09-12T03:38:22Z
- **Completed:** 2026-09-12T03:42:13Z
- **Tasks:** 3/3
- **Files modified:** 4 source files

## Accomplishments

- Added `/jarvis:index` and `/jarvis:status` command definitions that use `indexRepo`/`getIndexStatus` correctly and offer the documented CLI fallbacks.
- Added the plugin-root `jarvis-navigator` agent, which checks index health before chaining `goToDefinition`, `callHierarchy`, and `blastRadius` while denying `Write` and `Edit`.
- Declared the live permissive Claude Code plugin-manifest schema as the first Claude manifest key; retained the intentional Codex and Cursor exclusions.

## Task Commits

Each task was committed atomically:

1. **Task 1: plugin commands** — `374bb99` (`feat`)
2. **Task 2: read-only navigator agent** — `67a52a0` (`feat`)
3. **Task 3: Claude manifest schema** — `13536f1` (`chore`)

## Files Created/Modified

- `plugin/commands/index.md` — user-invoked indexing entry point with detached-MCP polling and CLI fallback.
- `plugin/commands/status.md` — user-invoked status and capability-reporting entry point.
- `plugin/agents/jarvis-navigator.md` — read-only multi-hop navigator with explicit SCIP and freshness limits.
- `plugin/.claude-plugin/plugin.json` — first-key Claude Code manifest `$schema` declaration.

## Decisions Made

- Kept `commands` and `agents` out of all manifests and marketplace entries: component folders are default-discovered, while declarations can replace their scans or conflict with marketplace manifests.
- Used `disallowedTools: Write, Edit` for the navigator rather than a `tools` allow-list, preserving the read-only invariant without coupling to namespaced MCP identifiers.
- Added only `https://json.schemastore.org/claude-code-plugin-manifest.json`, which returned HTTP 200. The Codex overlay remains schema-free because its `skills` and `interface` keys violate the Agent Plugins schema; Cursor remains schema-free because it documents no schema URL. The candidate Claude marketplace schema URL `https://json.schemastore.org/claude-code-plugin-marketplace.json` returned HTTP 404, so no dead marketplace declaration was written.

## Deviations from Plan

None - plan executed exactly as written. The marketplace declaration was conditionally skipped after its required URL probe returned HTTP 404.

## Issues Encountered

None. A shared-branch execution ledger included concurrent sibling commits, so this summary lists only the three explicit 06-04 task commits.

## Verification

- `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` passed.
- `claude plugin validate ./plugin --strict` passed.
- `claude plugin validate . --strict` passed.
- The Claude manifest schema URL returned HTTP 200; the marketplace candidate URL returned HTTP 404 and was not declared.
- Manifest component-exclusion checks passed; the three Codex skill sidecars and `.github/workflows/checks.yml` had no diff from the Wave 1 base.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plugin-root commands, agent, and Claude manifest schema are ready for Phase 06 validation and release work.
- 06-05 can add CI validation without modifying these component declarations.

---

*Phase: 06-plugin-skills-enhancement*
*Completed: 2026-09-12*

## Self-Check: PASSED

- Summary file exists.
- Task commits `374bb99`, `67a52a0`, and `13536f1` exist in Git history.
