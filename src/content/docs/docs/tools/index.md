---
title: Tools
description: "The 9 MCP tools jarvis exposes: navigation, search, graph, and status."
---

jarvis exposes 9 MCP tools; every one takes `repo` (the slug from `jarvis index`) and returns a
structured error object instead of raising on failure — see each tool's Errors section.

| Tool | What it answers | Reference |
|------|------------------|-----------|
| `documentSymbols` | Every symbol defined in a file | [/tools/document-symbols/](/tools/document-symbols/) |
| `goToDefinition` | Where is `X` defined? | [/tools/go-to-definition/](/tools/go-to-definition/) |
| `findReferences` | Everywhere `X` is used | [/tools/find-references/](/tools/find-references/) |
| `callHierarchy` | What calls `X`, and what `X` calls | [/tools/call-hierarchy/](/tools/call-hierarchy/) |
| `typeHierarchy` | Super/subtypes of `X` | [/tools/type-hierarchy/](/tools/type-hierarchy/) |
| `getIndexStatus` | Is this repo indexed? Is it stale? | [/tools/get-index-status/](/tools/get-index-status/) |
| `searchCode` | Lexical search (Zoekt) | [/tools/search-code/](/tools/search-code/) |
| `semanticSearch` | Natural-language search | [/tools/semantic-search/](/tools/semantic-search/) |
| `blastRadius` | Which repos depend on this package | [/tools/blast-radius/](/tools/blast-radius/) |
