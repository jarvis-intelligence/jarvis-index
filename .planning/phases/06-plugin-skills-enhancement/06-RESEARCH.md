# Phase 6: Plugin & Skills Enhancement - Research

**Researched:** 2026-09-11
**Domain:** Multi-client agent-plugin packaging (Claude Code / Cursor / Codex), Agent Skills authoring, zero-dependency Node CI guards, synchronized tagged release
**Confidence:** HIGH for targets 1-4, 6, 8 (verified against live docs + live `claude plugin validate` probes + server source); MEDIUM for target 5 (tradeoff, not a fact); MEDIUM for target 7

## Summary

Every open question in the evidence pack that could be closed from docs + code is closed below.
Three findings change the plan materially:

1. **Hooks do not share one schema across the three clients.** Claude Code and Codex use the
   *same* shape (`PascalCase` event names, nested `hooks[]` array of `{type, command}`), and Codex
   even exports `CLAUDE_PLUGIN_ROOT` for compatibility. **Cursor is the outlier** (camelCase
   `sessionStart`, flat `{command}` entries). I proved empirically that a merged file makes
   `claude plugin validate --strict` exit 1 with `hooks.sessionStart: unknown hook event; entry
   ignored at runtime`. The correct layout is one default `hooks/hooks.json` (Claude+Codex) plus a
   Cursor-only file declared through the Cursor manifest's `hooks` path field.
2. **`claude plugin validate` does NOT check SKILL.md / agent / command frontmatter keys.** I ran
   it against a scratch plugin carrying `version:` in SKILL.md, `bogusKey:` in an agent, and
   `version:` in a command — `contents` came back with only the hooks file. So D-12(d) cannot be
   delegated to the vendor validator; it must be a hand-rolled guard. Conversely `claude plugin
   validate --strict --json` *is* a genuinely useful CI guard for manifests, marketplaces, and
   hooks-schema drift, and the `claude` CLI installs from npm.
3. **`$schema` cannot be added to all three manifests (D-09 as written is not implementable).**
   The Agent Plugins 1.0.0 plugin schema declares `additionalProperties: false` and knows nothing
   about `skills` or `interface`, both of which `.codex-plugin/plugin.json` carries at top level.
   Declaring that `$schema` would make the file invalid against the schema it points at. Cursor
   documents no `$schema` field and publishes no schema URL.

**Primary recommendation:** ship `plugin/commands/` (2 flat `.md` skill files), one
`plugin/hooks/hooks.json` (Claude+Codex) + `plugin/hooks/cursor.json` (Cursor, manifest-declared),
one `plugin/agents/jarvis-navigator.md`, strip `version:` from all three SKILL.md, add `$schema`
only to `plugin/.claude-plugin/plugin.json`, build the four guards as one new zero-dep
`scripts/check-plugin.mjs` beside `check-manifests.mjs`, and release as **0.9.1** with the tag
pushed **before** the URL-bearing commit is the release commit (see Target 5).

---

<user_constraints>
## User Constraints (from 06-CONTEXT.md)

### Locked Decisions

- **D-01:** Canonical tool set = the 10 tools registered in `../jarvis/src/jarvis/server.py`.
  Every count and list on the shipped surface must state ten and name `indexRepo`.
- **D-02:** Skills must teach the 0.9.1 behaviours: always-on tree-sitter syntax baseline (17
  grammars); `syntax:` ids resolve only through `goToDefinition`; SCIP failure degrades
  automatically and `--search-only` is removed and hard-rejected; `universal-ctags` is an
  index-time prerequisite for `sym:`; `indexRepo` is the recovery tool named in miss errors.
- **D-03:** `jarvis-mcp` floor moves off `>=0.9.0` to the released server version (0.9.1) in
  `plugin/mcp.json:7` **and** `plugin/.mcp.json:7`, byte-identical, plus every prose pin.
- **D-04:** No shipped URL may 404; `privacyPolicyURL`/`termsOfServiceURL` must resolve *at release
  time*.
- **D-05:** The installer command URL stays on `main`; reading links pin to tags. Do not "fix".
- **D-06:** Ship slash commands under `plugin/commands/` for indexing and status.
- **D-07:** Ship a SessionStart stale-index hook (`hooks/hooks.json`); must degrade silently when
  jarvis is not installed.
- **D-08:** Ship a navigator subagent as a plugin-root `agents/*.md`; additive to the three
  per-skill Codex `agents/openai.yaml` stubs, which stay as they are.
- **D-09:** Add `$schema` to the three `plugin.json` manifests.
- **D-10:** Move `jarvis-setup`'s troubleshooting table into
  `plugin/skills/jarvis-setup/references/`.
- **D-11:** Remove the off-spec `version: "0.1.0"` frontmatter key from all three SKILL.md.
- **D-12:** Each drift class gets an automated check. Minimum set (a) roster ↔ server, (b) manifest
  version ↔ MCP pin ↔ tag existence, (c) both `marketplace.json` parse + `plugins[].source`
  resolve, (d) SKILL.md frontmatter allowed-keys only.
- **D-13:** Red-before-green for every new assertion.
- **D-14:** `checks.yml` path filter must cover every newly guarded path; `setup.sh` is absent today.
- **D-15:** One synchronized release: three manifests agree, dual MCP config byte-identical, Cursor
  submission checklist passes, the referenced git tag created and pushed.
- **D-16:** `[INFERENCE]` version target `0.10.0`; challengeable.

### Claude's Discretion

- Exact slash-command names, file names, and argument shapes (D-06) beyond "one for indexing, one
  for status".
- Hook implementation mechanics (D-07): script vs inline command, staleness threshold, silence
  mechanism.
- Navigator subagent frontmatter tuning — model, effort, tool allow-list (D-08).
- Whether new guards live in `check-manifests.mjs` or a new sibling script, and dimension naming.
- Wording of all user-facing copy, provided D-01/D-02 facts survive intact.

### Deferred Ideas (OUT OF SCOPE)

- Codex portable-packaging normalization (root `plugin.json` + `extensions.com.openai`, or an
  overlay at `plugin/.codex-plugin/plugin.json`).
- Codex public universal-directory submission.
- Stale 9-tool counts inside the `../jarvis` repo.
- Docs-site tool-count sweep beyond what a guard flags.
- Empty `../jarvis/.claude/skills/codeintel-release/` directory.
</user_constraints>

## Project Constraints (from `.claude/CLAUDE.md`)

Directives the planner must honour; all verified present in the file:

| Directive | Source |
|---|---|
| `setup.sh` source of truth is the private repo — **never edited here** | `.claude/CLAUDE.md:16`, `:86` |
| Any `plugin/` change ships only via a synchronized bump in all three `plugin.json` | `.claude/CLAUDE.md:15`, `:131` |
| `plugin/.mcp.json` and `plugin/mcp.json` are duplicated real files — edit both or neither; keep `--from jarvis-mcp>=…` a `>=` floor, never exact-pin, never add `[semantic]` | `.claude/CLAUDE.md:19`, `:132` |
| Marketplace/plugin `name` lowercase kebab-case and identical across `.cursor-plugin/marketplace.json` and `plugin/.cursor-plugin/plugin.json` | `.claude/CLAUDE.md:18`, `:102` |
| No formatter/linter exists; style is convention + review only. JSON manifests 2-space indent | `.claude/CLAUDE.md:106`, `:108` |
| Skills: kebab-case dir + fixed `SKILL.md`; on-demand `references/*.md` over inlining, with an exact retrieval command | `.claude/CLAUDE.md:92`, `:141` |
| Conventional commits; no AI attribution / co-author trailers | `.claude/CLAUDE.md:177` |
| Soft cap 500 lines per doc | `.claude/CLAUDE.md:145` |

**Two CLAUDE.md statements this phase deliberately invalidates** (they are stale, not binding):
- `.claude/CLAUDE.md:129` and `:136` say skill frontmatter is `name` + `description` + **`version`**.
  D-11 removes `version`. The planner must update `.claude/CLAUDE.md` (and `docs/code-standards.md`,
  which it cites) in the same phase, or the convention doc will re-introduce the drift.
- `.claude/CLAUDE.md:17`, `:132`, `:198`, `:298` still say the floor is `>=0.6.0`; `:68` still says
  "currently 0.7.2"; `:204` still says "all 9 MCP tools". These are stale generated snapshots. Only
  fix them where this phase's guards make them false — a full CLAUDE.md regeneration is out of scope.

---

## Target 1 — Slash commands (D-06): format, frontmatter, and cross-client interference

### What each client does with `commands/`

| Client | Reads `commands/`? | Extensions | Frontmatter | Invocation |
|---|---|---|---|---|
| Claude Code | **Yes**, plugin-root `commands/` [CITED: code.claude.com/docs/en/plugins-reference — "File locations reference"] | `.md` ("Skills as flat Markdown files") | Same reference as SKILL.md **except `name` and `paths`** [CITED: code.claude.com/docs/en/skills — "Command files"] | `/plugin-name:command-name` |
| Cursor | **Yes**, plugin-root `commands/`, each file auto-discovered [CITED: cursor.com/docs/reference/plugins — "Cursor Plugin component discovery"] | `.md`, `.mdc`, `.markdown`, `.txt` | `name` + `description` [CITED: same, "Command frontmatter fields"] | — |
| Codex | **No documented `commands/` component.** Portable packages discover **only** `skills/` and `mcp.json`, plus `hooks` and `apps` via `extensions.com.openai` [CITED: developers.openai.com/plugins/build/plugins — "Plugin structure", "Manifest fields"] | — | — | `$skill-name` |

Claude Code's own guidance is *"Commands | `commands/` | Skills as flat Markdown files. **Use
`skills/` for new plugins**"* [CITED: code.claude.com/docs/en/plugins-reference — File locations
reference]. Commands and skills are the same mechanism there: *"Custom commands have been merged
into skills"* [CITED: code.claude.com/docs/en/skills].

