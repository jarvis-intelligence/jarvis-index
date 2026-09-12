---
name: index
description: Index or reindex this repository with jarvis so structural queries work.
argument-hint: "[path]"
disable-model-invocation: true
---

Part of the jarvis toolkit. Siblings: `jarvis-setup` (onboard), `jarvis-use` (everyday queries), `jarvis-issues` (report bugs).

Resolve the target directory from the optional argument. When no argument is supplied, use the current Git repository root.

Prefer `indexRepo` with `path` set to that directory. It starts `jarvis index` as a detached child and returns immediately with the repository slug, state, process ID, and log path. `semantic` defaults to `false`, so this command never downloads an embedding model unless explicitly requested. Poll `getIndexStatus` with the returned slug until `indexed` is true or the `indexing` block reaches a terminal state (`failed-at-startup` or `abandoned`).

If the MCP server is not connected, run `jarvis index <path>` instead. A live build returns an already-running marker rather than spawning a second indexer; report that existing run and continue polling its status.
