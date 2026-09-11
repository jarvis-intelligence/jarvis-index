# Phase 6: Plugin & Skills Enhancement - Pattern Map

**Mapped:** 2026-09-11
**Files analyzed:** 25 (7 created, 18 modified)
**Analogs found:** 18 / 25 (7 have no in-repo analog — all are new client-component files)

All paths are relative to the project root `/Users/ddphuong/Projects/jarvis-ai/jarvis-index`
(**not** the session cwd, which is the `jarvis` server repo).

Every analog named below was checked with `git ls-files -- <path>`; none is a gitignored install
mirror. The `.gsd/capabilities/**` mirror class does not exist in this repo (no `.gsd/` tree).

---

## File Classification

### Created (7) — none is git-tracked today

| New file | Role | Data flow | Closest analog | Match quality |
|---|---|---|---|---|
| `scripts/check-plugin.mjs` | guard script | batch / filesystem-read → exit code | `scripts/check-manifests.mjs` | **exact** (same role, same data flow, same house style) |
| `plugin/commands/index.md` | client component (slash command) | request-response (user-typed) | **none in repo** | frontmatter shape only: `plugin/skills/*/SKILL.md:1-5` |
| `plugin/commands/status.md` | client component (slash command) | request-response (user-typed) | **none in repo** | same |
| `plugin/hooks/hooks.json` | client config (lifecycle hooks, Claude+Codex) | event-driven (SessionStart) | **none in repo** | nearest JSON sibling: `plugin/mcp.json` (2-space, plugin-root-relative command config) |
| `plugin/hooks/cursor.json` | client config (lifecycle hooks, Cursor) | event-driven (sessionStart) | **none in repo** | same |
| `plugin/hooks/jarvis-index-status.sh` | executable probe script | transform (TSV in → JSON out), exit-0-always | **none in repo** (`setup.sh` is sync-owned, never edited here) | — |
| `plugin/agents/jarvis-navigator.md` | client component (subagent) | request-response (multi-hop tool chain) | **none in repo** at plugin root; `plugin/skills/*/agents/openai.yaml` is a *different* component at a *different* level | structural sibling only |
| `plugin/skills/jarvis-setup/references/troubleshooting.md` | skill reference (progressive disclosure) | on-demand retrieval | `plugin/skills/jarvis-use/references/tool-roster.md` | **exact** |

*(8 rows; `troubleshooting.md` is the 7th created file plus the roster reference is pre-existing —
count of created files is 7 excluding the analog column.)*

### Modified (18) — all git-tracked today

| Modified file | Role | Data flow | Closest analog / precedent | Match quality |
|---|---|---|---|---|
| `.github/workflows/checks.yml` | CI config | event-driven (push / pull_request) | itself — the existing `Check manifests` step + duplicated path filter | self |
| `package.json` | project config | config | itself — `check:manifests` alias at `:13` | self |
| `plugin/.claude-plugin/plugin.json` | manifest | config | `plugin/.cursor-plugin/plugin.json` (sibling manifest) | exact |
| `plugin/.cursor-plugin/plugin.json` | manifest | config | `plugin/.claude-plugin/plugin.json` | exact |
| `.codex-plugin/plugin.json` | manifest | config | the two `plugin.json` siblings | role-match (carries extra `interface` block) |
| `.claude-plugin/marketplace.json` | marketplace manifest | config | `.cursor-plugin/marketplace.json` | exact |
| `.cursor-plugin/marketplace.json` | marketplace manifest | config | `.claude-plugin/marketplace.json` | exact (likely read-only target of guard P3, no edit required) |
| `plugin/mcp.json` | MCP registration | config | `plugin/.mcp.json` (byte-identical twin) | exact |
| `plugin/.mcp.json` | MCP registration | config | `plugin/mcp.json` | exact |
| `plugin/skills/jarvis-setup/SKILL.md` | skill content | documentation | `plugin/skills/jarvis-use/SKILL.md` | exact |
| `plugin/skills/jarvis-use/SKILL.md` | skill content | documentation | `plugin/skills/jarvis-setup/SKILL.md` | exact |
| `plugin/skills/jarvis-issues/SKILL.md` | skill content | documentation | the two sibling SKILL.md | exact |
| `plugin/skills/jarvis-use/references/tool-roster.md` | skill reference | on-demand retrieval | itself (already the correct 10-tool source) | self |
| `plugin/README.md` | prose surface | documentation | root `README.md` | role-match |
| `README.md` | prose surface | documentation | `plugin/README.md:3,7` (already states "ten") | role-match |
| `.claude/CLAUDE.md` | convention doc | documentation | `docs/code-standards.md` (it cites) | exact |
| `docs/code-standards.md` | convention doc | documentation | `.claude/CLAUDE.md` | exact |

**Read-only input, never edited here:** `setup.sh` (synced byte-identically from the private repo,
`.claude/CLAUDE.md:86`). It enters this phase only as a new `checks.yml` path-filter entry (D-14).

---

## Pattern Assignments

### 1. `scripts/check-plugin.mjs` (guard script, batch → exit code) — **CREATE**

**Git-tracked today:** no (`git ls-files -- scripts/check-plugin.mjs` → empty).
**Primary analog:** `scripts/check-manifests.mjs` (tracked).
**Secondary analog:** `scripts/verify-build.mjs` (tracked) for numbered dimensions.

