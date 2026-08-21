---
title: Cursor
description: "Register jarvis with Cursor via plugin or manual MCP config."
---

# Cursor

Two paths: install the plugin or register the MCP server manually. Cursor reads
`plugin/.cursor-plugin/plugin.json` and `plugin/mcp.json` for the plugin path.

## Option A: Install the plugin

The Cursor plugin lives at [`plugin/.cursor-plugin/plugin.json`](https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/.cursor-plugin/plugin.json).
See the plugin's [README](https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/README.md)
for install instructions.

## Option B: Manual MCP registration

Add the `jarvis` server to Cursor's MCP settings using the block from
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

After registering, use Cursor's MCP tool browser or ask the agent to call `getIndexStatus` with
your repo slug.
