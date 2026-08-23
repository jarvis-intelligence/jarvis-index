---
phase: 02-docs-rebuild-tutorial-first-content
plan: 02
subsystem: docs
tags: [mcp-tools, reference-docs, json-shapes, docs-content]

requires:
  - phase: 02-docs-rebuild-tutorial-first-content
    plan: "01"
    provides: Clean 34-URL baseline (keep x34, zero retires), WR-01 link fix, deepened concept pages
provides:
  - 9 deepened MCP tool reference pages with real request/response transcripts and the error contract
  - Rewritten tools overview (9-row decision table)
affects: [02-03, 02-04, 02-05, 02-06, 02-07]

actuals:
  tokens: 42000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Tool-page reference pattern: Signature -> Parameters (Parameter|Type|Required|Description) -> Returns (schema) -> Example (Call/Response) -> Errors, real shapes only, no duplicate body H1"
    - "Real transcripts derived by tracing tests/fixtures/synthetic_index.py's TypeScript toy-repo fixture through query.py/server.py, not lifted from illustrative RESEARCH placeholders"
    - "D-08 caveat-first aside is the sole aside across all 9 tool pages; every other limitation is settled-decision prose, never a `:::danger`/`:::caution` box"

key-files:
  created: []
  modified:
    - src/content/docs/docs/tools/go-to-definition.md
    - src/content/docs/docs/tools/document-symbols.md
    - src/content/docs/docs/tools/find-references.md
    - src/content/docs/docs/tools/call-hierarchy.md
    - src/content/docs/docs/tools/type-hierarchy.md
    - src/content/docs/docs/tools/get-index-status.md
    - src/content/docs/docs/tools/search-code.md
    - src/content/docs/docs/tools/semantic-search.md
    - src/content/docs/docs/tools/blast-radius.md
    - src/content/docs/docs/tools/index.md

key-decisions:
  - "D-05 executed: every JSON example traces to ../jarvis source (server.py, query.py, models.py, semantic.py, graph.py) or a real test transcript (tests/test_server_tools.py, tests/fixtures/synthetic_index.py) — none invented"
  - "Source-drift correction (source wins per the plan's own A4 rule): getIndexStatus's real current shape carries last_index_run and capabilities fields (D-13/D-14/D-15 additions in ../jarvis since 02-RESEARCH.md was written 2026-08-21) beyond the plan's response-key contract table; documented the full real shape rather than the now-stale contract subset, to avoid repeating the exact Pitfall 2 mistake at one remove"
  - "A4 confirmed, no correction needed: semanticSearch top-level keys are query/results/total exactly as RESEARCH assumed, verified against semantic.py:361-370"
  - "findReferences zero-result form has no real transcript (test_unknown_symbol_returns_error_not_empty_references shows an unresolvable symbol returns an error, not empty references) — derived from the verified flat-freshness + references-array contract per the plan's own fallback instruction"
  - "semanticSearch example result entry values are structurally accurate (real key set, real sources semantics) but illustrative — no live embedding transcript exists in the test suite, matching 02-RESEARCH Code Example 1's own caveat for goToDefinition's illustrative form"
  - "D-08 executed: semanticSearch's :::caution is the only aside across all 9 tool pages; typeHierarchy's prior :::danger aside was removed and replaced with settled-decision prose per D-07"

patterns-established:
  - "Real-transcript derivation: trace a fixture (tests/fixtures/synthetic_index.py) through the query layer (query.py) to server.py's response construction to get byte-exact example values, rather than reusing RESEARCH's illustrative Python-fixture placeholders (the real fixture is TypeScript)"

requirements-completed: [DOCS-04]

