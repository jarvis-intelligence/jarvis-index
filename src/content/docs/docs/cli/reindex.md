---
title: jarvis reindex
description: "jarvis reindex — re-run indexing for a registered repo."
---

# jarvis reindex

Re-run the full indexing pipeline for an already-registered repo.

## Usage

```sh
jarvis reindex <slug>
```

## Arguments

| Name | Required | Description |
|------|----------|-------------|
| `slug` | yes | The repo slug |

## Behavior

Re-runs the pipeline from `jarvis index`: language detection → indexer → SCIP convert → Zoekt →
atomic publish. The package dependency graph is rebuilt — jarvis `DELETE`s the repo's outgoing
edges before recomputing, so removed dependencies are retracted automatically.

Persisted flags from the original `jarvis index` (e.g. `--language`, `--search-only`,
`--semantic-include`) are reused unless overridden.
