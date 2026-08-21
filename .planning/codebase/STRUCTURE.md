# Codebase Structure

**Analysis Date:** 2026-08-21

## Directory Layout

```
jarvis-index/                        # public distribution surface for jarvis (private dev repo + PyPI jarvis-mcp)
├── setup.sh                         # POSIX-sh dependency bootstrapper — SYNCED from private repo, NEVER edit here
├── package.json                     # VitePress harness only (name: jarvis-index-docs; docs:dev/build/preview)
├── package-lock.json                # locks vitepress ^1.6.4
├── README.md                        # repo router: purpose, quick start, edit rules, repo layout
├── .gitignore                       # node_modules/, docs/.vitepress/cache/, docs/.vitepress/dist/
│
├── plugin/                          # THE PLUGIN PAYLOAD — source of truth, edit directly
│   ├── .claude-plugin/plugin.json   #   Claude Code plugin manifest (version — delivery gate)
│   ├── .cursor-plugin/plugin.json   #   Cursor plugin manifest (version, category, explicit paths)
│   ├── .mcp.json                    #   MCP server registration — read by Claude Code + Codex
│   ├── mcp.json                     #   MCP server registration — read by Cursor (IDENTICAL contents)
│   ├── README.md                    #   user-facing plugin doc: tools, install per client, privacy
│   ├── LICENSE                      #   MIT (the license the manifests reference)
│   ├── assets/                      #   app-icon.png (logo), jarvis-small.svg (composerIcon)
│   └── skills/                      #   three agent skills shipped by the plugin
│       ├── jarvis-setup/            #     onboarding: prerequisites → install → register → index → verify
│       │   ├── SKILL.md
│       │   └── agents/openai.yaml   #     Codex interface block
│       ├── jarvis-use/              #     everyday structural queries: decision matrix, gotchas
│       │   ├── SKILL.md
│       │   ├── references/tool-roster.md   # full signatures + return shapes for all 9 MCP tools
│       │   └── agents/openai.yaml
│       └── jarvis-issues/           #     bug/feature filing against this repo via gh
│           ├── SKILL.md
│           └── agents/openai.yaml
│
├── .claude-plugin/                  # Claude Code MARKETPLACE manifest (repo root, no version)
│   └── marketplace.json             #   → source: "./plugin"
├── .codex-plugin/                   # Codex CLI PLUGIN manifest (repo root — not inside plugin/)
│   └── plugin.json                  #   version + interface block (icons, prompts, brandColor)
├── .cursor-plugin/                  # Cursor MARKETPLACE manifest (repo root, no version)
│   └── marketplace.json             #   → source: "./plugin"
│
├── docs/                            # VitePress docs site — serves at /docs/
│   ├── .vitepress/
│   │   ├── config.ts                #   nav, sidebar, srcExclude, sitemap, base: '/docs/'
│   │   └── theme/                   #   index.ts (DefaultTheme) + style.css override
│   ├── index.md                     #   docs landing
│   ├── quickstart.md                #   install → index → first query
│   ├── guide/install.md             #   detailed install guide
│   ├── concepts/                    #   scip, zoekt, semantic-search, blast-radius, architecture
│   ├── tools/                       #   one page per MCP tool (9) + index.md overview
│   ├── cli/                         #   one page per jarvis CLI command + index.md overview
│   ├── integrations/                #   claude-code, cursor, codex-cli + index.md
│   ├── troubleshooting/             #   decision tree, upstream-issues, common-failures
│   ├── public/                      #   static assets copied verbatim into the build
│   ├── superpowers/specs/           #   design specs — EXCLUDED from build via srcExclude
│   ├── codebase-summary.md          #   maintainer docs — EXCLUDED from build via srcExclude:
│   ├── code-standards.md            #     codebase-summary, code-standards, deployment-guide,
│   ├── deployment-guide.md          #     project-overview-pdr, project-roadmap,
│   ├── project-overview-pdr.md      #     system-architecture, brand-spec, superpowers/**
│   ├── project-roadmap.md
│   ├── system-architecture.md       #   canonical maintainer architecture doc
│   └── brand-spec.md
│
├── site/                            # static landing page — serves at /
│   ├── index.html                   #   single self-contained page (inline CSS/SVG, ~989 lines)
│   ├── brand-logo.html              #   brand asset page
│   └── assets/                      #   jarvis-mark.svg, jarvis-avatar.svg, PNG avatars
│
├── .github/
│   ├── workflows/deploy-pages.yml   # builds docs + copies site/ into one Pages artifact
│   └── assets/                      # jarvis-local-pipeline.png (README banner)
│
├── .superpowers/sdd/                # placeholder (gitkeep only)
├── plans/                           # archived implementation plans (e.g. 0807-2314-landing-page)
└── .planning/codebase/              # GSD codebase maps (this document)
```

