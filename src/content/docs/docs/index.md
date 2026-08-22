---
title: jarvis docs
description: "jarvis docs — local-first code intelligence for coding agents using Claude Code, Cursor, and Codex CLI."
---

**Local-first code intelligence for coding agents.** jarvis exposes nine MCP tools — navigation
(`goToDefinition`, `findReferences`, `callHierarchy`, `typeHierarchy`, `documentSymbols`),
search (`searchCode`, `semanticSearch`), and scope (`blastRadius`, `getIndexStatus`) — computed
from a local SCIP + Zoekt index of your own repositories. Everything runs on your machine: no
server, no auth, no network, and your code never leaves it.

## Start here

1. [Quickstart](/quickstart/) — install, index your first repo, run your first tool call
2. [Check your language is supported](/guide/requirements/) — before you install
3. [Install](/guide/install/) / [Install Channels](/guide/install-matrix/) — PyPI, plugins, or the MCP Registry

## Everything else

| Section | What's there |
|---------|--------------|
| [Guide](/guide/install/) | Requirements, install methods, and the four-channel install matrix |
| [Concepts](/concepts/scip/) | How SCIP navigation, Zoekt search, semantic search, and blast radius actually work |
| [MCP Tools](/tools/) | Reference for all 9 tools — signature, parameters, real response shapes |
| [CLI](/cli/) | The `jarvis` indexer CLI and the `jarvis-server` MCP entry point |
| [Integrations](/integrations/) | Register jarvis with Claude Code, Cursor, Codex CLI, or any stdio client |
| [Troubleshooting](/troubleshooting/) | Common failures and known upstream limitations |

See also the [Changelog](/changelog/).
