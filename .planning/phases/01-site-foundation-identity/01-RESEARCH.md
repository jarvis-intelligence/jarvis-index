# Phase 1: Site Foundation & Identity — Research

**Researched:** 2026-08-21
**Domain:** Static site infrastructure — unified Astro + Starlight docs/landing site, GitHub Pages deploy pipeline, design-token + self-hosted-font identity layer, URL contract, CI guard checks
**Confidence:** HIGH — every load-bearing claim below was verified today against the live site (curl), the npm registry (`npm view`), or installed package source in throwaway `/tmp` installs of `astro@5.18.2 + @astrojs/starlight@0.36.0` and `astro@7.2.4 + @astrojs/starlight@0.41.7`. Model-knowledge items are marked inline with confidence levels. No web search was used.

---

## User Constraints

No `CONTEXT.md` exists for this phase (discuss-phase not run). Constraints below are lifted from REQUIREMENTS.md, ROADMAP.md, and STATE.md — they are the locked decisions the planner MUST honor.

### Locked Decisions

- **SITE-02 mandates the engine**: unified **Astro 5 + Starlight** — landing at `/`, docs at `/docs/`, ONE project, ONE Pages artifact. The Astro-vs-VitePress fork is closed; Phase 1 builds, not decides. (ROADMAP Notes: "engine decision closed".)
- **SITE-05**: Node 20→22 bump **with** `engines` field, and the `deploy-pages.yml` diff ships **in the same commit** as any stack change.
- **SITE-03**: `design/tokens.css` is the single design-token layer, consumed by both surfaces.
- **SITE-04**: Fontsource self-hosted fonts; **zero third-party font requests**.
- **SITE-06**: URL contract (enumeration + redirect map + stub/`404.html` mechanism) is *decided* in Phase 1; its "shipped with the restructure" half executes in Phase 2 (DOCS-09). Phase 1 ships the *mechanism*, not the content churn.
- **SITE-07**: the three CI checks land in Phase 1, **before** the skills phase they protect.
- **Custom domain**: undecided; STATE.md assigns the decision to Phase 1 planning. Default recommendation below: stay on `jarvis-intelligence.github.io/jarvis-index` (see Open Questions).
- **Out of scope (hard fences)**: no `setup.sh` edits; no fourth manifest; no sync automation; no hosted search/analytics; no multi-version docs.

### Claude's Discretion

- Exact npm version pins (verified below — the planner picks within the stated compatibility matrix).
- Repo layout for the Astro project (where `src/`, `astro.config.*`, `design/` live), provided URL contract and single-artifact deploy are preserved.
- Scope of `tokens.css` content in Phase 1: the phase delivers the *variable layer + wiring*; the final palette/typography identity can be provisional (Phase 3 landing work refines it against the same variables).
- CI-check implementation (single Node script vs shell; new workflow file vs extend deploy workflow — recommendation below).
- `build.format` (`directory` vs `file`) and trailing-slash policy, provided every current public URL keeps resolving.

### Deferred Ideas (OUT OF SCOPE)

- Tailwind (STACK.md: skip unless the design demands it; if ever added, landing-scoped only).
- lychee/link-checker CI step (replaces `ignoreDeadLinks` when docs IA stabilizes — Phase 2+ concern; STACK.md lists it).
- MDX pages (`@astrojs/mdx` is auto-bundled by Starlight; declaring it explicitly is only needed when tutorial Tabs/components arrive in Phase 2).
- `llms.txt`, analytics, versioned docs (later phases / never).

---

## Architectural Responsibility Map

Single-tier static application — all capabilities reside in **CDN/Static (GitHub Pages)**, assembled by **CI (GitHub Actions)**. No server tier, no runtime state.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Landing page at `/` | CDN/Static | CI (build) | Prerendered HTML; Astro islands give zero-JS default |
| Docs at `/docs/` | CDN/Static | CI (build) | Starlight prerendered pages + hashed assets |
| Search index (Pagefind) | CDN/Static | CI (post-build indexing) | Pagefind indexes built HTML into static `pagefind.*` files at build time |
| Theme toggle persistence | Browser/Client | CDN/Static (inline script) | localStorage + inline anti-FOUC script; no server |
| Design tokens/fonts | CDN/Static | CI (Fontsource from node_modules) | woff2 emitted as same-origin hashed assets |
| Redirects/404 | CDN/Static | CI (meta-refresh HTML emission) | Pages has no server redirects; static HTML stubs only |
| Deploy + smoke probe | CI | CDN/Static (probed) | Actions build → single artifact → deploy-pages → curl probe |
| Manifest CI checks | CI | — | Pure repo assertions, no deploy |

---

## Summary

This phase replaces a two-artifact CI assembly (hand-copied `site/` + VitePress `docs/.vitepress/dist/`) with one Astro + Starlight project that emits a single `dist/` Pages artifact. The live bug this fixes is now **fully root-caused at the library level** (verified today, not just observed): VitePress `base: '/docs/'` builds asset URLs from the domain root (`/docs/assets/…`), but the Pages project site lives under `/jarvis-index/`, so every asset 404s — confirmed by probe (`/docs/assets/style.CF4wHae3.css` → 404, `/jarvis-index/docs/assets/style.CF4wHae3.css` → 200). A **second live bug** was found in the same family: the deployed `sitemap.xml` lists every URL *without* the `/docs` segment (e.g. `…/jarvis-index/cli/forget` → 404). Root cause verified in VitePress 1.6.4's bundled sitemap library: it composes `new URL(item, hostname)` where items are base-less relative paths — a hostname without a trailing slash (`…/jarvis-index/docs`) makes `docs` a replaceable path segment. Both are fixed by deriving every path prefix from one constant: the true origin prefix `/jarvis-index`.

