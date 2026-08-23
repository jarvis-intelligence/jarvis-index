# Phase 4: Plugin Skills Realignment & Release - Research

**Researched:** 2026-08-23
**Domain:** Plugin skill content, manifest versioning, git tagging
**Confidence:** HIGH — all claims from in-repo file reads this session

## Summary

Phase 4 is small and mechanical: realign three SKILL.md files + tool-roster.md + three openai.yaml sidecars against the rebuilt docs (vocabulary, links, command shapes), then ship a synchronized release (triple manifest bump 0.7.2→0.7.3, Cursor validator, tag `v0.7.3`). No new files, no new tooling, no external packages. The research identifies 1 blocking fix (CLAUDE.md reference), 1 stale field shape (getIndexStatus in tool-roster), ~8 vocabulary drifts, and 2 manifest description updates needed.

**Primary recommendation:** Fix the tool-roster `getIndexStatus` shape and CLAUDE.md reference first (load-bearing correctness), then batch the vocabulary/link/prose alignment, then bump+validate+tag in one pass.

## User Constraints

Copied verbatim from CONTEXT.md:

- Links to repo files **for reading** (skill references, examples, deep links) resolve at tag `v0.7.3` — never `main`
- The functional `setup.sh` install command keeps `main`: it is the canonical install URL on every surface
- Docs-site references use absolute URLs (`https://jarvis-intelligence.github.io/jarvis-index/docs/…`); repo tag URLs only for file-level references
- Tag name: `v0.7.3`, matching the manifest version exactly
- Adopt the settled voice verbatim: "structural code intelligence", "locally on your machine", "9 tools", honest tier gating
- Tool-call examples in skills mirror the rebuilt docs' fixture transcripts (same shapes)
- `references/tool-roster.md`: verify shapes against the Phase-2 tool pages; fix only actual drift
- `jarvis-issues`: minimal touch — update links/URLs only; the `gh issue create` confirmation flow stays
- Phase creates AND pushes git tag `v0.7.3` after validation passes
- Definition of done: all three manifests at 0.7.3; Cursor validator passes; `diff plugin/.mcp.json plugin/mcp.json` empty; zero `main` links in reading references
- Claude's Discretion: exact prose tightening in the three SKILL.md files as long as vocabulary and link policy hold

## Project Constraints (from CLAUDE.md)

- `setup.sh` is NEVER edited here — synced from private repo
- Any change under `plugin/` REQUIRES synchronized version bump in all three manifests
- `plugin/.mcp.json` and `plugin/mcp.json` are duplicated real files — edit both or neither
- `--from jarvis-mcp>=0.6.0` floor never changes; never add `[semantic]` extra to the plugin MCP configs
- Cursor validator: marketplace/plugin `name` must match and be lowercase kebab-case
- Conventional commits, no AI attribution
- Marketplace files carry no version — they are NOT part of the bump scope

## 1. URL Inventory (file:line → classification)

### Reading links (must retarget from `main` to `v0.7.3` tag or docs-site absolute)

| File | Line | URL | Classification | Action |
|------|------|-----|----------------|--------|
| `jarvis-setup/SKILL.md` | 16 | `https://docs.astral.sh/uv/` | External docs link | Keep as-is (not a repo link) |
| `.codex-plugin/plugin.json` | 35 | `…/blob/main/plugin/README.md#privacy` | Repo file link for reading | Retarget `main` → `v0.7.3` |
| `.codex-plugin/plugin.json` | 36 | `…/blob/main/plugin/LICENSE` | Repo file link for reading | Retarget `main` → `v0.7.3` |

### Functional commands (stay at `main`)

| File | Line | URL | Classification | Action |
|------|------|-----|----------------|--------|
| `jarvis-setup/SKILL.md` | 22 | `…/jarvis-index/main/setup.sh` | Functional install command | **Keep `main`** |

### No other URLs exist in the skill files or tool-roster. The `jarvis-use/SKILL.md` and `jarvis-issues/SKILL.md` contain zero URLs. `tool-roster.md` contains zero URLs.

[VERIFIED: grep for `https?://` across `plugin/skills/` returned only the two hits above; read of `.codex-plugin/plugin.json:35-36` confirmed the blob/main links]

## 2. CLAUDE.md Reference at jarvis-setup:31

**Line:** `plugin/skills/jarvis-setup/SKILL.md:31`
**Current text:** `See CLAUDE.md for the detail.`
**Problem:** CLAUDE.md does not ship in the plugin — users installing via marketplace never see it. This is the exact bug SKIL-01 targets.

