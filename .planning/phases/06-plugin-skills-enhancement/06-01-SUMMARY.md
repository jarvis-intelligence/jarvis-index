---
phase: 06-plugin-skills-enhancement
plan: "01"
subsystem: plugin-ci
tags: [node, mcp, plugin, ci, github-actions]
requires:
  - phase: 05-launch-verification-community
    provides: shipped plugin surface and manifest-validation guard
provides:
  - P1 roster-derived plugin surface guard with explicit server-diff limitation
  - ten-tool copy corrections across the root README, Codex manifest, and jarvis-use examples
  - npm alias and CI trigger coverage for the plugin guard
affects: [06-02, 06-03, 06-04, 06-05, 06-06, 06-07]
actuals:
  tokens: 1417
  tasks: 3
  commits: 3
plan_head_before: 4d93b218a42a62580588a14ac57c10c978356696
tech-stack:
  added: []
  patterns:
    - zero-dependency Node guard resolving repository subjects through process.cwd()
    - roster-derived snake_case detection rather than a duplicated forbidden-token list
key-files:
  created:
    - scripts/check-plugin.mjs
  modified:
    - README.md
    - .codex-plugin/plugin.json
    - plugin/skills/jarvis-use/SKILL.md
    - package.json
    - .github/workflows/checks.yml
key-decisions:
  - "P1 derives its ten-name roster from plugin/skills/jarvis-use/references/tool-roster.md and explicitly does not claim to validate the private server repository."
  - "The plugin guard is a sibling of check-manifests.mjs, preserving the existing manifest guard's stable three-invariant contract."
patterns-established:
  - "New plugin guard dimensions use P-prefixed, dimension-tagged stderr diagnostics and a single terminal exit."
requirements-completed: [D-01, D-12, D-13, D-14, SC-1, SC-4]
coverage:
  - id: D1
    description: P1 verifies the shipped ten-tool roster, count wording, and camelCase MCP tool names.
    verification:
      - kind: integration
        ref: node scripts/check-plugin.mjs
        status: pass
    human_judgment: false
  - id: D2
    description: README, Codex manifest, and jarvis-use trigger examples agree on the ten-tool surface.
    verification:
      - kind: integration
        ref: node scripts/check-plugin.mjs
        status: pass
    human_judgment: false
  - id: D3
    description: npm and CI execute P1 when its guarded surface changes.
    verification:
      - kind: integration
        ref: npm run check:plugin
        status: pass
      - kind: other
        ref: checks.yml path-filter count and equality check
        status: pass
    human_judgment: false
duration: 8m
completed: 2026-09-12
status: complete
---

# Phase 06 Plan 01: Plugin & Skills Enhancement Summary

**P1 roster guard proves ten MCP tools across shipped plugin surfaces, with npm and CI wiring that prevent tool-count and snake_case drift.**

## Performance

- **Duration:** 8m (historical source execution plus safe-resume closeout)
- **Started:** 2026-09-12T03:25:46Z
- **Completed:** 2026-09-12T03:34:01Z
- **Tasks:** 3/3
- **Files modified:** 6

## Accomplishments

- Created `scripts/check-plugin.mjs`, a zero-dependency P1 guard that parses the ten headings in the shipped tool roster, checks public surfaces, and mechanically derives forbidden snake_case tool forms.
- Corrected the root README's ten-tool statement and added `indexRepo`; corrected the Codex long description and jarvis-use trigger examples.
- Added `npm run check:plugin` and wired `Check plugin surface` into both CI trigger filters, including the sync-owned `setup.sh` rationale.

## Task Commits

1. **Task 1: scripts/check-plugin.mjs with dimension P1, demonstrated RED on today's tree** — `c264a16` (feat)
2. **Task 2: Fix the three tool-count drift sites — P1 goes green** — `ea2815a` (Codex manifest and trigger examples, feat) and `b456bbb` (root README roster correction, fix)
3. **Task 3: Wire the guard into npm and CI, with the D-14 path-filter additions in both blocks** — `ea2815a` (feat)

`b456bbb` is the safe-resume README closeout commit. The final GSD metadata commit records this summary and the scoped planning-state updates without rewriting the three source commits.

## Files Created/Modified

- `scripts/check-plugin.mjs` — P1 roster/count/snake_case assertion script and reserved P2a–P5 dimension contracts.
- `README.md` — states ten MCP tools and lists `indexRepo` in the Scope group.
- `.codex-plugin/plugin.json` — changes only the long-description tool count to ten.
- `plugin/skills/jarvis-use/SKILL.md` — uses `indexRepo` and `blastRadius` in trigger examples.
- `package.json` — exposes `check:plugin` beside `check:manifests`.
- `.github/workflows/checks.yml` — runs P1 and filters both `push` and `pull_request` for the guard, README, and sync-owned installer.

## Decisions Made

- P1 reports all violations through `fail('P1', ...)`, so one invocation exposes every stale surface instead of masking later findings.
- P1's header records that it cannot inspect `../jarvis` in CI or detect an eleventh server-side tool; maintainers must still compare server registrations when that repository changes.
- `setup.sh` remains untouched; it is a path-filter subject only because upstream sync changes can invalidate installer-related plugin claims.

## Verification

### RED evidence — Task 1 before content corrections

```text
$ node scripts/check-plugin.mjs; test $? -eq 1
P1: README.md: tool count must say ten and must not say nine
P1: README.md: missing roster tool indexRepo
P1: .codex-plugin/plugin.json: interface.longDescription contains stale count word nine
P1: plugin/skills/jarvis-use/SKILL.md: contains snake_case tool name index_repo
P1: plugin/skills/jarvis-use/SKILL.md: contains snake_case tool name blast_radius
```

The retained `c264a16` guard was run against its pre-fix tree during safe-resume closeout and exited 1 with these five `P1:` diagnostics. The already-correct `plugin/README.md` was not named.

### GREEN evidence — final tree

| Command | Outcome |
| --- | --- |
| `node scripts/check-plugin.mjs` | Exited 0: `ok: P1 (10 roster tools agree across shipped surfaces) green` |
| `node scripts/check-manifests.mjs` | Exited 0: `ok: 3 manifests agree on version, MCP config pair byte-identical` |
| `npm run check:plugin` | Exited 0: P1 green |
| `npm run check:manifests` | Exited 0: manifest guard green |
| `claude plugin validate ./plugin --strict` | Exited 0: validation passed |
| `claude plugin validate . --strict` | Exited 0: marketplace validation passed |
| Workflow count/equality check | Passed: `scripts/check-plugin.mjs` appears 3 times, `README.md` and `setup.sh` twice each, and both `paths` lists are identical |
| `git diff --stat -- setup.sh` | No output; installer unchanged |

## Deviations from Plan

None - plan source and verification scope were preserved exactly. Safe-resume documentation recorded the existing three source commits rather than rewriting their atomic history.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `scripts/check-plugin.mjs` is the established home for Phase 6 P2a, P2b, P3, P4, and P5 dimensions.
- Wave 2 can extend the guard and plugin surface while preserving P1's roster-derived P-prefix convention and explicit server-diff limitation.

## Self-Check: PASSED