The npm-reality check the STATE.md blocker asked for produced one material finding: **"Astro 5" is no longer the current major.** `astro@latest` is **7.2.4** (requires Node ≥22.12); the last 5.x is **5.18.2**; the last Starlight line that peers on Astro 5 is **0.37.7** (`astro ^5.5.0`), while Starlight 0.41.7 peers `astro ^7.0.2`. Both pairs are viable on Node 22; the mandate-compliant pair is {astro 5.18.2, starlight 0.37.7} and the current pair is {astro 7.2.4, starlight 0.41.7}. The Astro 6 line (starlight 0.38–0.40) should be avoided entirely (0.40.0 even ships a typo'd peer dependency `@astrojs/markdown-satteri`). The planner should either pin the mandated Astro 5 pair verbatim or surface the 5-vs-7 choice to the user as a one-line roadmap amendment — everything else in this research holds identically for both.

The Starlight-at-`/docs/` question is settled by code inspection (HIGH confidence, both 0.36 and 0.41 sources read): Starlight has **no `routePrefix` option in any version through 0.41.7**; it injects a root catch-all `[...slug]` route and its content folder is **hardcoded** to `src/content/docs/` ("We still rely on the content collection folder structure to be fixed for now" — `utils/collection.ts`). Therefore the supported single-project pattern is: docs content nested at `src/content/docs/docs/**` (URLs derive from path → `/docs/**`), landing as plain `src/pages/index.astro` (Astro route precedence: static routes beat the catch-all). The two-builds fallback is not needed. Dark mode (localStorage + `data-theme`, built-in toggle with persistence and anti-FOUC inline script — verified in `ThemeProvider.astro`) and Pagefind search (default-on, verified in config schema) are Starlight built-ins; the only real work is unifying the landing's storage key (`jarvis-theme`) with Starlight's (`starlight-theme`) so one toggle serves both surfaces.

**Primary recommendation:** Execute plan 01-01 as a pure VitePress two-line hotfix (`base` + sitemap-hostname trailing slash) + post-deploy smoke probe today; then build the unified site as {astro 5.18.2 + starlight 0.37.7 (or user-approved 7.x pair)} with content nested under `src/content/docs/docs/`, `site: 'https://jarvis-intelligence.github.io'` + `base: '/jarvis-index'` as the single origin constant, tokens + Fontsource wired through Starlight `customCss`, and the three CI checks in a **new** path-triggered workflow (they must run on PRs, which the push-to-main-only deploy workflow cannot do).

---

## Standard Stack

### Core

| Package | Verified version (npm, 2026-08-21) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | **5.18.2** (last 5.x; latest is **7.2.4**) | Unified SSG for landing + docs | Mandated by SITE-02. Zero-JS default; single project → single artifact. Engines 5.18.2: `18.20.8 \|\| ^20.3.0 \|\| >=22.0.0` — Node 22 ✓. |
| `@astrojs/starlight` | **0.37.7** (last line peering `astro ^5.5.0`; 0.41.7 peers `astro ^7.0.2`) | Docs engine at `/docs/` | Bundles everything SITE-08 needs: Pagefind search (default-on), Expressive Code, `@astrojs/sitemap`, `@astrojs/mdx` — verified in its dependency list. Theming surface: `customCss` + component overrides (verified in `schemas/components.ts`: Head, ThemeProvider, PageFrame, Header, Footer, Hero, Sidebar…). |
| `@astrojs/mdx` | **4.3.14** (peers `astro ^5.0.0`) | MDX in docs pages | Phase 2 need (Tabs for per-client guides); auto-bundled by Starlight anyway — declaring it explicitly is optional. |
| `@fontsource-variable/geist` | **5.3.0** | Self-hosted variable sans (current landing identity) | Replaces the Google Fonts CDN `<link>`. Import path consumed by Starlight `customCss` (schema docstring explicitly supports package imports like `'@fontsource/roboto'`). |
| `@fontsource-variable/geist-mono` | **5.3.0** | Self-hosted variable mono | Same. |
| `@fontsource/rajdhani` | **5.3.0** (static weights — no variable package exists; verified) | Wordmark font (current brand-spec) | Only if the Phase 1 identity keeps the Rajdhani wordmark; otherwise drop. |
| `pagefind` | 1.5.2 standalone (Starlight bundles `pagefind ^1.3`/`^1.5` + `@pagefind/default-ui`) | Static local search | **No direct dependency needed** — Starlight runs it at build time. Disable with `pagefind: false` (verified in `user-config.ts`). |
| GitHub Pages actions | `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4` (read from deploy-pages.yml) | Deploy | Keep verbatim; only build step, artifact path (`dist`), Node version, and trigger paths change. |

### Supporting

| Item | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `@astrojs/sitemap` | bundled by Starlight | sitemap | Auto-added by Starlight; composes `site + base + path` correctly (no VitePress trailing-slash footgun — verified `integrations/sitemap.ts` just forwards Astro's config). |
| Astro `redirects` config | built-in (verified: static output emits `<meta http-equiv="refresh">` HTML — `astro/dist/core/routing/3xx.js`) | Old→new URL stubs | SITE-06 mechanism: declare a map; Astro emits stub HTML. True 301s impossible on Pages — document that. |
| Node.js | 22 (local machine verified on v22.23.2) | Build runtime | SITE-05. If Astro 7 is chosen, engines must be `>=22.12` (astro 7.2.4 requires it). |
| npm | 10.x, lockfile v3 | Package manager | Stay on npm; regenerate lockfile ONCE with the stack change (Pitfall: lockfile-major drift). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro 5.18.2 + Starlight 0.37.7 (mandate-compliant) | Astro 7.2.4 + Starlight 0.41.7 (current) | Same architecture, both Node-22-clean. 5.x is an older major (support-window concern, MEDIUM confidence on Astro's two-major policy from training knowledge); 7.x matches "latest" but requires amending the "Astro 5" wording in SITE-02/roadmap and engines `>=22.12`. Planner should surface to user; default to the mandated 5.x pair. |
| Astro 6.x line | — | **Avoid.** Starlight 0.38–0.40 targets it; 0.40.0 ships a typo'd peer dep (`@astrojs/markdown-satteri`); nothing over 5.x/7.x. |
| Single project, nested content dir (recommended) | Two Astro builds merged in CI (STACK.md fallback) | Fallback not needed — mount verified workable (see Architecture Patterns). Keep fallback documented as escape hatch only. |
| Stay on VitePress 1.6.4 | — | Closed by SITE-02. (For the record: VitePress would only need the two-line base/sitemap hotfix; the mandate chose otherwise.) |

**Installation (unified site):**
```bash
npm install astro@5.18.2 @astrojs/starlight@0.37.7
npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource/rajdhani
# then: rm vitepress from devDependencies, regenerate package-lock.json
```

---

## Architecture Patterns

### System Architecture Diagram

```
                    git push to main (path-filtered: src/** design/** docs-migrate astro.config.* package*.json workflow)
                                      │
              ┌───────────────────────▼───────────────────────────┐
              │  CI: deploy-pages.yml                               │
              │  setup-node@v4 (22, npm cache) → npm ci             │
              │  → npm run build                                    │
              │     Astro:                                                          │
              │       src/pages/index.astro ──────────► dist/index.html            │
              │       src/content/docs/docs/**.md ──► dist/docs/**/*.html  (Starlight [...slug])
              │       design/tokens.css ──(import)──► hashed CSS on every page     │
              │       @fontsource-variable/* ──────► dist/_astro/*.woff2 (same-origin)
              │       Pagefind (post-build) ───────► dist/docs/pagefind.{js,json}
              │       Astro redirects map ─────────► dist/<old>/index.html meta-refresh stubs
              │       Starlight 404 route ─────────► dist/404.html                │
              │  → separate checks.yml job/workflow (manifest assertions)          │
              │  → upload-pages-artifact@v3 (path: dist) → deploy-pages@v4         │
              │  → post-deploy smoke probe (curl / and /docs/ + one hashed asset)  │
              └───────────────────────┬───────────────────────────┘
                                      ▼
        GitHub Pages origin: https://jarvis-intelligence.github.io/jarvis-index/
        visitor browser ──► localStorage['starlight-theme'] + data-theme (dark mode)
                          ─► /docs/ pagefind.* (search, fully local)
```

Trace: a push touching tokens → path filter fires → one build consumes `design/tokens.css` for BOTH surfaces → one atomic artifact swap → probe proves `/` and `/docs/` styled. There is no second artifact to skew.

### Recommended Project Structure

```
jarvis-index/
├── astro.config.mjs               # site + base + integrations [starlight] + redirects map
├── package.json                   # engines: node >=22; scripts dev/build/preview/checks
├── design/
│   └── tokens.css                 # THE identity layer: CSS custom properties, light+dark
├── src/
│   ├── content.config.ts          # docs collection via starlight docsLoader()
│   ├── content/docs/
│   │   └── docs/                  # ← nested once: file paths = /docs/** URLs
│   │       ├── index.md           # docs home (today's docs/index.md)
│   │       ├── quickstart.md …    # 25 public pages carried over URL-identical (Phase 1)
│   │       └── …
│   ├── pages/
│   │   └── index.astro            # landing (today's site/index.html, tokenized) 
│   ├── styles/                    # landing-specific CSS consuming tokens (optional)
│   └── components/                # landing partials (optional)
├── docs/                          # maintainer docs STAY here (excluded by location, not srcExclude)
│   ├── brand-spec.md, code-standards.md, deployment-guide.md, …
├── scripts/
│   ├── check-manifests.mjs        # SITE-07: version agreement + mcp.json diff + JSON parse
│   └── verify-build.mjs           # URL-contract + asset + font-origin assertions on dist/
├── site/assets/                   # existing brand marks (jarvis-mark.svg, avatars) → moved/served via Astro public/ or kept + referenced
├── .github/workflows/
│   ├── deploy-pages.yml           # build step + path filter + node 22 + artifact path: dist + smoke probe
│   └── checks.yml                 # NEW: manifest checks on push/PR (incl. manifest-only PRs)
└── plugin/, .codex-plugin/, …     # untouched this phase
```

Key point vs. today: the 8 maintainer docs (`srcExclude` list in `docs/.vitepress/config.ts:17-26`) stay in `docs/` **outside** `src/content/docs/` — exclusion becomes structural (location) instead of a hand-maintained deny-list. That kills PITFALLS #8's drift class for the new site.

### Pattern 1: One origin constant for every path (the base-path bug family)

**What:** All URL-deriving config comes from `site: 'https://jarvis-intelligence.github.io'` + `base: '/jarvis-index'` in `astro.config.mjs`. Nothing else in the repo hardcodes the prefix.

**When to use:** Always — the live 404 and the live broken sitemap are the same disease (prefix derived twice, differently).

**Verified mechanics (both bugs):**
1. Asset 404: VitePress `base: '/docs/'` → built HTML emits `/docs/assets/style.*.css` (absolute from domain root). Pages serves the project site under `/jarvis-index/` → probe: domain-root `/docs/assets/style.CF4wHae3.css` = **404**, `/jarvis-index/docs/assets/style.CF4wHae3.css` = **200**. Fix today (plan 01-01): `base: '/jarvis-index/docs/'`.
2. Sitemap rot: VitePress 1.6.4 sitemap items are base-less (`cli/forget`); the bundled `sitemap` lib does `new URL(item, hostname)`. With `hostname: '…/jarvis-index/docs'` (no trailing slash), `docs` is a replaceable segment → live `<loc>` = `…/jarvis-index/cli/forget` = **404** (verified). With trailing slash `…/jarvis-index/docs/` → correct URLs. Fix today (plan 01-01, second line): add the trailing slash.
3. Astro equivalent (verified): `@astrojs/sitemap` composes `site + base + path` — `base` is prepended once, correctly; no trailing-slash trap.

### Pattern 2: Starlight at `/docs/` inside one project (code-verified)

**What:** Nest docs content one directory deeper than Starlight's fixed root: `src/content/docs/docs/**` → URLs `/docs/**`. Landing lives at `src/pages/index.astro`.

**Verified mechanics:**
- Starlight injects `pattern: '[...slug]'` (catch-all) + `pattern: '404'` routes (`index.ts` of 0.36.0 and 0.41.7 both read).
- Content folder is fixed: `docsLoader()` globs `src/content/docs/**` and entry IDs are the file path (`loaders.ts`); `utils/collection.ts` states the location is "fixed for now". No `routePrefix` exists anywhere (grepped 0.36.0 and 0.41.7).
- Astro route precedence: static `src/pages/index.astro` beats the `[...slug]` catch-all for `/` (MEDIUM-HIGH — standard Astro routing rank, consistent with Starlight's "add to existing project" story; verify in the plan's first build).
- Sidebar/breadcrumb links are written against entry IDs, so they carry the `docs/` prefix automatically.

**Consequence:** every existing public URL maps 1:1 by mirroring today's tree under the nested folder (`docs/tools/go-to-definition.md` → `src/content/docs/docs/tools/go-to-definition.md` → `/docs/tools/go-to-definition/`).

**URL-shape nuance (decide in plan):** today VitePress `cleanUrls` serves extensionless `.html` (live probe: `/docs/cli/forget` → 200, so Pages serves `forget.html` at the extensionless path — verified). Astro `build.format: 'file'` reproduces this exactly. `build.format: 'directory'` (Astro default) emits `forget/index.html`; Pages then serves `/docs/cli/forget/` and (MEDIUM, unverified) 301s the slashless form. Safest for the URL contract: `format: 'file'`.

### Pattern 3: Token sheet → Starlight `--sl-*` remap + landing import

**What:** `design/tokens.css` defines `--jv-*` custom properties + `[data-theme='dark']` overrides; Starlight consumes it via `customCss` with a second file that remaps onto Starlight's `--sl-*` variables; landing imports the same file directly.

**Example:**
```ts
// astro.config.mjs
starlight({
  title: 'jarvis',
  // content lives at src/content/docs/docs/** → /docs/**
  customCss: [
    '../design/tokens.css',
    './src/styles/starlight-tokens.css',   // --sl-* remap + font-family wiring
  ],
})
```
```css
/* src/styles/starlight-tokens.css — remap, never redefine colors here */
:root {
  --sl-color-accent: var(--jv-accent);
  --sl-color-bg: var(--jv-bg);
  --sl-font: var(--jv-sans);
  --sl-font-mono: var(--jv-mono);
}
```
`customCss` accepts package imports too (schema docstring shows `'@fontsource/roboto'`) — fonts can be imported there or in the tokens file.

### Pattern 4: Dark mode = Starlight built-in + landing key unification

**Verified:** Starlight ships a dark/light/auto toggle persisting to `localStorage['starlight-theme']`, an inline anti-FOUC script setting `document.documentElement.dataset.theme`, and `prefers-color-scheme` fallback (`components/ThemeProvider.astro`, `ThemeSelect.astro` read in 0.41.7). The current landing has its own toggle using `localStorage['jarvis-theme']` + the same `data-theme` attribute (`site/index.html:949-962`).

**Decision for the plan:** standardize on ONE key (`starlight-theme`) and ONE attribute (`data-theme`) across both surfaces; the landing's inline script copies Starlight's semantics. If the landing must diverge visually, override the `ThemeProvider`/`ThemeSelect` components rather than forking storage keys. FOUC avoidance requires the theme script to be inline in `<head>` (is:inline, as Starlight does).

### Pattern 5: Post-deploy smoke probe (the "silence becomes failure" step)

**What:** A step after `deploy-pages@v4` curls the live URL and fails the workflow loudly.

**Example:**
```yaml
- name: Smoke probe
  run: |
    set -e
    BASE="https://jarvis-intelligence.github.io/jarvis-index"
    for path in "/" "/docs/"; do
      code=$(curl -s -o /tmp/page.html -w "%{http_code}" "$BASE$path")
      grep -q "jarvis" /tmp/page.html   # marker: stable string present on both surfaces
      test "$code" = "200"
    done
    # the exact failure mode observed 2026-08-21: extract one hashed asset and fetch it
    asset=$(grep -o 'href="[^"]*_astro/[^"]*\.css"' /tmp/page.html | head -1 | cut -d'"' -f2)
    test -n "$asset"
    case "$asset" in /*) url="$BASE$asset";; *) url="$BASE/docs/$asset";; esac
    test "$(curl -s -o /dev/null -w "%{http_code}" "$url")" = "200"
```
(`deploy-pages@v4` exposes `steps.deployment.outputs.page_url` — use it instead of the literal if preferred. Probe must run AFTER the deploy action in the same job, or as a `workflow_run` follow-up.)

### Pattern 6: The three CI checks as a separate path-triggered workflow

**What:** `.github/workflows/checks.yml` runs `scripts/check-manifests.mjs` on push/PR to `main` when `plugin/**`, `.codex-plugin/**`, `.claude-plugin/**`, `.cursor-plugin/**`, or the script/workflow itself changes — plus on any PR touching manifests.

**Why separate from deploy-pages.yml:** the deploy workflow is push-to-main + path-filtered on site sources; a PR that edits only `plugin/.claude-plugin/plugin.json` (the exact mistake these checks guard) triggers nothing there. Checks need PR-time signaling. (Placement is a planner decision; this is the recommendation.)

**Assertions (exact):**
```js
// scripts/check-manifests.mjs — node, zero deps
const manifests = ['plugin/.claude-plugin/plugin.json', 'plugin/.cursor-plugin/plugin.json', '.codex-plugin/plugin.json'];
// 1. all parse as JSON (fail with file + parse error)
// 2. all three .version values identical (fail listing each file's value)
// 3. readFileSync('plugin/.mcp.json') === readFileSync('plugin/mcp.json') byte-for-byte
```
Baseline verified today: all three manifests at **0.7.2**, and `plugin/.mcp.json` ≡ `plugin/mcp.json` byte-identical — the checks start green.

### Pattern 7: URL contract as a data file + build-time assertion

**What:** The enumerated current URL set (verified from the live sitemap + docs tree, 32 docs URLs + `/`) is committed as the contract (e.g. `design/url-contract.json` or a section in the redirects map source). `scripts/verify-build.mjs` diffs the built `dist/` page set against it, so a URL can't silently vanish. New URLs may be added (Phase 2) by editing the contract file in the same commit that adds the page; retires require a redirect-map entry (PITFALLS #1 discipline, mechanized).

**Verified enumeration source of truth** (live sitemap, 2026-08-21 — after the sitemap fix these will be *correct* URLs; today the deployed file lists them missing `/docs`):
- `/docs` (home), `/docs/quickstart`, `/docs/guide/install`
- `/docs/tools/` + 9 tools: `blast-radius`, `call-hierarchy`, `document-symbols`, `find-references`, `get-index-status`, `go-to-definition`, `search-code`, `semantic-search`, `type-hierarchy`
- `/docs/cli/` + 6 commands: `index-cmd`, `list`, `status`, `reindex`, `forget`, `watch`
- `/docs/concepts/`: `architecture`, `blast-radius`, `scip`, `semantic-search`, `zoekt`
- `/docs/integrations/` + 3: `claude-code`, `codex-cli`, `cursor`
- `/docs/troubleshooting/` + 2: `common-failures`, `upstream-issues`
- Landing `/` (not in the docs sitemap; assert separately)

### Anti-Patterns to Avoid

- **Two sources for the origin prefix** (the current bug): any file other than `astro.config.mjs` hardcoding `/jarvis-index` — grep for it in `verify-build.mjs`.
- **Custom 404 via hand-written HTML at artifact root**: Starlight already injects a `404` route (verified) → `dist/404.html`; customize via component override or custom layout, don't hand-place a file that fights the build.
- **Carrying `srcExclude` thinking into Astro**: exclusion is structural now — anything under `src/content/docs/` is PUBLIC. Maintainer docs stay in `docs/` at repo root.
- **Editing fonts in place / keeping any Google Fonts link**: SITE-04 is zero third-party font requests; the verify script greps built HTML for `fonts.googleapis|fonts.gstatic`.
- **Lockfile drift**: `npm ci` in CI + a lockfile regenerated with a different npm major = the classic silent break (PITFALLS #5c). Regenerate once, on Node 22, with the stack commit.
- **Landing theme toggle with a second storage key**: two keys = the toggle appears to "forget" between `/` and `/docs/`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Docs search | Client-side filter / minisearch wiring | Starlight's bundled Pagefind (default-on) | Post-build static index, zero runtime service, already matches local-first positioning; verified default |
| Dark-mode toggle + persistence + FOUC guard | Custom script | Starlight `ThemeProvider`/`ThemeSelect` (override only for copy/icons) | Inline-script ordering, system-preference fallback, persistence — all solved in-package (verified source) |
| Redirect stubs | Hand-authored meta-refresh HTML per old URL | Astro `redirects` config (static → meta-refresh emission verified) | One data structure; stubs generated consistently with canonical-link support |
| 404 page | Hand-placed `404.html` | Starlight's injected 404 route + overrides | Build-owned, theme-consistent |
| Sitemap | Custom generator | `@astrojs/sitemap` (auto-added by Starlight; composes site+base correctly) | The hand-rolled-ish VitePress hostname approach is what broke live |
| Manifest checks | Shell one-liners scattered in YAML | One `scripts/check-manifests.mjs` called by CI | Same assertions run locally (`npm run check:manifests`) and in CI; testable (break a copy, see it fail) |
| Font subsetting/serving | Manual woff2 copies | Fontsource packages | Deterministic npm-pinned assets, hashed same-origin URLs, no CDN |

**Key insight:** every risky mechanism this phase touches already exists, tested, inside Astro/Starlight. The phase's real work is *configuration archaeology* (paths, triggers, artifact shape) and *identity wiring* — not new code.

---

## Common Pitfalls

### Pitfall 1: Building the new stack while the deploy workflow still describes the old one
**What goes wrong:** Path filter (`site/**`, `docs/**`, `package*.json`) doesn't include `src/**`, `astro.config.*`, `design/**` → pushes to the new tree deploy nothing (silent staleness). Assembly still `cp -r site/*` + `docs/.vitepress/dist/*` → artifact empty or half-old.
**Why it happens:** Local build works; the 59-line workflow is invisible plumbing (PITFALLS #5 verified in repo).
**How to avoid:** SITE-05's rule is the mechanism: stack change + workflow diff + `engines` in ONE commit, proven by a real deploy (workflow_dispatch exists) + the smoke probe.
**Warning signs:** green local build + no Actions run; PR titled "switch to Astro" with no `.github/` diff.

### Pitfall 2: The sitemap/base fix shipped as config-only, unprobed
**What goes wrong:** The two-line hotfix (plan 01-01) is "obviously right", merges, and a typo'd hostname or a CDN-cache window leaves the live site broken for another cycle.
**Why it happens:** No feedback loop between merge and live state.
**How to avoid:** The smoke probe lands WITH the hotfix (it's plan 01-01's second half), and asserts 200 + marker + one hashed asset on both `/` and `/docs/` — the exact observed failure class.
**Warning signs:** a hotfix PR whose description says "fixes 404s" with no CI evidence.

### Pitfall 3: "Astro 5" pin collides with npm reality
**What goes wrong:** `npm install astro` (unpinned) resolves 7.2.4 while Starlight resolves 0.37.x → peer-dependency conflict at install time in CI, or worse, a mixed resolution that builds locally (different lockfile) and fails in `npm ci`.
**Why it happens:** The requirement names a major that is two majors old (verified: latest 7.2.4; 5.18.2 last of 5.x).
**How to avoid:** Pin deliberately per the verified matrix: {5.18.2 + 0.37.7} or {7.2.4 + 0.41.7}; regenerate the lockfile once on Node 22; CI's `npm ci` is then deterministic. If 7.x is chosen, amend SITE-02 wording + engines `>=22.12`.
**Warning signs:** `package.json` with `astro: "^5"` *and* no starlight pin; engines `<22.12` with astro 7.

### Pitfall 4: URL set silently changes during the migration
**What goes wrong:** Moving `docs/**/*.md` into `src/content/docs/docs/**` changes trailing-slash/extension semantics or drops a page; `quickstart.md` becomes `/docs/quickstart/` vs today's `/docs/quickstart` — usually fine, sometimes a 404 class change (e.g. section index pages).
**Why it happens:** Two SSGs have different URL-shape defaults; nobody asserts the built set.
**How to avoid:** `build.format: 'file'` for exact cleanUrls equivalence (verified Pages serves extensionless `.html`); `scripts/verify-build.mjs` diffs dist page set against the committed URL contract (Pattern 7) in CI.
**Warning signs:** build output count ≠ contract count; a plan step that renames files "for tidiness" mid-migration.

### Pitfall 5: Maintainer docs leak via the new content tree
**What goes wrong:** The 8 `srcExclude`d files (brand-spec, code-standards, deployment-guide, PDR, roadmap, system-architecture, codebase-summary, superpowers/**) get swept into `src/content/docs/` during the migration "to keep docs together" → published.
**Why it happens:** `srcExclude` muscle memory; in Astro, inclusion is the default with no deny-list.
**How to avoid:** Structural exclusion — they never move out of `docs/` (repo root); verify-build asserts the built page set EQUALS the contract (no extras), which catches any leak mechanically.
**Warning signs:** any plan step doing `git mv docs/*.md src/content/docs/`.

### Pitfall 6: Identity scope creep — redesigning the landing in Phase 1
**What goes wrong:** Phase 1 turns into a full landing redesign (Phase 3's job), stalling the infrastructure every later phase needs.
**Why it happens:** tokens.css + fonts touch the landing, and it's tempting to "fix" content too.
**How to avoid:** Phase 1's landing deliverable is *mechanical*: same sections, re-tokened, fonts self-hosted, one storage key. Palette values may be provisional. Claims/copy/tiers are Phase 3 (PITFALLS #2 lives there).
**Warning signs:** Phase 1 plan tasks editing landing copy, version strings, or tool lists.

### Pitfall 7: Old specs contradict the new identity
**What goes wrong:** `docs/brand-spec.md` (opengsd-derived, verified: `--accent #29527d`, Geist/Rajdhani), `plans/0807-*`, `docs/superpowers/specs/2026-08-07-*` remain "current" and a later phase implements from them, regressing the new tokens (PITFALLS #7).
**How to avoid:** When `design/tokens.css` lands, add superseded-by headers to the three stale artifacts pointing at the token sheet; verify-build can optionally grep that they still carry the header.
**Warning signs:** tokens.css values not traceable to a decision; brand-spec.md edited to "match" rather than marked historical.

---

## Code Examples

### Unified `astro.config.mjs` (the whole phase in one file)
```js
// Source: assembled from verified behaviors of astro@5.18.2 + @astrojs/starlight@0.37.7
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://jarvis-intelligence.github.io',   // ONE origin constant
  base: '/jarvis-index',                            // project-pages prefix, derived once
  build: { format: 'file' },                        // cleanUrls-equivalent (Pages serves .html extensionless — verified live)
  integrations: [
    starlight({
      title: 'jarvis',
      description: 'Local-first code intelligence for coding agents',
      customCss: ['../design/tokens.css', './src/styles/starlight-tokens.css'],
      sidebar: [ /* mirrored from docs/.vitepress/config.ts:42-116 with docs/ prefixes */ ],
      // pagefind: true (default) — SITE-08 search half done
    }),
  ],
  redirects: {
    // SITE-06 mechanism; entries arrive with Phase 2's restructure.
    // Static output emits <meta http-equiv="refresh"> stubs (verified in astro dist).
  },
});
```

### Content collection (required by Starlight on Astro 5)
```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';

