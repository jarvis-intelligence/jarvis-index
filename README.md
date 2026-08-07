# jarvis

Public distribution surface for [jarvis](https://pypi.org/project/jarvis-mcp/) — a
local-first code intelligence MCP server (SCIP navigation + Zoekt search).

This repo holds no source. It exists because GitHub serves release assets and raw
files only to viewers of the owning repo, and jarvis's development repo is private.

- **Install:** `curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh`
  installs the external binary dependencies; the package itself is on PyPI as
  `jarvis-mcp`.
- **Claude Code plugin:** `/plugin marketplace add jarvis-intelligence/jarvis-index`
- **Codex plugin:** `codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main`
- **Bugs / feature requests:** file them in this repo's Issues.

See [`plugin/README.md`](plugin/README.md) for the full tool roster, the optional
`[semantic]` extra, and the privacy notes.

`setup.sh` is published automatically from the development repo — do not edit it
here; it is overwritten on the next release. Everything else (`plugin/`,
`.claude-plugin/`, this README) lives HERE as its source of truth: edit directly,
and bump `plugin/.claude-plugin/plugin.json`'s version when plugin content changes
so installed plugins pick up the update. The plugin versions independently of the
`jarvis-mcp` package on PyPI.
