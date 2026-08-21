# Stack Research

**Domain:** Developer-tool public surface — marketing landing + tutorial-first docs site + agent plugin skills for a local-first code-intelligence MCP server (jarvis), statically hosted on GitHub Pages
**Researched:** 2026-08-21
**Confidence:** MEDIUM-HIGH overall — repo facts and the live-site bug are verified directly; external tool versions are from model knowledge (web verification unavailable this session) and must be re-checked against npm at phase planning.

## Recommended Stack

**Decision summary:** Build landing and docs as **one Astro + Starlight site** sharing a single CSS-custom-property token layer, deploy the single static `dist/` through the existing Pages actions. Runner-up: stay on VitePress 1.6.4 for docs and hand-build the landing, sharing one `tokens.css` by copy — materially cheaper migration, weaker design-system story.

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | ^5 (latest 5.x at phase start) | Static site generator for the unified site (landing + docs) | Islands architecture ships ~zero JS for a marketing page — best-in-class Lighthouse/CWV, which matters because the landing must feel fast to developers; one project means one build, one deploy artifact, one design source. Zero-JS default beats Next.js static export for a content surface with 2–3 interactive elements. Confidence: HIGH on the line, MEDIUM on exact latest minor. |
| Starlight (via `@astrojs/starlight`) | ^0.3x (pin exact minor) | Docs engine mounted under `/docs/` | Purpose-built docs theme with the deepest legal theming surface: documented headless **component overrides** (Header, Footer, Hero, PageTitle, Sidebar…) plus `--sl-*` CSS variables — exactly what a bespoke-identity rebuild needs. Ships with Pagefind search, Expressive Code (Shiki-based code blocks with titles/terminal/line-diff), sitemap, i18n scaffolding, prev/next, sidebar pagination — the tutorial-first IA (why → install → first query → per-client) maps directly onto its navigation primitives. Confidence: MEDIUM (0.x semver; pin and verify latest at phase planning). |
| Pagefind | ^1.x (bundled by Starlight — no direct dependency) | Static local search index | Fully local: indexes the built HTML in CI, zero runtime service, zero cookies. Matches the product's local-first positioning. Starlight enables it out of the box; nothing to wire. Confidence: HIGH that it's the default, MEDIUM on bundled version. |
| CSS custom properties (`src/styles/tokens.css`) | n/a (plain CSS) | The ONE design system across landing and docs | Single source of truth: landing layout imports it directly; Starlight consumes the same file via `customCss`, remapping tokens onto `--sl-*` variables for docs chrome. No design-token build chain (Style Dictionary etc.) — the site is two surfaces in one repo; plain CSS vars are the boring, maintainable choice. Confidence: HIGH. |
| Fontsource (`@fontsource-variable/*`) | ^5 | Self-hosted variable fonts | Replaces today's Google Fonts CDN `<link>`s on the landing. Removes the only third-party runtime request (privacy + GDPR hygiene + faster LCP + deterministic builds). Whatever type the new identity picks, ship it as woff2 from node_modules. Confidence: MEDIUM-HIGH. |
| GitHub Pages actions (unchanged) | `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4` | Deploy | Keep the existing action chain and permissions block verbatim; only the build step and artifact path change. See *Version Compatibility* and the CI note below. Confidence: HIGH (read from `deploy-pages.yml`). |

**GitHub Pages / CI compatibility (explicit).** The constraint is a static artifact — both paths satisfy it:

