# Phase 6: Plugin & Skills Enhancement — Evidence Pack

**Gathered:** 2026-09-11 by three read-only scout agents (orchestrator-dispatched, pre-planning).
**Status:** Source of record for Phase 6 CONTEXT.md decisions.

This file is the raw, citation-bearing evidence behind `06-CONTEXT.md`. Every decision in
CONTEXT.md points at a section here. Claims carry `path:line`; each report ends with its own
unknown/ambiguous section — treat those as open questions for the researcher, not as settled fact.

Repos referenced:
- `/Users/ddphuong/Projects/jarvis-ai/jarvis` (`../jarvis` from this repo) — MCP server source of truth.
- `/Users/ddphuong/Projects/jarvis-ai/jarvis-index` — this repo, the public distribution surface.

---

## A. jarvis server ground truth (../jarvis)

# server-reality — jarvis MCP server ground truth (read-only audit, 2026-09-11)


## 1. Versions — all in sync at 0.9.1
- `pyproject.toml:16` — `version = "0.9.1"` (dist name `jarvis-mcp`, `pyproject.toml:15`)
- `server.json:9` — top-level `"version": "0.9.1"`
- `server.json:14` — `packages[0].version` = `"0.9.1"`
- Entry points `pyproject.toml:111-113`: `jarvis` → `jarvis.index_cli:main`; `jarvis-server` → `jarvis.server:main`

## 2. MCP tools — `src/jarvis/server.py`, 10 registered
Module docstring `server.py:3-4` states "Registers 10 tools"; `mcp = FastMCP("jarvis")` at `server.py:29`.

1. `documentSymbols` / `document_symbols` (`server.py:416-417`) — params `repo: str, path: str`. Returns `{path, symbols[], coverage?, freshness}`; per-file failure → `{error, path, coverage?, freshness}` (`server.py:429-436`); auto-routes SCIP outline → tree-sitter syntax per file (`server.py:418-421`).
2. `goToDefinition` / `go_to_definition` (`server.py:439-440`) — `repo: str, symbol: str`. Returns `{symbol, resolved fields, definitions[], freshness}` (`server.py:453-458`); accepts bare/qualified/full-SCIP/`syntax:` ids (`server.py:441-445`).
3. `findReferences` / `find_references` (`server.py:461-462`) — `repo: str, symbol: str`. Returns `{symbol, resolved fields, references[], freshness}` (`server.py:475-480`); SCIP-only, rejects `syntax:` ids with capability error (`server.py:464-467`).
4. `callHierarchy` / `call_hierarchy` (`server.py:483-484`) — `repo: str, symbol: str`. Returns `{symbol, resolved fields, incomingCalls[], outgoingCalls[], freshness}` (`server.py:496-501`); SCIP-only (`server.py:486-489`).
5. `typeHierarchy` / `type_hierarchy` (`server.py:505-506`) — `repo: str, symbol: str`. Returns `{symbol, resolved fields, supertypes[], subtypes[], freshness}` (`server.py:523-529`); SCIP-only + explicit capability error when index lacks relationship data (`server.py:511-516`). GATED on forked scip binary.
6. `getIndexStatus` / `get_index_status` (`server.py:567-568`) — `repo: str, repo_path: str | None = None`. Returns `{repo, indexed, status, freshness, searchCoverage, indexing?, last_index_run, capabilities}` (`server.py:587-589`); indexing states `starting`/`running`/`failed-at-startup`/`abandoned` (`server.py:575-578`).
7. `indexRepo` / `index_repo_tool` (`server.py:594-596`) — `path: str, semantic: bool = False, scip: bool | None = None`. Immediate `{repo, path, status:"indexing", state:"starting", pid, log, reindex?}` (`server.py:699-707`); spawns detached `jarvis index` child (`server.py:692-695`); only tool taking a path, not slug (`server.py:599-603`); pre-flight zoekt-git-index check (`server.py:634-638`); `semantic` defaults False due to multi-GB download (`server.py:607-610`).
8. `searchCode` / `search_code` (`server.py:708-709`) — `query: str, repo: str | None = None`. Returns `{query, hits[{repo,path,lineNumber,lineText}], totalMatches, fileCount, returned, truncated, indexedAt}` (`server.py:727-740`); live Zoekt syntax (`sym:`,`file:`,`lang:`,`case:`, negation, phrases, grouping) (`server.py:713-718`).
9. `semanticSearch` / `semantic_search_tool` (`server.py:767-768`) — `repo: str, query: str, limit: int = 10`. RRF-fused vector+Zoekt+SCIP hits; per-hit `sources`; symbol-only hits carry `content=""` (`server.py:769-776`). GATED on `semantic` extra.
10. `blastRadius` / `blast_radius_tool` (`server.py:788-789`) — `repo: str, symbol_or_package: str`. Returns `{repo, symbolOrPackage, dependents[], freshness}`; freshness always `unknown` — graph has no per-node timestamp (`server.py:793-795`).

**Gating details:**
- `semanticSearch`: deferred `from jarvis import semantic` so the tool exists without the extra (`server.py:777`); requires the repo indexed with the `semantic` extra installed (`server.py:776`). Degrades to vector-only when Zoekt won't start (`server.py:745-750`) and drops the SCIP signal without an index (`server.py:758-765`).
- `typeHierarchy`: requires the forked `scip` (relationships fix); setup.sh pins `SCIP_COMMIT_PIN="56791658a873"` (`setup.sh:28`); upstream through v0.9.0 never populates `global_symbols.relationships` (`setup.sh:14-18`); reindexing with the fork self-heals (`server.py:513-516`).

