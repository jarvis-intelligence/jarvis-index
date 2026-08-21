---
title: Architecture
description: "jarvis is local-first: SQLite on disk, no cloud, no auth, no network calls at runtime."
---

# Architecture

jarvis is **local-first**: everything runs on your machine. No code leaves it, no telemetry, no
account, no network calls at runtime.

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
