# Phase 6: Plugin & Skills Enhancement - Context

**Gathered:** 2026-09-11
**Status:** Ready for planning
**Provenance:** NOT produced by `/gsd-discuss-phase`. Assembled by the plan-phase orchestrator from
three read-only scout audits (`06-EVIDENCE.md`) plus two scope decisions the user answered directly
at the plan-phase gate. The user explicitly signed off on this substitute at the step-4 CONTEXT gate.
Decisions below are therefore split into **evidence-backed** (a cited `path:line` fact forces them)
and **`[INFERENCE]`** (the orchestrator chose; the user did not state a preference). Treat every
`[INFERENCE]` as challengeable during planning.

<domain>
## Phase Boundary

Make the shipped plugin surface true to jarvis **0.9.1** and mechanically hard to un-true.

In scope: the three plugin skills (`jarvis-setup`, `jarvis-use`, `jarvis-issues`), all five
manifests (`plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`,
`.codex-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`),
both MCP configs, `plugin/README.md`, root `README.md`, the absent plugin capabilities
(`commands/`, `hooks/`, plugin-root `agents/*.md`), the CI guards under `scripts/` +
`.github/workflows/checks.yml`, and one synchronized tagged release.

Out of scope: the Astro docs site content and its `verify-build.mjs` dimensions (Phases 1-3 own it,
except where a docs page states a tool count that this phase's guard proves wrong); the `../jarvis`
server repo itself (its own stale counts in `AGENTS.md` / `docs/` are a separate repo's problem);
Codex portable-packaging normalization (see `<deferred>`).

</domain>

<decisions>
## Implementation Decisions

### Tool-set truth (the 0.9.0 → 0.9.1 drift)

- **D-01:** The canonical tool set is the **10 tools registered in `../jarvis/src/jarvis/server.py`**
  — `documentSymbols` (:416), `goToDefinition` (:439), `findReferences` (:461), `callHierarchy`
  (:483), `typeHierarchy` (:505), `getIndexStatus` (:567), `indexRepo` (:594), `searchCode` (:708),
  `semanticSearch` (:767), `blastRadius` (:788). Every count and list on the shipped surface must
  state ten and name `indexRepo`. Known-wrong today: `.codex-plugin/plugin.json:25`
  ("through nine MCP tools") and root `README.md:20` ("Nine MCP tools" + a 9-row table with no
  `indexRepo` row). Already correct and must stay correct: `plugin/README.md:3`,
  `plugin/skills/jarvis-use/references/tool-roster.md` (all 10 covered).
- **D-02:** The skills must teach the 0.9.1 behaviours that 0.9.0-era copy predates:
  the always-on **tree-sitter syntax baseline** (17 grammars, `../jarvis/src/jarvis/syntax.py:51-69`)
  and that `syntax:` identifiers resolve only through `goToDefinition` (`server.py:441-445`,
  rejected at `:464-467`, `:486-489`, `:510-515`); that **SCIP failure now degrades automatically**
  to exit-0 `degraded` and the `--search-only` flag is *removed and hard-rejected*
  (`index_cli.py:1953-1963`) — no skill may present a search-only "mode"; that
  **`universal-ctags` is an index-time prerequisite for `sym:` queries** and its absence silently
  degrades `sym:` only until reindex (`setup.sh:634-641`); and that `indexRepo` is the recovery tool
  named in miss errors — `jarvis-setup` currently never mentions it.
- **D-03:** The `jarvis-mcp` floor moves off `>=0.9.0` to the released server version
  (**0.9.1**, `../jarvis/pyproject.toml:16`) in `plugin/mcp.json:7` **and** `plugin/.mcp.json:7`
  — both, in the same commit, preserving byte-identity — plus every prose pin
  (`plugin/README.md:74,75,82`, `jarvis-setup/SKILL.md:85`, `jarvis-use/SKILL.md:65,66`).

### URL and tag correctness

- **D-04:** No shipped URL may 404. `.codex-plugin/plugin.json:39-40` pin
  `privacyPolicyURL`/`termsOfServiceURL` at `blob/v0.9.0/...` — **that tag does not exist**
  (upstream tags: `v0.8.0`, `v0.7.3`, plus binary pins); both URLs return HTTP 404 today. The phase
  must make them resolve, and the release ordering (D-14) must make them resolve *at release time*,
  not only after some later tag appears.
- **D-05:** The installer command URL stays on `main`
  (`jarvis-setup/SKILL.md:22`, `raw.githubusercontent.com/.../main/setup.sh`) while *reading* links
  pin to tags — this is the Phase 4 precedent (ROADMAP.md Phase 4 plan 04-01), not an oversight.
  Do not "fix" it to a tag.

### New plugin capabilities (user-selected scope: "+ new plugin capabilities")

- **D-06:** Ship **slash commands** under `plugin/commands/` for indexing and status — the two
  actions `.codex-plugin/plugin.json:33-37` already advertises as `defaultPrompt`
  ("Index this repo for code navigation."). Claude Code discovers `commands/*.md`; Cursor
  auto-discovers `commands/*.{md,mdc,markdown,txt}`; Codex documents no `commands/` component and
  will ignore them. **AMENDED 2026-09-11 by research C-3:** the cross-client interference worry was
  unfounded — each client reads only its own manifest, so a `commands` declaration in one is
  invisible to the others. The real hazard is *intra*-client replace-vs-extend (in Claude Code a
  `commands` field REPLACES the default scan), avoided by declaring nothing in any manifest and
  relying on default discovery.
- **D-07:** Ship a **SessionStart stale-index hook** so the skills' prefer-jarvis rule
  (`jarvis-use/SKILL.md:43-53`) becomes enforced rather than aspirational. The signal already
  exists: `getIndexStatus` returns `status`/`freshness` including `stale` (`server.py:587-589`).
  **AMENDED 2026-09-11 by research C-2 (measured):** two hook files are required, not one — Claude
  Code and Codex share a PascalCase `SessionStart` / nested `hooks[] {type,command}` schema and
  both default-discover `hooks/hooks.json`, while Cursor uses camelCase `sessionStart` with flat
  `{command}`. A merged single file fails `claude plugin validate --strict` with exit 1. Ship
  `plugin/hooks/hooks.json` (Claude + Codex, auto-discovered, no manifest field) plus a
  Cursor-shaped file declared via `"hooks"` in `plugin/.cursor-plugin/plugin.json`, both driving one
  shared POSIX `sh` script. The hook must degrade silently when jarvis is not installed
- **D-08:** Ship a **navigator subagent** as a plugin-root `agents/*.md` for multi-hop structural
  questions (`goToDefinition` → `callHierarchy` → `blastRadius`). This is additive to the three
  existing per-skill Codex `agents/openai.yaml` UI stubs
  (`plugin/skills/*/agents/openai.yaml`), which stay as they are. Claude plugin agents do **not**
  support `hooks`/`mcpServers`/`permissionMode` in frontmatter.
- **D-09:** Add `$schema` for editor validation. **AMENDED 2026-09-11 by research C-1 (verified):**
  scope is `plugin/.claude-plugin/plugin.json` only, using
  `https://json.schemastore.org/claude-code-plugin-manifest.json` (documented, returns 200,
  `additionalProperties` unset, ignored by Claude Code at load). Optionally
  `.claude-plugin/marketplace.json` too. Do **not** add the Agent Plugins `$schema` to
  `.codex-plugin/plugin.json`: that schema is `additionalProperties: false` and its property set
  excludes the `skills` (`:21`) and `interface` (`:22-45`) keys the file already carries, so the
  declaration would make the file invalid against the schema it advertises. Cursor documents no
  `$schema` field and publishes no plugin.json schema URL.
- **D-10:** Apply progressive disclosure to `jarvis-setup`: move its troubleshooting table
  (`jarvis-setup/SKILL.md:81-92`) into `plugin/skills/jarvis-setup/references/`, matching the
  `jarvis-use` → `references/tool-roster.md` pattern already in the tree.
- **D-11:** Remove the off-spec `version: "0.1.0"` frontmatter key from all three SKILL.md
  (`:4` in each). The Agent Skills allowed set is exactly `name`, `description`, `license`,
  `compatibility`, `metadata`, `allowed-tools`. **AMENDED 2026-09-11 by research (Target 4 + C-8):**
  delete the key outright — do **not** relocate it to `metadata.version`, which would mint a fourth
  version string with no consumer that guard D-12(b) would then have to track. Additionally
  `.claude/CLAUDE.md:129,136,269` and `docs/code-standards.md` currently *mandate* the key this
  decision removes; fixing those two convention files is in scope, or the next contributor re-adds
  exactly what the new guard rejects.

### CI guards (every drift class this phase fixes)

- **D-12:** Each drift class fixed above gets an **automated check**, extending
  `scripts/check-manifests.mjs` or a sibling script wired into
  `.github/workflows/checks.yml`. Minimum guard set: (a) tool roster ↔ `../jarvis` server tool
  registrations; (b) manifest `version` ↔ MCP-config pin ↔ referenced-tag existence;
  (c) both `marketplace.json` files parse and their `plugins[].source` paths resolve — today
  neither file is checked at all (`MANIFEST_PATHS` covers only the three `plugin.json`);
  (d) SKILL.md frontmatter contains only Agent-Skills-allowed keys.
- **D-13:** Follow the repo's established **red-before-green** discipline for new assertions
  (`verify-build.mjs`'s V-dimensions and `check-manifests.mjs`'s three failure modes were each
  demonstrated red on scratch copies before being trusted — MILESTONES.md v0.7.3). Every new check
  must be shown failing against the pre-fix state before it is trusted passing.
- **D-14:** The `checks.yml` path filter must cover every newly guarded path. `setup.sh` is absent
  from it today, so installer claims in the skills are unvalidated on change.

### Release

- **D-15:** Land the phase as **one synchronized release**: all three `plugin.json` versions agree,
  `plugin/.mcp.json` stays byte-identical to `plugin/mcp.json`, the Cursor submission checklist
  passes (unique kebab-case name, relative paths with no `..`, committed logo, README documents
  usage), and the **git tag the manifests reference is created and pushed** — closing D-04.
- **D-16:** **RESOLVED 2026-09-11 by the user:** version target `0.9.0` → **`0.9.1`**, mirroring the
  server version so the plugin number and the `jarvis-mcp` floor it pins read as one fact. The
  accepted cost is semver-honesty: this release adds capability surfaces (commands, hooks, agent)
  while wearing a patch number. Consequences that bind the planner: the tag is `v0.9.1`,
  `.codex-plugin/plugin.json:39-40` become `blob/v0.9.1/...`, and guard P2a asserts the
  manifest-version ↔ MCP-pin ↔ tag triple at `0.9.1`. Research verified GitHub does **not** serve
  `blob/<tag>` before the tag is pushed (`blob/v0.9.0/...` → 404 vs `blob/v0.8.0/...` → 200), so the
  URL-resolution check is a post-tag release gate and can never be a PR-time check.
- **D-17:** `[INFERENCE]` Adopt `claude plugin validate --strict` as an additional vendor guard with
  a **pinned** `@anthropic-ai/claude-code` version in CI. Rationale: research measured it as the
  only thing that catches hooks-schema drift (it emits `hooks.<name>: unknown hook event` + exit 1),
  while also measuring that it does **not** report unknown SKILL.md frontmatter keys — so it
  supplements, never replaces, the hand-rolled D-12(d) guard. Pinning keeps a dependency-free repo's
  CI from breaking on a vendor release. Research open question 7 raised the tradeoff; taking the
  recommended side.
- **D-18:** `[INFERENCE]` Re-verify `jarvis-issues`' five documented limitations
  (`plugin/skills/jarvis-issues/SKILL.md:27-31`: unpatched-scip typeHierarchy, `config.py`
  single-tenant pins, one-language-per-repo, `blastRadius` freshness, Windows) against 0.9.1 and
  correct any that no longer hold. Research explicitly left this out of D-01/D-02 as a possible
  scope addition (open question 8); folding it in because a skill that files issues against stale
  limitations generates false bug reports, which is the same truth failure the phase exists to fix.

### Claude's Discretion

- Exact slash-command names, file names, and argument shapes (D-06) beyond "one for indexing, one
  for status".
- Hook implementation mechanics (D-07): script vs inline command, exact staleness threshold, and
  how silence-when-absent is achieved.
- Navigator subagent frontmatter tuning — model, effort, tool allow-list (D-08).
- Whether new guards live in `check-manifests.mjs` or a new sibling script, and their dimension
  naming (D-12).
- Wording of all user-facing copy, provided D-01/D-02 facts survive intact.

</decisions>

<specifics>
## Specific Ideas

- The repo already has the pattern to copy for guards: zero-dependency Node assertion scripts
  (`scripts/check-manifests.mjs`, `scripts/verify-build.mjs`) with numbered dimensions, no test
  framework, wired into a path-filtered workflow. New guards should look like those, not like a new
  toolchain.
- `plugin/skills/jarvis-use/SKILL.md:41` loads its reference file with an explicit
  `grep -nA20 "## Tool detail" references/tool-roster.md` — keep that on-demand style for D-10's new
  reference file rather than inlining or auto-loading it.
- `jarvis-use/SKILL.md:75-76` trigger examples use Python function names (`index_repo`,
  `blast_radius`) where the MCP tool names are camelCase (`indexRepo`, `blastRadius`) — small, but
  it is the exact class of error D-12(a) is meant to catch.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Evidence behind every decision above
- `.planning/phases/06-plugin-skills-enhancement/06-EVIDENCE.md` — the three scout audits in full:
  §A jarvis server ground truth (versions, 10 tools with params + gating, full CLI surface, every
  `JARVIS_*` env var, binary prerequisites, language tiers, error contract, stale-count inventory);
  §B plugin/skills surface audit (per-skill inventory, tool-mention matrix, version + URL
  inventory with the dead-tag finding, structural inventory of absent capabilities, manifest
  cross-check, CI coverage, and a `## Not caught by CI` list of 11 items);
  §C best-practice audit vs official Claude/Cursor/Codex/Agent-Skills docs (manifest schemas with
  source URLs, skill-authoring rules, gap table, ranked additions, validator rejection risks).
  Each section carries its own unknowns list — those are researcher input, not settled fact.

### Server source of truth (read, never edit — different repo)
- `../jarvis/src/jarvis/server.py` — the 10 `@mcp.tool` registrations, capability-error contract
  (`{error, requiredCapability, reason, recovery}`), and per-tool gating.
- `../jarvis/src/jarvis/index_cli.py` — CLI subcommands/flags; removed-option rejection
  (`--search-only`) at `:1953-1963`.
- `../jarvis/src/jarvis/syntax.py:51-69` — the 17 tree-sitter grammars behind the syntax baseline.
- `../jarvis/pyproject.toml:16`, `../jarvis/server.json:9,14` — released version (0.9.1).

### This repo's shipped surface
- `plugin/skills/{jarvis-setup,jarvis-use,jarvis-issues}/SKILL.md` and
  `plugin/skills/jarvis-use/references/tool-roster.md` — what ships today.
- `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`,
  `.codex-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`,
  `plugin/mcp.json`, `plugin/.mcp.json` — the five manifests and dual MCP config.
- `scripts/check-manifests.mjs`, `.github/workflows/checks.yml` — the only existing plugin guard.
- `.planning/ROADMAP.md` Phase 4 — the prior skills-realignment + synchronized-release precedent
  this phase extends (tag-pinned reading links, installer stays `main`, dual-config diff as DoD).

### External contracts (cited with URLs inside `06-EVIDENCE.md` §C)
- Claude Code plugins reference + plugin marketplaces; Cursor plugins reference + submission
  checklist; OpenAI Codex build/plugins + build/skills + deploy/submission-errors; agentskills.io
  specification. Consult these before inventing a manifest field or a component directory.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/check-manifests.mjs` — already asserts JSON-parse (×3), cross-manifest `version`
  equality, and `plugin/.mcp.json` ≡ `plugin/mcp.json`. The natural host for D-12's new dimensions.
- `scripts/verify-build.mjs` — the numbered-dimension assertion style (V2, V3, V10…) to imitate.
- `plugin/skills/jarvis-use/references/tool-roster.md` — the only file that already enumerates all
  10 tools correctly; the obvious single source for a D-12(a) roster ↔ server diff.
- `plugin/skills/*/agents/openai.yaml` — existing Codex interface stubs; the pattern a new agent
  must not collide with.

### Established Patterns
- Path-filtered workflows: `checks.yml` fires only on `plugin/**`, `.codex-plugin/**`,
  `.claude-plugin/**`, `.cursor-plugin/**`, the script, and itself — so any new guarded path must be
  added to the filter or the guard never runs (D-14).
- Synchronized triple-manifest bumps with the dual-config diff as definition of done (Phase 4).
- Red-before-green for new assertions (D-13).

### Integration Points
- `plugin/` is the marketplace `source` for both Claude and Cursor (`./plugin` in both
  `marketplace.json:13`), so anything a marketplace install must see has to live *inside* `plugin/`.
  The Codex overlay at repo root declares `"skills": "./plugin/skills/"` — repo-root-relative —
  which is the unresolved split captured in `<deferred>`. New components (D-06/D-07/D-08) should be
  placed so that Claude and Cursor installs see them without depending on that split's resolution.

</code_context>

<deferred>
## Deferred Ideas

- **Codex portable-packaging normalization** — user explicitly deferred at the plan-phase scope
  gate. `.codex-plugin/plugin.json:21` declares `"skills": "./plugin/skills/"` (repo-root-relative)
  while both marketplaces point at `./plugin`, so for a marketplace install the plugin root is
  `plugin/` and the overlay sits outside the loaded plugin. The Codex validator documents
  `plugin_skills_path_unsupported` ("`skills` must resolve to the root `skills/` directory"). The
  fix (portable root `plugin.json` + `extensions.com.openai`, or an overlay at
  `plugin/.codex-plugin/plugin.json`) is unverifiable without a live
  `codex plugin marketplace add` test. Out of scope; do not half-move it.
- **Codex public universal-directory submission** — closed to local stdio servers by policy
  ("submit the remote HTTPS endpoint… deploy it to a public HTTPS URL"); jarvis is local-first
  stdio. Marketplace/CLI distribution stays the supported path. Nothing to do.
- **Stale 9-tool counts inside the `../jarvis` repo** (`AGENTS.md:10,39`, `docs/index.html:550,568,573`,
  `docs/kilo-vs-jarvis-indexing.md:20,124`, `docs/project-overview-pdr.md:36,108`) — different repo,
  different release train. Report upstream; do not edit from here.
- **Docs-site tool-count sweep** — if D-12(a)'s guard flags docs pages under `src/`, fixing the
  copy is in scope only where the guard fails; a broader docs rewrite belongs to a docs phase.
- **Empty `../jarvis/.claude/skills/codeintel-release/` directory** — leftover from the pre-0.5.0
  rename; upstream cleanup, not this phase.

</deferred>

---

*Phase: 06-plugin-skills-enhancement*
*Context gathered: 2026-09-11*