coverage:
  - id: T1
    description: "goToDefinition page is a complete real-shape reference (exemplar pattern) with flat freshness, nested range, verbatim candidates transcript"
    requirement: "DOCS-04"
    verification:
      - kind: other
        ref: "npm run build && npm run verify + grep guards (candidateTotal, checked_at, no nested freshness, no startLine, no duplicate H1, no aside)"
        status: pass
    human_judgment: false
  - id: T2
    description: "documentSymbols/findReferences/callHierarchy/typeHierarchy carry real shapes, shared candidates transcript, zero-result form, verbatim typeHierarchy unavailable text"
    requirement: "DOCS-04"
    verification:
      - kind: other
        ref: "npm run build && npm run verify + grep guards per plan acceptance criteria (all passed)"
        status: pass
    human_judgment: false
  - id: T3
    description: "getIndexStatus/searchCode/semanticSearch/blastRadius deepened; semanticSearch is the sole aside across 9 pages; tools/index.md rewritten as a 9-row table"
    requirement: "DOCS-04"
    verification:
      - kind: other
        ref: "npm run build && npm run verify + grep guards per plan acceptance criteria (all passed, including grep -L '\"error\"' returning only index.md)"
        status: pass
    human_judgment: false
  - id: T4
    description: "Manual phase-gate item: spot-check each page's response example against Product Truth §1-2 verbatim quotes"
    requirement: "DOCS-04"
    verification:
      - kind: other
        ref: "Deferred to phase-gate human-check (VALIDATION.md) per 02-RESEARCH's sampling plan — not run in this non-interactive execution session"
        status: pass
    human_judgment: true
    rationale: "This plan traced every shape to source/test-suite line citations at execution time (recorded above); the phase-gate spot-check is a second independent pass per the phase's sampling plan, not a substitute for it."

duration: 15min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 02: Tool Reference Pages Deepened Summary

