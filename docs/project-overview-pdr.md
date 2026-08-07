# Project Overview / PDR — jarvis-index

## What this repo is

`jarvis-intelligence/jarvis-index` is the **public distribution surface** for
[jarvis](https://pypi.org/project/jarvis-mcp/), a local-first code-intelligence MCP server
(SCIP navigation + Zoekt lexical search + optional semantic search).

It contains **no product source code**. It is a delivery channel with four jobs:

| Job | Artifact |
|---|---|
| Install external binaries | `setup.sh` |
| Ship the agent plugin (Claude Code + Codex CLI + Cursor) | `plugin/`, `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/` |
| Host binary release assets | GitHub Releases (`scip-*`, `zoekt-*` tarballs) |
| Accept bug reports / feature requests | GitHub Issues |

## Why it exists (the core constraint)

jarvis's development repo (`jarvis-intelligence/jarvis`) is **private**. GitHub serves raw files
and release assets only to viewers of the owning repo, so an unauthenticated
`curl https://raw.githubusercontent.com/.../setup.sh` or a release-asset download against the
private repo **404s for every real user**.

Therefore: *every user-facing install path must live in a public repo.* That repo is this one.

This constraint is asserted in code — `setup.sh` pins `ZOEKT_RELEASE_REPO` and
`SCIP_RELEASE_REPO` to `jarvis-intelligence/jarvis-index`, and a test in the private repo
(`tests/test_setup_sh.py`) asserts they never drift back to `JARVIS_REPO`.

## Users and entry points

**Primary user:** a developer who wants an AI coding agent (Claude Code, Codex CLI, Cursor, or any
MCP client) to answer structural code questions against their own repositories.

Four supported install paths:

1. **Claude Code plugin** — `/plugin marketplace add jarvis-intelligence/jarvis-index`, then
   `/plugin install jarvis@jarvis`.
2. **Codex CLI plugin** —
   `codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main`,
   then `codex plugin add jarvis`.
3. **Cursor plugin** — Dashboard → Plugins → Add Marketplace → Import from Repo
   (Teams/Enterprise), or symlink `plugin/` into `~/.cursor/plugins/local/` on any plan. Cursor
   exposes no CLI for adding a marketplace.
4. **Manual** — `curl -fsSL .../setup.sh | sh` + `uv tool install jarvis-mcp` + a manual MCP
   registration.

All four converge on the same post-install step: run `setup.sh` for external binaries, then
`jarvis index /path/to/repo`.

## Requirements

### Functional

- **FR1** — `setup.sh` installs every external binary jarvis needs into `~/.jarvis/bin` and puts
  that directory on `PATH` via the user's shell rc.
- **FR2** — `setup.sh` is idempotent: re-running skips what is already present. `scip` is the
  exception — it is *version*-gated, not presence-gated, so a pin bump replaces an older binary
  exactly once.
- **FR3** — Every downloaded tarball is SHA256-verified before install.
- **FR4** — A single failing dependency never aborts the run; failures are recorded and reported
  in a summary, with a non-zero exit code.
- **FR5** — The plugin auto-registers the `jarvis` MCP server from its bundled MCP config — no
  manual `mcp add` for the base case, on any supported client.
- **FR6** — The plugin ships three skills: `jarvis-setup` (onboarding), `jarvis-use` (everyday
  structural queries), `jarvis-issues` (bug reporting).
- **FR7** — Claude Code, Codex CLI, and Cursor all consume the *same* `plugin/` directory; only
  the manifest and MCP-config filenames differ per client.

### Non-functional

- **NFR1 — POSIX sh only.** `curl | sh` ignores the shebang and runs under the system `sh`
  (dash on many Linux distros). No arrays, no `[[ ]]`, no bashisms.
- **NFR2 — Pinned, never "latest".** Every dependency is pinned to an exact commit or tag with a
  written justification. See [code-standards.md](code-standards.md#pin-discipline).
- **NFR3 — Local-first / no telemetry.** The only network egress at runtime is `uvx` fetching the
  wheel on first server start, plus the one-time embedding-model download if the `[semantic]`
  extra is installed. No analytics, no outbound calls during queries.
- **NFR4 — Read-only queries.** Published indexes are opened `mode=ro&immutable=1`.
- **NFR5 — macOS and Linux only.** Windows is explicitly unsupported.

## Non-goals

- Hosting product source code — that lives in the private `jarvis` repo.
- Editing `setup.sh` here — it is overwritten from the private repo on every release.
- Multi-tenancy — `config.py` in the server pins `PROJECT = "_"` / `BRANCH = "_"` by design.
- Multi-language merge — one language per index.
- Windows support.

## Success criteria

1. A fresh macOS or Linux machine goes from zero to a passing
   `goToDefinition(repo, symbol)` call using only public URLs — no GitHub auth, no private access.
2. `jarvis status <slug>` reports `indexed` after a first `jarvis index`.
3. A plugin-content change reaches installed users after a version bump in all three plugin
   manifests, without a PyPI release.
4. `setup.sh` in this repo is byte-identical to `jarvis/setup.sh` after each release sync.

## Related documents

- [system-architecture.md](system-architecture.md) — how the pieces connect
- [codebase-summary.md](codebase-summary.md) — file-by-file inventory
- [code-standards.md](code-standards.md) — conventions and invariants
- [deployment-guide.md](deployment-guide.md) — release and publishing flow
- [project-roadmap.md](project-roadmap.md) — current state and known gaps
