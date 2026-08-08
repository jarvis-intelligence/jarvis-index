# System Architecture — jarvis-index

This repo is a distribution surface, so its "architecture" is a set of flows: how artifacts get
*into* the repo, and how they get *out* to users.

## Workspace context

`jarvis-index` is one of three repos that form the product. The workspace root is not a git repo.

| Repo | Role | Visibility |
|---|---|---|
| `jarvis/` | Python MCP server (`jarvis-mcp` on PyPI) — SCIP navigation, Zoekt search, blast radius, semantic search | **Private** |
| `scip-swift/` | Swift SCIP indexer — reads IndexStoreDB, emits `scip.proto` protobuf | Public (`jarvis-intelligence/scip-swift`) |
| `jarvis-index/` | **This repo** — installer, plugins, binary release assets, issue tracker | Public (`jarvis-intelligence/jarvis-index`) |

## Inbound: how artifacts arrive

```
                    PRIVATE                                    PUBLIC
   ┌──────────────────────────────────┐        ┌──────────────────────────────────┐
   │ jarvis/ (dev repo)               │        │ jarvis-index/ (this repo)        │
   │                                  │        │                                  │
   │  setup.sh  ──────────────────────┼───────►│  setup.sh        (OVERWRITTEN)   │
   │    via sync-public-distribution  │  sync  │                                  │
   │                                  │        │                                  │
   │  ZOEKT_COMMIT ──┐                │        │                                  │
   │  SCIP_COMMIT  ──┤                │        │                                  │
   │                 ▼                │        │                                  │
   │  build-zoekt.yml ────────────────┼───────►│  Releases: zoekt-<commit>        │
   │  build-scip.yml  ────────────────┼───────►│  Releases: scip-<commit>         │
   └──────────────────────────────────┘        │                                  │
                                               │  plugin/         (EDITED HERE)   │
   ┌──────────────────────────────────┐        │  .claude-plugin/ (EDITED HERE)   │
   │ jarvis-intelligence/scip-swift   │        │  .codex-plugin/  (EDITED HERE)   │
   │  Releases: scip-swift-vX-macos-  │        │  .cursor-plugin/ (EDITED HERE)   │
   │            arm64.tar.gz          │        │  README.md       (EDITED HERE)   │
   └──────────────────────────────────┘        └──────────────────────────────────┘
```

**The one rule that matters:** `setup.sh` has its source of truth in `jarvis/setup.sh` and is
overwritten here on every release. Everything else has its source of truth **here** — edit it
directly.

## Outbound: how a user gets a working install

```
  User
   │
   ├─(A) Claude Code:  /plugin marketplace add jarvis-intelligence/jarvis-index
   │                   /plugin install jarvis@jarvis
   │                        │ reads .claude-plugin/marketplace.json → source "./plugin"
   │                        │ reads plugin/.claude-plugin/plugin.json (version, metadata)
   │                        ▼
   ├─(B) Codex CLI:    codex plugin marketplace add <url> --ref main
   │                   codex plugin add jarvis
   │                        │ reads .codex-plugin/plugin.json (version, interface block)
   │                        ▼
   ├─(C) Cursor:       Dashboard → Plugins → Add Marketplace → Import from Repo
   │                   (or symlink plugin/ → ~/.cursor/plugins/local/jarvis)
   │                        │ reads .cursor-plugin/marketplace.json → source "./plugin"
   │                        │ reads plugin/.cursor-plugin/plugin.json
   │                        ▼
   │                   ┌────────────────────────────────────────────┐
   │                   │ plugin/.mcp.json  (Claude Code, Codex)      │
   │                   │ plugin/mcp.json   (Cursor)   auto-register: │
   │                   │   uvx --from jarvis-mcp>=0.6.0 jarvis-server│
   │                   │ plugin/skills/ → 3 skills loaded            │
   │                   └────────────────────────────────────────────┘
   │                        │
   └─(D) Manual:       curl -fsSL .../setup.sh | sh ; uv tool install jarvis-mcp
                            │
                            ▼
                    ┌──────────────────────────────────────────┐
                    │ setup.sh installs into ~/.jarvis/bin:    │
                    │   scip, zoekt-git-index, zoekt-webserver,│
                    │   scip-typescript, scip-python,          │
                    │   scip-swift (macOS arm64), scip-java,   │
                    │   bash shim (macOS only)                 │
                    │ + appends ~/.jarvis/bin to shell rc PATH │
                    └──────────────────────────────────────────┘
                            │
                            ▼
                    jarvis index /path/to/repo  →  jarvis status <slug>  →  MCP tool call
```

## Client matrix: one `plugin/`, three manifest conventions

The same `plugin/` directory serves all three clients. Each looks for its own files and ignores
the others', so the conventions coexist without collision:

| | Claude Code | Codex CLI | Cursor |
|---|---|---|---|
| Marketplace manifest | `.claude-plugin/marketplace.json` | *(none — plugin manifest at root)* | `.cursor-plugin/marketplace.json` |
| Plugin manifest | `plugin/.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` (repo root) | `plugin/.cursor-plugin/plugin.json` |
| MCP config | `plugin/.mcp.json` | `plugin/.mcp.json` | `plugin/mcp.json` |
| Skills | `plugin/skills/*/SKILL.md` | same + `agents/openai.yaml` sidecar | same |
| Add marketplace | `/plugin marketplace add <repo>` | `codex plugin marketplace add <url>` | Dashboard UI — **no CLI** |

