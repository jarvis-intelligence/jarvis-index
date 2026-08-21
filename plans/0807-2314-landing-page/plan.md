> **SUPERSEDED — HISTORICAL (2026-08-21).** The jarvis identity source of truth is now [`design/tokens.css`](../../design/tokens.css) (`--jv-*` tokens). Do not implement from this artifact; it is retained as history only.

# jarvis Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single self-contained `site/index.html` landing page marketing jarvis the product line, mirrored into an Open Design project for live review.

**Architecture:** One HTML file, nine sections, inline CSS and inline SVG, zero external subresources and zero JavaScript. Authored in the repo so it is greppable and git-trackable; mirrored to Open Design project `jarvis-landing` after each section so the user can view progress.

**Tech Stack:** Hand-written HTML5 + CSS custom properties. No framework, no build step, no package manager, no JS.

**Spec:** `docs/superpowers/specs/2026-08-07-landing-page-design.md` (read it before starting)

## Global Constraints

Every task's requirements implicitly include this section.

- **Zero external subresources.** No `src=`, no `<link rel="stylesheet">`, no `@import`, no `url(http…)`, no webfonts, no CDN. External `<a href>` links to GitHub/PyPI are permitted — a link is not a request.
- **Zero JavaScript.** No `<script>` tag of any kind. Consequences are intentional: install command is selectable text, not a copy button; no theme toggle.
- **Single file.** Everything inline in `site/index.html`. This overrides the usual preference for small focused files — the spec's D7 requires one droppable file with no build step.
- **Palette, exact values:** accent `#3B82F6`, dark ground `#0F172A`, dark ink `#E2E8F0`, light ground `#FCFCFD`, light ink `#0F172A`.
- **No comments in the HTML/CSS** beyond section landmarks, per repo code standards.
- **Every factual string is copied from a repo source**, never from memory. Sources named per task.
- **No version string outside the footer.**
- **Content column** max-width `1080px`.
- **Contrast** ≥ 4.5:1 for body text in both themes.
- **`prefers-reduced-motion`** respected; motion limited to hover/focus transitions.

## File Structure

| Path | Responsibility |
|---|---|
| `site/index.html` | The entire page — markup, tokens, layout, all nine sections, inline SVG |

Only one file is created. Mirrored to Open Design project `jarvis-landing` as `index.html` at the end of each task.

**Why no split:** the spec's D7 constraint (single self-contained file, no build step, droppable into GitHub Pages) is incompatible with splitting CSS or partials into separate files. This is a deliberate deviation from the usual small-files preference, not an oversight.

---

### Task 1: Scaffold, design tokens, theming

**Files:**
- Create: `site/index.html`

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--bg-raised`, `--ink`, `--ink-muted`, `--rule`, `--accent`, `--accent-ink`, `--mono`, `--sans`, `--measure`; utility classes `.wrap`, `.section`, `.eyebrow`, `.scroll-x`. Every later task consumes these names exactly. Note `--rule` is a token, not a class — section dividers come from `.section`'s `border-top`.

- [ ] **Step 1: Create the working branch**

Currently on `main`. Do not commit the page to `main` directly.

```bash
cd /Users/ddphuong/Projects/jarvis-ai/jarvis-index
git checkout -b feat/landing-page
```

- [ ] **Step 2: Write the scaffold with the full token system**

Create `site/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>jarvis — local-first code intelligence</title>
<meta name="description" content="SCIP navigation and Zoekt search over your own indexed repositories. Nine MCP tools for Claude Code, Codex CLI, and Cursor.">
<style>
:root {
  --bg: #FCFCFD;
  --bg-raised: #FFFFFF;
  --ink: #0F172A;
  --ink-muted: #475569;
  --rule: #E2E8F0;
  --accent: #3B82F6;
  --accent-ink: #1D4ED8;
  --cta-bg: #1D4ED8;
  --cta-fg: #FFFFFF;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --measure: 1080px;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0F172A;
    --bg-raised: #16213A;
    --ink: #E2E8F0;
    --ink-muted: #94A3B8;
    --rule: #1E293B;
    --accent-ink: #93C5FD;
    --cta-bg: #3B82F6;
    --cta-fg: #0F172A;
  }
}
:root[data-theme="dark"] {
  --bg: #0F172A;
  --bg-raised: #16213A;
  --ink: #E2E8F0;
  --ink-muted: #94A3B8;
  --rule: #1E293B;
  --accent-ink: #93C5FD;
  --cta-bg: #3B82F6;
  --cta-fg: #0F172A;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 17px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
.wrap { max-width: var(--measure); margin: 0 auto; padding: 0 24px; }
.section { padding: 88px 0; border-top: 1px solid var(--rule); }
.section:first-of-type { border-top: 0; }
h1, h2, h3 { line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 16px; }
h1 { font-size: clamp(38px, 6vw, 62px); font-weight: 680; }
h2 { font-size: clamp(26px, 3.4vw, 34px); font-weight: 640; }
h3 { font-size: 17px; font-weight: 620; }
p { margin: 0 0 16px; color: var(--ink-muted); max-width: 62ch; }
code, pre { font-family: var(--mono); font-size: 14px; }
a { color: var(--accent-ink); }
a:focus-visible, :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.eyebrow {
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--ink-muted); margin: 0 0 12px;
}
.scroll-x { overflow-x: auto; }
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
@media (max-width: 767px) {
  .section { padding: 56px 0; }
}
</style>
</head>
<body>
<main class="wrap">
</main>
</body>
</html>
```

- [ ] **Step 3: Verify zero external subresources**

Run:

```bash
grep -nE 'src=|<link|@import|url\(http' site/index.html
```

Expected: no output (exit 1). Any match is a constraint violation.

- [ ] **Step 4: Verify zero JavaScript**

Run:

```bash
grep -nic '<script' site/index.html
```

Expected: `0`

- [ ] **Step 5: Verify both themes render**

Open `site/index.html` in a browser. Toggle OS appearance between light and dark. Expected: background flips between `#FCFCFD` and `#0F172A`, and the page never shows a transparent or white flash in dark mode.

