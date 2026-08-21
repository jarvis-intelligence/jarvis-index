# Architecture Research

**Domain:** Developer-tool landing + docs publishing surface (static GitHub Pages; VitePress docs + landing site + agent-delivered skills)
**Researched:** 2026-08-21
**Confidence:** MEDIUM-HIGH — repo facts verified today against `.planning/codebase/ARCHITECTURE.md`, `docs/.vitepress/config.ts`, `.github/workflows/deploy-pages.yml`, `site/`, `plugin/skills/`, `../jarvis/docs/assets/`. Domain best practices (Diátaxis, VitePress/Pages behavior) come from training knowledge only — no web search available in this environment. Per-area confidence is marked inline.

## Standard Architecture

### System Overview

Best-practice dev-tool surfaces (Stripe, Turso, Neon, Bun, Cloudflare docs families) share one shape: **one design token source, two render surfaces (landing + docs), one content model (tutorial-first, reference secondary), one atomic deploy artifact**. Mapped to this repo:

```
PRIVATE ../jarvis/ (content truth)                    jarvis-index/ (public surface)

README.md / PDR / CHANGELOG ── manual adaptation ──►  ┌─ design/  tokens.css + fonts ──┐
docs/assets/ (canonical DOT/SVG/PNG) ── copy-on-rebuild ─► docs/public/diagrams/       │
                                                      │   (single copy per origin)      │
                                                      ├────────────────────────────────┤
                                                      │  CONTENT LAYER                  │
                                                      │  site/   landing copy  (/)       │
                                                      │  docs/   tutorial-first (/docs)  │─── plugin/ skills
                                                      │          (tutorials ▸ concepts ▸ │    (agent voice,
                                                      │           how-to ▸ reference ▸   │     version-gated
                                                      │           troubleshooting)       │     delivery)
                                                      ├────────────────────────────────┤
                                                      │  ASSEMBLY LAYER (CI)             │
                                                      │  deploy-pages.yml:               │
                                                      │  npm ci → build landing →         │
                                                      │  vitepress build docs →           │
                                                      │  merge → _artifact (atomic)       │
                                                      ├────────────────────────────────┤
                                                      │  DELIVERY LAYER                  │
                                                      │  GitHub Pages (static origin)     │
                                                      │  PyPI · 3 client marketplaces     │
                                                      │  MCP Registry                     │
                                                      └────────────────────────────────┘
```

**Confidence:** HIGH for the current-repo side (verified); MEDIUM for the industry-shape claim (training knowledge).

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Token sheet | Single source of visual truth shared by landing + docs (color/space/type/radius, light+dark) | One `tokens.css` of CSS custom properties imported by both builds; self-hosted fonts |
| Landing site | Conversion: what jarvis is, cold-install CTA, proof (pipeline diagram, tool list), in ≤1 scroll-priority page | Small static build (Astro/vanilla + tiny bundler) or VitePress custom home; hero carries copyable install command |
| Docs site | Onboarding + depth: tutorial path guarantees "first successful tool call"; reference secondary | VitePress with Diátaxis-mapped sidebar per path prefix; local search; cleanUrls |
| Shared asset store | One canonical copy of diagrams/images on the Pages origin | `docs/public/diagrams/` (VitePress serves `public/*` verbatim); SVG in pages, PNG for social cards |
| Plugin skills | Agent-consumable behavior (setup steering, tool usage, issue filing) — the "third surface" shipped into clients | `plugin/skills/*/SKILL.md` + on-demand `references/*.md`; delivered only via 3-manifest version bump |
| Redirect layer | Keeps old URLs alive after IA restructure | Tiny meta-refresh HTML stubs at legacy paths (GitHub Pages has no server redirects) |
| CI assembler | Build both surfaces, merge into ONE artifact, deploy atomically | Existing `deploy-pages.yml` extended: + landing build step, + token path in trigger filter, + link check |
| Upstream truths | Product facts jarvis 0.6.2 (README, PDR, system-architecture, CHANGELOG) | Read-only inputs; adapted by hand at rebuild time (one-time rebuild decision — no auto-sync) |

## Recommended Project Structure

Target tree (changes marked; everything else keeps its current location):

