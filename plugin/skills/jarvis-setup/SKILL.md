---
name: jarvis-setup
description: Install and configure jarvis, the local-first structural code intelligence with an always-on Tree-sitter syntax baseline. Use when onboarding, running setup.sh, registering the MCP server, or indexing a repo for the first time.
version: "0.1.0"
---

# jarvis setup

Part of the jarvis toolkit. Siblings: `jarvis-use` (everyday queries), `jarvis-issues` (report bugs).

To take a machine from zero to "jarvis answering queries", run these in order.

## 1. Check prerequisites

- **OS:** macOS or Linux. jarvis does not support Windows.
- **`uv`:** run `uv --version`. If missing, install from https://docs.astral.sh/uv/.
- **PATH:** `~/.jarvis/bin` must be on `PATH` when you want optional SCIP/Zoekt enrichment. Verify an installed binary with `command -v scip`; the built-in syntax baseline itself needs no external binary.

## 2. Install jarvis + external binaries

```bash
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh
```

`setup.sh` installs the optional external binaries for SCIP enrichment and Zoekt into `~/.jarvis/bin`, appends that directory to the shell rc, and runs `uv tool install jarvis-mcp` to pre-warm the package cache before an MCP client connects. It is idempotent — re-running skips what is present. Options: `--only <name>` (one dependency, including `jarvis-mcp`), `--force` (reinstall), `--help`.

