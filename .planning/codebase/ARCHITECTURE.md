<!-- refreshed: 2026-08-21 -->
# Architecture

**Analysis Date:** 2026-08-21

## System Overview

This repo is the **public distribution surface** for jarvis (a local-first code-intelligence MCP
server whose source lives in the *private* `jarvis-intelligence/jarvis` repo and ships to PyPI as
`jarvis-mcp`). There is no application runtime here — the "architecture" is a set of publishing
flows plus one installer script. See `docs/system-architecture.md` (maintainer doc) for the
canonical version of this picture.

```
PRIVATE (source of truth for setup.sh + binaries)          THIS REPO (public)

jarvis/ (private)                                          jarvis-index/
  setup.sh ────── sync-public-distribution.yml ──────────► setup.sh            (OVERWRITTEN — never edit)
  build-scip.yml / build-zoekt.yml ─────────────────────► GitHub Releases      (scip-*, zoekt-* tarballs)
jarvis-intelligence/scip-swift (public) ─────────────────► own Releases        (pinned by setup.sh)
PyPI: jarvis-mcp ────────────────────────────────────────► fetched by uvx/uv at user install time

                                                        USER-FACING SURFACES (edited here)
                                                          plugin/            plugin payload: skills + MCP config + assets
                                                          .claude-plugin/    Claude Code marketplace manifest
                                                          .codex-plugin/     Codex CLI plugin manifest (repo root)
                                                          .cursor-plugin/    Cursor marketplace manifest
                                                          docs/              VitePress docs site → /docs/
                                                          site/              static landing page → /
                                                          .github/workflows/deploy-pages.yml   Pages CI
```

Downstream pipeline this repo bootstraps (runtime lives in the private repo, documented for
context in `docs/concepts/architecture.md`): language indexer → `jarvis index` → SQLite + Zoekt
shards under `~/.jarvis/` → `jarvis-server` stdio MCP → 9 tools consumed by Claude Code /
Codex / Cursor.

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Installer | Download pinned binaries (scip, zoekt, indexers) into `~/.jarvis/bin`, verify SHA256, manage PATH, pre-warm `uv` cache via `uv tool install jarvis-mcp` | `setup.sh` |
| Plugin payload | The actual distributed plugin: 3 agent skills, MCP server registration, icons, MIT license | `plugin/` |
| MCP registration | Auto-register `jarvis-server` via `uvx --from jarvis-mcp>=0.6.0` on plugin install — no manual `mcp add` | `plugin/.mcp.json`, `plugin/mcp.json` |
| Claude Code manifest | Plugin metadata + version (delivery gate) | `plugin/.claude-plugin/plugin.json` |
| Codex CLI manifest | Plugin metadata + version + Codex-specific `interface` block (icons, prompts, brand color) | `.codex-plugin/plugin.json` |
| Cursor manifest | Plugin metadata + version + explicit `skills`/`mcpServers` path fields for validator | `plugin/.cursor-plugin/plugin.json` |
| Marketplaces | Point all three clients at `source: "./plugin"` | `.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json` |
| Skills | Agent behavior: onboarding, structural-query steering, bug filing | `plugin/skills/jarvis-setup/SKILL.md`, `plugin/skills/jarvis-use/SKILL.md`, `plugin/skills/jarvis-issues/SKILL.md` |
| Tool reference | Full signatures + return shapes for all 9 MCP tools, loaded on demand | `plugin/skills/jarvis-use/references/tool-roster.md` |
| Docs site | User-facing documentation (VitePress) served at `/docs/` | `docs/`, config in `docs/.vitepress/config.ts` |
| Landing page | Marketing page served at `/` | `site/index.html` |
| Pages CI | Build docs + copy `site/` into one Pages artifact | `.github/workflows/deploy-pages.yml` |
| Maintainer docs | Ownership rules, publishing channels, conventions (excluded from the built site) | `docs/code-standards.md`, `docs/deployment-guide.md`, `docs/system-architecture.md`, `docs/codebase-summary.md` |
| Repo router | Public README: purpose, quick start, edit rules, repo layout | `README.md` |

## Pattern Overview

**Overall:** Distribution/publishing surface with multi-client manifest fan-out.

**Key Characteristics:**
- One plugin payload (`plugin/`) adapted to three clients via per-client manifests — each client
  reads its own files and ignores the others' (`docs/system-architecture.md` "Client matrix").
