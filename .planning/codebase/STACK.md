# Technology Stack

**Analysis Date:** 2026-08-21

This repo is the **public distribution surface** for jarvis — installer, plugins, binary release assets, docs, landing page, issue tracker. It holds no application source (see `README.md` "Why this repo exists" and `docs/system-architecture.md`). The stack below covers what actually lives here.

## Languages

**Primary:**
- Markdown — all documentation (`README.md`, `docs/**/*.md`), plugin skills (`plugin/skills/jarvis-setup/SKILL.md`, `plugin/skills/jarvis-use/SKILL.md`, `plugin/skills/jarvis-issues/SKILL.md`, `plugin/skills/jarvis-use/references/tool-roster.md`), maintainer guides (`docs/code-standards.md`, `docs/deployment-guide.md`, `docs/system-architecture.md`, `docs/codebase-summary.md`, `docs/project-overview-pdr.md`, `docs/project-roadmap.md`)
- POSIX shell — `setup.sh` (762 lines), the dependency bootstrapper. Strictly POSIX sh (no arrays, no `[[ ]]`, no bashisms) because `curl | sh` runs under system sh (dash). NEVER edit here — synced from the private `jarvis/` repo (rule stated in `README.md` and `docs/deployment-guide.md`)

**Secondary:**
- HTML/CSS/vanilla JS — static landing page `site/index.html` (989 lines, single self-contained file, no framework) and `site/brand-logo.html` (464 lines). Custom CSS variables theme with light/dark modes via `[data-theme="dark"]`
- TypeScript — VitePress config only: `docs/.vitepress/config.ts` (135 lines), `docs/.vitepress/theme/index.ts` (re-exports DefaultTheme + `./style.css`)
- CSS — VitePress theme override `docs/.vitepress/theme/style.css` (59 lines)
- JSON — all manifests and configs: `package.json`, `package-lock.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`, `.codex-plugin/plugin.json`, `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `plugin/.mcp.json`, `plugin/mcp.json`
- YAML — CI workflow `.github/workflows/deploy-pages.yml`

## Runtime

**Environment:**
- Node.js 20 — pinned in CI (`node-version: '20'` in `.github/workflows/deploy-pages.yml`); only needed to build VitePress docs, not to use the repo
- No server runtime. Output is fully static (GitHub Pages). The *product* this repo distributes runs on Python via `uv`/`uvx` (see INTEGRATIONS.md)

**Package Manager:**
- npm (no `engines` field declared in `package.json`)
- Lockfile: present — `package-lock.json` (lockfileVersion 3, 175 packages, all transitive via VitePress)

## Frameworks

**Core:**
- VitePress ^1.6.4 (resolved 1.6.4) — docs site builder, sole devDependency in `package.json`. Config in `docs/.vitepress/config.ts`: `base: '/docs/'`, `cleanUrls: true`, `lastUpdated: true`, sitemap hostname `https://jarvis-intelligence.github.io/jarvis-index/docs`, local search provider, `srcExclude` keeps internal maintainer docs (`docs/system-architecture.md`, `docs/deployment-guide.md`, etc.) out of the public site
- Landing page uses **no framework** — hand-rolled static HTML in `site/index.html`

**Testing:**
- None in this repo. `setup.sh` is tested by `tests/test_setup_sh.py` in the private `jarvis/` repo, which sources it with `JARVIS_SETUP_SOURCED=1` (testability seam at `setup.sh:760`)

**Build/Dev:**
- Vite 5.4.21 (transitive via VitePress) — builds `docs/` into `docs/.vitepress/dist/`
- Scripts (from `package.json`): `npm run docs:dev` (dev server), `npm run docs:build`, `npm run docs:preview`
- Pages artifact assembly is plain shell in CI: copies `site/*` to artifact root and `docs/.vitepress/dist/*` into `_artifact/docs/` (`.github/workflows/deploy-pages.yml:47-55`)

## Key Dependencies

