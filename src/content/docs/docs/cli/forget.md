---
title: jarvis forget
description: "jarvis forget — remove a repo's registration and published index."
---

Remove a repo from the registry and delete its published index.

## Usage

```sh
jarvis forget <slug>
```

## Arguments

| Name | Required | Description |
|------|----------|--------------|
| `slug` | yes | The repo slug |

No flags.

## Behavior

`jarvis forget` removes the index permanently; re-run `jarvis index` to rebuild.

- Removes the `repos` row from `registry.db`
- Deletes the published `index-<sha>.db` and Zoekt shards for the slug
- Removes the repo's dependency-graph edges
- Best-effort: unpins the `zoekt.name` git config key it set at index time, so the repo carries
  no footprint after forgetting
