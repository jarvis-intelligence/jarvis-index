# External Integrations

**Analysis Date:** 2026-08-21

This repo integrates with external services in two ways: (1) **distribution** — publishing the installer, plugins, and binaries to users; (2) **the product it wires up** — the jarvis MCP server, registered into coding-agent clients by the plugin manifests. The repo itself hosts nothing and runs no server.

## APIs & External Services

**GitHub Releases (binary distribution):**
- `jarvis-intelligence/jarvis-index` (this repo) — hosts `scip-<commit>` and `zoekt-<commit>` release tarballs + `.sha256` sidecars, downloaded by `setup.sh` (`SCIP_RELEASE_REPO`/`ZOEKT_RELEASE_REPO` at `setup.sh:40-41`; current tags `scip-56791658a873`, `zoekt-33f1f18af292` per `docs/deployment-guide.md:93-98`). Releases are built and published by CI in the *private* `jarvis/` repo (`build-scip.yml`, `build-zoekt.yml`), not from workflows here
- `jarvis-intelligence/scip-swift` — scip-swift v0.1.2 assets, macOS arm64 only (`SCIP_SWIFT_REPO` at `setup.sh:53`)
- `scip-code/scip-java` (upstream) — v0.13.1 self-contained launcher with embedded JAR (`SCIP_JAVA_REPO` at `setup.sh:64`)
  - SDK/Client: raw `curl -fsSL --retry 3` in `download_to` (`setup.sh:250-252`), SHA256-verified
  - Auth: none (public assets)

**Package registries:**
- PyPI — `jarvis-mcp` package (the actual product: `jarvis` CLI + `jarvis-server` MCP server). Installed via `uv tool install jarvis-mcp` or run ad hoc via `uvx --from jarvis-mcp>=0.6.0 jarvis-server` (floor pinned in `plugin/.mcp.json` / `plugin/mcp.json`). Optional extras: `[semantic]` (BAAI/bge-m3 embeddings, LanceDB, reciprocal rank fusion) and `[watch]` (auto-reindex via `watchdog`) — see `docs/guide/install.md:41-48`
- npm registry — `@sourcegraph/scip-typescript` and `@sourcegraph/scip-python` installed as globals by `install_npm_indexer` (`setup.sh:577-610`)
- Google Fonts CDN — Geist, Geist Mono, Rajdhani families for the landing page (`<link>` tags in `site/index.html:9-11`); the only third-party fetch on the published site

**Installer delivery:**
- `raw.githubusercontent.com` — canonical one-liner `curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh` (`README.md:44`, `docs/guide/install.md:53`). This is why the repo exists: raw files on the private dev repo would 404 unauthenticated

**MCP server registration (the core product integration):**
- `plugin/.mcp.json` (Claude Code, Codex) and `plugin/mcp.json` (Cursor; duplicated file, must be edited together) register the `jarvis` MCP server: `uvx --from jarvis-mcp>=0.6.0 jarvis-server` over **stdio JSON-RPC**. Nine tools: `documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`, `typeHierarchy`, `getIndexStatus`, `searchCode`, `semanticSearch`, `blastRadius` (full roster: `plugin/skills/jarvis-use/references/tool-roster.md`)
- Deliberately registers **without** the `[semantic]` extra to keep cold-start light; under the default registration `semanticSearch` always errors — users needing it register a second server `jarvis-semantic` (settled decision, `docs/system-architecture.md:170-179`, commands in `plugin/README.md:69-80`)
- Plugin marketplaces consuming this repo: Claude Code (`.claude-plugin/marketplace.json` → source `./plugin`), Codex CLI (`.codex-plugin/plugin.json` at repo root), Cursor (`.cursor-plugin/marketplace.json` + `plugin/.cursor-plugin/plugin.json`). Client matrix: `docs/system-architecture.md:90-114`

## Data Storage

**Databases:**
- None hosted by this repo (static site only)
- Downstream product data lives entirely on the user's machine under `~/.jarvis/`: SQLite `index-<sha>.db` (opened read-only `mode=ro&immutable=1`), Zoekt shards `.zoekt/<slug>_v16.*.zoekt`, optional LanceDB vectors `lancedb/`, and `registry.db` (repos + dependency-graph edges). Layout documented in `docs/guide/install.md:76-92` and `docs/concepts/architecture.md:31-44`

**File Storage:**
- Local filesystem only — release binaries in `~/.jarvis/bin`, shims in `~/.jarvis/shims` (`setup.sh:139-164`)

**Caching:**
- None. `uv tool install` pre-warms uv's cache so the plugin's later `uvx` launch avoids a cold resolve inside the MCP client's 30s connect window (`docs/system-architecture.md:152`)

## Authentication & Identity

**Auth Provider:**
- None — "Custom"/not applicable. The product is local-first: no code leaves the machine, no telemetry, no account, no network calls at query time (`plugin/README.md` Privacy, `docs/concepts/architecture.md:1-8`)
- Publishing-side auth lives in the private repo: `JARVIS_DIST_TOKEN` for the sync workflow (known failure mode at commit `c2a79e5`, `docs/deployment-guide.md:25-27`). No secret files exist in this repo

## Monitoring & Observability

**Error Tracking:**
- None. No analytics or telemetry on the landing page or docs

**Logs:**
- `setup.sh` logs to stdout/stderr via `log_info` / `log_warn` / `log_error` (`setup.sh:67-79`)
- CI logs via GitHub Actions only

## CI/CD & Deployment

**Hosting:**
- GitHub Pages at `https://jarvis-intelligence.github.io/jarvis-index/` — landing page at `/`, VitePress docs at `/docs/` (base path set in `docs/.vitepress/config.ts:8`)

**CI Pipeline:**
- GitHub Actions, single workflow in this repo: `.github/workflows/deploy-pages.yml` — triggers on push to `main` touching `site/**`, `docs/**`, `package.json`, `package-lock.json`, or the workflow itself (plus `workflow_dispatch`). Steps: checkout → configure-pages → Node 20 + npm cache → `npm ci` → `npx vitepress build docs` → assemble `_artifact/` (site at root, docs under `docs/`) → upload-pages-artifact → deploy-pages. Permissions: `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`
- Four publishing channels overall (only Channel 2 is manual from this repo): setup.sh sync and binary release builds run from the private `jarvis/` repo; plugin content is edited and version-bumped here; scip-swift ships from its own repo — full matrix in `docs/deployment-guide.md`
- Cursor team-marketplace auto-refresh additionally requires the Cursor GitHub App installed on this repo (`docs/deployment-guide.md:74-83`)

## Environment Configuration

**Required env vars:**
- None for this repo. Optional `setup.sh` overrides: `JARVIS_BIN_DIR`, `JARVIS_DATA_DIR` (`setup.sh:664-667`), `JARVIS_SETUP_SOURCED`, `BASH_SHIM_CANDIDATES` (`setup.sh:360`)

**Secrets location:**
- None in this repo. No `.env` file present. Distribution token (`JARVIS_DIST_TOKEN`) lives in the private `jarvis/` repo only

## Webhooks & Callbacks

**Incoming:**
- None. GitHub Issues on this repo serve as the public issue tracker (`README.md:143`)

**Outgoing:**
- None. Network egress from installed jarvis is limited to the one-time `uvx` wheel fetch and (only with `[semantic]`) the one-time sentence-transformers model download (`plugin/README.md:85`)

---

*Integration audit: 2026-08-21*
