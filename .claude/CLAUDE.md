<!-- GSD:project-start source:PROJECT.md -->

## Project

**jarvis-index — Public Surface Rebuild**

The public distribution surface for **jarvis**, a local-first code-intelligence MCP server (source lives in the private `../jarvis/` repo, ships to PyPI as `jarvis-mcp`). This repo owns the landing page, docs site, and plugin skills that introduce jarvis to developers and ship it to Claude Code, Codex, and Cursor. The current project is a full rebuild of that surface: a new landing identity, tutorial-first docs, realigned plugin skills, and updated maintainer docs — all sourced from the private repo's README, PDR, system-architecture, and CHANGELOG (jarvis 0.6.2).

**Core Value:** A cold visitor can land, install, and make their first successful jarvis tool call using only the public pages — no external context required.

### Constraints

- **Hosting**: GitHub Pages static output via `deploy-pages.yml` — whatever stack wins, the deployable artifact stays static
- **Stack openness**: docs engine (VitePress today) and landing build step (none today) MAY change if the design demands it — decision deferred to phase planning
- **Plugin delivery**: any `plugin/` change ships only via a synchronized version bump in all three manifests (`plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`)
- **Ownership (hard)**: `setup.sh` source of truth is the private repo — never edited here
- **Version floor**: `--from jarvis-mcp>=0.6.0` in both MCP configs must remain a valid `>=` floor, never below 0.6.0
- **Cursor validator**: marketplace/plugin names lowercase kebab-case; declared paths must resolve relative to `plugin/`
- **Dual MCP config**: `plugin/.mcp.json` and `plugin/mcp.json` are duplicated real files — edit both or neither

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- Markdown — all documentation (`README.md`, `docs/**/*.md`), plugin skills (`plugin/skills/jarvis-setup/SKILL.md`, `plugin/skills/jarvis-use/SKILL.md`, `plugin/skills/jarvis-issues/SKILL.md`, `plugin/skills/jarvis-use/references/tool-roster.md`), maintainer guides (`docs/code-standards.md`, `docs/deployment-guide.md`, `docs/system-architecture.md`, `docs/codebase-summary.md`, `docs/project-overview-pdr.md`, `docs/project-roadmap.md`)
- POSIX shell — `setup.sh` (762 lines), the dependency bootstrapper. Strictly POSIX sh (no arrays, no `[[ ]]`, no bashisms) because `curl | sh` runs under system sh (dash). NEVER edit here — synced from the private `jarvis/` repo (rule stated in `README.md` and `docs/deployment-guide.md`)
- HTML/CSS/vanilla JS — static landing page `site/index.html` (989 lines, single self-contained file, no framework) and `site/brand-logo.html` (464 lines). Custom CSS variables theme with light/dark modes via `[data-theme="dark"]`
- TypeScript — VitePress config only: `docs/.vitepress/config.ts` (135 lines), `docs/.vitepress/theme/index.ts` (re-exports DefaultTheme + `./style.css`)
- CSS — VitePress theme override `docs/.vitepress/theme/style.css` (59 lines)
- JSON — all manifests and configs: `package.json`, `package-lock.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`, `.codex-plugin/plugin.json`, `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `plugin/.mcp.json`, `plugin/mcp.json`
- YAML — CI workflow `.github/workflows/deploy-pages.yml`

## Runtime

- Node.js 20 — pinned in CI (`node-version: '20'` in `.github/workflows/deploy-pages.yml`); only needed to build VitePress docs, not to use the repo
- No server runtime. Output is fully static (GitHub Pages). The *product* this repo distributes runs on Python via `uv`/`uvx` (see INTEGRATIONS.md)
- npm (no `engines` field declared in `package.json`)
- Lockfile: present — `package-lock.json` (lockfileVersion 3, 175 packages, all transitive via VitePress)

## Frameworks

- VitePress ^1.6.4 (resolved 1.6.4) — docs site builder, sole devDependency in `package.json`. Config in `docs/.vitepress/config.ts`: `base: '/docs/'`, `cleanUrls: true`, `lastUpdated: true`, sitemap hostname `https://jarvis-intelligence.github.io/jarvis-index/docs`, local search provider, `srcExclude` keeps internal maintainer docs (`docs/system-architecture.md`, `docs/deployment-guide.md`, etc.) out of the public site
- Landing page uses **no framework** — hand-rolled static HTML in `site/index.html`
- None in this repo. `setup.sh` is tested by `tests/test_setup_sh.py` in the private `jarvis/` repo, which sources it with `JARVIS_SETUP_SOURCED=1` (testability seam at `setup.sh:760`)
- Vite 5.4.21 (transitive via VitePress) — builds `docs/` into `docs/.vitepress/dist/`
- Scripts (from `package.json`): `npm run docs:dev` (dev server), `npm run docs:build`, `npm run docs:preview`
- Pages artifact assembly is plain shell in CI: copies `site/*` to artifact root and `docs/.vitepress/dist/*` into `_artifact/docs/` (`.github/workflows/deploy-pages.yml:47-55`)

