---
description: "documentSymbols — every top-level symbol defined in a file within a repo."
---

# documentSymbols

Every top-level symbol defined in `path` within `repo`, each with its range.

## Signature

```
documentSymbols(repo, path) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug (from `jarvis index`) |
| `path` | string | yes | File path relative to the repo root |

## Returns

```json
{
  "path": "src/main.py",
  "symbols": [{ "symbol": "...", "displayName": "...", "kind": "...", "range": {...} }],
  "freshness": { "indexed": true, "stale": false }
}
```

`symbol` is the full SCIP string; `displayName`/`kind` are human-readable.

## Example

::: code-group
```json [Call]
{ "repo": "my-slug", "path": "src/main.py" }
```
```json [Response]
{
  "path": "src/main.py",
  "symbols": [{ "symbol": "python main Greeter 0", "displayName": "Greeter", "kind": "class" }],
  "freshness": { "indexed": true }
}
```
:::

## Notes

Useful for browsing a file or picking a qualifier when a nav tool reports an ambiguous name — not
a mandatory first step.
