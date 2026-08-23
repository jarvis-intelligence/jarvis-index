# Phase 4: Plugin Skills Realignment & Release - Context

**Gathered:** 2026-08-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Realign the three plugin skills (`plugin/skills/jarvis-setup/SKILL.md`, `jarvis-use/SKILL.md`, `jarvis-issues/SKILL.md`, plus `jarvis-use/references/tool-roster.md` and any `agents/openai.yaml` sidecars) with the final positioning vocabulary and the rebuilt docs, then ship one synchronized release: manifests 0.7.2 → 0.7.3 across `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`, git tag `v0.7.3` created and pushed after validation. Out of scope: docs site, landing, setup.sh (owned by the private repo), marketplace files (carry no version).

</domain>

<decisions>
## Implementation Decisions

### Link & Tag Policy
- Links to repo files **for reading** (skill references, examples, deep links) resolve at tag `v0.7.3` — never `main`
- The functional `setup.sh` install command keeps `main`: it is the canonical install URL on every surface (quickstart Step 1, landing hero, README) and pinning it would desync the skills from the docs
- Docs-site references use absolute URLs (`https://jarvis-intelligence.github.io/jarvis-index/docs/…`); repo tag URLs only for file-level references
- Tag name: `v0.7.3`, matching the manifest version exactly

### Content Realignment Scope
- Adopt the settled voice verbatim: "structural code intelligence", "locally on your machine", "9 tools", honest tier gating — `semanticSearch` requires `[semantic]` extra + reindex; `typeHierarchy` requires fork-built scip + reindex
- Tool-call examples in skills mirror the rebuilt docs' fixture transcripts (same shapes — one source of truth with quickstart/tool pages)
- `references/tool-roster.md`: verify shapes against the Phase-2 tool pages (already byte-verified against `../jarvis` source); fix only actual drift
- `jarvis-issues`: minimal touch — update links/URLs only; the `gh issue create` confirmation flow stays

### Release Mechanics
- Phase creates AND pushes git tag `v0.7.3` on this repo after validation passes (docs links at tags require the tag to exist)
- Definition of done: all three manifests at 0.7.3; Cursor marketplace validator passes (documented `curl … node /tmp/validate-template.mjs` command from `docs/deployment-guide.md`); `diff plugin/.mcp.json plugin/mcp.json` empty; zero `main` links in reading references; `npm run check:manifests` green where applicable

### Claude's Discretion
- Exact prose tightening in the three SKILL.md files (opening cross-links, trigger descriptions, frontmatter `description` wording) as long as the vocabulary and link policy above hold

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `plugin/skills/jarvis-setup/SKILL.md` (numbered H2 procedure, troubleshooting table, `/dev/tty` install notes) — the CLAUDE.md reference sits at line 31 ("See CLAUDE.md for the detail") — replace with a docs-site deep link
- `plugin/skills/jarvis-use/SKILL.md` — decision tables, tool matrix, error-contract guidance (`{"error": ...}` check)
- `plugin/skills/jarvis-use/references/tool-roster.md` — 9-tool signature/return reference with `## Tool detail` sections
- `plugin/skills/jarvis-issues/SKILL.md` — gh issue flow with explicit user confirmation before `gh issue create`
- `scripts/check-manifests.mjs` — existing structural manifest checks
- `docs/deployment-guide.md` — documents the Cursor validator command and release smoke test

### Established Patterns
- Skill shape: YAML frontmatter (`name` + `description` + `version`), sibling cross-links on the first body line, tables for decision surfaces
- Any change under `plugin/` REQUIRES the synchronized version bump in all three manifests (delivery mechanism — installed clients only pick up changes when the version rises)
- `plugin/.mcp.json` and `plugin/mcp.json` are duplicated real files — edit both or neither; `--from jarvis-mcp>=0.6.0` floor never changes
- Conventional commits, no AI attribution

### Integration Points
- Git tag `v0.7.3` must point at the release commit (created after validation, pushed with the release)
- Phase-2 docs pages are the URL targets (e.g. `/docs/guide/requirements/`, `/docs/troubleshooting/`)
- The private repo's sync workflow overwrites only `setup.sh` — everything under `plugin/` is safe to edit here

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the accepted grey-area decisions — standard approaches welcome.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
