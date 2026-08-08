---
description: "SCIP (Source Code Intelligence Protocol) is the open format jarvis uses to index and navigate code."
---

# SCIP

SCIP (Source Code Intelligence Protocol) is an open format for code intelligence data. jarvis
consumes SCIP indexes produced by language indexers and exposes them via 9 MCP tools.

## How jarvis indexes code

1. **Language detection** — jarvis detects the primary language by file-extension plurality among
   git-tracked files.
2. **Language indexer** — the matching `scip-*` CLI (`scip-python`, `scip-typescript`,
   `scip-swift`, `scip-java`, ...) emits a `.scip` protobuf file.
3. **SCIP → SQLite** — `scip expt-convert` (a fork with the
   [scip#465](https://github.com/sourcegraph/scip/pull/465) `typeHierarchy` fix) produces an
   `index-<sha>.db` SQLite database.
4. **Atomic publish** — jarvis flips the `current` pointer via `os.replace()` so queries never
   see a partially-built index.

## The SQLite schema

The converted index (`index-<sha>.db`) contains these tables:

| Table | Purpose |
|-------|---------|
| `documents` | Per-file metadata |
| `chunks` | Occurrence groups (used by `documentSymbols`) |
| `global_symbols` | Symbol definitions + metadata |
| `mentions` | Symbol references (used by nav tools) |
| `defn_enclosing_ranges` | Parent scopes |
| `relationships` | Super/subtype data (used by `typeHierarchy` — requires the fork build) |

## Single language per index

By design, each index covers one primary language. If a repo has mixed languages, jarvis picks
the one with the most files by extension. You can override with `jarvis index --language <name>`.

## Read-only queries

At query time, jarvis opens the SQLite index with `mode=ro&immutable=1` — read-only, immutable.
This means safe concurrent reads and no accidental mutations.

## The fallback ladder

When a language indexer produces zero SCIP shards (e.g. Android/AGP projects, Kotlin version
mismatches), jarvis automatically falls back to `--search-only` — Zoekt search is built but SCIP
is skipped. Search works; navigation tools won't. See
[Troubleshooting: Upstream Issues](/troubleshooting/upstream-issues).
