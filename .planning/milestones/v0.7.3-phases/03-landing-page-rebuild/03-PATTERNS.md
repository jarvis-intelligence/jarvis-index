# Phase 3: Landing Page Rebuild - Pattern Map

**Mapped:** 2026-08-23
**Files analyzed:** 9
**Analogs found:** 8 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/landing/InstallWidget.astro` | component | event-driven (tab switch + clipboard) | `src/pages/index.astro` hero-side `.mono-box` + script | exact |
| `src/components/landing/DemoPanel.astro` | component | event-driven (step toggle) | `src/pages/index.astro` `.exchange` terminal pattern | role-match |
| `src/components/landing/ToolShowcase.astro` | component | static (build-time data) | `src/pages/index.astro` `.card-grid` + `.card` patterns | exact |
| `src/components/landing/LanguageMatrix.astro` | component | static (build-time data) | `src/content/docs/docs/guide/requirements.md` table + `landing.css` `.table-wrap` | exact |
| `src/components/landing/Badges.astro` | component | static (inline SVG) | `src/pages/index.astro` header inline SVG icons + `.closing` grid | role-match |
| `src/components/landing/Diagrams.astro` | component | static (inline SVG) | `src/pages/index.astro` pipeline `.diagram-wrap` + `.diagram` SVG | exact |
| `src/pages/index.astro` (rewrite) | route | request-response (static) | `src/pages/index.astro` (self) | self-rewrite |
| `src/styles/landing.css` (extend) | config (styles) | n/a | `src/styles/landing.css` (self) | self-extend |
| `design/tokens.css` (refine) | config (tokens) | n/a | `design/tokens.css` (self) | self-extend |
| `src/data/demo-scenarios.json` | data | static (build-time import) | `src/content/docs/docs/quickstart.mdx` fixture JSON blocks | data-source |
| `src/content/docs/docs/quickstart.mdx` (edit) | content | static | `src/content/docs/docs/quickstart.mdx` existing `Tabs syncKey="client"` | exact |

## Pattern Assignments

### `src/components/landing/InstallWidget.astro` (component, event-driven)

**Analog:** `src/pages/index.astro` lines 122-136 (hero-side `.mono-box` chips) + lines 408-441 (copy-to-clipboard script)

**Mono-box chip markup pattern** (lines 125-128):
```html
<button class="mono-box tap" type="button" data-copy="curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh">
  <span class="cmd">curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh</span>
  <span class="copy">Copy</span>
