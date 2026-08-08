---
description: "semanticSearch — natural-language code search via vector + lexical + SCIP fusion."
---

# semanticSearch

Natural-language code search: embeds the query, retrieves vector matches, and fuses them with
Zoekt lexical hits and SCIP symbol matches via reciprocal rank fusion.

## Prerequisite: the `[semantic]` extra

```sh
uv tool install "jarvis-mcp[semantic]"
jarvis reindex <slug>
```

Without the extra, `semanticSearch` returns `{"error": "..."}` with an install hint.

## Signature

```
semanticSearch(repo, query, limit=10) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `query` | string | yes | Natural-language query (e.g. "find authentication helpers") |
| `limit` | int | no | Max results (default 10) |

## Returns

```json
{
  "query": "find authentication helpers",
  "results": [{
    "repo": "my-slug",
    "filePath": "src/auth.py",
    "startLine": 10,
    "endLine": 40,
    "symbolName": "authenticate",
    "content": "...",
    "score": 0.92,
    "sources": ["vector", "zoekt", "symbol"]
  }],
  "total": 1
}
```

An optional `warning` field appears if the configured embedding model differs from the index's.

## Notes

- `sources` may include `"symbol"`; a symbol-only hit has `content=""` (SCIP stores no source
  text) and `symbolName` set to the definition's dotted path.
- Swift repos get no benefit from the SCIP symbol signal — scip-swift emits clang USR strings
  as symbol names, which NL query tokens never match.