**Shebang + header + the `process.cwd()` testability seam** — `scripts/check-manifests.mjs:1-16`.
This seam is what makes D-13's red-before-green protocol mechanical (`git worktree add /tmp/pre-fix`,
`cd` there, run the script unmodified). Copy it verbatim in shape:

```js
#!/usr/bin/env node
// SITE-07: three plugin-manifest invariants, zero-dependency ESM.
//
// All subject paths resolve against process.cwd() (not import.meta.url) — this
// is the testability seam that lets this script run unmodified against a
// scratch copy of the repo by changing the working directory before invoking it.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const MANIFEST_PATHS = [
  'plugin/.claude-plugin/plugin.json',
  'plugin/.cursor-plugin/plugin.json',
  '.codex-plugin/plugin.json',
]

const MCP_CONFIG_PATHS = ['plugin/.mcp.json', 'plugin/mcp.json']
```

**Failure collector — two variants exist; use the `verify-build.mjs` one.**
`check-manifests.mjs:18-23` has a message-only collector:

```js
let failed = false

function fail(message) {
  console.error(message)
  failed = true
}
```

`scripts/verify-build.mjs:37-41` has the **dimension-tagged** variant, which is the one P1–P5 need
(the new script has five named dimensions, the old one has three anonymous invariants):

```js
let failed = false
function fail(dimension, detail) {
  console.error(`${dimension}: ${detail}`)
  failed = true
}
```

**Numbered-dimension header comment convention** — `scripts/verify-build.mjs:2-26`. Each dimension
gets a name, a one-line contract, and the rationale/limitation inline. P1's stated limitation
("cannot detect the server registering an 11th tool", RESEARCH Target 6 § P1) belongs here, in this
exact style:

```js
// SITE-06: the standing dist-vs-contract assertion. Zero-dependency ESM.
//
// Dimensions:
//   V2 — built page set (dist/**/*.html, excluding 404.html) SET-EQUALS the
//        committed URL contract. A vanished page and an unexpected extra
//        page both fail — this is the leak guard (Pitfall 5) and the
//        no-link-rot mechanism (SITE-06) in one assertion.
//   V3 — every href/src in the built landing (dist/index.html) and docs home
//        (dist/docs/index.html) resolves to a real dist file. This is the
//        pre-deploy twin of the 01-01 live asset-404 bug.
```

**Read-parse-collect loop per subject file** — `check-manifests.mjs:25-40`. Note it `continue`s on
read failure instead of aborting, so one missing file does not mask other dimensions:

```js
// 1. Every manifest must parse as JSON.
const parsed = []
for (const relPath of MANIFEST_PATHS) {
  const absPath = resolve(process.cwd(), relPath)
  let raw
  try {
    raw = readFileSync(absPath, 'utf8')
  } catch (err) {
    fail(`${relPath}: could not read file (${err.message})`)
    continue
  }
  try {
    parsed.push({ path: relPath, data: JSON.parse(raw) })
  } catch (err) {
    fail(`${relPath}: JSON parse error — ${err.message}`)
  }
}
```