## 3. CLI — `src/jarvis/index_cli.py` (`build_parser` `index_cli.py:2021`; `main` `index_cli.py:2091-2094`)
- `index` (`index_cli.py:2025`): `path` (2026); `--slug` (2027); `--scheme` (2028-2030); `--semantic-include` repeatable, persisted (2031-2037); `--language` choices = `{java, python, swift, typescript}` (2038-2042; map `index_cli.py:87-89`); `--scip`/`--no-scip` BooleanOptionalAction, default None = persisted choice, enabled for new repo (`index_cli.py:1966-1979`); `--semantic`/`--no-semantic` mutually exclusive, default None, NOT persisted (`index_cli.py:1981-1995`); `offer_semantic=True` — only `jarvis index` offers the semantic TTY prompt (`index_cli.py:2048-2051`)
- `list` (`index_cli.py:2053`): no flags
- `status` (`index_cli.py:2056`): `slug` (2057)
- `reindex` (`index_cli.py:2060`): `slug` (2061) + scip (2062) + semantic (2063) flags
- `forget` (`index_cli.py:2066`): `slug` (2067)
- `watch` (`index_cli.py:2070-2086`): `path` (2071); `--slug` (2072); `--scheme` (2073-2075); `--debounce` float default 5.0 (2076); `--language` (2077-2082); scip + semantic flags (2083-2085)
- No top-level `--version` flag (`index_cli.py:2021-2023`)
- Removed options hard-rejected with replacement message: `--search-only`, `--fallback-search-only`, `--no-fallback-search-only` (`index_cli.py:1953-1963`; check in `main` `index_cli.py:1998-2007`, invoked 2093)
- `JARVIS_FALLBACK_SEARCH_ONLY` env: warn-only note, no longer read (`index_cli.py:2009-2018`, invoked 2094)
- Runtime floors: `MIN_SCIP_VERSION = (0, 9, 0)` — older `scip expt-convert` silently writes an empty DB (`index_cli.py:96-103`); `MIN_SCIP_SWIFT_VERSION = (0, 3, 0)` (`index_cli.py:107`)

## 4. `JARVIS_*` environment variables
- `JARVIS_DATA_DIR` — `config.py:86`; default `~/.jarvis` (`config.py:20`); re-injected into MCP-spawned index children (`server.py:694`)
- `JARVIS_ZOEKT_PORT` — `search.py:182`; default `6070`; invalid value degrades to default (`search.py:180-185`)
- `JARVIS_ZOEKT_BIN` — `search.py:221`; default `"zoekt-webserver"`
- `JARVIS_EMBEDDING_MODEL` — `embeddings.py:52`; default `BAAI/bge-m3` (`embeddings.py:13`)
- `JARVIS_EMBEDDING_BATCH_SIZE` — `embeddings.py:57-58`; default `8` (`embeddings.py:15`)
- `JARVIS_EMBEDDING_QUERY_PREFIX` — `embeddings.py:61`; from `MODEL_PREFIXES` substring match (`embeddings.py:33-37`); empty for bge-m3
- `JARVIS_EMBEDDING_DOC_PREFIX` — `embeddings.py:62`; same mechanism
- `JARVIS_FALLBACK_SEARCH_ONLY` — `index_cli.py:2013`; REMOVED, stderr note only (`index_cli.py:2015-2018`)
- `JARVIS_COMPILE` — build-time only (`pyproject.toml:149` cibuildwheel env; `pyproject.toml:117`); not read anywhere in `src/`

## 5. Must-tell-users (code-discovered)
**Binary prerequisites (installed by `setup.sh`, `--only` set at `setup.sh:958-960`):**
- `zoekt-git-index` REQUIRED for a first index — `indexRepo` returns `{"error": "zoekt-git-index was not found on PATH; ...", "recovery": "sh setup.sh --only zoekt"}` (`server.py:634-638`). `zoekt-webserver` spawned lazily by the server on first search (`server.py:709-711`).
- `universal-ctags` needed at INDEX time for `sym:` queries; absence degrades sym: only (`setup.sh:634-641`, warn at 653-655); existing shards stay symbol-less until reindex (`setup.sh:640-641`).
- `scip`: fork build pinned to `56791658a873`, version-gated install (`setup.sh:508-534`); PATH-shadowing by an older scip silently keeps broken typeHierarchy (`setup.sh:542-548`).
- `scip-typescript` / `scip-python`: npm globals, unpinned (`setup.sh:869-875`, comment 842-845).
- `scip-java` v0.13.1, needs a JVM (skips with warn if absent, `setup.sh:890-893`); Kotlin must be EXACTLY 2.2.0 for the scip-kotlinc plugin (`setup.sh:62-68`); macOS needs bash ≥4.4 shim (`setup.sh:460-463`; `config.py:53-69`).
- `scip-swift`: macOS arm64 only (`setup.sh:667-669`), auto-rolls to latest ≥0.3.0 (`setup.sh:43-48`).
- `semantic` extra = `lancedb>=0.20` + `sentence-transformers>=3.0` (`pyproject.toml:95-98`); model bge-m3 rev `5617a9f6...`, batch 8, MAX_SEQ_LENGTH 1024 (`embeddings.py:13-21`); multi-GB first-use download is why `semantic` defaults False (`server.py:607-610`); `SemanticExtraMissingError` carries an install hint (`embeddings.py:27-32`).

**Language tiers:**
- SCIP-navigable: typescript (`.ts`/`.tsx`), python (`.py`), java (`.java`/`.kt`), swift (`.swift`) — `index_cli.py:66-83`; `--language` values `java/python/swift/typescript` (`index_cli.py:87-89`); detection by git-tracked extension plurality (`index_cli.py:85,188-192`).
- Syntax baseline (declarations only, no nav): 17 tree-sitter grammars (`syntax.py:51-69`): python, javascript, typescript, tsx, java, kotlin, swift, go, ruby, rust, c, cpp, csharp, php, scala, bash, sql.
- `documentSymbols` falls back to syntax per file with a `coverage` object (`server.py:418-421,428`); `goToDefinition` accepts `syntax:` ids; `findReferences`/`callHierarchy`/`typeHierarchy` never do (`server.py:441-445,464-467,486-489,510-515`).
- SCIP enrichment failure degrades to exit-0 `degraded`; syntax baseline always publishes (`index_cli.py:1976-1980`; `index_cli.py:107-115`; `DEGRADED_STATUS` `server.py:25`). The old "search-only mode" no longer exists — degradation is automatic, not a mode.