- **Recommended path:** `deploy-pages.yml` gets *simpler*: replace `npx vitepress build docs` + the `_artifact` copy block with `npm run build` (Astro → `dist/`, landing at `dist/index.html`, docs under `dist/docs/`), then `upload-pages-artifact` with `path: dist`. Path triggers add `src/**` and `astro.config.*`. Actions, permissions, environment, concurrency stay as-is.
- **Runner-up path (stay VitePress):** workflow is untouched except `node-version` (see below); `site/` remains copied to the artifact root.
- **Verified live bug either stack must fix:** docs deploy at `https://jarvis-intelligence.github.io/jarvis-index/docs/` but `docs/.vitepress/config.ts:8` sets `base: '/docs/'`, so built pages reference `/docs/assets/…` — confirmed 404 at domain root while the same files return 200 under `/jarvis-index/docs/assets/…` (probed 2026-08-21). The deployed docs are currently unstyled/no-JS. Correct base is `/jarvis-index/docs/` (or a custom domain, decided in phase planning). Astro equivalent: `site: 'https://jarvis-intelligence.github.io/jarvis-index'`, `base: '/jarvis-index/'`. Derive base from one constant; add a CI smoke probe that curls one built asset URL after deploy.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/mdx` | ^4 | MDX in docs pages | When a tutorial page needs Starlight components (e.g. `<Tabs>` for the Claude Code / Codex / Cursor setup variants). Optional per-page; not required for plain markdown. |
| Tailwind CSS | ^4 (`@tailwindcss/vite`) | Utility styling for the landing only | Only if the landing design wants utilities. **Scope it to landing** — its preflight reset clobbers Starlight's styles. If skipped, plain CSS + tokens is fully sufficient for 2–3 pages; default recommendation is to skip until the design demands it. |
| `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` | ^5 | Self-hosted current type (Geist) | If the new identity keeps Geist; otherwise swap for the chosen family's fontsource package. |
| Astro `redirects` config | built-in | Old URLs → new tutorial URLs | Docs IA is being restructured; static `redirects` emit meta-refresh HTML stubs (Pages cannot do 301s). Also add canonical links. VitePress has no equivalent — stubs would be manual. |
| lychee (or similar link checker) | latest, CI step | Dead-link gate | Replaces the safety that `ignoreDeadLinks: true` currently removes (`docs/.vitepress/config.ts:10`); run against the built site in CI after the IA stabilizes. VitePress path: flip `ignoreDeadLinks` back to strict instead. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node.js 22 LTS in CI | Build runtime | `deploy-pages.yml:38` pins Node 20, which hit end-of-life 2026-04-30. Bump to 22 in the same PR as any stack change. Also add `"engines": { "node": ">=22" }` to `package.json` (currently absent). |
| npm | Package manager | Stay on npm — one package, lockfile v3 already; no payoff to pnpm/bun here. |
| `npm run dev` (Astro dev server) | Local preview of landing + docs with hot reload | Replaces `docs:dev`; one server for both surfaces. |
| GitHub release-tag snapshot builds (future) | Docs versioning if ever needed | See *Stack Patterns by Variant* — do not build now. |

## Installation

```bash
# Recommended — unified Astro + Starlight site
npm create astro@latest . -- --template starlight   # or add manually:
npm install astro @astrojs/starlight
npm install @astrojs/mdx                       # if/when MDX components needed
npm install @fontsource-variable/geist @fontsource-variable/geist-mono
# Optional, landing-only utilities:
npm install -D tailwindcss @tailwindcss/vite

# Runner-up — stay on VitePress (current state, plus fixes)
npm install -D vitepress@^1.6.4                # already present, no change
# fix docs/.vitepress/config.ts: base '/docs/' → '/jarvis-index/docs/'
# add engines field; CI node 20 → 22
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Astro + Starlight unified | **VitePress 1.6.4 (stay)** — runner-up | When the new identity can be expressed purely as CSS-variable overrides of VitePress's default theme and migration cost must stay near zero. VitePress is the fastest builder, pure-markdown authoring, `lastUpdated` built-in (in use today), local minisearch search. But bespoke layout work means fighting/ejecting the default Vue theme — undocumented territory — and the two-artifact assembly that produced the live base-path bug stays. Use if: budget squeezed, design ambition modest. |
| Astro + Starlight | **Fumadocs** (Next.js App Router) | When docs must live inside a larger Next.js product/app with shared React components, or you want its (admittedly gorgeous) default UI. Against it here: pulls in Next.js for a static surface, `output: 'export'` constraints, basePath friction on Pages, heavier CI, and the docs don't need a React runtime. Overkill. |
| Astro + Starlight | **Docusaurus 3.x** | Only when first-class multi-version docs with a version switcher becomes a real requirement — it's Docusaurus' unique built-in. Today jarvis ships one current version (plugin auto-updates; `>=0.6.0` floor), so the machinery is dead weight, and its Infima/Bootstrap-derived theme is the hardest of the four to bend to a bespoke identity. |
| Astro-built landing | **Hand-rolled multi-file static HTML/CSS** (no build) | When the landing stays ≤2 pages and contributors want zero toolchain. A shared `tokens.css` can be copied into both surfaces. Loses: component reuse, partials, build-time link checking, asset hashing — and drifts again. Acceptable fallback, not preferred. |
| Pagefind (via Starlight) | VitePress `local` provider (minisearch) | On the runner-up path — it's already configured, fully local, fine. |
| No analytics initially (option: Cloudflare Web Analytics, free/cookieless) | GA4; self-hosted Plausible/Umami | GA4: privacy bloat + overkill for an adoption-only metric. Self-hosted anything: violates the no-server reality of Pages. GitHub repo traffic insights already give rough adoption signal for free. Decide in phase planning; default is none. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Single-file hand-rolled `site/index.html` pattern (989 lines, inline CSS, borrowed opengsd tokens) | No reuse, no shared tokens with docs, borrowed design reads as another tool's site (PROJECT.md Key Decision) | Astro pages in the same project as docs; tokens from one file |
| Google Fonts CDN `<link>` tags (current landing) | Third-party runtime dependency, slower LCP, privacy, non-deterministic | Fontsource self-hosted woff2 |
| `base: '/docs/'`-style asset paths that don't match the served URL | Verified broken on the live site today (assets 404; pages render unstyled) | Base derived from the final URL (`/jarvis-index/…`) in one place + post-deploy CI asset probe |
| `ignoreDeadLinks: true` as a permanent setting | Masks link rot during exactly the IA churn this rebuild creates | Strict dead-link checking (VitePress default strict / Astro + lychee CI step) once restructure lands |
| React/Next.js for the landing | A static marketing page with copy-buttons and tabs needs no framework runtime; hurts CWV and bundle | Vanilla `<script>` in `.astro` files or tiny islands |
| Tailwind applied site-wide | Preflight reset fights Starlight's stylesheet; two styling systems to reason about | Tokens as plain CSS custom properties; Tailwind scoped to landing only if wanted at all |
| VitePress 2.0 pre-release channel | RC/alpha semver channel for the docs backbone of a rebuild | VitePress 1.6.x stable if staying; Astro 5 stable if moving |
| Multi-version docs machinery (version switcher, `/docs/0.x/` trees) | One current version exists; PROJECT.md scopes this as a one-time rebuild with manual upkeep | A "validated against jarvis-mcp 0.6.2" last-updated note per page; snapshot-by-tag only if ever demanded |
| Node 20 in CI | EOL since 2026-04-30; security fixes stopped | Node 22 LTS + `engines` field |

