---
title: Common failures
description: "Common operational failures and their fixes."
---

# Common failures

## semanticSearch returns an error

- **Cause:** the `[semantic]` extra is not installed.
- **Fix:**

  ```sh
  uv tool install "jarvis-mcp[semantic]"
  jarvis reindex <slug>
  ```

## jarvis watch fails to start

- **Cause:** the `[watch]` extra is not installed.
- **Fix:**

  ```sh
  uv tool install "jarvis-mcp[watch]"
  ```

  This installs `watchdog` (>=4.0).

## searchCode returns results from the wrong repo

- **Cause:** Zoekt derives the repo name from the directory basename if not pinned, causing
  collisions across repos with the same name.
- **Fix:** `setup.sh` pins each repo with `git config zoekt.name <slug>`. If you indexed
  manually without `setup.sh`, run this in the repo and reindex:

  ```sh
  git config zoekt.name <slug>
  jarvis reindex <slug>
  ```

## nav-empty-but-search-works

Navigation tools (`goToDefinition`, `findReferences`, etc.) return empty but `searchCode` works.

- **Cause:** the indexer fell back to `--search-only` (no SCIP index). Check
  `jarvis status <slug>` output.
- **Fix:** install the right language indexer (e.g. `scip-python` via `setup.sh`) and reindex:

  ```sh
  jarvis reindex <slug>
  ```

## getIndexStatus reports stale

- **Cause:** the published commit SHA differs from `git rev-parse HEAD`.
- **Fix:**

  ```sh
  jarvis reindex <slug>
  ```

## blastRadius freshness is always unknown

- **This is by design.** The dependency graph has no per-node timestamp, so `blastRadius`
  reports `freshness: "unknown"` for every result. It is not a bug. See
  [Concepts: Blast Radius](/concepts/blast-radius).