**Error contract:** every tool catches broad exceptions → `{"error": str}` (`server.py:426-427` comment; sites 451, 473, 494, 521, 582, 619, 725, 785, 800). `CapabilityUnavailableError` → `{error, requiredCapability, reason, recovery}` (`server.py:354-358`); "never an empty array" (`docs/codebase-summary.md:167`). `AmbiguousSymbolError` → error with retry-qualifier hint (`server.py:398-406`). `getIndexStatus` adds `state`/`recovery` (`server.py:374-378`) and can never kill a response (`server.py:583-586`; `_indexing_fields` never raises, `server.py:530-548`). `searchCode` answers the last published snapshot, not the working tree; `truncated` flags over-cap results (`server.py:712-716,733-740`).

## 6. `.claude/skills/` (maintainer-side, this repo)
- `jarvis-release` — release pipeline for THIS repo (bump pyproject + both server.json fields + uv.lock, CHANGELOG, release PR, tag, verify publish workflows); explicitly states plugins are NOT part of this bump and live in jarvis-index (`.claude/skills/jarvis-release/SKILL.md:1-3` + body).
- `codeintel-release/` — EMPTY directory (no SKILL.md; glob `.claude/skills/**` matched nothing under it); leftover from the pre-0.5.0 codeintel rename (`AGENTS.md:12`). Not for the public plugin; candidate for deletion.

## 7. Docs stating a tool count or list
**Correct (10/ten):** `README.md:15` "exposed as ten MCP tools"; `README.md:65` "exposes ten tools"; `docs/codebase-summary.md:57` "registers 10 tools"; `docs/system-architecture.md:5` "exposing 10 tools"; `docs/system-architecture.md:27` "10 tools"; `docs/system-architecture.md:43` "10 tools".

**Stale (9/nine or 8 — all omit `indexRepo`):** `AGENTS.md:10` "9 tools (documentSymbols, …, blastRadius)"; `AGENTS.md:39` "FastMCP stdio server, 9 tools"; `docs/index.html:550` "Nine flat tools over stdio JSON-RPC"; `docs/index.html:568` "Nine MCP tools"; `docs/index.html:573` "Eight of the nine work today." (also wrong — typeHierarchy works with the fork); `docs/kilo-vs-jarvis-indexing.md:20` "**9 tools** (`server.py:294-505`)" (line ref also stale); `docs/kilo-vs-jarvis-indexing.md:124` "9 MCP tools"; `docs/project-overview-pdr.md:36` "**9 MCP tools:**" + 9-name list; `docs/project-overview-pdr.md:108` "all 9 tools return correct results".

**Historical milestone records (accurate for their date, not user-facing):** `docs/project-roadmap.md:14` "9 tools registered"; `docs/project-roadmap.md:47` "All 9 MCP tools"; `docs/project-roadmap.md:63` "all 8 MCP nav tools"; `docs/project-overview-pdr.md:32` "All 9 nav tools … Swift". Terminology drift: `docs/project-overview-pdr.md:34` says two Java/Kotlin cases "fall back to `--search-only`" — that flag no longer exists (`index_cli.py:1958`); behavior is now automatic exit-0 degradation (`index_cli.py:107-115`). Archival specs/plans under `docs/superpowers/` also say 8/9/nine (e.g. `docs/superpowers/plans/2026-08-02-codex-plugin.md:122`) — historical, not user-facing.

## Unknowns
- `docs/system-architecture.md:5` enumeration truncated in capture (`…blastRadius, i…`); "10" stated correctly but the final listed name being exactly `indexRepo` not verbatim-confirmed.
- Tool-count sweep used `\b(nine|ten|9|10|11)\s+(MCP\s+)?tools` plus a `tools…\d` variant; unusually phrased counts could have been missed.
- `setup.sh`'s `install_jarvis_mcp` `--from` floor not read this pass.
- uv.lock self-referential version entry not inspected.
- Exact stderr/exception text when `zoekt-webserver` is missing for `searchCode`: returns `{"error": str(exc)}` (`server.py:723-725`) but message text not captured; semantic side degrades silently (`server.py:745-750`).

[You have received this identical output 4 times. Re-reading 'agent://ServerRealityScout?q=.report' will not change it — use a narrower selector (path:A-B), or proceed with the edit.]

---

## B. jarvis-index plugin + skills surface audit

# Plugin & Skills Surface Audit — jarvis-index (read-only)


Scope: `plugin/**`, `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `plugin/README.md`, CI.
Real tool set (source of truth `/Users/ddphuong/Projects/jarvis-ai/jarvis/src/jarvis/server.py`): 10 MCP tools — documentSymbols (:416), goToDefinition (:439), findReferences (:461), callHierarchy (:483), typeHierarchy (:505), getIndexStatus (:567), indexRepo (:594), searchCode (:708), semanticSearch (:767), blastRadius (:788).

## 1. Skills inventory

### plugin/skills/jarvis-setup/ — files: `SKILL.md` (~96 lines), `agents/openai.yaml`
- Frontmatter (SKILL.md:1-4) verbatim: `name: jarvis-setup` / `description: Install and configure jarvis, the local-first structural code intelligence with an always-on Tree-sitter syntax baseline. Use when onboarding, running setup.sh, registering the MCP server, or indexing a repo for the first time.` / `version: "0.1.0"`
- Headings: `# jarvis setup` (:7), `## 1. Check prerequisites` (:13), `## 2. Install jarvis + external binaries` (:19), `## 3. Register the MCP server` (:35), `## 4. Index a repo` (:61), `## 5. Verify` (:73), `## 6. Troubleshooting` (:81), `## 7. Next` (:94)
- Instructs: zero→querying in order — check OS/uv/PATH (:15-17); install via `curl …/main/setup.sh | sh` (:22) which installs scip fork ("upstream v0.9.0 plus scip#465 fix", :27), zoekt, per-language SCIP indexers, and pre-warms `uv tool install jarvis-mcp` (:25,33); plugin users skip manual MCP registration — Codex/Claude read `plugin/.mcp.json`, Cursor `plugin/mcp.json` (:37); manual `codex/claude mcp add` + Cursor JSON (:39-58); index CLI w/ `--slug/--no-scip/--scheme` (:63-67); verify via `jarvis status` + first calls `documentSymbols`/`goToDefinition`, then `getIndexStatus(...).capabilities.tools` (:75-79); 8-row troubleshooting table (:83-92); pointer to siblings (:94-96).

