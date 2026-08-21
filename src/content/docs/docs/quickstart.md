---
title: Quickstart
description: "Install jarvis and index your first repo in five minutes."
---

# Quickstart

Get local-first code intelligence running on your machine. Index your own repositories with
SCIP and Zoekt, then query them from Claude Code, Cursor, or Codex CLI.

## What you'll get

A working `jarvis` installation with one indexed repo, ready for your agent to query structural
code information — *who calls this?*, *where is this defined?*

## Prerequisites

- macOS or Linux (jarvis does not support Windows)
- Python 3.12+ (for `uv`)
- `git`

## Step 1: External binaries

Install the external binaries (scip, zoekt, language indexers) to `~/.jarvis/bin`:

```sh
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh
```

`setup.sh` is idempotent; re-running skips what is already present. Options: `--only <name>`,
`--force`, `--help`.

After install, ensure `~/.jarvis/bin` is on your `PATH`:

```sh
command -v scip    # should print a path under ~/.jarvis/bin
```

## Step 2: The CLI + MCP server

```sh
uv tool install jarvis-mcp
```

This puts two commands on your `PATH`: `jarvis` (the indexer CLI) and `jarvis-server` (the MCP
server your client connects to).

:::tip[Optional extras]
- `uv tool install "jarvis-mcp[semantic]"` — enables `semanticSearch` (vector + lexical fusion)
- `uv tool install "jarvis-mcp[watch]"` — enables `jarvis watch` (auto-reindex on file changes)
:::

See the [Install guide](/guide/install) for alternatives (pip, uvx ad-hoc).

## Step 3: Index a repo

```sh
jarvis index /path/to/your/repo
```

The slug defaults to the directory name. jarvis detects the primary language by file-extension
plurality, runs the matching language indexer, converts to SQLite, builds the Zoekt search
index, and atomically publishes. See [Concepts: SCIP](/concepts/scip) for the full pipeline.

## Step 4: Verify

```sh
jarvis status <slug>          # expect: indexed
```

Then register the MCP server with your client — see the [Integration Guides](/integrations/) —
or skip that entirely by installing the plugin, which registers it for you.

## Your first query

Once the MCP server is registered, your agent can call jarvis tools. The simplest first call:


**getIndexStatus:**
```json
// "repo" is the slug from `jarvis index`
{ "repo": "my-slug" }
```

**Response:**
```json
{
  "repo": "my-slug",
  "indexed": true,
  "status": "...",
  "freshness": { "indexed": true, "stale": false }
}
```


A real navigation query — find where a symbol is defined:


**goToDefinition:**
```json
{ "repo": "my-slug", "symbol": "MyClass" }
```

**Response:**
```json
{
  "symbol": "MyClass",
  "definitions": [{ "path": "...", "startLine": 42 }],
  "freshness": { "indexed": true }
}
```


The `symbol` argument accepts a bare name (`MyClass`), a qualified name
(`MyClass.method`), or the full SCIP symbol string. See
[goToDefinition](/tools/go-to-definition).

## Next steps

- [Concepts](/concepts/scip) — understand how indexing works
- [Tools](/tools/) — the 9 MCP tools
- [CLI](/cli/) — the `jarvis` indexer CLI
