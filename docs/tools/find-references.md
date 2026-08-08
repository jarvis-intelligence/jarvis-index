---
description: "findReferences — every occurrence of a symbol, definition included."
---

# findReferences

Every occurrence of `symbol` within `repo`, definition sites included.

## Signature

```
findReferences(repo, symbol) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | Bare, qualified, or full SCIP symbol (same resolution as `goToDefinition`) |

## Returns

```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "python main Greeter 0",
  "references": [{ "path": "src/main.py", "startLine": 42 }, { "path": "tests/test_main.py", "startLine": 10 }],
  "freshness": { "indexed": true }
}
```
