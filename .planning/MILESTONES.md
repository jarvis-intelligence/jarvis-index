# Milestones

## v0.7.3 Public Surface Rebuild (Shipped: 2026-08-23)

**Phases completed:** 5 phases, 19 plans, 43 tasks

**Key accomplishments:**

- Live docs restyled via two config lines (base '/jarvis-index/docs/', sitemap hostname trailing slash) and a committed post-deploy smoke probe that fails the deploy workflow loudly on any regression of the 2026-08-21 breakage class
- VitePress + hand-copied site/ replaced by one pinned Astro 5.18.2 + Starlight 0.37.7 project — 32 docs pages and the landing in a single dist/ artifact, deployed live on Node 22 with the smoke probe green
- Landing's dark-mode toggle re-keyed onto Starlight's own `starlight-theme`/`data-theme` contract (pre-paint, anti-FOUC), and Starlight's default-on Pagefind search index confirmed present and correctly wired across the docs corpus with zero code changes needed.
- Two zero-dependency Node assertion scripts (check-manifests.mjs, verify-build.mjs) now gate every deploy and every plugin-manifest PR, backed by a 34-entry committed URL contract and a proven, documented Astro redirects mechanism — all six of verify-build's failure modes and all three of check-manifests' were demonstrated red on scratch copies before being trusted green.
- Self-hosted brand-logo.html fonts closing the last third-party-font gap, a lookup-table 404 page, a 34-URL classification audit (keep x34, zero retires), the WR-01 link fix, and five deepened concept pages — all traced to `../jarvis` source.
- All 9 MCP tool reference pages rewritten with real request/response transcripts traced through `../jarvis` source and its test fixtures — flat freshness fields, nested range locations, the shared error contract, and the D-08 semanticSearch caveat as the phase's sole reference-page aside.
- Full 7-command CLI reference (6 `jarvis` subcommands + a new dedicated `jarvis-server` page) with every flag, default, and status value re-verified against the current `index_cli.py`, plus a rewritten one-click CLI overview.
- New Requirements & Limits page (matrix-first, D-14), the troubleshooting decision tree deepened with the three named failure modes and issue-mined entries with a locked anchor contract (D-12/D-13), and a byte-verbatim changelog page (D-15) — all diff/grep-proven against source truth.
- Four equal-footing client guides (Claude Code, Cursor, Codex CLI, and a new generic stdio fallback) each end with a working, floor-correct registration path and a Verify step; the integrations overview reaches all four in one click and the install guide now gates on the requirements page.
- The phase's core-value page set shipped: a new install-channels matrix page (four-channel table + synced client Tabs + honest MCP Registry deep-link table), the quickstart rewritten as a five-step self-verifiable journey with real works/broke transcripts at every step, and the docs home rebuilt as the journey entry point — all three build/verify green, all failure links anchor-true against plan 02-04's locked contract.
- Shipped the phase's final, strictly-last deliverable: `public/llms.txt` (an llmstxt.org-shaped agent index covering all 37 `/docs/` contract URLs, sections mirroring the Starlight sidebar) plus a permanent `V10` dimension in `scripts/verify-build.mjs` that guards its existence, shape, and link-origin/path integrity — landed RED (file absent, assertion failing) in its own commit before GREEN (file present, full verify green).
- Click-through demo panel with verbatim fixture JSON, honestly tiered 9-tool card grid with gate chips, 14-row language matrix mirroring requirements.md, and local-first privacy section.
- Two dark-mode-safe inline SVG architecture diagrams hand-adapted from .dot sources, with diagram semantic color tokens and mobile responsiveness fixes
- Self-hosted asciinema-player 3.17.0 assets, Discussions link in troubleshooting, URL crawl script with dual sets, claims-audit tooling with 44-row audit table, and Astro + Starlight Channel 5 sections in all three maintainer docs.

---
