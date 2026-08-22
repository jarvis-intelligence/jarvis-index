---
title: Troubleshooting
description: "Diagnostic decision tree for when a jarvis tool returns empty or an error."
---

# Troubleshooting

A jarvis tool returned empty or an error. Start here.

## Start here: the three most common failures

| Symptom | Entry |
|---------|-------|
| First MCP connect never finishes | [First MCP connect times out (uvx cold start)](/troubleshooting/common-failures/#first-mcp-connect-times-out-uvx-cold-start) |
| `jarvis`/`jarvis-server` command not found | [jarvis or jarvis-server not found (PATH)](/troubleshooting/common-failures/#jarvis-or-jarvis-server-not-found-path) |
| `jarvis index` refuses to run | [jarvis index refuses an old scip (version gate)](/troubleshooting/common-failures/#jarvis-index-refuses-an-old-scip-version-gate) |

## Which tool?

### Navigation tools return empty
(`documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`, `typeHierarchy`)

1. Run `jarvis status <slug>`. Is the repo indexed?
   - **Not indexed** → run `jarvis index <slug>` and try again.
   - **Indexed** → continue.

2. Does status show SCIP coverage or search-only fallback?
   - **Search-only** → the language indexer produced zero shards. Install the right language
     indexer via `setup.sh` and reindex. See [Common Failures: navigation empty but search
     works](/troubleshooting/common-failures/#navigation-empty-but-search-works-search-only).
   - **SCIP coverage** → continue.

3. Is it `typeHierarchy` specifically?
   - **Yes** → upstream `scip` v0.9.0 doesn't populate `relationships`. Ensure the fork build is
     installed. See [Upstream Issues: typeHierarchy](/troubleshooting/upstream-issues/#typehierarchy-empty-on-upstream-scip).
   - **No** → check the symbol name. Bare names that collide across packages return
     `candidates`. Try a qualified name.

### Search tools return empty
(`searchCode`, `semanticSearch`)

1. Is it `semanticSearch`?
   - → Check the `[semantic]` extra is installed, and that the second MCP server is running a
     Python that ships semantic wheels (>=3.12). See
     [Common Failures: semanticSearch error](/troubleshooting/common-failures/#semanticsearch-returns-an-error)
     and [semanticSearch server fails to connect](/troubleshooting/common-failures/#semanticsearch-server-fails-to-connect-python-version).

2. Is it `searchCode`?
   - → Check the Zoekt repo name pin. See
     [Common Failures: wrong repo / missing repo](/troubleshooting/common-failures/#searchcode-returns-results-from-the-wrong-repo).

### getIndexStatus reports stale

→ Reindex: `jarvis reindex <slug>`. See [Common Failures: stale](/troubleshooting/common-failures/#getindexstatus-reports-stale).

### blastRadius freshness is "unknown"

→ This is **by design** (no per-node timestamp on the graph). See
[Common Failures: blastRadius unknown](/troubleshooting/common-failures/#blastradius-freshness-is-always-unknown).

---

## Reference pages

- [Upstream Issues](/troubleshooting/upstream-issues/) — known issues in scip, scip-java, Kotlin
- [Common Failures](/troubleshooting/common-failures/) — operational failures with fixes