</button>
```

**Chip label pattern** (lines 124-125):
```html
<span class="chip-label">Install the binaries</span>
```

**Copy-to-clipboard JS pattern** (lines 420-439) — reuse verbatim, this script already delegates on `.mono-box[data-copy]`:
```js
document.querySelectorAll(".mono-box[data-copy]").forEach(function (box) {
  var label = box.querySelector(".copy");
  var timer;
  box.addEventListener("click", function () {
    var text = box.getAttribute("data-copy");
    var done = function () {
      box.setAttribute("data-copied", "true");
      label.textContent = "Copied";
      clearTimeout(timer);
      timer = setTimeout(function () {
        box.removeAttribute("data-copied");
        label.textContent = "Copy";
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { label.textContent = "Select manually"; });
    } else {
      label.textContent = "Select manually";
    }
  });
});
```

**Starlight Tabs syncKey pattern** — from `src/content/docs/docs/quickstart.mdx` lines 120-152:
```mdx
<Tabs syncKey="client">
  <TabItem label="Claude Code">
    ```sh
    /plugin marketplace add jarvis-intelligence/jarvis-index
    /plugin install jarvis@jarvis
    ```
    Full guide: [Claude Code](/integrations/claude-code/).
  </TabItem>
  <TabItem label="Cursor">
    ...
  </TabItem>
</Tabs>
```

**Sync contract** (from RESEARCH.md): the landing widget must read/write `starlight-synced-tabs__channel` in localStorage, using the same label strings ("Installer + uv", "Plugin marketplace", "Manual uvx") as the quickstart's `<Tabs syncKey="channel">`. The quickstart side uses native Starlight `Tabs`/`TabItem` — zero changes to Starlight internals. The landing side is a custom Astro component replicating the `role="tab"`/`aria-selected` semantics.

---

### `src/components/landing/DemoPanel.astro` (component, event-driven)

**Analog:** `src/pages/index.astro` lines 237-252 (`.exchange` terminal-chrome pattern)

**Exchange terminal pattern** (lines 237-252):
```html
<div class="exchange" data-od-id="usage-example">
  <div class="exchange-head">
    <span>Example exchange</span>
    <span>Illustrative</span>
  </div>
  <div class="exchange-body">
<pre class="ex-you">you   Who calls search_zoekt?</pre>
<pre class="ex-call">      → getIndexStatus(repo="jarvis", repo_path="~/src/jarvis")</pre>
<pre class="ex-out">      ← indexed · fresh at HEAD</pre>
<pre class="ex-call">      → findReferences(repo="jarvis", symbol="search_zoekt")</pre>
<pre class="ex-out">      ← 3 references
          src/search/zoekt.py:212
          src/router.py:88
          tests/test_search.py:41</pre>
  </div>
</div>
```

**Exchange CSS classes** from `landing.css` lines 383-414:
```css
.exchange {
  margin-top: 1.5rem;
  border-radius: var(--jv-radius-lg);
  background: var(--jv-chip-bg);
  color: var(--jv-chip-fg);
  box-shadow: inset 0 0 0 1px var(--jv-chip-ring), 0 18px 40px rgba(18, 24, 38, 0.18);
  overflow: hidden;
}
.exchange-head {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  font-family: var(--jv-mono); font-size: 0.6875rem;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: #9aa4ac;  /* → tokenize to var(--jv-muted-soft) */
}
.exchange-body { padding: 1.15rem 1.25rem; overflow-x: auto; }
.exchange-body pre { margin: 0; font-family: var(--jv-mono); font-size: 0.8125rem; line-height: 1.75; }
.exchange-body .ex-you { color: var(--jv-chip-fg); }
.exchange-body .ex-call { color: var(--jv-chip-accent); margin-top: 0.85rem; }
.exchange-body .ex-out { color: #9aa4ac; }  /* → tokenize to var(--jv-muted-soft) */
```

**Demo data source:** fixture JSON from `quickstart.mdx` lines 178-200 (getIndexStatus), lines 209-224 (goToDefinition), and `tools/find-references.md` lines 44-72 (findReferences). These go into `src/data/demo-scenarios.json`.

---

### `src/components/landing/ToolShowcase.astro` (component, static)

**Analog:** `src/pages/index.astro` lines 200-218 (`.card-grid` + `.card` skill cards) and lines 259-314 (install cards with `.mono-box`)

**Card grid + card pattern** (lines 200-218):
```html
<div class="card-grid cols-3">
  <article class="card" data-od-id="skill-card-setup">
    <span class="card-kicker">Skill 01 · Onboard</span>
    <h3>jarvis-setup</h3>
    <p>Prerequisites, <code>setup.sh</code>, MCP registration, and your first index...</p>
  </article>
  <article class="card accented" data-od-id="skill-card-use">
    <span class="card-kicker">Skill 02 · Every day</span>
    <h3>jarvis-use</h3>
    <p>The matrix below, plus one rule it applies before every call...</p>
  </article>
</div>
```

**Card CSS** from `landing.css` lines 416-447:
```css
.card-grid { display: grid; gap: 1.25rem; }
@media (min-width: 760px) { .card-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1080px) { .card-grid.cols-3 { grid-template-columns: repeat(3, 1fr); } }
.card {
  display: flex; flex-direction: column; min-width: 0;
  padding: 1.5rem; border-radius: var(--jv-radius);
  background: color-mix(in oklch, var(--jv-surface) 48%, transparent);
  box-shadow: inset 0 0 0 1px var(--jv-border), var(--jv-card-shadow);
}
.card.accented {
  background: color-mix(in oklch, var(--jv-surface) 70%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--jv-accent) 36%, transparent), var(--jv-card-shadow), 0 16px 34px -24px rgba(var(--jv-accent-shadow), 0.38);
}
.card-kicker {
  font-family: var(--jv-mono); font-size: 0.6875rem;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--jv-muted);
}
.card h3 { margin-top: 0.9rem; font-size: 1.25rem; font-weight: 700; }
.card > p { margin-top: 1rem; font-size: 0.875rem; line-height: 1.625; color: var(--jv-muted); }
```

**Gate chip extension:** extends `.surface-chip` (landing.css lines 310-334). Gate chip adds warning tone + link. Surface-chip base:
```css
.surface-chip {
  display: inline-flex; align-items: center; gap: 0.55rem;
  min-height: 2rem; padding-inline: 0.8rem; border-radius: 999px;
  background: color-mix(in oklch, var(--jv-surface) 45%, transparent);
  box-shadow: inset 0 0 0 1px var(--jv-border);
  font-size: 0.8125rem; font-weight: 500; color: var(--jv-muted);
}
```

---

### `src/components/landing/LanguageMatrix.astro` (component, static)

**Analog:** `src/content/docs/docs/guide/requirements.md` lines 8-23 (table data) + `src/pages/index.astro` lines 220-235 (`.table-wrap` + `.table-matrix` rendering pattern)

**Table data source** (requirements.md lines 8-23 — verbatim rows for the matrix):
```markdown
| Language | Navigation | Search | Caveat |
|----------|:----------:|:------:|--------|
| TypeScript / TSX | Yes | Yes | — |
| Python | Yes | Yes | — |
| Java / Kotlin | Yes | Yes | [Android/Gradle](#androidgradle-...), [Kotlin version](#kotlin-...), [Maven on macOS](#java-...) |
| Swift | Yes | Yes | [Version floor + code-signed targets](#swift-...) |
| Go | No | Yes | — |
| Ruby | No | Yes | — |
| ... (14 rows total)
```

**Table rendering pattern** (index.astro lines 220-235):
```html
<div class="table-wrap">
  <table class="table-matrix">
    <thead><tr><th scope="col">What you ask</th><th scope="col">What jarvis-use runs</th></tr></thead>
    <tbody>
      <tr><td>Where is <code>X</code> defined?</td><td><code>goToDefinition(repo, X)</code></td></tr>
      ...
    </tbody>
  </table>
</div>
```

**Table CSS** from `landing.css` lines 472-487:
```css
.table-wrap { margin-top: 2.5rem; overflow-x: auto; border-radius: var(--jv-radius); box-shadow: inset 0 0 0 1px var(--jv-border); }
table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 0.875rem; }
th, td { padding: 1rem 1.25rem; text-align: left; vertical-align: top; border-top: 1px solid var(--jv-border); }
thead th { border-top: 0; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--jv-muted); background: color-mix(in oklch, var(--jv-surface) 50%, transparent); }
tbody td:first-child { font-weight: 600; color: var(--jv-fg); width: 34%; }
tbody td { color: var(--jv-muted); line-height: 1.6; }
.table-matrix tbody td:first-child { width: 52%; font-weight: 500; }
```

---

### `src/components/landing/Badges.astro` (component, static)

**Analog:** `src/pages/index.astro` lines 50-56 (header inline SVG icons) + lines 381-394 (`.closing` grid + CTA pattern)

**Inline SVG badge pattern** — header GitHub icon (lines 51-53) and PyPI icon (lines 54-56):
```html
<a class="icon-btn tap" href="https://github.com/jarvis-intelligence/jarvis-index" aria-label="jarvis on GitHub">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 .5 12..."/></svg>
</a>
<a class="icon-btn tap" href="https://pypi.org/project/jarvis-mcp/" aria-label="jarvis-mcp on PyPI">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8..."/></svg>
</a>
```

**Closing grid pattern** (lines 382-394):
```html
<section class="frame section">
  <div class="closing">
    <div>
      <p class="eyebrow">Built in the open</p>
      <h2 class="section-title">The installer, the indexer, and the issue tracker are public.</h2>
      <p class="section-lede">...</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
      <a class="primary-action tap" href="docs/">Read the docs <span aria-hidden="true">→</span></a>
      <a class="secondary-action tap" href="https://github.com/...">Open an issue</a>
    </div>
  </div>
