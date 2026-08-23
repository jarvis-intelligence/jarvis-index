---
title: Zoekt search
description: "Zoekt provides fast lexical and regex search across your indexed repositories."
---

[Zoekt](https://github.com/sourcegraph/zoekt) is the trigram-indexed lexical/regex search engine
jarvis embeds. Trigram indexing means every 3-character substring of the corpus is indexed up
front, so both plain-text and regex queries run as fast index lookups instead of a full scan.

## Git-indexed

jarvis builds the Zoekt index with `zoekt-git-index` — the git-aware indexer, not the plain
`zoekt-index` binary. `setup.sh` installs `zoekt-git-index` and `zoekt-webserver` only; nothing
in jarvis calls `zoekt-index`, and it is deliberately not installed as a fallback, because
falling back would silently reintroduce ignored files into the search index. Indexing from the
git tree means:

- Gitignored content is excluded by construction — no denylist to maintain.
- Search reflects `HEAD` (committed code), while SCIP reflects the working tree at index time.
- Faster than a filesystem walk (uses the git blob cache).

## The webserver lifecycle

The `searchCode` tool talks to a `zoekt-webserver` subprocess:

1. First `searchCode` call → `ZoektLifecycle.ensure_running()` spawns `zoekt-webserver -rpc`
   (tracked via pidfile at `~/.jarvis/.zoekt/zoekt-webserver.pid`).
2. HTTP POST to `http://localhost:<port>/api/search` with the query.
3. Parse JSON response, wrap in result types.
4. The webserver is killed cleanly when `jarvis-server` exits.

The first search after server start takes ~2 seconds (webserver spawn); subsequent searches are
cached and return in under 500ms.

## Sharding

When a repo's Zoekt index exceeds 100 MiB, Zoekt splits it into multiple shards
(`<slug>_v16.00000.zoekt`, `<slug>_v16.00001.zoekt`, ...). This is automatic and transparent.

## Repo name pinning

Without a pin, Zoekt's repo filter falls back to the basename of the directory you indexed —
which can diverge from jarvis's `--slug` if one was passed, and collides whenever two indexed
repos share a directory basename (e.g. two checkouts both named `api`). `setup.sh` avoids this
by pinning each repo with `git config zoekt.name <slug>`. If you index manually and see results
from the wrong repo, run that command in the repo and reindex; unscoped searches (no `repo`
filter) are unaffected by the collision either way.

## Search hit shape

`searchCode` returns each match as a flat hit object:

```json
{"repo": "toy-repo", "path": "toy/greeter.py", "lineNumber": 5, "lineText": "def greet(name):"}
```

`hits` is a list of these, plus a top-level `total`. There is no freshness object on
`searchCode` — Zoekt has no notion of a published SCIP snapshot to report staleness against.
