---
title: jarvis list
description: "jarvis list — list all indexed repos."
---

# jarvis list

List all repos registered in `registry.db`.

## Usage

```sh
jarvis list
```

## Output

One row per repo showing slug, language, status, and last-indexed timestamp. Read directly from
the `repos` table in `~/.jarvis/registry.db`.
