---
title: Cursor
description: "Register jarvis with Cursor via a one-click install link, the plugin, or manual MCP config."
---

Looking for [Claude Code](/integrations/claude-code/), [Codex CLI](/integrations/codex-cli/), or
[any other stdio client](/integrations/generic-stdio/)? See their guides — this page covers
Cursor.

The fastest path is the one-click install link below. A plugin marketplace path and a manual
config path are also available.

### One-click install link

[Add jarvis to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=jarvis&config=eyJjb21tYW5kIjoidXZ4IiwiYXJncyI6WyItLWZyb20iLCJqYXJ2aXMtbWNwPj0wLjYuMCIsImphcnZpcy1zZXJ2ZXIiXX0=)

The `config` parameter is the base64-encoded
`{"command":"uvx","args":["--from","jarvis-mcp>=0.6.0","jarvis-server"]}` block — decode it
yourself before trusting any install link.

### Plugin marketplace

Cursor's plugin marketplace needs a Teams/Enterprise account, or a local symlink:

```sh
# Teams/Enterprise: Dashboard → Plugins → Add Marketplace → Import from Repo
# Otherwise, clone this repo and:
ln -s "$PWD/jarvis-index/plugin" ~/.cursor/plugins/local/jarvis
```

### Manual

Add the block below to Cursor's MCP settings:

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

After registering, ask the agent to call the jarvis `getIndexStatus` tool with your repo slug.
Expect a JSON response naming your repo's index status.
