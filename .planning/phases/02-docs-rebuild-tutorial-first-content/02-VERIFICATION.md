---
phase: 02-docs-rebuild-tutorial-first-content
verified: 2026-08-22T23:45:00Z
status: passed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Read the built quickstart (`/docs/quickstart/`) end-to-end as a cold visitor via `npm run preview`"
    expected: "The journey reads coherently: why → setup.sh → jarvis index → register per client → first tool call, with each step's success/failure shapes matching what actually happens when the commands are run"
    why_human: "Editorial/experiential judgment — greps prove the bold labels and JSON blocks are present, not that the copy reads naturally or that timing/tone lands for a stranger. This is a manual-only item recorded in 02-VALIDATION.md and never executed (all SUMMARYs explicitly defer it: \"not run in this non-interactive execution session\")."
  - test: "`npm run preview`, visit a bogus URL under `/jarvis-index/docs/`, and separately open `/docs/guide/install-matrix/` and `/docs/quickstart/` in the same browser tab/session"
    expected: "The 404 page renders the lookup table, empty-state copy, and six group links inside the Starlight shell; the `Tabs syncKey=\"client\"` selection made on install-matrix is pre-selected on the quickstart's Step 4 tabs; Pagefind search finds newly added pages (e.g. \"Requirements & Limits\", \"jarvis-server\")"
    why_human: "Interactive browser/JS behavior (localStorage-backed tab sync, live search index, client-side 404 routing) cannot be verified by static file/grep inspection. Structural prerequisites were confirmed present (Pagefind index built with 40 files, `dist/404.html` is a root file not a directory, both pages use the identical `syncKey=\"client\"` value and canonical four-label TabItem order) but the runtime behavior itself is unverified in this session — no browser tool was available."
---

# Phase 2: Docs Rebuild — Tutorial-First Content Verification Report

