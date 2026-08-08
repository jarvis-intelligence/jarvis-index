---
description: "blastRadius — which indexed repos depend on this package (2-hop BFS)."
---

# blastRadius

2-hop bounded BFS over the package dependency graph: every other indexed repo whose package
directly (1 hop) or transitively through one intermediary (2 hops) depends on
`symbol_or_package` as registered for `repo`.

## Signature

```
blastRadius(repo, symbol_or_package) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol_or_package` | string | yes | Package identifier (e.g. `"npm:@scope/name"`) |

## Returns

```json
{
  "repo": "my-slug",
  "symbolOrPackage": "npm:@scope/name",
  "dependents": [{ "repo": "consumer-slug", "hops": 1 }, { "repo": "transitive-slug", "hops": 2 }],
  "freshness": { "indexed": true }
}
```

## Freshness is always "unknown"

The graph has no per-node timestamp, so `freshness` is always `unknown` here. This is by design.
See [Concepts: Blast Radius](/concepts/blast-radius).
