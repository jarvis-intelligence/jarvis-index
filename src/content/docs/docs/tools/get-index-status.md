---
title: getIndexStatus
description: "getIndexStatus — whether a repo is indexed, fresh, and search-complete."
---

Whether `repo` has a published index, its freshness, its search coverage, and what it can do
right now.

## Signature

```
getIndexStatus(repo: str, repo_path: str | None = None)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `repo_path` | string | no | Local git working directory — pass to compare the published commit against `git rev-parse HEAD` |

## Returns

```json
{
  "repo": "toy-repo",
  "indexed": true,
  "status": "indexed",
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00",
  "searchCoverage": { "expected": 120, "indexed": 120, "complete": true },
  "last_index_run": {
    "outcome": "indexed",
    "origin": "signature",
    "reason": null,
    "recovery": null
  },
  "capabilities": {
    "navigation": { "available": true, "reason": null, "recovery": null },
    "search": { "available": true, "reason": null },
    "semantic": { "available": false, "reason": "semantic index not built for this repo (requires the `semantic` extra)" }
  }
}
```

Without `repo_path`, freshness is reported without a staleness check (never `stale: true`
without evidence). `searchCoverage` is `null` (with `searchCoverageReason` explaining why) when
it can't be computed — e.g. `zoekt-webserver` not running, or the repo predates coverage
tracking. `last_index_run` reports what the most recent `jarvis index`/`reindex`/`watch` run did;
`capabilities.*` reports what the system can do right now, read straight from disk and the
registry — a failed run can still leave navigation available on a stale, previously-published
index, which is why `last_index_run.outcome` and `capabilities.navigation.available` are
independent fields, not one collapsed into the other.

`status` is one of `indexed`, `partial` (real symbols published, but no navigable positions),
`failed`, `search-only`, `indexing`, or `null` (never registered at all).

## Example

**Call:**
```json
{ "repo": "toy-repo" }
```

**Response:**
```json
{
  "repo": "toy-repo",
  "indexed": true,
  "status": null,
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00",
  "searchCoverage": null,
  "searchCoverageReason": "no tracked-file count recorded — reindex this repo to enable the coverage check",
  "last_index_run": null,
  "capabilities": null
}
```

`status` is `null` here because the fixture publishes an index directly without registering a
row — a repo indexed through the normal `jarvis index` CLI always has a `status`.

## Search-only repos

When a navigation tool (`documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`,
`typeHierarchy`) is called against a repo that was published search-only, it returns this
explanation instead of a generic "not found" error:

```
{repo} is indexed search-only: it has no SCIP index, so navigation tools cannot answer.
searchCode and semanticSearch do work on it. This happens when the language's indexer cannot
build the repo — for example an Android/Gradle project.
```

`getIndexStatus` on the same repo reports `"indexed": false`, `"status": "search-only"`, and
`capabilities.navigation.available: false` with that same reasoning in
`capabilities.navigation.reason`.

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising:

```json
{ "error": "kaboom" }
```
