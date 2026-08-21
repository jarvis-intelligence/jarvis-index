# Project Research Summary

**Project:** jarvis-index — Public Surface Rebuild (landing + docs + plugin skills for jarvis, a local-first code-intelligence MCP server)
**Domain:** Developer-tool public surface — static marketing landing + tutorial-first docs + agent plugin skills, on GitHub Pages
**Researched:** 2026-08-21
**Confidence:** MEDIUM-HIGH — repo facts and one live-site bug are verified directly; external tool versions and landscape claims are model knowledge (researchers had no web search this session) and must be re-verified against npm during phase planning

## Executive Summary

This is a brownfield rebuild of a developer-tool public surface. Best-in-class surfaces of this class (Stripe/Turso/Neon/Bun/Cloudflare families) share one shape: **one design-token source, two render surfaces (landing + docs), one tutorial-first content model with reference secondary, one atomic static deploy**. jarvis-index today violates all four: a single-file landing borrowing opengsd.net's identity wholesale, ~1KB tool-doc stubs in a reference-first IA, and a two-artifact CI assembly — which has already produced a **verified live bug**: docs deploy under `/jarvis-index/docs/` while `config.ts` sets `base: '/docs/'`, so every asset 404s and the deployed docs render unstyled/no-JS *today* (probed 2026-08-21). That bug is stack-independent and becomes the rebuild's first deliverable.

The recommended approach: a shared `tokens.css` + self-hosted fonts as the single visual truth; an **additive** tutorial-first docs restructure (Diátaxis quadrants; existing reference/troubleshooting URLs kept alive via redirect stubs — GitHub Pages cannot 301); a landing with copyable install, tiered 9-tool showcase (honest gating for `semanticSearch`/`typeHierarchy`), and the language-support matrix; skills realigned **last** so one voice lands everywhere. The one unresolved fork is the engine: STACK recommends a unified Astro 5 + Starlight site (best theming surface for a bespoke identity), while ARCHITECTURE's plan-of-record is written for staying on VitePress 1.6.4 (near-zero migration cost, fastest builder). Both converge on everything else; the roadmap must decide in Phase 1 via a spike.

The dominant risks are process-shaped, not technical: (1) the docs restructure breaks every inbound link with `ignoreDeadLinks: true` currently masking the rot — mitigated by a URL contract + redirect map decided *before* content writing, plus a `404.html` and strict link checking during the rebuild; (2) claims drift from shipped artifacts — this repo's recurring failure mode with four live instances (e.g. landing says "v0.7.0", manifests are 0.7.2) — mitigated by caveated copy, no hardcoded versions, and a launch claims audit; (3) a stack migration silently breaking the Pages deploy (path-filtered triggers, hardcoded artifact assembly, EOL Node 20) — mitigated by shipping the workflow diff in the same commit, a real deploy, and a post-deploy smoke probe; (4) the three-manifest plugin delivery trap — mitigated by the all-three-bump protocol and cheap CI checks landed *before* the skills phase.

## Key Findings

### Recommended Stack