</section>
```

**Closing CSS** (landing.css lines 502-503):
```css
.closing { display: grid; gap: 2rem; align-items: end; }
@media (min-width: 900px) { .closing { grid-template-columns: minmax(0, 1fr) auto; } }
```

Badge spec: 4 custom inline SVG badges (GitHub, PyPI, MIT, MCP Registry). Each uses `var(--jv-*)` for fills/strokes. Pill shape via `var(--jv-radius)`. Zero external requests.

---

### `src/components/landing/Diagrams.astro` (component, static)

**Analog:** `src/pages/index.astro` lines 148-188 (pipeline `.diagram-wrap` + inline SVG) + `landing.css` lines 449-470 (`.diagram` CSS classes)

**Diagram container + SVG pattern** (lines 153-186):
```html
<div class="diagram-wrap">
  <svg class="diagram" viewBox="0 0 980 226" role="img" aria-labelledby="pipe-title pipe-desc">
    <title id="pipe-title">The jarvis pipeline</title>
    <desc id="pipe-desc">Four stages, all on your machine...</desc>
    <rect class="machine" x="1" y="26" width="978" height="180" rx="14"/>
    <text class="m-label" x="26" y="52">YOUR MACHINE</text>
    <rect class="box" x="26" y="76" width="201" height="96" rx="8"/>
    <text class="t" x="46" y="118">Your repository</text>
    <text class="s" x="46" y="141">stays where it is</text>
    <path class="flow" d="M235 124 H253"/>
    <path class="flow-cap" d="M253 120 L261 124 L253 128 Z"/>
    <rect class="box-accent" x="508" y="76" width="201" height="96" rx="8"/>
    ...
  </svg>
