# Phase 1: Site Foundation & Identity - Pattern Map

**Mapped:** 2026-08-21
**Files analyzed:** 17 (new + modified)
**Analogs found:** 14 / 17 (7 exact, 6 role-match, 1 partial, 3 no in-repo analog)

> **Nature of this phase:** it *replaces* the current stack (VitePress + hand-rolled `site/index.html` + two-artifact CI assembly) with a NEW Astro + Starlight project. Most Astro-specific files have **no in-repo analog by definition** — for those, this map anchors to (a) the closest existing pattern (VitePress config/theme CSS, workflow YAML, JSON manifests) for *shape and conventions*, and (b) the verified code examples already assembled in `01-RESEARCH.md` § Code Examples for *exact syntax*. Executors should copy RESEARCH examples verbatim where given; excerpts below are the in-repo ground truth they replace or transform.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `docs/.vitepress/config.ts` (M — plan 01-01 hotfix, 2 lines) | config | transform (build-time) | itself | exact |
| `astro.config.mjs` (N) | config | transform (build-time) | `docs/.vitepress/config.ts` | role-match |
| `package.json` (M) | config | — | itself | exact |
| `package-lock.json` (M — regenerated once) | config | — | itself | exact |
| `src/content.config.ts` (N) | config | file-I/O (content collection) | none — use RESEARCH example | none |
| `src/content/docs/docs/**.md` (N — ~25 pages `git mv`'d from `docs/`) | content / migration | file-I/O | `docs/**/*.md` (the same files) | exact |
| `src/pages/index.astro` (N) | component (page) | request-response (static emit) | `site/index.html` | role-match |
| `public/` brand assets (N — moved from `site/assets/`) | static asset | file-I/O | `site/assets/*` | exact (moved) |
| `design/tokens.css` (N) | config (design tokens) | transform | `site/index.html` `:root` block (lines 13–52) + `docs/.vitepress/theme/style.css` | role-match |
| `src/styles/starlight-tokens.css` (N) | style / utility | transform | `docs/.vitepress/theme/style.css` | role-match |
| `src/styles/` landing CSS + `src/components/` partials (N, optional) | style / component | request-response | `site/index.html` inline `<style>` (lines 12–566) | role-match |
| `design/url-contract.json` (N) | model (data file) | file-I/O | `plugin/.claude-plugin/plugin.json` (JSON shape) + live sitemap enumeration in RESEARCH Pattern 7 | partial |
| `scripts/check-manifests.mjs` (N) | utility (assertion) | file-I/O (read + assert) | none — nearest anchor: the manifest files themselves + RESEARCH Pattern 6 | none |
| `scripts/verify-build.mjs` (N) | utility (assertion) | file-I/O + transform | none — nearest anchor: RESEARCH Patterns 5/7 (smoke probe logic) | none |
| `.github/workflows/deploy-pages.yml` (M) | config (CI) | event-driven + batch | itself | exact |
| `.github/workflows/checks.yml` (N) | config (CI) | event-driven (push/PR) | `.github/workflows/deploy-pages.yml` | role-match |
| `docs/brand-spec.md`, `plans/0807-*`, `docs/superpowers/specs/2026-08-07-*` (M — superseded-by headers) | docs | — | itself | exact |

(M = modified, N = new)

## Pattern Assignments

### `docs/.vitepress/config.ts` (config, build-time — plan 01-01 two-line hotfix)

**Analog:** itself. The hotfix changes exactly two lines; RESEARCH § Code Examples gives the verified values.

**Current lines to change** (`docs/.vitepress/config.ts:8-15`):
```ts
  base: '/docs/',                                          // → '/jarvis-index/docs/'
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: true,

  sitemap: {
    hostname: 'https://jarvis-intelligence.github.io/jarvis-index/docs'   // → add trailing slash '/docs/'
  },
```

---

### `astro.config.mjs` (config, build-time)

**Analog:** `docs/.vitepress/config.ts` — same role (single site-config file: identity strings, base path, sitemap origin, nav/sidebar structure, search). Field-by-field translation table:

| VitePress (`docs/.vitepress/config.ts`) | Astro/Starlight (`astro.config.mjs`) |
|---|---|
| `title`, `description` (:5-6) | `starlight({ title, description })` |
| `base: '/docs/'` (:8) | `site: 'https://jarvis-intelligence.github.io'` + `base: '/jarvis-index'` — **one origin constant, derived once** (RESEARCH Pattern 1; the live 404 bug is this field done wrong) |
| `cleanUrls: true` (:9) | `build: { format: 'file' }` (verified equivalent — Pages serves `.html` extensionless) |
| `sitemap.hostname` (:13-15) | nothing — Starlight auto-adds `@astrojs/sitemap`, composes `site + base` correctly |
| `srcExclude` ×8 (:17-26) | **delete the concept** — structural exclusion: only files under `src/content/docs/` are public; maintainer docs stay in root `docs/` |
| `themeConfig.nav` (:33-40) | Starlight `sidebar` / header components |
| `themeConfig.sidebar` (:42-116) | `starlight({ sidebar: [...] })` — mirror groups, add `docs/` prefix to every slug (entry IDs carry it automatically) |
| `themeConfig.socialLinks` / `editLink` / `outline` (:118-129) | Starlight `socialLinks` / `editLink` / `head` options |
| `search: { provider: 'local' }` (:131-133) | nothing — Pagefind default-on |
| (none) | `redirects: {}` — SITE-06 mechanism; Astro static output emits `<meta http-equiv="refresh">` stubs (verified) |

**Sidebar excerpt to mirror** (`docs/.vitepress/config.ts:64-80`, the tools group — all 6 groups follow this shape):
```ts
      '/tools/': [
        {
          text: 'MCP Tools',
          items: [
            { text: 'Overview', link: '/tools/' },
            { text: 'documentSymbols', link: '/tools/document-symbols' },
            // …8 more tools
          ]
        }
      ],
```

**Full skeleton to copy:** `01-RESEARCH.md` § Code Examples "Unified `astro.config.mjs`" (lines 360–384) — assembled from verified astro@5.18.2 + starlight@0.37.7 behavior; includes `customCss: ['../design/tokens.css', './src/styles/starlight-tokens.css']` wiring.

---

### `package.json` (config — modified)

**Analog:** itself. Current file in full (`package.json:1-14`):
```json
{
  "name": "jarvis-index-docs",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "devDependencies": {
    "vitepress": "^1.6.4"
  }
}
```

**Delta:** scripts become `dev` / `build` / `preview` (Astro) + `check:manifests` / `verify` (`node scripts/*.mjs` — RESEARCH § Validation Architecture quick command); `devDependencies` swaps `vitepress` → pinned `astro@5.18.2` + `@astrojs/starlight@0.37.7` + three Fontsource packages; **ADD `engines: { node: ">=22" }`** (SITE-05 — currently absent; `>=22.12` if the Astro 7 pair is chosen). Keep `"type": "module"` — it is what lets the new `scripts/*.mjs` use ESM imports. Regenerate `package-lock.json` ONCE on Node 22 in the same commit (SITE-05: stack change + workflow diff + engines in ONE commit).

---

### `src/content.config.ts` (config, file-I/O — NEW, no in-repo analog)

**No analog.** Nothing in the repo declares a content collection. Copy verbatim from `01-RESEARCH.md` § Code Examples (lines 386–394):
```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';

const docs = defineCollection({ loader: docsLoader() });
export const collections = { docs };
```

---

### `src/content/docs/docs/**.md` (~25 pages — content migration, file-I/O)

**Analog:** the very files being moved (`git mv docs/<x>.md src/content/docs/docs/<x>.md`). Preserve frontmatter shape verbatim — it already matches what Starlight consumes. Example (`docs/index.md:1-5`):
```markdown
---
description: "jarvis docs — local-first code intelligence for coding agents using Claude Code, Cursor, and Codex CLI."
---

# jarvis docs
```

**Rules carried from the analog:** (1) internal links are root-relative clean URLs (`[Quickstart](/quickstart)`, `[Concepts](/concepts/scip)` — `docs/index.md:13-14`) — they keep working because URL shape is preserved by `build.format: 'file'`; (2) the 8 `srcExclude`d maintainer files (`brand-spec.md`, `code-standards.md`, `codebase-summary.md`, `deployment-guide.md`, `project-overview-pdr.md`, `project-roadmap.md`, `system-architecture.md`, `superpowers/**` — `docs/.vitepress/config.ts:17-26`) **do NOT move** — exclusion is structural now (Pitfall 5: any plan step doing `git mv docs/*.md src/content/docs/` wholesale is wrong).

---

### `src/pages/index.astro` (component/page, static emit)

**Analog:** `site/index.html` (989 lines). Phase 1 is a *mechanical* transplant (Pitfall 6: no redesign). Map:

| Landing source | Destination in `index.astro` |
|---|---|
| `<head>` metas/title/description (:4-7), favicon (`assets/jarvis-mark.svg`, :8) | frontmatter + `<head>`; favicon resolves via `public/` |
| Google Fonts `<link>`s (:9-11) | **DELETED** — SITE-04 zero third-party font requests; replaced by Fontsource imports (tokens layer) |
| Inline `<style>` `:root` + `[data-theme="dark"]` custom props (:12-52) | **DELETED** — values move to `design/tokens.css`; page consumes `var(--jv-*)` |
| Inline layout/section CSS (:54-566) | `src/styles/landing.css` (or scoped `<style>` in the component) consuming tokens |
| Body sections (hero → footer, :567-947) | markup carried over near-verbatim |
| Theme toggle script (:949-963) | re-keyed copy of the same semantics (see Shared Patterns) |

**Token block to extract** (`site/index.html:13-36` — these exact values seed `design/tokens.css`; note the font stacks for Fontsource parity):
```css
:root {
  --bg: #f3f7fa;
  --surface: #e9edf2;
  --fg: #12181d;
  --muted: #58626a;
  --border: #c3cad0;
  --accent: #29527d;
  --accent-strong: #0a3966;
  --accent-soft: #cfe0f3;
  /* …chip/radius/frame/shadow vars :23-33… */
  --sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --logo: "Rajdhani", "Geist", system-ui, sans-serif;
}
```
Dark overrides at `:39-52` (`--bg: #040506; --surface: #0d0f12; --fg: #dee2e5; --muted: #8c9399; --border: #282c30; --accent: #5b86b7; --accent-strong: #7cafe4; --accent-soft: #112031;` …).

---

### `public/` brand assets (static, moved)

**Analog:** `site/assets/` — move verbatim: `jarvis-mark.svg`, `jarvis-avatar.svg`, `jarvis-mark-inverse.svg`, `jarvis-avatar-512.png`, `jarvis-avatar-1024.png`. Referenced today as `assets/jarvis-mark.svg` (`site/index.html:8`) — same relative path works from `public/`.

---

### `design/tokens.css` (config/design tokens, transform)

**Analog 1 (values):** `site/index.html:13-52` (excerpted above) — the live token values; also tabulated with oklch conversions in `docs/brand-spec.md:10-20` (`--accent #29527d`/`#5b86b7`, `--accent-strong #0a3966`/`#7cafe4`, `--accent-soft #cfe0f3`/`#112031`, accent shadow `33, 82, 148`) plus font rules (`docs/brand-spec.md:28-30`).

**Analog 2 (structure):** `docs/.vitepress/theme/style.css` — a two-block light/dark custom-property sheet, header documenting provenance. Copy that shape; rename the prefix `--jv-*`; keep `[data-theme='dark']` as the dark selector (already the convention on BOTH surfaces — VitePress uses `.dark` there, but `data-theme` is the landing + Starlight convention; standardize on `data-theme` per RESEARCH Pattern 4):
```css
/* docs/.vitepress/theme/style.css:1-13 — structural template */
/**
 * Brand token overrides — aligned with the LIVE landing page.
 * Source: https://jarvis-intelligence.github.io/jarvis-index/ :root + [data-theme="dark"]
 */
:root {
  --vp-c-brand-1: #0a3966;        /* accent-strong */
  --vp-c-brand-2: #29527d;        /* accent */
  …
}
```
Fonts enter here (or via Starlight `customCss` package imports): `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/rajdhani` (static weights only — verified no variable Rajdhani exists).

---

### `src/styles/starlight-tokens.css` (style/utility, transform)

**Analog:** `docs/.vitepress/theme/style.css` — exact same role: a *remap layer* that translates brand tokens onto the doc engine's CSS variables, never redefining colors. It remapped `--jv`-ish values onto `--vp-c-*`; the new file remaps onto Starlight's `--sl-*`. Copy verbatim from RESEARCH Pattern 3 (lines 218–225):
```css
/* src/styles/starlight-tokens.css — remap, never redefine colors here */
:root {
  --sl-color-accent: var(--jv-accent);
  --sl-color-bg: var(--jv-bg);
  --sl-font: var(--jv-sans);
  --sl-font-mono: var(--jv-mono);
}
```
Wiring analog — `docs/.vitepress/theme/index.ts:1-3` shows the current import chain (`import DefaultTheme from 'vitepress/theme'; import './style.css'`); the Astro equivalent is the `customCss: ['../design/tokens.css', './src/styles/starlight-tokens.css']` array in `astro.config.mjs` (customCss accepts package imports too — Fontsource).

---

### `design/url-contract.json` (model/data file, file-I/O)

**No direct analog** — the repo has no committed URL enumeration. Nearest patterns:
1. **JSON data-file shape:** the plugin manifests — plain, no comments, stable keys (`plugin/.claude-plugin/plugin.json:1-4`):
```json
{
  "name": "jarvis",
  "description": "…",
  "version": "0.7.2",
```
2. **Content source of truth:** the 32-URL enumeration verified from the live sitemap in `01-RESEARCH.md` Pattern 7 (lines 277–284) — transcribe that list verbatim into the contract file.

---

### `scripts/check-manifests.mjs` (utility/assertion, file-I/O — NEW, no in-repo analog)

**No analog:** `**/*.mjs` glob over the repo returns **zero** `.mjs` files, and no test framework is installed (RESEARCH § Validation Architecture: "No test framework is installed in this repo; none is needed"). Conventions to follow: plain ESM Node (repo is `"type": "module"`), zero dependencies, `node:fs` reads, `console.error` + `process.exit(1)` on failure.

**The three assertions + their subject files** (from RESEARCH Pattern 6, lines 264–271):
```js
const manifests = ['plugin/.claude-plugin/plugin.json', 'plugin/.cursor-plugin/plugin.json', '.codex-plugin/plugin.json'];
// 1. all parse as JSON (fail with file + parse error)
// 2. all three .version values identical (fail listing each file's value)
// 3. readFileSync('plugin/.mcp.json') === readFileSync('plugin/mcp.json') byte-for-byte
```
Baseline verified 2026-08-21: all three manifests at `0.7.2` (`plugin/.claude-plugin/plugin.json:4`, `.codex-plugin/plugin.json:3`, same in `.cursor-plugin`); `plugin/.mcp.json` ≡ `plugin/mcp.json` (both 135 B; content shape `{"mcpServers":{"jarvis":{"command":"uvx","args":["--from","jarvis-mcp>=0.6.0","jarvis-server"]}}}`) — checks start green.

---

### `scripts/verify-build.mjs` (utility/assertion, file-I/O + transform — NEW, no in-repo analog)

**No analog.** Same script conventions as above. Logic anchors:
- URL-set diff: walk `dist/` HTML set, compare against `design/url-contract.json` (V2), equality not superset — extras fail too (leak guard, Pitfall 5).
- Asset-resolution: parse built `/` + `/docs/` HTML, map every `href`/`src` to a `dist/` file (V3) — the pre-deploy twin of the live failure.
- Font-origin: grep built HTML for `fonts.googleapis|fonts.gstatic` → must be absent (V4).
- Sitemap: parse `dist/sitemap*.xml`, assert each `<loc>` maps to a dist file (V9).
- The HTTP-probe half of the same assertions lives in the workflow smoke step (below), not here — this script only inspects `dist/`.

---

### `.github/workflows/deploy-pages.yml` (config/CI — modified)

**Analog:** itself, in full (59 lines). Everything outside the delta stays verbatim — trigger block shape (`:5-14`), permissions (`:16-19`), concurrency (`:21-23`), job skeleton (`:25-33`).

**Keep-verbatim block** (`.github/workflows/deploy-pages.yml:16-23`):
```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false
```

**Lines to change** (RESEARCH § Code Examples "Deploy workflow delta", lines 396–426):
- `paths:` (:8-13) — add `src/**`, `design/**`, `astro.config.*`; keep `package*.json` + self-reference
- `node-version: '20'` (:38) → `'22'`
- `npx vitepress build docs` (:44-45) → `npm run build` (→ `dist/`)
- **Delete** the Assemble step (:47-51) — `dist/` IS the artifact; `upload-pages-artifact` path `_artifact` → `dist` (:53-55)
- **Add** smoke-probe step after `deploy-pages@v4` (:57-59) — copy RESEARCH Pattern 5 (lines 239–254): curl `/` + `/docs/` expecting 200 + `jarvis` marker, extract one hashed `_astro/*.css` href and fetch it (the exact 2026-08-21 observed failure mode).

---

### `.github/workflows/checks.yml` (config/CI — NEW)

**Analog:** `.github/workflows/deploy-pages.yml` — copy its `on:`/`permissions`/job structure, then specialize:
- trigger: push + `pull_request` to `main`, paths `plugin/**`, `.codex-plugin/**`, `.claude-plugin/**`, `.cursor-plugin/**`, `scripts/check-manifests.mjs`, `.github/workflows/checks.yml` (RESEARCH Pattern 6: PR-time signaling the push-only deploy workflow cannot give)
- permissions: `contents: read` only (no `pages:`/`id-token:` — this workflow never deploys)
- steps: checkout → setup-node 22 (npm cache) → `node scripts/check-manifests.mjs` (no `npm ci` needed — zero-dep script)

---

### `docs/brand-spec.md` + `plans/0807-*` + `docs/superpowers/specs/2026-08-07-*` (docs — modified, superseded-by headers)

**Analog:** itself. Change is a header pointing at `design/tokens.css` (Pitfall 7: stale opengsd-derived specs must not read as current). `docs/brand-spec.md:11-20` documents the OLD token names/values that the new sheet supersedes.

---

## Shared Patterns

### One origin constant (base-path bug family)
**Source:** the bug itself — `docs/.vitepress/config.ts:8` (`base: '/docs/'`) + `:14` (hostname missing trailing slash) produced the live asset-404 and sitemap rot (RESEARCH Pattern 1, verified by curl).
**Apply to:** `astro.config.mjs` (sole owner of `site` + `base`), smoke probe (derive from `steps.deployment.outputs.page_url` or one literal), `verify-build.mjs` (assert no other file hardcodes `/jarvis-index` — anti-pattern grep).

### Theme persistence — ONE storage key, ONE attribute
**Source:** `site/index.html:949-963`:
```js
  var root = document.documentElement;
  var STORAGE_KEY = "jarvis-theme";                    // → becomes "starlight-theme" (RESEARCH Pattern 4)
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));
```
**Apply to:** `src/pages/index.astro` inline `<head>` script (`is:inline`, Starlight semantics, key `starlight-theme`, attribute `data-theme` — matches Starlight's ThemeProvider exactly). The landing keeps `:root`/`[data-theme="dark"]` selector convention; tokens.css must use `data-theme`, not VitePress's `.dark`.

### Token layering (values → tokens → engine remap)
**Source:** `docs/.vitepress/theme/style.css` (remap layer over engine vars) + `site/index.html:13-52` (value source) + `docs/.vitepress/theme/index.ts` (import wiring).
**Apply to:** `design/tokens.css` (values, `--jv-*`) → `src/styles/starlight-tokens.css` (`--sl-*` remap) → landing CSS (direct `var(--jv-*)`). Never define colors in two places.

### Zero-dependency Node assertion scripts
**Source:** absence — no `.mjs` in repo, no test framework (RESEARCH: instruments are build-output assertions, deterministic, zero-dependency).
**Apply to:** `scripts/check-manifests.mjs`, `scripts/verify-build.mjs`: ESM (`"type": "module"` already in `package.json:5`), `node:fs`/`node:path` only, `console.error(file + reason)` + `process.exit(1)`, wire as `npm run` scripts so local and CI run identical commands.

### CI workflow skeleton
**Source:** `.github/workflows/deploy-pages.yml:16-33` (permissions/concurrency/environment/checkout/configure-pages block).
**Apply to:** `.github/workflows/checks.yml` (trimmed permissions) and the modified deploy workflow (unchanged blocks stay byte-identical).

### SITE-05 atomicity
**Source:** requirement, enforced by deploy workflow coupling (Pitfall 1).
**Apply to:** one commit carries `package.json` deps + `engines` + lockfile + `deploy-pages.yml` diff; proven by a real `workflow_dispatch` run + smoke probe.

## No Analog Found

| File | Role | Data Flow | Reason / Fallback |
|------|------|-----------|-------------------|
| `src/content.config.ts` | config | file-I/O | Astro content-collection declaration — nothing comparable exists; copy RESEARCH example verbatim |
| `scripts/check-manifests.mjs` | utility | file-I/O | first `.mjs` in repo; anchor to manifest JSON shapes + RESEARCH Pattern 6 assertions |
| `scripts/verify-build.mjs` | utility | file-I/O + transform | no build-assertion precedent; anchor to RESEARCH Patterns 5/7 + Validation V2–V5/V9 |

## Metadata

**Analog search scope:** repo root, `docs/` (incl. `.vitepress/`), `site/`, `.github/workflows/`, `plugin/` + `.*-plugin/` manifests, `plans/`, `.planning/research/`; `**/*.mjs` glob (0 hits)
**Files scanned:** 12 analog files read (config.ts, theme/style.css, theme/index.ts, site/index.html targeted ranges, deploy-pages.yml, package.json, 3 plugin manifests, mcp.json pair, brand-spec.md, docs/index.md)
**Pattern extraction date:** 2026-08-21

---

*Phase: 01-site-foundation-identity*
*Pattern mapping complete — planner can reference analog patterns in PLAN.md files*