const docs = defineCollection({ loader: docsLoader() });
export const collections = { docs };
```

### Deploy workflow delta (same commit as the stack change — SITE-05)
```yaml
# .github/workflows/deploy-pages.yml — changed lines only
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'design/**'
      - 'docs/**'            # maintainer docs still live here; keep or drop per plan decision
      - 'astro.config.*'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/deploy-pages.yml'
# ...
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'          # SITE-05
          cache: 'npm'

      - name: Build site
        run: npm run build            # → dist/ (landing + docs, one tree)

      # Assemble step DELETED — dist/ IS the artifact
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      # + Smoke probe step (Pattern 5) after deploy-pages@v4
```

### The VitePress hotfix (plan 01-01 — verified minimal)
```ts
// docs/.vitepress/config.ts — two lines
base: '/jarvis-index/docs/',                                            // was '/docs/'
sitemap: { hostname: 'https://jarvis-intelligence.github.io/jarvis-index/docs/' },  // trailing slash was missing
```

---

## State of the Art (2024–2026)

| Old Approach (repo today) | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| VitePress 1.6.4 + hand-rolled landing, two artifacts merged in CI | Astro + Starlight single project | (This phase — mandate) | One build, one artifact, one token consumer; kills the assembly class of bug |
| Node 20 (EOL 2026-04-30) | Node 22 LTS (+ engines) | SITE-05 | Security fixes; astro 5.18.2 needs ≥22; astro 7.2.4 needs ≥22.12 |
| Google Fonts CDN `<link>`s | Fontsource variable woff2, same-origin | SITE-04 | Zero third-party requests; deterministic builds |
| VitePress `srcExclude` deny-list | Structural exclusion (content lives outside the collection) | This phase | Leak class eliminated |
| minisearch local provider (VitePress) | Pagefind (Starlight default) | This phase | Static index at build; no config needed |
| `ignoreDeadLinks: true` | (Nothing — carried risk noted) | Phase 2 | Strict link checking deferred to docs phase per STACK.md |

**New tools/patterns to consider:** Astro `redirects` map as the redirect-layer source of truth (data file → generated stubs); `verify-build.mjs` dist-vs-contract assertion (novel here, boring tech).

**Deprecated/outdated:** VitePress 2 pre-release channel (never); Starlight 0.38–0.40 / Astro 6 line (transitional; 0.40.0 has a broken peer dep — verified); Tailwind site-wide (fights Starlight styles).

---

## Open Questions

1. **Astro 5 vs Astro 7 (user-facing decision, one line)**
   - What we know: mandate says "Astro 5"; npm reality is 7.2.4 current / 5.18.2 last-of-5; Starlight pairs are 0.37.7 / 0.41.7 respectively; both work on Node 22 (7 needs ≥22.12).
   - What's unclear: whether the user prefers mandate-verbatim (5.x, older major) or amending to current (7.x).
   - Recommendation: default to the mandated {5.18.2 + 0.37.7}; surface the 7.x option in the plan's context header for a cheap yes/no. Everything in this research is version-agnostic across the two pairs.

2. **Custom domain (STATE.md blocker)**
   - What we know: undecided; affects `site`/`base`, sitemap, docs→landing absolute URLs.
   - What's unclear: user intent.
   - Recommendation: decide "no custom domain for v1" (keep `/jarvis-index` prefix, single constant makes later migration one-line). The plan records it as a decision with the one-line migration path documented.

3. **Landing scope in Phase 1 — how much re-tokening?**
   - What we know: SITE-03/04 require both surfaces consuming tokens.css + self-hosted fonts; PITFALLS #6 warns against Phase-1 landing redesign.
   - What's unclear: whether "re-tokened" means a mechanical variable-swap in the existing markup or a light re-skin.
   - Recommendation: mechanical swap (same sections/structure, tokens + fonts + one theme key); visual identity refinement is Phase 3. tokens.css ships with provisional values clearly marked as infrastructure.

4. **`build.format` / trailing slash**
   - What we know: `file` reproduces today's cleanUrls exactly (extensionless 200 verified live); `directory` is Astro's default and changes URL shape to trailing-slash (Pages redirect behavior MEDIUM, unverified).
   - Recommendation: `format: 'file'`; verify-build asserts both forms resolve for 3 sample pages post-deploy.

5. **Where the old `docs/` markdown lives after migration**
   - What we know: public pages must move under `src/content/docs/docs/**`; maintainer docs must NOT.
   - What's unclear: whether to `git mv` (history-preserving, large diff) or copy+delete.
   - Recommendation: `git mv` in plan 01-02 so Phase 2's classification (DOCS-09) keeps blame; verify-build catches any URL drift.

6. **Smoke probe placement (same job vs `workflow_run`)**
   - What we know: deploy-pages@v4 completes before the probe can run in-job (it's the last step) — probe runs after it in the same job (steps after the deploy action do execute) or as a follow-up workflow.
   - What's unclear: none technically; preference only.
   - Recommendation: same job, after the deploy step; simplest, sees the just-deployed artifact.

---

## Validation Architecture

**Validation dimensions for this phase and how each is sampled:**

| # | Dimension | Automated? | Instrument | Feedback latency |
|---|-----------|-----------|------------|------------------|
| V1 | Build integrity: `npm ci` + `npm run build` green on Node 22 | ✅ | CI build job | ~1–2 min |
| V2 | URL contract: built page set ≡ committed enumeration (32 docs URLs + `/`), no extras (leak guard) | ✅ | `scripts/verify-build.mjs` (dist tree walk + diff vs `url-contract` data) | seconds, local + CI |
| V3 | Asset integrity: every `href`/`src` in built `/docs/` + `/` HTML resolves to a file in `dist/` (kills the base-path bug class pre-deploy) | ✅ | verify-build (parse dist HTML, map to dist files) | seconds |
| V4 | Font origin: zero `fonts.googleapis`/`fonts.gstatic` (or any third-party host) references in built HTML; woff2 present under own origin | ✅ | verify-build grep | seconds |
| V5 | Search: `pagefind.{js,json}` present under `dist/docs/`; search UI markup present in docs HTML | ✅ (presence) / manual (UX) | verify-build + one manual search interaction | seconds / 1 min |
| V6 | Dark mode: theme persists across reload and across `/` ↔ `/docs/` navigation (one storage key, `data-theme` flips) | ❌ manual | Browser: toggle on `/`, navigate `/docs/`, reload both — state held | 2 min |
| V7 | Manifest checks: 3-manifest version equality, `.mcp.json` ≡ `mcp.json`, all JSON parses — and the checks FAIL when broken (test-the-test) | ✅ | `scripts/check-manifests.mjs` locally + `checks.yml` in CI; validate by running it against a deliberately-broken scratch copy once | seconds |
| V8 | Live deploy: `/` and `/docs/` → 200 + marker; one hashed asset → 200 (the exact 2026-08-21 failure mode) | ✅ | Post-deploy smoke step in deploy-pages.yml | per deploy (~3 min) |
| V9 | Sitemap correctness: sitemap `<loc>` URLs all resolve 200 (regression guard for the trailing-slash bug) | ✅ | verify-build (parse dist sitemap, assert each URL maps to a dist file) + spot-curl in smoke probe | seconds |

**Validation strategy for the phase (Nyquist gate):**
- **Quick command (after every task commit):** `npm ci --silent && npm run build && node scripts/verify-build.mjs && node scripts/check-manifests.mjs` — V1–V4, V7, V9 locally in ~60–90s. For plan 01-01 (pre-Astro), the quick command is the smoke probe script against the live URL after dispatch (`curl` loop, seconds).
- **Full command (per plan wave / before verify-work):** quick + `npm run preview` (serves `dist/` at the right base) + curl probes of `/`, `/docs/`, and 3 sample deep URLs through the preview server (V3/V8 rehearsed pre-deploy), + the deliberate-break test of check-manifests (V7). CI runs the same on push; every deploy runs the smoke probe (V8).
- **Manual-only:** V6 (theme persistence across surfaces — a browser interaction; instructions above, 2 min) and V5's interactive half (type a query, see hits across pages). Both are one-session checks recorded in the plan's verification notes.
- **Sampling rule:** no task completes without its dimension's instrument green; infra tasks (01-01, 01-02, 01-05) map to V8/V1–V3/V2+V7 respectively; identity tasks (01-03, 01-04) map to V4/V6+V5. Every plan's final wave runs the full set.
- **No test framework is installed in this repo; none is needed** — the instruments are build output assertions and HTTP probes (deterministic, zero-dependency Node scripts). "Existing infrastructure covers phase requirements" for CI via GitHub Actions.

---

## Sources

### Primary (HIGH confidence — verified today, 2026-08-21)
- Live site probes (curl): `/docs/` page 200 with `/docs/assets/*` hrefs; asset at domain root **404** vs under `/jarvis-index/docs/assets/` **200**; sitemap `<loc>` URLs missing `/docs` segment; sitemap-listed URL `…/jarvis-index/cli/forget` **404** vs real `…/jarvis-index/docs/cli/forget` **200**; landing `/` 200; full live sitemap enumeration (32 URLs).
- npm registry (`npm view`, 2026-08-21): astro 7.2.4 (latest; engines node ≥22.12) / 5.18.2 (last 5.x; engines `18.20.8 || ^20.3.0 || >=22.0`); @astrojs/starlight 0.41.7 (peers astro ^7.0.2), 0.40.0 (astro ^6.4.5, typo'd peer), 0.38.0 (astro ^6), 0.37.7 & 0.36.0 (astro ^5.5.0); @astrojs/mdx 4.3.14 (astro ^5) / 7.0.7; @fontsource-variable/geist 5.3.0, geist-mono 5.3.0, @fontsource/rajdhani 5.3.0 (no variable Rajdhani); pagefind 1.5.2; astro@6 last 6.4.8.
- Installed package source (throwaway `/tmp` installs): Starlight `index.ts` (injectRoute `[...slug]` + `404`; auto-adds expressive-code, @astrojs/sitemap, @astrojs/mdx), `loaders.ts` + `utils/collection.ts` (content dir fixed at `src/content/docs/`; no `routePrefix` in 0.36.0 or 0.41.7 — grepped), `utils/user-config.ts` (`customCss` incl. package imports; `pagefind` default-on schema), `components/ThemeProvider.astro`/`ThemeSelect.astro` (`localStorage['starlight-theme']`, `data-theme`, anti-FOUC inline), `schemas/components.ts` (override names), `integrations/sitemap.ts` (forwards Astro site/base); astro 5.18.2 dist types + `core/routing/3xx.js` (static `redirects` → `<meta http-equiv="refresh">`).
- VitePress 1.6.4 tarball (npm pack, `/tmp`): sitemap generation (base-less item URLs → `SitemapStream(siteConfig.sitemap)`) and the bundled `sitemap` lib's `normalizeURL` → `new URL(item, hostname)` — the verified trailing-slash mechanism behind the broken live `<loc>` URLs.
- Repo: `.github/workflows/deploy-pages.yml` (all 59 lines), `docs/.vitepress/config.ts` (base, cleanUrls, ignoreDeadLinks, sitemap hostname, srcExclude×8, nav/sidebar), `package.json` (vitepress only, no engines), `site/index.html` (989 lines; Google Fonts links :9–11; `jarvis-theme` toggle :949–962), `docs/brand-spec.md` (opengsd tokens), manifest probes (3× `version: 0.7.2`; `plugin/.mcp.json` ≡ `plugin/mcp.json` identical).
- `.planning/`: REQUIREMENTS.md, ROADMAP.md, STATE.md, PROJECT.md, research/{STACK,ARCHITECTURE,PITFALLS,SUMMARY}.md, codebase/{STACK,ARCHITECTURE}.md, codebase/CONCERNS.md (CI-check fix approaches).

### Secondary (MEDIUM confidence — training knowledge, flagged inline)
- Astro route precedence (static beats `[...slug]` catch-all) — standard Astro routing semantics, consistent with Starlight's add-to-existing-project support; confirm on first build.
- Pages trailing-slash 301 behavior for `directory` format builds — unverified; avoided by recommending `format: 'file'`.
- Astro major-version support-window policy (relevant to the 5-vs-7 choice).
- Starlight docs recipes' exact URL for the nested-content pattern (mechanism code-verified; doc-page existence unconfirmed).

---

## Metadata

**Research scope:**
- Core technology: Astro 5/7 + Starlight version matrix and mount mechanics; GitHub Pages project-site path semantics; Pagefind; Fontsource; VitePress 1.6.4 failure forensics
- Ecosystem: npm registry state for every pin (verified 2026-08-21)
- Patterns: origin-constant derivation, nested-content subpath mount, token remap, smoke probe, CI checks, URL contract as data
- Pitfalls: deploy-workflow coupling, sitemap URL composition, content-migration leaks, identity scope creep, stale specs

**Confidence breakdown:**
- Standard stack: HIGH — every version + peer range read from npm today; both candidate pairs install-tested in /tmp
- Architecture: HIGH — mount mechanics, redirects emission, theme persistence, pagefind default all read from installed package source
- Pitfalls: HIGH — two of them verified live today (asset 404, sitemap rot); others grounded in repo research
- Code examples: MEDIUM-HIGH — assembled from verified behaviors; exact sidebar remap values need the plan's build to confirm

**Research date:** 2026-08-21
**Valid until:** 2026-09-21 (stable tech — static-site tooling; re-check npm versions if planning slips past then; Astro majors move fast)

---

*Phase: 01-site-foundation-identity*
*Research completed: 2026-08-21*
*Ready for planning: yes*