```
jarvis-index/
├── design/                        # NEW — shared visual truth
│   ├── tokens.css                 #   CSS custom properties, light+dark
│   └── fonts/                     #   self-hosted woff2 (replaces Google Fonts CDN)
├── site/                          # landing at /  (gains optional build step)
│   ├── src/                       #   NEW — source pages if built; else keep index.html
│   └── assets/                    #   brand marks (existing SVG/PNG stay)
├── docs/                          # docs at /docs/ (VitePress stays; IA rewritten)
│   ├── .vitepress/
│   │   ├── config.ts              #   nav/sidebar rewritten tutorial-first; srcExclude keeps maintainer docs out
│   │   └── theme/style.css        #   @imports '../../design/tokens.css' (drift-proof link)
│   ├── public/
│   │   └── diagrams/              # NEW — canonical SVG/PNG copied from ../jarvis/docs/assets/
│   ├── index.md                   # docs home = tutorial entry, not reference index
│   ├── tutorials/                 # NEW — why → install → first query → per-client setup
│   ├── concepts/                  # exists — SCIP, Zoekt, semantic, blast radius, architecture (explanation)
│   ├── how-to/                    # NEW — task recipes (e.g. "register jarvis-semantic")
│   ├── reference/
│   │   ├── tools/                 # moved from tools/ — 9 tool pages, deepened from roster
│   │   └── cli/                   # moved from cli/ — 7 commands
│   ├── integrations/              # exists — per-client pages mirror skill voice
│   ├── troubleshooting/           # exists
│   └── quickstart.md → tutorials/ # becomes redirect stub
├── plugin/                        # unchanged shape; skills realigned (version bump = release)
├── .github/workflows/deploy-pages.yml   # + landing build, + design/ trigger path, + link check
└── package.json                   # + landing build script if landing gains a build
```

### Structure Rationale

- **design/ at repo root (not inside docs/):** tokens must be *sibling-neutral* — importing from `docs/.vitepress/theme/` into a landing build (or vice versa) creates an owner; a root-level sheet makes both builds equal consumers. VitePress theme CSS `@import`s it; landing build (or a 10-line inline step) consumes the same file.
- **tutorials/ + how-to/ + concepts/ + reference/ split (Diátaxis):** the four content modes have different authoring rules (learning-oriented vs task-oriented vs information vs understanding); separating them is what keeps "tutorial-first, reference secondary" enforceable instead of aspirational. Reference stays secondary by *position* (nav order: Get Started ▸ Concepts ▸ How-to ▸ Reference ▸ Troubleshooting), never by deletion.
- **diagrams/ under docs/public/ as the single asset location:** both surfaces deploy to the same Pages origin, so landing can reference `/docs/diagrams/*.svg` — one copy, no per-surface duplication. `docs/public/*` is served verbatim by VitePress at the site root under base — zero config.
- **reference/tools/ + reference/cli/ grouped:** tools and CLI are both mechanical reference; grouping them under one nav section lets the tutorial path link into `reference/` without competing with it.

### Build Order (dependency-sequenced — feeds roadmap phasing)

1. **design/tokens.css + fonts** — everything downstream consumes it; nothing blocks it. (Landing identity work starts here.)
2. **Asset import** — copy canonical diagrams from `../jarvis/docs/assets/` into `docs/public/diagrams/`; needed by both landing "how it works" section and docs concepts pages.
3. **Docs IA restructure** (tutorials/how-to/reference skeleton + rewrite) — needs tokens (2) for theme, assets (3) for pages, and content truths from `../jarvis/`; largest phase.
4. **Reference deepening** (tools from `tool-roster.md` + README; CLI from README) — parallelizable with 4 in content terms, but ships after tutorial path exists so links resolve.
5. **Landing rebuild** — needs tokens, diagrams, and the *final* tool/feature claims from 4–5; single visual cutover.
6. **Skills realignment + version bump** — needs settled positioning vocabulary from 4–5 so skill `description` triggers match docs voice; ships via 3-manifest bump (0.7.2 → 0.7.3).
7. **Redirect stubs + maintainer docs + cold-install verification** — last; verification walks the finished path.

