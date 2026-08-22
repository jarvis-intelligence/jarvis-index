---
title: jarvis index
description: "jarvis index — index a repo for SCIP navigation and Zoekt search."
---

Index a repo: detect language, run the language indexer, convert to SQLite, build Zoekt (and
optional semantic) indexes, atomically publish.

## Usage

```sh
jarvis index <path> [options]
```

## Arguments

| Name | Required | Description |
|------|----------|--------------|
| `path` | yes | Path to the repo to index |

## Options

| Flag | Description |
|------|-------------|
| `--slug <name>` | Override the auto-derived slug |
| `--scheme <name>` | Xcode scheme to build (Swift repos using xcodebuild with more than one scheme) |
| `--semantic-include <path>` | Force-include a path prefix the generated-file filter would skip. Repeatable — pass it once per prefix. Persisted and reused by `reindex`/`watch` |
| `--language <name>` | Force the indexer language instead of detecting it from git-tracked files. Choices: `java`, `python`, `swift`, `typescript`. Persisted and reused by `reindex`/`watch` |
| `--search-only` | Skip SCIP indexing and publish only Zoekt + semantic search. Persisted and reused by `reindex`/`watch` |

## Behavior

1. **Language detection** — counts source files by extension across git-tracked files only (a
   filesystem walk would also count gitignored scratch directories) and picks the winner; one
   language per repo. Extension families: `.ts`/`.tsx` → `typescript`, `.py` → `python`,
   `.java`/`.kt` → `java`, `.swift` → `swift`. Ties break by fixed priority: `.ts`, `.tsx`, `.py`,
   `.java`, `.kt`, `.swift`. `--language` overrides detection entirely.
2. **Language indexer** — the matching `scip-*` CLI emits a `.scip` protobuf file.
3. **scip version gate** — `jarvis index` refuses to run `scip expt-convert` below scip 0.9.0.
   This is a settled behavior, not a conservative default: older `scip` silently writes a
   schema-valid database with zero chunks and zero mentions, so every navigation query returns
   empty with no error. Re-run `setup.sh` to get a compliant `scip` build.
4. **SCIP → SQLite** — `scip expt-convert` produces `index-<sha>.db`.
5. **Zoekt** — `zoekt-git-index` builds search shards from git-tracked files.
6. **Optional semantic** — if the `[semantic]` extra is installed: tree-sitter chunk + bge-m3
   embed → LanceDB. Non-fatal on failure; never blocks publish.
7. **Search-only publishing** — with `--search-only` (or after an automatic fallback), SCIP
   indexing is skipped entirely: only Zoekt and semantic search are published. Navigation tools
   (`goToDefinition`, `findReferences`, `callHierarchy`, `typeHierarchy`, `documentSymbols`) don't
   work on a search-only repo; `searchCode` and `semanticSearch` do.
8. **Persisted options** — `--search-only`, `--semantic-include`, `--scheme`, and `--language`
   are recorded in the registry and reused automatically by `jarvis reindex` and `jarvis watch`;
   there is no flag to clear them — re-run `jarvis index` with new values to change them.
9. **Atomic publish** — `os.replace()` pointer swap on the `current` file; a `status`/`reindex`
   never observes a half-written index.

## The fallback ladder

When a language indexer produces zero SCIP shards, jarvis auto-falls back to `--search-only`:

- **scip-java + Android/AGP** — AGP replaces source sets; zero shards
  ([scip-java#177](https://github.com/sourcegraph/scip-java/issues/177))
- **scip-kotlinc version mismatch** — compiler-plugin API unstable across versions

## Example

```sh
jarvis index /path/to/your/repo
jarvis status your-repo
```

```
slug: your-repo
path: /path/to/your/repo
language: python
status: indexed
commit: abc1234
last_indexed: 2026-08-22T10:00:00+00:00
semantic: -
```
