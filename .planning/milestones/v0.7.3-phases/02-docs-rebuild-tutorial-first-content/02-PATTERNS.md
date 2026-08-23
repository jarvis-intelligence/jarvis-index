# Phase 2: Docs Rebuild — Tutorial-First Content - Pattern Map

**Mapped:** 2026-08-21
**Files analyzed:** 42 (32 deepen-in-place pages + 6 new content files + 4 mechanical files)
**Analogs found:** 40 / 42 (2 no-analog: `public/llms.txt`, 404 lookup page)

## File Classification

All files are docs-content or build-config; data flow is "static content → build → dist assertion" throughout. "Role" below uses docs-appropriate categories.

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/content/docs/docs/tools/*.md` (9 pages, deepen) | reference page | static content | `src/content/docs/docs/tools/go-to-definition.md` (structure ONLY — its JSON shapes are WRONG, see Shared Patterns) | exact-structure / wrong-data |
| `src/content/docs/docs/cli/*.md` (7 pages: 6 deepen + new `jarvis-server` page) | reference page | static content | `src/content/docs/docs/cli/index-cmd.md` | exact |
| `src/content/docs/docs/quickstart.md` → `.mdx` (deepen + rename) | tutorial page | static content | itself (voice baseline) + RESEARCH Code Example 4 for Tabs | exact-voice |
| `src/content/docs/docs/integrations/generic-stdio.md` (NEW) | install guide | static content | `src/content/docs/docs/integrations/cursor.md` | exact |
| `src/content/docs/docs/integrations/{claude-code,cursor,codex-cli}.md` (deepen) | install guide | static content | `cursor.md` (own skeleton) | exact |
| `src/content/docs/docs/guide/install-matrix.mdx` (NEW) | decision-surface page | static content | `cursor.md` (JSON block) + UI-SPEC layout contract 1 | role-match |
| `src/content/docs/docs/guide/requirements.md` (NEW) | decision-surface page | static content | `cli/index-cmd.md` (table conventions) + UI-SPEC layout contract 2 | role-match |
| `src/content/docs/docs/changelog.md` (NEW) | mirror page | static content | any stub for frontmatter; body is verbatim `../jarvis/CHANGELOG.md` | frontmatter-only |
| `src/content/docs/404.md` (NEW) | 404 route | static content | none in repo — RESEARCH Code Example 3 (Starlight `template: splash`) | no analog |
| `src/content/docs/docs/troubleshooting/{index,common-failures,upstream-issues}.md` (deepen) | troubleshooting page | static content | `troubleshooting/common-failures.md` (own skeleton) | exact |
| `src/content/docs/docs/concepts/*.md` (5 pages, deepen) | concept page | static content | own stubs, deepened in place | exact |
| `src/content/docs/docs/{index,tools/index,cli/index,integrations/index}.md` (deepen; WR-01 fix in `tools/index.md`) | overview page | static content | own stubs | exact |
| `astro.config.mjs` (sidebar entries; redirects only if a retire is flagged) | build config | config | its own sidebar groups (lines 54-116) + redirect discipline comment (119-142) | exact |
| `design/url-contract.json` (add ~6 URLs) | CI contract | config | its own `urls` array (trailing-slash form) | exact |
| `scripts/verify-build.mjs` (remove V4 exclusion) | CI assertion | config | lines 155-161 (the exclusion to delete) | exact |
| `public/brand-logo.html` + `public/fonts/*.woff2` (D-01 font fix) | static passthrough | static asset | lines 9-11 (delete) + 28-30 (family names to match); RESEARCH Code Example 5 | exact |
| `public/llms.txt` (NEW, strictly last) | agent index | static asset | none — llmstxt.org format per RESEARCH Pattern 5 | no analog |

## Pattern Assignments

### Tool reference pages (9× `src/content/docs/docs/tools/*.md`)

**Analog:** `src/content/docs/docs/tools/go-to-definition.md` — copy the SECTION STRUCTURE, replace every JSON payload.

**Frontmatter + heading pattern** (lines 1-8):
```markdown
---
title: goToDefinition
description: "goToDefinition — resolve where a symbol is defined."
---

# goToDefinition

Resolve `symbol`'s definition location(s) within `repo`.
```
Note: camelCase title/labels, kebab-case slug (WR-01 rule). Duplicate H1 exists in current stubs — UI-SPEC says title renders the H1; drop the body H1 when deepening for consistency with the changelog rule.

**Section skeleton to keep** (lines 10-58): `## Signature` (plain fenced signature line) → `## Parameters` (table `Name | Type | Required | Description` — UI-SPEC renames to `Parameter | Type | Required | Description`, uniform across all 9) → `## Returns` (json block) → `## Example` (**Call:** / **Response:** paired json blocks).

**DO NOT COPY the JSON content.** Lines 26-32 and 51-57 of the analog show `"startLine": 42` and `"freshness": { "indexed": true }` — both wrong (RESEARCH Pitfall 2). Every response block MUST use RESEARCH Product Truth §1-2 shapes: flat freshness fields (`"commit", "generated_at", "stale", "freshness", "checked_at"`) and nested `range: {start: {line, character}, end: {...}}` locations. Grep guard: no `startLine`/`startColumn` on nav tools; no nested `"freshness": {`.

**semanticSearch page only (D-08):** `:::caution` aside as the first element after the intro sentence — `[semantic]` extra + second MCP server + `--python 3.13` pin, framed as settled decision. Sole aside allowed across the 9 tool pages (UI-SPEC budget).

---

### CLI reference pages (7× `src/content/docs/docs/cli/*.md`, incl. new `jarvis-server.md`)

**Analog:** `src/content/docs/docs/cli/index-cmd.md` — this stub's structure AND flag data are already correct against `index_cli.py:1118-1177`.

**Skeleton** (lines 1-31):
```markdown
---
title: jarvis index
description: "jarvis index — index a repo for SCIP navigation and Zoekt search."
---

## Usage

```sh
jarvis index <path> [options]
```

## Arguments

| Name | Required | Description |
...

## Options

| Flag | Description |
| `--slug <name>` | Override the auto-derived slug |
...

## Behavior

1. **Language detection** — ...
```
New `jarvis-server` page follows the same skeleton (no flags; stdio MCP server; every MCP config names it). Sidebar label `jarvis-server`, placed after `jarvis watch` (UI-SPEC sidebar placement).

---

### `src/content/docs/docs/integrations/generic-stdio.md` (NEW)

**Analog:** `src/content/docs/docs/integrations/cursor.md` — same skeleton, equal footing (D-11).

**Skeleton to copy** (cursor.md lines 1-36): frontmatter → one-sentence intro → the verbatim `plugin/.mcp.json` block → `## Verify` closing step. The JSON block to reuse verbatim (cursor.md lines 22-31):
```json
{
  "mcpServers": {
    "jarvis": {
      "command": "uvx",
      "args": ["--from", "jarvis-mcp>=0.6.0", "jarvis-server"]
    }
  }
}
```
UI-SPEC adds: code-block `title="mcp.json"` attribute. Hard rules: keep `>=0.6.0` floor, never add `[semantic]`. Sidebar label "Any stdio client", after Codex CLI.

**Verify pattern** (cursor.md lines 33-36): "After registering, … ask the agent to call `getIndexStatus` with your repo slug."

---

### `src/content/docs/docs/quickstart.md` → `quickstart.mdx` (deepen)

**Analog:** the existing quickstart itself for voice (lines 22-37: imperative headings, second person, `sh` blocks, `:::tip[Optional extras]` at lines 48-51 — keep that aside). Its JSON examples (lines 85-111) are WRONG — replace per Product Truth.

**New step pattern (UI-SPEC rendering contract, replaces current free-form):**
```
## Step N: {imperative title}
{1–2 sentences, second person}
{command code block, sh}
**You'll know it works when…**
{expected output — real transcript per D-05}
**You'll know it broke when…**
{real failure shape} + one sentence → link to troubleshooting entry
```
Bold labels, not asides (greppable per DOCS-10 validation).

**Tabs pattern for "register per client" step** (RESEARCH Code Example 4; requires `.mdx` — URL unchanged, no contract edit):
```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs syncKey="client">
  <TabItem label="Claude Code">…</TabItem>
  <TabItem label="Cursor">…</TabItem>
  <TabItem label="Codex CLI">…</TabItem>
  <TabItem label="Any stdio client">…</TabItem>
</Tabs>
```
Canonical label set/order is locked site-wide (UI-SPEC). Requirements link ("check your language is supported" → `/guide/requirements/`) sits immediately before the install step's command block (D-14).

---

### `src/content/docs/docs/guide/install-matrix.mdx` and `guide/requirements.md` (NEW)

**Analogs:** table conventions from `cli/index-cmd.md` (Options table) and `common-failures.md`; structure locked by UI-SPEC Page Layout Contracts 1-2 — implement those exactly. install-matrix uses the same `<Tabs syncKey="client">` block as the quickstart. Commands verbatim from RESEARCH §6 (Cursor `cursor://` deeplink; Claude Code/Codex rows are commands with honest "no URL scheme" note).

Guide sidebar order becomes: Quickstart → Requirements & Limits → Install → Install Channels.

---

### `src/content/docs/docs/troubleshooting/*` (deepen, D-12/D-13)

**Analog:** own stubs — both structures are sound.
- Decision tree (`troubleshooting/index.md` lines 9-28): numbered branch pattern `1. Run \`jarvis status <slug>\`… - **Not indexed** → … - **Indexed** → continue.` with anchor links into common-failures/upstream-issues. Extend with uvx cold-start, PATH, scip version-gate leads + issues #4/#9/#10/#14 material.
- Entry pattern (`common-failures.md` lines 8-15): H2 symptom heading → `- **Cause:**` → `- **Fix:**` + fenced `sh` block. UI-SPEC formalizes as Symptom → Diagnosis → Fix.
- Settled-decision exemplar (`common-failures.md` lines 62-66): "**This is by design.** … It is not a bug." — copy this framing for issue #9 and blastRadius freshness.

---

### `src/content/docs/docs/changelog.md` (NEW, D-15)

**Analog:** any stub's frontmatter (title + description only). Body: `../jarvis/CHANGELOG.md` verbatim in full, source `# Changelog` H1 dropped. Validation: `diff <(tail -n +N src/content/docs/docs/changelog.md) <(tail -n +2 ../jarvis/CHANGELOG.md)` style check per RESEARCH. Sidebar: top-level link after Troubleshooting.

---

### `src/content/docs/404.md` (NEW, D-04) — no repo analog

Use RESEARCH Code Example 3 verbatim as the template:
```markdown
---
title: '404'
template: splash
editUrl: false
hero:
  title: 'Page not found'
  tagline: This URL moved during the docs rebuild — find its new home below.
---
| Old URL | New location |
```
Zero-retire empty state copy per UI-SPEC ("No URLs have been retired yet — …") + link list into the six sidebar groups. NOT added to url-contract (V2 excludes `404.html`, verify-build.mjs:76). Fallback if splash can't hold table+nav: `src/pages/404.astro` + `disable404Route: true`.

---

### `astro.config.mjs` (sidebar + possible redirects)

**Analog:** its own sidebar groups. Copy entry shape from lines 57-60:
```js
{ label: 'Quickstart', link: 'docs/quickstart' },
```
Links are `docs/`-prefixed, no leading slash, no trailing slash. New entries: `docs/guide/requirements`, `docs/guide/install-matrix`, `docs/integrations/generic-stdio`, `docs/cli/jarvis-server`, `docs/changelog`.

**Redirect pattern if any retire lands** (discipline comment lines 119-142 — destination MUST be `${BASE}`-prefixed):
```js
redirects: {
  '/docs/old-path/': `${BASE}/docs/new-path/`,
},
```

---

### `design/url-contract.json`

**Analog:** its own `urls` array — trailing-slash form, e.g. `"/docs/guide/install/"`. Add (same commit as the page + sidebar entry): `/docs/guide/requirements/`, `/docs/guide/install-matrix/`, `/docs/integrations/generic-stdio/`, `/docs/cli/jarvis-server/`, `/docs/changelog/`. Do NOT add `/llms.txt` or the 404. Also update the `generated_from` note's brand-logo.html sentence once D-01 lands (classification decided: keep).

---

### `scripts/verify-build.mjs` (V4 exclusion removal, D-01)

**Analog:** the exact code to delete, lines 156-161:
```js
// public/brand-logo.html is a preserved legacy passthrough page (see header
// comment) — excluded from this dimension pending Phase 2 classification.
const V4_EXCLUDED = new Set([join(distDir, 'brand-logo.html')])

const scannableForFonts = allFiles.filter(
  (f) => (f.endsWith('.html') || f.endsWith('.css')) && !V4_EXCLUDED.has(f)
)
```
Delete `V4_EXCLUDED` and its filter clause; also trim the stale V4 header-comment sentence (lines 13-17). Ship in the SAME commit as the brand-logo font replacement or V4 goes red (Pitfall 6).

---

### `public/brand-logo.html` + `public/fonts/` (D-01)

**Analog:** the file itself. Delete the three CDN lines (9-11):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono...&display=swap" rel="stylesheet">
```
Replace with RESEARCH Code Example 5's inline `@font-face` block (relative `fonts/...` URLs; family names "Geist" / "Geist Mono" / "Rajdhani" must match the existing `--sans/--mono/--logo` stacks at lines 28-30 — no other CSS changes). Copy 4 woff2 files from installed `node_modules/@fontsource*/…/files/` into `public/fonts/` with stable un-hashed names. Then mark WINDOWS.md id 4 fixed.

---

### `public/llms.txt` (02-05, strictly last) — no repo analog

llmstxt.org format per RESEARCH Pattern 5: H1 name → blockquote summary → `##` sections of `[Name](URL): description`; absolute URLs derived only from `design/url-contract.json`. Static hand-authored file (or ~40-line zero-dep node script matching `scripts/verify-build.mjs`'s zero-dep style). NOT in url-contract (Pitfall 4); optional one-line existence check may extend verify-build.