### The cross-client interference question — answered: there is none

The premise behind D-06's warning ("a manifest path field replaces folder discovery for that
component, so declaring one must not break the other client") does not apply, because **each client
reads only its own manifest file**:

- Claude Code reads `plugin/.claude-plugin/plugin.json` [VERIFIED: local probe — `claude plugin
  validate ./plugin --json` reported `"target": ".../plugin/.claude-plugin/plugin.json"`].
- Cursor reads `plugin/.cursor-plugin/plugin.json`, or a root `plugin.json` for the Agent Plugins
  format [CITED: cursor.com/docs/reference/plugins — "Supported plugin formats"].
- Codex reads root `plugin.json` (`extensions.com.openai`) or `.codex-plugin/plugin.json` as a
  compatibility fallback [CITED: developers.openai.com/plugins/build/plugins].

So a `commands` path field in the Claude manifest is invisible to Cursor and vice versa. The only
real interference risk is *within* one client: in Claude Code, `commands` **replaces** the default
`commands/` scan, while `skills` **adds** to the default `skills/` scan [CITED:
code.claude.com/docs/en/plugins-reference — "Path behavior rules"]. Cursor is stricter: **any**
declared manifest path replaces folder discovery for that component [CITED:
cursor.com/docs/reference/plugins]. Note `plugin/.cursor-plugin/plugin.json:30` already declares
`"skills": "./skills/"` — which is why Cursor still sees the skills today.

### Recommendation

Declare nothing. Ship the default folder and let all three clients auto-discover:

```
plugin/
  commands/
    index.md      # /jarvis:index  — index or reindex this repo
    status.md     # /jarvis:status — is this repo indexed, fresh, and capable?
```

- **Do NOT add a `commands` field to `plugin/.claude-plugin/plugin.json`.** Default discovery
  already covers `commands/`, and declaring it would replace (not extend) the default scan for zero
  gain, plus trigger the "plugin has both a default folder and the matching manifest key" warning
  [CITED: code.claude.com/docs/en/plugins-reference — Path behavior rules].
- **Do NOT add `commands` to `plugin/.cursor-plugin/plugin.json` either** — auto-discovery covers
  `commands/*.md`, and the existing `"skills"` declaration is unaffected.
- **Do NOT add `commands` to the marketplace entries.** Component fields in a marketplace entry
  conflict with `plugin.json` and produce `Plugin … has conflicting manifests` [CITED:
  code.claude.com/docs/en/plugins-reference — Common validation errors].
- **Codex sees nothing.** Accept that; the Codex entry points stay `$jarvis-setup` / `$jarvis-use`
  and the `interface.defaultPrompt` strings at `.codex-plugin/plugin.json:33-37`.

Frontmatter that satisfies both consumers (Claude Code ignores `name` in a command file; Cursor
requires it — so include it, it is harmless in Claude Code):

```markdown
---
name: index
description: Index or reindex this repository with jarvis so structural queries work.
argument-hint: "[path]"
disable-model-invocation: true
---
```

`argument-hint` and `disable-model-invocation` are Claude Code extensions [CITED:
code.claude.com/docs/en/skills — Frontmatter reference]; Cursor's documented command frontmatter is
`name` + `description` only, and extra keys there are undocumented (see Open Questions).
`disable-model-invocation: true` is right for both commands: the model already has `jarvis-use` for
autonomous work; these are deterministic user-typed entry points.

---

## Target 2 — Hooks (D-07): schema per client, silence, and file layout

### Schemas are two, not three

**Claude Code** — `hooks/hooks.json` in plugin root, or inline in `plugin.json`. PascalCase event
names; matcher group wrapping an inner `hooks[]` array of handlers [CITED:
code.claude.com/docs/en/plugins-reference — Hooks]:

```json
{ "hooks": { "SessionStart": [ { "hooks": [ { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}\"/hooks/jarvis-index-status.sh" } ] } ] } }
```

**Codex** — *the same shape*, default-discovered at `hooks/hooks.json` when the manifest does not
define `hooks` [CITED: developers.openai.com/plugins/build/plugins — Bundled MCP servers and
lifecycle hooks]. Documented example uses `SessionStart`, `type: "command"`, `${PLUGIN_ROOT}`, and
an optional `statusMessage`. Codex *also* sets `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PLUGIN_DATA` "for
compatibility with existing plugin hooks" [CITED: same]. An explicit `hooks` value **replaces**
default-file discovery; it does not add to it [CITED: same].

**Cursor** — `hooks/hooks.json`, camelCase event names, flat handler objects, optional top-level
`"version": 1` [CITED: cursor.com/docs/reference/plugins — Hooks format; cursor.com/docs/hooks]:

```json
{ "version": 1, "hooks": { "sessionStart": [ { "command": "./hooks/jarvis-index-status.sh" } ] } }
```

Cursor's Claude-Code hook compatibility layer (which *does* map `SessionStart` → `sessionStart`)
applies only to `.claude/settings.json` files at project/user scope, **not** to plugin
`hooks/hooks.json` [CITED: cursor.com/docs/reference/third-party-hooks — Configuration Locations].

### Can one file serve all three? Measured: no (cleanly)

I built a scratch plugin whose `hooks/hooks.json` carried both `SessionStart` (Claude shape) and
`sessionStart` (Cursor shape) and ran the real validator:

```
$ claude plugin validate ./plugin --json      → exit 0, warning:
    "hooks.sessionStart: unknown hook event; entry ignored at runtime"
$ claude plugin validate ./plugin --strict --json → exit 1
```
[VERIFIED: local probe, `claude` 2.1.268, 2026-09-11]

So a merged file *works at runtime* in Claude Code (the foreign key is ignored) but permanently
fails `--strict` validation — which is exactly the CI guard this phase wants to adopt. Reject the
merged file.

### Recommended layout

```
plugin/
  hooks/
    hooks.json                 # Claude Code + Codex (PascalCase SessionStart) — auto-discovered
    cursor.json                # Cursor (camelCase sessionStart) — manifest-declared
    jarvis-index-status.sh     # one POSIX sh script, chmod +x, used by both
```

and in `plugin/.cursor-plugin/plugin.json` add exactly one field:

```json
"hooks": "./hooks/cursor.json"
```

That declaration **replaces folder discovery for hooks in Cursor**, so Cursor never parses the
Claude/Codex-shaped `hooks/hooks.json` [CITED: cursor.com/docs/reference/plugins — component
discovery]. Claude Code and Codex both default-discover `hooks/hooks.json` and must **not** get a
`hooks` manifest field (for Codex an explicit value *replaces* discovery; for Claude the merge rule
is undocumented and a manifest field also triggers the ignored-folder warning).

> Caveat I could not close: with `"hooks": "./hooks/claude.json"` declared in the Claude manifest,
> `claude plugin validate` still scanned and warned about the default `hooks/hooks.json` and did not
> list the declared file in `contents` [VERIFIED: local probe]. Whether that reflects runtime merge
> behaviour or only validator scope is undocumented. The recommended layout sidesteps it entirely by
> never declaring `hooks` on the Claude side.

### Silence when jarvis is absent

Claude Code's exit-code contract is the binding constraint [CITED: code.claude.com/docs/en/hooks —
Exit code output]:

- **exit 0 + empty stdout** → completely silent. Stderr from an exit-0 hook "goes to the debug log
  only, never the transcript, and Claude never sees it".
- **any non-zero exit other than 2, with empty or plain-text stdout** → *non-blocking error*: the
  transcript shows a `<hook name> hook error` notice with `Failed with non-blocking status code:`.
  A missing script path lands here too (shell exit 127).
- exit 2 blocks (irrelevant for `SessionStart`, which has no decision control beyond context).

Cursor: exit 0 uses the JSON output, exit 2 blocks, "other exit codes — hook failed, action
proceeds (fail-open by default)" [CITED: cursor.com/docs/hooks — Exit code behavior]. Cursor's
`sessionStart` is fire-and-forget: "the agent loop does not wait for or enforce a blocking
response" [CITED: cursor.com/docs/hooks — sessionStart].

**Therefore the script must always `exit 0`, and print nothing when it has nothing to say.**

```sh
#!/usr/bin/env sh
# jarvis SessionStart probe. Always exits 0 and prints nothing unless it has
# something actionable to say — a non-zero exit or a stray byte becomes a
# visible "hook error" notice in Claude Code at every session start.
command -v jarvis >/dev/null 2>&1 || exit 0      # jarvis CLI not installed → silent
command -v git    >/dev/null 2>&1 || exit 0
git rev-parse --show-toplevel >/dev/null 2>&1 || exit 0
… match `jarvis list` column 5 (path) against the repo root; compare column 4
  (commit) against `git rev-parse HEAD`; print one additionalContext JSON object
  only when the repo is unindexed or the commits differ …
exit 0
```

`jarvis list` is the right probe: it takes no arguments and emits a stable 5-field TSV
`slug \t <glyph> status \t language \t commit \t path`, with a 6th reason field only on
`failed`/`degraded` (`../jarvis/src/jarvis/index_cli.py:1651-1661`). Comparing its `commit` column
to `git rev-parse HEAD` reproduces exactly what `getIndexStatus(repo, repo_path)` does
(`../jarvis/src/jarvis/server.py:569-571`) without needing the MCP server to be connected.

**Do not** fall back to `uvx --from jarvis-mcp …` when the CLI is absent: on a cold cache that
resolves and builds the dependency tree (the documented cause of the 30s connect timeout,
`plugin/skills/jarvis-setup/SKILL.md:86`) and it makes a network call at session start, which
contradicts the local-first claim at `plugin/README.md:88`.

Output, when it does speak, should be Claude/Codex-shaped JSON:

```json
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"jarvis: index for 'foo' is stale (indexed at abc1234, HEAD is def5678). Run `jarvis reindex foo` or call indexRepo before trusting structural results."}}
```

`SessionStart` accepts `hookSpecificOutput.additionalContext` and has "no blocking or decision
control" [CITED: code.claude.com/docs/en/hooks — Decision control table]. Plain-text stdout also
works on `SessionStart`, but JSON is the documented, explicit channel. Cursor's `sessionStart` is
documented for env-var setup and context injection [CITED: cursor.com/docs/hooks — sessionStart];
its exact injection field is not documented on that page, so the Cursor file should point at the
same script and tolerate the output being dropped (see Open Questions).

### Codex trust caveat

"Plugin-bundled hooks are non-managed hooks, so Codex skips them until the user reviews and trusts
the current hook definition" [CITED: developers.openai.com/plugins/build/plugins]. The hook is
therefore inert in Codex until a user accepts it — worth one sentence in `plugin/README.md`.

---

## Target 3 — Navigator subagent (D-08): frontmatter contract and collision check

### Claude Code plugin-scope `agents/*.md`

Supported frontmatter keys, **in plugin scope**: `name`, `description`, `model`, `effort`,
`maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation` (only valid
value `"worktree"`). *"For security reasons, `hooks`, `mcpServers`, and `permissionMode` are not
supported for plugin-shipped agents."* [CITED: code.claude.com/docs/en/plugins-reference — Agents].
CONTEXT D-08 is correct. Claude Code loads a plugin agent even with missing/unparseable
frontmatter, falling back to the filename and a generic description — so a typo degrades silently
rather than failing loudly, which is an argument for guarding it ourselves.

### Cursor `agents/*.md`

`agents/` is auto-discovered (`.md`, `.mdc`, `.markdown`) and documented frontmatter is **`name` +
`description` only** [CITED: cursor.com/docs/reference/plugins — Agents format]. Any Claude-only key
(`model`, `effort`, `tools`, …) is undocumented there.

### Collision with the existing Codex `openai.yaml` stubs — none

`plugin/skills/*/agents/openai.yaml` live **inside each skill directory**, not at plugin root. A new
`plugin/agents/jarvis-navigator.md` is a different path at a different level. Claude Code and Cursor
both scan only plugin-root `agents/`; Codex's `agents/openai.yaml` is a per-skill sidecar declaring
`dependencies.tools` [CITED: developers.openai.com/plugins/build/skills — Connect skills to MCP
tools]. There is no documented Codex plugin-root `agents/` component, so Codex ignores the new file.
[VERIFIED: `plugin/skills/{jarvis-setup,jarvis-use,jarvis-issues}/agents/openai.yaml` are the only
`agents/` paths in the tree — full `find plugin -type f` listing, 2026-09-11.]

### Recommendation

`plugin/agents/jarvis-navigator.md`, frontmatter restricted to the intersection that is safe
everywhere plus Claude-only tuning that Cursor will ignore:

```markdown
---
name: jarvis-navigator
description: Answers multi-hop structural questions about an indexed repository by chaining jarvis MCP tools — goToDefinition, then callHierarchy, then blastRadius. Use when a question needs more than one navigation call, such as "what breaks if I change X" or "trace this call path across repos".
model: inherit
effort: medium
maxTurns: 20
disallowedTools: Write, Edit
---
```

- `model: inherit` keeps the session model and avoids pinning a name that may be retired
  [CITED: code.claude.com/docs/en/skills — `model` accepts `inherit`].
- **Do not** set `tools` to an allow-list containing the jarvis MCP tool names: plugin-bundled MCP
  tools are namespaced `mcp__plugin_<plugin-name>_<server-name>__<tool>` [CITED:
  code.claude.com/docs/en/plugins-reference — Hooks], a string that changes if the plugin or server
  key is renamed, and it is not portable to Cursor. Use `disallowedTools` to make the agent
  read-only instead — that is the invariant that matters.
- **Do not** add `hooks`, `mcpServers`, or `permissionMode` — unsupported in plugin scope.
- Do not declare `agents` in any manifest; default discovery covers it, and in Claude Code an
  `agents` field *replaces* the default scan.

---

## Target 4 — SKILL.md frontmatter (D-11): the allowed set, and what each loader does with `version`

### The allowed set (authoritative)

`name` (required), `description` (required), `license`, `compatibility`, `metadata`,
`allowed-tools`. `metadata` is "a map from string keys to string values" [CITED:
agentskills.io/specification — Frontmatter]. `version` is not a member.

Claude Code's own frontmatter table adds many extensions (`when_to_use`, `argument-hint`,
`arguments`, `disable-model-invocation`, `user-invocable`, `disallowed-tools`, `model`, `effort`,
`context`, `agent`, `background`, `hooks`, `paths`, `shell`, `metadata`) — and **`version` is absent
from that table too** [CITED: code.claude.com/docs/en/skills — Frontmatter reference]. Cursor
documents `name` + `description` for skills [CITED: cursor.com/docs/reference/plugins — Skill
frontmatter fields]. Codex documents `name` + `description` [CITED:
developers.openai.com/plugins/build/skills].

### What actually happens today with the off-spec key

- **claude.ai upload / Skills API / `package_skill.py`**: hard error, verbatim —
  `Unexpected key(s) in SKILL.md frontmatter: argument-hint. Allowed properties are: allowed-tools,
  compatibility, description, license, metadata, name` [CITED: code.claude.com/docs/en/skills —
  Using skill frontmatter outside Claude Code]. So D-11's "hard error for claude.ai/Skills-API
  packaging" is confirmed.
- **Claude Code plugin scope**: tolerated, and **not reported by the validator**. I ran
  `claude plugin validate ./plugin --strict --json` against a scratch plugin containing
  `skills/demo/SKILL.md` with `version: "0.1.0"`, `agents/nav.md` with `bogusKey: 1`, and
  `commands/idx.md` with `version: "9"`. The `contents` array contained **only** the hooks file —
  no skill, agent, or command frontmatter finding at all [VERIFIED: local probe, `claude` 2.1.268].
- **Cursor / Codex plugin scope**: undocumented (see Open Questions). No observed rejection.

### Recommendation

**Remove `version:` from all three SKILL.md** (`plugin/skills/jarvis-setup/SKILL.md:4`,
`plugin/skills/jarvis-use/SKILL.md:4`, `plugin/skills/jarvis-issues/SKILL.md:4`) and do **not**
relocate it under `metadata`. Rationale, in order:

1. It has never tracked anything — `"0.1.0"` against plugin `0.9.0` (`.claude/CLAUDE.md:129`
   enshrines the wrong convention).
2. Relocating to `metadata.version` recreates a fourth version string that D-12(b) would then have
   to guard, for no consumer — "Claude Code doesn't act on its contents" [CITED:
   code.claude.com/docs/en/skills].
3. The plugin version already lives in exactly the three places `check-manifests.mjs:44-53` guards.

Same edit removes the stale convention in `.claude/CLAUDE.md:129`, `:136`, `:269` and in
`docs/code-standards.md` (cited by those lines). Because the vendor validator does not catch this,
**guard (d) must be hand-rolled** — see Target 6.

---

## Target 5 — Tag and version strategy (D-04, D-15, D-16)

### Measured state

| Fact | Evidence |
|---|---|
| Manifests all declare `0.9.0` | `plugin/.claude-plugin/plugin.json:3`, `plugin/.cursor-plugin/plugin.json:4`, `.codex-plugin/plugin.json:3` |
| Codex pins two URLs at `blob/v0.9.0/…` | `.codex-plugin/plugin.json:39-40` |
| **No `v0.9.0` tag exists** — remote tags are `v0.7.3`, `v0.8.0`, `scip-56791658a873`, `zoekt-33f1f18af292` | [VERIFIED: `git ls-remote --tags origin`, 2026-09-11] |
| `blob/v0.9.0/plugin/README.md` → **HTTP 404**; `blob/v0.9.0/plugin/LICENSE` → **HTTP 404** | [VERIFIED: `curl -o /dev/null -w %{http_code} -L`, 2026-09-11] |
| `blob/v0.8.0/plugin/README.md` → **200** | [VERIFIED: same probe] |
| Released server version is **0.9.1** | `../jarvis/pyproject.toml:16`, `../jarvis/server.json:9`, `:14` |
| MCP pins say `jarvis-mcp>=0.9.0` | `plugin/mcp.json:7`, `plugin/.mcp.json:7` |

### Does GitHub serve `blob/<tag>` before the tag is pushed?

**No.** GitHub resolves `/blob/<ref>/…` against refs that exist in the repository; an unknown ref is
a 404, which is precisely what `v0.9.0` returns today while `v0.8.0` returns 200 [VERIFIED: the two
probes above are the falsification — the identical URL shape succeeds for an existing tag and fails
for a missing one].

**The implication is a hard ordering constraint:** the commit that contains `blob/vX.Y.Z/…` URLs is
itself the commit the tag points at, so there is an unavoidable window in which the URL in the
committed file does not resolve. It closes the moment the tag is pushed — and it can only close if
the tag is pushed **to the same commit** those URLs were written into. Sequence:

1. Commit every phase change, including `privacyPolicyURL`/`termsOfServiceURL` rewritten to
   `blob/vX.Y.Z/…` and all three manifests at `X.Y.Z`.
2. Merge to `main`.
3. `git tag vX.Y.Z <merge-commit> && git push origin vX.Y.Z`.
4. **Only then** re-probe both URLs for 200 — this is the release-gate assertion, and it is a human
   / post-merge step, not a PR-time CI step (a PR cannot make its own future tag exist).

This is why guard (b)'s tag-existence dimension must be skippable at PR time (Target 6).

### 0.10.0 vs 0.9.1 — the tradeoff, named

