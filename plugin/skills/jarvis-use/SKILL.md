---
name: jarvis-use
description: "Use jarvis local-first code intelligence for code structure queries: Tree-sitter declaration outlines and definition navigation, SCIP references and hierarchies, natural-language semantic search, and status capability checks. Prefer over grep for indexed structural questions."
version: "0.1.0"
---

# jarvis everyday use

Part of the jarvis toolkit. Siblings: `jarvis-setup` (onboard), `jarvis-issues` (report bugs).

## Decision matrix

For any **structural** code question, prefer the jarvis tool over grep when the repo is indexed. `repo` is the slug from `jarvis index`. Every index has an always-on Tree-sitter syntax baseline for declarations in 17 parser selections; optional SCIP enrichment adds precise occurrences and relationship edges.

| Question | jarvis tool | Provider / behavior |
|---|---|---|
| Where is `X` defined? | `goToDefinition(repo, X)` | SCIP definition coverage when present; otherwise Tree-sitter declarations |
| Who calls / uses `X`? | `findReferences(repo, X)` | SCIP-only; returns `requiredCapability`/`reason`/`recovery` when occurrence data is unavailable |
| What calls `X` / what `X` calls? | `callHierarchy(repo, X)` | SCIP-only; returns a capability error when call-edge data is unavailable |
| Super/subtypes of `X`? | `typeHierarchy(repo, X)` | SCIP-only; returns a capability error when relationship data is unavailable |
| Symbols in a file? | `documentSymbols(repo, path)` | SCIP outline when usable for that file, otherwise Tree-sitter declarations |
| Is this repo indexed or capable? | `getIndexStatus(repo, repo_path)` | Freshness, snapshot generation, providers for all five navigation tools, and the in-flight `indexing` block while an `indexRepo` run is live |
| Repo has no index (or errors name `recoveryTool: "indexRepo"`)? | `indexRepo(path)` | Builds the index itself; returns `{slug, state, pid, log}` immediately, then poll `getIndexStatus(repo=slug)` until `indexed` or the `indexing.state` is terminal. `semantic` defaults to false — no embedding download unless asked |
| Cross-repo dependents of a package? | `blastRadius(repo, pkg)` | — |
| Lexical text search? | grep **or** `searchCode(query, repo?)` | — |
| Natural-language / conceptual code search? | `semanticSearch(repo, query, limit?)` | `searchCode` (needs `semantic` extra + reindex) |

## Symbol format

`goToDefinition` accepts a **bare name**, e.g. `search_zoekt`, a **qualified name** such as
`SemanticStore.__init__` (or `package-name.search_zoekt` when a bare name collides), a full SCIP
symbol string, or the opaque `syntax:` identifier returned by a syntax-baseline result. Bare and
qualified names search both SCIP and Tree-sitter providers. An ambiguous name returns an error
payload with `candidates` and `candidateTotal`; retry with the intended candidate's qualified name.

When resolution changes a bare or qualified input, the response includes `resolvedSymbol`. Every
definition location carries `source` (`"scip"` or `"tree-sitter"`) and `positionEncoding`; syntax
declarations also carry their selection range, qualified name, and parent symbol. `documentSymbols`
is useful for browsing a file or choosing a qualifier, but it is not a mandatory first step.

Full signatures and return shapes: `grep -nA20 "## Tool detail" references/tool-roster.md` (loaded on demand).

## The prefer-jarvis rule

Before a structural tool call:

1. Call `getIndexStatus(repo, repo_path)` — pass `repo_path` = the repo's local git working directory to compare the published commit against `git rev-parse HEAD`.
2. If the snapshot is stale, run `jarvis reindex <slug>` before relying on results. If it is not indexed at all, call `indexRepo(path=...)` with the repo's local git working directory (the error payload's `recoveryToolArgs` names the shape), then poll `getIndexStatus(repo=<returned slug>)` — the `indexing` block terminates in every failure mode (`failed-at-startup` and `abandoned` carry the log path). If spawning is impossible, fall back to offering `jarvis index <path>` and use grep for the immediate question.
3. For a navigation query, check `capabilities.tools.<tool>` — `available`, `providers`, `reason`, `recovery`:
   - `documentSymbols` and `goToDefinition` serve from `"scip"` when the file has coverage, else from the always-on `"tree-sitter"` baseline.
   - `findReferences`, `callHierarchy`, and `typeHierarchy` need `"scip"`; when unavailable, surface the tool's `requiredCapability`/`reason`/`recovery` error instead of reading it as an empty result.
4. `generation` in the freshness fields names the immutable snapshot that answered; `capabilities.syntax` carries per-state extraction counts and the extraction identity.
5. For **text** search (not structure), use grep or `searchCode` — no preference between them, except `searchCode` indexes git HEAD, so an uncommitted edit or new untracked file is grep-only until committed.

## Gotchas

- **The Tree-sitter syntax baseline is always on.** `index`, `reindex`, and `watch` parse git-tracked files for 17 supported parser selections using the `tree-sitter` runtime and 16 pip-installed grammar distributions. It works offline without a compiler, build system, external indexer, or index-time download. A publish is an immutable `index-<sha>-<generation>.db` snapshot, so reindexing the same commit never mutates the snapshot currently serving queries.
- **SCIP is reversible optional enrichment.** `--search-only`, `--fallback-search-only`, `--no-fallback-search-only`, and `JARVIS_FALLBACK_SEARCH_ONLY` are removed. Use persisted `--scip` / `--no-scip` on `jarvis index`, `jarvis reindex`, or `jarvis watch`; omitted means the persisted choice, defaulting to enabled for a new repo. A missing or failed SCIP stage publishes the syntax baseline with `status: degraded` and an actionable recovery instead of suppressing declaration navigation.
- **References and hierarchies are SCIP-only.** `findReferences`, `callHierarchy`, and `typeHierarchy` never infer edges from syntax declarations. Without usable SCIP data they return the established error payload plus `requiredCapability`, `reason`, and `recovery`, never an empty list. Install or repair the relevant indexer, then run `jarvis reindex <slug> --scip`.
- **`typeHierarchy` also needs the patched `scip` build.** Upstream `scip expt-convert` through v0.9.0 never populated relationships; setup.sh installs a fixed fork. Re-run setup.sh and then `jarvis reindex <slug> --scip` if the capability remains unavailable.
- **An ambiguous bare name returns `candidates`, not the wrong answer.** Select the intended entry's qualified name and retry. A name that matches nothing returns a `SymbolNotFoundError`-style message, never a silent empty result.
- **`semanticSearch` needs the `semantic` extra.** If the repo was indexed without `uv tool install "jarvis-mcp[semantic]"`, it returns `{"error": "..."}` with an install hint; index or reindex after installing the extra.
- **The default plugin registration deliberately omits the `semantic` extra.** A semantic query must go to a separately registered server:
  ```bash
  claude mcp add jarvis-semantic --scope user -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
  codex mcp add jarvis-semantic -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
  ```
  In Cursor there is no `mcp add` CLI — add the same server entry to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project) by hand (exact JSON in the plugin README's Optional extras).
- **`blastRadius` only sees already-indexed repos.** Index the dependency first, or re-run `jarvis index`/`reindex` after indexing it, for an edge to appear.
- **Every tool returns `{"error": "..."}` on failure, never raises.** Check for an `error` key before reading results.
- **Queries never write.** Published indexes are opened read-only; never try to mutate an `index-<sha>-<generation>.db`.

## Trigger examples (lightweight validation)

Should trigger: "find all callers of `index_repo`", "where is `QueryService` defined", "call hierarchy of `blast_radius`", "list symbols in server.py".
Should NOT trigger: "search for the string TODO" (text → grep/searchCode), "how do I install jarvis" (→ jarvis-setup).
