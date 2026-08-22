---
title: jarvis list
description: "jarvis list — list all indexed repos."
---

List all repos registered in `registry.db`.

## Usage

```sh
jarvis list
```

No flags.

## Output

One tab-separated row per repo: slug, a status glyph + status string, language, commit SHA (or
`-`), and path. Failed rows carry a sixth column with the failure reason.

```
your-repo	✓ indexed	python	abc1234	/path/to/your-repo
other-repo	◐ search-only	-	-	/path/to/other-repo
broken-repo	✗ failed	java	-	/path/to/broken-repo	scip-java: ConcurrentModificationException
```

See [jarvis status](/cli/status/) for the full status-value list and their meanings.
