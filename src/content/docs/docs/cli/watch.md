---
title: jarvis watch
description: "jarvis watch — auto-reindex on file changes. Requires the [watch] extra."
---

# jarvis watch

Watch a repo and debounce-reindex on filesystem changes.

## Prerequisite: the `[watch]` extra

```sh
uv tool install "jarvis-mcp[watch]"
```

This installs `watchdog` (>=4.0). Without the extra, `jarvis watch` fails with an install hint.

## Usage

```sh
jarvis watch <path> [options]
```

## Arguments

| Name | Required | Description |
|------|----------|-------------|
| `path` | yes | Path to the repo to watch |

## Options

| Flag | Description |
|------|-------------|
| `--slug <name>` | Override the auto-derived slug |
| `--debounce <seconds>` | Quiet-period seconds (default: 5.0) |
| `--language <name>` | Force the indexer language (persisted) |
| `--scheme <name>` | Xcode scheme to build (Swift repos) |

## Behavior

Debounced auto-reindex: filesystem events trigger a reindex after the quiet period elapses.
Persisted flags from the original `jarvis index` are reused.
