---
title: Integrations
description: "Register jarvis with Claude Code, Cursor, or Codex CLI."
---

# Integrations

jarvis is an MCP stdio server. Any MCP-compatible client can connect to it. The MCP registration
is identical across clients — the `mcpServers` block from `plugin/.mcp.json`:

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

## Guides

| Client | Plugin available | Guide |
|--------|-----------------|-------|
| Claude Code | Yes | [Claude Code setup](/integrations/claude-code) |
| Cursor | Yes | [Cursor setup](/integrations/cursor) |
| Codex CLI | Yes | [Codex CLI setup](/integrations/codex-cli) |

Installing the plugin auto-registers the server and bundles three skills:
`jarvis-setup` (onboarding), `jarvis-use` (steers the agent toward structural queries over grep),
and `jarvis-issues` (files well-formed bug reports).