## Directory Purposes

**`plugin/`:**
- Purpose: the distributed plugin itself — the only payload users install
- Contains: three skills (`SKILL.md` + `agents/openai.yaml` + `references/`), MCP registration
  JSON (two filenames, identical contents), plugin manifests for Claude Code and Cursor, icons,
  `LICENSE`, user-facing `README.md`
- Key files: `plugin/.mcp.json`, `plugin/mcp.json`, `plugin/.claude-plugin/plugin.json`,
  `plugin/.cursor-plugin/plugin.json`, `plugin/skills/jarvis-use/references/tool-roster.md`

**`.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/` (repo roots):**
- Purpose: per-client entry manifests that make `plugin/` installable; Codex's doubles as its full
  plugin manifest
- Contains: JSON only; the two marketplaces carry no `version`
- Key files: `.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`,
  `.codex-plugin/plugin.json`

**`docs/`:**
- Purpose: user-facing documentation site plus maintainer-only docs, split at build time
- Contains: Markdown pages; `srcExclude` in `docs/.vitepress/config.ts:17-26` keeps maintainer
  docs (`code-standards.md`, `deployment-guide.md`, `system-architecture.md`,
  `codebase-summary.md`, `project-overview-pdr.md`, `project-roadmap.md`, `brand-spec.md`,
  `superpowers/**`) out of the published site
- Key files: `docs/.vitepress/config.ts`, `docs/quickstart.md`, `docs/concepts/architecture.md`

**`site/`:**
- Purpose: marketing landing page at `/`
- Contains: `index.html` (hero/pipeline/usage/skills/local-first/roadmap sections, inline
  CSS + SVG, Google Fonts links, one inline script), `brand-logo.html`, SVG/PNG brand assets
- Key files: `site/index.html`

**`.github/`:**
- Purpose: CI for Pages deployment plus README banner art
- Contains: `workflows/deploy-pages.yml` (path-filtered on `site/**`, `docs/**`, `package*.json`)
- Key files: `.github/workflows/deploy-pages.yml`

**`plans/`:**
- Purpose: archived implementation plans (dated folders `MMDD-HHMM-<topic>`)
- Contains: `plans/0807-2314-landing-page/plan.md` — the landing-page build plan

## Key File Locations

**Entry Points:**
- `setup.sh`: installer users curl-pipe to sh; also the sync target from the private repo
- `plugin/`: payload loaded by all three agent clients on plugin install
- `site/index.html`: landing page served at `/`
- `docs/.vitepress/config.ts`: docs site entry (build via `npx vitepress build docs`)
- `.github/workflows/deploy-pages.yml`: deployment entry (merge site + docs into `_artifact/`)

**Configuration:**
- `package.json`: VitePress scripts (`docs:dev`, `docs:build`, `docs:preview`)
- `docs/.vitepress/config.ts`: nav/sidebar/srcExclude/sitemap; `base: '/docs/'`, `cleanUrls: true`
- `plugin/.mcp.json` + `plugin/mcp.json`: MCP server registration (`uvx --from jarvis-mcp>=0.6.0
  jarvis-server`) — edit both or neither
- `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`,
  `.codex-plugin/plugin.json`: version fields (currently `0.7.2`) — bump all three together
- `.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`: marketplace listings
- `setup.sh:12-65`: version pins block (`SCIP_COMMIT_PIN`, `ZOEKT_COMMIT_PIN`,
  `SCIP_SWIFT_VERSION`, `SCIP_JAVA_VERSION`, release-repo pointers)
- `.gitignore`: `node_modules/`, `docs/.vitepress/cache/`, `docs/.vitepress/dist/`

**Core Logic:**
- `setup.sh`: the only executable logic in the repo (POSIX sh; sections: versions, logging,
  prompt, platform detection, install dir, download, installers, orchestration, main)
- `plugin/skills/*/SKILL.md`: agent-behavior logic (decision matrices, troubleshooting tables,
  filing workflows)
- `plugin/skills/jarvis-use/references/tool-roster.md`: authoritative tool contract reference

**Testing:**
- None in this repo. `setup.sh` tests live in the private repo (`tests/test_setup_sh.py`, sourced
  via the `JARVIS_SETUP_SOURCED=1` seam at `setup.sh:758-762`).
- Validation substitutes: Cursor official plugin validator (`docs/deployment-guide.md` Channel 2
  step 4) and the post-publish smoke test (`docs/deployment-guide.md`).

## Naming Conventions

