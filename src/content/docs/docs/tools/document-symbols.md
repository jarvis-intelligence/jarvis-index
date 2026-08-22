---
title: documentSymbols
description: "documentSymbols — every top-level symbol defined in a file within a repo."
---

Every top-level symbol defined in `path` within `repo`, each with its range.

## Signature

```
documentSymbols(repo: str, path: str)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug (from `jarvis index`) |
| `path` | string | yes | File path relative to the repo root |

## Returns

```json
{
  "path": "toy/greeter.ts",
  "symbols": [
    {
      "symbol": "...",
      "displayName": "...",
      "kind": "...",
      "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 0 } }
    }
  ],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

`symbol` is the full SCIP symbol string; `displayName`/`kind` are the human-readable name and
kind for the same symbol — nulled to `None` when the index carries neither (the upstream `scip`
converter does not populate them on real output; see the
[Upstream Issues](/troubleshooting/upstream-issues/) entry). Symbols are ordered by position in
the file, not declaration order in the index.

## Example

**Call:**
```json
{ "repo": "toy-repo", "path": "toy/greeter.ts" }
```

**Response:**
```json
{
  "path": "toy/greeter.ts",
  "symbols": [
    {
      "symbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#",
      "displayName": "Greeter",
      "kind": "TYPE",
      "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 5, "character": 1 } }
    },
    {
      "symbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#greet().",
      "displayName": "greet",
      "kind": "METHOD",
      "range": { "start": { "line": 1, "character": 2 }, "end": { "line": 3, "character": 3 } }
    },
    {
      "symbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/DEFAULT_NAME.",
      "displayName": "DEFAULT_NAME",
      "kind": "TERM",
      "range": { "start": { "line": 6, "character": 6 }, "end": { "line": 6, "character": 18 } }
    },
    {
      "symbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#sayHi().",
      "displayName": "sayHi",
      "kind": "METHOD",
      "range": { "start": { "line": 8, "character": 2 }, "end": { "line": 9, "character": 3 } }
    }
  ],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising:

```json
{ "error": "no published index for toy-repo" }
```
