---
title: goToDefinition
description: "goToDefinition — resolve where a symbol is defined."
---

# goToDefinition

Resolve `symbol`'s definition location(s) within `repo`.

## Signature

```
goToDefinition(repo, symbol) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | Bare (`Greeter`), qualified (`Greeter.greet`), or full SCIP symbol |

## Returns

```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "python main Greeter 0",
  "definitions": [{ "path": "src/main.py", "startLine": 42, "startColumn": 6 }],
  "freshness": { "indexed": true }
}
```

`resolvedSymbol` is included when resolution changed the input; omitted when the caller passed
the exact full symbol.

## Symbol resolution

1. Exact match on the full SCIP symbol.
2. Dotted-suffix match.
3. Ambiguous → returns an error payload with `candidates`/`candidateTotal` (not a silent empty
   result).

## Example

**Call:**
```json
{ "repo": "my-slug", "symbol": "Greeter" }
```
**Response:**
```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "python main Greeter 0",
  "definitions": [{ "path": "src/main.py", "startLine": 42 }],
  "freshness": { "indexed": true }
}
```