- [ ] **Step 6: Commit**

```bash
git add site/index.html
git commit -m "feat(site): scaffold landing page with design tokens and theming"
```

- [ ] **Step 7: Create the Open Design project and mirror**

Call the Open Design MCP tool `create_project` with `name: "jarvis-landing"`. Then call `create_artifact` with `project: "jarvis-landing"`, `name: "index.html"`, and the full file contents. For every later task use `write_file` instead — `create_artifact` rejects existing targets.

---

### Task 2: Nav and hero

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: `.wrap`, `.section`, `--mono`, `--accent`, `--ink-muted` from Task 1.
- Produces: classes `.nav`, `.nav-inner`, `.brand`, `.nav-links`, `.hero`, `.cta`, `.cta-primary`, `.cmd`, `.fineprint`.
- Dangling anchors are expected here: this task's nav links point at `#tools`, `#install`, `#architecture`, `#roadmap`, and the hero's secondary CTA points at `#pipeline`. Those sections land in Tasks 3–8. All five resolve by the end of Task 8; do not "fix" them by removing links.

- [ ] **Step 1: Confirm the install command string against its source**

Run:

```bash
grep -n 'curl -fsSL' README.md
```

Expected output contains exactly:
`curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh`

Copy that string character-for-character into Step 3. Do not retype it.

- [ ] **Step 2: Add nav and hero CSS**

Insert before the closing `</style>`:

```css
.nav {
  position: sticky; top: 0; z-index: 10;
  background: var(--bg); border-bottom: 1px solid var(--rule);
}
.nav-inner {
  max-width: var(--measure); margin: 0 auto; padding: 14px 24px;
  display: flex; align-items: center; gap: 28px;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 640; letter-spacing: -0.01em; }
.brand svg { width: 26px; height: 26px; border-radius: 6px; display: block; }
.nav a { color: var(--ink-muted); text-decoration: none; font-size: 15px; }
.nav a:hover { color: var(--ink); }
.nav-links { display: flex; gap: 22px; margin-left: auto; }
.hero { padding: 104px 0 88px; }
.hero p.lede { font-size: 20px; max-width: 58ch; color: var(--ink-muted); }
.cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin: 32px 0 28px; }
.cta {
  display: inline-block; padding: 11px 20px; border-radius: 8px;
  border: 1px solid var(--rule); color: var(--ink); text-decoration: none;
  font-size: 15px; font-weight: 560; transition: border-color .15s ease;
}
.cta:hover { border-color: var(--accent); }
.cta-primary { background: var(--cta-bg); border-color: var(--cta-bg); color: var(--cta-fg); }
.cta-primary:hover { opacity: .92; }
.cmd {
  display: block; padding: 14px 16px; border-radius: 8px;
  background: var(--bg-raised); border: 1px solid var(--rule);
  color: var(--ink); white-space: pre; overflow-x: auto; max-width: 100%;
}
.fineprint { font-size: 14px; color: var(--ink-muted); margin-top: 14px; }
@media (max-width: 767px) {
  .nav-links { display: none; }
  .hero { padding: 64px 0 56px; }
}
```

Note: `.nav-links` is hidden below 768px rather than replaced with a menu — a menu would require JavaScript. Every nav destination remains reachable by scrolling.

- [ ] **Step 3: Add the nav and hero markup**

Replace `<main class="wrap">` and its empty body with:

