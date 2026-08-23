---
title: Claude Code
description: "Register jarvis with Claude Code via plugin or manual MCP config."
---

Looking for [Cursor](/integrations/cursor/), [Codex CLI](/integrations/codex-cli/), or
[any other stdio client](/integrations/generic-stdio/)? See their guides — this page covers
Claude Code.

Two paths get jarvis running: the plugin (recommended) or a manual command.

### Plugin (recommended)

Installing the plugin registers the `jarvis` MCP server for you and bundles the `jarvis-setup`,
`jarvis-use`, and `jarvis-issues` skills:

```sh
/plugin marketplace add jarvis-intelligence/jarvis-index
/plugin install jarvis@jarvis
```

### Manual

```sh
claude mcp add jarvis --scope user -- jarvis-server
```

This requires `jarvis-server` on `PATH`. For GUI-launched sessions where `PATH` isn't inherited,
use the absolute path from `which jarvis-server` instead — see
[PATH troubleshooting](/troubleshooting/common-failures/#jarvis-or-jarvis-server-not-found-path).

## Verify

After registering, ask Claude Code to call the jarvis `getIndexStatus` tool with your repo slug.
Expect a JSON response naming your repo's index status.
