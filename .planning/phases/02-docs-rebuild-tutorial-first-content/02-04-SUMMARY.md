---
phase: 02-docs-rebuild-tutorial-first-content
plan: 04
subsystem: docs
tags: [astro, starlight, url-contract, troubleshooting, requirements, changelog]

requires:
  - phase: 02-docs-rebuild-tutorial-first-content
    provides: "Plan 02-03's clean 35-URL baseline (7-command CLI reference complete)"
provides:
  - "NEW /docs/guide/requirements/ page: language-support matrix first (4 nav families, 10 search-only), source-true zoekt-git-index/zoekt-webserver binary names, per-language caveat subsections (DOCS-06)"
  - "Deepened troubleshooting tree: three named failure modes (uvx cold-start, PATH, scip version-gate) plus semanticSearch Python-version and issue-#9 entries, locked anchor contract for plan 02-06 (DOCS-07)"
  - "NEW /docs/changelog/ page: verbatim mirror of ../jarvis/CHANGELOG.md, diff-proven byte-identical (DOCS-08)"
  - "design/url-contract.json grown by exactly two URLs (35 -> 37): /docs/guide/requirements/, /docs/changelog/"
  - "astro.config.mjs Guide sidebar reordered (Quickstart -> Requirements & Limits -> Install) + top-level Changelog entry after Troubleshooting"
affects: [02-06, 02-07]

actuals:
  tokens: 10500
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "3-file atomic ADD proven twice more (requirements.md, changelog.md): content + url-contract URL + sidebar entry, one commit each, V2 green"
    - "Verbatim-mirror page pattern: exact 4-line frontmatter header + shell-constructed body (tail -n +2 of source) with a diff-based verification command, avoiding any manual transcription risk"
    - "Locked anchor contract: LOCKED verbatim H2 headings in a plan's frontmatter, verified against the built dist HTML's actual `id=` attributes (not just the source markdown), before downstream plans consume them"

key-files:
  created:
    - src/content/docs/docs/guide/requirements.md
    - src/content/docs/docs/changelog.md
  modified:
    - design/url-contract.json
    - astro.config.mjs
    - src/content/docs/docs/troubleshooting/index.md
    - src/content/docs/docs/troubleshooting/common-failures.md
    - src/content/docs/docs/troubleshooting/upstream-issues.md

key-decisions:
  - "requirements.md matrix rows: one row per family/language (14 total: 4 nav families + 10 search-only), not one row per file extension — TypeScript/TSX and Java/Kotlin rendered as single combined-family rows per the plan's own naming, matching the UI-SPEC's '4 nav families' framing"
  - "Caveat cells in the matrix link forward to ### subsection anchors (Android/Gradle, Kotlin version, Maven-on-macOS for Java/Kotlin; version floor + code-signed targets for Swift) rather than inlining caveat text in the table, keeping the matrix scannable per D-06's terse-reference convention"
  - ":::caution used exactly twice (Android/Gradle auto-degrade, Kotlin version-mismatch auto-degrade) — Swift's version floor and the Maven/macOS bash requirement are NOT auto-degrades (they fail with a remedy instead), so they stay as plain prose per the UI-SPEC aside-assignment rule"
  - "Anchor contract shipped exactly as locked in the plan frontmatter — verified against the actual built dist/docs/troubleshooting/common-failures/index.html id= attributes, not just grepped from source markdown, closing any doubt about Starlight's slug-derivation algorithm before 02-06 depends on these anchors by name"
  - "upstream-issues.md's new --semantic-include entry cites jarvis-index#9 (this repo's issue tracker, not the private jarvis repo) per 02-RESEARCH Product Truth §5's issue table"
  - "Changelog body was constructed via a shell redirect (frontmatter heredoc + tail -n +2 of the source file) rather than manual Read/Write transcription — eliminates any risk of a 400-line copy silently diverging from the source, and the diff check in the task verify block proves byte-identity directly"

patterns-established:
  - "Verbatim-mirror pages (like changelog.md) are built via shell redirection from the source file, never retyped — the task's own diff-based verify command is the proof, not a visual read"

requirements-completed: [DOCS-06, DOCS-07, DOCS-08]

