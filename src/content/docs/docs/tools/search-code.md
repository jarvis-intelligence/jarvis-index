---
title: searchCode
description: "searchCode — lexical and regex search via Zoekt."
---

Lexical code search via an embedded Zoekt index (lazy-started on first call).

## Signature

```
searchCode(query: str, repo: str | None = None)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | yes | Search query (text or regex) |
| `repo` | string | no | If given, applied as a Zoekt `r:` filter scoping results to that one repo; omitted, results span every indexed repo |

## Returns

```json
{
  "query": "greet",
  "hits": [
    { "repo": "toy-repo", "path": "toy/greeter.py", "lineNumber": 5, "lineText": "def greet(name):" }
  ],
  "total": 1
}
```

This tool has no freshness fields — Zoekt has no per-commit index metadata to report.

## Example

**Call:**
```json
{ "query": "greet" }
```

**Response:**
```json
{
  "query": "greet",
  "hits": [
    { "repo": "toy-repo", "path": "toy/greeter.py", "lineNumber": 5, "lineText": "def greet(name):" }
  ],
  "total": 1
}
```

### Zero hits

```json
{ "query": "nosuchtermanywhere", "hits": [], "total": 0 }
```

## Zoekt lifecycle

`zoekt-webserver` is lazy-started on the first `searchCode` call, tracked with a pidfile, and
killed at server exit. The first call takes a couple seconds; subsequent calls return quickly.
See [Concepts: Zoekt](/concepts/zoekt/).

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising:

```json
{ "error": "zoekt-webserver failed to start" }
```