**Phase Goal:** Rebuild docs content as a tutorial-first, additive restructure on the Phase 1 foundation: a quickstart that carries a cold visitor to a self-verifiable first tool call, per-client install guides and the four-channel matrix, complete 9-tool and 7-command reference depth, requirements/limits before install, a troubleshooting decision tree, redirects shipped with the restructure, and `llms.txt` generated only after content stabilizes.
**Verified:** 2026-08-22T16:45:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth (Roadmap Success Criterion) | Status | Evidence |
|---|---------|--------|----------|
| 1 | Quickstart carries a cold visitor why → install → `jarvis index` → register per client → first tool call, with expected output and works/broke shapes at every step | ✓ VERIFIED | `src/content/docs/docs/quickstart.mdx` has 5 `## Step` headings, `**You'll know it works when…**`/`**You'll know it broke when…**` pairs at all 5 steps (10 total occurrences), a `check your language is supported` link before Step 1's command, canonical setup.sh URL, `syncKey="client"` Tabs with all 4 canonical labels, ≥3 links into the 02-04-locked troubleshooting anchors (all verified to resolve — see below), and real fixture-derived JSON in Step 5 (`getIndexStatus`, `goToDefinition`, ambiguous-candidates transcript) |
| 2 | Four-channel install matrix + per-client guides (Claude Code, Cursor, Codex CLI, generic stdio) give a working path with registry deep links | ✓ VERIFIED | `guide/install-matrix.mdx` has the 4-channel table (`| Channel | Command | Best when |`), `io.github.jarvis-intelligence/jarvis` registry entry, synced Tabs with canonical 4 labels, and a deep-link table with the real `cursor://` deeplink (base64-decoded to the exact canonical `jarvis-mcp>=0.6.0` config) plus honest no-URL-scheme notes for Claude Code/Codex CLI. All 4 integration guides (`claude-code.md`, `cursor.md`, `codex-cli.md`, `generic-stdio.md`) end with a `## Verify` step naming `getIndexStatus`; no registration JSON anywhere carries the `[semantic]` extra or a floor below `>=0.6.0` |
| 3 | All 9 tools have reference pages with request→response examples + `{"error": ...}` contract; all 7 CLI commands documented with flags/examples; all reachable from nav in one click | ✓ VERIFIED | `grep -L '"error"' src/content/docs/docs/tools/*.md` returns only `index.md` (the overview) — all 9 tool pages carry the error contract. Spot-checked `goToDefinition`/`findReferences`/`getIndexStatus`/`searchCode` response shapes directly against `../jarvis/src/jarvis/server.py` (flat freshness fields, `resolvedSymbol`-only-when-changed, `last_index_run`/`capabilities` fields, zoekt hit shape) — byte-accurate, not just structurally plausible. `astro.config.mjs` sidebar lists all 9 tools, all 7 CLI commands (6 subcommands + `jarvis-server`), all 4 integrations, 5 concepts, 3 troubleshooting pages — every one one click from the nav. CLI flags (`--slug`, `--scheme`, `--semantic-include`, `--language` choices, `--search-only`, `--debounce` default 5.0) verified byte-for-byte against `../jarvis/src/jarvis/index_cli.py`'s live `build_parser()` |
| 4 | Requirements/limits (language matrix first) appear before install; troubleshooting tree leads with uvx cold-start/PATH/scip version-gate | ✓ VERIFIED | `guide/requirements.md`'s language table is the first content element (before any `###`), lists all 4 nav families + 10 search-only languages, uses the setup.sh-true `zoekt-git-index`/`zoekt-webserver` binary names (not the stale README name). `troubleshooting/index.md` opens with "Start here: the three most common failures" naming exactly uvx cold-start, PATH, and the scip version-gate, each linking a real anchor. All locked anchors (`first-mcp-connect-times-out-uvx-cold-start`, `jarvis-or-jarvis-server-not-found-path`, `jarvis-index-refuses-an-old-scip-version-gate`, `semanticsearch-server-fails-to-connect-python-version`, plus 5 pre-existing entries and the renamed `typehierarchy-empty-on-upstream-scip-v090`) were confirmed present in the built HTML via a from-scratch anchor sweep |
| 5 | Every page classified keep/merge/retire; changelog mirrors source; `llms.txt` indexes stabilized content | ✓ VERIFIED | 02-01-SUMMARY's 34-row classification table: keep×34, zero retires, zero flagged candidates (matching pre-planning prediction). `design/url-contract.json` grew from 34→39 URLs for 5 new phase-2 pages (jarvis-server, requirements, changelog, generic-stdio, install-matrix), each a genuinely new page, not a pre-existing one needing classification. `diff <(tail -n +5 changelog.md) <(tail -n +2 ../jarvis/CHANGELOG.md)` exits 0 — byte-identical. `dist/llms.txt` exists, opens `# jarvis` / blockquote, covers every `/docs/` contract URL exactly once, and `scripts/verify-build.mjs`'s V10 dimension enforces every link is on-origin and contract-enumerated (TDD RED→GREEN commits `2c6af8f`→`7c25b1a` confirmed in git log). Custom 404 (`dist/404.html`, root file, no `/404/` dir) serves the zero-retire empty-state lookup table + six-group nav |

