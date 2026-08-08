---
description: "Blast radius is a 2-hop dependency graph showing which indexed repos depend on a package."
---

# Blast radius

`blastRadius` answers: *which other indexed repos depend on this package?* It walks the package
dependency graph stored in `registry.db`.

## How it works

1. Look up the package name registered for the repo (from its SCIP symbols).
2. **2-hop BFS** over the `edges` table (`source_package`, `target_package`, `distance`).
3. For each dependent found, fetch repo info from the `repos` table.
4. Return the list with hop distances (1 = direct, 2 = transitive through one intermediary).

## Rebuild-not-accumulate

The graph is rebuilt from scratch on every `jarvis index` — jarvis `DELETE`s the repo's outgoing
edges before recomputing them. This means removed dependencies are retracted automatically; the
graph always reflects the current state. There is no garbage collection or orphan cleanup needed.

## Freshness is always "unknown"

The graph has no per-node timestamp. `blastRadius` reports `freshness: "unknown"` for every
result. This is by design, not a bug.

## Cross-repo resolution

Edges resolve by **exact package name**. There is no package registry lookup. To get accurate
blast radius for a dependency:

1. Index the dependency repo first.
2. Then (re)index the repo that depends on it.

If you add a new dependency, re-run `jarvis index` on the consuming repo after indexing the
dependency.