**Files:**
- Skills: kebab-case directory named `jarvis-<role>` → `plugin/skills/jarvis-setup/`
- Skill entry point: always uppercase `SKILL.md`; Codex sidecar always `agents/openai.yaml`
- Docs pages: kebab-case Markdown matching the sidebar slug → `docs/tools/go-to-definition.md`
- Manifests: exactly the filename each client requires — `.mcp.json` vs `mcp.json`,
  `marketplace.json` vs `plugin.json` — never rename
- setup.sh functions: snake_case with verb prefixes — `install_*`, `detect_*`, `ensure_*`,
  `have_cmd`, `log_*`

**Directories:**
- Client-adaptation dirs: dot-prefixed client name → `.claude-plugin/`, `.cursor-plugin/`,
  `.codex-plugin/`
- Docs sections: lowercase singular nouns (`concepts/`, `tools/`, `cli/`, `integrations/`,
  `troubleshooting/`, `guide/`)
- Plans: dated folders `MMDD-HHMM-<topic>` → `plans/0807-2314-landing-page/`

**Content conventions:**
- Plugin name everywhere: lowercase `jarvis` (Cursor requires lowercase kebab-case matching
  between its two manifests)
- Version strings: plugin manifests share one semver (independent of the `jarvis-mcp` PyPI
  package); skills carry their own `version: "0.1.0"` frontmatter
- Commit style: conventional commits; the machine-generated sync form
  `chore: sync distribution surface from jarvis@<sha>` must never be hand-written
  (`docs/code-standards.md` "Commits")

## Where to Add New Code

**New Feature (plugin content — new tool doc, skill change, MCP config change):**
- Primary code: `plugin/` (skills under `plugin/skills/<name>/SKILL.md`; references under
  `plugin/skills/<name>/references/`)
- Then bump `version` in ALL THREE: `plugin/.claude-plugin/plugin.json`,
  `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json` — same value, or the change
  reaches nobody (`docs/code-standards.md`)
- If MCP registration changed: edit both `plugin/.mcp.json` AND `plugin/mcp.json`
- Validate: run the Cursor validator from repo root (`docs/deployment-guide.md` Channel 2 step 4)

**New Skill:**
- Implementation: `plugin/skills/jarvis-<role>/SKILL.md` with `name`/`description`/`version`
  frontmatter (description is the trigger surface — name concrete situations), plus
  `agents/openai.yaml`; open the body with sibling cross-links to the existing three skills
- Then the triple version bump (above)

**New Docs Page:**
- Implementation: `docs/<section>/<kebab-name>.md` with `description` frontmatter, then register
  it in the matching sidebar array in `docs/.vitepress/config.ts:42-116`
- Maintainer-only doc: place in `docs/` AND add to `srcExclude` in
  `docs/.vitepress/config.ts:17-26` so it stays out of the published site

**New Landing-Page Section:**
- Implementation: edit `site/index.html` in place — single self-contained file; the deploy
  workflow picks it up via the `site/**` path filter

**Installer Changes:**
- NEVER in this repo — `setup.sh` is overwritten by the private repo's sync workflow on every
  release. Fix upstream in `jarvis/setup.sh` (`docs/code-standards.md` "The ownership rule")

**Utilities:**
- Shared helpers: none exist; docs cross-reference by relative path (e.g. `README.md` →
  `plugin/README.md` → `plugin/skills/jarvis-use/references/tool-roster.md`). Keep factual
  strings single-sourced and copied verbatim from a repo source, never retyped.

## Special Directories

**`docs/.vitepress/dist/`:**
- Purpose: VitePress build output consumed by the Pages workflow
- Generated: Yes (`npm run docs:build`)
- Committed: No (`.gitignore`)

**`docs/.vitepress/cache/:**
- Purpose: VitePress dev/build cache
- Generated: Yes
- Committed: No (`.gitignore`)

**`docs/public/`:**
- Purpose: static assets VitePress copies verbatim into the site root
- Generated: No
- Committed: Yes

**`docs/superpowers/` and the maintainer `.md` files at `docs/` root:**
- Purpose: internal specs/standards excluded from the published site
- Generated: No
- Committed: Yes (exclusion is build-time only, via `srcExclude`)

**`plans/`:**
- Purpose: archived, dated implementation plans — historical reference, not live config
- Generated: No
- Committed: Yes

**`.superpowers/sdd/`:**
- Purpose: placeholder for a superpowers workflow (contains only a `.gitignore` keep-file)
- Generated: No
- Committed: Yes

**GitHub Releases (not a directory, but structural):**
- Purpose: hosts the `scip-<commit>` and `zoekt-<commit>` tarballs + `.sha256` sidecars that
  `setup.sh` downloads (this repo must be the asset owner — the dev repo is private and would 404)
- Generated: Yes (by `build-scip.yml` / `build-zoekt.yml` in the private repo)
- Committed: N/A (release assets, not git files)

---

*Structure analysis: 2026-08-21*
