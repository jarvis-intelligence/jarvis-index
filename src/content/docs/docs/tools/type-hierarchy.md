---
title: typeHierarchy
description: "typeHierarchy — super/subtypes of a symbol. Requires the fork scip build."
---

# typeHierarchy

Single-level super/subtypes for `symbol`.

## Signature

```
typeHierarchy(repo, symbol) → dict
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | string | yes | The repo slug |
| `symbol` | string | yes | Bare, qualified, or full SCIP symbol |

## Returns

```json
{
  "symbol": "Greeter",
  "superTypes": [{ "symbol": "...", "path": "...", "line": ... }],
  "subTypes": [{ "symbol": "...", "path": "...", "line": ... }],
  "freshness": { "indexed": true }
}
```

## Prerequisite: the fork `scip` build

:::danger[Upstream issue]
`typeHierarchy` **returns an error on real indexes** when using upstream `scip` v0.9.0 — it
never populates `global_symbols.relationships`
([sourcegraph/scip#464](https://github.com/sourcegraph/scip/issues/464)).
:::

`setup.sh` installs a fork build (`phuongddx/scip`) carrying the
[#465](https://github.com/sourcegraph/scip/pull/465) fix that populates `relationships`. With the
fork installed, `typeHierarchy` works. Without it, treat the error as "unavailable", not as "no
supertypes".

Verify your `scip` is the fork:

```sh
scip --version   # should report the fork build
```
