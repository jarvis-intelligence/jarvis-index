# Feature Research

**Domain:** Public developer-tool surface — landing page + docs site + agent-plugin skills — for jarvis, a local-first code-intelligence MCP server (v0.6.2, 9 MCP tools, 4 distribution channels)
**Researched:** 2026-08-21
**Confidence:** MEDIUM — product facts are HIGH (read from `../jarvis/README.md`, PDR, skills, `docs/` tree); external landscape patterns are from model knowledge of developer-tool site conventions (no live web survey available), rated per-claim below.

## Feature Landscape

Scope note: "features" here are **surface features** — things the public pages and skills do for a visitor — not jarvis runtime capabilities. The runtime (9 tools, watch, CLI) is fixed product truth; this research asks what the surface must expose and how.

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. For this project they map directly onto the Core Value: a cold visitor lands, installs, and makes a first successful tool call using only public pages.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero with one-line value prop + primary install command, copy-to-clipboard button | Every CLI/MCP tool since Homebrew/uv normalizes "one command, one click to copy". A landing without a copyable install is friction at the exact moment of intent | LOW | The one-liner already exists in README: "Local-first code intelligence for coding agents… No server, no auth, no network, nothing leaves your machine." Landing hero should compress this further (positioning decision, not new writing) |
| Copy-to-clipboard on every code block | Users paste commands into a terminal; selecting from a page on a laptop is error-prone and hostile | LOW | VitePress built-in (`{ default: true }` code-block copy). Zero marginal cost if VitePress stays |
| Dark mode (default dark, light toggle) | De-facto convention for developer tools since 2020; absence reads as "template from 2015" | LOW | VitePress built-in. Default dark matches the audience; keep the toggle |
| Docs search (local index) | Docs without search fail the "I just need the flag name" lookup that is the majority of doc traffic | LOW | VitePress `localSearch` (FlexSearch) — static-friendly, no external account, works within GitHub Pages constraints. Algolia DocSearch rejected as a dependency (see anti-features) |
| Per-client install guides (Claude Code, Cursor, Codex CLI, generic stdio MCP client) | Table stakes *specific to MCP servers*: the first question every MCP user asks is "how do I add this to my client". Every MCP server's docs are judged on this | MEDIUM | Content mostly exists (README details-blocks + `docs/integrations/` + jarvis-setup skill step 3); needs promotion from `<details>` collapse to first-class pages with exact commands per client (`claude mcp add`, `codex mcp add`, `~/.cursor/mcp.json` JSON, generic `mcpServers` JSON) |
| Requirements & limits stated *before* install, not buried | jarvis is deliberately narrow (macOS/Linux only; one language per repo; nav in 4 language families; search-only in 10 more; `semanticSearch` needs extra + a *second MCP registration* under the plugin). A user who discovers "Windows unsupported" after running setup.sh bounces harder than one who never came | LOW | README already has "Read this before installing — jarvis is deliberately narrow." Keep that honesty on the landing (compact) and full in docs. Honesty here is cheaper than the issue traffic it prevents |
| Troubleshooting page in decision-tree form (symptom → diagnosis → fix) | Local-first tools fail locally (PATH, cold-start timeouts, version-gated binaries); users self-rescue only if the page anticipates the symptom | MEDIUM | Raw material is excellent: jarvis-setup skill §6 table + `docs/troubleshooting/`. The highest-value entries: the uvx 30s cold-connect timeout (crypto Rust builds), `command not found: jarvis` (tools work, CLI absent), `~/.jarvis/bin` PATH, scip fork version-gate for `typeHierarchy`, Swift `--scheme`, `status: partial/failed` |
| Tool reference: one page per MCP tool with request → response examples | The 9 tools are the product; agents AND humans call them against documented shapes (e.g. `resolvedSymbol`, `candidates` arrays, uniform `{"error": ...}` payloads) | MEDIUM | Current `docs/tools/*.md` are ~1KB stubs (known drift, PROJECT.md). Reference depth is secondary to the tutorial path but must be complete — jarvis-use skill's decision matrix links conceptually to these shapes |
| Changelog / release-notes page | Adopters of a 0.x tool check momentum before investing in indexing their repos; also the honest place to surface the typeHierarchy scip-fork fix story | LOW-MEDIUM | Source: `../jarvis/CHANGELOG.md`. Simplest viable: copy at build time or per-release into a docs page. Do NOT link out to GitHub-only changelog as the only surface |
| Mobile-responsive landing | Referral traffic (Hacker News, X) is majority mobile; a broken mobile hero kills the share | LOW | CSS work only; static HTML constraint unaffected |
| Stable, linkable URLs (per-tool anchors, per-skill pages) | Docs get cited in issues, PRs, agent prompts; URL churn breaks the ecosystem's citations — and the jarvis-issues skill's dedup logic depends on linkable "known limitations" | LOW | Free with any SSG; discipline is in nav design |
| Social proof / project legitimacy signals (GitHub link, stars badge, MIT license, PyPI version badge) | Pre-1.0 tool asks users to run `curl \| sh` — legitimacy signals are the minimum compensation for that trust ask | LOW | Shields.io badges (static images, Pages-safe). Link MCP Registry listing `io.github.jarvis-intelligence/jarvis` |
| GitHub Pages–compatible static output | Hard constraint from PROJECT.md, not a preference: whatever stack wins, the deployable artifact stays static | — (constraint) | Ruled out below: anything requiring a server runtime |