### plugin/skills/jarvis-use/ — files: `SKILL.md` (~76 lines), `agents/openai.yaml`, `references/tool-roster.md` (~49 lines)
- Frontmatter (SKILL.md:1-4) verbatim: `name: jarvis-use` / `description: "Use jarvis local-first code intelligence for code structure queries: Tree-sitter declaration outlines and definition navigation, SCIP references and hierarchies, natural-language semantic search, and status capability checks. Prefer over grep for indexed structural questions."` / `version: "0.1.0"`
- Headings: `# jarvis everyday use` (:7), `## Decision matrix` (:11), `## Symbol format` (:28), `## The prefer-jarvis rule` (:43), `## Gotchas` (:55), `## Trigger examples (lightweight validation)` (:73)
- Instructs: prefer jarvis over grep for structural questions on indexed repos; 10-row question→tool matrix (:17-26); symbol format — bare/qualified/full-SCIP/`syntax:` ids, ambiguity returns `candidates` (:30-39); on-demand load of tool-roster via `grep -nA20 "## Tool detail" references/tool-roster.md` (:41); 5-step prefer-jarvis rule — getIndexStatus w/ repo_path → reindex/indexRepo → per-tool `capabilities.tools` (:45-53); 11 gotchas (:57-71) incl. SCIP-only refs/hierarchies (:59), patched-scip requirement (:60), separate `jarvis-semantic` server for the semantic extra (:63-67), blastRadius indexed-only (:69), `{"error": ...}` convention (:70); trigger/negative-trigger examples (:75-76).

### plugin/skills/jarvis-issues/ — files: `SKILL.md` (~75 lines), `agents/openai.yaml`
- Frontmatter (SKILL.md:1-4) verbatim: `name: jarvis-issues` / `description: Report bugs and request features for the jarvis MCP server via GitHub issues. Use when jarvis errors, an index fails, a limitation bites, or to request an improvement.` / `version: "0.1.0"`
- Headings: `# jarvis issues` (:7), `## 1. Gather context first` (:13), `## 2. Classify — and check known limitations` (:23), `## 3. Draft the issue` (:35), `## 4. File via gh — confirm before submitting` (:63), `## 5. After filing` (:73)
- Instructs: file only against `jarvis-intelligence/jarvis-index` (:11); gather command/`jarvis status`/tool-args/error payload/version via `uv run --with jarvis-mcp` metadata read/OS-arch (:15-21); classify against 5 documented limitations (typeHierarchy unpatched scip :27, `config.py` single-tenant pins :28, one-language-per-repo :29, blastRadius freshness :30, Windows :31); bug+feature templates (:37-60); `gh issue create --repo jarvis-intelligence/jarvis-index` with mandatory user confirmation, `gh auth login` fallback (:65-70); report URL + suggest workaround (:75).

- `agents/openai.yaml` ×3 (5 lines each): Codex UI metadata only — `interface.display_name` ("jarvis Setup"/"jarvis Navigation"/"jarvis Issues"), `short_description`, `default_prompt` referencing `$jarvis-setup`/`$jarvis-use`/`$jarvis-issues`.

## 2. Tool-name matrix (✓ = exact camelCase name appears)

| Tool | setup SKILL.md | use SKILL.md | issues SKILL.md | tool-roster.md |
|---|---|---|---|---|
| documentSymbols | ✓ :79 | ✓ :21,:38,:50 | — | ✓ :7 |
| goToDefinition | ✓ :79 | ✓ :17,:30,:50 | — | ✓ :11 |
| findReferences | ✓ :29,:88 | ✓ :18,:51,:59 | ✓ :18 | ✓ :15 |
| callHierarchy | ✓ :29,:88 | ✓ :19,:51,:59 | — | ✓ :19 |
| typeHierarchy | ✓ :27,:29,:88,:89 | ✓ :20,:51,:59,:60 | ✓ :27 | ✓ :23 |
| getIndexStatus | ✓ :79,:88 | ✓ :22,:23,:47,:48 | — | ✓ :26 |
| indexRepo | — | ✓ :22,:23,:48 | — | ✓ :31 |
| searchCode | — | ✓ :25,:26,:53,:76 | — | ✓ :35 |
| semanticSearch | ✓ :31 | ✓ :26,:62 | — | ✓ :39 |
| blastRadius | — | ✓ :24,:69 | ✓ :30 | ✓ :43 |

- Mentioned-but-not-real: **none** — every mentioned name is a registered tool.
- Real-but-never-mentioned anywhere: **none** (roster covers all 10).
- Per-skill gaps: setup never mentions `indexRepo`/`searchCode`/`blastRadius` (CLI-centric; note `indexRepo` is the `recoveryTool` named in miss errors — unknown to an agent using only jarvis-setup); jarvis-issues mentions only 3/10.
- Lowercase prose-only: setup :96 ("find references, go-to-definition, call hierarchy") — not exact names.
- Snake_case confusion: use :75 trigger examples use `index_repo`/`blast_radius` (Python fn names) while MCP names are camelCase — minor.
- Unverified-here: issues :28 cites server internals (`config.py` pins `PROJECT = "_"`/`BRANCH = "_"`) — truth owned by server-repo audit.

## 3. Version strings & URLs (plugin tree + plugin/README.md)

