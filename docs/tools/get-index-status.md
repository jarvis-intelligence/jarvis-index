---
description: "getIndexStatus — whether a repo is indexed, fresh, and search-complete."
---

# getIndexStatus

Whether `repo` has a published index, plus freshness and search coverage.

## Signature

```
getIndexStatus(repo, repo_path=None) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `repo_path` | string | no | Local git working directory — pass to compare the published commit against `git rev-parse HEAD` |

## Returns

```json
{
  "repo": "my-slug",
  "indexed": true,
  "status": "...",
  "freshness": { "indexed": true, "stale": false, "published_commit": "abc123" },
  "searchCoverage": { "expected": 120, "indexed": 120, "complete": true },
  "searchCoverageReason": ""
}
```

Without `repo_path`, freshness is reported without a staleness check (never `stale: true`
without evidence). `searchCoverage` is `null` when it can't be computed (e.g. zoekt-webserver not
running); `searchCoverageReason` explains why.

## searchCoverage shape

`{"expected": int, "indexed": int, "complete": bool}` — compares git-tracked files at last index
time against what Zoekt currently holds. Catches shards lost after a successful index.