### Differentiators (Competitive Advantage)

Features that set the surface apart. These should align with the Core Value (cold-install path) and with what jarvis uniquely is: an agent-tool whose docs can live *inside the agent*.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| The 3 plugin skills as a first-class "in-agent docs" layer (`jarvis-setup` / `jarvis-use` / `jarvis-issues`) | Almost no MCP server ships skills; jarvis ships three that carry the docs *into* the agent session. The use-skill decision matrix ("prefer jarvis over grep" + freshness check before structural calls) and the issues-skill dedup guard (don't file known-limitation duplicates) actively steer agents — this is the surface feature competitors don't have | MEDIUM | Realignment, not authoring from scratch. Concrete fixes found: jarvis-setup references "See CLAUDE.md for the detail" — no CLAUDE.md ships in the plugin tree (broken public reference); skills must match post-rebuild docs URLs; jarvis-use's `references/tool-roster.md` exists and is a good pattern to keep |
| The cold-install path as a designed narrative, not scattered pages (why → install → index → first tool call) | This IS the project's success metric. Sites like uv/ripgrep convert because the quickstart never forks until it must; jarvis's path is unusually clean (steps 1–3 client-agnostic, only registration forks by client) | MEDIUM | Design constraint: steps 1–3 (setup.sh, uv tool install, jarvis index) shared verbatim across clients; fork only at step 4. The "first tool call" step must show expected output ("find all references to AuthService" → findReferences result) so success is self-verifiable |
| "You'll know it works when…" success/failure shapes inline | jarvis tools return uniform `{"error": ...}` payloads instead of transport errors, plus `candidates` arrays on ambiguous symbols — non-obvious contracts that make the first tool call *interpretable*. Documenting shapes turns the success metric into something a user can verify alone | LOW | Extract from README "Tool details" + jarvis-use skill; no new product knowledge needed |
| Language support matrix as a designed component (nav vs search-only vs not covered) | jarvis's hardest sell is also its most honest differentiator: 4 nav language families + 10 search-only languages + per-language caveats (Android/AGP zero shards, pinned Kotlin, Swift macOS-arm64-only). A scannable matrix beats three paragraphs and pre-empts the #1 mis-install | LOW | Data all in README (`Requirements and limits`, detection table). Reuse across landing (compact) and docs (full) |
| Agent-consumable docs: `llms.txt` + markdown export | jarvis's audience *is* agents; letting an agent fetch the full docs surface as text (llms.txt convention) extends the in-agent-docs story to non-plugin clients. Cheap with an SSG | LOW-MEDIUM | VitePress: generate an llms.txt index over the built corpus at build time. Defer until docs content is stable (dependency below) — an llms.txt over stubs advertises emptiness |
| Simulated tool-call demo on the landing (query → result panel) | "Show, don't tell" the 9 tools: a static, pre-recorded panel — e.g. `findReferences(repo: "acme", symbol: "AuthService")` with the real JSON response shape — demonstrates the payoff before any install. Directly serves the cold-install metric (user recognizes success before attempting it) | MEDIUM | Deliberately *simulated*, not live (live = anti-feature below). Real response samples exist in README/jarvis-use; needs front-end treatment only. Alternative formats: asciinema or a short GIF if panel JS is unwanted |
| Canonical architecture diagrams reused on the public site (jarvis-layers, index-pipeline, semantic-fusion) | The atomic-publish / read-only-runtime guarantees are jarvis's engineering credibility story, and the assets already exist in `../jarvis/docs/assets/` (SVG/PNG/DOT) — a "why it's built this way" section costs only web typography | LOW-MEDIUM | Import at build; keep DOT sources linked for the curious. Dark-mode-safe rendering needs checking (SVGs likely authored for light backgrounds) |
| Local-first privacy positioning as a section, not a footnote | "Nothing leaves your machine" is a genuine wedge vs cloud code intelligence (Sourcegraph et al.); it also explains the deliberate narrowness (single-user, no auth, no config file) instead of apologizing for it | LOW | Copy already written in README/PDR; needs landing placement |
| MCP Registry + all four install paths presented as one coherent matrix (PyPI, Claude plugin, Codex plugin, MCP Registry) | PDR documents four distribution channels; most tools document one or two. A "however you found us, here's your path" table converts visitors from every channel | LOW | Commands all exist (README + PDR Distribution section). Present as tabs or a matrix on the install page |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Several are pre-decided by PROJECT.md's Out of Scope; they are recorded here so requirements phases don't relitigate them.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Live in-browser demo of the real server (WASM port / hosted playground) | "Try before install" is the obvious demo instinct | Wrong instrument: jarvis's value is indexing *the visitor's own repos locally* — a browser sandbox touches nothing real. A WASM SCIP/Zoekt/LanceDB port is enormous cost (HIGH) and would drift from the shipping product. A hosted demo violates local-first positioning outright | Simulated query→result panel with real recorded shapes (differentiator above); optionally an asciinema of a real session |
| Automated docs-stays-current sync from the private repo | Release friction worry: "docs will go stale again" | Explicitly out of scope (PROJECT.md) — a sync mechanism couples this repo's build to a private repo's internals and becomes its own maintenance surface. Version coupling (plugin 0.7.2 vs package 0.6.2 version independently) makes naive sync wrong | One-time rebuild now; manual review checklist per release; changelog page gives staleness a visible home |
| Fourth client integration / new client manifests | "Add support for client X" requests as the registry grows | Explicitly out of scope — each client adds a manifest, validator quirks, and a test matrix for a single-maintainer project | The generic stdio `mcpServers` JSON snippet (README already has it) covers any conforming client; MCP Registry listing does discovery |
| Algolia DocSearch / external search service | "Real" search feels more polished than local | Adds an external account, crawl, and JS dependency for a corpus of ~40 pages where local FlexSearch is instant; DocSearch application/approval is a launch blocker for a niche tool | VitePress localSearch; revisit only if corpus grows ~10× or relevance complaints accumulate |
| Multi-version docs selector (v0.5 / v0.6 / …) | Imitates Stripe/React docs maturity | Pre-1.0, single-user, one supported version at a time; a version selector multiplies doc surface and invites linking to stale pages. The plugin's `>=0.6.0` floor means old docs would often be *wrong* for a fresh install | Single "current" docs; version floor stated inline where behavior differs; changelog for history |
| Community forum / Discord at launch | "Every OSS project has a chat" | Thin-activity rooms read as abandonment and split bug reports away from GitHub issues — which the `jarvis-issues` skill is specifically built to funnel *to* (with dedup guardrails). Maintainer attention is the scarce resource | GitHub Issues (already the designed channel, with the skill steering well-formed reports); GitHub Discussions later if volume appears |
| SPA landing framework (React/Next island rebuild) | Framework familiarity, component ecosystems | The deliverable is a static GitHub Pages artifact from one landing page + docs; an SPA toolchain buys interactivity the page doesn't need and adds a build dependency PROJECT.md doesn't require | Static HTML/CSS (current) or SSG-rendered page with a sprinkle of vanilla JS; the stack decision stays open but the *static artifact* constraint is hard |
| Web analytics / conversion funnel tracking | "How else do we measure success?" | GitHub Pages + privacy-first positioning makes tracking-loaded pages contradictory; the success metric (cold-install completion) isn't observable by page analytics anyway | Proxy metrics that need no tracking: GitHub stars/issues/issue-quality, plugin installs, PyPI downloads, MCP Registry listing traffic |
| Overselling `semanticSearch` to plugin users | It's the flashiest tool; landing wants to feature it equally | Plugin users' default registration deliberately ships *without* the `semantic` extra (cold-start stays lancedb/torch-free) — so `semanticSearch` always errors under the plugin's own registration until the user adds a *second* server (`jarvis-semantic`). Featuring it without that caveat manufactures the exact "broken first call" the Core Value forbids | Feature it with the honest gate: "requires the `semantic` extra + separate registration — 30-second setup" and keep the primary hero path on the always-working nav tools |
| "Know, remember, do" (or any inherited) messaging refresh | The current landing's borrowed identity feels almost right to keep tweaking | Known drift (PROJECT.md): the claim set diverges from product reality (code intelligence), and the token system is extracted from opengsd.net — inherited copy carries another product's decisions | New landing identity purpose-built for jarvis (already a Key Decision); language matrix + privacy wedge are the native hooks |

## Feature Dependencies

```
[Copy-to-clipboard code blocks] (VitePress built-in)
    └──enables──> [Tabbed install widget: plugin / uv / manual matrix]

[Landing identity + positioning decision]
    └──requires──> [New landing: hero, matrix, privacy section, demo panel]
    └──requires──> [Skills realignment]  (one voice across surface; skill text must match new docs URLs and drop private-repo refs like CLAUDE.md)

[Tutorial-first docs IA: quickstart + per-client pages]
    └──requires──> [Docs search]  (search over stubs indexes nothing)
    └──requires──> [Tool reference completion] (first-tool-call step links to response shapes)
    └──enables──> [llms.txt / agent export]  (advertises corpus; ship after content stable)

[Tool reference with request/response examples]
    └──enables──> [Simulated demo panel]  (panel shows real recorded shapes)

[../jarvis sources: CHANGELOG.md, docs/assets/ diagrams]
    └──build-time import──> [Changelog page]
    └──build-time import──> [Architecture diagrams section]

[Honest limits content (README "Requirements and limits")]
    └──enables──> [Language support matrix component] (landing compact + docs full)
    └──enables──> [Troubleshooting decision tree] (symptom table derives from known limits + setup gotchas)

[semanticSearch honest gating] ──conflicts──> [Feature-parity tool showcase]
       (showing all 9 tools as equal implies semantic works everywhere)

[Static GitHub Pages artifact] ──conflicts──> [Hosted/live anything: WASM demo, hosted search, analytics backend]
```

### Dependency Notes

- **Skills realignment requires the positioning decision:** the three skills, landing copy, and docs must ship one voice (a Key Decision in PROJECT.md); realigning skills before the landing identity is settled would redo them. Also a hard correctness item independent of voice: jarvis-setup's "See CLAUDE.md" points at a file that does not ship in `plugin/` — broken for public plugin users today.
- **Docs search / llms.txt require content completion:** both features index or advertise the corpus; over ~1KB tool stubs they make thinness discoverable. Ship in the same milestone but sequenced after the reference pass.
- **Demo panel requires documented response shapes:** the panel's content *is* the tool reference's examples; extract once, use twice.
- **semanticSearch gating conflicts with tool-parity showcase:** resolved by tiering the 9 tools in presentation (always-work nav core vs opt-in semantic), not by hiding the tool.
- **Static-artifact constraint conflicts with any hosted feature:** it is a hard constraint (deploy-pages.yml), so it categorically rules out live demos, hosted search, and tracking backends rather than trading off against them.
- **Changelog and diagrams depend on private-repo imports:** both are copy-at-build from `../jarvis/`; the import must be a build step or release checklist item (the anti-feature is *automated staying-current sync*, not one-time import).

## MVP Definition

### Launch With (v1)

Minimum to validate the Core Value: cold visitor → install → first successful tool call from public pages alone.

- [ ] New landing identity: hero (one-liner + copyable primary install), 9-tool showcase (tiered — nav core vs opt-in semantic), language support matrix, local-first privacy section, legitimacy badges (GitHub/PyPI/MIT/MCP Registry), mobile-responsive — the identity decision unblocks everything else
- [ ] Tutorial-first quickstart: why → install (setup.sh + uv tool install) → `jarvis index` → register (per-client fork) → first tool call with expected output — the metric itself
- [ ] Per-client install pages: Claude Code (plugin + manual `claude mcp add`), Cursor (`mcp.json`), Codex CLI (`codex mcp add`), generic stdio client JSON — MCP table stakes
- [ ] Tool reference completed: 9 pages, request/response examples, `candidates`/`resolvedSymbol`/`{"error": ...}` contracts — replaces ~1KB stubs
- [ ] Requirements & limits surfaced pre-install (OS, one-language-per-repo, nav vs search-only matrix, semanticSearch gating) — prevents mis-installs and the bounce after
- [ ] Troubleshooting decision tree (symptom → fix), led by uvx cold-start timeout, PATH, scip version-gate, Swift scheme, partial/failed status — self-rescue is table stakes for local-first
- [ ] Changelog page (imported from `../jarvis/CHANGELOG.md`) — momentum signal
- [ ] Copy-to-clipboard, dark mode + toggle, docs local search — SSG built-ins, but absence is noticed
- [ ] CLI reference (index/watch/list/status/reindex/forget with flags from README) — complements tool reference
- [ ] Skills realignment: drop CLAUDE.md ref, match new docs URLs, sync commands with rebuilt pages, keep tool-roster pattern — one voice; correctness fix ships regardless

### Add After Validation (v1.x)

- [ ] `llms.txt` + agent-consumable export — trigger: docs content stable post-launch; extends in-agent-docs story beyond plugin clients
- [ ] Simulated tool-call demo panel on landing — trigger: response-shape examples finalized in tool reference
- [ ] Architecture diagrams section (jarvis-layers, index-pipeline, semantic-fusion, dark-mode-safe render) — trigger: landing identity settled so visual language is consistent
- [ ] Tabbed install widget (plugin / uv / registry paths in one component) — trigger: per-client pages prove which paths visitors actually take
- [ ] MCP Registry deep-link + "how you found us" path table — trigger: registry listing drives measurable traffic

### Future Consideration (v2+)

- [ ] GitHub Discussions — defer until issue volume shows community demand; conflicts with keeping one channel for the issues skill's funnel
- [ ] Asciinema/video walkthroughs — defer; static demo panel covers the need at lower production cost
- [ ] Reconsider search backend (DocSearch) — defer unless corpus grows ~10× or relevance complaints
- [ ] Analytics of any kind — defer indefinitely; proxy metrics suffice and privacy positioning argues against

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Landing hero + copyable install | HIGH | LOW | P1 |
| Tutorial-first quickstart (cold-install path) | HIGH | MEDIUM | P1 |
| Per-client install guides | HIGH | MEDIUM | P1 |
| Tool reference with response shapes | HIGH | MEDIUM | P1 |
| Requirements/limits + language matrix pre-install | HIGH | LOW | P1 |
| Troubleshooting decision tree | HIGH | MEDIUM | P1 |
| Skills realignment (incl. CLAUDE.md fix) | HIGH | LOW | P1 |
| Copy-to-clipboard / dark mode / local search | MEDIUM | LOW | P1 |
| Changelog page | MEDIUM | LOW | P1 |
| CLI reference | MEDIUM | LOW | P1 |
| "Know it works" success-shape examples | HIGH | LOW | P1 |
| Local-first privacy section | MEDIUM | LOW | P2 |
| Badges + registry legitimacy signals | MEDIUM | LOW | P2 |
| Semantic-search honest gating (tiered showcase) | MEDIUM | LOW | P1 |
| Simulated demo panel | MEDIUM | MEDIUM | P2 |
| Architecture diagrams section | MEDIUM | LOW-MEDIUM | P2 |
| llms.txt / agent export | MEDIUM | LOW | P2 |
| Tabbed install widget | LOW-MEDIUM | LOW | P2 |
| GitHub Discussions | LOW | LOW | P3 |
| Video walkthroughs | LOW | MEDIUM | P3 |
| WASM/live demo | LOW | HIGH | Never (anti-feature) |
| Hosted search/analytics | LOW | MEDIUM | Never (anti-feature) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Competitor A = Serena (oraios/serena — README claims jarvis is *complementary* to it, but it competes for the same agent-tooling attention with a semantic-refactor LSP toolkit; surface is GitHub-README-driven, no dedicated site). Competitor B = Sourcegraph (the code-intelligence incumbent; polished enterprise marketing site, cloud-hosted product — the positioning opposite).

| Feature | Serena | Sourcegraph | Our Approach |
|---------|--------|-------------|--------------|
| Landing vs README | README-first; no landing site, docs live in-repo (typical for MCP-era tools) | Full marketing site with hero, demo video, enterprise CTAs | Dedicated static landing with identity of its own — compete on clarity, not budget |
| Install UX | `uvx --from gitlab+...` one-liner in README; per-client MCP config snippets | Sales/demo-gated enterprise onboarding | Three copy-paste paths (setup.sh \| sh, plugin marketplace, uv) + registry; per-client fork only at registration |
| Agent skills shipped | None (relies on MCP tool descriptions) | N/A (not an agent plugin) | Three skills steering setup/use/issues — flagship differentiator |
| Docs IA | Flat README + docs/ folder | Tutorial + reference split, AI-assisted search | Tutorial-first with reference secondary (Diátaxis-style: learning path up front, reference complete but linked, not leading) |
| Live demo | None | Interactive product tour (cloud) | Simulated static query→result panel; local-first means the real demo is the user's own machine |
| Limits honesty | Caveats inline in README | Enterprise feature matrix (marketing-shaped) | Limits *before* install: OS, language matrix, semantic gating — honesty as a feature |
| Search | GitHub search only | Site-wide AI search | Local static FlexSearch |
| Changelog surface | Release notes on GitHub | Release notes + blog | Changelog page in-docs, imported at build |
| Privacy story | Local (implicit) | Cloud (explicit) | "Nothing leaves your machine" as a headline wedge |

Also benchmarked (from model knowledge, MEDIUM confidence): Astral's uv landing (gold-standard hero: one-liner, copy button, terminal-flavored); VitePress/Mintlify-era MCP server docs (per-client snippets as norm); MCP Registry/directory listings (discovery channel jarvis already occupies via `io.github.jarvis-intelligence/jarvis`).

## Sources

- **Product truth (HIGH confidence):** `../jarvis/README.md` (9 tools, quick start, requirements/limits, tool details, known upstream limitations); `../jarvis/docs/project-overview-pdr.md` (positioning, 4 distribution channels, non-goals); `plugin/skills/jarvis-setup|jarvis-use|jarvis-issues/SKILL.md` (current skill content, gotchas, broken CLAUDE.md reference); `plugin/skills/jarvis-use/references/tool-roster.md` (exists; on-demand reference pattern)
- **Project context (HIGH):** `.planning/PROJECT.md` — core value (cold-install path), out-of-scope list feeding anti-features, constraints (static Pages artifact, version floor, triple manifests, dual MCP config)
- **Current surface state (HIGH):** `docs/` tree listing (VitePress config, tools/ stubs, integrations/, troubleshooting/, guide/, concepts/, cli/) — grounded the "stub pages" and "what exists" claims
- **External landscape (MEDIUM):** model knowledge of developer-tool site conventions — Homebrew/uv-style install heroes, Diátaxis tutorial/reference taxonomy, VitePress local-search capability, llms.txt convention, MCP per-client snippet norms, DocSearch application process, Shields.io badges. No live web survey was possible (search disabled in this environment); external claims are consensus patterns, not measurements, and are marked MEDIUM above
- **Not consulted (would raise confidence):** live traffic/behavior data (none exists — no analytics, correctly), user feedback beyond GitHub issues (not read this session), MCP Registry listing page rendering

---
*Feature research for: public developer-tool surface (landing + docs + plugin skills) of a local-first code-intelligence MCP server*
*Researched: 2026-08-21*
