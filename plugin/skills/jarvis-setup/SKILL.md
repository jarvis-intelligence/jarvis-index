---
name: jarvis-setup
description: Install and configure Homebrew jarvis, the local-first structural code intelligence with an always-on Tree-sitter syntax baseline. Use when onboarding, registering the MCP server, or indexing a repo for the first time.
---

# jarvis setup

Part of the jarvis toolkit. Siblings: `jarvis-use` (everyday queries), `jarvis-issues` (report bugs).

To take a machine from zero to "jarvis answering queries", run these in order.

## 1. Check prerequisites

- **OS:** macOS or Linux. jarvis does not support Windows.
- **Homebrew jarvis:** run `jarvis --version`. If it is missing, install it with `brew install jarvis-intelligence/jarvis/jarvis`.
- **Homebrew-managed binaries:** patched `scip`, Zoekt, and `universal-ctags` are embedded by the formula. Use `jarvis status <slug>` for capability checks rather than probing `PATH`.

## 2. Install jarvis and optional indexers

```bash
brew install jarvis-intelligence/jarvis/jarvis
jarvis --version
```

Expected output: `jarvis 0.11.0`. Homebrew installs the CLI, `jarvis-server`, patched `scip`, Zoekt, and `universal-ctags`; it does not require uv, pip, or PyPI.

The syntax baseline parses git-tracked files without external tools. For language-specific SCIP enrichment, install only the needed toolchain separately:

```bash
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh -s -- --only scip-typescript
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh -s -- --only scip-python
```

Use `--only scip-swift` on macOS arm64 with Xcode, `--only scip-java` when a JDK is already installed, and `--only bash-shim` when macOS Java indexing needs bash 4.4 or newer. Do not run `setup.sh` without `--only`; the Homebrew formula is the jarvis installation. `semanticSearch` dependencies are not available in this binary distribution.

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

Then call a tool through the MCP client, e.g. `documentSymbols(repo: "<slug>", path: "src/main.py")` or `goToDefinition(repo: "<slug>", symbol: "main")`. A non-error response from either proves declaration navigation works even without SCIP. Before a reference or hierarchy query, inspect `getIndexStatus(...).capabilities.tools` to confirm its SCIP provider is available. If any jarvis tool misses on an unindexed or unknown repo, its error payload names `indexRepo` as `recoveryTool` with `recoveryToolArgs.path` set to the repo's local git working directory; call it to build the index rather than asking the user to run the CLI, then poll `getIndexStatus` to completion.

## 6. Troubleshooting

The on-demand reference covers common installer, MCP connection, optional-enrichment, and index-status problems.

Full symptom/fix table: `grep -nA20 "## Symptoms and fixes" references/troubleshooting.md` (loaded on demand).

## 7. Next

Onboarding done. For everyday structural queries (find references, go-to-definition, call hierarchy), see `jarvis-use`. To report a bug, see `jarvis-issues`.
