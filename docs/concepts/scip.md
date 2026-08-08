---
description: "SCIP (Source Code Intelligence Protocol) is the open format jarvis uses to index and navigate code."
---

# SCIP

SCIP (Source Code Intelligence Protocol) is an open format for code intelligence data. jarvis
consumes SCIP indexes produced by language indexers (`scip-python`, `scip-typescript`,
`scip-swift`, and others) and exposes them via 9 MCP tools.

## How jarvis indexes code

1. **Language detection** — jarvis detects the primary language by file-extension plurality.
2. **Language indexer** — the matching `scip-*` CLI emits a `.scip` protobuf file.
3. **SCIP → SQLite** — `scip expt-convert` (a fork with a `typeHierarchy` fix) produces an
   `index-<sha>.db` SQLite database.
4. **Atomic publish** — jarvis flips the `current` pointer via `os.replace()` so queries never
   see a partially-built index.

The full Concepts section is being authored. See
[Tools](/tools/) for what you can query against an indexed repo.