```html
<header class="nav">
  <div class="nav-inner">
    <span class="brand">
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="12" fill="#0F172A"/>
        <circle cx="28" cy="28" r="12" fill="none" stroke="#3B82F6" stroke-width="4"/>
        <line x1="37" y1="37" x2="48" y2="48" stroke="#3B82F6" stroke-width="5" stroke-linecap="round"/>
      </svg>
      jarvis
    </span>
    <nav class="nav-links" aria-label="Main">
      <a href="#tools">Tools</a>
      <a href="#install">Install</a>
      <a href="#architecture">Architecture</a>
      <a href="#roadmap">Roadmap</a>
      <a href="https://github.com/jarvis-intelligence/jarvis-index">GitHub</a>
    </nav>
  </div>
</header>

<main>
  <section class="wrap hero">
    <h1>Code intelligence that runs on your machine.</h1>
    <p class="lede">SCIP navigation and Zoekt search over your own indexed repositories. Nine MCP tools for Claude Code, Codex CLI, and Cursor. No telemetry, no outbound calls during queries.</p>
    <div class="cta-row">
      <a class="cta cta-primary" href="#install">Install</a>
      <a class="cta" href="#pipeline">How it works</a>
    </div>
    <code class="cmd">curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh</code>
    <p class="fineprint">macOS and Linux · MIT</p>
  </section>
</main>
```

The `ci` text from the source SVG is dropped — the wordmark beside it already says the name, so the glyph would be redundant at 26px.

- [ ] **Step 4: Verify the command string matches its source exactly**

Run:

```bash
grep -oF 'curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh' site/index.html README.md
```

Expected: one match from each file. Zero matches from either file means a typo.

- [ ] **Step 5: Verify no version string in the hero**

Run:

```bash
grep -n '0\.7\.0' site/index.html
```

Expected: no output. Version belongs only in the footer, added in Task 9.

- [ ] **Step 6: Re-run the global constraint checks**

```bash
grep -nE 'src=|<link|@import|url\(http' site/index.html ; grep -nic '<script' site/index.html
```

Expected: no output from the first, `0` from the second.

- [ ] **Step 7: Commit and mirror**

```bash
git add site/index.html
git commit -m "feat(site): add nav and hero"
```

Mirror to Open Design with `write_file` (`project: "jarvis-landing"`, `path: "index.html"`).

---