**Replacement:** The content that CLAUDE.md's language-support section would show is now at the docs site: `https://jarvis-intelligence.github.io/jarvis-index/docs/guide/requirements/`. That page has the language-support matrix (4 nav families / 10 search-only) and the Android/Gradle + Kotlin version caveats that the current sentence alludes to. The fix replaces the CLAUDE.md reference with a docs-site deep link.

**Concrete replacement for line 31:** Replace `See CLAUDE.md for the detail.` with `See [Requirements & Limits](https://jarvis-intelligence.github.io/jarvis-index/docs/guide/requirements/) for the full language-support matrix and caveats.`

[VERIFIED: `src/content/docs/docs/guide/requirements.md:8-23` contains the matrix; CONTEXT.md code_context explicitly names this as the replacement target]

## 3. Vocabulary Drift

### Settled voice (from CONTEXT.md decisions)

- "structural code intelligence" (not "code-intelligence MCP server")
- "locally on your machine" (not used yet in skills — quickstart uses this phrasing)
- "9 tools" (used once in jarvis-setup troubleshooting, not in opening descriptions)
- Honest tier gating: `semanticSearch` requires `[semantic]` extra + reindex; `typeHierarchy` requires fork-built scip + reindex

### Concrete mismatches found

| File | Line | Current | Settled voice | Fix |
|------|------|---------|---------------|-----|
| `jarvis-setup/SKILL.md` | 3 | "local-first code-intelligence MCP server" | "local-first structural code intelligence" | Update frontmatter `description` |
| `jarvis-use/SKILL.md` | 3 | No mention of "structural" or "locally" | Add "structural code intelligence" | Consider adding to `description` |
| `jarvis-issues/SKILL.md` | 3 | No positioning language | No change needed (issue-filing scope) | — |
| Three manifest `description` fields | `.claude-plugin/plugin.json:3`, `.cursor-plugin/plugin.json:5`, `.codex-plugin/plugin.json:4` | "Local-first SCIP code navigation and Zoekt search…" | Should include "structural code intelligence" | Update all three in sync with version bump |
| Two marketplace `description` fields | `.claude-plugin/marketplace.json:4`, `.cursor-plugin/marketplace.json:8` | "Local-first code intelligence for Claude Code/Cursor…" | Already close; minor tighten | Optional — marketplace files carry no version, low urgency |
| `jarvis-use/openai.yaml` | 4 | "structural code questions via SCIP navigation (definition, references, call hierarchy) and search" | Already uses "structural" | No change |
| `jarvis-setup/openai.yaml` | 3 | "Install and configure jarvis for Codex" | No positioning language needed | No change |

[VERIFIED: grep results above + read of all three manifests + read of all three openai.yaml files]

## 4. Command/Example Drift

### `--python 3.13` in jarvis-issues

**File:** `jarvis-issues/SKILL.md:20`
**Current:** `uv run --python 3.12 --with jarvis-mcp python3 -c "…"`
**Docs say:** Python 3.12+ as floor (`requirements.md:32`), but `semantic-search.md:18` shows `uvx --python 3.13` specifically for the semantic extra. The `--python 3.12` in jarvis-issues is for the version-check one-liner, not the semantic extra — this is fine. The `3.12` pin is correct for general use. No drift.

[VERIFIED: `src/content/docs/docs/guide/requirements.md:32` says "Python 3.12+"; `src/content/docs/docs/tools/semantic-search.md:18` shows `--python 3.13` only for the semantic registration]

### setup.sh flags

**Skills say:** `--only <name>`, `--force`, `--help` (`jarvis-setup/SKILL.md:25`)
**Quickstart says:** `--force`, `--only <name>` (`quickstart.mdx:27-28`)
**Match:** Identical. No drift.

### `uv tool install jarvis-mcp` / uvx cold-start advice

**jarvis-setup/SKILL.md:35** explains the cold-start problem and `uv tool install jarvis-mcp` as the fix.
**quickstart.mdx:53-54,105-106** says the same thing.
**Match:** Aligned. No drift.

### getIndexStatus example shapes

**tool-roster.md:26-28** returns `{"repo", "indexed", "status", "freshness", "searchCoverage", "searchCoverageReason"}` — **missing `last_index_run` and `capabilities`**.
**Docs page `get-index-status.md:25-46`** returns those fields plus `last_index_run` (with `outcome`, `origin`, `reason`, `recovery`) and `capabilities` (with `navigation`, `search`, `semantic` sub-objects).

**This is actual drift.** The tool-roster's `getIndexStatus` return shape is stale — it predates the `last_index_run` and `capabilities` fields added in jarvis 0.6.x. The field names `freshness` and `searchCoverage` are still correct.

### Other tool shapes

