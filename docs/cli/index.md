---
description: "The jarvis CLI: index, list, status, reindex, forget, watch."
---

# CLI

The `jarvis` command is the indexer CLI. It manages repo indexing, the registry, and the
dependency graph.

## Entry points

| Command | Purpose |
|---------|---------|
| `jarvis` | The indexer CLI (this section) |
| `jarvis-server` | The MCP stdio server your client connects to |

## Subcommands

| Command | Purpose | Prerequisites |
|---------|---------|---------------|
| [`jarvis index`](/cli/index-cmd) | Index a repo | External binaries via `setup.sh` |
| [`jarvis list`](/cli/list) | List indexed repos | — |
| [`jarvis status`](/cli/status) | Show a repo's index status | — |
| [`jarvis reindex`](/cli/reindex) | Re-run indexing for a registered repo | — |
| [`jarvis forget`](/cli/forget) | Remove a repo's registration and index | — |
| [`jarvis watch`](/cli/watch) | Watch a repo and auto-reindex on change | `[watch]` extra |