### Task 3: Pipeline diagram

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: `.wrap`, `.section`, `.eyebrow`, `.scroll-x`.
- Produces: section id `#pipeline` (the hero's secondary CTA already targets it); class `.diagram`.

**Source of truth:** `docs/system-architecture.md` § Indexing pipeline.

- [ ] **Step 1: Add diagram CSS**

Insert before `</style>`:

```css
.diagram { margin-top: 28px; }
.diagram svg { width: 100%; height: auto; min-width: 680px; color: var(--ink-muted); }
.diagram .node { fill: none; stroke: currentColor; stroke-width: 1.5; }
.diagram .label { fill: var(--ink); font-family: var(--mono); font-size: 12px; }
.diagram .sub { fill: var(--ink-muted); font-family: var(--mono); font-size: 10.5px; }
.diagram .flow { stroke: var(--accent); stroke-width: 1.5; marker-end: url(#arrow); }
.caption { font-size: 14px; color: var(--ink-muted); margin-top: 16px; }
```

`min-width` plus the `.scroll-x` wrapper keeps the diagram legible on phones by scrolling it rather than crushing it. `currentColor` makes it theme automatically.

- [ ] **Step 2: Add the pipeline section markup**

Insert after the hero `</section>`:

```html
<section class="wrap section" id="pipeline">
  <p class="eyebrow">Pipeline</p>
  <h2>Index locally, query locally.</h2>
  <p>A language indexer emits SCIP protobuf. <code>jarvis index</code> converts it to SQLite and builds the Zoekt index. <code>jarvis-server</code> answers over stdio. Every arrow runs on your machine.</p>
  <div class="diagram scroll-x">
    <svg viewBox="0 0 980 190" role="img" aria-labelledby="pipeline-title pipeline-desc">
      <title id="pipeline-title">The jarvis indexing pipeline</title>
      <desc id="pipeline-desc">A language indexer — scip-swift, scip-python, scip-typescript, or scip-java — emits SCIP protobuf. The jarvis index command converts that into SQLite plus a Zoekt index and an optional semantic index. The jarvis-server process then answers nine MCP tools over stdio.</desc>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6"/>
        </marker>
      </defs>
      <rect class="node" x="1" y="40" width="196" height="92" rx="8"/>
      <text class="label" x="16" y="66">language indexer</text>
      <text class="sub" x="16" y="86">scip-swift · scip-python</text>
      <text class="sub" x="16" y="102">scip-typescript · scip-java</text>
      <line class="flow" x1="205" y1="86" x2="253" y2="86"/>
      <text class="sub" x="207" y="76">SCIP</text>
      <rect class="node" x="261" y="40" width="196" height="92" rx="8"/>
      <text class="label" x="276" y="66">jarvis index</text>
      <text class="sub" x="276" y="86">converts protobuf</text>
      <text class="sub" x="276" y="102">builds indexes</text>
      <line class="flow" x1="465" y1="86" x2="513" y2="86"/>
      <rect class="node" x="521" y="40" width="196" height="92" rx="8"/>
      <text class="label" x="536" y="66">SQLite + Zoekt</text>
      <text class="sub" x="536" y="86">+ optional semantic</text>
      <text class="sub" x="536" y="102">read-only at query time</text>
      <line class="flow" x1="725" y1="86" x2="773" y2="86"/>
      <rect class="node" x="781" y="40" width="196" height="92" rx="8"/>
      <text class="label" x="796" y="66">jarvis-server</text>
      <text class="sub" x="796" y="86">nine MCP tools</text>
      <text class="sub" x="796" y="102">over stdio</text>
    </svg>
  </div>
  <p class="caption">No step in this pipeline contacts a network service.</p>
</section>
```

- [ ] **Step 3: Verify the diagram has a text alternative**

Run:

```bash
grep -c '<desc id="pipeline-desc">' site/index.html
```

Expected: `1`. A `role="img"` SVG without `aria-labelledby` pointing at a real `<title>` and `<desc>` fails the spec's accessibility requirement.

- [ ] **Step 4: Verify theming and horizontal scroll**

Open in a browser at 375px width. Expected: the diagram scrolls inside its own container and the page body does **not** scroll horizontally. Switch to dark mode: node strokes and labels must remain readable.

- [ ] **Step 5: Commit and mirror**

```bash
git add site/index.html
git commit -m "feat(site): add indexing pipeline diagram"
```

Mirror with `write_file`.

---

### Task 4: The nine tools

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: `.wrap`, `.section`, `.eyebrow`.
- Produces: section id `#tools`; classes `.tool-grid`, `.tool`, `.tool-name`, `.note`.

**Source of truth:** `plugin/README.md` § What it gives you; `docs/system-architecture.md` § Notable architectural constraint.

- [ ] **Step 1: Add tool grid CSS**

```css
.group { margin-top: 36px; }
.group > h3 { color: var(--ink); margin-bottom: 14px; }
.tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 10px; overflow: hidden; }
.tool { background: var(--bg); padding: 18px 18px 20px; }
.tool-name { font-family: var(--mono); font-size: 13.5px; color: var(--accent-ink); display: block; margin-bottom: 6px; }
.tool p { font-size: 14.5px; margin: 0; }
.note { font-size: 14px; color: var(--ink-muted); border-left: 2px solid var(--accent); padding-left: 14px; margin-top: 32px; max-width: 66ch; }
@media (max-width: 900px) { .tool-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .tool-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Add the tools section markup**

```html
<section class="wrap section" id="tools">
  <p class="eyebrow">Tools</p>
  <h2>Nine MCP tools, grouped by what you are asking.</h2>
  <p>Each takes <code>repo</code> — the slug produced by <code>jarvis index</code>.</p>

  <div class="group">
    <h3>Navigate</h3>
    <div class="tool-grid">
      <div class="tool"><span class="tool-name">documentSymbols</span><p>Every top-level symbol in a file, each with its range.</p></div>
      <div class="tool"><span class="tool-name">goToDefinition</span><p>Resolve a symbol's definition site or sites.</p></div>
      <div class="tool"><span class="tool-name">findReferences</span><p>Every occurrence of a symbol.</p></div>
      <div class="tool"><span class="tool-name">callHierarchy</span><p>Single-level incoming and outgoing calls.</p></div>
      <div class="tool"><span class="tool-name">typeHierarchy</span><p>Supertypes and subtypes.</p></div>
    </div>
  </div>

  <div class="group">
    <h3>Search</h3>
    <div class="tool-grid">
      <div class="tool"><span class="tool-name">searchCode</span><p>Lexical search via Zoekt, on a lazy-started webserver.</p></div>
      <div class="tool"><span class="tool-name">semanticSearch</span><p>Vector, Zoekt, and SCIP symbol-definition hybrid, fused by reciprocal rank.</p></div>
    </div>
  </div>

  <div class="group">
    <h3>Cross-repo and status</h3>
    <div class="tool-grid">
      <div class="tool"><span class="tool-name">blastRadius</span><p>Two-hop package-dependency breadth-first search across indexed repos.</p></div>
      <div class="tool"><span class="tool-name">getIndexStatus</span><p>Whether a repo has a published index, and how fresh it is.</p></div>
    </div>
  </div>

  <p class="note"><strong>One caveat worth knowing up front.</strong> <code>semanticSearch</code> needs the <code>[semantic]</code> extra, and the plugin's default MCP registration deliberately omits it so cold start stays free of lancedb and torch. Using it means registering a second, differently-named server — <code>jarvis-semantic</code>.</p>
</section>
```

- [ ] **Step 3: Verify exactly nine tool names, all spelled correctly**

Run:

```bash
grep -o 'class="tool-name">[a-zA-Z]*' site/index.html | sed 's/.*>//' | sort > /tmp/page-tools.txt
printf 'blastRadius\ncallHierarchy\ndocumentSymbols\nfindReferences\ngetIndexStatus\ngoToDefinition\nsearchCode\nsemanticSearch\ntypeHierarchy\n' > /tmp/roster.txt
diff /tmp/page-tools.txt /tmp/roster.txt && echo "TOOLS OK"
```

Expected: `TOOLS OK`. Any diff means a missing, extra, or misspelled tool.

- [ ] **Step 4: Verify the semanticSearch caveat is present**

Run:

```bash
grep -c 'jarvis-semantic' site/index.html
```

Expected: `1`. Spec decision D6 requires this caveat; dropping it is a spec violation, not a polish call.

- [ ] **Step 5: Commit and mirror**

```bash
git add site/index.html
git commit -m "feat(site): add nine-tool roster with semantic search caveat"
```

Mirror with `write_file`.

---

### Task 5: Install

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: `.wrap`, `.section`, `.eyebrow`, `.cmd`.
- Produces: section id `#install`; classes `.cols`, `.col`.

**Source of truth:** `README.md` and `plugin/README.md` § Install.

- [ ] **Step 1: Read the exact commands from source**

Run:

```bash
grep -nE 'plugin marketplace add|plugin install|plugin add jarvis|ln -s' README.md plugin/README.md
```

Copy each command from this output. Do not retype from memory — the Codex URL and the `--ref main` suffix are easy to get subtly wrong.

- [ ] **Step 2: Add column CSS**

```css
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; }
.col { border: 1px solid var(--rule); border-radius: 10px; padding: 20px; background: var(--bg-raised); }
.col h3 { margin-bottom: 12px; }
.col .cmd { font-size: 12.5px; margin-bottom: 8px; background: var(--bg); }
.col p { font-size: 14px; }
.then { margin-top: 32px; }
@media (max-width: 900px) { .cols { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Add the install section markup**

```html
<section class="wrap section" id="install">
  <p class="eyebrow">Install</p>
  <h2>Three clients, one plugin directory.</h2>
  <div class="cols">
    <div class="col">
      <h3>Claude Code</h3>
      <code class="cmd">/plugin marketplace add jarvis-intelligence/jarvis-index</code>
      <code class="cmd">/plugin install jarvis@jarvis</code>
    </div>
    <div class="col">
      <h3>Codex CLI</h3>
      <code class="cmd">codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main</code>
      <code class="cmd">codex plugin add jarvis</code>
    </div>
    <div class="col">
      <h3>Cursor</h3>
      <p>Cursor exposes no CLI for adding a marketplace. On Teams or Enterprise: Dashboard → Plugins → Add Marketplace → Import from Repo. On any plan, symlink the plugin directory:</p>
      <code class="cmd">ln -s "$PWD/jarvis-index/plugin" ~/.cursor/plugins/local/jarvis</code>
    </div>
  </div>
  <div class="then">
    <h3>Then, on every client</h3>
    <p>Install the external binaries, then index a repo. <code>setup.sh</code> fetches seven dependencies into <code>~/.jarvis/bin</code>, verifies each tarball's SHA256, and skips whatever is already present.</p>
    <code class="cmd">jarvis index /path/to/repo</code>
  </div>
</section>
```

- [ ] **Step 4: Verify every command against its source**

Run:

```bash
for c in \
  '/plugin marketplace add jarvis-intelligence/jarvis-index' \
  '/plugin install jarvis@jarvis' \
  'codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main' \
  'codex plugin add jarvis' \
  'ln -s "$PWD/jarvis-index/plugin" ~/.cursor/plugins/local/jarvis' ; do
  grep -qF "$c" site/index.html && grep -qhF "$c" README.md plugin/README.md \
    && echo "OK   $c" || echo "FAIL $c"
done
```

Expected: five `OK` lines. Any `FAIL` means the page and the READMEs disagree — fix the page, not the README.

- [ ] **Step 5: Commit and mirror**

```bash
git add site/index.html
git commit -m "feat(site): add per-client install instructions"
```

Mirror with `write_file`.

---

### Task 6: Local-first guarantees

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: `.wrap`, `.section`, `.eyebrow`, `.scroll-x`.
- Produces: section id `#local-first`; class `.claims`.

**Source of truth:** `docs/project-overview-pdr.md` NFR2–NFR4; `plugin/README.md` § Privacy.

**Ordering requirement (spec D5):** this section must appear *before* the roadmap section from Task 8. Do not reorder.

- [ ] **Step 1: Add table CSS**

```css
.claims { width: 100%; border-collapse: collapse; margin-top: 28px; font-size: 15px; min-width: 560px; }
.claims th, .claims td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--rule); vertical-align: top; }
.claims th { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); font-weight: 600; }
.claims td:first-child { font-weight: 560; color: var(--ink); width: 38%; }
.claims td:last-child { color: var(--ink-muted); }
```

- [ ] **Step 2: Add the guarantees section markup**

```html
<section class="wrap section" id="local-first">
  <p class="eyebrow">Local-first</p>
  <h2>Four claims, each with the mechanism that enforces it.</h2>
  <p>These are checkable rather than promised.</p>
  <div class="scroll-x">
    <table class="claims">
      <thead><tr><th scope="col">Claim</th><th scope="col">Enforcement</th></tr></thead>
      <tbody>
        <tr><td>No telemetry, no analytics</td><td>No analytics code, and no outbound calls during queries.</td></tr>
        <tr><td>The only network egress is the wheel fetch</td><td><code>uvx</code> on first server start, plus a one-time embedding-model download if you install the <code>[semantic]</code> extra.</td></tr>
        <tr><td>Indexes are read-only</td><td>Opened <code>mode=ro&amp;immutable=1</code>.</td></tr>
        <tr><td>Dependencies are pinned and verified</td><td>Exact commit or tag pins, each with a written justification; every tarball SHA256-verified before install.</td></tr>
      </tbody>
    </table>
  </div>
</section>
```

Note `&amp;` — a bare `&` in `mode=ro&immutable=1` is invalid HTML.

- [ ] **Step 3: Verify the ampersand is escaped**

Run:

```bash
grep -c 'mode=ro&amp;immutable=1' site/index.html
```

Expected: `1`. If this returns `0`, check whether a bare `&` was written instead.

- [ ] **Step 4: Verify section order**

Run:

```bash
grep -n 'id="local-first"\|id="roadmap"' site/index.html
```

Expected at this point: only `local-first` (roadmap does not exist yet). After Task 8, `local-first` must have the lower line number.

- [ ] **Step 5: Commit and mirror**

```bash
git add site/index.html
git commit -m "feat(site): add local-first guarantees"
```

Mirror with `write_file`.

---

### Task 7: How it's built

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: `.wrap`, `.section`, `.eyebrow`, `.claims`, `.scroll-x`.
- Produces: section id `#architecture`.

**Source of truth:** `docs/system-architecture.md` § Workspace context and § Dependency sourcing map.

**Deliberate deviation from the spec's visual system:** the spec called for an asymmetric two-column
layout here. This task uses a full-width table plus prose instead, because the repo comparison is
three-column tabular data that a narrow column would force into horizontal scrolling on desktop.
Reuse of `.claims` also keeps one table style on the page rather than two. Flagged rather than
silently changed — reject this task if you disagree.

- [ ] **Step 1: Add the architecture section markup**

```html
<section class="wrap section" id="architecture">
  <p class="eyebrow">Architecture</p>
  <h2>Three repositories, one product.</h2>
  <div class="scroll-x">
    <table class="claims">
      <thead><tr><th scope="col">Repository</th><th scope="col">Role</th><th scope="col">Visibility</th></tr></thead>
      <tbody>
        <tr><td><code>jarvis</code></td><td>Python MCP server, published to PyPI as <code>jarvis-mcp</code>.</td><td>Private</td></tr>
        <tr><td><code>scip-swift</code></td><td>Swift SCIP indexer. Reads an Xcode IndexStoreDB and emits SCIP protobuf.</td><td>Public</td></tr>
        <tr><td><code>jarvis-index</code></td><td>Installer, plugins, binary release assets, issue tracker.</td><td>Public</td></tr>
      </tbody>
    </table>
  </div>
  <h3 style="margin-top:44px">Why jarvis ships a patched <code>scip</code></h3>
  <p>Upstream <code>scip</code> through v0.9.0 never populates <code>global_symbols.relationships</code>, which makes <code>typeHierarchy</code> unanswerable. jarvis builds from a fork carrying the fix and hosts the binary itself.</p>
  <p>The exit ramp is written down: when upstream merges the fix and cuts a release, jarvis repoints at it and deletes the build pipeline. A patched dependency is a liability to be retired, not a moat.</p>
</section>
```

- [ ] **Step 2: Verify the claim about upstream scip against its source**

Run:

```bash
grep -n 'global_symbols.relationships' docs/system-architecture.md site/index.html
```

Expected: a match in each file. This is the page's strongest credibility claim — it must match the documented reason exactly, not a paraphrase that drifts.

- [ ] **Step 3: Verify heading order is not broken**

Run:

```bash
grep -oE '<h[1-3]' site/index.html | sort | uniq -c
```

Expected: exactly one `<h1`, and no `<h3` appearing before the first `<h2` in document order. Confirm order by eye with `grep -n '<h[1-3]' site/index.html`.

- [ ] **Step 4: Commit and mirror**

```bash
git add site/index.html
git commit -m "feat(site): add three-repo architecture and patched scip rationale"
```

Mirror with `write_file`.

---

### Task 8: Roadmap including Cloud

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: `.wrap`, `.section`, `.eyebrow`, `.cols`, `.col`, `.note`.
- Produces: section id `#roadmap`.

**Source of truth:** `docs/project-roadmap.md` § Candidate work, near-term items only. Cloud items are user-directed and have no repo source — see the spec's risk R1.

**Two hard requirements from the spec, neither optional:**
1. The section must be visibly labelled *not shipped*.
2. It must carry the line that local stays the default and cloud is opt-in.

- [ ] **Step 1: Add roadmap CSS**

```css
.badge {
  display: inline-block; font-family: var(--mono); font-size: 11px;
  letter-spacing: 0.06em; text-transform: uppercase;
  border: 1px solid var(--rule); border-radius: 999px;
  padding: 4px 10px; color: var(--ink-muted); margin-left: 10px; vertical-align: middle;
}
.roadmap-list { margin: 0; padding-left: 20px; color: var(--ink-muted); font-size: 15px; }
.roadmap-list li { margin-bottom: 8px; }
```

- [ ] **Step 2: Add the roadmap section markup**

```html
<section class="wrap section" id="roadmap">
  <p class="eyebrow">Roadmap</p>
  <h2>What is next <span class="badge">Not shipped</span></h2>
  <p>Nothing below is available today, and none of it carries a date.</p>
  <div class="cols" style="grid-template-columns: repeat(2, 1fr)">
    <div class="col">
      <h3>Near term, local</h3>
      <ul class="roadmap-list">
        <li>A public Cursor marketplace listing.</li>
        <li>Swift indexing on Intel Macs, via an x86_64 <code>scip-swift</code> asset.</li>
        <li><code>setup.sh --verify</code>, to self-diagnose PATH shadowing and pin mismatches.</li>
      </ul>
    </div>
    <div class="col">
      <h3>jarvis Cloud, opt-in</h3>
      <ul class="roadmap-list">
        <li>Hosted indexing.</li>
        <li>Team index sharing — index once in CI, teammates pull instead of each re-indexing.</li>
        <li>Enterprise self-hosted, as a deployment mode of the same thing.</li>
      </ul>
    </div>
  </div>
  <p class="note">Local stays the default. Cloud is opt-in and never required — the guarantees above describe how jarvis behaves on your machine, and that does not change.</p>
</section>
```

- [ ] **Step 3: Verify both hard requirements are present**

Run:

```bash
grep -c 'Not shipped' site/index.html ; grep -c 'opt-in and never required' site/index.html
```

Expected: `1` and `1`. Both are spec requirements, not copy suggestions.

- [ ] **Step 4: Verify local-first precedes roadmap (spec D5)**

Run:

```bash
awk '/id="local-first"/{l=NR} /id="roadmap"/{r=NR} END{ if (l && r && l < r) print "ORDER OK"; else print "ORDER WRONG: local-first=" l " roadmap=" r }' site/index.html
```

Expected: `ORDER OK`

- [ ] **Step 5: Commit and mirror**

```bash
git add site/index.html
git commit -m "feat(site): add roadmap with opt-in cloud tier"
```

Mirror with `write_file`.

---

### Task 9: Footer, responsive pass, and full verification

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: everything above.
- Produces: the finished page.

- [ ] **Step 1: Read the current plugin version**

Run:

```bash
grep '"version"' .codex-plugin/plugin.json
```

Use that value in Step 3. It is the only place a version appears on the page.

- [ ] **Step 2: Add footer CSS**

```css
.foot { border-top: 1px solid var(--rule); margin-top: 24px; padding: 40px 0 64px; }
.foot-inner { max-width: var(--measure); margin: 0 auto; padding: 0 24px; display: flex; flex-wrap: wrap; gap: 18px 28px; align-items: center; font-size: 14px; color: var(--ink-muted); }
.foot a { color: var(--ink-muted); }
.foot a:hover { color: var(--ink); }
.foot .meta { margin-left: auto; font-family: var(--mono); font-size: 12.5px; }
@media (max-width: 620px) { .foot .meta { margin-left: 0; } }
```

- [ ] **Step 3: Add the footer**

Close `<main>` after the last `</section>`, then add the footer as a sibling of `<main>`, not a child of it:

```html
</main>
<footer class="foot">
  <div class="foot-inner">
    <a href="https://github.com/jarvis-intelligence/jarvis-index">GitHub</a>
    <a href="https://pypi.org/project/jarvis-mcp/">PyPI</a>
    <a href="https://github.com/jarvis-intelligence/jarvis-index/issues">Issues</a>
    <a href="https://github.com/jarvis-intelligence/jarvis-index/blob/main/plugin/README.md">Docs</a>
    <span class="meta">MIT · plugin v0.7.0</span>
  </div>
</footer>
```

Replace `0.7.0` with the value read in Step 1 if it differs.

- [ ] **Step 4: Run the full constraint sweep**

```bash
echo "--- external subresources (expect none) ---"
grep -nE 'src=|<link|@import|url\(http' site/index.html
echo "--- script tags (expect 0) ---"
grep -nic '<script' site/index.html
echo "--- landmarks (expect header, main, footer, nav) ---"
grep -oE '<(header|main|footer|nav)\b' site/index.html | sort | uniq -c
echo "--- h1 count (expect 1) ---"
grep -oc '<h1' site/index.html
```

Expected: no output from the first check; `0` scripts; one each of header/main/footer/nav; exactly one `h1`.

- [ ] **Step 5: Verify at three widths, both themes**

Open `site/index.html` in a browser. At 375px, 768px, and 1440px, in light and dark:

- The page body never scrolls horizontally. Only `.scroll-x` containers scroll.
- The tool grid goes 3 → 2 → 1 columns.
- Install columns collapse to one column below 900px.
- No element inherits a transparent background — the page never shows the host's ground through it.

Fix any failure before continuing.

- [ ] **Step 5a: Verify contrast against the spec's 4.5:1 floor**

Check these pairs in browser devtools (Inspect → Accessibility → Contrast). Expected ratios:

| Pair | Light | Dark | Expected |
|---|---|---|---|
| Body text: `--ink-muted` on `--bg` | `#475569` on `#FCFCFD` | `#94A3B8` on `#0F172A` | ≈7.5:1 / ≈7.4:1 |
| Headings: `--ink` on `--bg` | `#0F172A` on `#FCFCFD` | `#E2E8F0` on `#0F172A` | ≈16.9:1 / ≈14.5:1 |
| Links: `--accent-ink` on `--bg` | `#1D4ED8` on `#FCFCFD` | `#93C5FD` on `#0F172A` | ≈6.4:1 / ≈9.6:1 |
| Primary CTA: `--cta-fg` on `--cta-bg` | `#FFFFFF` on `#1D4ED8` | `#0F172A` on `#3B82F6` | ≈5.6:1 / ≈5.4:1 |
| Card text: `--ink-muted` on `--bg-raised` | `#475569` on `#FFFFFF` | `#94A3B8` on `#16213A` | ≈7.6:1 / ≈6.6:1 |

All five must clear 4.5:1 in both themes. The CTA row is the one that nearly failed — white on the
raw `#3B82F6` accent is only 3.1:1, which is why `--cta-bg` darkens to `#1D4ED8` in light mode and
the foreground flips to dark ink on the accent in dark mode. Do not "simplify" the CTA back to
`var(--accent)` with white text.

- [ ] **Step 6: Verify focus states are visible**

Tab through the page from the top. Every link and CTA must show a visible focus ring. If any element swallows focus, the `:focus-visible` rule from Task 1 was overridden — find and fix the override.

- [ ] **Step 7: Commit**

```bash
git add site/index.html
git commit -m "feat(site): add footer and complete responsive and accessibility pass"
```

- [ ] **Step 8: Final mirror to Open Design**

`write_file` with `project: "jarvis-landing"`, `path: "index.html"`. Confirm the artifact renders in Open Design, then report the project name to the user for review.

---

## Definition of Done

- `site/index.html` exists on branch `feat/landing-page` with all nine sections.
- Zero external subresources, zero `<script>` tags.
- Nine tool names match the roster exactly (Task 4 Step 3 prints `TOOLS OK`).
- All five install commands match the READMEs (Task 5 Step 4 prints five `OK` lines).
- `local-first` precedes `roadmap` (Task 8 Step 4 prints `ORDER OK`).
- Renders correctly at 375/768/1440 in both themes with no horizontal body scroll.
- Mirrored to Open Design project `jarvis-landing`.

## Deferred, not forgotten

- **Spec risk R1** — the cloud roadmap contradicts the non-goals in `docs/project-overview-pdr.md` and `docs/project-roadmap.md`. Reconciling those docs is a separate task and a decision for the user.
- **GitHub Pages deployment** — out of scope per the spec. Note that Pages serves only from the repo root or `/docs` on a branch; `site/` will need an Actions workflow or a move when deployment is taken up.
- **Cloud waitlist capture** — open question 1 in the spec. Would require JS and an endpoint, reopening the no-JavaScript constraint.