## Stack Patterns by Variant

**If the new identity extends into docs chrome (custom header/footer/hero on docs too):**
- Unified Astro + Starlight with component overrides + shared `tokens.css` (recommended path)
- Because Starlight's override system is designed for exactly this; VitePress default-theme surgery is undocumented and brittle.

**If the identity is expressible via CSS variables alone (colors/typography/spacing):**
- Stay VitePress 1.6.4; hand-build landing as 2–3 static files importing a shared `tokens.css`; fix `base`, Node, fonts
- Because migration buys little when theming stops at variable overrides; cheapest path to shipped.

**If mounting Starlight at `/docs/` inside one Astro project proves brittle in the phase spike (content-collection `generateId` prefix — verify early):**
- Two Astro builds in one repo (landing project + Starlight docs project) merged in CI exactly like today's `_artifact` pattern, both importing the same `tokens.css`
- Because URL layout and CI shape are preserved; the token source stays single. (Confidence MEDIUM that the single-project mount works cleanly — spike it first.)

**If a custom domain is configured during the rebuild:**
- Drop `/jarvis-index` from base/sitemap; everything else unchanged
- Because base-path is the only place the hosting target leaks into the stack.

**If versioned docs are demanded later:**
- On tags, build a snapshot under `/docs/<version>/` with any of these SSGs; link "latest" prominently
- Because static hosting makes snapshot directories trivial; adopting Docusaurus solely for its version switcher is not worth the theme lock-in.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| astro ^5 | Node ≥18.17.1 (use 22 LTS) | Works with CI's Node 22 bump; supports `output: 'static'` directory format → clean URLs on Pages. |
| @astrojs/starlight ^0.3x | astro 5.x | Peer-pinned; Starlight is 0.x — lock the exact minor, read release notes on bump (breaking minors possible). |
| pagefind ^1.x | Starlight (bundled) | No direct install needed; runs as post-build indexing in CI. |
| vitepress ^1.6.4 (runner-up) | Node ≥18, incl. 22 | Resolved 1.6.4 in `package-lock.json` (verified); lockfile also pins vue 3.5.41, vite 5.4.21, shiki 2.5.0, minisearch 7.2.0. |
| tailwind ^4 (optional) | astro 5 via `@tailwindcss/vite` | Landing-scoped only; never let preflight reach Starlight pages. |
| Astro `redirects` (static) | GitHub Pages | Emit meta-refresh HTML — fine for users/crawlers-with-canonicals, not true 301s; acceptable, document it. |
| Existing Pages actions | unchanged | `configure-pages@v5` / `upload-pages-artifact@v3` / `deploy-pages@v4` consume either artifact shape (`_artifact` or `dist`). |
| Shiki vs Expressive Code | transition period only | VitePress (shiki 2.5.0) and Starlight (Expressive Code over Shiki) style code blocks differently; if both run during migration, unify on the tokens' code-theme colors so blocks don't visibly clash. |

## Sources

- `.planning/codebase/STACK.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/PROJECT.md` — current stack facts, CI pipeline, constraints (HIGH, read 2026-08-21)
- `package.json`, `docs/.vitepress/config.ts`, `.github/workflows/deploy-pages.yml` — exact versions, base path, Node pin, artifact assembly (HIGH, read 2026-08-21)
- Live-site probes: `https://jarvis-intelligence.github.io/jarvis-index/docs/` asset hrefs vs. 404/200 responses — verified base-path bug (HIGH, probed 2026-08-21 via curl)
- Model knowledge of Astro/Starlight, VitePress, Fumadocs, Docusaurus, Pagefind, Fontsource ecosystems — architecture and trade-off claims (MEDIUM; no web search available this session — re-verify latest published versions on npm during phase planning before pinning)

---
*Stack research for: developer-tool public surface (landing + docs + plugin skills) on GitHub Pages*
*Researched: 2026-08-21*