coverage:
  - id: D1
    description: "requirements.md leads with the language-support matrix (4 nav families / 10 search-only), before any ### heading, with zoekt-git-index/zoekt-webserver binary names (not the stale zoekt-index) and Kotlin/Android :::caution asides only"
    requirement: "DOCS-06"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V2: 36 pages = contract at time of task) + grep -q '| Language | Navigation | Search | Caveat |' + grep -q 'zoekt-git-index' + ! grep -q 'zoekt-index' + awk no-### -before-table check + grep Scala/PHP/SQL + caution count == 2"
        status: pass
    human_judgment: false
  - id: D2
    description: "requirements.md and its contract/sidebar edits shipped as a single 3-file atomic commit; Guide sidebar order is Quickstart -> Requirements & Limits -> Install"
    requirement: "DOCS-06"
    verification:
      - kind: other
        ref: "git show --stat 6f37223 lists all three files; test -f dist/docs/guide/requirements/index.html"
        status: pass
    human_judgment: false
  - id: D3
    description: "common-failures.md carries all four LOCKED verbatim H2 headings (uvx cold-start, PATH, scip version-gate, semanticSearch Python version) in Symptom -> Diagnosis -> Fix structure with verified fixes"
    requirement: "DOCS-07"
    verification:
      - kind: other
        ref: "grep -qF for each of the four exact heading strings + grep -q 'which jarvis-server' + grep -q -- '--python 3.13' + all pass"
        status: pass
    human_judgment: false
  - id: D4
    description: "The four locked anchors resolve in the actual built dist HTML (not just source markdown), proving the anchor contract 02-06 depends on is live"
    requirement: "DOCS-07"
    verification:
      - kind: other
        ref: "grep -o 'id=\"[a-z0-9-]*\"' dist/docs/troubleshooting/common-failures/index.html matched first-mcp-connect-times-out-uvx-cold-start, jarvis-or-jarvis-server-not-found-path, jarvis-index-refuses-an-old-scip-version-gate, semanticsearch-server-fails-to-connect-python-version, navigation-empty-but-search-works-search-only exactly"
        status: pass
    human_judgment: false
  - id: D5
    description: "troubleshooting/index.md leads with a 'Start here' table linking all three named-mode anchors; the renamed nav-empty anchor has zero remaining stale references; upstream-issues.md gained the issue #9 entry; the two-page split is unchanged (no new pages)"
    requirement: "DOCS-07"
    verification:
      - kind: other
        ref: "grep -q '## Start here' + anchor-link count 9 (>= 3 required) + ! grep -q 'nav-empty-but-search-works' + grep -q 'semantic-include' upstream-issues.md + npm run build && npm run verify green"
        status: pass
    human_judgment: false
  - id: D6
    description: "changelog.md body is byte-identical to ../jarvis/CHANGELOG.md minus its H1, shipped as a 3-file atomic commit with contract + sidebar entries"
    requirement: "DOCS-08"
    verification:
      - kind: other
        ref: "diff <(tail -n +5 changelog.md) <(tail -n +2 ../jarvis/CHANGELOG.md) exits 0 + grep -q '[0.6.2]' + test -f dist/docs/changelog/index.html + grep contract + grep sidebar + git show --stat 1a379a9 lists all three files"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 04: Requirements, Troubleshooting Deepening, and Changelog Summary

**New Requirements & Limits page (matrix-first, D-14), the troubleshooting decision tree deepened with the three named failure modes and issue-mined entries with a locked anchor contract (D-12/D-13), and a byte-verbatim changelog page (D-15) — all diff/grep-proven against source truth.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-22T10:28:30Z
- **Completed:** 2026-08-22T10:32:30Z
- **Tasks:** 3
- **Files modified:** 8 (2 created, 6 modified)

## Accomplishments