- **Version bumps are the delivery mechanism**: plugin content reaches installed users only when
  the `version` field rises in all three manifests simultaneously (currently `0.7.2`).
- Idempotent, failure-isolated installer: every `install_*` skips when present, `run_one`
  (`setup.sh`) records `FAILED` without aborting sibling installs.
- Everything pinned to exact commits/tags with inline rationale comments; SHA256 verified.
- Docs-as-code: user docs and maintainer docs live side by side in `docs/`, split at build time
  via `srcExclude` in `docs/.vitepress/config.ts`.
- Single-file static landing page (`site/index.html`) with inline CSS/SVG, deployed as-is.

## Layers

**Installer layer:**
- Purpose: bootstrap every external dependency jarvis needs onto a user machine
- Location: `setup.sh`
- Contains: strictly-POSIX-sh functions organized in labelled sections (versions → logging →
  prompt → platform detection → install dir → download → installers → orchestration → main)
- Depends on: `curl`, GitHub Releases on this repo, PyPI (via `uv`), npm (`scip-typescript`,
  `scip-python`)
- Used by: end users via `curl | sh`; the private repo's tests via the `JARVIS_SETUP_SOURCED=1` seam

**Plugin payload layer:**
- Purpose: the artifact the three agent clients actually load
- Location: `plugin/`
- Contains: `SKILL.md` skill definitions, `agents/openai.yaml` Codex sidecars,
  `references/*.md` on-demand detail, MCP JSON registration, PNG/SVG icons, MIT `LICENSE`
- Depends on: `jarvis-mcp` on PyPI at runtime (launched by `uvx`); nothing else in this repo
- Used by: Claude Code, Codex CLI, Cursor via the manifest layer

