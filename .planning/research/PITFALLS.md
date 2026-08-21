# Pitfalls Research

**Domain:** Public-surface rebuild (landing page + VitePress docs + plugin skills) for a static GitHub Pages distribution repo with multi-client plugin manifest fan-out
**Researched:** 2026-08-21
**Confidence:** HIGH (repo-specific pitfalls grounded in observed instances in `.planning/codebase/` and live files; general rebuild-domain patterns marked MEDIUM — no web search available in this environment)

## Critical Pitfalls

### Pitfall 1: Docs restructure breaks every inbound link and silently rots internal links

**What goes wrong:**
The tutorial-first restructure renames/moves/deletes doc pages. The site publishes at `base: '/docs/'` with `cleanUrls: true` (`docs/.vitepress/config.ts:8-9`), so ~27 public URLs exist today (`/docs/quickstart`, `/docs/tools/go-to-definition`, `/docs/integrations/cursor`, `/docs/troubleshooting/upstream-issues`, …), all indexed via the sitemap (`hostname: 'https://jarvis-intelligence.github.io/jarvis-index/docs'`). GitHub Pages is static — there is **no server-side redirect mechanism**. Every moved page becomes a hard 404 for search engines, the jarvis README's deep links, GitHub issues that reference doc pages, and the three plugin skills' cross-references. Worse, `ignoreDeadLinks: true` (`config.ts:10`) means the VitePress build **never fails on broken internal links** — renamed pages leave dangling links in shipping docs indefinitely, with zero signal.

**Why it happens:**
Tutorial-first IA feels like a greenfield information architecture, so planners design the ideal URL tree and treat the old tree as disposable. The two safety nets that would catch this in a normal project — build-time link checking and server redirects — are both explicitly disabled/absent here (`ignoreDeadLinks: true` was set precisely because dead links were already accumulating).

**How to avoid:**
- Before renaming anything, enumerate the current public URL set (27 pages across `tools/`, `cli/`, `concepts/`, `integrations/`, `troubleshooting/`, `guide/`, plus `index.md` and `quickstart.md`) and treat it as a contract.
- Build a redirect map: since Pages can't do 301s, either keep old URLs as thin stub pages with `<meta http-equiv="refresh">` / JS redirect to the new location, or ship a custom `404.html` with a "this page moved" lookup table. VitePress supports a `404.md` theme page at the site root.
- Temporarily flip `ignoreDeadLinks: true` to `false` (or run a link checker in CI) for the duration of the rebuild; every internal link fixed during restructure is one less production 404.
- Update the sitemap hostname config if the URL shape changes; verify the new sitemap in Search Console after deploy.

**Warning signs:**
- A plan phase that lists new doc filenames without a corresponding old→new mapping column.
- PRs that `git mv` files under `docs/` with no companion stub/redirect pages.
- VitePress build passes after a mass rename (it always will — dead links are ignored).
- The three skills' `SKILL.md` files or `plugin/README.md` still reference old doc paths.

**Phase to address:**
Phase 1 (docs IA/structure decision): URL contract + redirect strategy decided *before* content writing starts. Verified again in the final launch phase with a link crawl of the live site.

---

### Pitfall 2: New marketing claims drift from shipped product reality (the repo's recurring failure mode)

**What goes wrong:**
The landing/docs/skills make claims the shipped artifacts don't honor. This repo has **four live instances right now**: (a) `site/index.html` hardcodes "plugin v0.7.0" (lines 682, 945) while all three manifests are at 0.7.2; (b) the `jarvis-setup` skill claims `setup.sh` pre-warms the jarvis-mcp cache, but the *synced* `setup.sh` has no such code — docs commit `6d6ca8e` raced ahead of sync commit `c945506` (issue #4); (c) `tool-roster.md` says typeHierarchy errors on real indexes while `SKILL.md` correctly says fork-fixed; (d) the landing's "Know, remember, do" tagline is opengsd.net's positioning, not jarvis's. The rebuild risks a fifth, subtler instance: PROJECT.md requires the landing to showcase "all 9 MCP tools (incl. `typeHierarchy`, `semanticSearch`)" — but `semanticSearch` **always errors under the default plugin registration** (the `[semantic]` extra is deliberately excluded from `plugin/.mcp.json`), and `typeHierarchy` errors on indexes built with an unpatched `scip` until reindex. An unqualified "9 tools" hero claims more than a fresh plugin install delivers.

