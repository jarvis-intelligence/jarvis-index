---
title: jarvis index
description: "jarvis index — index a repo for SCIP navigation and Zoekt search."
---

# jarvis index

Index a repo: detect language, run the language indexer, convert to SQLite, build Zoekt (and
optional semantic) indexes, atomically publish.

## Usage

```sh
jarvis index <path> [options]
```

## Arguments

| Name | Required | Description |
|------|----------|-------------|
| `path` | yes | Path to the repo to index |

## Options

| Flag | Description |
|------|-------------|
| `--slug <name>` | Override the auto-derived slug |
| `--language <name>` | Force the indexer language instead of detecting from git-tracked files (persisted; reused by `reindex`/`watch`) |
| `--search-only` | Skip SCIP indexing and publish only Zoekt + semantic search (persisted; reused by `reindex`/`watch`) |
| `--scheme <name>` | Xcode scheme to build (Swift repos using xcodebuild with more than one scheme) |
| `--semantic-include <path>` | Force-include a path prefix the generated-file filter would skip (repeatable; persisted; reused by `reindex`/`watch`) |

## Behavior

1. **Language detection** — by file-extension plurality among git-tracked files.
2. **Language indexer** — the matching `scip-*` CLI emits `.scip` protobuf.
3. **SCIP → SQLite** — `scip expt-convert` produces `index-<sha>.db`.
4. **Zoekt** — `zoekt-git-index` builds search shards from git-tracked files.
5. **Optional semantic** — if `[semantic]` extra installed: tree-sitter chunk + bge-m3 embed →
   LanceDB. Non-fatal on failure (never blocks publish).
6. **Atomic publish** — `os.replace()` pointer swap on the `current` file.

## The fallback ladder

When a language indexer produces zero SCIP shards, jarvis auto-falls-back to `--search-only`:

- **scip-java + Android/AGP** — AGP replaces source sets; zero shards
  ([scip-java#177](https://github.com/sourcegraph/scip-java/issues/177))
- **scip-kotlinc version mismatch** — compiler-plugin API unstable across versions

Navigation tools won't work in search-only mode, but `searchCode` and `semanticSearch` will.

## Example

```sh
jarvis index /path/to/your/repo
jarvis index /path/to/repo --language python --slug my-repo
```
