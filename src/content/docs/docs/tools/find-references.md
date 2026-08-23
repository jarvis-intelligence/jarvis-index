---
title: findReferences
description: "findReferences — every occurrence of a symbol, definition included."
---

Every occurrence of `symbol` within `repo`, definition sites included.

## Signature

```
findReferences(repo: str, symbol: str)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | A bare name, a qualified name, or a full SCIP symbol string (same resolution as `goToDefinition`) |

## Returns

```json
{
  "symbol": "greet",
  "resolvedSymbol": "...",
  "references": [
    { "path": "...", "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 0 } } }
  ],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

`resolvedSymbol` appears only when resolution changed the input. `references` includes the
definition site itself — this tool applies no role filter, unlike `goToDefinition`.

## Example

**Call:**
```json
{ "repo": "toy-repo", "symbol": "greet" }
```

**Response:**
```json
{
  "symbol": "greet",
  "resolvedSymbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#greet().",
  "references": [
    {
      "path": "toy/constants.ts",
      "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 20 } }
    },
    {
      "path": "toy/greeter.ts",
      "range": { "start": { "line": 1, "character": 2 }, "end": { "line": 1, "character": 7 } }
    },
    {
      "path": "toy/greeter.ts",
      "range": { "start": { "line": 9, "character": 4 }, "end": { "line": 9, "character": 9 } }
    }
  ],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

### Zero references

A resolved symbol with no occurrences reports an empty array — the envelope (`symbol` +
flat freshness) stays intact rather than shrinking:

```json
{
  "symbol": "unusedHelper",
  "references": [],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising. A symbol with no
match anywhere in the index is an error, not an empty `references` array:

```json
{ "error": "no symbol named 'NoSuchSymbol' in this index" }
```

When `symbol` is ambiguous, the error payload carries a structured `candidates` list — the same
resolution rung `goToDefinition` shares:

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
