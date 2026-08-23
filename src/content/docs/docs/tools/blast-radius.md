---
title: blastRadius
description: "blastRadius — which indexed repos depend on this package (2-hop BFS)."
---

2-hop bounded BFS over the package dependency graph: every other indexed repo whose package
directly (1 hop) or transitively through one intermediary (2 hops) depends on
`symbol_or_package` as registered for `repo`.

## Signature

```
blastRadius(repo: str, symbol_or_package: str)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol_or_package` | string | yes | Package identifier as registered by `jarvis index` (e.g. `"npm:@scope/name"`) |

## Returns

```json
{
  "repo": "...",
  "symbolOrPackage": "...",
  "dependents": [{ "repo": "...", "name": "...", "hops": 1 }],
  "commit": null,
  "generated_at": null,
  "stale": false,
  "freshness": "unknown",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

## Example

**Call:**
```json
{ "repo": "toy-repo", "symbol_or_package": "npm:seed" }
```

**Response:**
```json
{
  "repo": "toy-repo",
  "symbolOrPackage": "npm:seed",
  "dependents": [{ "repo": "dep-repo", "name": "npm:dep", "hops": 1 }],
  "commit": null,
  "generated_at": null,
  "stale": false,
  "freshness": "unknown",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

## Freshness is always "unknown"

The package graph has no per-node timestamp column, so `commit`/`generated_at` are always
`null` and `freshness` is always `"unknown"` — an honest reflection of what this schema records,
not a stub. See [Concepts: Blast Radius](/concepts/blast-radius/).

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising — including when
`symbol_or_package` was never registered for `repo`:

```json
{ "error": "no package 'npm:no-such' registered for 'toy-repo' ('toy-repo' has no packages registered at all — has `jarvis index` been run for it?)" }
```
