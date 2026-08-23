---
title: typeHierarchy
description: "typeHierarchy — super/subtypes of a symbol."
---

Single-level super/subtypes for `symbol` within `repo`.

## Signature

```
typeHierarchy(repo: str, symbol: str)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | A bare name, a qualified name, or a full SCIP symbol string |

## Returns

```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "...",
  "supertypes": [
    {
      "symbol": { "symbol": "...", "displayName": "...", "kind": "..." },
      "location": { "path": "...", "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 0 } } }
    }
  ],
  "subtypes": [],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

Both arrays are single-level. `resolvedSymbol` appears only when resolution changed the input.

## Example

**Call:**
```json
{ "repo": "toy-repo", "symbol": "Greeter" }
```

**Response:**
```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#",
  "supertypes": [
    {
      "symbol": {
        "symbol": "scip-typescript npm @toy/pkg 0.0.1 src/`animal.ts`/Animal#",
        "displayName": "Animal",
        "kind": "INTERFACE"
      },
      "location": {
        "path": "toy/animal.ts",
        "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 2, "character": 1 } }
      }
    }
  ],
  "subtypes": [],
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

`Greeter` implements `Animal`, so `supertypes` names it; nothing in the fixture implements
`Greeter` itself, so `subtypes` is a real, honest empty array.

## Errors

Every tool returns a JSON object with an `"error"` string instead of raising:

```json
{ "error": "no symbol named 'NoSuchSymbol' in this index" }
```

## Unavailable: no relationship data

When the index carries no relationship data at all, `typeHierarchy` returns an explicit error
instead of an empty result — an empty array would wrongly assert the symbol has no supertypes,
when the truth is the index cannot answer:

```json
{
  "error": "typeHierarchy unavailable for this index: no symbol carries relationship data. This index was built with an unpatched `scip` (upstream through v0.9.0 never populates global_symbols.relationships — scip#464). setup.sh now installs a fixed build: re-run setup.sh, then `jarvis reindex <slug>`. Do not read this as 'this type has no supertypes' — it is missing data, not an empty hierarchy.",
  "symbol": "Greeter",
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00"
}
```

This self-heals: `setup.sh` installs a fork build of `scip` carrying the
[scip#465](https://github.com/sourcegraph/scip/pull/465) fix, so reindexing with it populates the
missing data with no code or config change on your side.
