---
title: goToDefinition
description: "goToDefinition — resolve where a symbol is defined."
---

Resolve `symbol`'s definition location(s) within `repo`.

## Signature

```
goToDefinition(repo: str, symbol: str)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | A bare name (`Greeter`), a qualified name (`Greeter.greet`), or a full SCIP symbol string |

## Returns

```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#",
  "definitions": [
    {
      "path": "toy/greeter.ts",
      "range": { "start": { "line": 0, "character": 6 }, "end": { "line": 0, "character": 13 } }
    }
  ],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

`resolvedSymbol` appears only when resolution changed the input — a caller passing the exact
full SCIP symbol string sees no `resolvedSymbol` key at all.

## Example

**Call:**
```json
{ "repo": "toy-repo", "symbol": "Greeter" }
```

**Response:**
```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#",
  "definitions": [
    {
      "path": "toy/greeter.ts",
      "range": { "start": { "line": 0, "character": 6 }, "end": { "line": 0, "character": 13 } }
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

Every tool returns a JSON object with an `"error"` string instead of raising. When `symbol` is
ambiguous, the error payload also carries a structured `candidates` list instead of an
unparseable prose message:

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