| Option | For | Against |
|---|---|---|
| **`0.10.0`** (CONTEXT D-16, `[INFERENCE]`) | Semver-honest: new capability surfaces (commands, hooks, agent) are features, not fixes. Claude Code explicitly asks for semver and MINOR-for-features [CITED: code.claude.com/docs/en/plugins-reference — Version management]. Cannot ever be confused with a server version. | Breaks the numeric coincidence readers currently rely on: plugin `0.9.0` beside server `0.9.1`. Makes the plugin version sort *above* the server version, inviting "which 0.10 of jarvis?" confusion on the install surface. |
| **`0.9.1`** (mirror the server) | Every version string on the surface — manifests, `jarvis-mcp>=` floor, tag, `blob/v0.9.1/` URLs — becomes one number, which is the single strongest thing a reader can be told. Makes D-03's pin bump and D-15's manifest bump the *same* edit, and makes guard (b) a literal equality check instead of a two-number relation. | Semver-dishonest for a release that adds three capability surfaces. Couples the plugin release train to the server's forever: the next server patch forces a plugin bump or re-introduces the drift this phase is eliminating. |

**Recommendation: `0.9.1`, for this release only, with the coupling stated as a decision rather
than left implicit.** The phase's entire thesis is "make the shipped surface true to jarvis 0.9.1
and mechanically hard to un-true"; shipping it under a number that matches nothing on the server
side re-opens the exact "which version am I looking at?" class of drift the phase exists to close,
and it makes guard (b) strictly weaker (a relation to assert rather than an identity). The semver
objection is real but costs nothing observable: no consumer resolves this plugin by version range —
Claude Code uses `version` purely as an update cache key [CITED: code.claude.com/docs/en/plugins-
reference — Version management], and Cursor/Codex treat it as display metadata.

If the user or planner prefers `0.10.0`, the only mechanical consequence is that D-04's tag URLs
become `blob/v0.10.0/…` and guard (b) asserts `manifest.version == tag.version` **and**
`mcpPin >= serverVersion` as two separate dimensions instead of one. Either choice is
implementable; do not let it block planning.

**Independent of the number:** the `jarvis-mcp` pin must stay a `>=` floor and must not be
exact-pinned (`.claude/CLAUDE.md:132`), so `jarvis-mcp>=0.9.1` is the D-03 edit in both
`plugin/mcp.json:7` and `plugin/.mcp.json:7`, byte-identically.

---

## Target 6 — Guard design (D-12, D-13)

### House style to match

`scripts/check-manifests.mjs` is the template: zero-dependency ESM, `readFileSync`, paths resolved
against `process.cwd()` — *"the testability seam that lets this script run unmodified against a
scratch copy of the repo by changing the working directory"* (`scripts/check-manifests.mjs:4-6`), a
`fail(message)` collector with a single `process.exit(1)` at the end (`:20-23`, `:65-67`), and a
one-line `ok:` summary. `scripts/verify-build.mjs:4-23` supplies the numbered-dimension header
comment convention (V2, V3, V4, V5, V9, V10) and `fail(dimension, detail)`.

**Recommendation: a new sibling `scripts/check-plugin.mjs`** rather than growing
`check-manifests.mjs`. Reasons: `check-manifests.mjs` is SITE-07's three-invariant file with a
stable contract and its own npm alias (`package.json:13`); the new dimensions are a different
concern (content truth + release readiness) and one of them needs a network/offline switch, which
does not belong in a file whose current guarantee is "pure filesystem, always runnable". Wire it as
`"check:plugin": "node scripts/check-plugin.mjs"` beside `check:manifests`, and add a second `run:`
step to `checks.yml`. Number its dimensions **P1…P5** so nothing collides with `V*`.

### P1 — tool roster ↔ server tool set (D-12a): the hard one

The server repo is **not** available in CI. Three candidate designs:

| Design | How | Cost | Catches |
|---|---|---|---|
| **A. Committed fixture** | `scripts/fixtures/tool-roster.json` — an array of the 10 camelCase names, regenerated by hand when the server changes. P1 asserts every plugin-surface file's tool set equals the fixture. | The fixture itself can go stale — it moves the drift one file over. | Every intra-repo inconsistency; the `index_repo`/`blast_radius` snake_case bug at `plugin/skills/jarvis-use/SKILL.md:75-76`. |
| **B. Parse a published artifact** | Fetch the PyPI sdist/wheel for `jarvis-mcp==<pin>` and grep `@mcp.tool(name="…")`. | Network at CI time; a multi-MB download; fails on a PyPI outage; the wheel may be compiled (`JARVIS_COMPILE`, `../jarvis/pyproject.toml:117`). | Real server drift. |
| **C. Internal consistency only** | Derive the roster from `plugin/skills/jarvis-use/references/tool-roster.md` (the one already-correct file) and assert every other surface agrees. | Cannot detect the server adding an 11th tool. | Every intra-repo inconsistency, with no extra file to maintain. |

**Recommendation: C, upgraded with a hand-refreshed count assertion — i.e. C plus one line of A.**
Take `plugin/skills/jarvis-use/references/tool-roster.md` as the source of truth: parse its
`### <name>(` headings (`tool-roster.md:7,11,15,19,23,26,31,35,39,43`) into a set, assert
`size === 10`, and then assert:

- `plugin/README.md` — every roster name appears; the words "ten"/"Ten" appear and "nine"/"Nine" do
  not (`plugin/README.md:3`, `:7`).
- root `README.md` — same; today `README.md:20` says "Nine MCP tools" over a 9-row table with no
  `indexRepo` row, so this dimension is **red before green** on the current tree.
- `.codex-plugin/plugin.json` `interface.longDescription` — no "nine"; today `:25` says "through
  nine MCP tools", also red before green.
- all three `SKILL.md` + `tool-roster.md` — **no token matching `/\b(index_repo|blast_radius|
  go_to_definition|find_references|call_hierarchy|type_hierarchy|document_symbols|get_index_status|
  search_code|semantic_search)\b/`**, i.e. no Python function name where the MCP name belongs. This
  is red before green against `plugin/skills/jarvis-use/SKILL.md:75-76` and is exactly the drift
  class D-12(a) exists for.

The honest tradeoff, stated for the planner: **this guard cannot detect the server registering an
11th tool.** It converts "the surface disagrees with the server" into "the surface disagrees with
itself", and leaves the roster file as a single human-maintained point of truth. Design B is the
only design that closes the remaining gap, and its cost (network dependency in a
previously-hermetic check, plus a compiled-wheel failure mode) is not worth it for a repo that
already re-reads the server at every phase. Record the limitation in the script header comment so
the next maintainer does not mistake P1 for a server diff.

### P2 — manifest version ↔ MCP pin ↔ tag existence (D-12b)

Split into two dimensions with different runtime requirements:

- **P2a (always on, offline):** all three `plugin.json` versions equal each other (already covered
  by `check-manifests.mjs:44-53` — do not duplicate; instead assert the *new* relation) and the
  `jarvis-mcp>=X` floor parsed out of `plugin/mcp.json` `mcpServers.jarvis.args` is a valid `>=`
  floor, is not an exact pin, and carries no `[semantic]` extra (`.claude/CLAUDE.md:132`). If the
  0.9.1 option is taken, also assert `floor === manifestVersion`.
- **P2b (release gate, network):** every `github.com/<owner>/<repo>/blob/<ref>/…` URL found in
  `.codex-plugin/plugin.json`, the three SKILL.md, and both READMEs has `<ref>` either equal to
  `main` (allowed only for the installer URL at `plugin/skills/jarvis-setup/SKILL.md:22`, per D-05)
  or equal to `v<manifestVersion>`; and that tag exists.

**Tag existence: use `git ls-remote --tags origin`, not an HTTPS fetch.** It is one round trip, it
is what the repo's own tooling already implies, and it needs no token for a public repo [VERIFIED:
`git ls-remote --tags origin` returned the four-tag list from this working copy, 2026-09-11].
Offline / no-remote behaviour must be **skip with a printed note, never fail**:

```js
// P2b is the only network dimension. A sandboxed or offline run prints
// "P2b: skipped (no remote reachable)" and does not fail — a guard that
// cannot run must not become a guard that blocks.
```

Gate it behind `--release` (or `CHECK_PLUGIN_RELEASE=1`) so PR-time CI runs P1/P2a/P3/P4/P5 and the
post-tag release step runs `node scripts/check-plugin.mjs --release`. This is forced by the ordering
constraint in Target 5: at PR time the tag cannot exist yet.

### P3 — marketplace manifests (D-12c)

Today neither marketplace file is read at all (`scripts/check-manifests.mjs:10-14` covers only the
three `plugin.json`). Assert, for both `.claude-plugin/marketplace.json` and
`.cursor-plugin/marketplace.json`:

1. parses as JSON;
2. required fields present — `name` (kebab-case), `owner.name`, `plugins[]` [CITED:
   code.claude.com/docs/en/plugin-marketplaces — Marketplace schema; cursor.com/docs/reference/
   plugins — Marketplace manifest fields];
3. `name` is not in Claude Code's reserved list (`jarvis` is not — but the list grows, and the
   docs say reserved names are re-checked on every load) [CITED: code.claude.com/docs/en/plugin-
   marketplaces — Reserved names];
4. every `plugins[].name` matches the corresponding `plugin.json` `name` (`.claude/CLAUDE.md:102`
   — Cursor hard-errors on mismatch);
5. every `plugins[].source` string starts with `./`, contains no `..`, no backslash, and **resolves
   to an existing directory** containing the expected manifest (`./plugin` →
   `plugin/.claude-plugin/plugin.json` resp. `plugin/.cursor-plugin/plugin.json`);
