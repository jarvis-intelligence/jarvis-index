---
title: Tools
description: "The 9 MCP tools jarvis exposes: navigation, search, graph, and status."
---

# Tools

jarvis exposes 9 MCP tools. All take `repo` (the slug from `jarvis index`). On failure, every
tool returns `{"error": "..."}` rather than raising.

| | Tool | Answers | Prerequisites |
|---|------|---------|---------------|
| **Navigate** | [`documentSymbols`](/tools/document-symbols) | Every symbol in a file | SCIP index |
| | [`goToDefinition`](/tools/go-to-definition) | Where is `X` defined? | SCIP index |
| | [`findReferences`](/tools/findReferences) | Everywhere `X` is used | SCIP index |
| | [`callHierarchy`](/tools/call-hierarchy) | What calls `X`, and what `X` calls | SCIP index |
| | [`typeHierarchy`](/tools/type-hierarchy) | Super/subtypes of `X` | Fork `scip` build |
| **Search** | [`searchCode`](/tools/search-code) | Lexical search (Zoekt) | Zoekt index |
| | [`semanticSearch`](/tools/semantic-search) | Natural-language search | `[semantic]` extra |
| **Scope** | [`blastRadius`](/tools/blast-radius) | Which repos depend on this package | Dependency graph |
| | [`getIndexStatus`](/tools/get-index-status) | Is this repo indexed? Is it stale? | — |

## Common parameters

- `repo` — the slug from `jarvis index` (defaults to the directory name)
- `symbol` (nav tools) — accepts a bare name (`MyClass`), a qualified name
  (`MyClass.method`), or the full SCIP symbol string
- `path` (documentSymbols) — a file path relative to the repo root

## Freshness

Every navigation tool returns a `freshness` object describing the published index. Use it to
decide whether to trust results or `jarvis reindex <slug>` first.