</div>
<p class="caption">No step in this pipeline contacts a network service.</p>
```

**Diagram CSS classes** (landing.css lines 449-470):
```css
.diagram-wrap { margin-top: 3rem; overflow-x: auto; }
.diagram { min-width: 720px; width: 100%; height: auto; display: block; }
.diagram .box { fill: color-mix(in oklch, var(--jv-surface) 60%, transparent); stroke: var(--jv-border); stroke-width: 1; }
.diagram .box-accent { fill: color-mix(in oklch, var(--jv-accent) 8%, transparent); stroke: color-mix(in oklch, var(--jv-accent) 40%, transparent); stroke-width: 1; }
.diagram .t { fill: var(--jv-fg); font-family: var(--jv-mono); font-size: 13px; }
.diagram .s { fill: var(--jv-muted); font-family: var(--jv-mono); font-size: 11px; }
.diagram .flow { stroke: var(--jv-accent); stroke-width: 1.5; fill: none; }
.diagram .flow-cap { fill: var(--jv-accent); }
.diagram .machine { fill: color-mix(in oklch, var(--jv-accent) 4%, transparent); stroke: color-mix(in oklch, var(--jv-accent) 30%, transparent); stroke-width: 1; stroke-dasharray: 4 5; }
.diagram .m-label { fill: var(--jv-accent); font-family: var(--jv-mono); font-size: 10.5px; letter-spacing: 0.1em; }
.caption { margin-top: 1.25rem; font-size: 0.8125rem; color: var(--jv-muted); }
```

**.dot source geometry reference:** `../jarvis/docs/assets/jarvis-layers.dot` (44 lines, 7-layer architecture with runtime/indexing halves + storage seam) and `../jarvis/docs/assets/jarvis-index-pipeline.dot` (59 lines, preflight → full/search-only → terminal states with failure semantics). Hand-adapt SVGs strip hardcoded hex fills from graphviz output, replacing with `.diagram` CSS class references.

---

### `src/pages/index.astro` (route, static — rewrite)

**Analog:** `src/pages/index.astro` (self — full rewrite preserving structural contracts)

**Front matter / head pattern** (lines 1-26) — MUST survive:
```astro
---
import '../../design/tokens.css';
import '../styles/landing.css';
---
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>JARVIS — the intelligence system for your agents</title>
<meta name="description" content="...">
<link rel="icon" href="assets/jarvis-mark.svg" type="image/svg+xml">
<script is:inline>
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "starlight-theme";
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = (stored && stored !== "auto") ? stored : (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", theme);
})();
</script>
</head>
```

**Section skeleton pattern** — each section follows this structure:
```html
<section class="frame section" id="section-id" data-od-id="section-section-id">
  <div class="section-head">
    <div>
      <p class="eyebrow">Label</p>
      <h2 class="section-title">Heading</h2>
    </div>
    <p class="section-lede">Supporting text</p>
  </div>
  <!-- section content -->
