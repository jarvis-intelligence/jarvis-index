---
title: Semantic search
description: "Semantic search combines vector, lexical, and SCIP signals via reciprocal rank fusion."
---

`semanticSearch` is natural-language code search. It embeds your query, retrieves vector matches
from the repo's semantic index, and fuses them with Zoekt lexical hits and SCIP symbol matches
via reciprocal rank fusion.

## Prerequisite: the `[semantic]` extra AND a second MCP server

Semantic search requires installing the `semantic` optional dependency:

```sh
uv tool install "jarvis-mcp[semantic]"
```

Then (re)index the repo so the vector table is built:

```sh
jarvis reindex <slug>
```

Without the extra, `semanticSearch` returns an error with an install hint. Semantic indexing
failure never blocks publish — it degrades gracefully.

This is not the whole story for plugin-installed users, though. The `jarvis` plugin
registration deliberately runs `uvx --from jarvis-mcp jarvis-server` — no `[semantic]` — to
keep every plugin user's MCP server cold-start free of `lancedb`/`torch`. That decision is
settled, not a gap to fix: the extra has to be present in the *specific server process*
answering the query, not just at index time, so reindexing alone never makes `semanticSearch`
work under the default registration. If you need it, register a second, differently-named MCP
server pointed at the extra:

```sh
claude mcp add jarvis-semantic --scope user -- uvx --from "jarvis-mcp[semantic]" jarvis-server
```

Then call `semanticSearch` through `jarvis-semantic` instead of `jarvis`.

## How it works

1. **Embed the query** using the table's recorded model (BAAI/bge-m3, 1024-dim, L2-normalized).
2. **Vector search** the repo's LanceDB table (cosine metric).
3. **SCIP symbol match** — query tokens are matched against the SCIP symbol table.
4. **Reciprocal rank fusion** merges all three signal groups (k=60, unweighted).

`sources` in each result indicates which signals contributed. A symbol-only hit has `content=""`
(SCIP stores no source text) and `symbolName` set to the definition's dotted path.

## Result shape

Each result entry carries: `repo`, `filePath`, `startLine`, `endLine`, `symbolName`, `content`,
`score`, and `sources` (the list of contributing signals). There is no flat freshness block on
these entries — unlike the nav tools, `semanticSearch` is not comparing against a single
published SCIP snapshot.

## Chunking is code-symbol-scoped

Semantic chunking follows SCIP symbol boundaries, not prose structure. Passing
`--semantic-include <path>` to `jarvis index` force-includes a path prefix the generated-file
filter would otherwise skip, but it has no effect on a prose-only repo (e.g. a docs-only
markdown repository) — there are no code symbols to chunk around, so nothing gets indexed
regardless of the flag. This is a settled limitation, not a bug: fixing it would mean adding a
separate prose-chunking strategy, which is out of scope for a code-intelligence tool.

## Swift caveat

scip-swift emits clang USR strings as symbol names, which natural-language query tokens never
match. The SCIP symbol signal is therefore weak for Swift repos. Vector and Zoekt signals still
work.

## Model drift warning

If the configured embedding model differs from the one used to build the index, `semanticSearch`
returns a `warning` field. Reindex with the current model to resolve.