- `"version": "0.9.0"`: plugin/.claude-plugin/plugin.json:3; plugin/.cursor-plugin/plugin.json:4; .codex-plugin/plugin.json:3.
- `jarvis-mcp>=0.9.0` pins: plugin/mcp.json:7, plugin/.mcp.json:7, plugin/README.md:74,75,82, setup SKILL.md:85, use SKILL.md:65,66.
- scip "v0.9.0" upstream refs (unrelated to plugin version): setup :27, use :60, tool-roster.md:24.
- Skill frontmatter versions: `"0.1.0"` ×3 (SKILL.md:4 each) — decoupled from plugin 0.9.0.
- Tag-pinned URLs: .codex-plugin/plugin.json:39 `…/blob/v0.9.0/plugin/README.md#privacy`, :40 `…/blob/v0.9.0/plugin/LICENSE`.
- **STALE/DEAD: no `v0.9.0` tag exists upstream.** GitHub tags = `v0.8.0` (2026-09-10), `v0.7.3` (2026-08-23), `zoekt-33f1f18af292`, `scip-56791658a873`; direct fetch of `blob/v0.9.0/plugin/README.md` → HTTP 404. Both URLs dead; latest public tag (v0.8.0) also lags manifest 0.9.0.
- main/branch-pinned: setup SKILL.md:22 `https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh`; plugin/README.md:31 `codex plugin marketplace add … --ref main`.
- Unpinned repo URLs (mutable default branch): claude plugin.json:9-10; cursor plugin.json:10-11; codex plugin.json:8,10,11,38; plugin/README.md:54,60,92,94.
- External: setup :16 `https://docs.astral.sh/uv/`; setup :29 live-site `https://jarvis-intelligence.github.io/jarvis-index/docs/guide/requirements/`; plugin/README.md:93 PyPI history.
- Asset refs (paths, all exist): cursor :13 `assets/app-icon.png`; codex :42 `./plugin/assets/jarvis-small.svg`, :43 `./plugin/assets/app-icon.png`.
- Adjacent same-class drift (outside declared scope, flagging): repo-root README.md:20 says "Nine MCP tools" with a 9-row table lacking `indexRepo` (confirmed on GitHub too).

## 4. Structural inventory — what the plugin does / does not ship

Ships: 3 skills (SKILL.md each); 3 × `agents/openai.yaml` (Codex interface stubs); 1 × `references/tool-roster.md` (jarvis-use only); MCP configs plugin/mcp.json (Cursor) + plugin/.mcp.json (Codex/Claude); manifests plugin/.claude-plugin/plugin.json, plugin/.cursor-plugin/plugin.json, root .codex-plugin/plugin.json, root .claude-plugin/marketplace.json, root .cursor-plugin/marketplace.json; plugin/README.md (~95 lines); plugin/LICENSE (MIT); plugin/assets/{app-icon.png, jarvis-small.svg}.
Absent capabilities (explicit):
- NO `commands/` (no slash commands; no `commands` field in any manifest).
- NO `hooks/` (no lifecycle hooks; no `hooks` field).
- NO Claude Code subagent definitions (agents/ holds only Codex openai.yaml stubs; no `*.md` agents).
- NO plugin-local marketplace.json (marketplaces at repo root — correct for single-plugin repo, stated for completeness); NO `.codex-plugin/marketplace.json` (Codex registers by repo URL, README.md:31).
- NO `version` field in either marketplace.json.
- NO references/ for jarvis-setup or jarvis-issues; no root `.mcp.json` for non-plugin users (manual `mcp add` documented).

## 5. Manifest cross-check

- Version agreement: all three plugin.json = "0.9.0" (claude:3, cursor:4, codex:3) — AGREE. Both marketplace.json have NO version field — agreement not assertable.
- `plugin/.mcp.json` vs `plugin/mcp.json`: byte-identical (identical 13-line JSON via raw read; both 205B; enforced by check-manifests.mjs:53-63).
- Description divergence (same product, 4+ wordings):
  - claude plugin.json:4 "…skills that teach **Claude** to prefer structural queries over grep." vs cursor :5 and codex :4 "…teach **the agent**…" — Claude variant differs.
  - marketplace metadata: claude :4 "…for **Claude Code** — SCIP navigation…" vs cursor :8 "…for **Cursor** — …" (client interpolation, intentional-looking).
  - marketplace plugins[].description (both :14): "SCIP navigation and Zoekt search MCP server, plus skills for setup, everyday structural queries, and bug reporting." — third wording.
  - codex shortDescription :24 / longDescription :25 — longDescription contains **stale "through nine MCP tools"** (live server: 10).