**Confidence:** HIGH on internal dependencies (they follow from the tree); MEDIUM on ordering 4-vs-5 concurrency.

## Architectural Patterns

### Pattern 1: Diátaxis content model (tutorial-first IA)

**What:** Split docs into four quadrants — tutorials (learning: guaranteed path to first success), how-to guides (specific tasks), reference (exhaustive, no prose), explanation (concepts/why) — and order the nav by the *user journey*, with reference as a destination, not an entrance.
**When to use:** Any tool whose success metric is "a stranger completes the cold-install path" (exactly this milestone's core value). This is the dominant pattern (Django, Cloudflare, Gatsby, Tailwind docs).
**Trade-offs:** Four directories need authorial discipline (a page must know which quadrant it's in); thin tool stubs become *reference* pages that are allowed to be mechanical — the thinness problem today is really a *misfiling* problem (they're masquerading as the whole docs). Slightly more files than a flat structure.

**Example:** `docs/.vitepress/config.ts` sidebar skeleton:
```ts
sidebar: {
  '/tutorials/': [{ text: 'Get Started', items: [
    { text: 'Why jarvis', link: '/tutorials/why-jarvis' },
    { text: 'Install', link: '/tutorials/install' },
    { text: 'First query', link: '/tutorials/first-query' },
    { text: 'Claude Code', link: '/tutorials/claude-code' },
    { text: 'Cursor', link: '/tutorials/cursor' },
    { text: 'Codex CLI', link: '/tutorials/codex-cli' } ]}],
  '/concepts/': [/* explanation: scip, zoekt, semantic, blast-radius, architecture */],
  '/how-to/':   [/* task recipes */],
  '/reference/':[{ text: 'MCP Tools', items: [/* 9 tools */] },
                 { text: 'CLI', items: [/* 7 commands */] }],
  '/troubleshooting/': [/* existing */],
}
```

### Pattern 2: Shared token sheet across two builds

**What:** One `design/tokens.css` of CSS custom properties (`--jv-bg`, `--jv-accent`, `--jv-mono`, spacing/radius scales, `[data-theme=dark]` overrides) imported by the docs theme *and* the landing build, so the surfaces cannot drift.
**When to use:** Always when landing and docs are separate builds on one origin — which this repo keeps (VitePress is docs-shaped; forcing marketing pages into it fights the theme, so two builds + shared tokens beats one engine).
**Trade-offs:** Landing's current single-file inline-CSS approach cannot import — it must either accept a tiny build step (recommended: a 5-line esbuild/inline script, still emitting one self-contained file) or duplicate tokens (drift; reject). Self-hosting fonts replaces the Google CDN dependency (privacy + offline + one source of font truth) at the cost of ~100–300KB committed woff2.

**Example:**
```css
/* design/tokens.css — the only file allowed to define colors/scale */
:root {
  --jv-bg: #0b0e14;  --jv-fg: #e6e9f0;  --jv-accent: #5eead4;
  --jv-mono: 'Geist Mono', ui-monospace, monospace;
  --jv-space-1: 4px; --jv-radius: 12px;
}
:root[data-theme='light'] { --jv-bg: #fafbfc; --jv-fg: #16181d; }
```
```css
/* docs/.vitepress/theme/style.css */
@import '../../design/tokens.css';   /* relative link survives VitePress build */
```

### Pattern 3: Single-artifact atomic assembly (extend existing CI)

**What:** Keep the current pattern — one workflow builds docs and landing, merges both into ONE Pages artifact, deploys once. Extend with: a landing build step, `design/**` added to the `paths:` trigger (a token change must redeploy *both* surfaces — today the filter only covers `site/**`, `docs/**`, `package*.json`), and a link check before deploy.
**When to use:** Always here — atomic artifacts mean landing and docs can never be version-skewed mid-announcement, and Pages swaps artifacts with zero downtime by construction.
**Trade-offs:** Any single build failure blocks both surfaces (acceptable — they're one product voice); `ignoreDeadLinks: true` currently masks link rot — scope it to allowed patterns (e.g. localhost, MCP registry) or remove it so the build fails on rot instead of shipping it.

**Example:**
```yaml
paths: [site/**, docs/**, design/**, package.json, package-lock.json, .github/workflows/deploy-pages.yml]
# ...
- run: npm run build:site          # landing → site-dist/ (no-op wrapper if landing stays hand-written)
- run: npx vitepress build docs
- run: cp -r site-dist/* _artifact/ && cp -r docs/.vitepress/dist/* _artifact/docs/
```

### Pattern 4: Copy-on-release asset sync (private → public diagrams)

**What:** Canonical diagrams (jarvis-layers, jarvis-index-pipeline, jarvis-semantic-fusion; SVG+PNG+DOT) live in `../jarvis/docs/assets/`. Public surface copies the **SVG** (pages) and **PNG** (og/social cards) into `docs/public/diagrams/` at rebuild time and commits them; DOT sources stay only in the private repo as authoring truth. GitHub Actions cannot see the sibling private repo, so this is a documented manual step — consistent with the milestone's "one-time rebuild, no sync mechanism" decision.
**When to use:** Private-truth → public-display whenever assets must be publicly reachable (hot-linking private raw URLs 404s for unauthenticated visitors).
**Trade-offs:** Diagrams can go stale between rebuilds (accepted; `docs/` pages should caption diagrams with the jarvis version they reflect). Hardcoded-fill SVGs look wrong in dark mode — pick one: re-export with `currentColor`, ship light/dark variants, or pin diagram containers to a fixed light background.

**Example:** the sync command becomes one documented line:
```sh
cp ../jarvis/docs/assets/*.svg ../jarvis/docs/assets/*.png docs/public/diagrams/
git add docs/public/diagrams && git commit -m "diagrams: sync from jarvis@0.6.2"
```

### Pattern 5: Truth-per-audience for skill↔docs content

**What:** Accept that `plugin/skills/jarvis-use/references/tool-roster.md` (44 dense lines, all 9 tools, agent-optimized) and `docs/reference/tools/*.md` (human pages, currently 0.6–1.6KB stubs) are *different renderings of one truth for different audiences* — not duplication to eliminate. Rules: skill references stay verbatim-complete (agents read them offline, from the installed plugin); docs pages get the human-depth version adapted from the same sources; both link to each other; docs must never quote skill text by memory — link to the repo **at a tag**, because skill edits reach installed users only on a 3-manifest version bump.
**When to use:** Whenever one product fact ships through multiple channels with different delivery cadences (here: Pages deploys instantly, plugin content deploys on version bump).
**Trade-offs:** A change to tool behavior still needs two edits (roster + docs page) — a generator could dedupe this, but PROJECT.md has explicitly descoped sync tooling, so the mitigation is a phase checklist line ("if a tool signature changed, edit roster AND reference page"), not machinery.

**Example:** docs tool page footer pattern:
```markdown
Agent usage: [tool-roster.md @ v0.7.2](https://github.com/jarvis-intelligence/jarvis-index/tree/v0.7.2/plugin/skills/jarvis-use/references/tool-roster.md)
```

**Confidence:** Patterns 1–2 MEDIUM (industry practice from training); 3 HIGH (extends verified workflow); 4–5 HIGH (directly grounded in repo constraints).

## Data Flow

### Request Flow

Content publishing flow (the "request" this architecture serves):

```
../jarvis truths (README · PDR · CHANGELOG · diagrams)
    ↓  manual adaptation (rebuild-time, human)
landing copy · docs pages · skill text          ── one-voice vocabulary
    ↓  git push (main)
deploy-pages.yml: npm ci → build landing → vitepress build docs
    ↓  merge into _artifact/ (landing at / · docs at /docs/)
GitHub Pages (atomic swap, zero downtime)
    ↓                                    ↓
visitor browser (cold-install path)     coding agent (skills via marketplace+version-bump)
```

User journey flow (what the IA must make true):

```
landing /  ──hero CTA──►  /docs/tutorials/  ──►  install (setup.sh | plugin) ──►  first tool call
                              └─ side exits: reference (when ready), troubleshooting (when stuck)
```

### State Management

No runtime state (static site). The "state" this surface manages is **drift state** — four version-ish facts that can disagree:

```
facts:  plugin manifest version (0.7.2, 3 files) · jarvis-mcp version (0.6.2 floor >=0.6.0)
        · docs claims (rebuild-date) · diagram provenance (jarvis@version caption)
control: version bump = plugin delivery gate · docs/deploy = instant ·
         page captions + changelog page state what version the docs reflect
```

### Key Data Flows

1. **Truth adaptation:** `../jarvis/` docs → human rewrites → landing/docs/skills. Direction: one-way private→public; never reverse. Confidence HIGH.
2. **Asset flow:** `../jarvis/docs/assets/` → `docs/public/diagrams/` (copy-on-rebuild, committed) → referenced by both `/` (as `/docs/diagrams/x.svg`) and `/docs/...` pages. HIGH.
3. **Skill delivery:** `plugin/` edit → synchronized version bump in 3 manifests → client marketplace pickup → installed agents. Pages deploys are NOT gated by this — docs may describe skills ahead of the bump; hence link-at-tag rule. HIGH.
4. **Cross-surface linking:** landing→docs uses absolute `/docs/...` (same origin, trivial). docs→landing needs a **full URL** — VitePress `base: '/docs/'` rewrites root-relative links under `/docs/`, so `{ link: '/' }` cannot reach the landing; use `https://jarvis-intelligence.github.io/jarvis-index/`. HIGH (verified from config).
5. **Feedback flow:** public issues (this repo) + `jarvis-issues` skill upstream → triage → either repo. Docs should route both explicitly. MEDIUM.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| ~25–40 pages (now → post-rebuild) | Current plan as-is; local search, one sidebar per prefix, no versioning. Fine. |
| 40–100 pages | Add sidebar search prominence (VitePress local search handles this fine to several hundred); consider tags/collections for how-to growth; keep reference pages mechanical. |
| Multi-version docs (v0.6 vs v0.7 sites) | Out of scope this milestone; if ever needed, VitePress has no native versioning — it means N builds merged under `/docs/vX/` + redirect of `/docs/`. Defer explicitly. |

### Scaling Priorities

1. **First bottleneck — cross-channel drift, not traffic:** four channels (PyPI readme, landing, docs, skills) can each claim different things; static hosting will never be the constraint. Mitigation is editorial (one-voice vocabulary table in the landing phase), not infra.
2. **Second bottleneck — link rot after restructure:** moving tools/ and cli/ under reference/ plus new tutorials/ invalidates indexed URLs on day one; redirect stubs (below) absorb it; scoped `ignoreDeadLinks` keeps future rot loud.

## Anti-Patterns

### Anti-Pattern 1: Reference-first IA (docs as a tool index)

**What people do:** Ship the tool/CLI reference as the docs homepage and primary nav (this repo's current shape: nav = Quickstart/Tools/CLI/Concepts).
**Why it's wrong:** The cold visitor's job is "reach first successful call", not "browse 9 tools"; a reference wall has no path, and thin reference pages present as an unfinished product.
**Do this instead:** Tutorial path is the entry (`/docs/` home = start of the journey); reference is linked, grouped, and allowed to be mechanical. Nav order: Get Started ▸ Concepts ▸ How-to ▸ Reference ▸ Troubleshooting.

### Anti-Pattern 2: Borrowed or duplicated design tokens

**What people do:** Copy another product's stylesheet wholesale (current landing: opengsd.net-derived tokens per `docs/brand-spec.md`) or maintain the same colors in two places (inline landing CSS + VitePress `style.css`).
**Why it's wrong:** The surface reads as another tool's site, and every visual change becomes a two-file hunt; light/dark and typography drift silently between `/` and `/docs/`.
**Do this instead:** One `design/tokens.css` consumed by both builds (Pattern 2); brand identity lives in exactly one file plus fonts.

### Anti-Pattern 3: Hot-linking private-repo or CDN assets

**What people do:** Reference `raw.githubusercontent.com/<private>/...` or keep Google Fonts CDN links for a self-described local-first product.
**Why it's wrong:** Private raw URLs 404 for every unauthenticated visitor; CDN font links add a third-party dependency and layout-inconsistent fallbacks — ironic for a local-first tool.
**Do this instead:** Copy diagrams into `docs/public/diagrams/` (Pattern 4); self-host woff2 in `design/fonts/`.

### Anti-Pattern 4: Big-bang URL swap without redirects

**What people do:** Restructure docs and deploy, leaving old URLs (indexed, bookmarked, printed in the skill files) to die.
**Why it's wrong:** GitHub Pages is static-only — no `_redirects` file, no server rules — so moved pages hard-404; agents holding old links from skill text break too.
**Do this instead:** Leave 1-file meta-refresh stubs at every retired path during migration:
```html
<!-- docs/quickstart.md → replaced by a tiny page that emits: -->
<meta http-equiv="refresh" content="0; url=/docs/tutorials/install/">
<link rel="canonical" href="/docs/tutorials/install/">
```
(Plus a friendly `404.html` with search + top-5 destinations.)

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub Pages | Single workflow → one artifact → `actions/deploy-pages@v4` | Atomic swap = zero-downtime migration by construction; custom domain later would force revisiting absolute-URL assumptions |
| PyPI (`jarvis-mcp`) | Docs/skills reference `uvx --from jarvis-mcp>=0.6.0`; floor is a hard constraint | Docs must never suggest a floor < 0.6.0 |
| Client marketplaces (Claude Code, Codex, Cursor) | One `plugin/` via 3 manifests; version bump = release | Skill copy changes lag docs deploys by a bump — link docs to tags, not `main` |
| Google Fonts (current) | **Remove** — self-host | Privacy, offline consistency, one fewer render dependency |
| GitHub Releases (setup.sh binaries) | Landing/docs link the `curl | sh` one-liner; `setup.sh` itself never edited here | Ownership hard rule |
| MCP Registry | Entry `io.github.jarvis-intelligence/jarvis`; treat as 4th install channel in docs | Add to `ignoreDeadLinks` allowlist if registry URLs get linked |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| landing ↔ docs | Shared `design/tokens.css`; absolute-path links across same origin | docs→landing needs full URL (base-rewrite gotcha); landing→docs `/docs/...` is safe |
| docs ↔ plugin skills | Truth-per-audience (Pattern 5); cross-links at tags; shared vocabulary | No build-time dependency — delivery cadences differ (instant vs version bump) |
| CI ↔ both builds | Path-filtered triggers MUST include `design/**` | Today's filter would silently skip a token-only change — classic drift bug |
| `docs/public/diagrams/` ↔ both surfaces | One copy, referenced by URL | Landing refers to `/docs/diagrams/...`; never duplicate into `site/assets/` |
| maintainer docs ↔ published docs | `srcExclude` in VitePress config (keep — new pages default to published; maintainer files must be listed) | Publishing is opt-OUT today; restructure must re-verify the exclude list |

## Sources

- **Repo (verified 2026-08-21):** `.planning/codebase/ARCHITECTURE.md` (component map, CI flow, version-bump delivery, dual MCP config); `.planning/PROJECT.md` (constraints, out-of-scope sync, assets note); `docs/.vitepress/config.ts` (nav/sidebar, `base: '/docs/'`, `srcExclude`, `ignoreDeadLinks: true`, local search); `.github/workflows/deploy-pages.yml` (artifact assembly, path filters); `site/` inventory; `plugin/skills/` inventory + `references/tool-roster.md` (44 lines vs docs/tools stubs 0.6–1.6KB, measured); `../jarvis/docs/assets/` (3 diagrams × SVG/PNG/DOT, listed).
- **Domain knowledge (training, unverified online — no web search in env):** Diátaxis framework (Daniele Procida) — tutorials/how-to/reference/explanation quadrant and nav-order practice; VitePress capabilities (per-path sidebars, `public/` passthrough, base-rewrite semantics, srcExclude); GitHub Pages static behavior (no server-side redirects/_redirects; atomic artifact deploys); common dev-tool site shapes (Stripe/Turso/Neon/Bun/Cloudflare docs families); CSS custom properties as cross-build token mechanism.
- **Confidence summary:** repo-grounded claims HIGH; industry best-practice claims MEDIUM (training knowledge, not re-verified against live sources).

---
*Architecture research for: developer-tool landing + docs publishing surface (jarvis public rebuild)*
*Researched: 2026-08-21*
