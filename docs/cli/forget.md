---
description: "jarvis forget — remove a repo's registration and published index."
---

# jarvis forget

Remove a repo from the registry and delete its published index.

## Usage

```sh
jarvis forget <slug>
```

## Arguments

| Name | Required | Description |
|------|----------|-------------|
| `slug` | yes | The repo slug |

## Behavior

- Removes the `repos` row from `registry.db`
- Removes the repo's dependency-graph edges
- The published `index-<sha>.db` and Zoekt shards are orphaned (disk space is not reclaimed
  automatically; safe to delete `~/.jarvis/scip/_/<slug>/` manually)
