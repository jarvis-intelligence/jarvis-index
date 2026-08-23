---
title: Codex CLI
description: "Register jarvis with Codex CLI via plugin or manual MCP config."
---

Looking for [Claude Code](/integrations/claude-code/), [Cursor](/integrations/cursor/), or
[any other stdio client](/integrations/generic-stdio/)? See their guides — this page covers
Codex CLI.

Codex CLI has no MCP install URL scheme, so the command and config below ARE the install path.
Two options: the plugin marketplace or a manual config edit.

### Plugin marketplace

```sh
codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main
codex plugin add jarvis
```

The repo-root [`.codex-plugin/plugin.json`](https://github.com/jarvis-intelligence/jarvis-index/blob/main/.codex-plugin/plugin.json)
manifest points into `plugin/`, registering the server and bundling all three skills.

### Manual

Add the block below to your Codex MCP configuration under `~/.codex`:

```json title="mcp.json"
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

After registering, ask Codex CLI to call the jarvis `getIndexStatus` tool with your repo slug.
Expect a JSON response naming your repo's index status.