STACK.md recommends building landing and docs as **one Astro 5 + Starlight site** (landing at `/`, docs mounted at `/docs/`) sharing a single CSS-custom-property token layer (remapped onto Starlight's `--sl-*` variables), self-hosted fonts via Fontsource, Pagefind local search bundled by Starlight, deployed through the existing Pages actions with a single `dist/` artifact. Runner-up: **stay on VitePress 1.6.4** and hand-build the landing, sharing one `tokens.css` by copy — materially cheaper migration, weaker bespoke-identity story. **Note the tension:** ARCHITECTURE.md's recommended structure and patterns assume VitePress stays ("two builds + shared tokens beats one engine" when the identity is expressible via CSS variables alone); PITFALLS.md (#5) warns any engine swap risks silently breaking the path-filtered deploy. The researchers *agree* on the invariant layer — one token sheet, static artifact, existing deploy chain, self-hosted fonts, the base-path fix, Node 20→22 (EOL 2026-04-30) — and diverge only on the engine. Starlight's documented component overrides favor the bespoke identity PROJECT.md demands; the VitePress path is cheapest and lowest-risk. Decide in Phase 1 with a spike (single-project Starlight mount at `/docs/`; MEDIUM confidence it works cleanly — fallback variant documented in STACK.md).

**Core technologies:**
- Astro ^5 + Starlight (or VitePress 1.6.4 if staying) — static generation for landing + docs; islands/zero-JS default serves CWV for a marketing page; Starlight's overrides are the documented path to a bespoke docs identity
- `design/tokens.css` (plain CSS custom properties) — the ONE design system across both surfaces; no token build chain; the boring, maintainable choice
- Pagefind (via Starlight) or VitePress minisearch — fully local static search; matches local-first positioning, zero runtime service
- Fontsource variable fonts (^5) — self-hosted woff2; removes the only third-party runtime request (privacy, LCP, deterministic builds)
- GitHub Pages actions (unchanged: configure-pages@v5 / upload-pages-artifact@v3 / deploy-pages@v4) — only the build step and artifact path change; Node bumped 20→22 with an `engines` field

### Expected Features

Per FEATURES.md: surface features (not runtime capabilities) that make the core value true — a cold visitor lands, installs, and makes a first successful tool call from public pages alone.

**Must have (table stakes):**
- Hero with one-line value prop + copyable primary install command — the moment of intent; friction here is fatal
- Tutorial-first quickstart (why → install → `jarvis index` → register per client → first tool call **with expected output**) — this *is* the success metric; steps 1–3 client-agnostic, fork only at registration
- Per-client install guides (Claude Code, Cursor, Codex CLI, generic stdio JSON) — the first question every MCP user asks
- Tool reference completed: 9 pages with request→response examples and the `candidates`/`resolvedSymbol`/`{"error": ...}` contracts — replaces ~1KB stubs
- Requirements & limits stated *before* install, led by the language-support matrix (4 nav families / 10 search-only / per-language caveats) — prevents the mis-install bounce
- Troubleshooting decision tree (symptom → diagnosis → fix), led by the uvx cold-start timeout, PATH, scip version-gate — self-rescue is table stakes for a local-first tool
- Changelog page (imported from `../jarvis/CHANGELOG.md`) and CLI reference (7 commands) — momentum signal and mechanical depth
- Copy-to-clipboard, dark mode + toggle, local docs search — SSG built-ins whose absence is noticed
- Skills realignment — drop the broken "See CLAUDE.md" reference (no CLAUDE.md ships in the plugin), match new docs URLs, keep the tool-roster pattern

**Should have (competitive):**
- The 3 plugin skills positioned as a first-class "in-agent docs" layer — almost no MCP server ships skills; the flagship differentiator
- "You'll know it works when…" success/failure shapes inline — makes the first tool call self-verifiable
- Simulated query→result demo panel (real recorded JSON shapes, deliberately not live) — show the payoff before install
- Canonical architecture diagrams reused from `../jarvis/docs/assets/` — engineering credibility at web-typography cost
- Local-first privacy positioning as a section — the wedge vs cloud code intelligence
- Four-channel install matrix (PyPI, Claude plugin, Codex plugin, MCP Registry) — "however you found us, here's your path"
- `llms.txt` / agent-consumable export — ship *after* docs content stabilizes (an index over stubs advertises emptiness)

**Defer (v2+):**
- Tabbed install widget, MCP Registry deep-link table — after per-client pages reveal real visitor paths
- GitHub Discussions, video walkthroughs — until volume demands
- **Never (anti-features):** live/WASM demo (wrong instrument + violates local-first), hosted search/analytics (violates static + privacy positioning), multi-version docs (one supported version; plugin floor `>=0.6.0`), fourth client manifest, docs-stay-current sync automation (all PROJECT.md fences)

### Architecture Approach

Per ARCHITECTURE.md: a four-layer shape — token layer (`design/tokens.css` + fonts at repo root, sibling-neutral so both builds are equal consumers), content layer (landing `/` + tutorial-first docs `/docs/` + plugin skills as the agent-voice third surface), assembly layer (one CI workflow building both surfaces into ONE atomic artifact), delivery layer (GitHub Pages + PyPI + 3 client marketplaces + MCP Registry). Private `../jarvis/` is read-only truth adapted by hand at rebuild time (one-time rebuild decision — no auto-sync).

**Major components:**
1. `design/tokens.css` + self-hosted fonts — single visual truth; build-order root (everything consumes it, nothing blocks it)
2. Docs site, Diátaxis-mapped — tutorials ▸ concepts ▸ how-to ▸ reference ▸ troubleshooting; nav ordered by user journey so reference stays secondary *by position, never by deletion*
3. Landing — ≤1-scroll-priority conversion page; hero carries the copyable install
4. `docs/public/diagrams/` — one canonical copy of the private repo's SVG/PNG on the Pages origin; both surfaces reference it by URL
5. Plugin skills — truth-per-audience: skill references stay verbatim-complete for offline agents; docs link to skill files *at a tag* because plugin content deploys only on a version bump
6. Redirect layer — meta-refresh stubs at every retired URL + a lookup-table `404.html` (Pages has no server redirects)
7. CI assembler — existing workflow extended: `design/**` added to path triggers (a token-only change must redeploy both surfaces), landing build step, link check

### Critical Pitfalls

Top pitfalls from PITFALLS.md (eight identified; these five shape the roadmap most):

1. **Docs restructure breaks every inbound link, silently** — ~27 public URLs exist; Pages is static (no 301s) and `ignoreDeadLinks: true` means the build never fails on rot. Avoid: enumerate the current URL set as a contract, build the old→new redirect map *before* content writing, ship stubs + `404.html`, run strict link checking for the rebuild's duration, re-crawl at launch.
2. **Claims drift from shipped artifacts** — the repo's recurring failure mode, four live instances today (v0.7.0 vs 0.7.2 on the landing; pre-warm claim the synced `setup.sh` doesn't honor; tool-roster contradiction; borrowed "Know, remember, do" tagline). Avoid: claims describe *this repo's* artifacts today; caveat conditional tools at point of claim; never hardcode version strings (or add the CI agreement check); claims audit in the launch phase.
3. **Stack/landing migration silently breaks the Pages deploy** — path-filtered triggers miss new source locations (push succeeds, nothing deploys); hardcoded artifact assembly copies nothing from a new output dir; Node 20 is EOL. Avoid: any stack-change PR carries its `deploy-pages.yml` diff in the same commit, proves a real deploy, and adds a post-deploy smoke curl (`/` and `/docs/` → 200 + marker).
4. **Three-manifest plugin delivery trap** — skill edits reach users only when all three `plugin.json` versions rise together; no CI backstop exists; rollback is forward-only; the dual MCP configs must be edited both-or-neither (and `docs/integrations/cursor.md` documents the wrong filename today). Avoid: content + all-three bumps in one commit; validator + `diff plugin/.mcp.json plugin/mcp.json` as definition of done; land the three cheapest CI checks *before* the skills phase.
5. **Tutorial-first rewrite orphans installed users** — reference/troubleshooting pages are the load-bearing surface for the heaviest repeat users; a diff of deletions/renames is the warning sign. Avoid: additive rebuild — classify every existing page keep / merge-with-redirect / retire; nav reaches every tool/CLI/troubleshooting page in one click.

(Folded into ordering below: scope creep past PROJECT.md fences — #6; rebuilding from stale committed specs (`plans/0807`, `superpowers/specs`) — #7; `srcExclude` maintainer-doc leaks — #8.)

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Deploy stabilization + identity & stack decision
**Rationale:** The verified live base-path 404 must be fixed before anything builds on the docs; tokens are the root of ARCHITECTURE's build order; the engine decision gates all structure; PITFALLS #5/#7 land here by necessity.
**Delivers:** Base-path hotfix (either stack; plus a post-deploy smoke probe), Node 20→22 + `engines` field, `design/tokens.css` + self-hosted fonts behind a new brand spec that supersedes `plans/0807-*` and `superpowers/specs/*`, the Astro-vs-VitePress spike and decision (with its workflow diff if migrating), the docs URL contract + redirect map, and the three cheapest CI checks (manifest version agreement, `.mcp.json`≡`mcp.json`, JSON parse).
**Addresses:** Landing-identity prerequisite (FEATURES dependency: identity decision unblocks hero, matrix, skills voice); legitimacy basics.
**Avoids:** Pitfalls #5 (workflow diff + smoke probe), #7 (supersession headers), front-loads #1 (URL contract) and #4's CI insurance.

### Phase 2: Docs rebuild (tutorial-first, additive)
**Rationale:** Largest phase; the docs content is the cold-install metric's backbone; needs tokens (Phase 1) and blocks the landing's final claims.
**Delivers:** Diátaxis IA (tutorials/how-to/concepts/reference) with every existing page classified keep/merge-with-redirect/retire; 9 tool reference pages with request/response shapes; CLI reference; per-client install pages; troubleshooting decision tree; requirements/limits + language matrix before install; changelog import; diagrams copied to `docs/public/diagrams/`; redirect stubs + `404.html` live; `srcExclude` hygiene (internal glob or per-deploy dist-diff).
**Uses:** Chosen engine + `tokens.css` (Starlight overrides or VitePress theme CSS importing the shared sheet).
**Implements:** Diátaxis content model, single-asset-store, redirect layer, truth-per-audience linking.
**Avoids:** Pitfalls #1 (redirects execute here), #3 (additive classification), #8 (dist-diff).

### Phase 3: Landing rebuild
**Rationale:** Needs the final tool/feature claims from Phase 2; a single visual cutover avoids two identities live at once.
**Delivers:** Hero (one-liner + copyable install), tiered 9-tool showcase with honest `semanticSearch`/`typeHierarchy` gating, compact language matrix, privacy section, badges (GitHub/PyPI/MIT/MCP Registry), mobile responsiveness, simulated demo panel (P2 if timeboxed).
**Uses:** Same `tokens.css`; Fontsource fonts; vanilla scripts/islands only.
**Avoids:** Pitfall #2 (caveated copy, no hardcoded versions, opengsd/`phuongddx` residue grep), zero-request landing as an acceptance criterion.

### Phase 4: Plugin skills realignment + release
**Rationale:** Skills must wait for settled positioning vocabulary (one voice); delivery is a release act (0.7.2 → 0.7.3 triple-manifest bump), best done once.
**Delivers:** Three skills realigned — drop the broken CLAUDE.md reference, match new docs URLs, sync commands with rebuilt pages, preserve trigger-shaped descriptions and constraint sentences; all-three-manifest bump + Cursor validator + dual-config diff as definition of done.
**Avoids:** Pitfall #4 (protocol as definition of done, CI checks already live from Phase 1).

### Phase 5: Launch verification
**Rationale:** The milestone's success criterion (cold-install end-to-end) can only be verified on the finished surface.
**Delivers:** Clean-machine cold-install run using only public pages; claims audit (every factual sentence traced to README/CHANGELOG/synced `setup.sh`); old-URL crawl (all content-or-redirect, sitemap matches shipped pages); maintainer docs updated; "looks done but isn't" checklist executed.
**Avoids:** Pitfalls #1/#2 verification halves; the "while we're at it" trap (#6) by closing with fences intact.

### Phase Ordering Rationale

- Tokens → assets → IA → reference → landing → skills → verification is ARCHITECTURE's dependency-sequenced build order: tokens are consumed by everything and block nothing; landing needs final claims; skills need final voice; verification needs the finished path.
- Each phase lands and deploys independently (PITFALLS #6 fence: never stack two surfaces in one unverified change; no phase title should combine two surfaces).
- The URL contract is *decided* in Phase 1, *executed* in Phase 2, and *verified* in Phase 5 — pitfall #1's prevention/verification split.
- CI checks precede the skills phase so the rebuild's highest-churn period is protected (cheapest insurance available).
- Redirects ship with the restructure, not after — Pages deploys are instant but crawlers and skills hold old links from day one.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Engine spike — Starlight single-project mount at `/docs/` (content-collection `generateId` prefix) is MEDIUM confidence from model knowledge; npm versions (Astro 5 minor, Starlight 0.x pin, Fontsource packages) must be re-verified live — researchers had no web access. Custom-domain decision (affects base/sitemap/absolute URLs) belongs here.
- **Phase 2:** Diagram dark-mode strategy (SVGs likely authored for light backgrounds: `currentColor` re-export vs light/dark variants vs pinned background) — decide when assets are copied.
- **Phase 5:** Clean-machine verification environment (fresh macOS/Linux env that can actually run the ~86MB install and time it honestly).

Phases with standard patterns (skip research-phase):
- **Phase 3:** Static HTML/CSS landing against an existing token sheet — established patterns, no external unknowns.
- **Phase 4:** Delivery protocol is fully repo-documented (CONVENTIONS/ARCHITECTURE); no external research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Repo facts, CI chain, and live base-path bug verified directly (HIGH); external engine versions/capabilities are model knowledge — re-verify on npm before pinning (MEDIUM) |
| Features | MEDIUM | Product facts HIGH (README, PDR, skills read directly); external landscape (uv-style heroes, MCP snippet norms, llms.txt) is consensus pattern knowledge, not measurement |
| Architecture | MEDIUM-HIGH | Repo-grounded structure/flows HIGH; industry-shape claim (Diátaxis, token-sheet pattern) MEDIUM (training knowledge) |
| Pitfalls | HIGH | Repo-specific, grounded in live observed instances (version drift, issue #4, wrong filename); general platform claims (Pages redirect behavior) MEDIUM |

**Overall confidence:** MEDIUM-HIGH — strong on everything inside the repo and on the live site; everything outside it is single-sourced model knowledge pending phase-planning verification.

### Gaps to Address

- **Exact published versions** (Astro 5.x minor, Starlight 0.x, Fontsource, lychee): verify on npm at Phase 1 planning; pin deliberately (Starlight is 0.x — breaking minors possible).
- **Starlight-at-`/docs/` mount behavior:** spike in Phase 1; the two-Astro-builds fallback (STACK variant) preserves URL layout and CI shape if the mount proves brittle.
- **Custom domain:** undecided; base path, sitemap host, and docs→landing absolute URLs all hinge on it — decide in Phase 1, derive base from one constant either way.
- **MCP Registry listing page rendering:** never inspected; the install matrix links to it sight-unseen.
- **Visitor/traffic data:** none exists (no analytics — correctly, per FEATURES anti-features); prioritization rests on convention, so the Phase 5 cold-install run is the only real validation instrument.
- **Diagram dark-mode rendering:** unresolved until assets are copied (Phase 2 flag above).

## Sources

### Primary (HIGH confidence)
- `.planning/codebase/` (ARCHITECTURE, STACK, STRUCTURE, CONVENTIONS, CONCERNS, INTEGRATIONS — refreshed 2026-08-21) — component map, drift instances, delivery protocol, fences
- `../jarvis/` — README (9 tools, requirements/limits, tool details), PDR (positioning, 4 channels), CHANGELOG (0.6.2), `docs/assets/` diagrams
- Read directly: `docs/.vitepress/config.ts`, `.github/workflows/deploy-pages.yml`, `package.json`/`package-lock.json`, `site/`, `plugin/skills/*` + `references/tool-roster.md`
- Live-site probe (curl, 2026-08-21): docs asset 404s under domain root vs 200 under `/jarvis-index/docs/assets/…` — the verified base-path bug

### Secondary (MEDIUM confidence)
- Model knowledge: Astro/Starlight/VitePress/Fumadocs/Docusaurus/Pagefind/Fontsource ecosystems; Diátaxis framework; GitHub Pages static-hosting behavior; dev-tool site conventions (Homebrew/uv heroes, per-client MCP snippets, llms.txt, DocSearch process, Shields.io) — consensus patterns, not measurements

### Tertiary (LOW confidence)
- Latest npm-published versions (fast-moving; re-verify), Starlight subpath-mount specifics, MCP Registry page rendering, competitor surface details (Serena README-driven, Sourcegraph enterprise shape) — single-sourced model knowledge needing validation

---
*Research completed: 2026-08-21*
*Ready for roadmap: yes*
