---
description: "Known upstream issues: scip typeHierarchy, scip-java AGP, scip-kotlinc version mismatch."
---

# Upstream issues

Known issues in upstream tooling that affect jarvis. These are not jarvis bugs — they are
limitations or bugs in the SCIP indexers or the `scip` CLI.

## typeHierarchy empty on upstream scip v0.9.0

- **Symptom:** `typeHierarchy` returns an error or empty on real indexes.
- **Root cause:** upstream `scip expt-convert` never populates `global_symbols.relationships`
  ([sourcegraph/scip#464](https://github.com/sourcegraph/scip/issues/464)).
- **Workaround:** `setup.sh` installs a fork build (`phuongddx/scip`) carrying the
  [#465](https://github.com/sourcegraph/scip/pull/465) fix. Verify with `scip --version`.
- **Status:** awaiting upstream merge.

## scip-java + Android/AGP

- **Symptom:** zero SCIP shards produced for Android/Gradle projects.
- **Root cause:** AGP replaces source sets ([sourcegraph/scip-java#177](https://github.com/sourcegraph/scip-java/issues/177)).
- **Workaround:** jarvis auto-falls-back to `--search-only`. Navigation tools won't work, but
  `searchCode` and `semanticSearch` will.

## scip-kotlinc version mismatch

- **Symptom:** `scip-kotlinc` fails (compiled against one exact Kotlin version).
- **Root cause:** the compiler-plugin API is unstable across Kotlin versions.
- **Workaround:** jarvis auto-falls-back to `--search-only`.

## displayName/kind often null

- **Symptom:** some symbols show `null` `kind` or `displayName`.
- **Root cause:** upstream scip indexing gap ([sourcegraph/scip#464](https://github.com/sourcegraph/scip/issues/464)).
- **Workaround:** jarvis backfills from the symbol string. Works in practice for most repos.

## Swift USR stability across toolchain versions

- **Symptom:** indexes may not be comparable across Swift versions.
- **Root cause:** clang USRs (which scip-swift emits as symbol names) may change between Swift
  toolchain versions.
- **Workaround:** pin `.swift-version` (currently 6.2.4); reindex after toolchain upgrades.
