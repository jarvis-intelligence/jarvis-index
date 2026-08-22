---
title: jarvis reindex
description: "jarvis reindex — re-run indexing for a registered repo."
---

Re-run the full indexing pipeline for an already-registered repo.

## Usage

```sh
jarvis reindex <slug>
```

## Arguments

| Name | Required | Description |
|------|----------|--------------|
| `slug` | yes | The repo slug |

No flags.

## Behavior

Re-runs the pipeline from `jarvis index`: language detection → indexer → SCIP convert → Zoekt →
atomic publish. The package dependency graph is rebuilt — jarvis deletes the repo's outgoing
edges before recomputing, so removed dependencies are retracted automatically.

The options persisted from the original `jarvis index` run — `--language`, `--search-only`,
`--semantic-include`, `--scheme` — are reused; there is no flag to change them here, re-run
`jarvis index` with new values instead.

## When to run it

- `jarvis status <slug>` reports `stale` (published commit differs from `git rev-parse HEAD`)
- After `setup.sh` upgrades an indexer binary
- After a version bump that fixes an indexer/converter defect (for example the scip typeHierarchy
  fork fix)
