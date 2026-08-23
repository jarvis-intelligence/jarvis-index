---
title: Requirements & Limits
description: "Platform requirements and per-language limits — read before installing."
---

jarvis is deliberately narrow: check your language and platform here before you install.

| Language | Navigation | Search | Caveat |
|----------|:----------:|:------:|--------|
| TypeScript / TSX | Yes | Yes | — |
| Python | Yes | Yes | — |
| Java / Kotlin | Yes | Yes | [Android/Gradle](#androidgradle-no-scip-support-auto-degrades-to-search-only), [Kotlin version](#kotlin-exact-version-match-required-auto-degrades-to-search-only), [Maven on macOS](#java-maven-on-macos-requires-bash--44) |
| Swift | Yes | Yes | [Version floor + code-signed targets](#swift-version-floor-and-code-signed-targets) |
| Go | No | Yes | — |
| Ruby | No | Yes | — |
| Rust | No | Yes | — |
| C | No | Yes | — |
| C++ | No | Yes | — |
| C# | No | Yes | — |
| PHP | No | Yes | — |
| Scala | No | Yes | — |
| shell | No | Yes | — |
| SQL | No | Yes | — |

Navigation tools (`goToDefinition`, `findReferences`, `callHierarchy`, `typeHierarchy`,
`documentSymbols`) cover only the four families above. Every other git-tracked language is
indexed `--search-only`: `searchCode` and `semanticSearch` work, navigation does not.

## Platform requirements

- **macOS and Linux only.** Windows is not supported.
- **Python 3.12+**, installed via `uv` (the quickstart pins `--python 3.13` so `uv tool install` always resolves the current `jarvis-mcp`).
- **`git`** — language detection and Zoekt indexing both read the git-tracked tree.
- **Node.js with `npm` (LTS)** — required to install the TypeScript and Python indexers (`scip-typescript`, `scip-python` are npm packages). Without it, `setup.sh` skips both with a warning and those languages get search-only coverage.

`setup.sh` installs these external binaries:

| Purpose | Binary | Source |
|---------|--------|--------|
| SCIP → SQLite conversion | `scip` | prebuilt, pinned `v0.9.0` (minimum — older versions silently drop occurrence ranges) |
| Lexical search | `zoekt-git-index` · `zoekt-webserver` | cross-compiled by jarvis's CI — upstream publishes no binaries |
| TypeScript indexing | `scip-typescript` | `npm install -g` |
| Python indexing | `scip-python` | `npm install -g` |
| Swift indexing | `scip-swift` | prebuilt, macOS arm64 only |
| Java/Kotlin indexing | `scip-java` | detect-only — Docker image, asks before pulling |

## Language caveats

### Swift: version floor and code-signed targets

Swift indexing requires `scip >= v0.9.0` — older converters cannot read `scip.proto`'s
`typed_range` oneof, the only range encoding `scip-swift` emits, and silently produce an
index with no navigable positions. `jarvis index` refuses an older `scip` rather than
publishing one.

Repos with code-signed app-extension targets additionally require `scip-swift >= v0.1.2`;
earlier versions pass no code-signing overrides to `xcodebuild`, which then fails
provisioning before compiling anything. `setup.sh` skips any dependency that is merely
*present*, so an existing install is not upgraded automatically — run
`sh ./setup.sh --only scip-swift --force`.

### Android/Gradle: no SCIP support (auto-degrades to search-only)

:::caution
`scip-java` can't index Android/Gradle repos at all — its Gradle plugin keys off Gradle's
standard source sets, which AGP replaces with its own variant model, so the build emits zero
SCIP shards. jarvis detects this automatically from the indexer's own failure output and
degrades to `--search-only`: navigation tools return empty, `searchCode` and `semanticSearch`
still work. This is a settled limitation, not a bug.
:::

### Kotlin: exact version match required (auto-degrades to search-only)

:::caution
`scip-kotlinc` is compiled against one pinned Kotlin release; its compiler-plugin API is
internal and unstable even across patch releases, so any other version fails. jarvis detects
the failure and degrades to `--search-only` the same way as the Android/Gradle case above.
:::

### Java (Maven) on macOS: requires bash >= 4.4

`scip-java`'s generated `javac` wrapper expands an unguarded array reference that errors on
bash < 4.4; macOS ships only 3.2, so a Maven build dies at `default-compile` rather than
degrading to search-only. `setup.sh` works around it by shimming a newer bash onto `PATH` for
the indexer. If no bash >= 4.4 is available, indexing fails with the remedy
(`brew install bash`) instead of silently falling back — unlike the two cases above, a
persisted `--search-only` cannot be un-set, so this one stops short rather than choosing for
you.
### semanticSearch: requires the semantic extra

`semanticSearch` is not installed by default. It requires `uv tool install "jarvis-mcp[semantic]"` and a re-index of each repo (`jarvis reindex <slug>`). Without the extra the tool returns its `unavailable-reason` payload.

### Language detection: one language per repo

Language is detected by extension plurality across git-tracked files only — a polyglot
monorepo is indexed as whichever language has the most files. Multi-language merge is out of
scope. `--language` overrides the detected choice; once set, only re-running `jarvis index`
with a new value changes it.