Binaries installed for optional enrichment: `scip` (a fork build — upstream v0.9.0 plus the scip#465 relationships fix that makes `typeHierarchy` work; the install is version-gated, so re-running setup.sh upgrades an older binary automatically), `zoekt-git-index` / `zoekt-webserver` (search), and one SCIP indexer per language: `scip-typescript`, `scip-python`, `scip-swift` (macOS arm64 only), `scip-java` (a JVM launcher; needs `java` on `PATH`), plus `jarvis-mcp` itself (the `jarvis` CLI and `jarvis-server` MCP server) via `uv tool install`.

Every `index` run also builds a Tree-sitter syntax baseline from the package's base dependencies: 17 parser selections backed by the `tree-sitter` runtime and 16 pip-installed grammar distributions. It parses offline and requires no compiler, build system, external indexer, or index-time download. SCIP is optional enrichment: Java/Kotlin projects that cannot produce SCIP data still publish syntax declarations and Zoekt search, but `findReferences`, `callHierarchy`, and `typeHierarchy` require usable SCIP data. See [Requirements & Limits](https://jarvis-intelligence.github.io/jarvis-index/docs/guide/requirements/) for the full language-support matrix and caveats.

Optional extras are not covered by the default install: `uv tool install "jarvis-mcp[semantic]"` for `semanticSearch`, `[watch]` for `jarvis watch`.

Plugin users: this step used to require a separate `uv tool install jarvis-mcp` before the first tool call, to avoid the plugin's `uvx` launch losing the race against the MCP client's 30s connect window on a cold cache — setup.sh now does that for you. Run `uv tool install jarvis-mcp` by hand if you skipped setup.sh, used `--only` to install a single native binary, or ran a setup.sh from before this fix.

## 3. Register the MCP server

If you installed the Codex, Claude Code, **or** Cursor plugin, the bundled MCP config auto-registers the `jarvis` MCP server — skip this step. (Codex and Claude Code read `plugin/.mcp.json`; Cursor reads `plugin/mcp.json`. Same stdio server, same contents — two filenames because the clients disagree on the convention.)

For a manual registration without the plugin:

Codex CLI:

```bash
codex mcp add jarvis -- jarvis-server
```

Claude Code:

```bash
claude mcp add jarvis --scope user -- jarvis-server
```

Cursor (no `mcp add` CLI — edit `~/.cursor/mcp.json` for global, or `.cursor/mcp.json` for one project):

```json
{ "mcpServers": { "jarvis": { "command": "jarvis-server" } } }
```

Other MCP clients: point them at the stdio command `jarvis-server`. No HTTP server, no auth, no network.

## 4. Index a repo

```bash
jarvis index /path/to/your/repo                     # slug = directory name
jarvis index /path/to/your/repo --slug foo          # explicit slug
jarvis index /path/to/your/repo --no-scip           # syntax baseline + search; skip optional SCIP enrichment
jarvis reindex foo --scip                           # re-enable persisted SCIP enrichment
jarvis index /path/to/your/repo --scheme MyScheme   # Swift, ambiguous Xcode scheme
```

The syntax baseline captures git-tracked files for all 17 supported parser selections. SCIP enrichment detects one primary language (or accepts `--language`); its persisted `--scip` / `--no-scip` choice defaults to enabled for a new repo and is reused by `reindex` and `watch`. For a Swift repo with a checked-in `.xcodeproj`/`.xcworkspace`, jarvis auto-uses `xcodebuild`; pass `--scheme` on the first index if there is more than one scheme (it is persisted, so `reindex`/`watch` reuse it).

## 5. Verify

```bash
jarvis status <slug>     # expect status: indexed or degraded when SCIP enrichment is unavailable
```

Then call a tool through the MCP client, e.g. `documentSymbols(repo: "<slug>", path: "src/main.py")` or `goToDefinition(repo: "<slug>", symbol: "main")`. A non-error response from either proves declaration navigation works even without SCIP. Before a reference or hierarchy query, inspect `getIndexStatus(...).capabilities.tools` to confirm its SCIP provider is available.

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `command not found: jarvis` | The plugin runs the MCP *server* via `uvx` without installing the CLI, so all 10 tools can work while `jarvis` itself is absent. Fix: `uv tool install jarvis-mcp` (what step 2's setup.sh already runs by default) — or skip installing and run one-off commands as `uvx --from "jarvis-mcp>=0.9.0" --python ">=3.12" jarvis index /path/to/repo`. |
| `MCP server ... connection timed out after 30000ms` on the very first connect | The plugin's registration launches the server with `uvx`, which on a cold cache resolves and builds the dependency tree before the server can answer. setup.sh's default run pre-warms this cache automatically, so this should only surface if you skipped setup.sh, used `--only` for a single native binary, or ran an older setup.sh. Fix: run `uv tool install jarvis-mcp` once, then reconnect (`/mcp` → jarvis). |
| `command not found: scip` / `zoekt-git-index` | `~/.jarvis/bin` is not on `PATH`. Open a new shell, or `source ~/.zshrc` (or `~/.bashrc`). Still missing after that? Re-run `setup.sh --only zoekt --force` — the flag value is `zoekt` (not `zoekt-git-index`); it installs both `zoekt-git-index` and `zoekt-webserver` from the same tarball. Syntax-only declaration navigation does not require these binaries. |
| `findReferences`, `callHierarchy`, or `typeHierarchy` returns `requiredCapability` | Those tools are SCIP-only; a syntax baseline intentionally never invents reference or hierarchy edges. Run `getIndexStatus` and inspect `capabilities.tools`, then install/fix the applicable SCIP tooling and run `jarvis reindex <slug> --scip`. |
| `typeHierarchy` errors after SCIP enrichment | Re-run setup.sh — the scip install is version-gated and replaces a non-matching binary automatically (heed its warning if an older `scip` earlier on `PATH` shadows the new one) — then `jarvis reindex <slug> --scip`. |
| Swift: "multiple schemes" / wrong build | Pass `--scheme <name>` on the first `jarvis index`. It is stored in the registry and reused by `reindex`/`watch`. |
| `status: degraded` | The snapshot published (syntax baseline + search) but the SCIP stage failed, is missing, or is disabled. `jarvis status <slug>` prints `scipState`, the `cause`, and a `recovery` line — fix the cause, then run `jarvis reindex <slug> --scip`. Declaration navigation and search already work in the meantime. |
| `status: failed` | Re-run `jarvis index <slug>` and read stderr; the atomic-publish guarantee means the previous good index (if any) is still live. |

## 7. Next

Onboarding done. For everyday structural queries (find references, go-to-definition, call hierarchy), see `jarvis-use`. To report a bug, see `jarvis-issues`.
