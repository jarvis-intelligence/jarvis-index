# Phase 2: Docs Rebuild — Tutorial-First Content - Research

**Researched:** 2026-08-21
**Domain:** Docs content authoring on Astro 5 + Starlight 0.37.7 with a committed URL contract; product-truth extraction from the private `../jarvis/` repo (0.6.2)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Page classification & brand-logo.html
- **D-01:** `brand-logo.html` is classified **keep** — it stays a public URL in `design/url-contract.json`, but its Google Fonts CDN links are replaced with self-hosted fonts so the site-wide zero-third-party-font claim finally holds everywhere (closes WINDOWS.md id 4 and removes the `verify-build.mjs` V4 exclusion for this file).
- **D-02:** Default stance for the 32 existing docs pages is **keep all, deepen in place** — the current IA (guide/concepts/mcp-tools/cli/integrations/troubleshooting) is sound; no URL churn, no redirect surface beyond what classification genuinely flags. — **Reversibility:** costly — reorganizing later means new redirects, url-contract edits, and inbound-link risk after Phase 5's crawl baseline.
- **D-03:** No pre-known merges/retires beyond brand-logo.html's font fix. The classification pass (plan 02-01) still audits each page against `design/url-contract.json` and flags anything genuinely redundant for user confirmation before retiring — retire is never silent.
- **D-04:** The 404 page is a **lookup table + nav**: retired/renamed URL → new location (derived from url-contract history), plus a link into the docs nav. Not a bare generic 404.

#### Reference content depth & voice
- **D-05:** Tool-page request→response examples come from **real transcripts** in the private `../jarvis/` repo (test suite, README) — including real edge shapes like the ambiguous-symbol `candidates` list. No invented example payloads. — **Reversibility:** reversible, but drift risk is the whole reason: illustrative examples were rejected because they rot against actual tool output.
- **D-06:** Reference voice is **terse**: signature, params table, one example, done. Optimized for scanning; matches the existing quickstart's direct tone.
- **D-07:** DOCS-10's inline "you'll know it works when…" success/failure shapes apply to the **quickstart only**. Tool reference pages' success/failure shape is the `{"error": ...}` contract itself (DOCS-04) — no extra callouts across the 9 pages.
- **D-08:** `semanticSearch`'s `[semantic]` extra + second-MCP-server requirement gets a **prominent caveat box at the top** of its reference page — consistent with the landing page and `jarvis-use` skill, which present it as a settled decision, never a TODO.

#### Install-channel primacy
- **D-09:** The quickstart's primary path leads with the **`setup.sh` curl** command — client-agnostic, matches the landing CTA. The quickstart stays a single linear path: why → setup.sh → `jarvis index` → register per client → first tool call.
- **D-10:** The **four-channel install matrix (DOCS-03) lives on its own page**, not inline in the quickstart. The **MCP Registry deep-link table (DOCS-12) lives on that same matrix page** — the registry is one of the four channels.
- **D-11:** The **generic stdio JSON guide is a full standalone page**, equal footing with Claude Code / Cursor / Codex CLI (DOCS-02 names all four as deliverables).

#### Troubleshooting scope & sourcing
- **D-12:** The decision tree is led by the three named failure modes (uvx cold-start, PATH, scip version-gate) and extended by **mining `../jarvis/`'s GitHub issue history** (open + closed) for real recurring failures — grounded in actual support pain, not guessed edge cases.
- **D-13:** Keep the existing **two-page troubleshooting split**: "Common Failures" (user-fixable, symptom → diagnosis → fix) vs "Upstream Issues" (known limitations, not user-fixable). The distinction is structural, not cosmetic.
- **D-14:** **Requirements & Limits is a new dedicated page**, led by the language-support matrix (4 nav families / 10 search-only / per-language caveats); the quickstart links to it immediately before the install step ("check your language is supported") — satisfies DOCS-06's before-install placement while keeping the quickstart linear.
- **D-15:** The changelog page (DOCS-08) mirrors `../jarvis/CHANGELOG.md` **verbatim, in full** — one-time copy per the project's no-sync-mechanism decision; no curation/trimming editorial layer.

