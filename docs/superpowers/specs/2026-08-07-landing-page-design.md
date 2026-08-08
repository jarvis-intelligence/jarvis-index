# Landing Page — Design Spec

**Date:** 2026-08-07
**Status:** Approved, ready for implementation planning
**Repo:** `jarvis-intelligence/jarvis-index`

## Goal

A public landing page marketing **jarvis the product line** (MCP server + Swift indexer + plugin
surface), hosted out of this repo — the only public one. Framing is *product-org*: jarvis
presented as a product with an architecture and a trajectory, not as a README with styling.

Deliverable: one self-contained `index.html`, authored as an Open Design project, droppable into
this repo for GitHub Pages later with no build step.

## Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Product-org page, not install funnel or proof page | User choice. Install is already one line in two READMEs; a page repeating it adds nothing. |
| D2 | Forward section is a **capability roadmap**, including Cloud | User choice, overriding the recommendation of principles-and-non-goals. See Risk R1. |
| D3 | Cloud = hosted indexing **+** team index sharing, opt-in | User answered "both". They compose: hosted indexing produces the index, team sharing distributes it. Enterprise self-hosted is a deployment mode of the same thing, not a separate product. |
| D4 | Visual direction: **technical editorial** | Carries architecture depth; reads as a company. Terminal-native caps structure; product SaaS implies a funded company that does not exist yet. |
| D5 | Local-first section precedes the Cloud roadmap | Reader anchors on the privacy guarantee first, so Cloud reads as opt-in extension. Reversed, privacy reads as a walk-back. |
| D6 | `semanticSearch` caveat stated on the page | Costs polish, saves support load. Burying it generates issues. |
| D7 | Single self-contained HTML, zero external requests | Works as an Open Design artifact and as a GitHub Pages file simultaneously. No build step, no CDN, no webfonts. |
| D8 | Palette and mark reused from the plugin manifest | `#3B82F6` / `#0F172A` and `plugin/assets/jarvis-small.svg` already ship. No invented brand. |

## Page architecture

Nine sections, in order:

1. Nav
2. Hero
3. Pipeline diagram
4. The nine tools
5. Install (three clients)
6. Local-first guarantees
7. How it's built
8. Roadmap (incl. Cloud)
9. Footer

Order is load-bearing at one point only: **6 before 8** (D5).

## Section specifications

Every factual string below has a source of truth in this repo. Implementation must copy from the
source, not from memory.

### 1. Nav

Inline SVG wordmark (from `plugin/assets/jarvis-small.svg`, 466 bytes) + links, each anchoring to
a named section: Tools (§4), Install (§5), Architecture (§7), Roadmap (§8), and an external GitHub
link. Sticky, hairline bottom border.

### 2. Hero

- **H1:** "Code intelligence that runs on your machine."
- **Sub:** SCIP navigation and Zoekt search over your own indexed repositories. Nine MCP tools for
  Claude Code, Codex CLI, and Cursor. No telemetry, no outbound calls during queries.
- **CTAs:** primary `Install` (anchor to §5), secondary `How it works` (anchor to §3).
- **Install command**, as selectable monospace text (no copy button — see Technical constraints):
  `curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh`
- **Small print:** macOS and Linux · MIT

No version string in the hero — it would go stale on the next plugin bump. Version appears in the
footer only, where it reads as metadata rather than a claim (R3).

Source: `README.md`, `.codex-plugin/plugin.json` (license).

### 3. Pipeline diagram

Inline SVG of the real pipeline:

```
language indexer  →  SCIP protobuf  →  jarvis index  →  SQLite + Zoekt      →  jarvis-server
(scip-swift /                                            + optional semantic     9 MCP tools
 scip-python /                                                                   over stdio
 scip-typescript /
 scip-java)
```

Caption states every arrow runs locally.

Source: `docs/system-architecture.md` § Indexing pipeline.

### 4. The nine tools

Three groups. Mono tool names, one line each.

- **Navigate:** `documentSymbols`, `goToDefinition`, `findReferences`, `callHierarchy`,
  `typeHierarchy`
- **Search:** `searchCode` (Zoekt lexical, lazy-started webserver), `semanticSearch` (vector +
  Zoekt + SCIP symbol-definition hybrid via reciprocal rank fusion)
- **Cross-repo & status:** `blastRadius` (2-hop package-dependency BFS across indexed repos),
  `getIndexStatus`

**Required footnote (D6):** `semanticSearch` needs the `[semantic]` extra, and the plugin's default
MCP registration deliberately omits it to keep cold start free of lancedb/torch — so it requires a
second, differently-named server registration (`jarvis-semantic`).

Source: `plugin/README.md`, `docs/system-architecture.md` § Notable architectural constraint.

### 5. Install

Three columns, verified commands per client:

- **Claude Code:** `/plugin marketplace add jarvis-intelligence/jarvis-index` then
  `/plugin install jarvis@jarvis`
- **Codex CLI:** `codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main`
  then `codex plugin add jarvis`
- **Cursor:** Dashboard → Plugins → Add Marketplace → Import from Repo (Teams/Enterprise), or
  `ln -s "$PWD/jarvis-index/plugin" ~/.cursor/plugins/local/jarvis`. State plainly that Cursor
  exposes no CLI for adding a marketplace.

Converging step below the columns: run `setup.sh`, then `jarvis index /path/to/repo`.

Source: `README.md`, `plugin/README.md` § Install.

### 6. Local-first guarantees

Four claims, each paired with its enforcement mechanism. All four are checkable, not promised.

| Claim | Enforcement |
|---|---|
| No telemetry, no analytics | No analytics code; no outbound calls during queries |
| Only network egress is the wheel fetch | `uvx` on first server start; plus one-time embedding-model download if `[semantic]` installed |
| Indexes are read-only | Opened `mode=ro&immutable=1` |
| Dependencies are pinned and verified | Exact commit/tag pins with written justifications; every tarball SHA256-verified before install |

