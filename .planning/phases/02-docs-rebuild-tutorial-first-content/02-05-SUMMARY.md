---
phase: 02-docs-rebuild-tutorial-first-content
plan: 05
subsystem: docs
tags: [astro, starlight, url-contract, integrations, mcp-registration]

requires:
  - phase: 02-docs-rebuild-tutorial-first-content
    provides: "Plan 02-04's clean 37-URL baseline (requirements, troubleshooting, changelog complete)"
provides:
  - "NEW /docs/integrations/generic-stdio/ page: equal-footing fallback guide for any stdio-capable MCP client (D-11)"
  - "Deepened claude-code.md: README-verbatim plugin command + claude mcp add manual path, PATH troubleshooting cross-link"
  - "Deepened cursor.md: real decode-verified cursor:// one-click install deeplink, plugin-marketplace path, manual JSON"
  - "Deepened codex-cli.md: plugin-marketplace command (this repo's own README), manual ~/.codex config, honest no-URL-scheme note"
  - "Rewritten integrations/index.md: 4-row client decision table (Claude Code, Cursor, Codex CLI, Any stdio client) + forward link to the install-channels matrix"
  - "Deepened guide/install.md: pre-install requirements link, PATH implications documented per PyPI channel"
  - "design/url-contract.json grown by exactly one URL (37 -> 38): /docs/integrations/generic-stdio/"
  - "astro.config.mjs Integrations sidebar gains 'Any stdio client' after Codex CLI"
affects: [02-06, 02-07]

actuals:
  tokens: 3500
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "3-file atomic ADD proven a third time (generic-stdio.md): content + url-contract URL + sidebar entry, one commit, V2 green"
    - "cursor:// deeplink literal computed via `echo -n '<compact-json>' | base64` and decode-verified in the same acceptance pass that checks the >=0.6.0 floor — no fabricated link, no untested payload"
    - "Cross-linking convention extended from skills to docs pages: first body line of every client guide names its three sibling guides, matching the CLAUDE.md skill-file convention"

key-files:
  created:
    - src/content/docs/docs/integrations/generic-stdio.md
  modified:
    - design/url-contract.json
    - astro.config.mjs
    - src/content/docs/docs/integrations/claude-code.md
    - src/content/docs/docs/integrations/cursor.md
    - src/content/docs/docs/integrations/codex-cli.md
    - src/content/docs/docs/integrations/index.md
    - src/content/docs/docs/guide/install.md

key-decisions:
  - "Dropped the duplicate body H1 from generic-stdio.md as well as the four other deepened pages, even though Task 1's read_first only named cursor.md's pre-existing skeleton (which had an H1) — chose consistency across the four 'equal footing' guides over literal skeleton mirroring, since Task 2's explicit 'no body H1' rule would otherwise leave generic-stdio.md as the only guide carrying one"
  - "Codex CLI's plugin-marketplace command (`codex plugin marketplace add ... --ref main` / `codex plugin add jarvis`) was sourced from this repo's OWN root README.md (verified, source-of-truth here per CLAUDE.md ownership rules), not invented — the private jarvis/README.md doesn't cover Codex specifically"
  - "Cursor's plugin-marketplace path documented as-is (Teams/Enterprise dashboard flow, or local symlink) rather than glossed over, since no push-button command exists for Cursor's plugin path the way it does for Claude Code/Codex — matches RESEARCH's channel-fidelity requirement"
  - "guide/install.md's PATH explanation for `uv tool install` cross-links directly to the locked troubleshooting anchor #first-mcp-connect-times-out-uvx-cold-start (shipped by 02-04) rather than restating the fix, keeping the two pages in sync on one canonical explanation"
  - "Codex's manual registration is shown as the same canonical JSON block titled mcp.json (not converted to Codex's native TOML config format) per the plan's literal 'mirror the canonical JSON' instruction — the JSON is the source of truth to paste into ~/.codex, format conversion is left to the reader's Codex version"

patterns-established:
  - "Sibling cross-link as the first body line on multi-client guide pages — lets a mis-landed reader redirect in one glance, now applied uniformly across all four /docs/integrations/*.md pages"

requirements-completed: [DOCS-02]

