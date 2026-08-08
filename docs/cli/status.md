---
description: "jarvis status — show a repo's index status and freshness."
---

# jarvis status

Show a repo's publish state: whether it's indexed, the schema version, and freshness.

## Usage

```sh
jarvis status <slug>
```

## Arguments

| Name | Required | Description |
|------|----------|-------------|
| `slug` | yes | The repo slug (from `jarvis index`) |

## Output

Reports the published commit SHA, document count, and a `Freshness` value:

- **`fresh`** — published SHA matches `git rev-parse HEAD`
- **`stale`** — published SHA differs from HEAD (reindex recommended)
- **`unknown`** — repo not indexed or no git dir to compare against
