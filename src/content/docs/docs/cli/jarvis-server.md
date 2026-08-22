---
title: jarvis-server
description: "jarvis-server — the stdio MCP server every client config launches."
---

## Usage

```sh
jarvis-server
```

No arguments. Reads stdio, exits on EOF.

## Behavior

`jarvis-server` is the stdio MCP server entry point installed by the `jarvis-mcp` package
(`[project.scripts]` maps `jarvis-server` to `jarvis.server:main`). It serves the 9 MCP tools
(`documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`, `typeHierarchy`,
`getIndexStatus`, `searchCode`, `semanticSearch`, `blastRadius`) over stdio — one process per
connected client.

Clients normally launch it via `uvx`, not by calling `jarvis-server` directly:

```sh
uvx --from jarvis-mcp>=0.6.0 jarvis-server
```

This is the exact command string registered in every MCP client config (see
[Integrations](/integrations/) for per-client setup).

## Verify

After registering, ask the agent to call `getIndexStatus` with an indexed slug — a response
means the server started and can reach the registry.