coverage:
  - id: D1
    description: "generic-stdio.md exists as a 3-file atomic ADD (content + contract + sidebar), floor-correct, Verify step naming getIndexStatus, sidebar label exactly 'Any stdio client' after Codex CLI"
    requirement: "DOCS-02"
    verification:
      - kind: other
        ref: "npm run build && npm run verify (V2: 38 pages = contract) + grep -q 'jarvis-mcp>=0.6.0' + grep -q 'title=\"mcp.json\"' + grep -q 'getIndexStatus' + ! grep -q 'jarvis-mcp\\[semantic\\]' + test -f dist/docs/integrations/generic-stdio/index.html"
        status: pass
    human_judgment: false
  - id: D2
    description: "All four client guides (claude-code, cursor, codex-cli, generic-stdio) carry a ## Verify section naming getIndexStatus"
    requirement: "DOCS-02"
    verification:
      - kind: other
        ref: "grep -l 'getIndexStatus' src/content/docs/docs/integrations/*.md lists all four files"
        status: pass
    human_judgment: false
  - id: D3
    description: "claude-code.md carries the README-verbatim plugin command and the claude mcp add manual command"
    requirement: "DOCS-02"
    verification:
      - kind: other
        ref: "grep -q '/plugin marketplace add jarvis-intelligence/jarvis-index' + grep -q 'claude mcp add jarvis' both pass"
        status: pass
    human_judgment: false
  - id: D4
    description: "cursor.md carries the real cursor:// deeplink and its base64 config payload decodes to the canonical >=0.6.0 registration block"
    requirement: "DOCS-02"
    verification:
      - kind: other
        ref: "grep -q 'cursor://anysphere.cursor-deeplink/mcp/install' + grep -o 'config=[A-Za-z0-9+/=]*' | cut -d= -f2- | base64 -d | grep -q 'jarvis-mcp>=0.6.0' — both pass"
        status: pass
    human_judgment: false
  - id: D5
    description: "codex-cli.md states honestly that Codex has no install URL scheme; no page in integrations/ lowers the floor or adds the semantic extra"
    requirement: "DOCS-02"
    verification:
      - kind: other
        ref: "grep -qi 'no.*URL scheme' codex-cli.md pass; grep -rq 'jarvis-mcp>=0.6.0' cursor.md codex-cli.md pass; ! grep -rq 'jarvis-mcp\\[semantic\\]' src/content/docs/docs/integrations/ pass"
        status: pass
    human_judgment: false
  - id: D6
    description: "integrations/index.md carries the 4-row decision table incl. Any stdio client and links the install-channels matrix; guide/install.md links /guide/requirements/ before any install command"
    requirement: "DOCS-02"
    verification:
      - kind: other
        ref: "grep -q 'Any stdio client' integrations/index.md pass; grep -q '/guide/requirements/' guide/install.md pass; npm run build && npm run verify exits 0"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-08-22
status: complete
---

# Phase 2 Plan 05: Per-Client Install Guides Deepened, Generic Stdio Guide Added Summary