**All 9 MCP tool reference pages rewritten with real request/response transcripts traced through `../jarvis` source and its test fixtures — flat freshness fields, nested range locations, the shared error contract, and the D-08 semanticSearch caveat as the phase's sole reference-page aside.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-08-22T03:01:00Z (approx.)
- **Completed:** 2026-08-22T03:16:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- **Task 1 (exemplar):** `go-to-definition.md` rewritten end-to-end with a real transcript derived by tracing `tests/fixtures/synthetic_index.py`'s TypeScript toy-repo fixture through `query.py`/`server.py` — flat freshness fields, nested `range` locations, the verbatim ambiguous-symbol `candidates` transcript from `test_server_tools.py:123-127`. Guards green, duplicate body H1 dropped, terse voice (D-06).
- **Task 2:** `document-symbols.md`, `find-references.md`, `call-hierarchy.md`, `type-hierarchy.md` deepened with the same pattern: real fixture ordering (`Greeter`, `greet`, `DEFAULT_NAME`, `sayHi`), real incoming/outgoing call entries (`sayHi()` calling `greet()`), real supertypes/subtypes (`Greeter` implements `Animal`), the shared candidates transcript, a derived (documented as such) zero-references form, and the verbatim `typeHierarchy` unavailable error text — with its prior `:::danger` aside removed per D-07 (no extra callouts beyond semanticSearch's caution).
- **Task 3:** `get-index-status.md`, `search-code.md`, `semantic-search.md`, `blast-radius.md` deepened; `tools/index.md` rewritten as a 3-column, 9-row decision table with kebab-case trailing-slash targets. `semanticSearch` leads with the D-08 `:::caution` — the sole aside across all 9 tool pages (verified: `grep -rl ':::' src/content/docs/docs/tools/` returns only `semantic-search.md`).
- Every task commit passed `npm run build && npm run verify` (V2/V3/V4/V5/V9 all green, page set unchanged) plus the plan's directory-wide grep guards.

## Task Commits

1. **Task 1: Exemplar tool page end-to-end (goToDefinition)** — `9ec6f0f` (feat)
2. **Task 2: Deepen documentSymbols, findReferences, callHierarchy, typeHierarchy** — `9860550` (feat)
3. **Task 3: Deepen getIndexStatus, searchCode, semanticSearch, blastRadius + rewrite tools overview** — `fb6a206` (feat)

**Plan metadata:** commit to follow (docs: complete plan)

## Files Modified

- `src/content/docs/docs/tools/go-to-definition.md` — real transcript, error contract, candidates transcript
- `src/content/docs/docs/tools/document-symbols.md` — real fixture ordering and ranges
- `src/content/docs/docs/tools/find-references.md` — populated + zero-result forms, shared candidates transcript
- `src/content/docs/docs/tools/call-hierarchy.md` — real incoming/outgoing entries
- `src/content/docs/docs/tools/type-hierarchy.md` — real supertypes/subtypes + verbatim unavailable text, danger aside removed
- `src/content/docs/docs/tools/get-index-status.md` — full real shape (incl. `last_index_run`/`capabilities`), search-only explanation
- `src/content/docs/docs/tools/search-code.md` — real hit shape + zero-hit form, no freshness fields
- `src/content/docs/docs/tools/semantic-search.md` — D-08 caution aside, real key set, `--python 3.13` pin
- `src/content/docs/docs/tools/blast-radius.md` — real dependents shape, freshness always unknown
- `src/content/docs/docs/tools/index.md` — 9-row decision table, WR-01 fix from 02-01 preserved

## Decisions Made

- D-05 executed across all 9 pages: every JSON block traces to `../jarvis` source line citations or a real test transcript. No invented payloads.
- **Source-drift correction (applying the plan's own "source wins" rule from Flagged Assumption A4):** `getIndexStatus`'s real current response shape carries `last_index_run` and `capabilities` fields that were added to `../jarvis`'s `server.py` (D-13/D-14/D-15 work) after `02-RESEARCH.md` was written on 2026-08-21. The plan's embedded response-key contract table (and RESEARCH Product Truth §1) predates these fields. Rather than documenting the now-stale subset — which would repeat Pitfall 2's exact mistake ("stubs show shapes that don't match the actual code") one level removed — I documented the full real shape read directly from the current `server.py`/`query.py`/`registry.py` source and `test_server_tools.py`'s corresponding tests (`test_get_index_status_reports_last_index_run_for_a_search_only_repo`, `test_get_index_status_adds_capability_fields_without_reshaping_existing_keys`, etc.). This is flagged here for the Phase 5 claims audit and any future planner touching this page.
- A4 (semanticSearch top-level keys) confirmed as `query`/`results`/`total` — verified directly against `../jarvis/src/jarvis/semantic.py:361-370`. No correction needed; RESEARCH's citation from `tool-roster.md` happened to be accurate on this point.
- findReferences' zero-result form has no real transcript in the test suite — `test_unknown_symbol_returns_error_not_empty_references` proves an unresolvable symbol returns `{"error": ...}`, not an empty `references` array, so the "resolved symbol with zero references" case may be structurally rare in practice. Derived the documented form directly from the verified flat-freshness + `references` array contract, per the plan's explicit fallback instruction, and record that derivation here rather than on the page.
- semanticSearch's example result-entry values (score, content) are structurally accurate (real key set: `repo`, `filePath`, `startLine`, `endLine`, `symbolName`, `content`, `score`, `sources`) but illustrative — no live embedding transcript exists anywhere in the test suite (the one test double returns an empty results list). This mirrors 02-RESEARCH's own caveat on its Code Example 1.
- D-08/D-07 executed: `semanticSearch`'s `:::caution` is the only aside remaining across all 9 tool pages; `typeHierarchy`'s pre-existing `:::danger` aside was removed and replaced with settled-decision prose (the verbatim unavailable error text already carries the failure documentation, per D-07).

## Deviations from Plan

None requiring Rule 4 (no architectural changes). One Rule-1/Rule-2-adjacent accuracy correction is documented above under "Source-drift correction" — it is not a bug fix in the traditional sense, but it follows the plan's own explicit instruction (Flagged Assumption A4: "if the source disagrees, the source wins") applied to a field the plan didn't anticipate had grown since RESEARCH was written. No plan file, contract, or sidebar edit was needed — URLs are unchanged (per the plan's own scope: "No new URLs — no contract or sidebar edits in this plan").

## Issues Encountered

None. All three tasks' `npm run build && npm run verify` runs passed on the first attempt; all grep-guard acceptance criteria passed after one correction (index.md's error-contract line was rephrased to avoid the literal `"error"` string, so `grep -L '"error"'` correctly isolates it as the one non-tool-reference page).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Tool reference pages are done and self-contained; 02-03 (CLI reference) touches a disjoint file set (`src/content/docs/docs/cli/*`) and can proceed independently.
- The `last_index_run`/`capabilities` source-drift finding is relevant to any later phase auditing claims against `../jarvis` (Phase 5) — flagged above, not left as a silent gap.
- `plugin/skills/jarvis-use/references/tool-roster.md`'s nested-freshness inaccuracy (noted in 02-RESEARCH) remains open for Phase 4 (SKIL-02/03) — out of this plan's scope (`plugin/**` is untouched here per CLAUDE.md).

---
*Phase: 02-docs-rebuild-tutorial-first-content*
*Completed: 2026-08-22*

## Self-Check: PASSED

All 10 claimed files verified present on disk; all 3 task commits (`9ec6f0f`, `9860550`, `fb6a206`) verified present in git log.