## Key Dependencies

- `vitepress` ^1.6.4 — the only declared dependency; docs publishing depends entirely on it
- Notable VitePress transitives (from `package-lock.json`): `vue` 3.5.41, `vite` 5.4.21, `shiki` 2.5.0 (syntax highlighting), `minisearch` 7.2.0 (local search index), `esbuild` 0.21.5, `rollup` 4.62.4
- `setup.sh` installs pinned binaries into `~/.jarvis/bin` — all pins live in the versions section of `setup.sh:12-65`:
- All tarball/raw downloads are SHA256-verified against `.sha256` sidecars (`verify_sha256` at `setup.sh:238-248`, `install_tarball_binary` at `setup.sh:254-304`, `install_raw_binary` at `setup.sh:306-351`)

## Configuration

- No `.env` file, no required env vars for building this repo
- `setup.sh` honors test/install-time overrides (documented in `usage()` at `setup.sh:664-667`): `JARVIS_BIN_DIR` (install dir), `JARVIS_DATA_DIR` (shim dir, also keyed independently at `setup.sh:162-164`), plus `JARVIS_SETUP_SOURCED=1` (skip `main`) and `BASH_SHIM_CANDIDATES` (`setup.sh:360`)
- `setup.sh` CLI flags: `--only <name>`, `--force`, `--help` (`parse_args` at `setup.sh:670-696`)
- `docs/.vitepress/config.ts` — VitePress site config (nav, sidebar, sitemap, local search, theme)
- `docs/.vitepress/theme/index.ts` + `docs/.vitepress/theme/style.css` — theme customization
- `.gitignore` ignores `node_modules/`, `docs/.vitepress/cache/`, `docs/.vitepress/dist/`
- Plugin manifests must stay version-synced: any change under `plugin/` bumps `version` to the same value in all three of `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json` (currently 0.7.2; rule in `README.md` "Editing this repo")

## Platform Requirements

- macOS or Linux (product constraint; Windows unsupported per `README.md` Requirements)
- Node.js 20 + npm (docs build), git
- Optional local tools for publishing work: `gh` CLI for release verification (`docs/deployment-guide.md` smoke test), Cursor plugin validator via `curl … node /tmp/validate-template.mjs` (`docs/deployment-guide.md:46-53`)
- GitHub Pages static hosting — landing page at `/`, docs at `/docs/` (see `.github/workflows/deploy-pages.yml` and INTEGRATIONS.md)
- End users need macOS/Linux, `uv` on PATH, and `java` only for Java/Kotlin indexing (`README.md` Requirements)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Ownership Rule (read first)

- `setup.sh` is **synced from the private `jarvis` repo** by `sync-public-distribution.yml` and silently overwritten on each release — never edit it here; fix it upstream in `jarvis/` (see `docs/code-standards.md`, `README.md`, `docs/deployment-guide.md`).
- Everything else — `plugin/**`, `.claude-plugin/**`, `.codex-plugin/**`, `.cursor-plugin/**`, `docs/**`, `README.md`, `site/**` — has its source of truth **here**; edit directly.

## Naming Patterns