## Shared Patterns

### 3-file atomic ADD commit (every new page)
**Source:** discipline comment `astro.config.mjs:125-131` + V2 set-equality `scripts/verify-build.mjs:80-85`
**Apply to:** all 5-6 new pages
Content file + `design/url-contract.json` URL + `astro.config.mjs` sidebar entry, one commit. Verify each commit with `npm run build && npm run verify`.

### Frontmatter contract
**Apply to:** every content file
`title` + `description` only; `title` is MANDATORY (missing title silently drops the page). No duplicate body H1 on new/deepened pages.

### Verbatim-shapes-only JSON (D-05 / Pitfall 2)
**Apply to:** quickstart + all 9 tool pages
Every JSON example traces to RESEARCH Product Truth §1-2 (flat freshness, nested ranges, `resolvedSymbol` only-when-changed rule, ambiguous-`candidates` transcript from test_server_tools.py:123-127). The existing stubs are anti-analogs for data.

### Internal link form (Pitfall 3 / WR-01)
**Apply to:** every page
Docs-root-relative trailing-slash links (`/tools/find-references/`); `rebaseDocsLinks()` (astro.config.mjs:18-30) rebases them. Kebab-case targets, camelCase labels. Fix `tools/index.md:15` `/tools/findReferences` in the content pass.

### Aside budget (UI-SPEC)
**Apply to:** all pages
`:::caution` only for settled-decision caveats (semanticSearch top-box, Kotlin/Android degrade notes); max one aside per tool page; quickstart success/failure uses bold labels + code blocks, never asides. No `<style>`/inline styles anywhere under `src/content/docs/`.

### Code-block tagging (UI-SPEC)
`sh` for commands (no title), `json` for payloads, `title="<filename>"` on config-file blocks. No line highlighting/diff/collapsible.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/content/docs/404.md` | 404 route | static content | No custom 404 exists; use RESEARCH Code Example 3 (Starlight docs pattern) |
| `public/llms.txt` | agent index | static asset | New file class; llmstxt.org spec is the template |

## Metadata

**Analog search scope:** `src/content/docs/**`, `astro.config.mjs`, `design/url-contract.json`, `scripts/verify-build.mjs`, `public/`, git history of contract commits
**Files scanned:** 33 content files (inventoried), 8 read in full/targeted
**Pattern extraction date:** 2026-08-21