</section>
```

**Header pattern** (lines 29-64) — retains sticky header, brand SVG, nav links, icon buttons, theme toggle. Nav anchors change to: Demo, Tools, Languages, Privacy, Architecture + Docs CTA button.

**Footer pattern** (lines 398-406) — retains `.site-footer` / `.footer-inner`, links updated to: MIT, GitHub, PyPI, MCP Registry, Discussions, Docs.

**Theme toggle script** (lines 408-418) — MUST survive unchanged.

---

### `src/styles/landing.css` (config, extend)

**Analog:** `src/styles/landing.css` (self — extend with new component classes)

**Non-tokenized literals to tokenize** (per RESEARCH.md):
- `#9aa4ac` at lines 374, 403, 414 → `var(--jv-muted-soft)` (new token)
- `#000` at lines 240-241 → `var(--jv-mask-opaque)` (new token, theme-invariant)

**New CSS classes needed** (per UI-SPEC.md):
- `.demo-panel`, `.demo-step`, `.demo-nav` — stepper layout extending `.exchange` pattern
- `.gate-chip` — extends `.surface-chip` with warning tone
- `.badge-row`, `.badge` — badge layout
- Diagram semantic colors — `.diagram .cluster-runtime`, `.diagram .cluster-index`, `.diagram .cluster-storage`, `.diagram .node-fail` for the two new diagrams

**Existing patterns to reuse for new classes:**
- `.note` (lines 489-501) — callout box with accent tint, for privacy section highlights
- `.section-head` (lines 63-72) — responsive section header (column on mobile, row on desktop)
- `.surface-chip` (lines 310-334) — base for `.gate-chip`
- `.closing` (lines 502-503) — grid for badges + CTA section

---

### `design/tokens.css` (config, refine)

**Analog:** `design/tokens.css` (self — refine in place)

**Current structure** (lines 31-72) — light `:root` block + dark `[data-theme='dark']` override block:
```css
:root {
  --jv-bg: #f3f7fa;
  --jv-surface: #e9edf2;
  --jv-fg: #12181d;
  --jv-muted: #58626a;
  /* ... 20+ tokens ... */
  --jv-ease: cubic-bezier(0.2, 0, 0, 1);
}
[data-theme='dark'] {
  --jv-bg: #040506;
  /* ... 11 dark overrides ... */
}
```

**New tokens to add** (per UI-SPEC.md + RESEARCH.md):
- `--jv-muted-soft` — light: `#9aa4ac` (current literal, AA-failing), dark: `#5a6168`+ (must pass 4.5:1 on `--jv-chip-bg`)
- `--jv-mask-opaque: #000` — theme-invariant (mask color is structurally invisible)
- Optional: `--jv-diagram-green` / `--jv-diagram-red` for pipeline diagram semantic node colors

**Refinement constraints:** refine values in place, never fork. Dark-mode contrast pass on `--jv-muted` and `--jv-accent`. Accent punch evaluation on `--jv-accent-strong` dark.

---

### `src/data/demo-scenarios.json` (data, static)

**Analog:** `src/content/docs/docs/quickstart.mdx` lines 172-239 (fixture JSON code blocks)

**getIndexStatus fixture** (quickstart.mdx lines 178-200):
```json
{
  "repo": "toy-repo",
  "indexed": true,
  "status": "indexed",
  "commit": "abc1234",
  "generated_at": "2026-07-08T12:00:00+00:00",
  "stale": false,
  "freshness": "fresh",
  "checked_at": "2026-07-08T12:00:05+00:00",
  "searchCoverage": { "expected": 120, "indexed": 120, "complete": true },
  "last_index_run": { "outcome": "indexed", "origin": "signature", "reason": null, "recovery": null },
  "capabilities": { "navigation": { "available": true, "reason": null, "recovery": null }, "search": { "available": true, "reason": null }, "semantic": { "available": false, "reason": "semantic index not built for this repo (requires the `semantic` extra)" } }
}
```

**goToDefinition fixture** (quickstart.mdx lines 209-224):
```json
{
  "symbol": "Greeter",
  "resolvedSymbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#",
  "definitions": [{ "path": "toy/greeter.ts", "range": { "start": { "line": 0, "character": 6 }, "end": { "line": 0, "character": 13 } } }],
  "commit": "abc1234", "generated_at": "2026-07-08T12:00:00+00:00", "stale": false, "freshness": "fresh", "checked_at": "2026-07-08T12:00:05+00:00"
}
```