**goToDefinition:** tool-roster says `"definitions": [{...}], "freshness": {...}`. Docs page shows `"symbol", "resolvedSymbol", "definitions": [{"path", "range": {"start": {"line", "character"}, "end": {"line", "character"}}}], "commit", "generated_at", "stale", "freshness", "checked_at"`. The tool-roster's `{...}` placeholder is deliberately compact (loaded on demand), but the freshness structure has changed — the docs show flat fields (`stale`, `freshness`, `commit`, `generated_at`, `checked_at`) rather than a nested `freshness` object. The skill's "Freshness field" section at the bottom still references a `freshness` object. **Mild drift** — the prose description at tool-roster.md:42-44 says "a `freshness` object" but the actual return is now flat fields.

[VERIFIED: `src/content/docs/docs/tools/go-to-definition.md:23-38` shows flat freshness fields; `src/content/docs/docs/tools/get-index-status.md:25-46` shows `last_index_run` and `capabilities`]

## 5. tool-roster.md Drift vs Phase-2 Tool Pages

| Field/shape | tool-roster.md | Phase-2 docs page | Verdict |
|-------------|----------------|-------------------|---------|
| `getIndexStatus` return | Missing `last_index_run`, `capabilities` | Has both (`get-index-status.md:35-45`) | **Fix: add these fields** |
| `getIndexStatus` `freshness` | Nested `freshness` object implied | Flat fields: `stale`, `freshness`, `commit`, `generated_at`, `checked_at` | **Fix: update Freshness field section** |
| `typeHierarchy` | Says "Returns an `error` on real indexes" | Docs page confirms this is for old scip; new fork-fixed scip makes it work | **Fix: update the caveat** |
| Error contract | `{"error": "..."}` | Same (`go-to-definition.md:70-84`) | Aligned |
| `semanticSearch` `sources` field | Described in detail | Docs page matches | Aligned |
| `blastRadius` `freshness: unknown` | Documented | Docs page matches | Aligned |
| `goToDefinition`/`findReferences`/`callHierarchy` return shapes | `{...}` placeholders | Full shapes in docs | Acceptable — tool-roster is a compact reference, not a full spec |

[VERIFIED: read of `plugin/skills/jarvis-use/references/tool-roster.md` full file; read of `src/content/docs/docs/tools/get-index-status.md` and `go-to-definition.md`]

## 6. Version Bump Mechanics

### Three manifest files (MUST all carry identical `version`)

| File | Current version | Structure | Version field path |
|------|----------------|-----------|-------------------|
| `plugin/.claude-plugin/plugin.json` | `"0.7.2"` (line 4) | `{name, description, version, author, homepage, repository, license, keywords}` | Top-level `version` |
| `plugin/.cursor-plugin/plugin.json` | `"0.7.2"` (line 4) | Same + `displayName`, `logo`, `category`, `tags`, `skills`, `mcpServers` | Top-level `version` |
| `.codex-plugin/plugin.json` | `"0.7.2"` (line 3) | Same + `interface` block with `longDescription`, `capabilities`, `defaultPrompt`, `websiteURL`, `privacyPolicyURL`, `termsOfServiceURL`, `brandColor`, `composerIcon`, `logo`, `screenshots` | Top-level `version` |

### Other version carriers

| File | Version field | Current value | In scope? |
|------|---------------|---------------|----------|
| `jarvis-setup/SKILL.md` | frontmatter `version:` | `"0.1.0"` (line 4) | No explicit decision to bump — these track independently per CLAUDE.md conventions |
| `jarvis-use/SKILL.md` | frontmatter `version:` | `"0.1.0"` (line 4) | Same |
| `jarvis-issues/SKILL.md` | frontmatter `version:` | `"0.1.0"` (line 4) | Same |
| `agents/openai.yaml` (×3) | No version field | N/A | Not versioned |
| `.claude-plugin/marketplace.json` | No version field | N/A | Out of scope (CONTEXT: "marketplace files carry no version") |
| `.cursor-plugin/marketplace.json` | No version field | N/A | Out of scope |

### Cursor validator command (verbatim from deployment-guide)

```bash
curl -fsSL https://raw.githubusercontent.com/cursor/plugin-template/main/scripts/validate-template.mjs \
  -o /tmp/validate-template.mjs && node /tmp/validate-template.mjs
```

[VERIFIED: `docs/deployment-guide.md:47-49` — exact command with backslash line continuation]

### check-manifests.mjs validation

The script at `scripts/check-manifests.mjs` performs three checks:
1. All three manifest files parse as valid JSON (lines 26-41)
2. All three declare the same `version` value (lines 43-53)
3. `plugin/.mcp.json` and `plugin/mcp.json` are byte-identical (lines 55-62)