- Markdown docs: kebab-case — `docs/code-standards.md`, `docs/deployment-guide.md`, `docs/tools/go-to-definition.md`.
- Skills: kebab-case directory + fixed `SKILL.md` filename — `plugin/skills/jarvis-use/SKILL.md`; optional `references/*.md` and `agents/openai.yaml` inside the same directory.
- Shell: flat `setup.sh` at repo root.
- Plan artifacts: `MMDD-HHMM-topic` directories — `plans/0807-2314-landing-page/plan.md`.
- snake_case, verbs for operations: `install_scip`, `detect_os`, `verify_sha256`, `run_one`, `print_summary` (`setup.sh`).
- Installer functions are prefixed `install_` and registered in `main()` via `run_one <name> install_<name>` (`setup.sh:745-751`).
- Logging helpers: `log_info`, `log_warn`, `log_error` (`setup.sh:69-79`).
- Globals and pinned constants: SCREAMING_SNAKE_CASE — `SCIP_COMMIT_PIN`, `ZOEKT_RELEASE_REPO`, `ONLY`, `FORCE`, `SUMMARY`, `EXIT_CODE` (`setup.sh:28-65`, `setup.sh:645-649`).
- Function-local temporaries: leading underscore — `_tmp`, `_name`, `_tar_url`, `_dest_name`, `_answer`, `_expected` (`setup.sh:258-262`, `setup.sh:706`).
- Environment-overridable knobs are also SCREAMING_SNAKE: `JARVIS_BIN_DIR`, `JARVIS_DATA_DIR`, `BASH_SHIM_CANDIDATES`, `JARVIS_SETUP_SOURCED` (`setup.sh:141-149`, `setup.sh:360`, `setup.sh:760`).
- Not applicable — no typed application code. `docs/.vitepress/config.ts` is untyped except VitePress's own `defineConfig` inference.
- Lowercase kebab-case, and `name` must match exactly between `.cursor-plugin/marketplace.json` and `plugin/.cursor-plugin/plugin.json` — Cursor's validator hard-errors on mismatch (`docs/code-standards.md` "Cursor-specific constraints").

## Code Style

- No formatter or linter config exists anywhere in the repo — no `.editorconfig`, Prettier, ESLint, ShellCheck config, `Makefile`, or `justfile` (verified by glob). Style is enforced by convention and review only.
- Shell (`setup.sh`): tab indentation; one command per line; section dividers as banner comments (`# ---- logging ----`, `setup.sh:67`).
- JSON manifests: 2-space indent — `plugin/.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `plugin/.mcp.json`.
- TypeScript (`docs/.vitepress/config.ts`): single quotes, no semicolons, 2-space indent.
- CSS (`docs/.vitepress/theme/style.css`): VitePress CSS-variable overrides only, grouped by light/dark theme with banner comments (`/* ---- Light theme (default) ---- */`).
- ShellCheck annotations appear inline where a suppressible idiom is deliberate: `# shellcheck disable=SC2064` (`setup.sh:266`) and the SC2086 word-split convention documented in `docs/code-standards.md` — but no CI lint step runs (see TESTING.md).

## Shell Conventions (`setup.sh`)

- **Strictly POSIX sh.** `#!/usr/bin/env sh` + `set -eu` (`setup.sh:1`, `setup.sh:10`). `curl | sh` ignores the shebang and runs dash, so: no arrays, no `[[ ]]`, no `local`, no `${arr[@]}`, no bash-only expansion. Lists are newline-delimited strings (`SUMMARY`, `setup.sh:647-648`).
- **Prefer `if cmd; then …; fi` over `cmd && cmd`** under `set -e` — the `&&` form has ambiguous exit semantics across dash/bash-posix (`setup.sh:743-745`).
- **Pin discipline.** Every external dependency is pinned to an exact commit/tag, never `latest`. Each pin's comment answers: why this exact version, what breaks on a different one, what to re-check when bumping — plus an exit ramp when a fork is used (`setup.sh:14-65`).
- **Install-function contract** (`docs/code-standards.md` "Install-function contract"): every `install_*` must be idempotent (skip when present unless `FORCE=1`; `install_scip` is version-gated via `installed_scip_matches_pin` instead), verify SHA256 before installing (`verify_sha256`, `setup.sh:238-248`), return non-zero rather than exit (so `run_one` isolates the failure, `setup.sh:714-723`), and warn about PATH shadowing where relevant.
- **Temp cleanup via trap**, cleared on every exit path: `trap "rm -rf '$_tmp'" EXIT` then `trap - EXIT` after manual cleanup (`setup.sh:264-303`).
- **Prompt from `/dev/tty` only** — stdin is the piped script under `curl | sh` (`confirm`, `setup.sh:83-108`).
- **Testability seam:** the file ends with `if [ "${JARVIS_SETUP_SOURCED:-}" != "1" ]; then main "$@"; fi` so tests can source it and call functions individually; keep helpers overridable via env for the same reason (`setup.sh:758-762`).

