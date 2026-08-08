---
description: "Zoekt provides fast lexical and regex search across your indexed repositories."
---

# Zoekt search

[Zoekt](https://github.com/sourcegraph/zoekt) is the lexical/regex search engine jarvis embeds.
It supports fast text and regex queries across all indexed repositories.

## Git-indexed

Zoekt indexes **git-tracked files only**:

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

Zoekt derives the repo name from the git remote URL if not pinned. To avoid basename collisions,
`setup.sh` pins each repo with `git config zoekt.name <slug>`. If you index manually and see
results from the wrong repo, run that command in the repo and reindex.
