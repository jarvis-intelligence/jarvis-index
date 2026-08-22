---
title: jarvis watch
description: "jarvis watch — auto-reindex on file changes. Requires the [watch] extra."
---

Watch a repo and debounce-reindex on filesystem changes.

## Prerequisite: the `[watch]` extra

```sh
uv tool install "jarvis-mcp[watch]"
```

This installs `watchdog` (optional dependency; its import is deferred, so a base install never
needs it just to run `jarvis index`/`list`/`status`). Without the extra, `jarvis watch` fails
with an install hint. See the [Quickstart's optional extras](/quickstart/) tip before installing.

## Usage

```sh
jarvis watch <path> [options]
```

## Arguments

| Name | Required | Description |
|------|----------|--------------|
| `path` | yes | Path to the repo to watch |

## Options

| Flag | Description |
|------|-------------|
| `--slug <name>` | Override the auto-derived slug |
| `--scheme <name>` | Xcode scheme to build (Swift repos using xcodebuild with more than one scheme) |
| `--debounce <seconds>` | Quiet-period seconds, `float`, default `5.0` |
| `--language <name>` | Force the indexer language instead of detecting it from git-tracked files. Persisted and reused by `reindex`/`watch` |

## Behavior

- Not a daemon requirement — an optional foreground command a user runs while actively editing.
- Debounced auto-reindex: filesystem events trigger a reindex only after `--debounce` seconds of
  quiet, so a burst of saves triggers one reindex, not one per file.
- Reuses the options persisted at `jarvis index` time (`--search-only`, `--semantic-include`,
  `--scheme`) unless overridden on the command line.

## Example

```sh
jarvis watch /path/to/your/repo --debounce 3
```
