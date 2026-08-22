---
title: CLI
description: "The jarvis CLI: index, list, status, reindex, forget, watch, jarvis-server."
---

Two commands ship with the `jarvis-mcp` package: `jarvis` is the indexer CLI you run yourself;
`jarvis-server` is the MCP stdio server your client launches on your behalf.

| Command | What it does | Reference |
|---------|---------------|-----------|
| `jarvis index` | Index a repo for SCIP navigation and Zoekt search | [/cli/index-cmd/](/cli/index-cmd/) |
| `jarvis list` | List registered repos with their slugs and statuses | [/cli/list/](/cli/list/) |
| `jarvis status` | Show a single repo's index status and freshness | [/cli/status/](/cli/status/) |
| `jarvis reindex` | Rebuild an already-registered repo's index | [/cli/reindex/](/cli/reindex/) |
| `jarvis forget` | Remove a repo's registration and published index | [/cli/forget/](/cli/forget/) |
| `jarvis watch` | Auto-reindex on filesystem changes (`[watch]` extra) | [/cli/watch/](/cli/watch/) |
| `jarvis-server` | The MCP stdio server your client connects to | [/cli/jarvis-server/](/cli/jarvis-server/) |
