# Codebase Summary — jarvis-index

**Scale:** 14 text files, ~1,300 LOC. No build step, no test suite, no CI in this repo.
`setup.sh` accounts for 758 lines (~58%); everything else is Markdown and JSON.

## File inventory

```
jarvis-index/
├── README.md                              24    Repo purpose, install one-liners, edit rules
├── setup.sh                              758    POSIX-sh dependency bootstrapper (SYNCED — do not edit)
├── .claude-plugin/
│   └── marketplace.json                   17    Claude Code marketplace entry → ./plugin
├── .cursor-plugin/
│   └── marketplace.json                   17    Cursor marketplace entry → ./plugin
├── .codex-plugin/
│   └── plugin.json                        42    Codex CLI manifest (version + interface block)
└── plugin/                                     THE PLUGIN — source of truth, edited here
    ├── .claude-plugin/plugin.json         20    Claude Code plugin manifest (version, metadata)
    ├── .cursor-plugin/plugin.json         32    Cursor plugin manifest (version, category, paths)
    ├── .mcp.json                           8    MCP registration — Claude Code + Codex
    ├── mcp.json                            8    MCP registration — Cursor (same contents)
    ├── README.md                          89    User-facing: tool roster, install, privacy
    ├── LICENSE                                  MIT
    ├── assets/
    │   ├── app-icon.png                         Codex `logo`
    │   └── jarvis-small.svg                     Codex `composerIcon`
    └── skills/
        ├── jarvis-setup/
        │   ├── SKILL.md                   87    Zero-to-working onboarding + troubleshooting table
        │   └── agents/openai.yaml               Codex interface block
        ├── jarvis-use/
        │   ├── SKILL.md                   82    Decision matrix, symbol format, gotchas
        │   ├── references/tool-roster.md  44    Full signatures + return shapes for all 9 tools
        │   └── agents/openai.yaml               Codex interface block
        └── jarvis-issues/
            ├── SKILL.md                   75    Context gathering, known limitations, gh filing
            └── agents/openai.yaml               Codex interface block
```

## What each piece does

### `setup.sh` — the installer