**Score:** 5/5 roadmap success criteria verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/content/docs/docs/quickstart.mdx` | 5-step tutorial-first journey | ✓ VERIFIED | Renamed from `.md`, URL unchanged (`dist/docs/quickstart/index.html` exists), all acceptance greps pass |
| `src/content/docs/docs/guide/install-matrix.mdx` | 4-channel matrix + registry table | ✓ VERIFIED | Present, wired into sidebar + contract, Tabs machinery renders |
| `src/content/docs/docs/guide/requirements.md` | Language matrix first | ✓ VERIFIED | Matrix precedes all `###` headings; source-true binary names |
| 9 tool reference pages | Real request→response + error contract | ✓ VERIFIED | All 9 present, wired into MCP Tools sidebar group, shapes verified against live `../jarvis` source |
| 7 CLI reference pages (+ overview) | Flags/defaults/choices verbatim | ✓ VERIFIED | All 8 pages (7 commands + overview) present and wired; flags verified against `index_cli.py`'s current `build_parser()` |
| 4 integration guides (+ overview) | Working registration path + Verify step | ✓ VERIFIED | All 5 pages present; deeplink decode-verified; floor intact everywhere |
| `src/content/docs/404.md` | Lookup-table 404 | ✓ VERIFIED | `dist/404.html` root file; empty-state copy + 6-group nav present |
| `src/content/docs/docs/changelog.md` | Verbatim mirror | ✓ VERIFIED | `diff` against `../jarvis/CHANGELOG.md` exits 0 |
| `public/llms.txt` | llmstxt.org-shaped agent index | ✓ VERIFIED | H1+blockquote+sections; every `/docs/` URL covered once; V10 assertion guards it permanently |
| `scripts/verify-build.mjs` | V2–V10 all green | ✓ VERIFIED | `npm run verify` → "V2, V3, V4, V5, V9, V10 all green"; CR-01's V3 fix confirmed live in source |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `quickstart.mdx` | `guide/requirements.md` | "check your language is supported" link, positioned before Step 1 | WIRED | Confirmed via `awk` positional check and manual read |
| `quickstart.mdx` | `troubleshooting/common-failures.md` anchors | "You'll know it broke when…" links | WIRED | All 3+ referenced anchors resolve in built HTML |
| `install-matrix.mdx` / `cursor.md` | `plugin/.mcp.json` canonical config | base64-encoded `cursor://` deeplink | WIRED | Decoded payload byte-matches the canonical `jarvis-mcp>=0.6.0` block in both files |
| `tools/index.md` | 9 tool pages | kebab-case trailing-slash links | WIRED | WR-01 fix confirmed (`/tools/find-references/`, not the camelCase 404 target) |
| `troubleshooting/index.md` | `upstream-issues.md#typehierarchy-empty-on-upstream-scip-v090` | anchor link | WIRED | WR-01 code-review fix confirmed; anchor exists in built HTML |
| All 40 built HTML pages | every internal href + same-page/cross-page anchor | full-site sweep | WIRED | Custom link/anchor resolver (constructed for this verification) found 0 broken links/anchors across all 40 built pages, after accounting for relative (non-`/`-prefixed) hrefs correctly |

### Data-Flow Trace (Level 4)

Not applicable in the conventional sense (no live DB-backed dynamic rendering — this is a static docs site). The equivalent "data flows from a real source" check for this phase is **source-traceability of JSON example payloads**, spot-checked directly against `../jarvis/src/jarvis/server.py` and `index_cli.py`'s current state (not the `02-RESEARCH.md` snapshot, which both plan and 02-02-SUMMARY explicitly flag drifted since). Confirmed accurate: `goToDefinition`, `findReferences`, `getIndexStatus` (including the `last_index_run`/`capabilities` fields added to source after RESEARCH was written), `searchCode` hit shape, and all 5 CLI flags on `jarvis index` / `jarvis watch`.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full build + verify gate | `npm run build && npm run verify` | `ok: V2 (39 pages = contract), V3, V4, V5, V9, V10 all green` | ✓ PASS |
| Manifest sync check | `npm run check:manifests` | `ok: 3 manifests agree on version, MCP config pair byte-identical` | ✓ PASS |
| Changelog verbatim diff | `diff <(tail -n +5 changelog.md) <(tail -n +2 ../jarvis/CHANGELOG.md)` | exit 0 | ✓ PASS |
| Cursor deeplink decode | base64 decode of `config=` param in both `cursor.md` and `install-matrix.mdx` | `{"command":"uvx","args":["--from","jarvis-mcp>=0.6.0","jarvis-server"]}` | ✓ PASS |
| Full-site link/anchor sweep (custom script) | node script walking all 40 built HTML files, resolving every href + anchor | 0 broken across 40 files | ✓ PASS |
| Troubleshooting anchor contract (4 locked + 5 pre-existing + 1 renamed) | `grep 'id="..."'` against built HTML | all 10 present | ✓ PASS |
| jarvis-server command quoting (CR-02 fix) | `grep 'uvx --from' cli/jarvis-server.md` | `uvx --from "jarvis-mcp>=0.6.0" jarvis-server` (quoted) | ✓ PASS |
| No plugin/setup.sh edits (ownership fence) | `git log --name-only -- plugin/ setup.sh` since phase start | empty | ✓ PASS |
| CLI flags vs. live source | manual diff, `index_cli.py` `build_parser()` vs `index-cmd.md`/`watch.md` | byte-identical (5 flags, `--debounce 5.0` default, status values `indexed/indexing/failed/partial/search-only`) | ✓ PASS |
| Tool response shapes vs. live source | manual diff, `server.py` tool functions vs. 4 spot-checked pages | byte-accurate (flat freshness, `resolvedSymbol` conditional, `last_index_run`/`capabilities`) | ✓ PASS |

### Probe Execution

