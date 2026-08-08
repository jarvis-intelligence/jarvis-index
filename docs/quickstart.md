---
description: "Install jarvis and index your first repo in five minutes."
---

# Quickstart

Get local-first code intelligence running on your machine. Index your own repositories with
SCIP and Zoekt, then query them from Claude Code, Cursor, or Codex CLI.

## What you'll get

A working `jarvis` installation with one indexed repo, ready for your agent to query structural
code information — *who calls this?*, *where is this defined?*

## Prerequisites

- macOS or Linux
- Python 3.12+ (for `uv`)
- `git`

## Step 1: External binaries

Install the external binaries (scip, zoekt, language indexers) to `~/.jarvis/bin`:

```sh
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh
```

`setup.sh` is idempotent; re-running skips what is already present. Options: `--only <name>`,
`--force`, `--help`.

## Step 2: The CLI + MCP server

```sh
uv tool install jarvis-mcp
```

## Step 3: Index a repo

The slug defaults to the directory name.

```sh
jarvis index /path/to/your/repo
```

## Step 4: Verify

```sh
jarvis status <slug>          # expect: indexed
```

Then register the MCP server with your client — see the
[Integration Guides](/integrations/) — or skip that entirely by installing the plugin below,
which registers it for you.

> The full Quickstart (with your first MCP query) is being authored. See
> [Concepts](/concepts/scip) and [Tools](/tools/) in the meantime.