**Why it happens:**
Product truth lives in the private repo (`../jarvis/`), but the shipped installer lives here and syncs on release cadence. Writers source from upstream docs (README, PDR at 0.6.2) and describe the newest private-repo behavior, while users run the last-synced public artifacts. Version strings are hand-copied because nothing generates them. Marketing wants the strong claim ("9 tools") and the engineering caveats ("2 of them have conditions") get lost.

**How to avoid:**
- Rule: claims describe **what is true of the artifacts in this repo today** (synced `setup.sh`, manifests 0.7.2, PyPI 0.6.2), not upstream's head.
- Qualify the conditional tools at point of claim: semanticSearch needs the separate `jarvis-semantic` registration; typeHierarchy needs a fork-built scip or reindex; Windows unsupported; Intel Macs can't index Swift; Kotlin must be exactly 2.2.0. The "language support matrix" requirement in PROJECT.md exists precisely to carry these caveats — build it from `setup.sh` platform gates and `docs/troubleshooting/upstream-issues.md`, not from aspiration.
- Never hardcode version strings on the landing page; if a number must appear, add the CI check that asserts site strings match manifest versions (CONCERNS.md "Landing-page version strings drift" fix approach), or substitute at build time.
- Keep one claims-audit pass in the launch phase: every factual sentence on landing + docs cross-checked against README/CHANGELOG/`setup.sh`.

**Warning signs:**
- Landing copy containing version numbers, "automatic", "instant", or "all N tools" without a caveat footnote.
- Docs/skills text describing `setup.sh` behavior that `grep` can't find in the synced `setup.sh`.
- Content sourced from `../jarvis/` files newer than the last `chore: sync distribution surface` commit here.
- Copy that reuses `phuongddx` URLs or the "Know, remember, do" frame (stale org/brand residue).

**Phase to address:**
Landing content phase (claims written with caveats) and launch/verification phase (claims audit + version-string check). The optional CI version-agreement check belongs in whatever phase touches the landing build.

---

### Pitfall 3: Tutorial-first rewrite orphans already-installed users

**What goes wrong:**
The restructure optimizes for the cold visitor and demotes/buries reference depth. But the docs' heaviest repeat users are *installed* users arriving via search or old links with a specific need: "what does this error mean", "how do I reindex", "why does Kotlin indexing fail". The troubleshooting pages (`docs/troubleshooting/index.md`, `common-failures.md`, `upstream-issues.md`), the 10 per-tool pages, and the 8 CLI pages are the load-bearing surface for them. If the rebuild deletes or merges these into tutorial prose (or moves them to new URLs per Pitfall 1), the installed base — the population most likely to file issues and recommend the tool — lands on 404s or can't find error-table content that used to be one URL away. GitHub issue templates and community answers historically deep-link to these pages.

**Why it happens:**
Tutorial-first feels like replacement rather than layering. Reference pages are "thin stubs" (~1KB per tool) so they look like easy deletion targets in a rebuild, and new writers underestimate how much traffic is error-driven rather than journey-driven.