### Claude's Discretion
- Exact nav placement of the new pages (install matrix, requirements & limits) within Starlight sidebar groups — keep one-click reachability per DOCS-09.
- Whether the redirects for any 02-01-flagged retires use Astro's `redirects` map or content-level stubs — Phase 1 proved the mechanism (`${BASE}/`-prefixed destinations, meta-refresh stubs); pick per-case.
- `llms.txt` format/generation approach (plan 02-05) — only the sequencing is locked: strictly after content stabilizes.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOCS-01 | Tutorial-first quickstart: why → install → `jarvis index` → register per client → first tool call, expected output shown | Verified real quickstart command sequence (README.md:15-38); verified real `getIndexStatus`/`goToDefinition` response shapes to replace the stub's **wrong** invented shapes (see Product Truth §1); Starlight Tabs `syncKey` for the "register per client" step (Code Examples §4) |
| DOCS-02 | Per-client install guides: Claude Code, Cursor, Codex CLI, generic stdio JSON | Existing 3 integration stubs + new `generic-stdio` page (D-11); canonical registration JSON verified from `plugin/.mcp.json`; plugin install commands verified from README.md:29-37 |
| DOCS-03 | Four-channel install matrix: PyPI, Claude plugin, Codex plugin, MCP Registry | Channel commands verified (README, plugin manifests); new dedicated page per D-10; url-contract + sidebar edits required (Pitfall 1) |
| DOCS-04 | 9 tool reference pages with request→response examples + `{"error": ...}` contract | All 9 response shapes verified line-by-line from `../jarvis/src/jarvis/server.py` + `models.py` + `query.py`; ambiguous-`candidates` transcript verified from `tests/test_server_tools.py:123-127`; **existing stubs and tool-roster.md both carry wrong shapes** (Pitfall 2) |
| DOCS-05 | CLI reference: 7 commands with flags and examples | 6 `jarvis` subcommands + flags verified from `index_cli.py:1118-1177`; 7th command = `jarvis-server` entry point verified from `pyproject.toml:86-88` (see Open Question 1) |
| DOCS-06 | Requirements & limits before install, led by language matrix (4 nav / 10 search-only) | 4 nav families verified from `index_cli.py:34-49` + README:98-102; 10 search-only languages cited from README:100-102; new page per D-14 |
| DOCS-07 | Troubleshooting decision tree led by uvx cold-start, PATH, scip version-gate | All three named modes verified (issue #4 with verified workaround; README PATH guidance; `MIN_SCIP_VERSION` at `index_cli.py:66`); issue mining complete: 3 jarvis-index issues + 1 jarvis issue enumerated (Product Truth §5) |
| DOCS-08 | Changelog page imported from `../jarvis/CHANGELOG.md` | Verified: 400 lines, top entry `[0.6.2] - 2026-08-08`; verbatim copy per D-15; new URL + contract edit |
| DOCS-09 | Additive rebuild: classify all pages; one-click nav for every tool/CLI/troubleshooting page | 33 content files inventoried with byte sizes; all already in the 34-URL contract; sidebar groups in `astro.config.mjs:54-116` cover all reference pages at one click; new pages must join groups + contract in the same commit |
| DOCS-10 | "You'll know it works when…" success/failure shapes inline (quickstart only, per D-07) | Real success shapes + real failure shapes (`{"error": ...}`, `candidates`, search-only explanation, typeHierarchy error text) all verified verbatim (Product Truth §1-2) |
| DOCS-11 | `llms.txt` agent-consumable index, generated strictly last | llmstxt.org format cited; interaction with verify-build V2 resolved: V2 walks only `.html` files, so `llms.txt` must **NOT** be added to url-contract.json (Pitfall 4) |
| DOCS-12 | MCP Registry deep-link table | Registry entry live-verified via API probe (`io.github.jarvis-intelligence/jarvis`); Cursor deeplink format cited from cursor.com docs; Claude Code/Codex have no URL scheme — command equivalents documented (Product Truth §6) |
</phase_requirements>

## Summary

This phase is a **content phase on a locked mechanical foundation**. Phase 1 shipped the machinery (Starlight shell, URL contract + V2 set-equality, redirects mechanism, verify-build assertions); Phase 2 writes ~35 pages of content against it. The research therefore had two jobs: (1) extract verified product truth from the private `../jarvis/` repo so every example payload, flag, and matrix row is real, and (2) map exactly which mechanical edits each content change forces (contract, sidebar, verify-build, redirects).

The single most important finding: **the existing stub pages and even this repo's `tool-roster.md` show response shapes that do not match the actual code**. The real tools spread freshness fields *flat* into the response (`commit`, `generated_at`, `stale`, `freshness`, `checked_at` — not a nested `"freshness": {...}` object), and definition/reference locations are `{path, range: {start: {line, character}, end: {...}}}` — not the stubs' invented `{path, startLine, startColumn}`. D-05 (real transcripts only) exists precisely for this; the verified shapes are quoted verbatim in this document so executors never have to guess. Second finding: the issue mining for D-12 is small but high-value — 4 total issues across both repos, each mapping to a concrete troubleshooting entry with a verified workaround. Third finding: all mechanics Phase 2 needs are either already proven (redirects, contract discipline) or one config-free pattern away (Starlight `404.md`, Tabs via `.mdx`, `llms.txt` as a static `public/` file invisible to V2).

**Primary recommendation:** Execute in the roadmap's 5-plan order; write every JSON example by copying the verbatim shapes in Product Truth §1 (citing this document), make every page ADD ship its url-contract + sidebar edit in the same commit, and keep `llms.txt` out of the contract.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Docs content (35 pages) | Content (`src/content/docs/docs/`) | — | Markdown/MDX pages; Starlight renders |
| Nav / one-click reachability (DOCS-09) | Build config (`astro.config.mjs` sidebar) | — | Sidebar groups are config, not content |
| URL contract & page-set guard | CI assertion (`scripts/verify-build.mjs` V2 ↔ `design/url-contract.json`) | Build config (redirects) | Set-equality fails the build on any drift |
| 404 lookup page (D-04) | Content (`src/content/docs/404.md`) | — | Starlight built-in custom-404 route; excluded from V2 |
| brand-logo font fix (D-01) | Static passthrough (`public/brand-logo.html` + `public/fonts/`) | CI assertion (V4 exclusion removal) | Passthrough files bypass Vite — fonts must be physically copied, not `@import`ed |
| `llms.txt` (DOCS-11) | Static passthrough (`public/llms.txt`) | Optional zero-dep generator script | Non-HTML; invisible to V2's page walk |
| Product truth | Private repo (`../jarvis/` source, tests, issues) | — | Read-only source material; nothing in `../jarvis/` changes |

## Standard Stack

### Core (all already installed — Phase 2 adds ZERO new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 5.18.2 (pinned) | Site builder | Phase 1 foundation [VERIFIED: package.json] |
| `@astrojs/starlight` | 0.37.7 (pinned) | Docs theme, sidebar, 404 route, `Tabs`/`TabItem` components | Phase 1 foundation [VERIFIED: package.json] |
| `@astrojs/mdx` | 4.3.14 (pinned) | `.mdx` pages (needed for Tabs) | Already installed [VERIFIED: package.json] |
| `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/rajdhani` | 5.3.0 | Source of the woff2 files to copy for brand-logo.html self-hosting | Already installed [VERIFIED: package.json + `design/tokens.css:26-29`] |

### Supporting

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `npm run build` + `npm run verify` | V2/V3/V4/V5/V9 dist assertions | Every task commit |
| `gh` CLI | Issue mining already done (results in Product Truth §5) | Only if re-verification needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static hand-authored `public/llms.txt` (or tiny zero-dep node script) | `starlight-llms-txt` community plugin | Plugin adds an unvetted dependency + auto-regeneration this project explicitly rejected (no-sync-mechanism decision); a static file matches the repo's zero-dep script convention. **Recommend: no plugin.** |
| Copying woff2 into `public/fonts/` for brand-logo.html | Referencing `dist/_astro/*.woff2` hashes | Hashes change on every Fontsource bump — passthrough HTML can't track them. **Recommend: copy with stable names.** |
| Keep `rebaseDocsLinks()` rehype plugin | Retire it and author `${BASE}`-prefixed links | Base-prefixed links in content are brittle and ugly; the plugin is proven. **Recommend: keep the plugin**, author docs-root-relative links in trailing-slash form (`/tools/find-references/`) so the rebased URL is canonical with no 301 hop. Retirement stays optional per Phase 1 note. |

**Installation:** none — no new packages.

## Package Legitimacy Audit

No external packages are installed by this phase. All components used (`astro`, `@astrojs/starlight`, `@astrojs/mdx`, Fontsource families) are already pinned in `package.json` from Phase 1.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Product Truth — Verified Facts for Content (read this before writing any example)

### 1. The 9 tool response shapes (VERIFIED from source — supersede stubs AND tool-roster.md)

**Freshness is FLAT, not nested.** Every nav tool spreads the snapshot's fields into the top level of the response:

> `class FreshnessSnapshot:` / `commit: str | None` / `generated_at: datetime | None` / `stale: bool` / `freshness: Freshness` / `checked_at: datetime` [VERIFIED: ../jarvis/src/jarvis/query.py:63-68]

> `class Freshness(StrEnum):` / `FRESH = "fresh"` / `STALE = "stale"` / `UNKNOWN = "unknown"` [VERIFIED: ../jarvis/src/jarvis/models.py:16-19]

So a real response ends with `"commit": "...", "generated_at": "...", "stale": false, "freshness": "fresh", "checked_at": "..."` — **not** `"freshness": { "indexed": true }` as the current stubs show, and **not** `"freshness": {...}` as `plugin/skills/jarvis-use/references/tool-roster.md` claims (that file is wrong on this point too; note it for Phase 4 skill realignment).

**Locations are nested ranges.**

> `class Position:` / `line: int` / `character: int` … `class Range:` / `start: Position` / `end: Position` … `class Location:` / `path: str` / `range: Range` [VERIFIED: ../jarvis/src/jarvis/models.py:23-37]

Definitions/references entries are `{"path": "...", "range": {"start": {"line": N, "character": N}, "end": {"line": N, "character": N}}}` — **not** the stubs' `{"path": ..., "startLine": 42, "startColumn": 6}`.

**Per-tool top-level keys** (all from `../jarvis/src/jarvis/server.py`, each `**_freshness_fields(...)` meaning the five flat fields above):

| Tool | Response keys | Source |
|------|---------------|--------|
| `documentSymbols(repo, path)` | `{"path", "symbols": [{symbol, displayName, kind, range}], +flat freshness}` | [VERIFIED: server.py:174-181 + models.py:48-52] |
| `goToDefinition(repo, symbol)` | `{"symbol", "resolvedSymbol"?, "definitions": [Location], +flat freshness}` | [VERIFIED: server.py:195-200] |
| `findReferences(repo, symbol)` | `{"symbol", "resolvedSymbol"?, "references": [Location], +flat freshness}` | [VERIFIED: server.py:214-219] |
| `callHierarchy(repo, symbol)` | `{"symbol", "resolvedSymbol"?, "incomingCalls": [{symbol: {symbol, displayName, kind}, location: Location}], "outgoingCalls": [...], +flat freshness}` | [VERIFIED: server.py:233-239 + models.py:41-58] |
| `typeHierarchy(repo, symbol)` | success: `{"symbol", "resolvedSymbol"?, "supertypes", "subtypes", +flat freshness}`; unavailable: `{"error": ..., "symbol", +flat freshness}` | [VERIFIED: server.py:261-280] |
| `getIndexStatus(repo, repo_path=None)` | `{"repo", "indexed", "status", +flat freshness, "searchCoverage": {expected, indexed, complete} \| null, "searchCoverageReason"?}` | [VERIFIED: server.py:295-296 + server.py:104-131] |
| `searchCode(query, repo=None)` | `{"query", "hits": [{"repo","path","lineNumber","lineText"}], "total"}` | [VERIFIED: server.py:312-319] |
| `semanticSearch(repo, query, limit=10)` | result entries: `{"repo","filePath","startLine","endLine","symbolName","content","score","sources"}` + optional top-level `"warning"` | entries [VERIFIED: ../jarvis/src/jarvis/semantic.py:364-366, 375]; top-level `query`/`results`/`total` keys [CITED: plugin/skills/jarvis-use/references/tool-roster.md:36] |
| `blastRadius(repo, symbol_or_package)` | `{"repo", "symbolOrPackage", "dependents": [{repo, name, hops}], +flat freshness}` (freshness always `"unknown"`) | [VERIFIED: server.py:381-386 + ../jarvis/src/jarvis/graph.py:83-86] |

**`resolvedSymbol` appears only when resolution changed the input:**

> `"""'resolvedSymbol' appears only when resolution changed the input, so callers passing full SCIP symbols see an unchanged response shape."""` / `return {} if resolved == symbol else {"resolvedSymbol": resolved}` [VERIFIED: server.py:167-172]

### 2. The error contract (VERIFIED — the D-05 "real edge shapes")

**Generic:** every tool returns `{"error": str(exc)}` — proven end-to-end:

> `assert payload == {"error": "boom"}` [VERIFIED: ../jarvis/tests/test_server_tools.py:95]

**Ambiguous symbol** (the `candidates` list D-05 names explicitly) — real transcript for the docs:

```json
{
  "error": "'dup' is ambiguous in toy-repo (2 matches). Retry with a qualifier, e.g. 'a.C.dup'.",
  "candidates": [
    {"symbol": "sym-a", "dottedPath": "a.C.dup", "kind": "METHOD"},
    {"symbol": "sym-b", "dottedPath": "b.D.dup", "kind": "METHOD"}
  ],
  "candidateTotal": 2
}
```

> `assert payload["candidateTotal"] == 2` / `assert payload["candidates"] == [` / `{"symbol": "sym-a", "dottedPath": "a.C.dup", "kind": "METHOD"},` / `{"symbol": "sym-b", "dottedPath": "b.D.dup", "kind": "METHOD"},` / `]` / `assert "definitions" not in payload` [VERIFIED: test_server_tools.py:123-128; error-message template VERIFIED: server.py:149-153 `f"{exc.query!r} is ambiguous in {repo} ({exc.total} matches). Retry with a qualifier, e.g. {hint!r}."`]

**Search-only explanation** (nav tool on a search-only repo):

> `f"{repo} is indexed search-only: it has no SCIP index, so navigation tools cannot answer. searchCode and semanticSearch do work on it. This happens when the language's indexer cannot build the repo — for example an Android/Gradle project."` [VERIFIED: server.py:140-147]

**typeHierarchy unavailable** (verbatim error text for its reference page):

> `"typeHierarchy unavailable for this index: no symbol carries relationship data. This index was built with an unpatched 'scip' (upstream through v0.9.0 never populates global_symbols.relationships — scip#464). setup.sh now installs a fixed build: re-run setup.sh, then 'jarvis reindex <slug>'. Do not read this as 'this type has no supertypes' — it is missing data, not an empty hierarchy."` [VERIFIED: server.py:262-273]

**documentSymbols real transcript material:** the synthetic fixture's file yields `displayName` order `["Greeter", "greet", "DEFAULT_NAME", "sayHi"]` [VERIFIED: test_server_tools.py:63]. **searchCode real hit shape:** `{"Repository": "toy-repo", "FileName": "toy/greeter.py", "LineMatches": [{"LineNumber": 5, "Line": <b64 "def greet(name):">}]}` is the Zoekt-side fixture that becomes hit `{"repo": "toy-repo", "path": "toy/greeter.py", "lineNumber": 5, "lineText": "def greet(name):"}` [VERIFIED: test_server_tools.py:147-151 + server.py:314-317].

### 3. The CLI (7 commands = 6 subcommands + `jarvis-server`)

**Entry points:**

> `[project.scripts]` / `jarvis = "jarvis.index_cli:main"` / `jarvis-server = "jarvis.server:main"` [VERIFIED: ../jarvis/pyproject.toml:86-88]

**Subcommands + flags** [VERIFIED: ../jarvis/src/jarvis/index_cli.py:1118-1177]:

| Command | Args / flags (verbatim from argparse) |
|---------|---------------------------------------|
| `jarvis index <path>` | `--slug` ("override the auto-derived slug"), `--scheme` ("Xcode scheme to build (Swift repos using xcodebuild with more than one scheme)"), `--semantic-include PATH` (`action="append"`, "force-include a path prefix the generated-file filter would skip (repeatable; persisted and reused by reindex/watch)"), `--language` (`choices=sorted(_INDEXER_BY_LANGUAGE)` = `java`, `python`, `swift`, `typescript`), `--search-only` ("skip SCIP indexing and publish only Zoekt + semantic search (persisted and reused by reindex/watch)") |
| `jarvis list` | no flags |
| `jarvis status <slug>` | no flags |
| `jarvis reindex <slug>` | no flags |
| `jarvis forget <slug>` | no flags |
| `jarvis watch <path>` | `--slug`, `--scheme`, `--debounce` (`type=float, default=5.0`, "quiet-period seconds (default: 5.0)"), `--language` |
| `jarvis-server` | no args; stdio MCP server (`mcp.run()`) [VERIFIED: server.py:389-390] |

**Status values:** normally `indexed` or `failed`, plus `PARTIAL_STATUS = "partial"` ("published real symbols but no navigable positions") [VERIFIED: index_cli.py:72 + README.md:174-177] and the search-only registry status surfaced by `getIndexStatus`'s `status` field.

**scip version-gate:** `MIN_SCIP_VERSION = (0, 9, 0)` — "below this version … silently writes a schema-valid database with zero chunks and zero mentions" [VERIFIED: index_cli.py:61-66]. `jarvis index` refuses an older scip [CITED: ../jarvis/README.md:210-213].

### 4. The language-support matrix (DOCS-06)

**4 nav families** [VERIFIED: index_cli.py:34-47 — extension→indexer map quoted]:

> `".ts": ("typescript", ["scip-typescript", "index"]),` / `".tsx": ("typescript", ...)` / `".py": ("python", ["scip-python", "index"]),` / `".java": ("java", ["scip-java", "index"]),` / `".kt": ("java", ...)` / `".swift": ("swift", ["scip-swift"]),`

Tie-break priority: `_EXT_PRIORITY = [".ts", ".tsx", ".py", ".java", ".kt", ".swift"]` [VERIFIED: index_cli.py:49].

**10 search-only languages:** "Go, Ruby, Rust, C, C++, C#, PHP, Scala, shell, and SQL for `searchCode`/`semanticSearch` only — no navigation" [CITED: ../jarvis/README.md:100-102].

**Per-language caveats** (all [CITED: ../jarvis/README.md]): Swift needs `scip >= v0.9.0` (README:210-213) and `scip-swift >= v0.1.2` for code-signed app-extension targets, with the `--only scip-swift --force` upgrade note (README:216-219); scip-java cannot index Android/Gradle at all → auto-degrades to search-only (README:293-302); Kotlin requires exact Kotlin version match (`SCIP_JAVA_KOTLIN`, currently 2.2.0) → auto-degrades (README:297-302); Maven-built Java on macOS needs bash ≥ 4.4 — fails with remedy rather than degrading (README:303-312); language detection counts git-tracked files only, one language per repo, `--language` overrides (README:93-97, 183-197).

**Requirements before install** (DOCS-06): macOS/Linux only; external binaries table (README:108-120). ⚠️ Binary-name truth: the public `setup.sh` installs **`zoekt-git-index`** + `zoekt-webserver` ("zoekt-git-index, not zoekt-index: jarvis indexes from the git tree … Nothing calls zoekt-index any[more]") [VERIFIED: setup.sh:492-500]; the private README's "zoekt-index" wording is stale — docs must follow setup.sh.

### 5. Troubleshooting source material (D-12 issue mining — COMPLETE, 4 issues total)

`gh issue list --state all` run against both repos on 2026-08-21 [VERIFIED: gh CLI]:

| Issue | State | Failure mode | Verified fix/workaround for the docs |
|-------|-------|--------------|--------------------------------------|
| jarvis-index#4 | closed | **uvx cold-start**: first MCP connect exceeds the 30s client timeout because `uvx` compiles jarvis-mcp's Rust extension from sdist on cold cache (`maturin pep517`, 5+ min) | "Workaround (verified): `uv tool install jarvis-mcp` builds + caches the wheel once; subsequent `uvx --from jarvis-mcp jarvis-server` cold starts in seconds" — issue body verbatim |
| jarvis-index#10 | open | **semantic second-server registration fails silently** when ambient uv Python < 3.12 (`jarvis-mcp[semantic]` ships wheels only for cp312/cp313/cp314) → `Failed to connect — CONNECTION_CLOSED` | Pin explicitly: `uvx --python 3.13 --from "jarvis-mcp[semantic]" jarvis-server` (verified in issue) |
| jarvis-index#9 | open | **`--semantic-include` has no effect on a prose-only repo** — semantic chunking is code-symbol-scoped, so markdown-only repos gain nothing | Document as a settled limitation (belongs on Upstream Issues / semanticSearch caveat, framed per the settled-decision convention) |
| jarvis#14 (private repo) | closed | **Android/Kotlin multi-module Gradle**: scip-java's `scipPrintDependencies` throws `ConcurrentModificationException` | Now auto-detected → degrades to `--search-only` (README:293-302); decision-tree leaf "nav empty, search works" |

Plus the two remaining named modes: **PATH** (`~/.jarvis/bin` not on PATH; GUI apps don't inherit shell PATH — use absolute path from `which jarvis-server`, README:56-58) and the **scip version-gate** (§3 above). The existing two-page split and decision-tree skeleton in `src/content/docs/docs/troubleshooting/` is sound; deepen in place per D-13.

### 6. Install channels & MCP Registry (DOCS-03, DOCS-12)

**Four channels, canonical commands:**

| Channel | Command(s) | Source |
|---------|-----------|--------|
| PyPI direct | `uv tool install jarvis-mcp` (+ `uvx --from jarvis-mcp jarvis-server`, `pip install jarvis-mcp`) | [CITED: README.md:20 + existing install.md] |
| Claude Code plugin | `/plugin marketplace add jarvis-intelligence/jarvis-index` then `/plugin install jarvis@jarvis` | [CITED: README.md:29-32] |
| Codex plugin | same marketplace source via `.codex-plugin/plugin.json` (repo-root manifest pointing into `plugin/`) | [VERIFIED: repo layout / CLAUDE.md] |
| MCP Registry | entry `io.github.jarvis-intelligence/jarvis`, pypi package `jarvis-mcp`, stdio transport | [VERIFIED: ../jarvis/server.json + live API probe below] |

**Registry entry is live:** `curl https://registry.modelcontextprotocol.io/v0/servers?search=io.github.jarvis-intelligence/jarvis` returns the active entry (`"status":"active"`; versions 0.6.1/0.6.2 listed) [VERIFIED: live probe 2026-08-21].

**Per-client deep links (the DOCS-12 table's honest content):**

| Client | Deep link? | What the table shows |
|--------|-----------|----------------------|
| Cursor | YES — `cursor://anysphere.cursor-deeplink/mcp/install?name=jarvis&config=<base64 of {"command":"uvx","args":["--from","jarvis-mcp>=0.6.0","jarvis-server"]}>` | [CITED: cursor.com/docs/mcp/install-links] |
| Claude Code | No URL scheme — command: `claude mcp add jarvis --scope user -- jarvis-server` (or plugin) | [CITED: README.md:37] |
| Codex CLI | No URL scheme — plugin install or manual `~/.codex` MCP config (mirror `plugin/.mcp.json`) | [ASSUMED — no Codex deeplink found; present as command, not link] |
| Generic stdio | JSON block `{"mcpServers": {"jarvis": {"command": "uvx", "args": ["--from", "jarvis-mcp>=0.6.0", "jarvis-server"]}}}` | [VERIFIED: plugin/.mcp.json — quoted verbatim] |

Constraint reminder: `>=0.6.0` floor must never be lowered or exact-pinned, and never add `[semantic]` to the plugin config (CLAUDE.md hard rules).

### 7. Changelog (DOCS-08)

`../jarvis/CHANGELOG.md` is 400 lines; top entry `## [0.6.2] - 2026-08-08` [VERIFIED: wc + head]. Verbatim full copy per D-15 into a new docs page (needs `title` frontmatter — Starlight mandates it; the H1 "Changelog" already exists in the source, so frontmatter title + body copy, dropping or keeping the duplicate H1 consistently with the other pages).

## Architecture Patterns

### System Architecture Diagram

```
                    ../jarvis/ (private, read-only source material)
   README.md ─ CHANGELOG.md ─ src/jarvis/*.py ─ tests/ ─ gh issues
        │            │              │ (verified shapes/flags)
        ▼            ▼              ▼
  ┌─────────────────────────────────────────────────────────┐
  │ Phase 2 content edits (this repo)                       │
  │  src/content/docs/docs/**  ← deepen 32 pages, add ~5    │
  │  src/content/docs/404.md   ← D-04 lookup 404            │
  │  public/brand-logo.html + public/fonts/*  ← D-01        │
  │  public/llms.txt           ← 02-05, strictly last       │
  └───────┬─────────────────────────────┬───────────────────┘
          │ every page ADD/RETIRE       │
          ▼ (same commit)               ▼
  design/url-contract.json      astro.config.mjs
  (V2 set-equality)             (sidebar groups + redirects map)
          │                             │
          ▼                             ▼
   npm run build → dist/ → node scripts/verify-build.mjs
   (V2 pages=contract · V3 assets · V4 fonts, exclusion REMOVED · V5 pagefind · V9 sitemap)
          │
          ▼
   deploy-pages.yml (paths: src/**, public/**, design/**, astro.config.*, package*.json)
   → GitHub Pages  /jarvis-index/  +  /jarvis-index/docs/
```

### Recommended Project Structure (additions only)

```
src/content/docs/
├── 404.md                          # D-04 lookup-table 404 (template: splash) — NOT in url-contract (V2 excludes 404.html)
└── docs/
    ├── quickstart.mdx              # RENAMED .md→.mdx if Tabs used (same URL — extension not in route)
    ├── changelog.md                # DOCS-08 → /docs/changelog/          (+contract +sidebar)
    ├── guide/
    │   ├── requirements.md         # D-14 → /docs/guide/requirements/    (+contract +sidebar)
    │   └── install-matrix.mdx      # D-10 four channels + DOCS-12 registry table → /docs/guide/install-matrix/ (+contract +sidebar)
    └── integrations/
        └── generic-stdio.md        # D-11 → /docs/integrations/generic-stdio/ (+contract +sidebar)
public/
├── fonts/                          # D-01: woff2 copied from node_modules @fontsource packages (stable names)
└── llms.txt                        # 02-05 (strictly last) — NOT in url-contract
```

(Exact slugs/nav placement are Claude's discretion per CONTEXT; the above keeps every new page one click from its sidebar group.)

### Pattern 1: Page ADD = 3-file atomic commit
Every new page ships in one commit: content file + `design/url-contract.json` URL (trailing-slash form, e.g. `/docs/guide/requirements/`) + `astro.config.mjs` sidebar entry. V2 fails the build otherwise ("extra page not in contract") [VERIFIED: scripts/verify-build.mjs:80-85 + astro.config.mjs:125-131 discipline comment].

### Pattern 2: Retire = redirect + contract edit, same commit
If 02-01 flags a retire (user-confirmed per D-03): add `redirects: { '/docs/old/': `${BASE}/docs/new/` }` in `astro.config.mjs` **with the `${BASE}/` prefix** (bare destinations 404 — verified Phase 1 pitfall, STATE.md), and drop the URL from the contract in the same commit. Meta-refresh stub is what Astro emits (GitHub Pages cannot 301).

### Pattern 3: Starlight custom 404 (D-04)
`src/content/docs/404.md` with `title` + `template: splash` frontmatter replaces Starlight's default 404 [VERIFIED: Context7 /withastro/starlight guides/customization.mdx]. Current build already emits `dist/404.html` (Starlight default) [VERIFIED: dist listing], and V2 excludes exactly `404.html` from the walk [VERIFIED: verify-build.mjs:76] — so the custom 404 needs **no contract edit**. Body: markdown table of retired/renamed URL → new location (initially empty or seeded from any 02-01 retires) + links into the six nav groups. If the splash template is too constraining for a table+nav layout, the fallback is `src/pages/404.astro` + `disable404Route: true` [CITED: Context7, same page].

### Pattern 4: Tabs for per-client steps (quickstart "register per client", install matrix)
`import { Tabs, TabItem } from '@astrojs/starlight/components'` in an `.mdx` page; use `syncKey="client"` so a reader's client choice persists across tab groups and page navigations [VERIFIED: Context7 /withastro/starlight components/tabs.mdx]. Requires renaming the page `.md` → `.mdx` — the route/URL is unchanged (extension is not part of the slug), so **no contract edit**. STATE.md already anticipated this ("code-groups unwrapped to bold labels — Tabs are Phase 2").

### Pattern 5: llms.txt as static public/ file (02-05, strictly last)
Format per llmstxt.org: H1 project name, blockquote one-sentence summary, optional prose, then `##` sections of `[Name](URL): description` link lists; `## Optional` marks skippable entries [CITED: llmstxt.org]. Recommend a hand-authored `public/llms.txt` (or a ~40-line zero-dep node script reading `design/url-contract.json` + page frontmatter descriptions — matches the repo's zero-dep script convention). Use absolute URLs (`https://jarvis-intelligence.github.io/jarvis-index/docs/...`). It lands at `dist/llms.txt`; V2 walks only `*.html` files [VERIFIED: verify-build.mjs:58 `allFiles.filter((f) => f.endsWith('.html'))`], so it is invisible to the page walk — see Pitfall 4 for why it must NOT be added to the contract.

### Pattern 6: brand-logo.html font self-hosting (D-01)
The page loads three Google-CDN families: `Geist:wght@400;500;600;700;800`, `Geist+Mono:wght@400;500`, `Rajdhani:wght@600;700` [VERIFIED: public/brand-logo.html:9-11], consumed via `--sans: "Geist", ...`, `--mono: "Geist Mono", ...`, `--logo: "Rajdhani", "Geist", ...` [VERIFIED: brand-logo.html:28-30]. Because `public/` passthrough bypasses Vite, `@fontsource` imports don't work there. Fix: copy 4 latin woff2 files from the installed Fontsource packages into `public/fonts/` (stable, un-hashed names) — `geist-latin-wght-normal.woff2` (variable, covers 400-800), `geist-mono-latin-wght-normal.woff2` (covers 400-500), `rajdhani-latin-600-normal.woff2`, `rajdhani-latin-700-normal.woff2` (all four subsets already ship hashed in dist/_astro, confirming availability [VERIFIED: dist listing]) — then replace lines 9-11 with an inline `@font-face` block (Code Examples §5) using relative `fonts/...` URLs (brand-logo.html sits at the artifact root, so relative resolves under `${BASE}/` correctly). Finally delete the V4 exclusion: remove `const V4_EXCLUDED = new Set([join(distDir, 'brand-logo.html')])` and its filter use [VERIFIED: verify-build.mjs:156-161], and mark WINDOWS.md id 4 fixed (`gsd-tools windows fixed 4`).

### Anti-Patterns to Avoid
- **Inventing example payloads** — the existing stubs did, and they're wrong (Pitfall 2). Copy shapes from Product Truth §1-2 only.
- **Documenting from the private README where it disagrees with shipped code** — `zoekt-index` vs `zoekt-git-index` (§4); code/setup.sh wins.
- **TODO-framing limitations** — semanticSearch extra, typeHierarchy fork-scip, blastRadius `freshness: "unknown"` are settled decisions with rationale inline (CLAUDE.md docs convention, D-08).
- **Adding non-HTML files to url-contract.json** (Pitfall 4).
- **Bare redirect destinations** — always `${BASE}/...` (Pattern 2).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-client tab UI | Custom HTML/JS tabs | Starlight `<Tabs syncKey>` | Built-in, accessible, persists choice across pages [VERIFIED: Context7] |
| 404 route | `src/pages/404.astro` from scratch | `src/content/docs/404.md` (`template: splash`) | Inherits Starlight layout/theme/search for free; astro-route fallback only if layout demands it |
| Redirect stubs | Hand-written meta-refresh HTML | `astro.config.mjs` `redirects:` map | Mechanism proven in 01-05 incl. the `${BASE}/` gotcha |
| Response-shape documentation | Prose descriptions of JSON | Verbatim shapes from Product Truth §1-2 | D-05; shapes are subtle (flat freshness, nested ranges) and already burned the stubs |
| llms.txt generation | A framework plugin | Static file / zero-dep script | No-sync-mechanism decision; V2-invisible either way |

**Key insight:** every mechanical need of this phase is either already built (contract, redirects, verify) or a documented Starlight built-in — the phase's real risk is *content accuracy*, which the verified quotes above de-risk.

## Common Pitfalls

### Pitfall 1: Page ADD without the same-commit contract edit
**What goes wrong:** `npm run verify` fails V2 ("extra page not in contract"); CI red.
**Why:** V2 is strict set-equality both directions [VERIFIED: verify-build.mjs:80-85].
**Avoid:** 3-file atomic commits (Pattern 1). **Warning sign:** any commit touching `src/content/docs/` without `design/url-contract.json` when a file was added/renamed-across-routes.

### Pitfall 2: Trusting the existing stubs' (or tool-roster.md's) response shapes
**What goes wrong:** docs ship `{"freshness": {"indexed": true}}` and `{"startLine": 42}` — neither exists in real output; VRFY-02 claims audit (Phase 5) fails, agents mis-parse.
**Why:** stubs were scaffolded from memory; tool-roster.md nests freshness that the code spreads flat.
**Avoid:** every JSON block in the 9 tool pages + quickstart traces to Product Truth §1-2. **Warning sign:** any example containing `startLine`/`startColumn` on a nav tool, or a nested `"freshness": {` object.

### Pitfall 3: WR-01 class of link bugs (camelCase slugs, missing trailing slash)
**What goes wrong:** `src/content/docs/docs/tools/index.md:15` links `/tools/findReferences` — 404s live [VERIFIED: file read + 01-REVIEW.md]. More generally, links authored extensionless without trailing slash cost a 301 hop.
**Avoid:** fix WR-01 in the content pass; normalize all internal links to docs-root-relative trailing-slash form (`/tools/find-references/`) which `rebaseDocsLinks()` rebases to the canonical URL. **Warning sign:** grep `\](/[a-z-/]*[a-zA-Z])\)` finding camelCase or slash-less link targets.

### Pitfall 4: Adding `llms.txt` to url-contract.json
**What goes wrong:** V2 reports `missing page: /llms.txt` and the build fails permanently — `builtUrls` is derived only from `*.html` files [VERIFIED: verify-build.mjs:58, 73-78].
**Avoid:** keep `llms.txt` out of the contract; it needs no V2 accounting. If an existence guarantee is wanted, extend verify-build with a one-line explicit check in 02-05 (optional).

### Pitfall 5: 404 emitted at the wrong path
**What goes wrong:** if the custom 404 emitted `404/index.html`, V2 would flag extra page `/404/`.
**Why it won't (but verify):** Astro special-cases 404 → root `404.html` even under `build.format: 'directory'` — the current default already emits `dist/404.html` [VERIFIED: dist listing]. **Warning sign:** V2 failure naming `/404/` after adding the page; the fix is renaming/moving, not a contract edit.

### Pitfall 6: brand-logo.html font fix that only half-lands
**What goes wrong:** CDN `<link rel="preconnect">` lines survive (V4 pattern matches `fonts.googleapis.com|fonts.gstatic.com` anywhere in the file [VERIFIED: verify-build.mjs:155]), or the V4 exclusion is removed before the fonts are replaced → V4 red; or fonts are referenced by hashed `_astro/` names that break on the next Fontsource bump.
**Avoid:** delete all three CDN lines (9-11), inline `@font-face` against stable `public/fonts/` copies, remove the exclusion — one commit; run `npm run build && npm run verify` locally.

### Pitfall 7: Quickstart `.md`→`.mdx` rename side effects
**What goes wrong:** none for the URL (extension not in slug), but stale imports or `:::tip` directives behave identically in MDX only if `@astrojs/mdx` remark-directive wiring matches — Starlight processes asides in both .md and .mdx natively.
**Avoid:** rename, build, and let V2 confirm the page set is unchanged. **Warning sign:** V2 missing-page failure for `/docs/quickstart/`.

### Pitfall 8: Changelog page trips Pagefind/sitemap noise
**What goes wrong:** none structurally — but the 400-line verbatim copy must still carry valid frontmatter (`title` is mandatory on every Starlight page; a missing title silently drops the page from the production build — Phase 1 lesson, STATE.md).
**Avoid:** frontmatter first, then verbatim body.

## Code Examples

All verified against sources cited in Product Truth.

### 1. Real `goToDefinition` success shape (for quickstart + tool page)
```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "scip-python python . . `toy.greeter`/Greeter#",
  "definitions": [
    { "path": "toy/greeter.py",
      "range": { "start": { "line": 4, "character": 6 }, "end": { "line": 4, "character": 13 } } }
  ],
  "commit": "0123abc…",
  "generated_at": "2026-08-21T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-08-21T12:34:56+00:00"
}
```
Shape verified (server.py:195-200, models.py:23-37, query.py:63-68); **field values above are illustrative placeholders — executors must capture a real transcript** by running the tool against an indexed repo (or lifting values from `tests/fixtures/synthetic_index.py` + `test_server_tools.py`) per D-05.

### 2. Real ambiguous-symbol failure shape — verbatim from test_server_tools.py:123-127
```json
{
  "error": "'dup' is ambiguous in toy-repo (2 matches). Retry with a qualifier, e.g. 'a.C.dup'.",
  "candidates": [
    { "symbol": "sym-a", "dottedPath": "a.C.dup", "kind": "METHOD" },
    { "symbol": "sym-b", "dottedPath": "b.D.dup", "kind": "METHOD" }
  ],
  "candidateTotal": 2
}
```

### 3. Starlight custom 404 (D-04)
```markdown
---
title: '404'
template: splash
editUrl: false
hero:
  title: 'Page not found'
  tagline: This URL moved during the docs rebuild — find its new home below.
---
| Old URL | New location |
| ------- | ------------ |
| … seeded from url-contract history / 02-01 retires … | … |
```
Source: Context7 /withastro/starlight guides/customization.mdx.

### 4. Tabs with syncKey (quickstart register-per-client, install matrix)
```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs syncKey="client">
  <TabItem label="Claude Code">…`/plugin marketplace add jarvis-intelligence/jarvis-index`…</TabItem>
  <TabItem label="Cursor">…deeplink + manual JSON…</TabItem>
  <TabItem label="Codex CLI">…</TabItem>
  <TabItem label="Any stdio client">…plugin/.mcp.json block…</TabItem>
</Tabs>
```
Source: Context7 /withastro/starlight components/tabs.mdx.

### 5. brand-logo.html self-hosted fonts (replaces lines 9-11)
```html
<style>
@font-face { font-family: "Geist"; src: url(fonts/geist-latin-wght-normal.woff2) format("woff2-variations"); font-weight: 100 900; font-style: normal; font-display: swap; }
@font-face { font-family: "Geist Mono"; src: url(fonts/geist-mono-latin-wght-normal.woff2) format("woff2-variations"); font-weight: 100 900; font-style: normal; font-display: swap; }
@font-face { font-family: "Rajdhani"; src: url(fonts/rajdhani-latin-600-normal.woff2) format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: "Rajdhani"; src: url(fonts/rajdhani-latin-700-normal.woff2) format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }
</style>
```
Family names match the page's existing `--sans/--mono/--logo` stacks (brand-logo.html:28-30), so no other CSS changes. woff2 sources: the installed `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/rajdhani` packages (`node_modules/@fontsource*/…/files/`). [ASSUMED: `format("woff2-variations")` vs plain `woff2` — both work in evergreen browsers; the Fontsource-generated CSS in dist uses the same files, so weight-axis coverage is proven by the site itself.]

### 6. Redirect entry for any 02-01 retire (Pattern 2)
```js
// astro.config.mjs — destination MUST be ${BASE}-prefixed (01-05 verified)
redirects: {
  '/docs/old-path/': `${BASE}/docs/new-path/`,
},
```

## State of the Art

| Old Approach (current repo state) | Current Approach (this phase) | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Invented JSON examples in stubs | Verbatim shapes from `../jarvis` source/tests | Phase 2 (D-05) | Docs survive the Phase 5 claims audit |
| VitePress-era code-groups → bold labels | Starlight `<Tabs syncKey>` in `.mdx` | Phase 2 (anticipated by 01-02) | Per-client steps selectable, choice persists |
| Default Starlight 404 | Lookup-table 404 (D-04) | Phase 2 | Retired URLs stay navigable |
| brand-logo.html on Google Fonts CDN + V4 exclusion | Self-hosted `public/fonts/` + exclusion removed | Phase 2 (D-01) | Zero-third-party-font claim holds site-wide; WINDOWS.md id 4 closes |
| No `llms.txt` | Static `public/llms.txt` per llmstxt.org | Phase 2 plan 02-05 (strictly last) | Agent-consumable index |

**Deprecated/outdated:** private README's `zoekt-index` naming (superseded by `zoekt-git-index`, setup.sh:492-500); `01-RESEARCH.md` Pattern 7's extensionless URL enumeration (superseded by trailing-slash contract).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Codex CLI has no MCP-install URL scheme; its DOCS-12 row is a command, not a link | Product Truth §6 | Table row understates capability; trivial to add later |
| A2 | `format("woff2-variations")` declaration form for the variable Geist files | Code Examples §5 | Fonts fall back to system stack on some browsers; fix is a one-word format change; verifiable in preview |
| A3 | Astro emits the custom 404 at root `404.html` under `build.format: 'directory'` (default 404 already does) | Pattern 3 / Pitfall 5 | V2 fails loudly at build time — caught before merge, not in production |
| A4 | `semanticSearch` top-level keys are `query`/`results`/`total` (entries verified; top-level cited from tool-roster.md only) | Product Truth §1 | Executor should capture one real semanticSearch transcript (or read `semantic.py:360-376` fully) before finalizing that page |
| A5 | Cursor's web-hosted install-link generator variant (`cursor.com/install-mcp?...`) exists alongside the `cursor://` scheme | Product Truth §6 | Use only the `cursor://` form, which is doc-cited |

## Open Questions (all RESOLVED in planning)

1. **(RESOLVED → 02-03: dedicated `/docs/cli/jarvis-server/` page)** **What exactly counts as the "7 commands" (DOCS-05)?**
   - What we know: `jarvis` has exactly 6 subcommands [VERIFIED: index_cli.py:1118-1177]; the package installs exactly 2 console scripts, `jarvis` + `jarvis-server` [VERIFIED: pyproject.toml:86-88]. 6 + 1 = 7.
   - What's unclear: whether `jarvis-server` gets its own reference page or a section on the CLI overview.
   - Recommendation: dedicated `/docs/cli/jarvis-server/` page (one-click nav per DOCS-09, and it's the command every MCP config names); planner confirms slug.
2. **(RESOLVED → 02-04/02-06: Guide group, pre-install reading order)** **Where do the two new guide pages sit in the sidebar?** (Claude's discretion per CONTEXT.) Recommendation: both in the existing "Guide" group — Quickstart, Requirements & Limits, Install, Install Channels (matrix) — keeping the pre-install reading order top-to-bottom.
3. **(RESOLVED → 02-01: audit still runs; expected keep ×32 + font fix, retires need user confirmation)** **Does 02-01's audit flag any merge/retire?** D-03 says none are pre-known; the classification table itself is an execution artifact. Research found no redundant page (all 32 pages map 1:1 to distinct product surfaces), so expect "keep ×32 + brand-logo font fix" with an empty redirects map — but the pass must still run and the user must confirm any retire.
4. **(RESOLVED → 02-07: llms.txt only; llms-full.txt out of scope)** **Should `llms-full.txt` also ship?** Spec makes it optional; DOCS-11 names only `llms.txt`. Recommendation: `llms.txt` only; note `llms-full.txt` as a possible follow-up, not scope.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build + verify | ✓ | v22.23.2 (engines `>=22` satisfied) | — |
| npm + installed node_modules | build | ✓ | lockfile present; dist/ builds exist | — |
| `../jarvis/` checkout | D-05/D-12/D-15 source material | ✓ | 0.6.2 (pyproject) | — (blocking if absent) |
| `gh` CLI (authed) | D-12 issue mining | ✓ | issues fetched this session (both repos) | mining results already captured in §5 |
| MCP registry reachability | DOCS-12 verification | ✓ | live probe 200 | table content already captured |
| Python/uv (to capture live transcripts) | optional, for real transcript values | not probed | — | lift transcripts from `tests/` fixtures instead (D-05 names the test suite as an approved source) |

**Missing dependencies with no fallback:** none.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Zero-dep node assertion scripts (no test runner in this repo) |
| Config file | none — `scripts/verify-build.mjs`, `scripts/check-manifests.mjs` |
| Quick run command | `npm run build && npm run verify` |
| Full suite command | `npm run build && npm run verify && npm run check:manifests` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOCS-01 | Quickstart page builds with all 5 steps + inline shapes | build + manual read | `npm run build && npm run verify` + grep for step headings | ✅ (verify-build) |
| DOCS-02 | 4 per-client guides exist and build | build (V2) | V2 set-equality incl. `/docs/integrations/generic-stdio/` after contract edit | ✅ |
| DOCS-03 | Install-matrix page in contract + sidebar | build (V2) + manual: 4 channels present | `npm run verify` | ✅ |
| DOCS-04 | 9 tool pages carry request→response + error contract | manual against Product Truth §1-2 checklist; grep guard | `grep -rL '"error"' src/content/docs/docs/tools/*.md` returns only index.md; grep `-r 'startLine' src/content/docs/docs/tools/` returns only semantic-search (its entries legitimately use `startLine`) | ✅ (grep) |
| DOCS-05 | 7 commands documented with flags | manual diff vs index_cli.py:1118-1177 flag list | flag-name grep per page | ✅ (grep) |
| DOCS-06 | Requirements page exists; quickstart links it before install step | build (V2) + grep quickstart for the link above the setup.sh block | `npm run verify` | ✅ |
| DOCS-07 | Decision tree leads with 3 named modes; issue-mined entries present | manual: tree contains uvx cold-start / PATH / scip gate + issues #4/#9/#10/#14 material | grep for `uv tool install jarvis-mcp` and `--python 3.13` in troubleshooting pages | ✅ (grep) |
| DOCS-08 | Changelog page mirrors CHANGELOG.md verbatim | automated diff | `diff <(tail -n +N src/content/docs/docs/changelog.md) ../jarvis/CHANGELOG.md` (N = frontmatter lines) | ❌ Wave: create with page |
| DOCS-09 | Every page classified; nav one-click; V2 green | build (V2 is the mechanism) + classification table artifact in plan summary | `npm run verify` | ✅ |
| DOCS-10 | Success AND failure shapes inline in quickstart | manual read: each step has "you'll know it works/broke when" | grep quickstart for both phrases | ✅ (grep) |
| DOCS-11 | `dist/llms.txt` exists, parses per llmstxt.org (H1 + blockquote + link sections), links resolve | script check | `test -f dist/llms.txt && head -2 dist/llms.txt | grep -q '^# '`; optional: resolve each link against contract URLs | ❌ Wave: 02-05 |
| DOCS-12 | Registry deep-link table present with live entry name | manual + `curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=io.github.jarvis-intelligence/jarvis" \| grep -q active` | probe | ✅ |
| D-01 | brand-logo.html zero CDN fonts; V4 exclusion removed | build (V4) | `npm run verify` after exclusion removal; `! grep -q 'fonts.googleapis' public/brand-logo.html` | ✅ |
| WR-01 | `/tools/findReferences` link fixed | grep | `! grep -rq 'findReferences)' src/content/docs/docs/tools/index.md` (link target, not label) | ✅ |

### Sampling Rate
- **Per task commit:** `npm run build && npm run verify`
- **Per wave merge:** `npm run build && npm run verify && npm run check:manifests` + targeted greps above
- **Phase gate:** full build green + interactive preview pass (404 lookup renders, Tabs switch and sync, Pagefind finds new pages) before `/gsd-verify-work`

### Wave 0 Gaps
- None blocking — the assertion harness exists from Phase 1. Two per-plan additions ride with their content: the DOCS-08 verbatim-diff command (02-04) and the `dist/llms.txt` existence/format check (02-05, optionally as a new verify-build dimension).

## Security Domain

Static documentation site — no auth, sessions, or dynamic input anywhere in this repo's output.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no (no forms; Pagefind is client-side static) | — |
| V6 Cryptography | no | — |

### Known Threat Patterns for this phase
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Documented `curl \| sh` install | Tampering | Already the product's chosen channel; docs must keep the exact canonical URL (`raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh`) and never suggest piping from anywhere else; setup.sh itself SHA256-verifies every artifact (setup.sh:238-248) |
| Copy-paste command injection in docs examples | Tampering | All commands quoted verbatim from verified sources; no shell examples with user-interpolated unquoted vars |
| Third-party font CDN (privacy claim) | Information disclosure | D-01 removes the last CDN reference; V4 then enforces site-wide |
| llms.txt link poisoning | Spoofing | Generate links only from `design/url-contract.json` origins |

## Project Constraints (from CLAUDE.md)

- `setup.sh` is synced from the private repo — **never edited here** (Phase 2 only reads it).
- Any `plugin/**` change requires a synchronized triple-manifest version bump — **Phase 2 must NOT touch `plugin/`**; the tool-roster.md freshness-shape error found here is Phase 4 (SKIL-02/03) material — record it for the Phase 4 planner, do not fix now.
- `--from jarvis-mcp>=0.6.0` floor stays a `>=` floor in every documented config; never add `[semantic]` to the plugin registration; docs present the second-server workaround instead (D-08, and issue #10's `--python 3.13` pin).
- Docs conventions: tables for decision surfaces; inline code always backticked; limitations as settled decisions with rationale, never TODOs; soft cap 500 lines/doc; conventional commits, no AI attribution.
- GSD workflow enforcement: all edits through GSD commands (this research is part of `/gsd-plan-phase`).
- Comment policy (strict, for any script edits e.g. verify-build V4 exclusion removal): why-comments only.

## Sources

### Primary (HIGH confidence)
- `../jarvis/src/jarvis/server.py`, `models.py`, `query.py`, `semantic.py`, `graph.py`, `index_cli.py`, `pyproject.toml` — tool shapes, error contract, CLI flags, entry points (read this session, line-cited)
- `../jarvis/tests/test_server_tools.py` — real transcript material incl. candidates payload
- This repo: `astro.config.mjs`, `design/url-contract.json`, `scripts/verify-build.mjs`, `public/brand-logo.html`, `setup.sh`, `plugin/.mcp.json`, `package.json`, all 33 content files, `dist/` listing, `.planning/WINDOWS.md`, `STATE.md`
- Context7 `/withastro/starlight` — custom 404 (guides/customization.mdx), Tabs/syncKey (components/tabs.mdx)
- Live probes: `registry.modelcontextprotocol.io` API; `gh issue list/view` on both repos

### Secondary (MEDIUM confidence)
- `../jarvis/README.md` — requirements, language matrix, upstream limitations (authoritative product doc, but one stale binary name found — cross-checked against setup.sh)
- [Cursor MCP install-links docs](https://cursor.com/docs/mcp/install-links) — deeplink format (via WebSearch, official-domain source)
- `plugin/skills/jarvis-use/references/tool-roster.md` — tool summaries (one verified inaccuracy: nested freshness)

### Tertiary (LOW confidence)
- [llms.txt spec (llmstxt.org)](https://llmstxt.org/) and secondary explainers ([Towards Data Science](https://towardsdatascience.com/llms-txt-414d5121bcb3/), [Mintlify](https://www.mintlify.com/docs/ai/llmstxt)) — format details via WebSearch; spec is short and the file is trivially reviewable

## Metadata

**Confidence breakdown:**
- Product truth (shapes, flags, matrix): HIGH — read from source with line citations and verbatim quotes
- Starlight mechanics (404, Tabs, mdx): HIGH — Context7 official docs + empirical dist evidence
- Troubleshooting sourcing: HIGH — exhaustive (4 issues total across both repos, all read)
- DOCS-12 deep links: MEDIUM — Cursor format cited; non-Cursor clients assumed link-less
- llms.txt format: MEDIUM — websearch-cited spec, but output is a reviewable static file

**Research date:** 2026-08-21
**Valid until:** 2026-09-20 (stable; re-verify only if `jarvis-mcp` releases past 0.6.2 or Starlight is bumped)

## RESEARCH COMPLETE