- Field asymmetries: cursor-only — displayName:3, logo:13, category:14, tags:23, skills:30 (`./skills/`), mcpServers:31 (`./mcp.json`). codex-only — author.url:8, skills:21 (`./plugin/skills/`, repo-root-relative vs cursor's plugin-root-relative), whole `interface` block :22-45 (incl. privacyPolicyURL/termsOfServiceURL :39-40, composerIcon/logo :42-43, screenshots :44). claude plugin.json is the minimal set (name/version/description/author/homepage/repository/license/keywords). marketplace key order differs (claude name→metadata→owner; cursor name→owner→metadata) — cosmetic.

## 6. CI guarding the plugin

- `.github/workflows/checks.yml` ("Manifest checks", :1-45): push/PR→main, path-filtered to plugin/**, .codex-plugin/**, .claude-plugin/**, .cursor-plugin/**, the script, itself (:5-23); runs `node scripts/check-manifests.mjs` (:41-43).
- `scripts/check-manifests.mjs` asserts exactly: (1) 3 plugin.json parse as JSON (:19-35; MANIFEST_PATHS :7-11); (2) equal `version` across those 3 (:38-50); (3) plugin/.mcp.json byte-identical to plugin/mcp.json (:53-63).
- `.github/workflows/deploy-pages.yml`: site-only (path filter :6-14); runs `scripts/verify-build.mjs` — V2 URL-contract set equality, V3 asset resolution (landing+docs home only), V4 font self-hosting, V5 pagefind, V9 sitemap resolution, V10 llms.txt links (header :1-18) — plus live smoke probe (asset 200s, sitemap locs, deep loc :57-86). Nothing touches plugin/.
- `scripts/claims-audit.py`: manual CSV claim extractor; defaults src/pages/index.astro + 2 docs files (:69-73); plugin not covered; not CI-gated.
- `scripts/crawl-urls.sh`: manual live-site crawl (contract + 34 legacy URLs + sitemap equality); site-only; no workflow invokes it.
- package.json scripts: `check:manifests`, `verify` aliases (:9-12).

## Not caught by CI
1. `.codex-plugin/plugin.json:25` "through nine MCP tools" vs 10 live tools — check-manifests compares only `version` fields; descriptions unguarded.
2. Dead tag-pinned URLs codex :39-40 (`blob/v0.9.0/…`) — tag doesn't exist upstream; no check validates embedded URLs vs manifest version/tag existence.
3. Description divergence across manifests (claude "teach Claude" vs others "teach the agent"; marketplace vs plugin wordings) — unguarded.
4. Both marketplace.json entirely unchecked (not in MANIFEST_PATHS): no parse, no version, no source-path validation.
5. Skill frontmatter `version: "0.1.0"` ×3 never tracks plugin 0.9.0; the "bump all three manifests" convention (root README) doesn't cover skills, and no check relates them.
6. `jarvis-mcp>=0.9.0` pin inside the MCP configs — pair byte-identity IS checked; pin ↔ manifest-version ↔ PyPI-latest agreement is NOT.
7. Skills/tool-roster ↔ server tool-list drift (the class that produced #1) — no check diffs tool-roster.md against server registrations.
8. plugin/README.md:3 "ten MCP tools and three agent skills" — no check reads README; root README.md:20 still says "Nine MCP tools" (no indexRepo row) — unguarded.
9. Skills ↔ setup.sh consistency (flags `--only/--force/--help` setup :25, `--only zoekt` :87); setup.sh absent from checks.yml path filter — installer claims unvalidated.
10. Live-site docs link setup :29 (`…/docs/guide/requirements/`) — crawl-urls.sh could catch rot but is manual-only.
11. Asset refs (cursor :13, codex :42-43) exist today; no check keeps referenced plugin assets alive.

---

## C. Plugin/skill best-practice audit vs official docs

# Plugin & skill best-practice audit — jarvis-index (research date 2026-09-11)


Scope: `plugin/` tree + root manifests of `/Users/ddphuong/Projects/jarvis-ai/jarvis-index` vs official Claude Code / Cursor / Codex plugin + skill docs. Repo layout: plugin root is `plugin/` (manifest `plugin/.claude-plugin/plugin.json:2`, `plugin/.cursor-plugin/plugin.json:2`); Codex overlay sits at repo root (`.codex-plugin/plugin.json:2`); marketplaces at repo root (`.claude-plugin/marketplace.json:2`, `.cursor-plugin/marketplace.json:2`).

## 1. Official manifest schemas (per target)

### Claude Code
- Manifest `.claude-plugin/plugin.json`: optional; if present, `name` (kebab-case) is the only required field. Optional: `displayName`, `version`, `description`, `author{name,email,url}`, `homepage`, `repository`, `license`, `keywords`, `metadata`, `defaultEnabled`, path fields `skills`/`commands`/`agents`/`hooks`/`mcpServers`/`lspServers`/`outputStyles`/`experimental.{themes,monitors}`/`userConfig`/`channels`/`dependencies`, `$schema`. https://code.claude.com/docs/en/plugins-reference ("Plugin manifest schema")
- Unrecognized top-level fields are ignored; `claude plugin validate` warns (errors with `--strict`). Wrong-typed recognized fields fail load. Same source.
- Directory conventions: skills `skills/<name>/SKILL.md` (or `commands/*.md`, or single root `SKILL.md`); agents `agents/*.md` (frontmatter `name,description,model,effort,maxTurns,tools,disallowedTools,skills,memory,background,isolation`; `hooks`/`mcpServers`/`permissionMode` NOT supported in plugin agents); hooks `hooks/hooks.json`; MCP `.mcp.json` (plugin root); LSP `.lsp.json`; monitors `monitors/monitors.json`. https://code.claude.com/docs/en/plugins-reference
- Marketplace `.claude-plugin/marketplace.json` at repo root: required `name` (kebab-case, reserved-names list enforced), `owner{name}`, `plugins[]`; entry required `name` + `source` (relative path must start `./`, resolves from marketplace root, no `../`); optional entry fields incl. `category`, `tags`, `strict`, `displayName`, `defaultEnabled`. https://code.claude.com/docs/en/plugin-marketplaces

### Cursor
- Cursor Plugin manifest `.cursor-plugin/plugin.json`: required only `name` — "Lowercase, kebab-case (alphanumerics, hyphens, and periods). Must start and end with an alphanumeric character." Optional: `description`, `version`, `author{name,email}`, `homepage`, `repository`, `license`, `keywords`, `logo` (relative, resolved via raw.githubusercontent.com), `rules`, `agents`, `skills`, `commands`, `hooks`, `mcpServers`, `variables`. https://cursor.com/docs/reference/plugins
- Auto-discovery defaults: `skills/` (subdirs with SKILL.md), `rules/*.mdc`, `agents/*.md`, `commands/*.{md,mdc,markdown,txt}`, `hooks/hooks.json`, `mcp.json`, root `SKILL.md` fallback; a manifest path field REPLACES folder discovery for that component. Same source.
- Skill/agent/command frontmatter: `name` + `description` (kebab-case). Rules `.mdc` need `description`/`alwaysApply`/`globs`. Same source.
- Marketplace manifest `.cursor-plugin/marketplace.json` at repo root: required `name` (kebab-case), `owner{name}`, `plugins[]` (max 500); entry supports `category`, `tags`, component paths; resolution merges per-plugin manifest over entry. Submission = manual review via https://cursor.com/marketplace/publish; checklist: valid manifest, unique kebab-case name, clear `description`, valid component frontmatter, logo committed + relative path, `README.md` documents usage, all manifest paths relative (no `..`, no absolute), variables declared, tested locally. https://cursor.com/docs/reference/plugins (Submitting a plugin / Submission checklist) and https://cursor.com/docs/plugins
- Cursor also loads the Agent Plugins open standard (root `plugin.json` + `$schema https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`, skills + MCP only): https://cursor.com/docs/plugins (The Agent Plugins standard)

### Codex (OpenAI)
- Recommended portable layout: root `plugin.json` with `$schema https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`, `name` (stable kebab-case), `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`; fixed component paths `skills/` (plugin root) and root `mcp.json` (Agent Plugins MCP schema, transport `type` declared); OpenAI-specific presentation in `extensions.com.openai` (`apps` → `.app.json`, `hooks`, `interface{displayName, shortDescription, longDescription, developerName, category, capabilities, websiteURL, privacyPolicyURL, termsOfServiceURL, defaultPrompt, brandColor, composerIcon, logo, screenshots}`). `.codex-plugin/plugin.json` remains a supported legacy compatibility fallback; keep only `plugin.json` inside `.codex-plugin/`. https://developers.openai.com/plugins/build/plugins
- Skill MCP dependencies declared in the skill's `agents/openai.yaml` (`dependencies.tools`): https://developers.openai.com/plugins/build/skills
- Distribution: `codex plugin marketplace add owner/repo`; repo marketplace `$REPO_ROOT/.agents/plugins/marketplace.json` (legacy-compatible: `$REPO_ROOT/.claude-plugin/marketplace.json`); entry needs `name`, `source.path` (`./`-prefixed, inside marketplace root), `policy{installation,authentication}`, `category`. Public universal directory requires the submission portal; "For public submission, submit the remote HTTPS endpoint through With MCP. If your MCP server runs locally, deploy it to a public HTTPS URL." https://developers.openai.com/plugins/build/plugins
- Validator error catalog (blocking): https://developers.openai.com/plugins/deploy/submission-errors (see §5)

### MCP spec (client-facing)
- Local stdio servers serve a single client per host connection; remote = Streamable HTTP; host spawns one MCP client per configured server — the model behind `command`/`args` server entries in all three ecosystems. https://modelcontextprotocol.io/docs/learn/architecture (2026-07-28)

## 2. Official skill-authoring guidance
- Frontmatter contract (Agent Skills spec): required `name` (≤64 chars, lowercase alnum + hyphens, no leading/trailing/double hyphen, MUST match parent directory name) and `description` (1–1024 chars, what + when). Optional: `license`, `compatibility` (≤500 chars), `metadata` (string→string map), `allowed-tools` (experimental). https://agentskills.io/specification
- Claude Code extends: `when_to_use`, `argument-hint`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `model`, `effort`, `context: fork`, `paths`, `hooks`; combined `description`+`when_to_use` truncated at 1,536 chars in listings; plugin skills invoke as `/plugin-name:skill-name` (frontmatter `name` overrides the last segment). https://code.claude.com/docs/en/skills (Frontmatter reference)
- Description rules (drive discovery): state what + when with concrete trigger terms; third person ("Processes…", never "I can…" / "You can…"); avoid vague ("Helps with documents"). https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ; Codex: "The description determines when the model considers the skill." https://developers.openai.com/plugins/build/skills
- Progressive disclosure: metadata (~100 tokens) at startup → SKILL.md body (<5,000 tokens recommended, under 500 lines) → `references/`, `assets/`, `scripts/` loaded on demand; reference files one level deep; reference them from SKILL.md with when-to-load notes. https://agentskills.io/specification ; https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ; https://code.claude.com/docs/en/skills (Add supporting files)
- Anti-patterns: verbose/over-explaining bodies, first-person descriptions, vague names (`helper`, `utils`), reserved words (`anthropic`, `claude`), inconsistent naming across a collection; untested activation. https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ; Codex 5-case activation test matrix: https://developers.openai.com/plugins/build/skills

## 3. Gap table (capability → ships? → docs recommendation → value for jarvis users)

| Capability | jarvis-index today | Docs say | Value for jarvis |
|---|---|---|---|
| Slash commands (`commands/`) | Absent (`plugin/` contains only `skills/`, `assets/`, two manifests, README, LICENSE, mcp.json/.mcp.json — full glob) | Claude `commands/*.md`, Cursor `commands/*.md` auto-discovered (§1 sources) | `/jarvis:index <path>` + `/jarvis:status <slug>` = deterministic entry points matching `interface.defaultPrompt` (`.codex-plugin/plugin.json:33-37`); no reliance on the model choosing `jarvis-use` |
| Plugin agents (`agents/`) | Absent at plugin root (only per-skill Codex `agents/openai.yaml`: `plugin/skills/jarvis-use/agents/openai.yaml:1-4`, also in jarvis-setup, jarvis-issues) | Claude `agents/*.md` subagents; Cursor `agents/*.md` (§1) | A `jarvis-navigator` subagent could run multi-hop navigation (goToDefinition → callHierarchy → blastRadius) off the main thread |
| Hooks | Absent everywhere | Claude `hooks/hooks.json` (SessionStart, PreToolUse…), Cursor `hooks/hooks.json` (`sessionStart`), Codex `hooks/hooks.json` (§1) | SessionStart hook running `jarvis status` warns on stale/missing index deterministically instead of trusting the skill's manual rule (`plugin/skills/jarvis-use/SKILL.md:43-53`) |
| `$schema` in manifests | Absent in all three (`plugin/.claude-plugin/plugin.json:1-20`, `plugin/.cursor-plugin/plugin.json:1-32`, `.codex-plugin/plugin.json:1-46`) | Documented optional for Claude (`https://json.schemastore.org/claude-code-plugin-manifest.json`); shown by example for Agent Plugins (plugins-reference; build/plugins) | Editor validation; cheap |
| Progressive disclosure | Partial: `jarvis-use` has `references/tool-roster.md` (cited at `plugin/skills/jarvis-use/SKILL.md:41`); setup/issues self-contained | Recommended pattern (§2) | Already good; `jarvis-setup`'s 10-row troubleshooting table (`plugin/skills/jarvis-setup/SKILL.md:81-92`) is the next candidate to split into `references/troubleshooting.md` |
| Description quality | Good: all three state what + when (`plugin/skills/jarvis-setup/SKILL.md:3`, `jarvis-use/SKILL.md:3`, `jarvis-issues/SKILL.md:3`) | §2 rules | None needed |
| Body size | 96 / 76 / 75 lines (grep `^` line counts) — far under the 500-line cap | §2 | None needed |
| Activation tests | `jarvis-use` ships trigger/anti-trigger examples (`jarvis-use/SKILL.md:73-76`) | Codex 5-case test matrix (§2) | Matches docs; keep |

## 4. Ranked additions (value × effort)

1. **Fix Codex `longDescription` "nine MCP tools" → "ten"** — `.codex-plugin/plugin.json:25` vs ground truth `plugin/README.md:3` ("exposing ten MCP tools") and `plugin/skills/jarvis-use/references/tool-roster.md:3` ("The 10 MCP tools"). Install-surface copy misdescribes the product. Effort **S**.
2. **SessionStart hook warning on stale/missing index** (Claude + Cursor + Codex `hooks/hooks.json`) — `getIndexStatus` already returns `stale`/`freshness` (`references/tool-roster.md:26-29`); a hook makes the skill's prefer-jarvis rule (SKILL.md:45-48) enforced rather than aspirational. Effort **M**.
3. **Add `/jarvis:index` + `/jarvis:status` slash commands** (`plugin/commands/`) — direct, discoverable entry points; Codex `defaultPrompt` already promises "Index this repo for code navigation" (`.codex-plugin/plugin.json:36`). Effort **S**.
4. **Add a plugin-root `jarvis-navigator` agent** (Claude/Cursor `agents/`) — dedicated subagent for architecture questions; a documented component the plugin doesn't use. Effort **M**.
5. **Resolve the Codex plugin-root split (see §5 + §6)** — either a portable root `plugin.json` with `extensions.com.openai` inside `plugin/`, or an overlay at `plugin/.codex-plugin/plugin.json`; today the repo-root overlay's `"skills": "./plugin/skills/"` (`.codex-plugin/plugin.json:21`) assumes plugin root = repo root, while both marketplaces point at `./plugin` (`.claude-plugin/marketplace.json:13`, `.cursor-plugin/marketplace.json:13`). Effort **M**.
6. **Drop off-spec `version` frontmatter from all three SKILL.md** (`jarvis-issues/SKILL.md:4`, `jarvis-setup/SKILL.md:4`, `jarvis-use/SKILL.md:4`) — not in the Agent Skills spec field set (agentskills.io/specification); move under `metadata.version` (spec-sanctioned). Effort **S**.
7. **Add `$schema` to the three manifests** (§3). Effort **S**.

## 5. Hard constraints / validator rules the tree risks violating

- **Cursor submission checklist** (https://cursor.com/docs/reference/plugins): unique kebab-case `name` ✓ (`.cursor-plugin/plugin.json:2`); all manifest paths relative, no `..` ✓ (`"skills": "./skills/"`:30, `"mcpServers": "./mcp.json"`:31, `"logo": "assets/app-icon.png"`:13 — all inside `plugin/`); logo committed ✓ (`plugin/assets/app-icon.png`); README present ✓ (`plugin/README.md:24-93`). `plugins[]` max 500 ✓ (`.cursor-plugin/marketplace.json:10-16`).
- **Codex validator** (https://developers.openai.com/plugins/deploy/submission-errors): `plugin_name_format` ✓ "jarvis"; `plugin_version_not_semver` ✓ "0.9.0"; description ≤1024 ✓; `interface.shortDescription` ≤240 ✓ (48 chars, `.codex-plugin/plugin.json:24`); `longDescription` ≤4000 ✓; `plugin_category_unknown` — allowed list includes exactly "Developer Tools" ✓ (:27); `plugin_capabilities_*` — free-form strings ≤120 chars, so "Interactive" (:29) passes (no enum); `defaultPrompt` ≤3 ✓ (:33-37); `brandColor` six-digit hex ✓ ("#3B82F6", :41); listing URLs HTTPS ✓ (:38-40). `plugin_skills_path_unsupported` ("`skills` must resolve to the root `skills/` directory") is the live risk for the overlay's `"./plugin/skills/"` (:21) whenever the plugin root is the repo root (§6). Also: privacy/terms URLs are pinned to the `v0.9.0` tag (:39-40) — legal for validation but will serve stale copy after the next release unless bumped; the `#privacy` anchor exists (`plugin/README.md:86`).
- **Claude Code**: `name` kebab-case ✓; marketplace `name` "jarvis" not in the reserved list ✓ (reserved-names list, plugin-marketplaces); entry `source: "./plugin"` starts `./` ✓ (`.claude-plugin/marketplace.json:13`). Unrecognized fields only warn unless `claude plugin validate --strict` (plugins-reference).
- **Codex public directory**: local stdio MCP is not submittable — "submit the remote HTTPS endpoint… deploy it to a public HTTPS URL" (build/plugins). jarvis is local-first stdio (`plugin/mcp.json:4-10`), so the universal-directory route is closed until a remote endpoint exists; marketplace/CLI distribution remains the supported path.
- **claude.ai / Agent Skills packaging**: unexpected SKILL.md frontmatter keys are a hard error ("Unexpected key(s) in SKILL.md frontmatter… Allowed properties are: allowed-tools, compatibility, description, license, metadata, name") — `version` (all three SKILL.md:4) would block any future claude.ai/Skills-API packaging (code.claude.com/docs/en/skills; agentskills.io/specification). Plugin-scope loading is a separate, undocumented path (§6).

## Ambiguous or undocumented
- **Two competing Codex plugin roots.** The repo-root overlay (`.codex-plugin/plugin.json`) vs marketplace `source: "./plugin"`: for marketplace installs the plugin root is `plugin/`, putting the repo-root overlay outside the loaded plugin; whether Codex then reads `plugin/.claude-plugin/plugin.json` (which has no `interface`) and applies `claude_format_normalized` defaults (submission-errors documents this for the ZIP path only) is not documented. Unverified — needs a live `codex plugin marketplace add` test.
- **Unknown-field tolerance in SKILL.md frontmatter** for plugin-scope loading on all three clients: docs specify a hard error only for claude.ai/Skills-API packaging; Claude Code / Cursor / Codex plugin behavior for extra keys like `version` is undocumented.
- **Cursor `plugin.json` extra fields**: `displayName` (:3), `category` (:14), `tags` (:23-29) are not in the documented plugin.json field tables (they appear only as marketplace-entry fields); rejection behavior unknown.
- **Codex `agents/openai.yaml` schema**: jarvis ships `interface{display_name, short_description, default_prompt}` (`plugin/skills/jarvis-use/agents/openai.yaml:1-4`); official docs document `dependencies.tools` in that file (build/skills) and the validator requires `.display_name` (submission-errors), but the `interface:` nesting jarvis uses is not shown in official docs — unverified.
- **Which mcp.json Codex reads**: `jarvis-setup/SKILL.md:37` claims "Codex and Claude Code read `plugin/.mcp.json`"; OpenAI docs document root `mcp.json` for portable packages and say nothing about `.mcp.json` for Claude-compatible legacy packages. Both files exist and are identical today (`plugin/mcp.json:1-14` = `plugin/.mcp.json:1-14`); drift between them is the practical risk.

[You have received this identical output 3 times. Re-reading 'agent://PluginBestPracticeScout?q=.report' will not change it — use a narrower selector (path:A-B), or proceed with the edit.]