## Import Organization

- None used. Relative paths only (`docs/.vitepress/theme/index.ts`).

## Manifest & Skill Conventions

- **Skill file shape** (from `docs/code-standards.md`): `SKILL.md` (required, YAML frontmatter `name` + `description` + `version`), optional `agents/openai.yaml` (Codex interface block with `interface.display_name` / `short_description` / `default_prompt`), optional `references/*.md` loaded on demand. See `plugin/skills/jarvis-use/`.
- **`description` is the trigger surface** — it must name the concrete situations that should invoke the skill; quote it in frontmatter when it contains colons (`plugin/skills/jarvis-use/SKILL.md:3`).
- **Version bump is the delivery mechanism.** Any change under `plugin/` requires bumping `version` to the same value in all three manifests: `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`. Plugin version is independent of the `jarvis-mcp` PyPI package (`docs/code-standards.md`).
- **MCP registration is duplicated, not symlinked:** `plugin/.mcp.json` (Claude Code, Codex) and `plugin/mcp.json` (Cursor) hold identical JSON — edit both or neither. Keep `--from jarvis-mcp>=0.6.0` as a `>=` floor (never exact-pin, never below 0.6.0), and never add the `[semantic]` extra (`docs/code-standards.md`).

## Markdown & Docs Conventions

- **Frontmatter:** docs pages carry only `description` (`docs/tools/go-to-definition.md:1-3`); skills carry `name`/`description`/`version`.
- **Skills open with sibling cross-links:** first body line names the two sibling skills so a mis-landed agent can redirect (`plugin/skills/jarvis-setup/SKILL.md:9`).
- **Procedure docs use numbered H2 sections** (`## 1. Check prerequisites` … `## 7. Next`, `plugin/skills/jarvis-setup/SKILL.md`).
- **Tables for decision surfaces:** decision matrices (`plugin/skills/jarvis-use/SKILL.md:15-25`), troubleshooting (`plugin/skills/jarvis-setup/SKILL.md:83-91`), ownership rules (`docs/code-standards.md:5-13`), API parameters (`docs/tools/go-to-definition.md:17-20`).
- **Inline code in backticks always** for commands, paths, tool names, symbols — never bare.
- **On-demand references over inlining:** `jarvis-use/SKILL.md:50` points at `references/tool-roster.md` with an exact retrieval command (`grep -nA20 "## Tool detail" references/tool-roster.md`) instead of inlining 44 lines.
- **State limitations as settled decisions with rationale inline**, never as TODOs — e.g. the `semanticSearch` gotcha in `plugin/skills/jarvis-use/SKILL.md:68` explicitly says the decision is not being revisited, to stop an agent from "helpfully" editing `.mcp.json`.
- **Require confirmation before outward-facing actions:** `jarvis-issues` shows the drafted issue and gets explicit user approval before `gh issue create` (`plugin/skills/jarvis-issues/SKILL.md:63-71`).
- **Keep should/should-NOT trigger examples** as lightweight validation (`plugin/skills/jarvis-use/SKILL.md:80-83`).
- **Size caps:** soft cap 500 lines per doc; root `README.md` under 300 lines and a router, not a manual (`docs/code-standards.md` "Documentation").
- **Maintainer-only docs are excluded from the site** via `srcExclude` in `docs/.vitepress/config.ts:17-26` (`code-standards.md`, `deployment-guide.md`, `brand-spec.md`, etc.).
- **Update docs when user-visible behavior, install steps, commands, architecture, or public contracts change; skip changelog noise for internal edits** (`docs/code-standards.md`).

## Error Handling

- Shell: `log_error "…"` to stderr + `return 1` — never `exit` from helpers; `main` decides exit codes (`parse_args` failure → exit 2, platform failure → exit 1, any installer failure aggregated into `EXIT_CODE=1` after the summary prints, `setup.sh:731-755`).
- Failure isolation: `run_one` records `ok`/`FAILED` per dependency and continues, so one bad dependency never aborts the run (`setup.sh:712-723`).
- Unsupported platforms fail fast with a specific message (`detect_os`/`detect_arch`, `setup.sh:113-137`).
- Docs/skills describe jarvis's own error contract: every MCP tool returns `{"error": "..."}` rather than raising; check for an `error` key before reading results (`plugin/skills/jarvis-use/SKILL.md:77`, `plugin/skills/jarvis-use/references/tool-roster.md:3`).
- Ambiguity is surfaced, not swallowed: ambiguous symbol resolution returns a structured `candidates` list instead of a silent empty result (`plugin/skills/jarvis-use/SKILL.md:38-41`).