6. no entry declares component fields (`skills`/`commands`/`agents`/`hooks`/`mcpServers`) —
   those conflict with `plugin.json` and produce `Plugin … has conflicting manifests` [CITED:
   code.claude.com/docs/en/plugins-reference — Common validation errors].

### P4 — SKILL.md frontmatter allowed-keys (D-12d)

Must be hand-rolled: `claude plugin validate` does not inspect skill/agent/command frontmatter
[VERIFIED: scratch-plugin probe above]. Zero-dependency approach — no YAML library is needed for
this frontmatter shape:

- Read each `plugin/skills/*/SKILL.md`; require the file's first line to be exactly `---` (Claude
  Code "reads the frontmatter only when the opening `---` is the file's first line" [CITED:
  code.claude.com/docs/en/skills]).
- Slice to the next `---` line; collect top-level keys with `/^([A-Za-z0-9_-]+):/` on non-indented
  lines (indented lines belong to a nested map such as `metadata`).
- Assert the key set ⊆ `{name, description, license, compatibility, metadata, allowed-tools}` and
  that `name` and `description` are present, `name` matches the parent directory name, and
  `description` is 1–1024 chars [CITED: agentskills.io/specification].
- Red before green: all three files carry `version` at `:4` today.

Apply the same allowed-key check to `plugin/commands/*.md` and `plugin/agents/*.md` with their own
sets (Claude Code's command/agent field lists, minus `name`/`paths` for commands) — cheap, and it
closes the "Claude Code silently loads an agent with unparseable frontmatter" failure mode noted in
Target 3.

### P5 — referenced assets and files exist

`Not caught by CI` item 11 in the evidence pack: `plugin/.cursor-plugin/plugin.json:13`
(`assets/app-icon.png`), `.codex-plugin/plugin.json:42-43` (`./plugin/assets/jarvis-small.svg`,
`./plugin/assets/app-icon.png`), and the new `hooks`/`commands`/`agents` paths. One loop, `existsSync`,
plus `hooks/*.sh` is executable (`fs.statSync(p).mode & 0o111`) — "Hooks not firing | Script not
executable | Run `chmod +x script.sh`" [CITED: code.claude.com/docs/en/plugins-reference —
Troubleshooting].

### Adopt `claude plugin validate` as a sixth, vendor-supplied guard

`claude plugin validate <path> [--strict] [--json]` exits 0 on pass, 1 on fail, 2 when the run
itself fails [CITED: code.claude.com/docs/en/plugins-reference — plugin validate]. On the current
tree it passes clean on both the plugin and the marketplace [VERIFIED: local probe — `success:
true, errors: [], warnings: []` for `./plugin --strict` and for `.`]. It is the only tool that will
catch hooks-schema drift (`unknown hook event`) and manifest type errors. Add it to `checks.yml` as
a separate step:

```yaml
      - name: Install Claude Code CLI
        run: npm i -g @anthropic-ai/claude-code
      - name: Validate plugin + marketplace
        run: |
          claude plugin validate ./plugin --strict
          claude plugin validate . --strict
```

Tradeoff to state in the plan: this adds an unpinned npm install to a previously dependency-free
workflow, and a vendor CLI change can turn CI red without a repo change. Mitigate by pinning the
npm version and treating it as advisory-if-flaky; do **not** let it replace P1–P5, which encode
this repo's own invariants.

### D-13 red-before-green protocol

For each of P1–P5, the plan must show the dimension failing against the **pre-fix tree** before it
is trusted. The `process.cwd()` seam (`scripts/check-manifests.mjs:4-6`) makes this mechanical:

```
git worktree add /tmp/pre-fix <commit-before-phase-6>
cp scripts/check-plugin.mjs /tmp/pre-fix/scripts/
(cd /tmp/pre-fix && node scripts/check-plugin.mjs)   # must print the expected P-failure
```

