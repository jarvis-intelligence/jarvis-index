---
title: Codex CLI
description: "Register jarvis with Codex CLI via plugin or manual MCP config."
---

# Codex CLI

Two paths: install the plugin or register the MCP server manually. Codex CLI reads
[`.codex-plugin/plugin.json`](https://github.com/jarvis-intelligence/jarvis-index/blob/main/.codex-plugin/plugin.json)
for the plugin path.

## Option A: Install the plugin

The Codex plugin manifest lives at `.codex-plugin/plugin.json` (version 0.7.1). See the plugin's
[README](https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/README.md) for
install instructions.

## Option B: Manual MCP registration

Add the `jarvis` server using the block from
[`plugin/.mcp.json`](https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/.mcp.json):

```json
{
  "mcpServers": {
    "jarvis": {
      "command": "uvx",
      "args": ["--from", "jarvis-mcp>=0.6.0", "jarvis-server"]
    }
  }
}
```

## Verify

After registering, ask Codex CLI to call a jarvis tool:

> Use the jarvis `getIndexStatus` tool with repo "my-slug".

Expect a response with `{"repo": "my-slug", "indexed": true, ...}`.