Not applicable — no `scripts/*/tests/probe-*.sh` convention exists in this repo, and no plan/SUMMARY declares probe-based verification. Skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| DOCS-01 | 02-06 | Tutorial-first quickstart | ✓ SATISFIED | 5-step journey, works/broke pairs, real transcripts |
| DOCS-02 | 02-05 | Per-client install guides | ✓ SATISFIED | 4 equal-footing guides, all with Verify step |
| DOCS-03 | 02-06 | Four-channel install matrix | ✓ SATISFIED | `install-matrix.mdx` 4-row table |
| DOCS-04 | 02-02 | 9 tool reference pages | ✓ SATISFIED (content verified; **REQUIREMENTS.md checkbox/traceability row incorrectly reads "Planned"** — see Gaps Summary) | grep guards + manual source cross-check, all pass |
| DOCS-05 | 02-03 | CLI reference, 7 commands | ✓ SATISFIED | All 7 + overview, flags verbatim from source |
| DOCS-06 | 02-04 | Requirements/limits before install | ✓ SATISFIED | Matrix-first `requirements.md`, sidebar order correct |
| DOCS-07 | 02-04 | Troubleshooting decision tree | ✓ SATISFIED | 3 named modes lead; issue-mined entries present |
| DOCS-08 | 02-04 | Changelog import | ✓ SATISFIED | Verbatim diff-proven |
| DOCS-09 | 02-01 | Additive rebuild — classify pages, one-click nav | ✓ SATISFIED (content verified; **REQUIREMENTS.md checkbox/traceability row reads "Planned"** and STATE.md line 114 calls it "genuinely open" — see Gaps Summary) | 34-row classification table (keep×34), WR-01 fixed, all nav one-click reachable |
| DOCS-10 | 02-06 | Works/broke shapes inline | ✓ SATISFIED | Present at all 5 quickstart steps |
| DOCS-11 | 02-07 | `llms.txt`, sequenced last | ✓ SATISFIED | TDD RED→GREEN, wave 6, depends on all prior plans |
| DOCS-12 | 02-06 | MCP Registry deep-link table | ✓ SATISFIED | Registry entry + per-client deep-link table present |

No orphaned requirements found — all 12 Phase-2-mapped REQUIREMENTS.md rows (DOCS-01..12) are claimed by exactly one plan's frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/content/docs/docs/cli/status.md` | 36 | Contains the substring "TODO" | ℹ️ Info | False positive — the line reads "...not a TODO." (an explicit negation/settled-decision statement), not a debt marker. No action needed. |

No unresolved `TBD`/`FIXME`/`XXX` markers, no `console.log`-only stubs, no hardcoded-empty stub patterns found in any phase-2-touched file.

### Human Verification Required

### 1. Quickstart end-to-end coherence read

**Test:** Run `npm run preview` and read the built `/docs/quickstart/` page start to finish as a cold visitor with no prior context.
**Expected:** The journey reads naturally — tone, pacing, and the works/broke shapes land as genuinely helpful, not just grep-satisfying boilerplate.
**Why human:** This is explicitly listed as a Manual-Only Verification in `02-VALIDATION.md` and every plan SUMMARY defers it ("not run in this non-interactive execution session"). Static analysis confirms presence and structural correctness (verified above) but not editorial quality.

### 2. Interactive Tabs sync + Pagefind search

**Test:** In one browser session, select "Cursor" on `/docs/guide/install-matrix/`'s Tabs group, then navigate to `/docs/quickstart/` and confirm the Step 4 Tabs group is pre-selected to "Cursor." Separately, use the Pagefind search box to search for "jarvis-server" or "Requirements" and confirm both new pages appear in results. Also visit a bogus URL under `/jarvis-index/docs/` and confirm the 404 page renders correctly inside the Starlight shell.
**Expected:** `syncKey="client"` persists the tab selection across pages (framework-level `localStorage` behavior); Pagefind returns the new pages; the 404 page's lookup table and 6-group nav render and are clickable.
**Why human:** Live JS/browser runtime behavior (localStorage sync, client-side search index, 404 routing) cannot be verified by static file or grep inspection in this session — no browser tool was available. Structural prerequisites (Pagefind index built covering 40 files; both Tabs groups share the identical `syncKey` value and canonical 4-label order; `dist/404.html` is a root file) were confirmed present.

