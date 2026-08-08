---
name: jarvis-setup
description: Install and configure jarvis, the local-first code-intelligence MCP server. Use when onboarding, running setup.sh, registering the MCP server, or indexing a repo for the first time.
version: "0.1.0"
---

# jarvis setup

Part of the jarvis toolkit. Siblings: `jarvis-use` (everyday queries), `jarvis-issues` (report bugs).

To take a machine from zero to "jarvis answering queries", run these in order.

## 1. Check prerequisites

- **OS:** macOS or Linux. jarvis does not support Windows.
- **`uv`:** run `uv --version`. If missing, install from https://docs.astral.sh/uv/.
- **PATH:** after install (step 2), `~/.jarvis/bin` must be on `PATH`. Verify with `command -v scip`.

## 2. Install jarvis + external binaries

```bash
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh
```

`setup.sh` installs every binary jarvis needs into `~/.jarvis/bin` and appends it to the shell rc, **and** runs `uv tool install jarvis-mcp` itself — pre-warming the cache before any MCP client tries to connect (skipped with a warning if `uv` isn't on `PATH` yet). It is idempotent — re-running skips what's present. Options: `--only <name>` (one dependency, including `jarvis-mcp`), `--force` (reinstall), `--help`.

Binaries installed: `scip` (a fork build — upstream v0.9.0 plus the scip#465 relationships fix that makes `typeHierarchy` work; the install is version-gated, so re-running setup.sh upgrades an older binary automatically), `zoekt-git-index` / `zoekt-webserver` (search), one indexer per language: `scip-typescript`, `scip-python`, `scip-swift` (macOS arm64 only), `scip-java` (a JVM launcher; needs `java` on `PATH`), plus `jarvis-mcp` itself (`jarvis` the CLI, `jarvis-server` the MCP server) via `uv tool install`.

Java/Kotlin repos have real limits: Android/Gradle projects and Kotlin repos not on the pinned
Kotlin version cannot produce a SCIP index, and are published search-only instead (lexical and
semantic search work; navigation does not). See CLAUDE.md for the detail.

Optional extras aren't covered by the default install: `uv tool install "jarvis-mcp[semantic]"` for `semanticSearch`, `[watch]` for `jarvis watch`.

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
jarvis index /path/to/your/repo            # slug = directory name
jarvis index /path/to/your/repo --slug foo # explicit slug
jarvis index /path/to/your/repo --scheme MyScheme  # Swift, ambiguous Xcode scheme
```

Language is detected by counting source files per extension — **one language per index** (no multi-language merge). For a Swift repo with a checked-in `.xcodeproj`/`.xcworkspace`, jarvis auto-uses `xcodebuild`; pass `--scheme` on the first index if there is more than one scheme (it's persisted, so `reindex`/`watch` reuse it).

## 5. Verify

```bash
jarvis status <slug>     # expect status: indexed
```

Then call a tool through the MCP client, e.g. `goToDefinition(repo: "<slug>", symbol: "main")`. A non-error response with a `definitions` array means the pipeline works end to end.

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `command not found: jarvis` | The plugin runs the MCP *server* via `uvx` without ever installing the CLI, so all 9 tools can work while `jarvis` itself is absent. Fix: `uv tool install jarvis-mcp` (what step 2's setup.sh already runs by default) — or skip installing and run one-off commands as `uvx --from jarvis-mcp jarvis index /path/to/repo`. |
| `MCP server ... connection timed out after 30000ms` on the very first connect | The plugin's registration launches the server with `uvx`, which on a cold cache resolves *and builds* the dependency tree before the server can answer — some deps (e.g. `cryptography`, pulled in transitively via `mcp`'s own `pyjwt[crypto]` dependency) compile Rust and can run for minutes, well past the client's 30s connect window; this is upstream of jarvis and not something a version floor can fix. setup.sh's default run now pre-warms this cache automatically, so this should only surface if you skipped setup.sh, ran `--only` for a single native binary, or ran a setup.sh from before this fix. Fix: run `uv tool install jarvis-mcp` once, then reconnect (`/mcp` → jarvis). That populates the same cache `uvx` reads, so later cold starts take seconds. Nothing is wrong with the index or the install. |
| `command not found: scip` / `zoekt-git-index` | `~/.jarvis/bin` not on `PATH`. Open a new shell, or `source ~/.zshrc` (or `~/.bashrc`). Still missing after that? Re-run `setup.sh --only zoekt --force` — the flag value is `zoekt` (not `zoekt-git-index`); it installs both `zoekt-git-index` and `zoekt-webserver` from the same tarball. |
| `typeHierarchy` errors on a fresh index / `scip` predates the pinned fork build | Re-run setup.sh — the scip install is version-gated and replaces a non-matching binary automatically (heed its warning if an older `scip` earlier on `PATH` shadows the new one) — then `jarvis reindex <slug>`. |
| Swift: "multiple schemes" / wrong build | Pass `--scheme <name>` on the first `jarvis index`. It's stored in the registry and reused by `reindex`/`watch`. |
| `status: partial` | The index published symbols but no navigable positions (indexer/converter bug). Re-read the stderr from `jarvis index`; reindex after fixing. |
| `status: failed` | Re-run `jarvis index <slug>` and read stderr; the atomic-publish guarantee means the previous good index (if any) is still live. |

## 7. Next

Onboarding done. For everyday structural queries (find references, go-to-definition, call hierarchy), see `jarvis-use`. To report a bug, see `jarvis-issues`.