Source: `docs/project-overview-pdr.md` NFR2–NFR4, `plugin/README.md` § Privacy.

### 7. How it's built

Three-repo model as a compact table or diagram:

| Repo | Role | Visibility |
|---|---|---|
| `jarvis` | Python MCP server (`jarvis-mcp` on PyPI) | Private |
| `scip-swift` | Swift SCIP indexer, reads IndexStoreDB | Public |
| `jarvis-index` | Installer, plugins, binary release assets, issues | Public |

Followed by the credibility detail: jarvis ships a **patched `scip`** because upstream through
v0.9.0 never populates `global_symbols.relationships` (scip-code/scip#464), which makes
`typeHierarchy` unanswerable. The fork carries the #465 fix. State the exit ramp: when upstream
merges #465 and cuts a release, jarvis repoints and deletes the build pipeline.

Source: `docs/system-architecture.md` § Workspace context, § Dependency sourcing map.

### 8. Roadmap (incl. Cloud)

Section heading must be explicitly labelled **not shipped**.

**Near term (local):**
- Public Cursor marketplace listing
- Intel-Mac Swift indexing (`scip-swift` x86_64 asset)
- `setup.sh --verify` for self-diagnosis of PATH shadowing and pin mismatches

**jarvis Cloud (opt-in):**
- Hosted indexing
- Team index sharing — index once in CI, teammates pull instead of each re-indexing
- Enterprise self-hosted as a deployment mode of the same thing

**Required line:** local stays the default; cloud is opt-in and never required.

Source: `docs/project-roadmap.md` § Candidate work (near-term items only). Cloud items are
user-directed and have no repo source — see Risk R1.

### 9. Footer

GitHub, PyPI (`jarvis-mcp`), Issues, docs, MIT, version.

## Visual system

- **Palette.** Single accent `#3B82F6`. Dark ground `#0F172A`, dark ink `#E2E8F0`. Light ground
  `#FCFCFD`, light ink `#0F172A`.
- **Type.** System sans stack for display, tight tracking. `ui-monospace` for every tool name,
  command, and path — mono is the accent voice and does the technical work a webfont otherwise
  would. No external fonts.
- **Layout.** ~1080px content column. Hairline rules as section dividers. Asymmetric two-column
  for §7.
- **Diagrams.** Hand-authored inline SVG driven by `currentColor` so they theme automatically.
- **Motion.** Hover and focus transitions only. `prefers-reduced-motion` respected.
- **Theming.** Complete light palette as tokens on bare `:root`; dark overrides under
  `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`; same tokens
  again under `:root[data-theme="dark"]`. `body` gets an explicit token background. The
  `[data-theme]` blocks exist for portability into hosts that stamp that attribute; the page itself
  ships no toggle, so in normal use the theme follows `prefers-color-scheme`.

## Technical constraints

- Open Design project `jarvis-landing`, entry file `index.html`.
- Single file: inline CSS, inline SVG, zero external requests (no CDN, fonts, images, scripts).
- **No JavaScript at all.** Consequences, both intentional: the install command is selectable text
  rather than a copy button, and there is no theme toggle (theme follows the OS). A page that
  claims no telemetry and runs zero scripts is trivially verifiable by View Source, which is worth
  more here than a copy affordance.
- Responsive: single column below 768px; tool grid 3 → 2 → 1.
- Wide content scrolls inside its own `overflow-x: auto` container; page body never scrolls
  horizontally.

## Accessibility

- Semantic landmarks (`header`, `main`, `nav`, `footer`), correct heading order, no skipped levels.
- Visible focus states on every interactive element.
- Contrast ≥ 4.5:1 for body text in both themes.
- Each diagram carries a text alternative; decorative SVG marked `aria-hidden`.

## Verification

1. Every command string byte-checked against `README.md` and `plugin/README.md`.
2. Tool names checked against `plugin/README.md` — exactly nine, spelled correctly.
3. File grepped for `http`, `src=`, `@import` to prove zero external requests (the install URL in
   the copy block is text content, not a fetch — verify by inspection).
4. Rendered at 375 / 768 / 1440 px, light and dark.
5. Heading order and landmark structure inspected.

## Out of scope

- GitHub Pages deployment workflow and custom domain.
- Analytics — would contradict the page's own local-first claim.
- New logo beyond the existing `jarvis-small.svg`.
- Docs or blog subpages.
- Pricing.

## Risks and follow-ups

**R1 — Cloud contradicts current published docs.** `docs/project-overview-pdr.md` lists
multi-tenancy under non-goals, `docs/project-roadmap.md` lists it under "explicitly not planned",
and the server pins `PROJECT = "_"` / `BRANCH = "_"` by design. Publishing a cloud roadmap while
those documents say the opposite is a visible inconsistency for anyone who reads both. Follow-up
(not part of this page's work): update the non-goals in both docs, or scope the cloud copy to
language those docs can support. Flagged and accepted by the user.

**R2 — Roadmap items are uncommitted scope.** `docs/project-roadmap.md` states plainly that none
of the candidate work is committed. The page must not imply dates or guarantees; the "not shipped"
label on §8 is the mitigation.

**R3 — Version drift (resolved).** A hardcoded version goes stale on the next plugin bump.
Resolved: no version in the hero, footer only. Residual exposure is one low-visibility string.

## Open questions

1. Does the cloud copy need a capture form / waitlist, or is it descriptive only? A form would
   require JS and an endpoint, both of which the current design rules out — so this would reopen
   the no-JavaScript constraint.
2. Is `docs/` non-goal reconciliation (R1) in scope for a follow-up task, or deliberately deferred?