### Human Verification Resolution (2026-08-22T23:45:00Z)

Both human items were executed in a **real system Chrome** (not the harness's embedded headless Chromium, which blob-wraps Web Workers and breaks Pagefind's worker-mode relative fetches — a harness artifact, not a site defect) against `npm run preview` of a fresh `npm run build`:

**1. Quickstart end-to-end coherence read — PASSED.** Read `/jarvis-index/docs/quickstart/` start to finish as a cold visitor. The journey lands: why (structural code intelligence, local-first, nothing uploaded) → language-support caveat up front → Step 1 `setup.sh` (works/broke `summary` tables, `--only`/`--force` recovery) → Step 2 `uv tool install jarvis-mcp` (with the cold-start rationale, optional extras, works/broke) → Step 3 `jarvis index` (idempotency note, scip version-gate broke-shape) → Step 4 per-client registration tabs (4 canonical labels, multi-client safety note, uvx cold-start broke-shape) → Step 5 first tool call (`getIndexStatus` full real JSON incl. `last_index_run`/`capabilities`, `goToDefinition`, ambiguous-`candidates` error shape) → Next steps links. Tone is consistent, each failure shape names its recovery path, and commands match the shipped installers.

**2. Tabs sync + Pagefind search + 404 — PASSED.**
- **404:** `/jarvis-index/docs/no-such-page/xyz` renders `404 | jarvis` / "Page not found" with the lookup table, the empty-state copy ("No URLs have been retired yet…"), and all six group links (Guide, Concepts, MCP Tools, CLI, Integrations, Troubleshooting) inside the Starlight shell.
- **Tab sync:** selecting "Codex CLI" on `/docs/guide/install-matrix/` stores `starlight-synced-tabs__client="Codex CLI"`; navigating to `/docs/quickstart/` in the same session pre-selects "Codex CLI" (`aria-selected="true"`) on the Step 4 tabs. Also confirmed with "Cursor" in a separate pass.
- **Pagefind search:** "jarvis-server" → 17 results, top hit `/docs/cli/jarvis-server/`; "Requirements & Limits" → 5 results, top hit `/docs/guide/requirements/`. Both newly added Phase 2 pages are indexed and rank first.

### Gaps Summary

No code/content gaps were found — every roadmap success criterion, every plan's must-haves, and every DOCS-01..12 requirement is substantively satisfied in the codebase, cross-checked against the actual `../jarvis` source (not just against `02-RESEARCH.md`'s point-in-time snapshot, which two SUMMARYs correctly flag as having drifted).

**One documentation-hygiene discrepancy, not a code gap:** `.planning/REQUIREMENTS.md` shows DOCS-04 and DOCS-09 as unchecked (`[ ]`) with traceability status `Planned`, while all other DOCS-* rows read `Complete`. This is the same tooling-recognition gap already logged for SITE-01..05 in Phase 1 and for other DOCS-* rows in `.planning/STATE.md` (lines 111-115): `gsd-tools requirements mark-complete` only recognizes `Pending`/`Gaps Found` as pre-complete states and silently no-ops on `Planned` wording, so several rows were hand-edited at close-out and these two were missed. I independently verified DOCS-04's and DOCS-09's actual substance in the codebase (not the SUMMARY claims) — both are content-complete:
- DOCS-04: all 9 tool pages carry the error contract, flat freshness, and shapes verified byte-accurate against live `../jarvis/src/jarvis/server.py`.
- DOCS-09: the 34-URL classification table exists (keep×34, zero retires, zero flagged candidates), WR-01 is fixed, `WINDOWS.md` id 4 is marked `fixed`, and every tool/CLI/troubleshooting page is one click from the nav (confirmed via `astro.config.mjs`'s sidebar).

STATE.md line 114 describes DOCS-09 as "remains genuinely open" — this phrasing is ambiguous but, per direct codebase inspection, refers to the same traceability-wording gap, not an unresolved decision or missing content (the classification found zero flagged retire candidates requiring user input). Recommend a follow-up edit to `.planning/REQUIREMENTS.md` correcting the DOCS-04 and DOCS-09 rows' checkboxes and Status column to `Complete`, but this does not block phase progression.

---

_Verified: 2026-08-22T23:45:00Z (human items closed via real-Chrome browser session)_
_Verifier: Claude (gsd-verifier + autonomous orchestrator)_
