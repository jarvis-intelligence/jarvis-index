---
title: Integrations
description: "Register jarvis with Claude Code, Cursor, Codex CLI, or any other stdio client."
---

jarvis is an MCP stdio server. Any MCP-compatible client can connect to it — pick your client
below for the fastest path.

| Client | Path | Guide |
|--------|------|-------|
| Claude Code | Plugin (auto-registers) or manual `claude mcp add` | [Claude Code](/integrations/claude-code/) |
| Cursor | One-click install link, plugin marketplace, or manual | [Cursor](/integrations/cursor/) |
| Codex CLI | Plugin marketplace or manual config | [Codex CLI](/integrations/codex-cli/) |
| Any stdio client | Manual JSON block | [Any stdio client](/integrations/generic-stdio/) |

Installing a plugin auto-registers the server and, for Claude Code and Codex CLI, bundles three
skills: `jarvis-setup` (onboarding), `jarvis-use` (steers the agent toward structural queries
over grep), and `jarvis-issues` (files well-formed bug reports).

For a broader comparison of install channels — PyPI, plugins, and the MCP Registry — see the
[install channels matrix](/guide/install-matrix/).
