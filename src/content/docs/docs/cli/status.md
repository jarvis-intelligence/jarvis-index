---
title: jarvis status
description: "jarvis status — show a repo's index status and freshness."
---

Show a repo's publish state: whether it's indexed, the schema version, and freshness.

## Usage

```sh
jarvis status <slug>
```

## Arguments

| Name | Required | Description |
|------|----------|--------------|
| `slug` | yes | The repo slug (from `jarvis index`) |

No flags.

## Output

```
slug: your-repo
path: /path/to/your-repo
language: python
status: indexed
commit: abc1234
last_indexed: 2026-08-22T10:00:00+00:00
semantic: -
```

`status` is usually `indexed` or `failed`, but can also be `partial`: the index published real
symbols but no navigable positions (an indexer/converter bug) — check the stderr tail printed
below the summary for details. This is a settled, documented outcome, not a TODO.

**Staleness** is a separate dimension from `status`: the published commit can differ from the
repo's current `git rev-parse HEAD` even while `status` stays `indexed`. Re-run `jarvis reindex
<slug>` when that happens. The MCP-side equivalent — which also reports staleness plus search
coverage — is [getIndexStatus](/tools/get-index-status/).