**Critical:**
- `vitepress` ^1.6.4 — the only declared dependency; docs publishing depends entirely on it
- Notable VitePress transitives (from `package-lock.json`): `vue` 3.5.41, `vite` 5.4.21, `shiki` 2.5.0 (syntax highlighting), `minisearch` 7.2.0 (local search index), `esbuild` 0.21.5, `rollup` 4.62.4

**Infrastructure (distributed by this repo, not npm dependencies):**
- `setup.sh` installs pinned binaries into `~/.jarvis/bin` — all pins live in the versions section of `setup.sh:12-65`:
  - `scip` — fork build at `SCIP_COMMIT_PIN="56791658a873"` (`setup.sh:28`), from this repo's own GitHub Releases (fork `phuongddx/scip` carries the scip#465 `typeHierarchy` fix; upstream through v0.9.0 lacks it)
  - `zoekt-git-index` + `zoekt-webserver` — `ZOEKT_COMMIT_PIN="33f1f18af292"` (`setup.sh:32`), one tarball from this repo's Releases (upstream `sourcegraph/zoekt` publishes no releases)
  - `scip-swift` v0.1.2 — from `jarvis-intelligence/scip-swift` Releases, macOS arm64 only (`setup.sh:48-53`)
  - `scip-java` v0.13.1 (Kotlin 2.2.0 exactly) — from upstream `scip-code/scip-java` Releases (`setup.sh:63-65`)
  - `scip-typescript`, `scip-python` — npm globals `@sourcegraph/scip-typescript`, `@sourcegraph/scip-python` via `install_npm_indexer` (`setup.sh:604-610`)
  - `jarvis-mcp` (PyPI) via `uv tool install` — soft-skipped if `uv` missing (documented in `docs/system-architecture.md` dependency sourcing map)
- All tarball/raw downloads are SHA256-verified against `.sha256` sidecars (`verify_sha256` at `setup.sh:238-248`, `install_tarball_binary` at `setup.sh:254-304`, `install_raw_binary` at `setup.sh:306-351`)

## Configuration

**Environment:**
- No `.env` file, no required env vars for building this repo
- `setup.sh` honors test/install-time overrides (documented in `usage()` at `setup.sh:664-667`): `JARVIS_BIN_DIR` (install dir), `JARVIS_DATA_DIR` (shim dir, also keyed independently at `setup.sh:162-164`), plus `JARVIS_SETUP_SOURCED=1` (skip `main`) and `BASH_SHIM_CANDIDATES` (`setup.sh:360`)
- `setup.sh` CLI flags: `--only <name>`, `--force`, `--help` (`parse_args` at `setup.sh:670-696`)

**Build:**
- `docs/.vitepress/config.ts` — VitePress site config (nav, sidebar, sitemap, local search, theme)
- `docs/.vitepress/theme/index.ts` + `docs/.vitepress/theme/style.css` — theme customization
- `.gitignore` ignores `node_modules/`, `docs/.vitepress/cache/`, `docs/.vitepress/dist/`
- Plugin manifests must stay version-synced: any change under `plugin/` bumps `version` to the same value in all three of `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json` (currently 0.7.2; rule in `README.md` "Editing this repo")

## Platform Requirements

**Development:**
- macOS or Linux (product constraint; Windows unsupported per `README.md` Requirements)
- Node.js 20 + npm (docs build), git
- Optional local tools for publishing work: `gh` CLI for release verification (`docs/deployment-guide.md` smoke test), Cursor plugin validator via `curl … node /tmp/validate-template.mjs` (`docs/deployment-guide.md:46-53`)

**Production:**
- GitHub Pages static hosting — landing page at `/`, docs at `/docs/` (see `.github/workflows/deploy-pages.yml` and INTEGRATIONS.md)
- End users need macOS/Linux, `uv` on PATH, and `java` only for Java/Kotlin indexing (`README.md` Requirements)

---

*Stack analysis: 2026-08-21*
