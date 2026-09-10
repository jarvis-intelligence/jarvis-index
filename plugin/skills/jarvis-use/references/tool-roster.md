# jarvis tool roster

The 9 MCP tools registered by `jarvis-server`. All take `repo` (the slug from `jarvis index`). On failure every tool returns `{"error": "..."}` rather than raising.

## Tool detail

### documentSymbols(repo, path) → dict
Returns the per-file outline. When the file has usable SCIP outline coverage, entries come from SCIP; otherwise they come from the always-on Tree-sitter syntax baseline. Syntax-served responses include `coverage` with parsed/partial/failed counts and a reason. Entries carry readable names/kinds and ranges; syntax entries also carry `selectionRange`, `qualifiedName`, and `parentSymbol`.
Returns: `{"path": ..., "symbols": [{...}], "coverage"?: {...}, "freshness": {...}}`.

### goToDefinition(repo, symbol) → dict
Resolves `symbol` within `repo`. A bare name, qualified name, or full SCIP symbol is resolved across both providers; an opaque `syntax:` identifier returned by the syntax baseline round-trips directly. Resolution tries an exact match and then dotted suffixes. An ambiguous input returns an error payload with `candidates`/`candidateTotal` rather than a silent empty result. Locations carry `source` (`"scip"` or `"tree-sitter"`) and `positionEncoding`; `resolvedSymbol` is present when the input was canonicalized.
Returns: `{"symbol": ..., "resolvedSymbol"?: ..., "definitions": [{..., "source": "scip" | "tree-sitter", "positionEncoding": ...}], "freshness": {...}}`.

### findReferences(repo, symbol) → dict
Every occurrence of `symbol` within `repo`, definition sites included. **SCIP-only:** when the published snapshot has no usable SCIP occurrence data, returns the established error payload plus `requiredCapability`, `reason`, and `recovery`; it never returns an empty list as a substitute for missing data.
Returns: `{"symbol": ..., "resolvedSymbol"?: ..., "references": [{...}], "freshness": {...}}`.

### callHierarchy(repo, symbol) → dict
Single-level incoming and outgoing call hierarchy for `symbol`. **SCIP-only:** missing call-edge data returns `requiredCapability`/`reason`/`recovery`, never empty hierarchies that pretend the graph was indexed.
Returns: `{"symbol": ..., "resolvedSymbol"?: ..., "incomingCalls": [...], "outgoingCalls": [...], "freshness": {...}}`.

### typeHierarchy(repo, symbol) → dict
Single-level supertypes/subtypes for `symbol`. **SCIP-only:** missing relationship data returns `requiredCapability`/`reason`/`recovery`. The bundled setup.sh installs a patched `scip` because upstream through v0.9.0 did not populate relationships; re-run setup.sh and `jarvis reindex <slug> --scip` after upgrading it.

### getIndexStatus(repo, repo_path=None) → dict
Whether `repo` has a published index, plus freshness, snapshot generation, search coverage, and live provider coverage. Pass `repo_path` (the local git directory) to compare the published commit against `git rev-parse HEAD`. `capabilities.tools` reports `available`, `providers`, `reason`, and `recovery` for each of `documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`, and `typeHierarchy`; `capabilities.syntax` reports extraction availability, parsed/partial/failed/skipped/unsupported counts, and the extraction identity.
Returns: `{"repo": ..., "indexed": bool, "status": ..., "stale": bool, "freshness": str, "commit": str, "generated_at": str, "checked_at": str, "generation": str | None, "searchCoverage": {"expected": int, "indexed": int, "complete": bool} | None, "searchCoverageReason": str, "last_index_run": {"outcome": str, "origin": str, "reason": str | None, "recovery": str | None}, "capabilities": {"navigation": {...}, "search": {...}, "semantic": {...}, "tools": {"documentSymbols": {"available": bool, "providers": [...], "reason": str | None, "recovery": str | None}, ...}, "syntax": {"available": bool, "parsed": int, "partial": int, "failed": int, "skipped": int, "unsupported": int, "extractionIdentity": str | None}}}`. Without `repo_path`, freshness is reported without a staleness check (never `stale: true` without evidence).

### searchCode(query, repo=None) → dict
Lexical search via an embedded Zoekt index (lazy-started on first call). `repo`, if given, is applied as a Zoekt `r:` filter scoping results to that one indexed repo.
Returns: `{"query": ..., "hits": [{"repo","path","lineNumber","lineText"}], "total": int}`.

### semanticSearch(repo, query, limit=10) → dict
Natural-language code search over `repo`: embeds `query`, retrieves top vector matches from the repo's semantic index, and fuses them with Zoekt lexical hits and SCIP symbol-definition matches (when a SCIP index exists) via reciprocal rank fusion. Requires `repo` to have been indexed with the `semantic` extra installed (`uv tool install "jarvis-mcp[semantic]"`); otherwise returns `{"error": "..."}` with an install hint.
Returns: `{"query": ..., "results": [{"repo","filePath","startLine","endLine","symbolName","content","score","sources"}], "total": int}` (plus an optional `"warning"` if the configured embedding model differs from the index's). `sources` may include `"symbol"`; a symbol-only hit has `content=""` (SCIP stores no source text) and `symbolName` set to the definition's dotted path. Swift repos get no benefit from this signal — scip-swift emits clang USR strings as symbol names, which NL query tokens never match (same caveat as bare-name resolution in the nav tools).

### blastRadius(repo, symbol_or_package) → dict
2-hop bounded BFS over the package dependency graph: every other indexed repo whose package directly (1 hop) or transitively through one intermediary (2 hops) depends on `symbol_or_package` as registered for `repo` (e.g. `"npm:@scope/name"`). The graph has no per-node timestamp, so `freshness` is always `unknown` here.
Returns: `{"repo": ..., "symbolOrPackage": ..., "dependents": [{..., "hops": int}], "freshness": {...}}`.

## Freshness field

Every navigation tool returns flat top-level freshness fields alongside the result: `stale` (bool), `freshness` (`"fresh"` or `"stale"`), `commit` (the published index's git SHA), `generated_at` (the index build timestamp), `checked_at` (the staleness-check timestamp), and `generation` (the immutable snapshot identifier). Use `stale` to decide whether to trust results or `jarvis reindex <slug>` first. When `repo_path` is not passed to `getIndexStatus`, `stale` is always `false` because there is no evidence to judge staleness.