**Set-equality assertion shape (for P1's roster ↔ surface diff)** — `verify-build.mjs`'s V2, which
checks both directions so a missing name *and* an unexpected extra name both fail:

```js
for (const url of contractUrls) {
  if (!builtUrls.has(url)) fail('V2', `missing page: ${url}`)
}
for (const url of builtUrls) {
  if (!contractUrls.has(url)) fail('V2', `extra page not in contract: ${url}`)
}
```

**Exit-code contract + one-line `ok:` summary** — `check-manifests.mjs:65-69`. Single
`process.exit(1)` at the very end, after all dimensions have run, so one run reports every failure:

```js
if (failed) {
  process.exit(1)
}

console.log(`ok: ${MANIFEST_PATHS.length} manifests agree on version, MCP config pair byte-identical`)
```

`verify-build.mjs:239-241` shows the multi-dimension summary form the new script should imitate:

```js
console.log(
  `ok: V2 (${builtUrls.size} pages = contract), V3 (landing+docs-home assets), V4 (fonts), V5 (pagefind), V9 (sitemap), V10 (llms.txt) all green`
)
```

**Argv handling for the `--release` gate (P2b)** — `verify-build.mjs:29-30` is the in-repo precedent
for reading `process.argv` positionally with defaults; the new script needs a flag rather than a
positional, but the same "no arg parser, no dependency" rule applies:

```js
const distDir = process.argv[2] ?? 'dist'
const contractPath = process.argv[3] ?? 'design/url-contract.json'
```

**Directory-walk helper (P5 needs `existsSync` + mode bits, not a walk, but the import style is the
model)** — `verify-build.mjs:27-28, 43-51`:

```js
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
```

**Dimension inputs, with the exact current line the assertion must read:**

| Dim | Subject | Anchor line today |
|---|---|---|
| P1 | `plugin/skills/jarvis-use/references/tool-roster.md` `### <name>(` headings | `:7, :11, :15, :19, :23, :26, :31, :35, :39, :43` — exactly 10, verified |
| P1 | root `README.md:20` — `Nine MCP tools, exposed to any MCP client:` over a 9-row table (`:22-33`) with no `indexRepo` row | **red before green** |
| P1 | `.codex-plugin/plugin.json:25` — `… blast radius \u2014 through nine MCP tools.` | **red before green** |
| P1 | `plugin/skills/jarvis-use/SKILL.md:75` — `"find all callers of \`index_repo\`"`, `"call hierarchy of \`blast_radius\`"` | **red before green** |
| P1 | `plugin/README.md:3` (`ten MCP tools`) and `:7` (`Ten MCP tools`) — already green, must stay |
| P2a | `plugin/mcp.json` / `plugin/.mcp.json` `mcpServers.jarvis.args` → `"jarvis-mcp>=0.9.0"` (line 7 of both) |
| P3 | `.claude-plugin/marketplace.json` + `.cursor-plugin/marketplace.json` `plugins[0].source` = `"./plugin"` — neither file is read by any script today |
| P4 | `plugin/skills/{jarvis-setup,jarvis-use,jarvis-issues}/SKILL.md:4` → `version: "0.1.0"` ×3 | **red before green** |
| P5 | `plugin/.cursor-plugin/plugin.json:13` (`"logo": "assets/app-icon.png"`), `.codex-plugin/plugin.json:42-43` (`composerIcon`, `logo`) |

---

### 2. `plugin/commands/index.md` and `plugin/commands/status.md` (slash commands) — **CREATE**

**Git-tracked today:** no. `plugin/commands/` does not exist (`find plugin -type f` returns 15
files, none under `commands/`).

**NO IN-REPO ANALOG.** This repo has never shipped a `commands/` component for any client. Do not
invent one from the skills — a command file is a different component with a different frontmatter
contract.

**Schema source:** `06-RESEARCH.md` § *Target 1 — Slash commands (D-06)*, which supplies the
per-client discovery table, the "declare nothing in any manifest" conclusion (C-3), and the literal
recommended frontmatter block:

```markdown
---
name: index
description: Index or reindex this repository with jarvis so structural queries work.
argument-hint: "[path]"
disable-model-invocation: true
---
```

**Nearest structural sibling for the file *shape*** — `plugin/skills/jarvis-use/SKILL.md:1-5`, the
only frontmatter-bearing markdown in the tree. Note the quoted `description` (required when the
string contains a colon, `.claude/CLAUDE.md:130`) and that `---` is the file's first line:

```markdown
---
name: jarvis-use
description: "Use jarvis local-first code intelligence for code structure queries: Tree-sitter declaration outlines and definition navigation, SCIP references and hierarchies, natural-language semantic search, and status capability checks. Prefer over grep for indexed structural questions."
version: "0.1.0"
---
```

**Do not copy `version:` into the new command files** — D-11/P4 delete exactly that key.

**Body-convention analog** — `plugin/skills/jarvis-setup/SKILL.md:9` shows the sibling-cross-link
opening line that every shipped markdown body in this tree uses:

```markdown
Part of the jarvis toolkit. Siblings: `jarvis-use` (everyday queries), `jarvis-issues` (report bugs).
```

---

### 3. `plugin/hooks/hooks.json` + `plugin/hooks/cursor.json` (lifecycle hook configs) — **CREATE**

**Git-tracked today:** no. `plugin/hooks/` does not exist.

**NO IN-REPO ANALOG.** Nothing in this repo has ever declared a hook.

**Schema source:** `06-RESEARCH.md` § *Target 2 — Hooks (D-07)*, sub-section *"Schemas are two, not
three"*, which supplies both literal JSON bodies and the measured proof (`claude plugin validate
--strict` exit 1) that a merged file is invalid. Also `06-RESEARCH.md` § *C-2*.

**Nearest structural sibling for JSON house style** — `plugin/mcp.json` (tracked, 2-space indent per
`.claude/CLAUDE.md:108`, a plugin-root-relative command declaration):

```json
{
  "mcpServers": {
    "jarvis": {
      "command": "uvx",
      "args": [
        "--from",
        "jarvis-mcp>=0.9.0",
        "--python",
        ">=3.12",
        "jarvis-server"
      ]
    }
  }
}
```

**Manifest wiring, Cursor side only** — the single new field goes beside the existing declarations
in `plugin/.cursor-plugin/plugin.json:30-31`, which is the file's current tail:

```json
  "skills": "./skills/",
  "mcpServers": "./mcp.json"
```

becomes `"skills"`, `"mcpServers"`, `"hooks": "./hooks/cursor.json"`. **Add no `hooks` field to
`plugin/.claude-plugin/plugin.json` or `.codex-plugin/plugin.json`** (RESEARCH Target 2: an explicit
value *replaces* default discovery in Codex, and warns in Claude Code).

---

### 4. `plugin/hooks/jarvis-index-status.sh` (POSIX probe script) — **CREATE**

**Git-tracked today:** no.

**NO IN-REPO ANALOG that may be copied.** The only shell script in the tree is `setup.sh`, and it is
**sync-owned — never edited or imitated here** (`.claude/CLAUDE.md:16`, `:86`; verified
byte-identical to `../jarvis/setup.sh`, RESEARCH § C-5). `scripts/crawl-urls.sh` exists and is
tracked but is a docs-site crawler with an unrelated contract.

**Behaviour contract source:** `06-RESEARCH.md` § *Target 2 → "Silence when jarvis is absent"*,
which supplies the exit-0-always rule, the `jarvis list` TSV probe, the explicit
"do not fall back to `uvx`" prohibition, and the skeleton:

```sh
#!/usr/bin/env sh
# jarvis SessionStart probe. Always exits 0 and prints nothing unless it has
# something actionable to say — a non-zero exit or a stray byte becomes a
# visible "hook error" notice in Claude Code at every session start.
command -v jarvis >/dev/null 2>&1 || exit 0      # jarvis CLI not installed → silent
command -v git    >/dev/null 2>&1 || exit 0
git rev-parse --show-toplevel >/dev/null 2>&1 || exit 0
```

**The one in-repo convention that does transfer** — `.claude/CLAUDE.md:270`'s installer-function
pattern *"provenance rationale inline"*: every non-obvious guard in this repo's scripts carries its
reason in a comment on the same line, as the `check-manifests.mjs:4-6` seam comment does. Apply that
to the exit-0 rule and the no-`uvx` rule.

**Executable bit is a P5 assertion** (`fs.statSync(p).mode & 0o111`), so the create task must
`chmod +x` and the guard must prove it.

---

### 5. `plugin/agents/jarvis-navigator.md` (subagent) — **CREATE**

**Git-tracked today:** no. `plugin/agents/` does not exist — the only `agents/` paths in the tree are
the three per-skill Codex sidecars.

**NO IN-REPO ANALOG.** `plugin/skills/*/agents/openai.yaml` is a **different component at a different
level** (per-skill sidecar, YAML, Codex-only) and must not be used as a template. RESEARCH Target 3
confirms no collision; it also confirms the new file is a Claude/Cursor component that Codex ignores.

**Schema source:** `06-RESEARCH.md` § *Target 3 — Navigator subagent (D-08)*, which supplies the
supported-key list, the `hooks`/`mcpServers`/`permissionMode` exclusion, the
"do not allow-list namespaced MCP tool names" rule, and the literal frontmatter block.

**Nearest structural sibling (for what it is *not*)** — `plugin/skills/jarvis-use/agents/openai.yaml`
in full, so the planner can see the two are unrelated:

```yaml
interface:
  display_name: "jarvis Navigation"
  short_description: "Prefer jarvis MCP tools over grep for structural queries"
  default_prompt: "Use $jarvis-use to answer structural code questions via SCIP navigation (definition, references, call hierarchy) and search."
```

These three files stay byte-unchanged (D-08).

**Description-writing convention that does transfer** — `.claude/CLAUDE.md:130`: *"`description` is
the trigger surface — it must name the concrete situations that should invoke the skill"*. The
agent's `description` must name the multi-hop trigger ("what breaks if I change X") the same way
`jarvis-use/SKILL.md:3` names its triggers.

---

### 6. `plugin/skills/jarvis-setup/references/troubleshooting.md` (skill reference) — **CREATE**

**Git-tracked today:** no. `plugin/skills/jarvis-setup/references/` does not exist.

**Analog: `plugin/skills/jarvis-use/references/tool-roster.md`** (tracked) — the only existing
`references/` file, and the exact pattern D-10 names.

**Reference-file opening shape** — `tool-roster.md:1-5`, a title, a one-paragraph scope statement,
then a `## <Section>` heading that the retrieval command greps for:

```markdown
# jarvis tool roster

The 10 MCP tools registered by `jarvis-server`. All navigation tools take `repo` (the slug from `jarvis index`). On failure every tool returns `{"error": "..."}` rather than raising.

## Tool detail
```

**The on-demand retrieval command that must be mirrored back in `jarvis-setup/SKILL.md`** —
`plugin/skills/jarvis-use/SKILL.md:41`, verbatim:

```markdown
Full signatures and return shapes: `grep -nA20 "## Tool detail" references/tool-roster.md` (loaded on demand).
```

This is a mandated convention, not a preference: `.claude/CLAUDE.md:141` — *"On-demand references
over inlining: `jarvis-use/SKILL.md` points at `references/tool-roster.md` with an exact retrieval
command … instead of inlining 44 lines"*. The new setup reference needs its own `## <Heading>` and
its own exact `grep -n… references/troubleshooting.md` line in `jarvis-setup/SKILL.md`.

**Content being moved** — `plugin/skills/jarvis-setup/SKILL.md:81-92`, the `## 6. Troubleshooting`
heading plus its 8-row table. Header rows verified at `:83`:

```markdown
## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `command not found: jarvis` | The plugin runs the MCP *server* via `uvx` without installing the CLI, so all 10 tools can work while `jarvis` itself is absent. Fix: `uv tool install jarvis-mcp` (what step 2's setup.sh already runs by default) — or skip installing and run one-off commands as `uvx --from "jarvis-mcp>=0.9.0" --python ">=3.12" jarvis index /path/to/repo`. |
```

Note `:85` carries a `jarvis-mcp>=0.9.0` prose pin that D-03 must bump **in whichever file the row
ends up in**.

---

### 7. `.github/workflows/checks.yml` (CI config, event-driven) — **MODIFY**

**Git-tracked today:** yes.
**Analog: itself.** The file is 39 lines; both edit sites are excerpted in full.

**Path filters — duplicated verbatim across `push` (`:8-16`) and `pull_request` (`:17-25`). Every
addition must land in BOTH blocks:**

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'plugin/**'
      - '.codex-plugin/**'
      - '.claude-plugin/**'
      - '.cursor-plugin/**'
      - 'scripts/check-manifests.mjs'
      - '.github/workflows/checks.yml'
  pull_request:
    branches: [main]
    paths:
      - 'plugin/**'
      - '.codex-plugin/**'
      - '.claude-plugin/**'
      - '.cursor-plugin/**'
      - 'scripts/check-manifests.mjs'
      - '.github/workflows/checks.yml'
```

Additions per RESEARCH Target 7: `scripts/check-plugin.mjs`, `README.md`, `setup.sh`.
`plugin/commands/**`, `plugin/hooks/**`, `plugin/agents/**` need **no** entry — `plugin/**` covers
them.

**Run step — the new guard step is a sibling of this, at the same indentation:**

```yaml
jobs:
  manifest-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Check manifests
        run: node scripts/check-manifests.mjs
```

The vendor-validator steps (D-17) append after `Check manifests`; RESEARCH Target 6 supplies the
literal YAML and the pinning requirement.

**Header-comment convention** — `checks.yml:1-4` explains *why the workflow exists separately*. Any
new step whose trigger reasoning is non-obvious (the `setup.sh` filter entry, the pinned `claude`
install) gets the same treatment:

```yaml
# SITE-07: manifest-drift guardrails. Separate from deploy-pages.yml because
# that workflow is push-to-main + site-source path-filtered — a PR touching
# only a plugin manifest triggers nothing there. This workflow gives PR-time
# signal for exactly that change class.
```

---

### 8. `package.json` (project config) — **MODIFY**

**Git-tracked today:** yes.
**Analog: itself**, `package.json:9-15`. The new alias is one line beside `check:manifests`:

```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check:manifests": "node scripts/check-manifests.mjs",
    "verify": "node scripts/verify-build.mjs"
  },
```

→ add `"check:plugin": "node scripts/check-plugin.mjs"`. No `devDependencies` change — the guard is
zero-dependency, matching the two existing scripts.

---

### 9. The three `plugin.json` manifests — **MODIFY**

**Git-tracked today:** all yes.

**`plugin/.claude-plugin/plugin.json`** — edits: `version` `0.9.0` → target, plus `$schema` as the
first key (D-09 as amended by C-1: **this file only**). Current `:1-3`:

```json
{
  "name": "jarvis",
  "version": "0.9.0",
```

**`plugin/.cursor-plugin/plugin.json`** — edits: `version` at `:4`, plus the new `hooks` field.
Current `:1-4` and `:30-31`:

```json
{
  "name": "jarvis",
  "displayName": "jarvis",
  "version": "0.9.0",
```
```json
  "skills": "./skills/",
  "mcpServers": "./mcp.json"
}
```

**`.codex-plugin/plugin.json`** — three edits: `version` at `:3`, the "nine MCP tools" string at
`:25`, and the two dead-tag URLs at `:39-40`. **No `$schema`** (C-1: the Agent Plugins schema is
`additionalProperties: false` and excludes `skills` at `:21` and `interface` at `:22-45`).

Current `:25`, verbatim including the escaped em dashes:

```json
    "longDescription": "Indexes your own git repositories with SCIP indexers and Zoekt, then answers structural questions \u2014 go-to-definition, find-references, call/type hierarchy, document symbols, lexical and semantic search, and cross-repo blast radius \u2014 through nine MCP tools. Skills steer the agent toward structural queries over grep and handle setup, everyday use, and bug reporting.",
```

Current `:39-40`, both 404 today (verified in RESEARCH Target 5):

```json
    "privacyPolicyURL": "https://github.com/jarvis-intelligence/jarvis-index/blob/v0.9.0/plugin/README.md#privacy",
    "termsOfServiceURL": "https://github.com/jarvis-intelligence/jarvis-index/blob/v0.9.0/plugin/LICENSE",
```

Current `:42-43` — P5's asset-existence subjects, unchanged by this phase:

```json
    "composerIcon": "./plugin/assets/jarvis-small.svg",
    "logo": "./plugin/assets/app-icon.png",
```

**Binding convention:** `.claude/CLAUDE.md:131` — all three `version` fields move to the *same*
value in the *same* commit; `check-manifests.mjs:43-53` already enforces it.

---

### 10. Both `marketplace.json` files — **MODIFY (Claude only) / GUARD SUBJECT (both)**

**Git-tracked today:** both yes.

Neither file is read by any script today (`check-manifests.mjs:10-14` covers only the three
`plugin.json`) — P3 is the first assertion over them. `.claude-plugin/marketplace.json` optionally
gains `$schema` (C-1); `.cursor-plugin/marketplace.json` likely needs **no edit**, only P3 coverage.

**Both files share one shape; `.claude-plugin/marketplace.json` in full** — this is exactly what P3's
six sub-assertions read (`name` kebab-case, `owner.name`, `plugins[].name` matching `plugin.json`,
`plugins[].source` starting `./` with no `..`, no component fields in the entry):

```json
{
  "name": "jarvis",
  "metadata": {
    "description": "Local-first code intelligence for Claude Code — SCIP navigation and Zoekt search over your own repositories."
  },
  "owner": {
    "name": "phuongddx",
    "email": "95doanphuong@gmail.com"
  },
  "plugins": [
    {
      "name": "jarvis",
      "source": "./plugin",
      "description": "SCIP navigation and Zoekt search MCP server, plus skills for setup, everyday structural queries, and bug reporting."
    }
  ]
}
```

`.cursor-plugin/marketplace.json` is the same object with `owner` before `metadata` and a
Cursor-worded description. `source: "./plugin"` in both is the reason every new component must live
**inside `plugin/`**.

---

### 11. `plugin/mcp.json` + `plugin/.mcp.json` (MCP registration) — **MODIFY BOTH**

**Git-tracked today:** both yes.

One character changes in each, at line 7, and they must stay byte-identical
(`check-manifests.mjs:55-63` enforces it; `.claude/CLAUDE.md:132` mandates it). Full current
`plugin/mcp.json`:

```json
{
  "mcpServers": {
    "jarvis": {
      "command": "uvx",
      "args": [
        "--from",
        "jarvis-mcp>=0.9.0",
        "--python",
        ">=3.12",
        "jarvis-server"
      ]
    }
  }
}
```

**Hard constraints on the edit** (`.claude/CLAUDE.md:132`, `docs/code-standards.md:104-110`): stays a
`>=` floor, never exact-pinned, never below `0.6.0`, never gains `[semantic]`.

**Byte-identity assertion to copy into P2a's neighbourhood** — `check-manifests.mjs:55-63`:

```js
// 3. The two MCP config files must be byte-identical.
try {
  const [a, b] = MCP_CONFIG_PATHS.map((relPath) => readFileSync(resolve(process.cwd(), relPath)))
  if (!a.equals(b)) {
    fail(`${MCP_CONFIG_PATHS[0]} and ${MCP_CONFIG_PATHS[1]} differ — MCP registration must be byte-identical`)
  }
} catch (err) {
  fail(`could not compare ${MCP_CONFIG_PATHS.join(' / ')}: ${err.message}`)
}
```

P2a must **not** duplicate this — it asserts the *new* relation (floor shape, and floor ↔ manifest
version if the 0.9.1 option is taken).

---

### 12. The three `SKILL.md` files — **MODIFY**

**Git-tracked today:** all yes.

**Frontmatter edit (D-11 / P4), identical in all three** — `:1-5` of each. `jarvis-setup/SKILL.md`
shown; delete line 4 outright, do not relocate to `metadata.version`:

```markdown
---
name: jarvis-setup
description: Install and configure jarvis, the local-first structural code intelligence with an always-on Tree-sitter syntax baseline. Use when onboarding, running setup.sh, registering the MCP server, or indexing a repo for the first time.
version: "0.1.0"
---
```

`jarvis-use/SKILL.md:4` and `jarvis-issues/SKILL.md:4` carry the byte-identical `version: "0.1.0"`.

**`jarvis-use/SKILL.md` — remaining edits, all with exact anchors:**

- `:41` — the on-demand retrieval line (quoted in §6 above). **Keep as-is**; it is the pattern
  `jarvis-setup` must copy, not a defect.
- `:65-66` — prose pins inside the semantic-extra fenced block:
  ```markdown
    claude mcp add jarvis-semantic --scope user -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
    codex mcp add jarvis-semantic -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
  ```
- `:75` — the snake_case trigger examples, P1's forbidden-token subject:
  ```markdown
  Should trigger: "find all callers of `index_repo`", "where is `QueryService` defined", "call hierarchy of `blast_radius`", "list symbols in server.py".
  ```
  → `indexRepo`, `blastRadius`.
- `:60` mentions `scip expt-convert through v0.9.0` — that is an upstream **scip** version, not a
  jarvis pin. Do **not** rewrite it; P1/P2a must not flag it.

**`jarvis-setup/SKILL.md` — remaining edits (D-02's work concentrates here):**

- `:22` — the installer URL **stays on `main`** (D-05, RESEARCH Target 5). Do not tag-pin:
  ```markdown
  curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh
  ```
- `:81-92` — the troubleshooting table moves out (see §6), gaining a new `universal-ctags` / `sym:`
  row naming `sh setup.sh --only ctags` (RESEARCH § 8.4). The existing `:87` row already documents
  the identical flag-value/name mismatch for zoekt and is the row to imitate:
  ```markdown
  | `command not found: scip` / `zoekt-git-index` | `~/.jarvis/bin` is not on `PATH`. … Re-run `setup.sh --only zoekt --force` — the flag value is `zoekt` (not `zoekt-git-index`); it installs both `zoekt-git-index` and `zoekt-webserver` from the same tarball. … |
  ```
- The file never names `indexRepo` (verified: `grep -n indexRepo` returns nothing). D-02 requires
  adding it as the recovery tool. The phrasing to match is `jarvis-use/SKILL.md:23`'s decision-matrix
  row for `indexRepo`.
- `:29` (17 selections / 16 distributions) and `:66` (`--no-scip`) are **already correct** — leave.

**`jarvis-issues/SKILL.md`** — frontmatter edit only, plus D-18's re-verification of the five
limitations at `:27-31`. The row shape to preserve when correcting them:

```markdown
- `typeHierarchy` returns an error only on indexes built with an unpatched `scip` — the fix is `jarvis reindex <slug>` after re-running setup.sh, not a bug report. DO file a bug if it still errors on a freshly reindexed repo.
```

`.claude/CLAUDE.md:142` mandates this shape: *"State limitations as settled decisions with rationale
inline, never as TODOs."*

---

### 13. `plugin/skills/jarvis-use/references/tool-roster.md` — **MODIFY (light) / P1 SOURCE OF TRUTH**

**Git-tracked today:** yes.

This file is **already correct** on all 10 tools (`:1` title says "The 10 MCP tools registered by
`jarvis-server`"; the ten `### ` headings are verified at `:7, :11, :15, :19, :23, :26, :31, :35,
:39, :43`). P1 parses it; do not restructure the headings or P1's regex breaks.

Only edit needed: `:23-24` (`typeHierarchy`) carries the same upstream-scip `v0.9.0` mention as
`jarvis-use/SKILL.md:60` — leave it; and `:40` names `uv tool install "jarvis-mcp[semantic]"` with no
version floor — no D-03 edit required there.

**Heading shape P1 depends on** — copy nothing, but the parser must match this exact form:

```markdown
### documentSymbols(repo, path) → dict
### getIndexStatus(repo, repo_path=None) → dict
### indexRepo(path, semantic=false) → dict
```

---

### 14. `plugin/README.md` and root `README.md` (prose surfaces) — **MODIFY**

**Git-tracked today:** both yes.

**`plugin/README.md` — already green on the count, red on the pins.**
`:3` and `:7` are P1's positive subjects and must stay:

```markdown
Local-first code intelligence over your own indexed repositories. … Installs as a plugin for **Codex CLI**, **Claude Code**, and **Cursor**, exposing ten MCP tools and three agent skills.
```
```markdown
Ten MCP tools (navigation tools take `repo` = the slug from `jarvis index`):
```

D-03 prose pins at `:74`, `:75`, `:82`:

```markdown
  codex mcp add jarvis-semantic -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
  claude mcp add jarvis-semantic --scope user -- uvx --from "jarvis-mcp[semantic]>=0.9.0" --python ">=3.12" jarvis-server
```
```json
      "args": ["--from", "jarvis-mcp[semantic]>=0.9.0", "--python", ">=3.12", "jarvis-server"] } } }
```

`:88` is the local-first claim the hook script must not violate with a network call:

```markdown
jarvis is local-first. The only network egress is `uvx` fetching the published wheel on first server start, …
```

Also needs a sentence on the Codex hook-trust caveat (RESEARCH Target 2 § *Codex trust caveat*,
A2/open-question 5): do not promise the hook works in Codex.

**Root `README.md` — red before green on P1.** `:20` plus the 9-row table at `:22-33`:

```markdown
Nine MCP tools, exposed to any MCP client:

| | Tool | Answers |
|---|---|---|
| **Navigate** | `goToDefinition` | Where is `X` defined? |
…
| **Scope** | `blastRadius` | Which other indexed repos depend on this package |
| | `getIndexStatus` | Is this repo indexed, and is the index stale? |
```

Needs "Ten" plus an `indexRepo` row. The `plugin/README.md:7-11` list is the tone/ordering analog;
the existing 3-column grouped table (`Navigate` / `Search` / `Scope`) is the structure to extend —
`indexRepo` belongs under `Scope` beside `getIndexStatus`.

---

### 15. `.claude/CLAUDE.md` and `docs/code-standards.md` (convention docs) — **MODIFY**

**Git-tracked today:** both yes.

Required by RESEARCH § C-8: without this edit the project's own conventions instruct the next
contributor to re-add the key P4 rejects.

**`.claude/CLAUDE.md:129`** — the skill-file-shape bullet:

```markdown
- **Skill file shape** (from `docs/code-standards.md`): `SKILL.md` (required, YAML frontmatter `name` + `description` + `version`), optional `agents/openai.yaml` (Codex interface block with `interface.display_name` / `short_description` / `default_prompt`), optional `references/*.md` loaded on demand. See `plugin/skills/jarvis-use/`.
```

**`.claude/CLAUDE.md:136`** — the markdown-frontmatter bullet:

```markdown
- **Frontmatter:** docs pages carry only `description` (`docs/tools/go-to-definition.md:1-3`); skills carry `name`/`description`/`version`.
```

**`.claude/CLAUDE.md:269`** — the Key-Abstractions pattern line:

```markdown
- Pattern: `SKILL.md` with YAML frontmatter (`name`, `description` trigger surface, `version`),
```

**`docs/code-standards.md:137`** — the cited source both CLAUDE.md lines point at:

```markdown
Frontmatter carries `name`, `description`, and `version`. The `description` is the trigger
surface — it must name the concrete situations that should invoke the skill, because that string
is what the agent matches against.
```

`docs/code-standards.md:123` is already correct and needs no edit:

```markdown
- Skills need `name` **and** `description` in frontmatter. Ours already carry both.
```

**Scope discipline:** RESEARCH's *Project Constraints* section is explicit that a full CLAUDE.md
regeneration is out of scope — fix only where this phase's guards make a line false. The stale
`>=0.6.0` floor lines (`.claude/CLAUDE.md:17`, `:132`, `:198`, `:298`) and `"all 9 MCP tools"`
(`:204`) are in scope **only if** P1/P2a flag them; `.claude/**` is not in the `checks.yml` path
filter today and RESEARCH Target 7 does not propose adding it, so they will not be flagged.

---

## Shared Patterns

### S1 — Zero-dependency assertion script
**Source:** `scripts/check-manifests.mjs:1-16, 18-23, 65-69`
**Apply to:** `scripts/check-plugin.mjs`
ESM, `node:fs` + `node:path` only, `process.cwd()`-relative paths, `fail()` collector, single
terminal `process.exit(1)`, one-line `ok:` summary on success. No test framework, no linter, no
formatter exists in this repo (`.claude/CLAUDE.md:106`) — do not introduce one.

```js
let failed = false
function fail(dimension, detail) {
  console.error(`${dimension}: ${detail}`)
  failed = true
}
```

### S2 — Numbered dimensions with the limitation stated inline
**Source:** `scripts/verify-build.mjs:2-26`
**Apply to:** `scripts/check-plugin.mjs` (P1–P5), and to the `checks.yml` comment for any
non-obvious step. Every dimension gets a letter+number, a contract sentence, and — where the
assertion is weaker than it looks — the honest limitation in the same comment block.

### S3 — Synchronized triple-manifest bump
**Source:** `.claude/CLAUDE.md:131`; enforced by `scripts/check-manifests.mjs:43-53`
**Apply to:** all three `plugin.json`, in one commit, same value.

```js
// 2. All three manifests must declare the same version.
if (parsed.length === MANIFEST_PATHS.length) {
  const versions = parsed.map((m) => m.data.version)
  const allMatch = versions.every((v) => v === versions[0])
  if (!allMatch) {
    fail('version mismatch across plugin manifests:')
```

### S4 — Dual MCP config, byte-identical
**Source:** `scripts/check-manifests.mjs:55-63`; `.claude/CLAUDE.md:132`
**Apply to:** `plugin/mcp.json` + `plugin/.mcp.json`. Edit both or neither.

### S5 — On-demand references with an exact retrieval command
**Source:** `plugin/skills/jarvis-use/SKILL.md:41`; mandated at `.claude/CLAUDE.md:141`
**Apply to:** the new `jarvis-setup/references/troubleshooting.md` link line.

```markdown
Full signatures and return shapes: `grep -nA20 "## Tool detail" references/tool-roster.md` (loaded on demand).
```

### S6 — Duplicated push/pull_request path filter
**Source:** `.github/workflows/checks.yml:8-16` and `:17-25`
**Apply to:** every new guarded path — the two blocks are copy-paste twins and both must change, or
the guard silently never runs on one trigger class (D-14).

### S7 — Everything a marketplace install must see lives inside `plugin/`
**Source:** `.claude-plugin/marketplace.json` `plugins[0].source = "./plugin"` and
`.cursor-plugin/marketplace.json` (same value)
**Apply to:** `plugin/commands/`, `plugin/hooks/`, `plugin/agents/`, the new `references/` file.
Never place a new shipped component at repo root.

### S8 — Declare nothing; rely on default component discovery
**Source:** RESEARCH § C-3 and Target 1/2/3 recommendations. The only counter-example in the tree is
`plugin/.cursor-plugin/plugin.json:30-31` (`"skills"`, `"mcpServers"`), which is why Cursor sees the
skills at all.
**Apply to:** `commands/`, `agents/`, and Claude/Codex `hooks/`. The **single** new manifest path
field in this phase is Cursor's `"hooks": "./hooks/cursor.json"`.

### S9 — Red-before-green
**Source:** `.planning/MILESTONES.md` v0.7.3 precedent; D-13; mechanized by the `process.cwd()` seam
at `scripts/check-manifests.mjs:4-6`
**Apply to:** P1–P5. P1/P2a/P4 are naturally red on today's tree (anchors listed in §1). **P3 and P5
have no natural pre-fix failure** and need a deliberate scratch mutation in a worktree copy.

---

## No Analog Found

Files with no close match in this repository. The planner must use the named `06-RESEARCH.md`
section as the schema source and must **not** synthesize a template from an unrelated file.

| File | Role | Data flow | Schema source | Why no analog |
|---|---|---|---|---|
| `plugin/commands/index.md` | slash command | request-response | RESEARCH § *Target 1*, incl. the literal frontmatter block | No `commands/` component has ever shipped from this repo |
| `plugin/commands/status.md` | slash command | request-response | RESEARCH § *Target 1* | same |
| `plugin/hooks/hooks.json` | hook config (Claude+Codex) | event-driven | RESEARCH § *Target 2 → "Schemas are two, not three"*; § *C-2* | No hook has ever shipped from this repo |
| `plugin/hooks/cursor.json` | hook config (Cursor) | event-driven | RESEARCH § *Target 2*, Cursor block (camelCase `sessionStart`, flat `{command}`, optional `"version": 1`) | same |
| `plugin/hooks/jarvis-index-status.sh` | POSIX probe | transform, exit-0-always | RESEARCH § *Target 2 → "Silence when jarvis is absent"* | Only shell file in tree is `setup.sh`, which is sync-owned and must never be edited or imitated (`.claude/CLAUDE.md:16`, `:86`) |
| `plugin/agents/jarvis-navigator.md` | subagent | request-response (multi-hop) | RESEARCH § *Target 3*, incl. the supported-key list and the literal frontmatter | `plugin/skills/*/agents/openai.yaml` is a different component, different level, different client, different format |
| `scripts/check-plugin.mjs` P2b network dimension | guard sub-dimension | network probe | RESEARCH § *Target 6 → P2b* (`git ls-remote --tags origin`, skip-never-fail, `--release` gate) | Every existing script in `scripts/` that CI runs is hermetic; no in-repo precedent for a network-gated assertion |

---

## Metadata

**Analog search scope:** `plugin/**` (full `find`, 15 files), `scripts/**`, `.github/workflows/**`,
`.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `docs/code-standards.md`, `.claude/CLAUDE.md`,
`package.json`, `README.md`.
**Files scanned:** 22 read; 15-file `plugin/` tree enumerated; `git ls-files` run over every path
named in this document.
**Tracked-source gate:** passed — no `.gsd/capabilities/**` or other gitignored mirror exists in this
repo (`.gsd/` exists but holds only `dispatch-isolation-sentinel.json` — no `capabilities/` tree); every analog path above is git-tracked.
**Pattern extraction date:** 2026-09-11