**Client adaptation (manifest) layer:**
- Purpose: make one `plugin/` installable through three incompatible marketplace conventions
- Location: `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`,
  `.codex-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `.cursor-plugin/marketplace.json`
- Contains: JSON metadata; the two marketplaces carry no version, the three plugin manifests must
  share one version
- Depends on: relative paths into `./plugin/` (Codex's manifest sits at repo root and points in)
- Used by: the clients' plugin/marketplace loaders

**Docs site layer:**
- Purpose: user-facing reference for tools, CLI, concepts, integrations, troubleshooting
- Location: `docs/` (published) and `docs/.vitepress/config.ts` (nav/sidebar/srcExclude)
- Contains: Markdown pages; maintainer-only docs excluded from the build by
  `srcExclude` in `docs/.vitepress/config.ts:17-26`
- Depends on: `vitepress` (^1.6.4, `package.json`); default theme with CSS override at
  `docs/.vitepress/theme/style.css`
- Used by: GitHub Pages at `/docs/` (sitemap hostname in `docs/.vitepress/config.ts:13-15`)

**Landing layer:**
- Purpose: marketing surface at `/`
- Location: `site/index.html` (single self-contained page, inline CSS + SVG), plus
  `site/brand-logo.html` and `site/assets/` (SVG marks, PNG avatars)
- Depends on: Google Fonts CDN links (Geist/Geist Mono/Rajdhani), one inline `<script>`
  (`site/index.html:949-987`); no build step
- Used by: Pages CI, which copies `site/*` to the artifact root

**CI layer:**
- Purpose: assemble and deploy the Pages artifact
- Location: `.github/workflows/deploy-pages.yml`
- Contains: one `deploy` job — checkout → `npm ci` → `npx vitepress build docs` → merge
  `site/*` + `docs/.vitepress/dist/*` into `_artifact/` → `actions/deploy-pages`
- Depends on: Node 20, path-filtered triggers on `site/**`, `docs/**`, `package*.json`
- Used by: pushes to `main` and manual `workflow_dispatch`

## Data Flow

### Primary Request Path (user installation)

1. User adds the marketplace/plugin — three variants (`docs/system-architecture.md` outbound flow):
   Claude Code reads `.claude-plugin/marketplace.json` → `source: "./plugin"` →
   `plugin/.claude-plugin/plugin.json`; Codex reads `.codex-plugin/plugin.json`; Cursor reads
   `.cursor-plugin/marketplace.json` → `plugin/.cursor-plugin/plugin.json`.
2. Plugin install auto-registers the MCP server from `plugin/.mcp.json` (Claude Code, Codex) or
   `plugin/mcp.json` (Cursor): `uvx --from jarvis-mcp>=0.6.0 jarvis-server`, and loads the three
   skills from `plugin/skills/*/SKILL.md`.
3. User runs the installer: `curl -fsSL .../setup.sh | sh` → `main` (`setup.sh:731-756`) →
   platform detection (`setup.sh:113-137`) → `ensure_bin_dir` → each `install_*` via `run_one`
   (`setup.sh:713-723`) → `ensure_on_path` (`setup.sh:175-204`) → summary.
4. Binaries land in `~/.jarvis/bin` (`setup.sh:141-149`): `scip` (fork build, version-gated by
   `installed_scip_matches_pin`, `setup.sh:434-446`), `zoekt-git-index` + `zoekt-webserver`
   (`setup.sh:486-540`), `scip-typescript`/`scip-python` via npm (`setup.sh:577-610`),
   `scip-swift` (`setup.sh:542-575`), `scip-java` (`setup.sh:612-641`), plus a bash ≥ 4.4 shim on
   macOS (`setup.sh:386-432`) and `uv tool install jarvis-mcp` to pre-warm the uvx cache.
5. User indexes: `jarvis index /path/to/repo` → `jarvis status <slug>` → MCP tool call (e.g.
   `goToDefinition`) through the client. The indexing runtime itself lives in the private repo.

**State Management:** None in this repo. User-side state lives under `~/.jarvis/`
(`bin/`, `shims/`, SQLite indexes, Zoekt shards, `registry.db`) — documented in
`docs/concepts/architecture.md`.

## Key Abstractions

**Version-bump-as-release:**
- Purpose: plugin content delivery — clients only pick up changes when the manifest version rises
- Examples: `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`,
  `.codex-plugin/plugin.json` (all `0.7.2`)
- Pattern: three files, one shared version, bumped together on any `plugin/` change
  (`docs/code-standards.md` "Version bumps are the delivery mechanism")

**Dual MCP config:**
- Purpose: one registration readable by all three clients despite filename disagreements
- Examples: `plugin/.mcp.json` (Claude Code, Codex), `plugin/mcp.json` (Cursor) — identical JSON
- Pattern: duplicated real files, not a symlink (Windows checkout breaks symlinks); edit both or
  neither (`docs/code-standards.md`)

**Pinned installer function:**
- Purpose: one self-contained installer per external dependency, with provenance rationale inline
- Examples: `install_scip` (`setup.sh:448-480`), `install_zoekt` (`setup.sh:486-540`),
  `install_scip_swift` (`setup.sh:548-575`), `install_npm_indexer` (`setup.sh:577-602`),
  `install_bash_shim` (`setup.sh:386-432`)
- Pattern: idempotent (presence-gated; `install_scip` version-gated), SHA256-verified
  (`verify_sha256`, `setup.sh:238-248`), returns non-zero instead of exiting, warns on PATH
  shadowing

**Skill unit:**
- Purpose: shippable agent behavior consumed by all three clients
- Examples: `plugin/skills/jarvis-setup/`, `plugin/skills/jarvis-use/`,
  `plugin/skills/jarvis-issues/`
- Pattern: `SKILL.md` with YAML frontmatter (`name`, `description` trigger surface, `version`),
  optional `references/*.md` loaded on demand, `agents/openai.yaml` Codex interface sidecar;
  opening line cross-links siblings (`docs/code-standards.md` "Skills")

**Testability seam:**
- Purpose: let the private repo's `tests/test_setup_sh.py` exercise individual functions
- Examples: `setup.sh:758-762` (`JARVIS_SETUP_SOURCED` guard), overridable env vars
  `JARVIS_BIN_DIR`, `JARVIS_DATA_DIR`, `BASH_SHIM_CANDIDATES` (`setup.sh:360`)
- Pattern: guard-at-bottom main invocation; fixtures via environment redirection

## Entry Points

**`setup.sh` (installer):**
- Location: `setup.sh`
- Triggers: `curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh`;
  flags `--only <name>`, `--force`, `--help` (`setup.sh:645-696`)
- Responsibilities: install all pinned dependencies, manage PATH/shell rc, print per-dependency
  summary, exit non-zero if any install failed

**`plugin/` (plugin payload):**
- Location: `plugin/`
- Triggers: plugin install in Claude Code / Codex CLI / Cursor (see install matrix in
  `plugin/README.md`)
- Responsibilities: register the `jarvis` MCP server, provide the three skills, carry assets/license

**`site/index.html` (landing page):**
- Location: `site/index.html`
- Triggers: GitHub Pages request to `/` (deployed by `.github/workflows/deploy-pages.yml`)
- Responsibilities: marketing page — hero, pipeline, usage, skills, local-first, roadmap sections

**`docs/` (docs site):**
- Location: `docs/.vitepress/config.ts` + Markdown pages
- Triggers: Pages request to `/docs/`; local dev via `npm run docs:dev` (`package.json`)
- Responsibilities: user reference for quickstart, tools, CLI, concepts, integrations,
  troubleshooting

## Architectural Constraints

- **Threading:** None — no runtime code in this repo. `setup.sh` is strictly sequential POSIX sh.
- **Global state:** Installer-level only: `ONLY`, `FORCE`, `SUMMARY`, `EXIT_CODE` module vars in
  `setup.sh:645-649`; version pins at `setup.sh:12-65`. No shared mutable state elsewhere.
- **Circular imports:** Not applicable (no import graph — shell + Markdown + JSON).
- **Ownership rule (hard):** `setup.sh` source of truth is `jarvis/setup.sh` in the private repo;
  it is overwritten here by `sync-public-distribution.yml` on every release with no warning. Any
  other path is edited directly here (`docs/code-standards.md`).
- **POSIX sh compliance:** `curl | sh` ignores the shebang (dash on many distros) — no arrays, no
  `[[ ]]`, no `local`, `set -eu` (`setup.sh:7-10`, `docs/code-standards.md`).
- **Release-asset visibility:** `scip`/`zoekt` binaries must be published to this *public* repo's
  Releases — pointing at the private `JARVIS_REPO` 404s for every unauthenticated user
  (`setup.sh:35-41`).
- **semanticSearch under the plugin:** `plugin/.mcp.json` deliberately registers without the
  `[semantic]` extra (keeps lancedb/torch out of cold start), so `semanticSearch` always errors
  under the default registration; users needing it register a second `jarvis-semantic` server.
  Settled decision — documented in `docs/system-architecture.md` and the `jarvis-use` skill.
- **Version floor:** `--from jarvis-mcp>=0.6.0` in both MCP configs must stay a valid `>=`
  minimum and never drop below 0.6.0 (first wheels-only release) — `docs/code-standards.md`.
- **No secrets:** `JARVIS_DIST_TOKEN` lives only in the private repo's Actions secrets
  (`docs/code-standards.md`); nothing sensitive is committed here.
- **Cursor validator:** marketplace and plugin `name` values must match and be lowercase
  kebab-case; declared path fields must resolve relative to `plugin/`
  (`docs/code-standards.md` "Cursor-specific constraints").

## Error Handling

**Strategy:** Isolate and report; never abort the whole run; never raise past the user boundary.

**Patterns:**
- `run_one` (`setup.sh:713-723`) wraps each installer so one failed dependency records `FAILED`
  and sets `EXIT_CODE=1` while the rest proceed; `print_summary` reports per-dependency outcome.
- `install_*` functions return non-zero on failure rather than calling `exit` (contract in
  `docs/code-standards.md` "Install-function contract").
- SHA256 verification gates every downloaded artifact before install (`verify_sha256`,
  `setup.sh:238-248`); a mismatch aborts that one install, not the run.
- `install_scip` warns when an older `scip` earlier on `PATH` shadows the freshly installed one
  (`setup.sh:434-446`).
- Downstream MCP tools (private repo) return `{"error": "..."}` payloads instead of raising —
  documented for agents in `plugin/skills/jarvis-use/SKILL.md` and
  `plugin/skills/jarvis-use/references/tool-roster.md`.
- User-facing failure triage: decision tree in `docs/troubleshooting/index.md`, upstream issues in
  `docs/troubleshooting/upstream-issues.md`, symptom→fix table in
  `plugin/skills/jarvis-setup/SKILL.md` (section 6).

## Cross-Cutting Concerns

**Logging:** `log_info` / `log_warn` / `log_error` helpers (`setup.sh:69-79`); warn/error go to
stderr. Docs site uses VitePress `lastUpdated: true` (`docs/.vitepress/config.ts:11`).

**Validation:** SHA256 sidecar verification for release binaries (`setup.sh:226-248`); Cursor
official plugin validator run from repo root before publishing (`docs/deployment-guide.md`
Channel 2, step 4); post-publish smoke test procedure in `docs/deployment-guide.md`
("Post-publish smoke test"); pin/file agreement asserted by `tests/test_setup_sh.py` in the
private repo.

---

*Architecture analysis: 2026-08-21*
