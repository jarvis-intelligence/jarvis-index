---
title: Install guide
description: "Detailed install reference for jarvis: uv, uvx, pip, extras, and what setup.sh provisions."
---

`jarvis` is distributed as the `jarvis-mcp` Python package on PyPI, plus external binaries
installed by `setup.sh`. This page covers every install method and what each component provides.

## Prerequisites

- **OS:** macOS or Linux. jarvis does not support Windows.
- **`uv`:** install from https://docs.astral.sh/uv/
- **PATH:** after `setup.sh`, `~/.jarvis/bin` must be on `PATH`.

Before installing, [check your language is supported](/guide/requirements/).

## Install the CLI + MCP server

**uv tool (recommended):**
```sh
uv tool install --python 3.13 jarvis-mcp
```
Puts `jarvis` and `jarvis-server` on `PATH` via uv's tool shims (`uv tool dir`'s `bin/`). This is
also the fix for the [uvx cold-start timeout](/troubleshooting/common-failures/#first-mcp-connect-times-out-uvx-cold-start) —
the wheel builds and caches once, so later `uvx` calls start in seconds.

**uvx (ad-hoc, no install):**
```sh
uvx --from jarvis-mcp jarvis-server
```
Nothing is added to `PATH` — `uvx` runs the server ephemerally each time, rebuilding from a cold
`uv` cache the first time it's invoked.

**pip:**
```sh
pip install jarvis-mcp
```
Puts `jarvis` and `jarvis-server` in the active Python environment's `bin`/`Scripts` directory —
only on `PATH` if that environment (a venv, or `pip install --user`'s target) is.

Two entry points are installed:

| Command | Purpose |
|---------|---------|
| `jarvis` | The indexer CLI (`index`, `list`, `status`, `reindex`, `forget`, `watch`) |
| `jarvis-server` | The MCP stdio server your client connects to |

## Optional extras

| Extra | Install | What it enables |
|-------|---------|-----------------|
| `semantic` | `uv tool install --python 3.13 "jarvis-mcp[semantic]"` | `semanticSearch` (BAAI/bge-m3 embeddings, LanceDB, reciprocal rank fusion) |
| `watch` | `uv tool install --python 3.13 "jarvis-mcp[watch]"` | `jarvis watch` (debounced auto-reindex via `watchdog`) |

Both can be combined: `uv tool install --python 3.13 "jarvis-mcp[semantic,watch]"`.

## External binaries (`setup.sh`)

```sh
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh
```

`setup.sh` installs into `~/.jarvis/bin`:

| Binary | What it does |
|--------|-------------|
| `scip` | Fork build (upstream v0.9.0 + [scip#465](https://github.com/sourcegraph/scip/pull/465) fix) — converts `.scip` to SQLite via `scip expt-convert` |
| `zoekt-git-index` / `zoekt-webserver` | Lexical search (cross-compiled, pinned via `ZOEKT_COMMIT`) |
| `scip-typescript` | TypeScript/JavaScript indexer |
| `scip-python` | Python indexer |
| `scip-swift` (macOS arm64 only) | Swift indexer (v0.1.2) |
| `scip-java` | Java/Kotlin indexer (needs `java` on PATH) |

`setup.sh` is idempotent. Options: `--only <name>` (one dependency), `--force` (reinstall),
`--help`.

:::caution[Java / Kotlin limits]
Android/Gradle projects and Kotlin repos not on the pinned Kotlin version cannot produce a SCIP
index and are published search-only (lexical and semantic search work; navigation does not). See
[Troubleshooting: Upstream Issues](/troubleshooting/upstream-issues).
:::

## Data directory

jarvis stores everything under `~/.jarvis/`:

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

See [Concepts: Architecture](/concepts/architecture) for the full data layout.
