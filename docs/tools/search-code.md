---
description: "searchCode — lexical and regex search via Zoekt."
---

# searchCode

Lexical search via an embedded Zoekt index (lazy-started on first call).

## Signature

```
searchCode(query, repo=None) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | yes | Search query (text or regex) |
| `repo` | string | no | If given, applied as a Zoekt `r:` filter scoping results to that one repo |

## Returns

```json
{
  "query": "authenticate",
  "hits": [{ "repo": "my-slug", "path": "src/auth.py", "lineNumber": 42, "lineText": "def authenticate(user):" }],
  "total": 1
}
```

## Zoekt lifecycle

The `zoekt-webserver` is lazy-started on the first `searchCode` call (via
`ZoektLifecycle.ensure_running()`), tracked with a pidfile, and killed at server exit. The first
call takes ~2 seconds; subsequent calls return in under 500ms. See
[Concepts: Zoekt](/concepts/zoekt).

## Repo filter

Pass `repo` to scope results. Under the hood this applies Zoekt's `r:<slug>` filter.
