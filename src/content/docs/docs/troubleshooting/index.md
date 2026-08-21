---
title: Troubleshooting
description: "Diagnostic decision tree for when a jarvis tool returns empty or an error."
---

# Troubleshooting

A jarvis tool returned empty or an error. Start here.

## Which tool?

### Navigation tools return empty
(`documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`, `typeHierarchy`)

1. Run `jarvis status <slug>`. Is the repo indexed?
   - **Not indexed** → run `jarvis index <slug>` and try again.
   - **Indexed** → continue.

2. Does status show SCIP coverage or search-only fallback?
   - **Search-only** → the language indexer produced zero shards. Install the right language
     indexer via `setup.sh` and reindex. See [Common Failures: nav empty but search works](/troubleshooting/common-failures#nav-empty-but-search-works).
   - **SCIP coverage** → continue.

3. Is it `typeHierarchy` specifically?
   - **Yes** → upstream `scip` v0.9.0 doesn't populate `relationships`. Ensure the fork build is
     installed. See [Upstream Issues: typeHierarchy](/troubleshooting/upstream-issues#typehierarchy-empty-on-upstream-scip).
   - **No** → check the symbol name. Bare names that collide across packages return
     `candidates`. Try a qualified name.

### Search tools return empty
(`searchCode`, `semanticSearch`)

1. Is it `semanticSearch`?
   - → Check the `[semantic]` extra is installed. See
     [Common Failures: semanticSearch error](/troubleshooting/common-failures#semanticsearch-returns-an-error).

2. Is it `searchCode`?
   - → Check the Zoekt repo name pin. See
     [Common Failures: wrong repo / missing repo](/troubleshooting/common-failures#searchcode-returns-results-from-the-wrong-repo).

### getIndexStatus reports stale

→ Reindex: `jarvis reindex <slug>`. See [Common Failures: stale](/troubleshooting/common-failures#getindexstatus-reports-stale).

### blastRadius freshness is "unknown"

→ This is **by design** (no per-node timestamp on the graph). See
[Common Failures: blastRadius unknown](/troubleshooting/common-failures#blastradius-freshness-is-always-unknown).

---

## Reference pages

- [Upstream Issues](/troubleshooting/upstream-issues) — known issues in scip, scip-java, Kotlin
- [Common Failures](/troubleshooting/common-failures) — operational failures with fixes
