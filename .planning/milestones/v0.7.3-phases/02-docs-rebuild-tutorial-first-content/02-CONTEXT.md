# Phase 2: Docs Rebuild — Tutorial-First Content - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the docs *content* on the Phase 1 Astro + Starlight foundation: a tutorial-first quickstart carrying a cold visitor to a self-verifiable first tool call, per-client install guides plus the four-channel matrix, full 9-tool and 7-command reference depth, requirements/limits before install, a troubleshooting decision tree, the keep/merge/retire classification of every existing page with redirects, changelog import, and `llms.txt` generated strictly last. The shell (theme, search, tokens, CI checks) is Phase 1's work and is NOT re-opened here; landing-page copy is Phase 3; plugin skills are Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Page classification & brand-logo.html
- **D-01:** `brand-logo.html` is classified **keep** — it stays a public URL in `design/url-contract.json`, but its Google Fonts CDN links are replaced with self-hosted fonts so the site-wide zero-third-party-font claim finally holds everywhere (closes WINDOWS.md id 4 and removes the `verify-build.mjs` V4 exclusion for this file).
- **D-02:** Default stance for the 32 existing docs pages is **keep all, deepen in place** — the current IA (guide/concepts/mcp-tools/cli/integrations/troubleshooting) is sound; no URL churn, no redirect surface beyond what classification genuinely flags. — **Reversibility:** costly — reorganizing later means new redirects, url-contract edits, and inbound-link risk after Phase 5's crawl baseline.
- **D-03:** No pre-known merges/retires beyond brand-logo.html's font fix. The classification pass (plan 02-01) still audits each page against `design/url-contract.json` and flags anything genuinely redundant for user confirmation before retiring — retire is never silent.
- **D-04:** The 404 page is a **lookup table + nav**: retired/renamed URL → new location (derived from url-contract history), plus a link into the docs nav. Not a bare generic 404.

### Reference content depth & voice
- **D-05:** Tool-page request→response examples come from **real transcripts** in the private `../jarvis/` repo (test suite, README) — including real edge shapes like the ambiguous-symbol `candidates` list. No invented example payloads. — **Reversibility:** reversible, but drift risk is the whole reason: illustrative examples were rejected because they rot against actual tool output.
- **D-06:** Reference voice is **terse**: signature, params table, one example, done. Optimized for scanning; matches the existing quickstart's direct tone.
- **D-07:** DOCS-10's inline "you'll know it works when…" success/failure shapes apply to the **quickstart only**. Tool reference pages' success/failure shape is the `{"error": ...}` contract itself (DOCS-04) — no extra callouts across the 9 pages.
- **D-08:** `semanticSearch`'s `[semantic]` extra + second-MCP-server requirement gets a **prominent caveat box at the top** of its reference page — consistent with the landing page and `jarvis-use` skill, which present it as a settled decision, never a TODO.

### Install-channel primacy
- **D-09:** The quickstart's primary path leads with the **`setup.sh` curl** command — client-agnostic, matches the landing CTA. The quickstart stays a single linear path: why → setup.sh → `jarvis index` → register per client → first tool call.
- **D-10:** The **four-channel install matrix (DOCS-03) lives on its own page**, not inline in the quickstart. The **MCP Registry deep-link table (DOCS-12) lives on that same matrix page** — the registry is one of the four channels.
- **D-11:** The **generic stdio JSON guide is a full standalone page**, equal footing with Claude Code / Cursor / Codex CLI (DOCS-02 names all four as deliverables).

### Troubleshooting scope & sourcing
- **D-12:** The decision tree is led by the three named failure modes (uvx cold-start, PATH, scip version-gate) and extended by **mining `../jarvis/`'s GitHub issue history** (open + closed) for real recurring failures — grounded in actual support pain, not guessed edge cases.
- **D-13:** Keep the existing **two-page troubleshooting split**: "Common Failures" (user-fixable, symptom → diagnosis → fix) vs "Upstream Issues" (known limitations, not user-fixable). The distinction is structural, not cosmetic.
- **D-14:** **Requirements & Limits is a new dedicated page**, led by the language-support matrix (4 nav families / 10 search-only / per-language caveats); the quickstart links to it immediately before the install step ("check your language is supported") — satisfies DOCS-06's before-install placement while keeping the quickstart linear.
- **D-15:** The changelog page (DOCS-08) mirrors `../jarvis/CHANGELOG.md` **verbatim, in full** — one-time copy per the project's no-sync-mechanism decision; no curation/trimming editorial layer.

