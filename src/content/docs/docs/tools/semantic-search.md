---
title: semanticSearch
description: "semanticSearch — natural-language code search via vector + lexical + SCIP fusion."
---

Natural-language code search over `repo`: embeds `query`, retrieves top vector matches from the
repo's semantic index, and fuses them with Zoekt lexical hits and SCIP symbol-definition matches
via reciprocal rank fusion.

:::caution
`semanticSearch` requires two things beyond a base install: the `[semantic]` extra
(`uv tool install "jarvis-mcp[semantic]"`, then `jarvis reindex <slug>`) AND a **second** MCP
server registration pinned to Python 3.13+ — the semantic extra ships wheels only for
cp312/cp313/cp314, so an ambient `uv` Python below 3.12 makes the second server fail to connect
with `CONNECTION_CLOSED`. Register it explicitly:

```sh
uvx --python 3.13 --from "jarvis-mcp[semantic]" jarvis-server
```

This is the standing answer, not a workaround pending a fix — pin the version rather than
retrying an unpinned registration.
:::

## Signature

```
semanticSearch(repo: str, query: str, limit: int = 10)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `query` | string | yes | Natural-language query (e.g. "find authentication helpers") |
| `limit` | integer | no | Max results (default 10) |

## Returns

```json
{
  "query": "...",
  "results": [
    {
      "repo": "...",
      "filePath": "...",
      "startLine": 0,
      "endLine": 0,
      "symbolName": "...",
      "content": "...",
      "score": 0.0,
      "sources": ["vector", "zoekt", "symbol"]
    }
  ],
  "total": 0
}
```

Unlike the SCIP nav tools, result entries legitimately use `startLine`/`endLine` (chunk bounds,
not a SCIP range) — this is the one tool page where those keys are real. An optional top-level
`warning` field appears when the configured embedding model differs from the one the index was
built with; the search still runs, queried with the index's own model.

## Example

**Call:**
```json
{ "repo": "toy-repo", "query": "greet a person by name" }
```

**Response:**
```json
{
  "query": "greet a person by name",
  "results": [
    {
      "repo": "toy-repo",
      "filePath": "toy/greeter.ts",
      "startLine": 1,
      "endLine": 3,
      "symbolName": "greet",
      "content": "greet(name: string): string {\n  return `Hello, ${name}`;\n}",
      "score": 0.87,
      "sources": ["vector", "symbol"]
    }
  ],
  "total": 1
}
```

`sources` names which signal(s) contributed to a result. A symbol-only hit (no vector or Zoekt
match, found purely via the SCIP symbol signal) carries `content: ""` — the SCIP index stores no
source text — with `symbolName` set to the definition's dotted path.

## Limitations

Swift repos get no benefit from the SCIP symbol signal: `scip-swift` emits clang USR strings as
symbol names, which natural-language query tokens never match. Prose-only repos (no code
symbols) also gain nothing from `--semantic-include` beyond what plain chunking already covers —
semantic chunking is code-symbol-scoped by design, not a bug to fix. See
[Upstream Issues](/troubleshooting/upstream-issues/).

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising:

```json
{ "error": "no semantic index for toy-repo — run jarvis reindex toy-repo" }
```