- New `/docs/guide/requirements/` page shipped as a 3-file atomic ADD: language-support matrix (`| Language | Navigation | Search | Caveat |`, 4 nav families + 10 search-only languages) is the first content element, followed by platform requirements with the source-true `zoekt-git-index`/`zoekt-webserver` binary names (never the private README's stale `zoekt-index`), and five `###` caveat subsections with `:::caution` asides on exactly the two auto-degrade cases (Android/Gradle, Kotlin version mismatch).
- The troubleshooting tree gained four new LOCKED-verbatim H2 entries in `common-failures.md` (uvx cold-start, PATH, scip version-gate, semanticSearch Python-version) each in Symptom → Diagnosis → Fix structure with a verified fix command; the `nav-empty-but-search-works` anchor was renamed to `Navigation empty but search works (search-only)` with its Cause extended to cover the Gradle multi-module Kotlin case.
- `troubleshooting/index.md` now opens with a "Start here: the three most common failures" table linking the three named-mode anchors, and every internal link on the page was normalized to trailing-slash-before-fragment form.
- `upstream-issues.md` gained the `--semantic-include`-on-prose-only-repos entry (jarvis-index#9, open), framed as a settled limitation, not a bug.
- New `/docs/changelog/` page mirrors `../jarvis/CHANGELOG.md` verbatim (403 lines total, 4-line frontmatter + 399-line body), constructed via shell redirect and diff-verified byte-identical to the source minus its H1.
- The anchor contract locked in the plan frontmatter was verified against the actual built `dist/` HTML `id=` attributes — all four anchors resolve exactly as specified, ready for plan 02-06's quickstart failure links.

## Task Commits

Each task was committed atomically:

1. **Task 1: Requirements & Limits page end-to-end (tracer)** — `6f37223` (feat)
2. **Task 2: Deepen the troubleshooting tree, lock anchor contract** — `b0cb884` (feat)
3. **Task 3: Changelog page — verbatim mirror, 3-file atomic ADD** — `1a379a9` (feat)

**Plan metadata:** commit to follow (docs: complete plan)

## Files Created/Modified

- `src/content/docs/docs/guide/requirements.md` — NEW: 14-row language matrix, platform requirements table, 5 caveat subsections
- `src/content/docs/docs/changelog.md` — NEW: verbatim mirror of `../jarvis/CHANGELOG.md`
- `design/url-contract.json` — +2 URLs (`/docs/guide/requirements/`, `/docs/changelog/`); 35 → 37
- `astro.config.mjs` — Guide sidebar reordered (Requirements & Limits inserted between Quickstart and Install); top-level Changelog entry after Troubleshooting
- `src/content/docs/docs/troubleshooting/common-failures.md` — 4 new locked-heading entries; nav-empty anchor renamed and Cause extended
- `src/content/docs/docs/troubleshooting/index.md` — new "Start here" section; all internal links normalized to trailing-slash form
- `src/content/docs/docs/troubleshooting/upstream-issues.md` — new `--semantic-include` prose-only-repo entry (jarvis-index#9)

## Decisions Made

- Matrix rows follow the plan's own family naming (`TypeScript / TSX`, `Java / Kotlin` as single combined rows) rather than splitting by file extension — matches "4 nav families" framing throughout the research and UI-SPEC.
- Caveat cells link forward to `###` subsection anchors instead of inlining caveat prose in the table — keeps the matrix scannable, consistent with D-06's terse reference voice.
- `:::caution` used exactly twice (the two auto-degrade cases); Swift's version floor and the Maven/macOS bash requirement fail-with-a-remedy rather than auto-degrading, so they stay as plain prose per the UI-SPEC aside budget.
- Verified the anchor contract against built HTML `id=` attributes, not just source markdown — removes any doubt about Starlight's rehype-slug algorithm before 02-06 depends on these anchors by literal string.
- Changelog body constructed via shell redirect (`tail -n +2` piped into the new file after a printed frontmatter block) rather than Read/Write transcription of 400 lines — the task's diff check is direct proof of byte-identity, not a visual spot-check.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria for all three tasks passed on the first `npm run build && npm run verify` run per task.

## Issues Encountered

- Task 2's build emitted transient Astro content-layer "Duplicate id" warnings for the three troubleshooting files (same non-blocking class of warning documented in 02-03-SUMMARY — stale `.astro/` cache during a same-session edit). Did not reproduce as a build failure; V2/V3/V4/V5/V9 all green on every run in this plan.

## User Setup Required

None — no external service configuration required.

## Anchor Contract Shipped (consumed by plan 02-06)

| H2 heading (verbatim) | Derived anchor (verified in built HTML) |
|---|---|
| `## First MCP connect times out (uvx cold start)` | `#first-mcp-connect-times-out-uvx-cold-start` |
| `## jarvis or jarvis-server not found (PATH)` | `#jarvis-or-jarvis-server-not-found-path` |
| `## jarvis index refuses an old scip (version gate)` | `#jarvis-index-refuses-an-old-scip-version-gate` |
| `## semanticSearch server fails to connect (Python version)` | `#semanticsearch-server-fails-to-connect-python-version` |

Renamed (no longer `nav-empty-but-search-works`): `## Navigation empty but search works (search-only)` → `#navigation-empty-but-search-works-search-only`.

## Next Phase Readiness

- `design/url-contract.json` sits at 37 URLs — the clean baseline for 02-05 (`llms.txt`, strictly last), 02-06 (quickstart rewrite, which links `/guide/requirements/` before the install step and the four anchor-contract entries above), and 02-07.
- Quickstart (`src/content/docs/docs/quickstart.md`) was intentionally NOT touched by this plan — it is not in this plan's `files_modified` list and its "check your language is supported" link + Tabs conversion belong to plan 02-06, which now has a stable target page and anchor set to link against.
- The two-page troubleshooting split (Common Failures / Upstream Issues) remains structurally unchanged — only content depth grew.

---
*Phase: 02-docs-rebuild-tutorial-first-content*
*Completed: 2026-08-22*

## Self-Check: PASSED

All files created/modified verified present on disk; all 3 task commits (`6f37223`, `b0cb884`, `1a379a9`) verified present in git log.