Installs external binaries into `~/.jarvis/bin` and appends that directory to the shell rc.
Strictly POSIX sh because `curl | sh` ignores the shebang. See
[system-architecture.md](system-architecture.md#setupsh-internal-structure) for the section-by-section
breakdown and the dependency sourcing map.

**CLI surface:**

```
setup.sh [--only <name>] [--force] [--help]
  --only   scip | zoekt | scip-swift | scip-typescript | scip-python | scip-java | bash-shim
  --force  reinstall even if present

Env: JARVIS_BIN_DIR (install dir), JARVIS_DATA_DIR (shim dir, default ~/.jarvis)
```

Note the `--only` value for Zoekt is `zoekt` (not `zoekt-git-index`) — one tarball ships both
binaries.

### The three plugin manifests

Three separate JSON files, each read by a different consumer. They are easy to confuse:

| File | Read by | Key content |
|---|---|---|
| `.claude-plugin/marketplace.json` | Claude Code, at `marketplace add` | Marketplace listing; points `source` at `./plugin`. **Carries no version.** |
| `plugin/.claude-plugin/plugin.json` | Claude Code, at `plugin install` | `version`, description, keywords, license |
| `.codex-plugin/plugin.json` | Codex CLI | `version`, plus an `interface` block the others have no equivalent for: `displayName`, `longDescription`, `capabilities`, `defaultPrompt`, `brandColor` `#3B82F6`, `composerIcon`, `logo`, `privacyPolicyURL`, `termsOfServiceURL` |
| `.cursor-plugin/marketplace.json` | Cursor, at marketplace import | Marketplace listing; `source` → `./plugin`. **Carries no version.** |
| `plugin/.cursor-plugin/plugin.json` | Cursor, at plugin install | `version`, `displayName`, `category`, `tags`, `logo`, plus explicit `skills`/`mcpServers` path fields |

All three `version` fields are currently **0.7.0** and must be bumped together — see
[code-standards.md](code-standards.md#version-bumps-are-the-delivery-mechanism).

### `plugin/.mcp.json` + `plugin/mcp.json` — MCP registration

Eight lines each, and the reason plugin users never run `mcp add`:

```json
{ "mcpServers": { "jarvis": {
    "command": "uvx", "args": ["--from", "jarvis-mcp>=0.6.0", "jarvis-server"] } } }
```

**Two files, identical contents.** Claude Code and Codex CLI read `.mcp.json`; Cursor reads
`mcp.json`. The clients disagree on the filename and neither reads the other's, so the file is
duplicated rather than symlinked (a git symlink breaks for Cursor users on Windows without
developer mode). Any edit must touch both.

The `--from` floor must stay a valid `>=` minimum against PyPI. Note it deliberately omits the
`[semantic]` extra — see the architecture doc's closing section.

### The three skills

Each is a `SKILL.md` with YAML frontmatter (`name`, `description`, `version: "0.1.0"`) plus an
`agents/openai.yaml` sidecar carrying the Codex interface block. Each skill cross-links its two
siblings in its opening line.

**`jarvis-setup`** — seven numbered steps: prerequisites → install → register MCP → index →
verify → troubleshoot → next. The troubleshooting table is the densest part; it covers
`command not found: jarvis` (the plugin runs the server via `uvx` and never installs the CLI),
missing `~/.jarvis/bin` on PATH, `typeHierarchy` on a stale index, Swift multi-scheme builds, and
`status: partial` / `status: failed`.

**`jarvis-use`** — the everyday skill. A decision matrix mapping question → tool → fallback; the
three accepted symbol forms (bare name, qualified name, full SCIP string) and how ambiguity
returns a structured `candidates` list rather than a wrong answer; the "prefer-jarvis rule"
(check `getIndexStatus` freshness, branch on indexed/stale/absent); and seven gotchas. It also
carries lightweight trigger examples for validation.

**`jarvis-issues`** — gathers context (command, slug, `jarvis status`, verbatim `{"error": ...}`
payload, version, OS/arch), classifies bug vs feature vs *known limitation*, drafts from a
template, and requires explicit user confirmation before running `gh issue create` — filing is
outward-facing and public.

## Conventions observable in the code

- Every pin in `setup.sh` carries a comment explaining *why that exact version* and what breaks
  otherwise. Several name the specific failure mode (`AbstractMethodError`, `NoSuchMethodError`,
  `GatherProvisioningInputs`).
- Skill docs state limitations as settled decisions with the rationale inline, rather than as
  TODOs — e.g. the `semanticSearch` registration trade-off says "that decision is not being
  revisited here."
- Commit messages follow conventional-commit form; sync commits are machine-generated as
  `chore: sync distribution surface from jarvis@<sha>`.

## Git history

Six commits — the repo was seeded 2026 and is young:

```
3c5ab35  chore: take ownership of the Codex plugin manifest
b9f8a6c  docs: jarvis-setup covers the missing-CLI case; plugin is now source-of-truth here
8b81160  chore: sync distribution surface from jarvis@97bdcaf7
388cd7a  chore: sync distribution surface from jarvis@75aecf61
c2a79e5  chore: sync distribution surface from jarvis@b559bd2c (manual: JARVIS_DIST_TOKEN 403)
a0ac274  seed: distribution surface for jarvis-mcp 0.5.1
```

The trajectory: started as a pure sync target, then progressively took ownership of the plugin
surface. The two most recent commits moved `plugin/` and `.codex-plugin/` to being edited here
directly rather than synced from the private repo.

Note `c2a79e5` — one sync had to be run manually after a `JARVIS_DIST_TOKEN` 403.

## Release assets

Hosted on this repo's GitHub Releases, referenced by `setup.sh`:

| Tag | Assets |
|---|---|
| `scip-56791658a873` | `scip-<os>-<arch>.tar.gz` + `.sha256` |
| `zoekt-33f1f18af292` | `zoekt-<os>-<arch>.tar.gz` + `.sha256` (both binaries in one tarball) |

Tags are commit-pinned, so a pin bump in `setup.sh` requires a matching new release.
