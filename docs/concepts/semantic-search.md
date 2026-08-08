---
description: "Semantic search combines vector, lexical, and SCIP signals via reciprocal rank fusion."
---

# Semantic search

`semanticSearch` is natural-language code search. It embeds your query, retrieves vector matches
from the repo's semantic index, and fuses them with Zoekt lexical hits and SCIP symbol matches
via reciprocal rank fusion.

## Prerequisite: the `[semantic]` extra

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

## How it works

1. **Embed the query** using the table's recorded model (BAAI/bge-m3, 1024-dim, L2-normalized).
2. **Vector search** the repo's LanceDB table (cosine metric).
3. **SCIP symbol match** — query tokens are matched against the SCIP symbol table.
4. **Reciprocal rank fusion** merges all three signal groups (k=60, unweighted).

`sources` in each result indicates which signals contributed. A symbol-only hit has `content=""`
(SCIP stores no source text) and `symbolName` set to the definition's dotted path.

## Swift caveat

scip-swift emits clang USR strings as symbol names, which natural-language query tokens never
match. The SCIP symbol signal is therefore weak for Swift repos. Vector and Zoekt signals still
work.

## Model drift warning

If the configured embedding model differs from the one used to build the index, `semanticSearch`
returns a `warning` field. Reindex with the current model to resolve.