## Logging

- `log_info` → stdout, two-space indent (user-facing progress); `log_warn`/`log_error` → stderr with `warn:`/`error:` prefixes (`setup.sh:69-79`). Usage output goes to stderr on bad args (`setup.sh:691`).
- End-of-run `summary` block lists every dependency with `ok`/`FAILED` (`print_summary`, `setup.sh:703-710`).

## Comments

- Comment the **why, not the what**, at load-bearing lines — `setup.sh` is the exemplar: "The subshell is load-bearing. POSIX requires the shell to ABORT …" (`setup.sh:94-97`), "The bin_dir check is load-bearing: … which CI caught" (`setup.sh:215-218`).
- Pin comments cite upstream issues and test files: scip-code/scip#464/#465 and `tests/test_setup_sh.py` assertions (`setup.sh:14-32`).
- Usage-signature comment blocks precede multi-argument helpers: `#   install_tarball_binary <tar_url> <sha_url> <member> <dest_name>` (`setup.sh:254-257`).
- CSS comments map tokens to their source of truth (`docs/.vitepress/theme/style.css:1-5`).
- Refactoring restraint is documented inline: `install_raw_binary` is deliberately separate from `install_tarball_binary` because four callers depend on the tarball helper's behavior (`setup.sh:306-310`).
- Not used. TypeScript files carry a one-line operational comment instead (`docs/.vitepress/config.ts:1`).

## Function Design

## Module Design

## Commits

- Conventional-commit format; no AI attribution or co-author trailers (`docs/code-standards.md` "Commits").
- `chore: sync distribution surface from jarvis@<sha>` is machine-generated by the sync workflow — never hand-write that form.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```

```

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

- One plugin payload (`plugin/`) adapted to three clients via per-client manifests — each client
- **Version bumps are the delivery mechanism**: plugin content reaches installed users only when
- Idempotent, failure-isolated installer: every `install_*` skips when present, `run_one`
- Everything pinned to exact commits/tags with inline rationale comments; SHA256 verified.
- Docs-as-code: user docs and maintainer docs live side by side in `docs/`, split at build time
- Single-file static landing page (`site/index.html`) with inline CSS/SVG, deployed as-is.

## Layers