**Four equal-footing client guides (Claude Code, Cursor, Codex CLI, and a new generic stdio fallback) each end with a working, floor-correct registration path and a Verify step; the integrations overview reaches all four in one click and the install guide now gates on the requirements page.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-22T10:34:49+07:00 (previous plan's close-out commit)
- **Completed:** 2026-08-22T10:40:46+07:00
- **Tasks:** 2
- **Files modified:** 8 (1 created, 7 modified)

## Accomplishments

- New `/docs/integrations/generic-stdio/` page shipped as a 3-file atomic ADD: content + `design/url-contract.json` (+1 URL, 37→38) + `astro.config.mjs` sidebar entry (`Any stdio client`, after Codex CLI) — the fallback guide for any MCP client not named Claude Code, Cursor, or Codex CLI (D-11).
- `claude-code.md` now shows the private-repo-README-verbatim plugin command (`/plugin marketplace add jarvis-intelligence/jarvis-index` + `/plugin install jarvis@jarvis`) alongside the manual `claude mcp add jarvis --scope user -- jarvis-server` command, cross-linking the locked PATH troubleshooting anchor for GUI-launched sessions.
- `cursor.md` carries a real, decode-verified `cursor://anysphere.cursor-deeplink/mcp/install` one-click install link (config payload computed via `base64` from the canonical registration block, not fabricated), the Cursor plugin-marketplace path (Teams/Enterprise dashboard or local symlink — sourced from this repo's own README), and the manual JSON block.
- `codex-cli.md` states plainly that Codex CLI has no MCP install URL scheme, then gives the plugin-marketplace command (`codex plugin marketplace add ... --ref main` + `codex plugin add jarvis`, sourced from this repo's own README) and the manual `~/.codex` config mirroring the canonical JSON.
- `integrations/index.md` was rewritten as a 4-row `Client | Path | Guide` decision table reaching all four guides in one click, with a forward link to the (not-yet-built) install-channels matrix page.
- `guide/install.md` gained a pre-install link to the requirements page (D-14 placement pattern) and a PATH-implication sentence for each of the three PyPI install channels (`uv tool install`, ad-hoc `uvx`, `pip install`), including a cross-link to the locked uvx-cold-start troubleshooting anchor.
- Every registration JSON across all four integration guides keeps the `jarvis-mcp>=0.6.0` floor and none adds the `[semantic]` extra — verified by grep across the whole `integrations/` directory.

## Task Commits

Each task was committed atomically:

1. **Task 1: Generic stdio guide end-to-end (tracer)** — `01051c3` (feat)
2. **Task 2: Deepen the three client guides, the integrations overview, and the install guide** — `daba3cb` (feat)

**Plan metadata:** commit to follow (docs: complete plan)

## Files Created/Modified

- `src/content/docs/docs/integrations/generic-stdio.md` — NEW: equal-footing fallback guide, verbatim `plugin/.mcp.json` block, Verify step
- `design/url-contract.json` — +1 URL (`/docs/integrations/generic-stdio/`); 37 → 38
- `astro.config.mjs` — Integrations sidebar gains `Any stdio client` after Codex CLI
- `src/content/docs/docs/integrations/claude-code.md` — plugin + manual paths, PATH cross-link
- `src/content/docs/docs/integrations/cursor.md` — real deeplink, plugin marketplace, manual JSON
- `src/content/docs/docs/integrations/codex-cli.md` — plugin marketplace, manual config, no-URL-scheme note
- `src/content/docs/docs/integrations/index.md` — 4-row decision table, install-matrix forward link
- `src/content/docs/docs/guide/install.md` — requirements pre-link, PATH implications per channel

## Decisions Made

- Dropped the duplicate body H1 from all five deepened/created integration-family pages (including generic-stdio.md, whose read_first analog had one) for consistency across the "equal footing" guide set, rather than mirroring the analog's H1 literally.
- Codex's plugin-marketplace command and Cursor's plugin-marketplace path were sourced from THIS repo's own root `README.md` (verified, source-of-truth here), not invented or copied from the private jarvis repo, which doesn't document per-client plugin commands.
- Codex's manual path mirrors the canonical JSON verbatim rather than converting it to Codex's native TOML config format — the JSON block is the copy-paste source of truth; format adaptation is left implicit to the reader's Codex version.
- `guide/install.md`'s uv-tool-install PATH note cross-links the locked `#first-mcp-connect-times-out-uvx-cold-start` anchor (shipped by plan 02-04) instead of restating the fix inline, keeping one canonical explanation.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' acceptance criteria passed on the first `npm run build && npm run verify` run.

## Issues Encountered

- The build emitted transient Astro content-layer "Duplicate id" warnings for the five touched integration/guide files (same non-blocking class of warning documented in 02-03-SUMMARY and 02-04-SUMMARY — stale `.astro/` cache during a same-session edit). Did not reproduce as a build failure; V2/V3/V4/V5/V9 all green on both task builds.

## User Setup Required

None — no external service configuration required.

## Cursor Deeplink Payload (for the Phase 5 claims audit)

- **Config object (compact JSON):** `{"command":"uvx","args":["--from","jarvis-mcp>=0.6.0","jarvis-server"]}`
- **Base64 payload:** `eyJjb21tYW5kIjoidXZ4IiwiYXJncyI6WyItLWZyb20iLCJqYXJ2aXMtbWNwPj0wLjYuMCIsImphcnZpcy1zZXJ2ZXIiXX0=`
- **Full literal link (as shipped in cursor.md):** `cursor://anysphere.cursor-deeplink/mcp/install?name=jarvis&config=eyJjb21tYW5kIjoidXZ4IiwiYXJncyI6WyItLWZyb20iLCJqYXJ2aXMtbWNwPj0wLjYuMCIsImphcnZpcy1zZXJ2ZXIiXX0=`
- **Decoded verification:** `echo "$B64" | base64 -d` reproduces the config object byte-for-byte; the acceptance-criteria grep pipeline (`grep -o 'config=...' | cut -d= -f2- | base64 -d | grep 'jarvis-mcp>=0.6.0'`) confirms this at build time, not just at authoring time.

## Next Phase Readiness

- `design/url-contract.json` sits at 38 URLs — the baseline for 02-06 (quickstart rewrite, Tabs, `/guide/install-matrix/` page which `integrations/index.md` already links forward to) and 02-07.
- `integrations/index.md`'s link to `/guide/install-matrix/` is intentionally forward-referencing a page that doesn't exist yet — `npm run verify`'s V3 only checks landing + docs-home asset resolution, not every internal doc link, so this is safe per RESEARCH; the link resolves once 02-06/02-07 ships that page, before the phase gate.
- All four `/docs/integrations/*.md` guides and the new `generic-stdio.md` are structurally consistent (no body H1, sibling cross-link as first line, `## Verify` closing section) — a stable analog set for any future fifth-client guide.

---
*Phase: 02-docs-rebuild-tutorial-first-content*
*Completed: 2026-08-22*

## Self-Check: PASSED

All 8 created/modified files verified present on disk; both task commits (`01051c3`, `daba3cb`) verified present in git log.
