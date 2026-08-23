---
title: Any stdio client
description: "Register jarvis with any MCP client that can launch a stdio server."
---

Looking for [Claude Code](/integrations/claude-code/), [Cursor](/integrations/cursor/), or
[Codex CLI](/integrations/codex-cli/)? See their dedicated guides — this page covers every other
MCP client.

Any MCP client that can launch a stdio server can run jarvis with this one block.

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

Paste this into your client's MCP config file — the file name and location vary by client; see
the Claude Code, Cursor, and Codex CLI guides above for concrete paths.

## Verify

After registering, ask the agent to call the jarvis `getIndexStatus` tool with an indexed repo
slug. A JSON response — even an error object — proves the server is wired.
