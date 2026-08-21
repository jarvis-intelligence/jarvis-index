---
title: callHierarchy
description: "callHierarchy — incoming and outgoing calls for a symbol."
---

# callHierarchy

Single-level incoming + outgoing call hierarchy for `symbol`.

## Signature

```
callHierarchy(repo, symbol) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | Bare, qualified, or full SCIP symbol |

## Returns

```json
{
  "symbol": "greet",
  "incomingCalls": [{ "symbol": "...", "path": "...", "line": ... }],
  "outgoingCalls": [{ "symbol": "...", "path": "...", "line": ... }],
  "freshness": { "indexed": true }
}
```