Four of the five are naturally red on today's tree (P1 on `README.md:20` + `.codex-plugin/
plugin.json:25` + `SKILL.md:75-76`; P2a once the floor moves; P3 on nothing today — see below;
P4 on `SKILL.md:4` ×3). **P3 and P5 have no natural pre-fix failure**, so they need a deliberate
scratch mutation (e.g. temporarily point `plugins[0].source` at `./nope`, or delete
`plugin/assets/app-icon.png` in the scratch copy) to demonstrate red. Budget a task for that; a
guard never seen failing is not a guard.

---

## Target 7 — `checks.yml` path filter (D-14)

Current filter, duplicated across `push` and `pull_request`: `plugin/**`, `.codex-plugin/**`,
`.claude-plugin/**`, `.cursor-plugin/**`, `scripts/check-manifests.mjs`, `.github/workflows/checks.yml`
(`.github/workflows/checks.yml:10-16`, `:19-25`).

Additions required, both blocks:

| Path | Why |
|---|---|
| `scripts/check-plugin.mjs` | New guard script; an edit to it must re-run it (mirrors the existing `scripts/check-manifests.mjs` entry). |
| `README.md` | P1 reads root `README.md` (`:20` is the wrong count today). Without this, a README edit re-introducing "nine" is unguarded. |
| `setup.sh` | D-14. |
| `scripts/fixtures/**` | Only if the planner picks guard-design A/B for P1; not needed for the recommended design C. |

`plugin/commands/**`, `plugin/hooks/**`, `plugin/agents/**` need **no** new entries — `plugin/**`
already covers them.

**Does adding `setup.sh` pull in unrelated churn?** Yes, a bounded and acceptable amount.
`setup.sh` is byte-identical to `../jarvis/setup.sh` [VERIFIED: `cmp -s` returned equal,
2026-09-11] and is overwritten here by the private repo's sync workflow on every release
(`.claude/CLAUDE.md:86`). So the cost is: **the manifest-checks workflow runs on every upstream sync
commit**, even when nothing the guard reads has changed. That is ~1 extra ubuntu-latest job per
sync, running a set of pure-filesystem Node assertions in seconds. It is also precisely the trigger
D-14 wants — a sync that changes `--only` flag names or the ctags behaviour should re-validate the
installer claims in `jarvis-setup/SKILL.md:25`, `:87`. Recommend adding it.

Caveat the planner must not miss: **a path filter cannot detect a claim that goes stale without a
file changing here.** `setup.sh` in the filter only helps because syncs land as commits in this
repo. Nothing in CI will catch the `../jarvis` server growing an 11th tool.

---

## Target 8 — 0.9.1 behaviour to teach (D-02): verification against server source

Every D-02 claim re-verified by reading `/Users/ddphuong/Projects/jarvis-ai/jarvis/src/jarvis/`
directly this session. **All five hold. One is under-stated and one citation is mis-attributed.**

### 8.1 Seventeen tree-sitter grammars — CONFIRMED

`../jarvis/src/jarvis/syntax.py:51-69` defines `FACTORIES` with exactly 17 entries, verbatim keys:
`python`, `javascript`, `typescript`, `tsx`, `java`, `kotlin`, `swift`, `go`, `ruby`, `rust`, `c`,
`cpp`, `csharp`, `php`, `scala`, `bash`, `sql` [VERIFIED: `../jarvis/src/jarvis/syntax.py:51-69`].
The comment at `:47-50` explains the count: *"TypeScript and TSX are two factory selections from one
distribution"* — which is why the shipped copy correctly says "17 parser selections … 16
pip-installed grammar distributions" (`plugin/README.md:20`,
`plugin/skills/jarvis-setup/SKILL.md:29`, `plugin/skills/jarvis-use/SKILL.md:57`). Keep the
"selections vs distributions" wording; it is precise, not sloppy.

### 8.2 `syntax:` ids accepted only by `goToDefinition` — CONFIRMED, with a nuance

- `goToDefinition` accepts them: *"or an opaque `syntax:` identifier returned by the syntax baseline"*
  and *"a `syntax:` identifier resolves only through its exact declaration"*
  [VERIFIED: `../jarvis/src/jarvis/server.py:443`, `:445`].
- `findReferences` rejects: *"…and rejects an opaque `syntax:` identifier"* [VERIFIED: `server.py:466`].
- `callHierarchy` rejects: *"…`syntax:` identifier with a capability error — call edges are never…"*
  [VERIFIED: `server.py:489`].
- `typeHierarchy` rejects: *"rejects an opaque `syntax:` identifier with a capability error — type…"*
  [VERIFIED: `server.py:510`].

**Nuance CONTEXT omits:** `documentSymbols` takes `(repo, path)`, not a symbol
[VERIFIED: `../jarvis/src/jarvis/server.py:417`], so it is not in the accept/reject dichotomy at all
— it *produces* `syntax:` ids rather than consuming them. Skill copy should say "of the four
symbol-taking navigation tools, only `goToDefinition` accepts a `syntax:` id", not "only
goToDefinition accepts them" full stop.

### 8.3 `--search-only` removed and hard-rejected — CONFIRMED

`_REMOVED_OPTIONS` maps three flags to replacements, with the rationale comment *"Rejected with the
replacement — never silently mapped — so a stale script fails loudly instead of quietly changing
meaning"* [VERIFIED: `../jarvis/src/jarvis/index_cli.py:1953-1963`]. The enforcement is
`_reject_removed_options`, which prints `error: {flag} was removed — use {replacement}` to stderr
and `raise SystemExit(2)` [VERIFIED: `../jarvis/src/jarvis/index_cli.py:1998-2006`]. `--search-only`'s
replacement string is *"--no-scip (the syntax baseline is always indexed; SCIP is optional
enrichment)"* [VERIFIED: `index_cli.py:1958-1960`]. The shipped copy at
`plugin/skills/jarvis-use/SKILL.md:58` already states this correctly, including the
`JARVIS_FALLBACK_SEARCH_ONLY` removal.

**Detail worth teaching that neither CONTEXT nor the skills mention:** the exit code is **2**, not
1, and the rejection happens in `main` before argparse, so it fires for *every* subcommand.

### 8.4 `universal-ctags` is an index-time prerequisite for `sym:` — CONFIRMED

*"zoekt auto-discovers universal-ctags on PATH (or `$CTAGS_COMMAND`) at index time; shards built
without it carry no symbol sections, so zoekt's `sym:` queries and its symbol-definition ranking
silently return nothing (index/builder.go: HasSymbols = CTagsPath != ""). … Absence is a warn, not a
failure -- it degrades `sym:` only. NOTE: shards indexed before this install stay symbol-less until
`jarvis reindex <slug>`."* [VERIFIED: `setup.sh:634-641`]. The warn path is at `setup.sh:654`:
*"universal-ctags: no supported installer (need brew, or apt-get as root) -- zoekt sym: queries will
return nothing until it is installed (then reindex)"* [VERIFIED: `setup.sh:654`].

**Two details the skills must carry and currently do not:** (a) `universal-ctags` is a separate
`--only` target name (`setup.sh:959` lists `scip, zoekt, ctags, scip-swift, scip-typescript, …` and
`setup.sh:1047` dispatches `should_run ctags` → `install_ctags`), so the recovery command is
`sh setup.sh --only ctags` — note the flag value is **`ctags`**, not `universal-ctags`, the same
name/value mismatch already documented for zoekt at `plugin/skills/jarvis-setup/SKILL.md:87`;
(b) zoekt looks up the literal name `universal-ctags`, so a bare `ctags` on PATH is invisible to it
and setup.sh symlinks it (`setup.sh:616-631`).

### 8.5 `indexRepo` is the recovery tool named in miss errors — CONFIRMED

`payload["recoveryTool"] = "indexRepo"` with `payload["recoveryToolArgs"] = {"path": "<the repo's
local git working directory>"}` [VERIFIED: `../jarvis/src/jarvis/server.py:384-385`], and the
docstring confirms it is emitted *"whether or not a row exists"* [VERIFIED: `server.py:369`, `:344`].
`plugin/skills/jarvis-use/SKILL.md:23`, `:48` already teach this; `plugin/skills/jarvis-setup/
SKILL.md` never mentions `indexRepo` — CONTEXT's gap statement is accurate.

### 8.6 The 10 tools — CONFIRMED verbatim

`@mcp.tool(name=…)` registrations, in file order [VERIFIED: `../jarvis/src/jarvis/server.py`]:
`documentSymbols` (:416), `goToDefinition` (:439), `findReferences` (:461), `callHierarchy` (:483),
`typeHierarchy` (:505), `getIndexStatus` (:567), `indexRepo` (:594), `searchCode` (:708),
`semanticSearch` (:767), `blastRadius` (:788). CONTEXT D-01's line numbers are exact.

### 8.7 Recommendation for the skill edits

`jarvis-use/SKILL.md` already carries 8.1–8.3 and 8.5 correctly; its real defects are the
snake_case trigger examples at `:75-76` and the `>=0.9.0` pins at `:65-66`.
`jarvis-setup/SKILL.md` is where D-02's work concentrates: add `indexRepo` as the recovery tool,
add a `universal-ctags` / `sym:` troubleshooting row naming `--only ctags`, and correct nothing else
— `:29` (17 selections / 16 distributions) and `:66` (`--no-scip`) are already right.
`jarvis-issues/SKILL.md` needs only the frontmatter edit (D-11); its five documented limitations
were not re-verified this pass (see Open Questions).

---

## Validation Architecture

*(`workflow.nyquist_validation: true` in `.planning/config.json` — this section is mandatory.)*

### Test Framework

| Property | Value |
|---|---|
| Framework | **None.** The repo has no test framework, no `.editorconfig`, no linter (`.claude/CLAUDE.md:106`). Validation is zero-dependency Node assertion scripts invoked from CI. |
| Config file | none — `package.json:13-14` aliases (`check:manifests`, `verify`) |
| Quick run command | `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` |
| Full suite command | `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs && claude plugin validate ./plugin --strict && claude plugin validate . --strict` |
| Release-gate command | `node scripts/check-plugin.mjs --release` (adds P2b tag-existence + URL 200 probes; run **after** the tag is pushed) |

Node 22 is already pinned in the workflow (`.github/workflows/checks.yml:39`); local Node is 26.8.1
and npm 11.19.0 [VERIFIED: `node --version`, `npm --version`, 2026-09-11].

### What proves each deliverable class correct

| Deliverable class | What proves it | Automated? |
|---|---|---|
| **Manifest edit** (version bump, `$schema`, Cursor `hooks` field, Codex `longDescription`) | `check-manifests.mjs` dimensions 1–3 (parse, version equality, dual-config byte-identity, `:25-63`) + new P2a + `claude plugin validate ./plugin --strict` exit 0 | Yes, PR-time |
| **MCP pin edit** (D-03) | P2a floor parse + `check-manifests.mjs:56-63` byte-identity of `plugin/.mcp.json` vs `plugin/mcp.json` | Yes, PR-time |
| **Tool-count / roster copy** (D-01, D-02) | P1 set-equality + forbidden-token scan; red on today's `README.md:20`, `.codex-plugin/plugin.json:25`, `jarvis-use/SKILL.md:75-76` | Yes, PR-time |
| **SKILL.md frontmatter** (D-11) | P4 allowed-key set; red on `SKILL.md:4` ×3 | Yes, PR-time |
| **Progressive-disclosure move** (D-10) | P5 file-exists on the new `references/troubleshooting.md`; plus a grep that `jarvis-setup/SKILL.md` carries the on-demand retrieval command in the `jarvis-use/SKILL.md:41` style | Yes, PR-time |
| **Marketplace validity** (D-12c) | P3 + `claude plugin validate . --strict` exit 0 | Yes, PR-time |
| **Commands load** (D-06) | `claude plugin validate ./plugin --strict` (frontmatter parse) + P4/P5. **Actual `/jarvis:index` appearing in the `/` menu is NOT provable in CI** | Partly |
| **Hook fires** (D-07) | Two layers. (i) *Schema*: `claude plugin validate ./plugin --strict` — proven to emit `hooks.<name>: unknown hook event` and exit 1 on a wrong event name [VERIFIED: scratch probe]. (ii) *Script behaviour*: a throwaway harness that runs `plugin/hooks/jarvis-index-status.sh` directly with `PATH` stripped of `jarvis`, asserting **exit 0 and zero bytes on stdout**; then with a fake `jarvis` on `PATH` emitting a stale TSV row, asserting one JSON object containing `additionalContext`. This is a plain `sh` test, no framework. **Whether Claude Code actually injects the context at session start is NOT provable in CI** | Partly |
| **Agent loads** (D-08) | P4 agent-frontmatter key check + `claude plugin validate`. **The agent appearing in the `@`-mention typeahead as `jarvis:jarvis-navigator` is NOT provable in CI** | Partly |
| **Guard actually guards** (D-13) | Red-before-green: `git worktree add /tmp/pre-fix <pre-phase-commit>`, copy the new script in, run it, capture the failing output in the plan's evidence. The `process.cwd()` seam (`check-manifests.mjs:4-6`) exists for exactly this | Yes, one-time per dimension |
| **Tag URLs resolve** (D-04) | `curl -o /dev/null -w '%{http_code}' -L <url>` == 200 for both `.codex-plugin/plugin.json:39-40` URLs. **Runs only after the tag is pushed** — a PR cannot satisfy it | Release gate |
| **Release synchronization** (D-15) | `check-manifests.mjs` green + `git ls-remote --tags origin` contains `v<version>` + both URL probes 200 | Release gate |

### Sampling rate

- **Per task commit:** `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs`
  (pure filesystem, sub-second, no network).
- **Per wave merge / PR:** the full suite above, i.e. the two Node scripts plus both
  `claude plugin validate --strict` runs. This is what `.github/workflows/checks.yml` executes.
- **Phase gate (post-merge, post-tag):** `node scripts/check-plugin.mjs --release`, then the manual
  client checks below.

### Wave 0 gaps

- [ ] `scripts/check-plugin.mjs` — dimensions P1–P5; does not exist
- [ ] `.github/workflows/checks.yml` — second `run:` step + `claude` CLI install step + path-filter
      additions (`scripts/check-plugin.mjs`, `README.md`, `setup.sh`) in **both** `push` and
      `pull_request` blocks
- [ ] `package.json` — `"check:plugin"` alias beside `check:manifests` (`package.json:13`)
- [ ] Red-before-green scratch harness for P3 and P5 (no natural pre-fix failure — needs a
      deliberate mutation in a worktree copy)
- [ ] Throwaway hook-script harness (plain `sh`, not committed) proving silence-when-absent

### What CANNOT be validated in CI — needs a human or a live client

1. **`/jarvis:index` and `/jarvis:status` actually appear** in Claude Code's `/` menu and in
   Cursor's command surface after a real marketplace install. Validation is structural only.
2. **The SessionStart hook actually injects context** into a live Claude Code session, and whether
   Cursor's `sessionStart` surfaces the same string at all (Cursor documents the event as
   fire-and-forget for env vars and context but does not document the injection field —
   [CITED: cursor.com/docs/hooks — sessionStart]).
3. **Codex behaviour end to end.** `codex plugin` has no `validate` subcommand — only `add`, `list`,
   `marketplace`, `remove` [VERIFIED: `codex plugin --help`, codex-cli 0.153.4, 2026-09-11]. Nothing
   in CI can check the Codex overlay. Additionally Codex "skips [plugin hooks] until the user
   reviews and trusts the current hook definition" [CITED: developers.openai.com/plugins/build/
   plugins], so even a live Codex run needs a human trust action.
4. **Cursor anything.** No Cursor IDE is installed on this machine — `cursor --version` returns
   `Error: No Cursor IDE installation found` [VERIFIED: local probe, 2026-09-11]. There is no Cursor
   plugin validator CLI; submission is manual review at cursor.com/marketplace/publish [CITED:
   cursor.com/docs/reference/plugins — Submitting a plugin].
5. **The navigator subagent producing useful multi-hop answers.** Structural load is checkable;
   answer quality is a human judgement.
6. **`blob/v<tag>/…` URLs during the window between merge and tag push.** By construction they 404
   in that window; only the post-push probe is meaningful.
7. **Whether the `interface:` nesting in `plugin/skills/*/agents/openai.yaml:1-4` is a real OpenAI
   skill-manifest shape.** OpenAI documents `dependencies.tools` in `agents/openai.yaml` [CITED:
   developers.openai.com/plugins/build/skills] but never the `interface.display_name` /
   `short_description` / `default_prompt` block these three files ship, and publishes no schema and
   no validator for it. Nothing in CI, and no local run, can decide it. This is open question 6,
   carried to plan 06-08 Task 3 as an outstanding verdict row.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node | all guards, CI | ✓ | 26.8.1 local; CI pins 22 (`checks.yml:39`) | — |
| npm | `claude` CLI install in CI | ✓ | 11.19.0 | drop the vendor-validator step |
| `claude` CLI | `claude plugin validate` guard | ✓ | 2.1.268 | guard is optional; P1–P5 stand alone |
| `codex` CLI | — (no `validate` subcommand exists) | ✓ | codex-cli 0.153.4 | n/a — nothing to run |
| Cursor IDE | live Cursor verification | ✗ | — | **none** — human on a Cursor machine |
| `git` (with remote reachable) | P2b tag existence | ✓ | remote `jarvis-intelligence/jarvis-index` reachable | P2b skips with a note |
| `curl` | release-gate URL probes | ✓ | — | manual browser check |
| `gh` | release/tag push | ✓ | 2.100.0 | `git push origin <tag>` |
| `uv` / `python3` | not needed by this phase | ✓ | uv 0.11.19, Python 3.14.7 | — |

**Missing with no fallback:** a Cursor installation. Every Cursor claim in this phase is
docs-derived and structurally validated only.

---

## Conflicts with CONTEXT

CONTEXT was assembled from scout reports; these are the points where reading the primary sources
contradicts or materially refines it.

### C-1 — D-09 is not implementable as written (`$schema` on all three manifests)

The Agent Plugins 1.0.0 plugin schema declares `"additionalProperties": false`, `"required":
["$schema", "name"]`, and its property set is exactly
`$schema, author, description, extensions, homepage, keywords, license, name, repository, version`
[VERIFIED: `curl -sL https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` + JSON inspection,
2026-09-11]. `.codex-plugin/plugin.json` carries `skills` (`:21`) and `interface` (`:22-45`) at top
level — **neither is in that property set**, so declaring the Agent Plugins `$schema` would make the
file invalid against the schema it advertises, in every editor and every JSON-schema CI step.
Separately, Cursor's documented `.cursor-plugin/plugin.json` field table has no `$schema` entry and
Cursor publishes no plugin.json schema URL [CITED: cursor.com/docs/reference/plugins — Optional
fields].

**Resolution:** narrow D-09 to `plugin/.claude-plugin/plugin.json` only, with
`"$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json"` — documented, returns
200, `additionalProperties` unset so it is permissive, and Claude Code "ignores this field at load
time" [VERIFIED: schema fetched and inspected; CITED: code.claude.com/docs/en/plugins-reference].
Optionally add `$schema` to `.claude-plugin/marketplace.json` too (also documented and ignored at
load). Adding the Agent Plugins `$schema` to `.codex-plugin/plugin.json` belongs with the deferred
Codex portable-packaging work, not here.

### C-2 — D-07's premise that "all three clients document a `hooks/hooks.json`" is true but misleading

All three do document that path, but **Cursor's schema is incompatible with the other two**
(camelCase event names, flat handler objects) [CITED: cursor.com/docs/reference/plugins — Hooks
format vs code.claude.com/docs/en/plugins-reference — Hooks vs developers.openai.com/plugins/build/
plugins — Bundled MCP servers and lifecycle hooks]. One file cannot cleanly serve all three:
measured, a merged file fails `claude plugin validate --strict` with exit 1 [VERIFIED: scratch
probe]. Two files are required. See Target 2 for the layout.

### C-3 — D-06's cross-client interference worry does not apply

"A manifest path field replaces folder discovery for that component, so declaring one must not break
the other client" — each client reads only its own manifest, so a `commands` declaration in one is
invisible to the others. The real hazard is *intra*-client (replace-vs-extend), and it is avoided by
declaring nothing and relying on default discovery. See Target 1.

### C-4 — `claude plugin validate` does not cover SKILL.md frontmatter

`code.claude.com/docs/en/plugins-reference` says `claude plugin validate` checks "`plugin.json`,
`hooks/hooks.json`, and the frontmatter of the skills, agents, and commands in the plugin's default
directories". **Measured, it does not report unknown frontmatter keys**: a scratch plugin with
`version:` in SKILL.md, `bogusKey:` in an agent, and `version:` in a command produced a `contents`
array containing only the hooks file, under `--strict` [VERIFIED: local probe]. Do not plan D-12(d)
as "delegate to the vendor validator".

### C-5 — CONTEXT/evidence file `setup.sh:634-641` under the *server* repo section

Evidence §A.5 cites `setup.sh:634-641` inside "jarvis server ground truth (../jarvis)". The file
exists in both repos and is **byte-identical** [VERIFIED: `cmp -s jarvis/setup.sh
jarvis-index/setup.sh` → equal, 2026-09-11], with the ctags comment at line 634 in both. So the
claim is true, but the *editable* copy for this phase's purposes is neither — `setup.sh` is
never edited here (`.claude/CLAUDE.md:16`, `:86`). Not a factual conflict; a provenance clarification
so nobody plans a `setup.sh` edit.

### C-6 — D-02 under-states the `syntax:` rule

`documentSymbols` takes `(repo, path)` and no symbol at all [VERIFIED: `../jarvis/src/jarvis/
server.py:417`]. The accurate statement is "of the four symbol-taking navigation tools, only
`goToDefinition` accepts a `syntax:` id". Copy that says "only goToDefinition accepts them" without
that qualifier invites a reader to think `documentSymbols` rejects them.

### C-7 — D-16's version target (advisory, not a contradiction)

CONTEXT marks `0.10.0` as `[INFERENCE]` and invites challenge. Target 5 recommends **0.9.1** and
names the tradeoff. This is a decision for the planner or the user, not a fact CONTEXT got wrong.

### C-8 — `.claude/CLAUDE.md` enshrines the convention D-11 removes

`.claude/CLAUDE.md:129`, `:136`, `:269` state that skill frontmatter is `name` + `description` +
`version`, citing `docs/code-standards.md`. D-11 deletes `version`. Unless those lines change in the
same phase, the project's own conventions file will instruct the next contributor to re-add the key
the new guard rejects. CONTEXT's scope list does not mention `.claude/CLAUDE.md` or
`docs/code-standards.md`; the planner should add the minimal convention fix.

---

## Open questions for the human (TRIAGED 2026-09-12 — every item is marked RESOLVED or CARRIED)

These could not be closed from docs + code at research time. Each names the gap rather than inventing
a rule. Each now also carries a disposition: **RESOLVED** names the decision of record that settled it,
**CARRIED** names the plan that carries it forward as an accepted unknown — either as a caveat shipped
in `plugin/README.md` or as a row in plan 06-08 Task 3's verdict table. No item is left unmarked.

1. **Version target: `0.9.1` or `0.10.0`?** Target 5 recommends `0.9.1` and states the semver cost.
   Both are implementable; the choice changes `blob/v<tag>/…` in `.codex-plugin/plugin.json:39-40`
   and the shape of guard P2a. Needs a decision before the release plan is written.
   **RESOLVED → D-16** (`0.9.1`, resolved 2026-09-11 by the user; binds the tag, both Codex URLs, and P2a).
2. **Does Cursor's plugin `sessionStart` surface injected context, and in what field?**
   `cursor.com/docs/hooks` documents the event as fire-and-forget for "session-specific environment
   variables or … additional context" but publishes no output-field schema for it, and Cursor's
   Claude-Code compatibility layer explicitly covers only `.claude/settings.json`, not plugin
   hooks. Unverifiable here (no Cursor installation). If it turns out Cursor drops the output, the
   Cursor hook is still harmless but useless, and the plan should say so rather than imply parity.
   **CARRIED → 06-03 Task 3** ships the caveat in `plugin/README.md` (no parity claim), and
   **06-08 Task 3** carries it as the "hook injects context in a live session" and "any Cursor claim"
   verdict rows. Blocker: no Cursor IDE on this machine.
3. **Do Cursor and Codex reject unknown SKILL.md frontmatter keys in plugin scope?** Claude Code
   tolerates them (measured). Cursor and Codex document only `name` + `description` and say nothing
   about extra keys. D-11 removes the key regardless, so this is not blocking — but it determines
   whether the current `0.9.0` plugin is *broken* on those clients today or merely off-spec.
   **CARRIED → 06-02 Task 1**, which closes it by construction: the key is deleted for every client,
   so the answer can no longer affect the shipped surface. It survives only as retrospective interest
   (was 0.9.0 broken or merely off-spec), and needs no verdict row.
4. **Does Cursor accept the undocumented fields already in `plugin/.cursor-plugin/plugin.json`?**
   `displayName` (`:3`), `category` (`:14`), `tags` (`:23-29`) are not in Cursor's documented
   plugin.json field table; they appear only as marketplace-entry fields. They ship today without
   known incident, but "no reported incident" is not evidence of acceptance. Only a live Cursor
   install or a submission review answers it.
   **CARRIED → 06-08 Task 3**, "any Cursor claim" verdict row. Blocker: no Cursor IDE installed and
   no Cursor plugin validator CLI exists; submission is manual review.
5. **Does Codex read `plugin/.claude-plugin/plugin.json` for a marketplace install sourced at
   `./plugin`, and where does it then look for `hooks/`?** The deferred Codex-split question, now
   with a hook attached: if Codex resolves the plugin root to `plugin/`, it default-discovers
   `plugin/hooks/hooks.json` and the recommended layout works; if it uses the repo-root
   `.codex-plugin/plugin.json`, the plugin root is the repo root and it would look for
   `<repo>/hooks/hooks.json`, which will not exist. Needs a live `codex plugin marketplace add`
   test. Until then, treat the Codex hook as best-effort and do not claim it in
   `plugin/README.md` without the caveat.
   **CARRIED → 06-03 Task 3** ships the best-effort caveat in `plugin/README.md`, and
   **06-08 Task 3** carries it as the "Codex end to end" verdict row. Blocker: `codex plugin` has no
   validate subcommand (verified, codex-cli 0.153.4), and Codex skips plugin-bundled hooks until a
   human trust action.
6. **Is the `openai.yaml` `interface:` nesting jarvis ships actually valid?** Official docs document
   `dependencies.tools` in `agents/openai.yaml` [CITED: developers.openai.com/plugins/build/skills];
   the `interface.display_name` / `short_description` / `default_prompt` shape at
   `plugin/skills/*/agents/openai.yaml:1-4` is not shown anywhere in OpenAI's docs. D-08 says those
   stubs "stay as they are" — fine — but nobody has confirmed they do anything.
   **CARRIED → 06-08 Task 3**, "`openai.yaml` `interface:` nesting" verdict row, recorded as
   outstanding. Blocker: OpenAI publishes no schema for the block and ships no validator, so neither
   CI nor a local run can decide it; the stubs ship unchanged per D-08 and no guard reads them.
7. **Adding an unpinned `npm i -g @anthropic-ai/claude-code` to `checks.yml`** makes a
   dependency-free workflow depend on a vendor CLI whose warnings can change without a repo change.
   Acceptable? If not, drop the vendor-validator step and rely on P1–P5 alone (which still miss
   hooks-schema drift). Recommend accepting it with a pinned version.
   **RESOLVED → D-17** (adopt it, pinned; it supplements and never replaces the hand-rolled
   D-12(d) guard). Implemented by plan 06-05.
8. **Should `jarvis-issues`' five documented limitations be re-verified this phase?**
   `plugin/skills/jarvis-issues/SKILL.md:27-31` cites server internals (`config.py` single-tenant
   pins, one-language-per-repo, `blastRadius` freshness, Windows). I did not re-read those against
   0.9.1 — it is outside D-01/D-02's scope and no success criterion names it. If the user wants
   `jarvis-issues` fully true to 0.9.1, that is a scope addition.
   **RESOLVED → D-18** (folded into scope). Implemented by plan 06-02 Task 3, which records a
   per-limitation verdict with the settling `path:line`.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | Codex ignores a plugin-root `commands/` directory | Target 1 | A Codex user gets no slash commands — already the assumed outcome; no breakage either way |
| A2 | Codex resolves a `./plugin`-sourced marketplace install's plugin root to `plugin/`, so it default-discovers `plugin/hooks/hooks.json` | Target 2 | The hook silently never runs in Codex. Non-fatal (it is additive), but `plugin/README.md` must not promise it |
| A3 | Cursor accepts a `hooks` path field pointing outside the default `hooks/hooks.json` filename but inside `hooks/` | Target 2 | Cursor loads no hook. Docs say a manifest field replaces folder discovery, and paths must be relative and inside the plugin — both satisfied |
| A4 | Cursor tolerates Claude-only frontmatter keys (`argument-hint`, `disable-model-invocation`) in `commands/*.md` and `model`/`effort`/`maxTurns`/`disallowedTools` in `agents/*.md` | Targets 1, 3 | Cursor may reject or ignore the file. Mitigation available: split per-client command/agent files via manifest path fields, at the cost of duplication |
| A5 | `git ls-remote --tags origin` is available and authenticated in the release environment | Target 6, P2b | P2b skips; the release gate becomes a manual `curl` check |
| A6 | Claude Code tolerating an unknown SKILL.md frontmatter key generalizes to Cursor and Codex (i.e. the shipped `version:` is off-spec but not currently breaking anywhere) | Target 4 | If a client *rejects*, the three skills are already broken on that client today and the D-11 edit is a fix, not a cleanup — which would raise the phase's urgency, not change its plan |

---

## Sources

### Primary (HIGH confidence)

- `https://code.claude.com/docs/en/plugins-reference` — plugin manifest schema, component path
  fields and replace-vs-extend rules, `commands`/`agents`/`hooks` locations, plugin-agent
  frontmatter and the `hooks`/`mcpServers`/`permissionMode` exclusion, `$schema`, `plugin validate`
  semantics, file-locations reference, version management
- `https://code.claude.com/docs/en/hooks` — hook configuration nesting, handler fields (`timeout`
  defaults, `statusMessage`), exit-code semantics, `SessionStart` input/decision control,
  `additionalContext`
- `https://code.claude.com/docs/en/skills` — frontmatter reference table, "Using skill frontmatter
  outside Claude Code" with the verbatim unexpected-key error, command-file rules
- `https://code.claude.com/docs/en/plugin-marketplaces` — marketplace schema, reserved names, plugin
  entry fields, relative-path source rules, strict mode
- `https://cursor.com/docs/reference/plugins` — Cursor manifest fields, component auto-discovery and
  the replaces-discovery rule, skill/agent/command frontmatter, hooks format and event list,
  marketplace manifest, submission checklist
- `https://cursor.com/docs/hooks` — Cursor hook execution model, exit-code behaviour (fail-open),
  `sessionStart` fire-and-forget semantics
- `https://cursor.com/docs/reference/third-party-hooks` — the Claude-Code compatibility layer and
  its `.claude/settings.json`-only scope
- `https://developers.openai.com/plugins/build/plugins` — portable layout, `extensions.com.openai`,
  hooks default discovery + schema + `PLUGIN_ROOT`/`CLAUDE_PLUGIN_ROOT`, path rules, marketplace
  format, skills/mcp.json fixed component paths
- `https://developers.openai.com/plugins/build/skills` — SKILL.md shape, `agents/openai.yaml`
  `dependencies.tools`, activation test matrix
- `https://agentskills.io/specification` — the six allowed frontmatter properties and their
  constraints, progressive disclosure, `references/` conventions
- `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` — fetched and inspected:
  `additionalProperties: false`, `required: ["$schema","name"]`
- `https://json.schemastore.org/claude-code-plugin-manifest.json` — fetched and inspected

### Local ground truth (HIGH confidence)

- `/Users/ddphuong/Projects/jarvis-ai/jarvis/src/jarvis/server.py`, `index_cli.py`, `syntax.py`;
  `pyproject.toml`, `server.json` — read this session
- `/Users/ddphuong/Projects/jarvis-ai/jarvis-index/` — all five manifests, both MCP configs, three
  SKILL.md, `tool-roster.md`, both READMEs, `setup.sh`, `scripts/check-manifests.mjs`,
  `scripts/verify-build.mjs`, `.github/workflows/checks.yml`, `.claude/CLAUDE.md`, `package.json`

### Live probes run this session (HIGH confidence)

- `git ls-remote --tags origin` → `v0.7.3`, `v0.8.0`, `scip-56791658a873`, `zoekt-33f1f18af292`
- `curl -o /dev/null -w %{http_code} -L` on `blob/v0.9.0/plugin/README.md` (404),
  `blob/v0.9.0/plugin/LICENSE` (404), `blob/v0.8.0/plugin/README.md` (200),
  `raw.githubusercontent.com/.../main/setup.sh` (200)
- `claude plugin validate ./plugin [--strict] --json` and `claude plugin validate . --json` on the
  real tree → pass, no warnings
- `claude plugin validate` on two scratch plugins → proved (a) frontmatter unknown keys are not
  reported, (b) `hooks.sessionStart: unknown hook event; entry ignored at runtime` warns and fails
  `--strict` with exit 1
- `codex plugin --help` → no `validate` subcommand
- `cursor --version` → no Cursor IDE installed
- `cmp -s jarvis/setup.sh jarvis-index/setup.sh` → byte-identical

## Metadata

**Confidence breakdown:**

- Slash commands (T1): HIGH — all three clients' component-discovery rules read from primary docs;
  the no-interference conclusion follows from each client reading its own manifest, which the local
  validator probe confirmed for Claude Code
- Hooks (T2): HIGH — two schemas read from primary docs and the merged-file failure mode measured
  against the real validator
- Navigator agent (T3): HIGH for Claude Code (explicit supported-key list), MEDIUM for Cursor
  (only `name`/`description` documented; extra-key behaviour unknown)
- SKILL.md frontmatter (T4): HIGH — spec plus the verbatim error string plus a measured negative
  on the validator
- Version/tag (T5): HIGH on the facts (404/200 probes, tag list), MEDIUM on the recommendation —
  it is a judgement between two defensible options
- Guards (T6): HIGH on mechanism and house style; the P1 tradeoff is stated honestly rather than
  resolved
- Path filter (T7): HIGH — filter read verbatim; churn assessment follows from the verified
  byte-identity of `setup.sh`
- 0.9.1 behaviour (T8): HIGH — every claim re-read from server source this session

**Research date:** 2026-09-11
**Valid until:** 2026-10-11 for the local/server facts; **2026-09-25** for the client-plugin docs —
Claude Code's plugin surface is versioning fast (the reference page cites behaviour changes at
v2.1.202 through v2.1.268, i.e. inside a few weeks), so re-check Targets 1–4 if planning slips a
month.