### Claude's Discretion
- Exact nav placement of the new pages (install matrix, requirements & limits) within Starlight sidebar groups — keep one-click reachability per DOCS-09.
- Whether the redirects for any 02-01-flagged retires use Astro's `redirects` map or content-level stubs — Phase 1 proved the mechanism (`${BASE}/`-prefixed destinations, meta-refresh stubs); pick per-case.
- `llms.txt` format/generation approach (plan 02-05) — only the sequencing is locked: strictly after content stabilizes.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### URL contract & guardrails (Phase 1 outputs this phase executes against)
- `design/url-contract.json` — the committed 34-URL enumeration; every page add/retire edits this file in the same commit (V2 set-equality fails the build otherwise)
- `scripts/verify-build.mjs` — the five dist assertions (V2/V3/V4/V5/V9); D-01's brand-logo font fix removes its V4 exclusion for `dist/brand-logo.html`
- `astro.config.mjs` — redirects map + discipline comment; redirect destinations MUST be `${BASE}/`-prefixed (verified Phase 1 pitfall)
- `.planning/WINDOWS.md` — id 4 (brand-logo.html font CDN) is the open item D-01 closes

### Known defects this phase fixes
- `.planning/phases/01-site-foundation-identity/01-REVIEW.md` — WR-01: `src/content/docs/docs/tools/index.md:15` links `/tools/findReferences` (camelCase) instead of `/tools/find-references`; fix in the content pass

### Product truth (source material for all content)
- `../jarvis/README.md` — canonical user-facing doc
- `../jarvis/docs/project-overview-pdr.md` — positioning + scope
- `../jarvis/docs/system-architecture.md` — deep architecture
- `../jarvis/CHANGELOG.md` — mirrored verbatim per D-15 (jarvis 0.6.2)
- `../jarvis/` test suite + GitHub issues — real transcripts (D-05) and troubleshooting failure modes (D-12)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 32 scaffolded docs pages under `src/content/docs/docs/` — thin stubs with valid frontmatter (`title` mandatory), correct kebab-case slugs, already in the url-contract; deepen in place per D-02
- Starlight sidebar config in `astro.config.mjs` — six mirrored groups; new pages slot into existing groups
- `rebaseDocsLinks()` rehype plugin in `astro.config.mjs` — rebases root-relative markdown links; Phase 2 content rewrite MAY retire it if links are authored base-aware (noted in Phase 1 decisions as retirable)

### Established Patterns
- Frontmatter: pages carry `title` + `description` only
- Trailing-slash canonical URL form (`build.format: 'directory'`) — all internal links must match
- Tables for decision surfaces; inline code in backticks always; limitations stated as settled decisions with rationale (see CLAUDE.md docs conventions)
- Docs error contract convention: every MCP tool returns `{"error": "..."}` rather than raising

### Integration Points
- Any page add/retire → `design/url-contract.json` edit in the same commit (verify-build V2)
- Retires → `astro.config.mjs` redirects entry in the same commit (SITE-06 discipline)
- brand-logo.html font fix → remove the V4 exclusion in `scripts/verify-build.mjs`
- `llms.txt` (02-05) lands in `public/` and must be added to the contract or explicitly excluded from V2's page walk (it's not HTML — confirm V2 scope during planning)

</code_context>

<specifics>
## Specific Ideas

- Quickstart shape is locked by DOCS-01: why → install → `jarvis index` → register per client → first tool call, with expected output and "you'll know it works when…" shapes inline at every step
- The existing quickstart's direct, second-person tone is the voice baseline for all new journey content
- Success/failure shapes should show the failure case too, not just success ("you'll know it broke when…")

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-Docs Rebuild — Tutorial-First Content*
*Context gathered: 2026-08-21*