**findReferences fixture** (tools/find-references.md lines 44-72):
```json
{
  "symbol": "greet",
  "resolvedSymbol": "scip-typescript npm @toy/pkg 0.0.1 src/`greeter.ts`/Greeter#greet().",
  "references": [
    { "path": "toy/constants.ts", "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 20 } } },
    { "path": "toy/greeter.ts", "range": { "start": { "line": 1, "character": 2 }, "end": { "line": 1, "character": 7 } } },
    { "path": "toy/greeter.ts", "range": { "start": { "line": 9, "character": 4 }, "end": { "line": 9, "character": 9 } } }
  ],
  "commit": "abc1234", "generated_at": "2026-07-08T12:00:00+00:00", "stale": false, "freshness": "fresh", "checked_at": "2026-07-08T12:00:05+00:00"
}
```

---

### `src/content/docs/docs/quickstart.mdx` (content, static — edit)

**Analog:** `src/content/docs/docs/quickstart.mdx` lines 118-152 (existing `Tabs syncKey="client"` for Step 4)

**Existing Tabs usage** (lines 120-152) — the channel widget mounts ABOVE Step 1 using the same Starlight `Tabs`/`TabItem` pattern with `syncKey="channel"`:
```mdx
<Tabs syncKey="channel">
  <TabItem label="Installer + uv">
    <!-- curl setup.sh command -->
  </TabItem>
  <TabItem label="Plugin marketplace">
    <!-- 3 client install commands -->
  </TabItem>
  <TabItem label="Manual uvx">
    <!-- uv tool install command -->
  </TabItem>
</Tabs>
```

**Label sync contract:** the three label strings MUST match exactly between this file and the landing's `InstallWidget.astro` component. The existing Step 4 tabs (`syncKey="client"`) remain untouched — different concern.

## Shared Patterns

### Anti-FOUC + Theme Persistence
**Source:** `src/pages/index.astro` lines 15-25 (head script) + lines 408-418 (toggle script)
**Apply to:** `src/pages/index.astro` rewrite — must survive unchanged
```html
<script is:inline>
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "starlight-theme";
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = (stored && stored !== "auto") ? stored : (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", theme);
})();
</script>
```

### Copy-to-Clipboard
**Source:** `src/pages/index.astro` lines 420-441
**Apply to:** `InstallWidget.astro` (all command chips), any new `.mono-box` instances

### Token-Driven Styling
**Source:** `design/tokens.css` (all `--jv-*` variables) + `landing.css` (all classes reference tokens)
**Apply to:** All new components — every color/font/spacing must use `--jv-*` tokens, no hardcoded hex

### Reduced Motion
**Source:** `landing.css` lines 22-25
**Apply to:** `DemoPanel.astro` stepper transitions — must collapse under `prefers-reduced-motion: reduce`
```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { transition: none !important; animation: none !important; }
}
```

### Section Skeleton
**Source:** `landing.css` lines 37-72 (`.frame`, `.section`, `.eyebrow`, `.section-title`, `.section-lede`, `.section-head`)
**Apply to:** Every new section in the rewritten `index.astro`

### Zero Third-Party Requests
**Source:** `scripts/verify-build.mjs` lines 161-171 (V4 font-origin check scans all built HTML/CSS)
**Apply to:** All new components — no external font links, no shields.io, no CDN assets. Badges are inline SVG.

### Base Path `/jarvis-index`
**Source:** `scripts/verify-build.mjs` line 35 (`const BASE = '/jarvis-index'`)
**Apply to:** All links in new components — absolute root-relative URLs with `/jarvis-index` prefix for docs links

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/data/demo-scenarios.json` | data | static | No `src/data/` directory exists yet — this is the first build-time data file. Pattern: plain JSON with typed scenario objects, imported via Astro's `import` in the front matter. No analog needed — trivial file. |

## Metadata

**Analog search scope:** `src/`, `design/`, `scripts/`, `../jarvis/docs/assets/` (.dot sources)
**Files scanned:** 12
**Pattern extraction date:** 2026-08-23
