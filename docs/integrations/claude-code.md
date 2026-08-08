---
description: "Register jarvis with Claude Code via plugin or manual MCP config."
---

# Claude Code

Two paths: install the plugin (preferred — registers the server and bundles skills) or register
the MCP server manually.

## Option A: Install the plugin (recommended)

The Claude Code plugin lives at [`plugin/.claude-plugin/plugin.json`](https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/.claude-plugin/plugin.json). Installing it:

- Registers the `jarvis` MCP server automatically
- Bundles three skills: `jarvis-setup`, `jarvis-use`, `jarvis-issues`

See the plugin's [README](https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/README.md)
for the install command.

## Option B: Manual MCP registration

Add the `jarvis` server to your Claude Code MCP config using the block from
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

The `>=0.6.0` floor ensures the `index` subcommand is available.

## Verify

After registering, ask Claude Code to call a jarvis tool:

> Use the jarvis `getIndexStatus` tool with repo "my-slug".

Expect a response with `{"repo": "my-slug", "indexed": true, ...}`.
