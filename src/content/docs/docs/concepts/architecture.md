---
title: Architecture
description: "jarvis is local-first: SQLite on disk, no cloud, no auth, no network calls at runtime."
---

jarvis is **local-first**: everything runs on your machine. No code leaves it, no telemetry, no
account, no network calls at runtime.

## Components

| Component | Role |
|-----------|------|
| Language indexers | `scip-python`, `scip-typescript`, `scip-java`, `scip-swift` — one external process per index run, each emitting a `.scip` protobuf file for its language |
| SCIP → SQLite converter | `scip expt-convert` (fork with the `typeHierarchy` fix) flattens the `.scip` file into `index-<sha>.db`'s query-friendly tables |
| SQLite index store | `index-<sha>.db`, opened `mode=ro&immutable=1` at query time — read-only, immutable, safe for concurrent reads |
| Zoekt | embedded `zoekt-webserver` subprocess; trigram-indexed lexical/regex search over git-tracked files |
| jarvis-server (MCP) | `FastMCP` stdio server exposing the 9 tools; each MCP client spawns and owns its own `jarvis-server` process over stdio — there is no shared server process across clients |

## The three components

```
┌─────────────────────────────────────────────────────────────┐
│  MCP Client (Claude Code / Cursor / Codex CLI)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ stdio (JSON-RPC)
┌──────────────────────────▼──────────────────────────────────┐
│  jarvis-server (Python) — MCP stdio server                  │
│  9 tools: navigation, search, graph, status                 │
└──────┬───────────────────────────┬──────────────────────────┘
       │ reads                     │ shells out to
┌──────▼────────────────────────┐  │
│ ~/.jarvis/ (on disk)          │  │ Language indexers + scip + zoekt
│  index-<sha>.db (SQLite)      │  │ (installed by setup.sh)
│  .zoekt/ shards               │  │
│  lancedb/ vectors (optional)  │  │
│  registry.db (repos + edges)  │  │
└───────────────────────────────┘  └──────────────────────────────┘
```

## Data directory

```
~/.jarvis/
├── bin/                         # external binaries (from setup.sh)
├── scip/_/<slug>/_/
│   ├── index-<sha>.db           # SQLite SCIP index (read-only at runtime)
│   └── current                  # pointer file (contains the live <sha>)
├── .zoekt/
│   └── <slug>_v16.*.zoekt       # Zoekt search shards
├── lancedb/                     # optional, semantic extra only
│   └── <slug>_v*.lance          # per-repo vector tables
└── registry.db                  # repos table + dependency-graph edges
```

## Data flow: index to tool response

**Indexing (`jarvis index <path>`):** detect the primary language → run its `scip-*` indexer →
`scip expt-convert` the `.scip` output into a new `index-<sha>.db` → rebuild the repo's
dependency-graph edges in `registry.db` → run `zoekt-git-index` to build `.zoekt` shards → only
once every stage succeeds, `os.replace()` flips the `current` pointer to the new SQLite file.
A query already reading the old file keeps working throughout; a failure at any stage leaves
the previously published index live.

**Querying (e.g. `goToDefinition`):** the client sends a stdio JSON-RPC request → `server.py`'s
`FastMCP` dispatcher routes it to the Query Engine (`query.py`) → the engine opens the
published `index-<sha>.db` read-only → resolves the symbol against `global_symbols` and
`mentions` → returns `{"symbol", "definitions": [Location, ...]}` plus the five flat freshness
fields (`commit`, `generated_at`, `stale`, `freshness`, `checked_at`) spread at the top level of
the response — never nested under a `"freshness"` key.

## Architectural guarantees

| Guarantee | How | Why it matters |
|-----------|-----|----------------|
| **Read-only queries** | SQLite opened `mode=ro&immutable=1` | Safe concurrent reads; no accidental mutations |
| **Atomic publish** | `os.replace()` pointer swap after all stages complete | Zero downtime; no partial-state windows |
| **Rebuild-not-accumulate graph** | `DELETE` outgoing edges before recompute | Removed dependencies retracted automatically |
| **Single language per index** | Detection by extension plurality | Avoids polyglot complexity |
| **One slug per path** | Registry-enforced at index time | Prevents slug collisions |
| **Fail-safe server** | Broad exception handling → `{"error": "..."}` | Server never crashes on query bugs |

## Why these choices

- **SQL over custom format** — standard sqlite3 tooling, ACID guarantees, no custom serialization.
- **Git-indexed search** — excludes gitignored content by construction; reflects HEAD.
- **Zoekt** — proven at scale (Sourcegraph), regex support, cross-compiled binaries available.
- **Atomic publish** — the only safe way to reindex without blocking queries.
