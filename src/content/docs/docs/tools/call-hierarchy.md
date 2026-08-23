---
title: callHierarchy
description: "callHierarchy — incoming and outgoing calls for a symbol."
---

Single-level incoming and outgoing call hierarchy for `symbol` within `repo`.

## Signature

```
callHierarchy(repo: str, symbol: str)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | A bare name, a qualified name, or a full SCIP symbol string |

## Returns

```json
{
  "symbol": "sayHi",
  "resolvedSymbol": "...",
  "incomingCalls": [
    {
      "symbol": { "symbol": "...", "displayName": "...", "kind": "..." },
      "location": { "path": "...", "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 0 } } }
    }
  ],
  "outgoingCalls": [
    {
      "symbol": { "symbol": "...", "displayName": "...", "kind": "..." },
      "location": { "path": "...", "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 0 } } }
    }
  ],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

Both arrays are single-level — no recursive walk up or down the call graph. `resolvedSymbol`
appears only when resolution changed the input.

## Example

**Call:**
```json
{ "repo": "toy-repo", "symbol": "sayHi" }
```

**Response:**
```json
{
  "symbol": "sayHi",
  "resolvedSymbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#sayHi().",
  "incomingCalls": [],
  "outgoingCalls": [
    {
      "symbol": {
        "symbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#greet().",
        "displayName": "greet",
        "kind": "METHOD"
      },
      "location": {
        "path": "toy/greeter.ts",
        "range": { "start": { "line": 9, "character": 4 }, "end": { "line": 9, "character": 9 } }
      }
    }
  ],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

`sayHi()`'s body calls `greet()`, so `outgoingCalls` names it; nothing in the fixture calls
`sayHi()` itself, so `incomingCalls` is a real, honest empty array — not a fabricated one.

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising:

```json
{ "error": "no symbol named 'NoSuchSymbol' in this index" }
```
