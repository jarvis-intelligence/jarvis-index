# jarvis

Local-first code intelligence over your own indexed repositories. Every index has an always-on Tree-sitter syntax baseline for declaration navigation and outlines; optional SCIP enrichment adds precise references and hierarchies, while Zoekt provides lexical search. Installs as a plugin for **Codex CLI**, **Claude Code**, and **Cursor**, exposing ten MCP tools and three agent skills.

## What it gives you

Ten MCP tools (navigation tools take `repo` = the slug from `jarvis index`):

- `documentSymbols` — per-file outline from SCIP when available, otherwise Tree-sitter declarations.
- `goToDefinition` — resolves definitions from SCIP coverage or the syntax baseline.
- `findReferences` — every occurrence of a symbol; SCIP-only, with a capability error when SCIP occurrence data is unavailable.
- `callHierarchy` — single-level incoming and outgoing calls; SCIP-only, with a capability error when call-edge data is unavailable.
- `typeHierarchy` — supertypes/subtypes; SCIP-only, with a capability error when relationship data is unavailable.
- `getIndexStatus` — published-index freshness, snapshot generation, live provider coverage for each navigation tool, and an `indexing` block while a build started by `indexRepo` is in flight (terminal in every failure mode, so poll loops always exit).
- `indexRepo` — builds an index for a local git repo itself: pre-flights, spawns `jarvis index` detached (`semantic=false` by default, so no embedding-model download), and returns `{slug, state, pid, log}` immediately; poll `getIndexStatus` to completion.
- `searchCode` — lexical search via Zoekt (lazy-started webserver).
- `semanticSearch` — vector + Zoekt + optional SCIP symbol-definition hybrid via reciprocal rank fusion (needs the `[semantic]` extra).
- `blastRadius` — 2-hop package-dependency BFS across indexed repos.

`jarvis index`, `reindex`, and `watch` build the syntax baseline for 17 parser selections (Python, JavaScript, TypeScript/TSX, Java, Kotlin, Swift, Go, Ruby, Rust, C, C++, C#, PHP, Scala, Bash, and SQL) from the `tree-sitter` runtime plus 16 pip-installed grammar distributions. The baseline needs no compiler, build system, external indexer, or index-time download. Each successful publish is an immutable `index-<sha>-<generation>.db` snapshot, so a same-commit reindex never mutates a live result.

Full signatures and return shapes: see the `jarvis-use` skill's `references/tool-roster.md`.

## Install

### Codex CLI

The plugin's bundled `plugin/.mcp.json` auto-registers the `jarvis` MCP server on install — no `codex mcp add` needed for the base case.

```bash
codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main
codex plugin add jarvis
```

Then run the `jarvis-setup` skill (or follow its steps manually): optionally install the SCIP/Zoekt enrichment binaries via `setup.sh` (the syntax baseline ships in the package and needs none), then `jarvis index /path/to/repo`.

### Claude Code

```text
/plugin marketplace add jarvis-intelligence/jarvis-index
/plugin install jarvis@jarvis
```

Then the same `setup.sh` + `jarvis index` flow.

### Cursor

Cursor has no CLI for adding a marketplace, so there are two paths.

**Team marketplace** (Teams/Enterprise plans) — an admin imports this repo once and it becomes
installable for the whole org:

1. Dashboard → **Plugins** → **Add Marketplace** → **Import from Repo**
2. Point it at `https://github.com/jarvis-intelligence/jarvis-index`
3. Members install it from the **Customize** sidebar, at project or user scope.

**Local install** (any plan) — clone and symlink the `plugin/` directory:

```bash
git clone https://github.com/jarvis-intelligence/jarvis-index.git
ln -s "$PWD/jarvis-index/plugin" ~/.cursor/plugins/local/jarvis
```

Then restart Cursor or run **Developer: Reload Window**. Symlink `plugin/`, not the repo root —
the plugin manifest lives at `plugin/.cursor-plugin/plugin.json`.

Either path auto-registers the `jarvis` MCP server from the bundled `plugin/mcp.json`. Then the
same `setup.sh` + `jarvis index` flow.

### Optional extras

- `[semantic]` for `semanticSearch` — install with `uv tool install "jarvis-mcp[semantic]"`, then register a second MCP server (the `jarvis` name is already taken by the plugin's default registration):
  ```bash
  codex mcp add jarvis-semantic -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
  claude mcp add jarvis-semantic --scope user -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
  ```
  Cursor has no `mcp add` CLI — add the same server to `~/.cursor/mcp.json` (global) or
  `.cursor/mcp.json` (project) by hand:
  ```json
  { "mcpServers": { "jarvis-semantic": {
      "command": "uvx",
      "args": ["--from", "jarvis-mcp[semantic]>=0.9.0", "--python", ">=3.12", "jarvis-server"] } } }
  ```
- `[watch]` for `jarvis watch` (foreground auto-reindex on file changes).

## Privacy

jarvis is local-first. The only network egress is `uvx` fetching the published wheel on first server start, and — if you install the optional `[semantic]` extra — the one-time embedding-model download by `sentence-transformers`. No telemetry, no analytics, and no outbound calls during queries. Published indexes are opened read-only (`mode=ro&immutable=1`).

## Links

- Repository: <https://github.com/jarvis-intelligence/jarvis-index>
- Changelog: [PyPI release history](https://pypi.org/project/jarvis-mcp/#history)
- Issues: <https://github.com/jarvis-intelligence/jarvis-index/issues>
- Full onboarding: the `jarvis-setup` skill.