**How to avoid:**
- Treat the rebuild as **additive**: the tutorial narrative layer (why → install → first query → per-client setup) is new; existing reference/troubleshooting pages are kept, deepened (they're genuinely thin), and remain reachable at stable URLs.
- Reference depth "secondary" means navigation order, not deletion (PROJECT.md's own decision table says reference stays secondary — secondary ≠ gone).
- Before deleting any page, grep the repo *and* the jarvis private repo README for links to it; check the plugin skills' cross-links.

**Warning signs:**
- A docs plan whose diff is mostly deletions/renames of `tools/*`, `cli/*`, `troubleshooting/*`.
- Troubleshooting content being rewritten as narrative prose with the symptom→fix table structure dissolved (CONVENTIONS.md mandates tables for troubleshooting surfaces — their dissolution is an early sign).
- The new IA has no direct nav path to per-tool/per-command reference in one click.

**Phase to address:**
Docs IA phase (structure decision must explicitly classify every existing page: keep / merge-with-redirect / retire) and each docs-content phase (deepening, not deleting).

---

### Pitfall 4: Plugin-skill rewrite ships to nobody or breaks registration (three-manifest delivery trap)

**What goes wrong:**
Any content change under `plugin/` reaches installed users **only** when the `version` field rises simultaneously in all three manifests (`plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`, currently 0.7.2). A skill rewrite that bumps two of three ships to two clients and silently to nobody on the third. There is **no CI backstop** (roadmap gap 2) and **rollback is forward-only** (clients compare versions; you can't un-ship, only bump again). Related traps in the same blast radius: the duplicated MCP configs `plugin/.mcp.json` (Claude Code/Codex) and `plugin/mcp.json` (Cursor) must be edited both-or-neither — and `docs/integrations/cursor.md:19` currently documents the *wrong* filename, so a rebuild copying the docs' instruction edits only the dotted file and desyncs Cursor. The `--from jarvis-mcp>=0.6.0` floor must survive any config edit as a valid `>=` floor (never below 0.6.0, never exact-pinned, never with the `[semantic]` extra — a settled decision). And skill `description` frontmatter is the **trigger surface** — a rewritten description that no longer names the concrete invocation situations means agents stop calling the skill at the right moments (a silent behavioral regression no validator catches). Cursor's validator additionally requires lowercase-kebab names with marketplace/plugin name agreement and paths that resolve relative to `plugin/` — renamed skill directories or new reference files that aren't reflected in declared paths hard-error at publish time, stalling the whole rebuild's ship.

**Why it happens:**
The delivery mechanism is invisible: content edits "work" locally (the files are right there), so the version bump feels like release bureaucracy rather than the actual deploy. The duplication (5 files in lockstep: 3 manifests + 2 MCP configs) is a settled Windows-compatibility trade-off that new contributors keep trying to "fix" with a symlink. Skill rewrites focus on body text and treat frontmatter as boilerplate.

**How to avoid:**
- Hard rule for every phase touching `plugin/**`: content edit + all-three version bumps land in the **same commit**; the phase's definition-of-done includes `grep '"version"' plugin/.claude-plugin/plugin.json plugin/.cursor-plugin/plugin.json .codex-plugin/plugin.json` returning one identical value, plus running Cursor's `validate-template.mjs` from repo root.
- Never edit one MCP config without the other; verify with `diff plugin/.mcp.json plugin/mcp.json` expecting empty.
- Preserve the constraint sentences in skills verbatim or consciously re-decide: sibling cross-links in the first body line, `error`-key contract, `[semantic]` exclusion rationale ("settled, not being revisited"), confirmation-before-`gh issue create`.
- When rewriting a skill `description`, diff old vs new trigger phrases; keep the should/should-NOT trigger examples (CONVENTIONS.md) as the regression check.
- Consider landing the CI checks (version agreement, `.mcp.json`≡`mcp.json`, JSON parse) *before* the skills phase, so the rebuild itself is protected — cheapest insurance available.

**Warning signs:**
- A skills PR that changes `SKILL.md` bodies without a manifest diff.
- Any proposal to symlink or generate the two MCP configs.
- A new skill directory or renamed `references/` file not added to Cursor manifest path fields.
- Rewritten descriptions that read as marketing copy ("helps developers be productive") instead of trigger situations ("use when the user asks who calls X").

**Phase to address:**
Plugin-skills phase (the bump/validator/dual-file protocol is its definition of done), with the guard CI ideally in the immediately preceding phase.

---

### Pitfall 5: Stack/landing-build migration silently breaks the Pages deploy

**What goes wrong:**
PROJECT.md leaves the stack open (VitePress may change, landing may gain a build step). `deploy-pages.yml` has three brittle couplings: (a) **path-filtered triggers** only fire on `site/**`, `docs/**`, `package.json`, `package-lock.json`, and the workflow file itself — a new stack with sources elsewhere (`landing/`, root-level `astro.config.mjs`, `tailwind.config.js`, a `src/` tree) pushes to `main` and **nothing deploys**; the live site silently goes stale. (b) **Artifact assembly hardcodes** `cp -r site/* _artifact/` and `cp -r docs/.vitepress/dist/* _artifact/docs/` — a new build output directory (`dist/`, `.astro/`, `public/`) makes the merge copy nothing or the wrong thing; the deploy "succeeds" with an empty or half-empty artifact. (c) `npm ci` with **Node 20** and a lockfile that must be in sync with the new toolchain. Additionally `base: '/docs/'` and the sitemap hostname are baked into the VitePress config — a new engine must reproduce the `/docs/` sub-path mounting exactly or every asset URL 404s, and `cleanUrls` semantics differ per engine (compounding Pitfall 1's URL churn).

**Why it happens:**
The workflow is invisible plumbing that currently "just works"; migration plans test the new build locally and never read the 59-line deploy workflow. The path filter in particular fails *silently* — no red X, just no deploy.

**How to avoid:**
- Non-negotiable output contract for any stack: static artifact, landing at `/`, docs at `/docs/`, same URL shapes (`cleanUrls`-style extensionless paths preserved).
- Any stack-change PR must include the matching `deploy-pages.yml` edits (trigger paths + assembly steps + Node version) in the **same commit**, and prove it with a real deploy (the workflow runs on push to `main` or `workflow_dispatch` — dispatch it on the PR branch's merge and curl the live URL).
- Add a post-deploy smoke step early in the rebuild (curl `/` and `/docs/` expecting HTTP 200 and a known marker string) so silence becomes failure.
- If VitePress is replaced, run old and new builds side by side and diff the URL lists before cutover.

**Warning signs:**
- Phase plan says "switch to <engine>" with no mention of `.github/workflows/deploy-pages.yml`.
- New build output lands anywhere other than `docs/.vitepress/dist` or `site/` without assembly-step changes.
- Local dev works, `git push` produces no deploy run in the Actions tab.
- Lockfile regenerated with a different npm major.

**Phase to address:**
Phase 1 (stack decision): the decision must ship with the workflow diff. Deploy smoke check added in the same phase and reused at every later deploy.

---

### Pitfall 6: "Full rebuild" scope creep past the PROJECT.md fences

**What goes wrong:**
The rebuild mandate invites touching everything, and this repo's out-of-scope list exists because each fence guards a known failure: (a) **editing `setup.sh` here** — every local edit is silently overwritten by the next `sync-public-distribution.yml` run; a "fix" to the pre-warm drift applied locally looks shipped, then vanishes on the next release (the drift's root cause is upstream, issue #4). (b) **Adding a fourth client manifest** — the triple-manifest fan-out is the delivery mechanism; a fourth multiplies every future bump. (c) **Building a docs-stay-current sync mechanism** — explicitly declined; a rebuild that grows a sync pipeline reopens a settled decision. (d) **Cloud/hosted claims** — deprioritized per PDR; landing copy drifting toward "sign up" framing misrepresents the product. (e) Refactoring `plugin/` structure (renaming skills, reorganizing `references/`) "while we're in there" — pure churn risk through the Pitfall 4 machinery with no content value. Softer creep: rebuilding brand tokens, vendoring fonts, restructuring docs IA, rewriting skills, *and* migrating stack all in one milestone — any one failing blocks all.

**Why it happens:**
"Full rebuild" is the project's own framing; each adjacent thing looks small once the files are open. The fences are documented in PROJECT.md's Out of Scope, but phase planners under pressure rediscover them as "obvious improvements."

**How to avoid:**
- Make the Out of Scope list a literal PR-review checklist: any diff touching `setup.sh` is rejected with "fix upstream in `jarvis/`"; any new `*-plugin/` directory rejected; any sync/automation code rejected.
- Sequence the milestone so each surface (stack decision → docs → landing → skills → verification) lands and deploys independently; never stack two surfaces in one unverified change.
- If `setup.sh`'s *documentation* drift bothers the rebuild, the correct move is filing/landing the upstream fix and waiting for the sync commit — then documenting; not editing here.

**Warning signs:**
- PR diffs containing `setup.sh`, new manifest directories, or automation/sync scripts.
- Roadmap phases whose titles combine two surfaces ("rebuild landing and migrate stack").
- "While we're at it" appearing in phase discussions.
- Milestone plan with no deploy checkpoint until the very end.

**Phase to address:**
Roadmap/planning phase: fences encoded as phase boundaries and acceptance criteria; enforced at every later phase's review.

---

### Pitfall 7: Rebuilding from stale committed specs and plans (the repo already did this to itself once)

**What goes wrong:**
`plans/0807-2314-landing-page/plan.md` and `docs/superpowers/specs/2026-08-07-landing-page-design.md` still mandate "zero external requests, no CDN/fonts/scripts" and the `#3B82F6`/`#0F172A` palette — constraints the shipped redesign (commit `18540b0`, `docs/brand-spec.md`, `#29527d` palette, Google Fonts, inline script) already abandoned. Anyone implementing the *rebuild* by consulting these artifacts regresses the live page and reintroduces dead constraints. The rebuild milestone will generate its own new specs; without supersession hygiene the repo accumulates a second generation of contradictory truth.

**Why it happens:**
Planning artifacts are committed as if permanent but never retired; nothing marks which spec is current. New contributors (or agents) grep for design docs and take the first hit.

**How to avoid:**
- Mark the old artifacts historical now (superseded-by header pointing at `docs/brand-spec.md`'s successor), as CONCERNS.md already recommends.
- Every new design/plan artifact the rebuild creates carries a status frontmatter (`status: active | superseded-by X`) and one canonical pointer in the roadmap.
- The new brand spec becomes the single source for tokens; landing implementation references it by path, not by copying values.

**Warning signs:**
- Implementation PRs citing `plans/` or `superpowers/specs/` paths.
- Two docs disagreeing about palette, fonts, or JS policy.
- `docs/brand-spec.md` edited without the landing build being rebuilt from it.

**Phase to address:**
Phase 1 (identity/stack decision): retire old artifacts when the new brand spec lands; every content phase links only to active specs.

---

### Pitfall 8: New maintainer docs leak to the public site via `srcExclude` drift

**What goes wrong:**
Public/internal docs are split only by a hand-maintained `srcExclude` list in `docs/.vitepress/config.ts:17-26` (8 entries today: `code-standards.md`, `deployment-guide.md`, `brand-spec.md`, `superpowers/**`, etc.). The rebuild will create new internal planning/maintainer docs inside `docs/` (the natural place per convention). Any file not added to `srcExclude` is **published to the public site** — including content that references the private repo layout, sync tokens, publishing runbooks, and roadmap gap discussions. The inverse also bites: a moved/renamed internal doc whose *new* name isn't in the list publishes; a user-facing page accidentally matching an exclude pattern vanishes.

**Why it happens:**
The exclusion mechanism is deny-by-list in a config file nobody re-reads; "add a markdown file to docs/" feels safe. The rebuild multiplies doc churn, multiplying the exposure window.

**How to avoid:**
- Convention for the rebuild: every new file under `docs/` gets an explicit public/internal decision at creation time, recorded by either appearing in `srcExclude` or not — make "update srcExclude" a checklist item in each docs phase's definition of done.
- Post-build check (local or CI): list files in `docs/.vitepress/dist/` and diff against expectation — catches both leaks and vanishings regardless of cause.
- Consider an allowlist prefix instead (e.g., `docs/internal/` excluded by one glob) if the rebuild touches the config anyway — one pattern instead of N filenames.

**Warning signs:**
- New `docs/*.md` files whose names appear in no `srcExclude` entry and no public nav.
- Deploys where the built page count grows by more than the planned public pages.
- Maintainer-oriented filenames (`*-guide.md`, `*-spec.md`, `*-roadmap.md`) landing under `docs/` without a config diff.

**Phase to address:**
Every docs phase (definition-of-done item), with a one-time dist-diff check added in the first docs phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding plugin/package version strings in landing copy | No build plumbing needed | Version rot within one release (already happened: v0.7.0 vs 0.7.2); erodes trust | Never — either omit versions from copy or add the CI agreement check |
| Leaving `ignoreDeadLinks: true` during the rebuild | Renames don't fail the build | Silent production link rot compounding Pitfall 1 | Only after a dedicated link-check CI step replaces it |
| Bumping skill content without the third manifest | Ship two clients today | Third client silently frozen at old content; recovery is forward-only re-bump | Never |
| Documenting upstream (`../jarvis/`) behavior before the sync commit lands | Docs match the newest code | Public claims falsifiable by any user running the synced installer (live: pre-warm claim, issue #4) | Only with an explicit "ships with release X" caveat |
| Copying old landing spec constraints into the new build | Fast start from an existing doc | Regression of the current design (fonts/JS/palette contradictions) | Never — supersede artifacts first (Pitfall 7) |
| Hand-maintaining `srcExclude` filenames instead of one internal/ glob | No config refactor needed | Public leak of maintainer docs on every forgotten entry | Acceptable only while dist-diff check runs each phase |
| Deferring the seven CI checks (roadmap gap 2) past the rebuild | Milestone lands sooner | Every guard this research describes stays a manual human step during the highest-churn period the repo will ever see | Only if the rebuild itself adds the cheapest three (version agreement, mcp.json equality, JSON parse) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages | Assuming redirects work; assuming deploys trigger on any push | Static-only: stub pages/`404.html` for redirects; remember the `paths:` filter on `site/**`, `docs/**`, `package*.json`, workflow file — update it with any new source location |
| Cursor plugin validator | Running it from `plugin/` or after push; renaming skills without updating path fields | Run `validate-template.mjs` from repo root pre-push; names lowercase-kebab and marketplace/plugin `name` must agree; all declared paths must resolve relative to `plugin/` |
| Claude Code / Codex / Cursor manifests | Treating the three plugin.json files as independent configs | One shared version across all three; bump together in the same commit as any `plugin/` content change |
| Dual MCP configs | Editing `plugin/.mcp.json` only (Cursor reads the undotted `plugin/mcp.json`) | Edit both or neither; verify with `diff plugin/.mcp.json plugin/mcp.json`; keep `--from jarvis-mcp>=0.6.0` as a `>=` floor; never add `[semantic]` extra |
| PyPI (`jarvis-mcp`) | "Fixing" slow cold starts by pinning an exact version or adding extras in the MCP config | Floor stays `>=0.6.0`; cold-start is handled by the upstream pre-warm (setup.sh) — document the workaround, don't change the config |
| npm toolchain (VitePress / future stack) | Swapping engines without touching Node version, lockfile, and assembly steps in the workflow | Stack change = workflow diff + lockfile regen + artifact-contract proof in the same PR, verified by a real deploy |
| Google Fonts (current landing) | Keeping external font requests in a rebuild of a "nothing leaves your machine" product | Self-host woff2 in assets (CONCERNS.md recommendation) or drop the fonts — the privacy claim is part of the brand |
| Sync pipeline (private→public) | Assuming a jarvis release automatically updates this repo's `setup.sh` | After any upstream release docs depend on, confirm the `chore: sync distribution surface from jarvis@<sha>` commit landed before publishing claims |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Marketing "instant setup" vs uvx cold start (transitive Rust builds) | Users past the 30s MCP connect timeout report "jarvis is broken" on day one | Copy must set the first-start expectation and link the pre-warm workaround; never promise seconds without the cache-warm caveat | First plugin install on any cold machine — i.e., every cold visitor the landing converts |
| Render-blocking Google Fonts on landing | Slow first paint; privacy-inconsistent requests | Self-host fonts or system stack during the rebuild (one-time fix) | Every page load now; worse on slow networks |
| Docs site with heavy client-side search/theme assets after engine migration | `/docs/` bundle bloat vs today's lean VitePress default theme | Compare built artifact size old-vs-new before cutover; keep local search provider | Mobile/slow connections |
| Sequential ~86MB+ installer download framed as "2-minute setup" in tutorials | Tutorial promises a timeline reality doesn't meet; abandonment mid-install | Time a real clean-machine install and write the honest number | Every cold install, immediately |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Publishing maintainer docs (deployment runbooks, token names, private-repo layout) by missing `srcExclude` | Information disclosure of publishing internals to the public site | Dist-diff check each phase; internal/ glob pattern (Pitfall 8) |
| External font/CDN requests on a "local-first, nothing leaves your machine" product page | Brand-trust contradiction plus visitor IP leakage to third parties | Zero-request landing (self-hosted assets) as an explicit rebuild acceptance criterion |
| Reintroducing `phuongddx`-era URLs or old org links during copy rewrite | Users curl-piping from a stale/untrusted path; broken trust chain | Claims-audit pass includes grepping for old org strings; all install URLs verified against README canonical form |
| Documenting new curl-to-exec validation steps without pinning | Maintainers executing unpinned remote scripts (pattern already flagged in `docs/deployment-guide.md`) | Any new "curl \| node/sh" instruction in rebuilt docs pins a commit hash or vendors the script |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Agent-jargon positioning ("MCP server with SCIP ingestion") on the landing hero | Cold visitor can't tell what jarvis does in 5 seconds | Lead with the developer outcome ("your agent navigates code structurally, not by grep"), keep jargon for docs depth |
| Tutorial that assumes the plugin path only | Manual-MCP-client users (any client beyond the three) hit a dead end at step one | Tutorial branches: plugin install vs manual `mcp add`, both verified; PROJECT.md's four distribution channels all covered |
| Conditional tools presented unconditionally (semanticSearch, typeHierarchy) | First tool call fails → milestone's own success metric (first successful tool call) fails | Caveat at point of claim + prerequisites matrix; the tutorial's "first query" should use an unconditionally working tool (e.g. `findReferences`) |
| Docs nav that buries error-triage under narrative | Installed users with a failing install can't self-serve | Troubleshooting one click from every docs page; keep symptom→fix tables (CONVENTIONS.md) |
| No custom 404 page after URL restructure | Dead-ends with no recovery path | `404.html` with redirect suggestions/lookup (pairs with Pitfall 1) |

## "Looks Done But Isn't" Checklist

- [ ] **Landing redesign:** Often missing the live-site check — verify deployed `/` serves the new build (path-filter + artifact assembly can no-op silently; Pitfall 5)
- [ ] **Docs restructure:** Often missing redirect stubs for *every* retired URL — verify a crawl of the old URL list returns content or a redirect, never a bare 404
- [ ] **Skills realignment:** Often missing the third manifest bump — verify one identical version in all three manifests + `validate-template.mjs` passes + `diff plugin/.mcp.json plugin/mcp.json` empty
- [ ] **Cold-install path:** Often missing a true clean-machine run — verify on a fresh environment: landing → setup → index → first tool call using only public pages (the milestone's success metric)
- [ ] **Claims audit:** Often missing the caveat pass — verify every tool/platform claim against CHANGELOG 0.6.2 + synced `setup.sh` (semanticSearch registration caveat, typeHierarchy reindex caveat, platform matrix)
- [ ] **New maintainer docs:** Often missing the `srcExclude` entry — verify the built dist file list contains only intended public pages
- [ ] **Stack change:** Often missing the workflow diff — verify `deploy-pages.yml` triggers/assembly/Node version updated in the same commit and a deploy ran green
- [ ] **Old specs:** Often missing supersession headers — verify `plans/` and `superpowers/specs/` artifacts point at the current brand spec
- [ ] **Sitemap/SEO:** Often missing sitemap regeneration check — verify sitemap URLs match the shipped page set after restructure

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Broken inbound links after docs restructure | MEDIUM | Add stub redirect pages for the 404'd URLs (Pages deploys are instant); ship `404.html`; request re-index via sitemap; fix internal links found by a one-off crawl |
| Shipped false claims (version/feature drift) | LOW | Correct copy + redeploy (Pages is push-fast); for skills, correct content and bump all three manifests — forward-only, so the fix itself is just another version bump |
| Skills shipped to only two clients (missed manifest bump) | LOW | Bump the missed manifest to match — clients pick it up on next check; add the CI check so it can't recur |
| One MCP config edited alone (Cursor desync) | LOW | Restore byte-equality with the authoritative file (the two are identical by contract); fix `docs/integrations/cursor.md`'s wrong filename so the docs stop teaching the mistake |
| Deploy workflow broken by stack migration | MEDIUM | Revert the stack PR (workflow is in-repo, revert is clean); re-run `workflow_dispatch` after fixing triggers/assembly; add the post-deploy smoke step during recovery |
| Local `setup.sh` edit overwritten by sync | LOW | The edit is gone by design; re-apply upstream in `jarvis/`, release, confirm the sync commit; never re-edit here |
| Maintainer docs leaked publicly | MEDIUM | Add to `srcExclude`, redeploy; assume indexed/cached — review what leaked and rotate anything sensitive (repo is designed secret-free, so normally nothing) |
| Implemented from a stale spec (regression shipped) | LOW | Redeploy from current brand spec; mark the stale artifact superseded immediately |

## Pitfall-to-Phase Mapping

Phases are functional (roadmap not yet built); numbers assume the natural ordering: **P1 stack/IA decisions → P2 docs rebuild → P3 landing → P4 plugin skills → P5 launch verification.**

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. URL/inbound-link breakage | P1 (URL contract + redirect map) | P5: crawl old URL list → all return content or redirect; sitemap matches shipped pages |
| 2. Claims/product drift | P3 (caveated copy) + P2 (reference accuracy) | P5: claims audit — every factual statement traced to README/CHANGELOG/synced setup.sh; no hardcoded versions |
| 3. Orphaned reference users | P2 (additive IA, page classification) | P2: nav reaches every tool/CLI/troubleshooting page in one click; no content deleted without redirect |
| 4. Plugin delivery breakage | P4 (bump/validator/dual-file protocol) | P4: three-manifest version equality grep, validator pass, `diff` of MCP configs empty, trigger descriptions diffed |
| 5. CI/deploy breakage on stack change | P1 (workflow diff ships with decision) | P1 and every deploy after: live URL returns 200 with expected marker |
| 6. Scope creep past fences | Roadmap phase (fences as phase boundaries) | Every phase review: diff touches no `setup.sh`, no new manifests, no sync automation |
| 7. Stale-spec regression | P1 (supersede old artifacts) | P1: historical headers present; later phases cite only active specs |
| 8. srcExclude leak | P2 (and every docs phase) | Per-deploy dist file-list diff vs planned public set |

## Sources

- `.planning/codebase/CONCERNS.md` (2026-08-21) — live drift instances: site v0.7.0 vs manifests 0.7.2; pre-warm claim vs synced setup.sh (issue jarvis-index#4); tool-roster typeHierarchy contradiction; `cursor.md` wrong MCP filename; `ignoreDeadLinks`/`srcExclude` fragility; no CI; forward-only rollback — HIGH
- `.planning/codebase/ARCHITECTURE.md` (2026-08-21) — manifest fan-out, version-bump-as-release, dual MCP config, sync pipeline, deploy workflow contract — HIGH
- `.planning/codebase/CONVENTIONS.md` (2026-08-21) — version-bump delivery rule, edit-both-or-neither, skill description as trigger surface, docs conventions — HIGH
- `.planning/PROJECT.md` — Out of Scope fences, constraints (version floor, Cursor validator, setup.sh ownership), active requirements incl. "all 9 tools" nuance — HIGH
- `docs/.vitepress/config.ts`, `.github/workflows/deploy-pages.yml` — read directly: `cleanUrls`/`base`/sitemap/`srcExclude`; path-filtered triggers, hardcoded artifact assembly, Node 20 — HIGH
- `../jarvis/CHANGELOG.md` (0.6.0–0.6.2), `../jarvis/README.md` — product truth for claims audit; platform/upstream caveats (Kotlin 2.2.0 exact, scip fork dependency, semanticSearch extra) — HIGH
- GitHub Pages static-hosting redirect limitations and VitePress dead-link/sitemap behavior — general platform knowledge, MEDIUM (no web search available in this environment; verify details against current GitHub/VitePress docs when implementing)

---
*Pitfalls research for: public-surface rebuild (landing + docs + plugin skills) of jarvis-index*
*Researched: 2026-08-21*