Two consequences worth remembering:

- **Codex's manifest sits at the repo root**, not inside `plugin/`, and points into `./plugin/`.
  Claude Code and Cursor both use the marketplace-plus-nested-manifest shape instead.
- **`.mcp.json` and `mcp.json` are duplicated by necessity.** Cursor's loader and validator expect
  the undotted name; Claude Code and Codex expect the dotted one. A symlink would break for Cursor
  users on Windows without developer mode, so both are real files and must be edited together.

Cursor's `plugin.json` also carries fields the others have no equivalent for — `category`, `tags`,
`displayName`, and explicit `skills` / `mcpServers` path fields. Those paths are optional (Cursor
auto-discovers `skills/` and `mcp.json` by convention) but are declared explicitly here so
Cursor's official validator checks they resolve.

## `setup.sh` internal structure

A single POSIX-sh file (~758 lines) organized in labelled sections:

| Section | Responsibility |
|---|---|
| **versions** | All pins + the *reasons* for them: `SCIP_COMMIT_PIN`, `ZOEKT_COMMIT_PIN`, `SCIP_SWIFT_VERSION`, `SCIP_JAVA_VERSION`, `SCIP_JAVA_KOTLIN`, and the release-repo pointers |
| **logging** | `log_info` / `log_warn` / `log_error` |
| **prompt** | `confirm` |
| **platform detection** | `detect_os`, `detect_arch` |
| **install dir** | `bin_dir`, `ensure_bin_dir`, `shim_dir`, `shell_rc_path`, `ensure_on_path` |
| **download** | `have_cmd`, `already_installed`, `download_to`, `install_tarball_binary`, `install_raw_binary` — SHA256 verification lives here |
| **installers** | One `install_*` per dependency, plus `install_bash_shim` |
| **orchestration** | `parse_args`, `record`, `print_summary`, `run_one`, `should_run` |
| **main** | Detect platform → `ensure_bin_dir` → run each installer via `run_one` → `ensure_on_path` → summary → exit |

Two design decisions worth knowing:

- **Failure isolation.** `run_one` wraps each installer so one bad dependency records `FAILED`
  and sets `EXIT_CODE=1` without aborting the rest of the run.
- **Testability seam.** The file only calls `main "$@"` when `JARVIS_SETUP_SOURCED != 1`, so the
  private repo's tests can source it and call individual functions without performing a real
  install.

## Dependency sourcing map

Where each binary actually comes from, and why:

| Binary | Source | Why not upstream |
|---|---|---|
| `scip` | **This repo's releases** (`scip-<commit>`), built from the `phuongddx/scip` fork | Upstream through v0.9.0 never populates `global_symbols.relationships` (scip-code/scip#464), which makes `typeHierarchy` unanswerable. Fork carries the #465 fix. Exit ramp: when upstream merges #465 and cuts a release, repoint and delete the build workflow. |
| `zoekt-git-index`, `zoekt-webserver` | **This repo's releases** (`zoekt-<commit>`) | `sourcegraph/zoekt` publishes no releases at all. One tarball ships both binaries. |
| `scip-swift` | `jarvis-intelligence/scip-swift` releases, macOS arm64 only | Swift indexing reads an Xcode-produced IndexStore — inherently macOS-only. |
| `scip-java` | `scip-code/scip-java` releases (upstream) | Self-contained POSIX-sh launcher with an embedded JAR; runs on any JVM, so no os/arch gating. |
| `scip-typescript`, `scip-python` | npm | Installed via the shared `install_npm_indexer` helper. |
| `bash` shim | Symlink to an existing bash ≥ 4.4 | macOS ships bash 3.2; scip-java's generated `javac` wrapper uses `set -eu` + an unguarded `"${ARR[@]}"`, which dies on 3.2. Never runs `brew` — installing a shell is the user's call. |

## Indexing pipeline (downstream, for context)

The pipeline this repo bootstraps, end to end:

```
language indexer          jarvis index                 jarvis-server
(scip-swift / scip-      ──────────────►  SQLite    ──────────────►  9 MCP tools
 python / -typescript /   converts +      + Zoekt        stdio        over stdio
 -java) → SCIP protobuf   builds          + optional
                                          semantic index
```

The nine tools: `documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`,
`typeHierarchy`, `getIndexStatus`, `searchCode`, `semanticSearch`, `blastRadius`. Signatures and
return shapes live in `plugin/skills/jarvis-use/references/tool-roster.md`.

## Notable architectural constraint: `semanticSearch` under the plugin

`plugin/.mcp.json` registers `jarvis` as plain `uvx --from jarvis-mcp jarvis-server` — **without**
the `[semantic]` extra, deliberately, to keep every plugin user's MCP server cold-start free of
lancedb/torch.

Consequence: under the default plugin registration `semanticSearch` **always** errors, and
installing/reindexing with `[semantic]` does not fix it — the extra must be present in the server
process answering the query. Users who need it register a *second*, differently-named server
(`jarvis-semantic`). This is documented in the `jarvis-use` skill's gotchas as a settled decision.
