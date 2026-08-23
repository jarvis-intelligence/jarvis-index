---
title: Common failures
description: "Common operational failures and their fixes."
---

# Common failures

## First MCP connect times out (uvx cold start)

- **Symptom:** the first MCP connect after registering jarvis-mcp exceeds the client's
  timeout — many clients give up around 30s.
- **Diagnosis:** on a cold `uv` cache, `uvx --from jarvis-mcp jarvis-server` either resolves
  a prebuilt wheel (macOS and common Linux glibc platforms publish cp312–cp314 wheels —
  that path is fast) or, on any other platform, builds jarvis-mcp's Rust extension from the
  source distribution (`maturin` via PEP 517), which takes 5+ minutes the first time.
- **Fix (verified):**

  ```sh
  uv tool install --python 3.13 jarvis-mcp
  ```

  This builds and caches the wheel once. Subsequent `uvx --from jarvis-mcp jarvis-server`
  cold starts in seconds.

## jarvis or jarvis-server not found (PATH)

- **Symptom:** the shell reports `jarvis: command not found` or `jarvis-server: command not
  found`, or a GUI client can't spawn the server at all.
- **Diagnosis:** `~/.jarvis/bin` (setup.sh's install directory) or the `uv tool` bin
  directory is not on `PATH`. GUI apps launched outside a shell don't inherit shell `PATH`
  changes.
- **Fix:**

  ```sh
  which jarvis-server
  ```

  Add the printed directory to `PATH` for your shell. For a GUI client's MCP registration,
  use the absolute path from `which jarvis-server` directly in the config instead of relying
  on `PATH`.

## jarvis index refuses an old scip (version gate)

- **Symptom:** `jarvis index` exits with an error naming the installed `scip` version
  instead of indexing.
- **Diagnosis:** below `scip 0.9.0`, the converter silently writes a schema-valid database
  with zero chunks and zero mentions — jarvis refuses to publish that rather than pretending
  it worked.
- **Fix:**

  ```sh
  sh ./setup.sh --only scip --force
  scip --version   # confirm >= 0.9.0
  jarvis reindex <slug>
  ```

## semanticSearch server fails to connect (Python version)

- **Symptom:** the second (semantic) MCP server registration fails to connect with a
  closed-connection error.
- **Diagnosis:** the ambient `uv` Python is below 3.12 — `jarvis-mcp[semantic]` ships wheels
  only for cp312/cp313/cp314.
- **Fix (verified):**

  ```sh
  uvx --python 3.13 --from "jarvis-mcp[semantic]" jarvis-server
  ```

  Pin the Python version explicitly in your MCP client's registration for this second
  server.

## semanticSearch returns an error

- **Cause:** the `[semantic]` extra is not installed.
- **Fix:**

  ```sh
  uv tool install --python 3.13 "jarvis-mcp[semantic]"
  jarvis reindex <slug>
  ```

## jarvis watch fails to start

- **Cause:** the `[watch]` extra is not installed.
- **Fix:**

  ```sh
  uv tool install --python 3.13 "jarvis-mcp[watch]"
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

## Navigation empty but search works (search-only)

Navigation tools (`goToDefinition`, `findReferences`, etc.) return empty but `searchCode` works.

- **Cause:** the indexer fell back to `--search-only` (no SCIP index). Check
  `jarvis status <slug>` output. This also happens automatically for Android/Gradle repos
  (`scip-java` can't index them at all) and for multi-module Gradle builds with a Kotlin
  version mismatch — both degrade to search-only rather than failing the index run.
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