- Purpose: bootstrap every external dependency jarvis needs onto a user machine
- Location: `setup.sh`
- Contains: strictly-POSIX-sh functions organized in labelled sections (versions → logging →
- Depends on: `curl`, GitHub Releases on this repo, PyPI (via `uv`), npm (`scip-typescript`,
- Used by: end users via `curl | sh`; the private repo's tests via the `JARVIS_SETUP_SOURCED=1` seam
- Purpose: the artifact the three agent clients actually load
- Location: `plugin/`
- Contains: `SKILL.md` skill definitions, `agents/openai.yaml` Codex sidecars,
- Depends on: `jarvis-mcp` on PyPI at runtime (launched by `uvx`); nothing else in this repo
- Used by: Claude Code, Codex CLI, Cursor via the manifest layer
- Purpose: make one `plugin/` installable through three incompatible marketplace conventions
- Location: `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`,
- Contains: JSON metadata; the two marketplaces carry no version, the three plugin manifests must
- Depends on: relative paths into `./plugin/` (Codex's manifest sits at repo root and points in)
- Used by: the clients' plugin/marketplace loaders
- Purpose: user-facing reference for tools, CLI, concepts, integrations, troubleshooting
- Location: `docs/` (published) and `docs/.vitepress/config.ts` (nav/sidebar/srcExclude)
- Contains: Markdown pages; maintainer-only docs excluded from the build by
- Depends on: `vitepress` (^1.6.4, `package.json`); default theme with CSS override at
- Used by: GitHub Pages at `/docs/` (sitemap hostname in `docs/.vitepress/config.ts:13-15`)
- Purpose: marketing surface at `/`
- Location: `site/index.html` (single self-contained page, inline CSS + SVG), plus
- Depends on: Google Fonts CDN links (Geist/Geist Mono/Rajdhani), one inline `<script>`
- Used by: Pages CI, which copies `site/*` to the artifact root
- Purpose: assemble and deploy the Pages artifact
- Location: `.github/workflows/deploy-pages.yml`
- Contains: one `deploy` job — checkout → `npm ci` → `npx vitepress build docs` → merge
- Depends on: Node 20, path-filtered triggers on `site/**`, `docs/**`, `package*.json`
- Used by: pushes to `main` and manual `workflow_dispatch`

## Data Flow

### Primary Request Path (user installation)

## Key Abstractions

- Purpose: plugin content delivery — clients only pick up changes when the manifest version rises
- Examples: `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`,
- Pattern: three files, one shared version, bumped together on any `plugin/` change
- Purpose: one registration readable by all three clients despite filename disagreements
- Examples: `plugin/.mcp.json` (Claude Code, Codex), `plugin/mcp.json` (Cursor) — identical JSON
- Pattern: duplicated real files, not a symlink (Windows checkout breaks symlinks); edit both or
- Purpose: one self-contained installer per external dependency, with provenance rationale inline
- Examples: `install_scip` (`setup.sh:448-480`), `install_zoekt` (`setup.sh:486-540`),
- Pattern: idempotent (presence-gated; `install_scip` version-gated), SHA256-verified
- Purpose: shippable agent behavior consumed by all three clients
- Examples: `plugin/skills/jarvis-setup/`, `plugin/skills/jarvis-use/`,
- Pattern: `SKILL.md` with YAML frontmatter (`name`, `description` trigger surface, `version`),
- Purpose: let the private repo's `tests/test_setup_sh.py` exercise individual functions
- Examples: `setup.sh:758-762` (`JARVIS_SETUP_SOURCED` guard), overridable env vars
- Pattern: guard-at-bottom main invocation; fixtures via environment redirection

## Entry Points

- Location: `setup.sh`
- Triggers: `curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh`;
- Responsibilities: install all pinned dependencies, manage PATH/shell rc, print per-dependency
- Location: `plugin/`
- Triggers: plugin install in Claude Code / Codex CLI / Cursor (see install matrix in
- Responsibilities: register the `jarvis` MCP server, provide the three skills, carry assets/license
- Location: `site/index.html`
- Triggers: GitHub Pages request to `/` (deployed by `.github/workflows/deploy-pages.yml`)
- Responsibilities: marketing page — hero, pipeline, usage, skills, local-first, roadmap sections
- Location: `docs/.vitepress/config.ts` + Markdown pages
- Triggers: Pages request to `/docs/`; local dev via `npm run docs:dev` (`package.json`)
- Responsibilities: user reference for quickstart, tools, CLI, concepts, integrations,

## Architectural Constraints

- **Threading:** None — no runtime code in this repo. `setup.sh` is strictly sequential POSIX sh.
- **Global state:** Installer-level only: `ONLY`, `FORCE`, `SUMMARY`, `EXIT_CODE` module vars in
- **Circular imports:** Not applicable (no import graph — shell + Markdown + JSON).
- **Ownership rule (hard):** `setup.sh` source of truth is `jarvis/setup.sh` in the private repo;
- **POSIX sh compliance:** `curl | sh` ignores the shebang (dash on many distros) — no arrays, no
- **Release-asset visibility:** `scip`/`zoekt` binaries must be published to this *public* repo's
- **semanticSearch under the plugin:** `plugin/.mcp.json` deliberately registers without the
- **Version floor:** `--from jarvis-mcp>=0.6.0` in both MCP configs must stay a valid `>=`
- **No secrets:** `JARVIS_DIST_TOKEN` lives only in the private repo's Actions secrets
- **Cursor validator:** marketplace and plugin `name` values must match and be lowercase

## Error Handling

- `run_one` (`setup.sh:713-723`) wraps each installer so one failed dependency records `FAILED`
- `install_*` functions return non-zero on failure rather than calling `exit` (contract in
- SHA256 verification gates every downloaded artifact before install (`verify_sha256`,
- `install_scip` warns when an older `scip` earlier on `PATH` shadows the freshly installed one
- Downstream MCP tools (private repo) return `{"error": "..."}` payloads instead of raising —
- User-facing failure triage: decision tree in `docs/troubleshooting/index.md`, upstream issues in

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