It exits 0 with `"ok: 3 manifests agree on version, MCP config pair byte-identical"` or exits 1 with specific failure messages. Wired in CI at `.github/workflows/checks.yml:41-42` as `node scripts/check-manifests.mjs`.

[VERIFIED: `scripts/check-manifests.mjs` full file read; `.github/workflows/checks.yml:41-42`]

## 7. Release/Tag Mechanics

### Git remote setup

- Remote: `origin` → `git@github.com-phuongddx:jarvis-intelligence/jarvis-index.git`
- Active `gh` auth account: `phuongddx` with scopes including `repo` (full push access)
- The `phuongddx` account is the org admin for `jarvis-intelligence/jarvis-index` per CONTEXT.md blocker notes

### Prior tags

Only two tags exist, both for binary release assets (not plugin releases):
- `scip-56791658a873`
- `zoekt-33f1f18af292`

**No prior `v*` release tags exist.** `v0.7.3` will be the first version tag on this repo. This means the tag-and-push step has no precedent to conflict with.

### Tag creation and push

```bash
git tag v0.7.3
git push origin v0.7.3
```

SSH remote (`github.com-phuongddx` host) handles auth via SSH key. The `phuongddx` account has `repo` scope. No special token or GITHUB_TOKEN env var needed for tag pushes over SSH.

[VERIFIED: `git tag -l` output; `git remote -v` output; `gh auth status` output]

## Validation Architecture

Per-task verification checks for the plan:

### Task: Fix CLAUDE.md reference (SKIL-01)
- `grep -rn 'CLAUDE\.md' plugin/skills/` → must return zero matches
- Read the replacement line to confirm it contains `https://jarvis-intelligence.github.io/jarvis-index/docs/guide/requirements/`

### Task: Vocabulary realignment (SKIL-02)
- `grep -rn 'code-intelligence MCP server' plugin/skills/` → zero matches
- `grep -rn 'structural code intelligence' plugin/skills/` → at least one match (jarvis-setup description)

### Task: Link policy (SKIL-02)
- `grep -rn 'blob/main/' plugin/skills/` → zero matches
- `grep -rn 'blob/main/' .codex-plugin/` → zero matches (after retarget)
- `grep -rn 'jarvis-index/main/setup.sh' plugin/skills/` → exactly one match (the functional install command at jarvis-setup:22)

### Task: Sync commands/examples with docs (SKIL-03)
- Read tool-roster.md `getIndexStatus` section → must contain `last_index_run` and `capabilities` fields
- Read tool-roster.md `typeHierarchy` section → caveat must reflect fork-fixed scip, not "always errors"

### Task: Version bump (SKIL-04)
- `node scripts/check-manifests.mjs` → exits 0, prints `"ok: 3 manifests agree on version, MCP config pair byte-identical"`
- `jq '.version' plugin/.claude-plugin/plugin.json plugin/.cursor-plugin/plugin.json .codex-plugin/plugin.json` → all three print `"0.7.3"`
- `diff plugin/.mcp.json plugin/mcp.json` → empty output

### Task: Cursor validator (SKIL-04)
- Run the validator command from `docs/deployment-guide.md:47-49` → expect `"Validation passed."`

### Task: Tag and push
- `git tag -l 'v0.7.3'` → tag exists locally
- After push: `gh api repos/jarvis-intelligence/jarvis-index/git/refs/tags/v0.7.3` → 200

## Recommendation Summary

1. **Fix CLAUDE.md reference** at jarvis-setup:31 → docs-site `/guide/requirements/` link (SKIL-01, blocking)
2. **Update tool-roster `getIndexStatus`** to add `last_index_run` and `capabilities` fields; update `typeHierarchy` caveat; update Freshness section to reflect flat fields (SKIL-03, correctness)
3. **Batch vocabulary/link alignment** across all three SKILL.md files + manifest descriptions + Codex interface `blob/main` URLs (SKIL-02, prose)
4. **Triple manifest bump to 0.7.3**, run `check-manifests.mjs`, run Cursor validator, create+push tag `v0.7.3` (SKIL-04, release)
5. **No other files need changes** — MCP configs, marketplace files, setup.sh, and openai.yaml sidecars are all already correct or out of scope

## RESEARCH COMPLETE

Phase 4 is a 5-file content edit + 3-file version bump + 1 tag. The only load-bearing correctness fix is the stale `getIndexStatus` return shape in tool-roster.md (missing `last_index_run`/`capabilities`); everything else is vocabulary/link alignment and release mechanics. The CLAUDE.md reference is a user-facing bug but trivially fixed. No external dependencies, no new tooling, no risk to MCP configs or marketplace files.
