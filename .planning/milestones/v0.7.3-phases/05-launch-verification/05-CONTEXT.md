# Phase 5: Launch Verification & Community - Context

**Gathered:** 2026-08-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Assemble and verify the finished public surface end-to-end and open the community channels: deploy the milestone to production (merge phase branch → main → Pages), run the clean-machine cold-install following only the published pages (recorded as the video walkthrough), audit every factual claim against shipped artifacts, crawl the old URL space against the live sitemap, update maintainer docs to the new site structure, and enable + link GitHub Discussions. Delivers VRFY-01..04 and COMM-01..02. Out of scope: new user-facing features, plugin changes (0.7.3 is shipped).

</domain>

<decisions>
## Implementation Decisions

### Deploy Sequencing
- Merge `gsd/phase-1-site-foundation-identity` → `main` with a **merge commit** (history preserved), push, let `deploy-pages.yml` deploy — at the START of Phase 5 execution; all launch verification runs against the LIVE final surface
- Deploy proof: `gh run watch` green + live URL checks; live sitemap equality via verify-build semantics

### Cold-Install Run & Video (VRFY-01, COMM-02)
- Clean machine = Docker container (fresh Linux env, isolated HOME) following the published quickstart verbatim — honest clean-room, honestly timed (record every wall-clock duration)
- Video = **asciinema terminal recording** (`.cast` file): self-hosted static asset (repo `public/`), player embed (`<script src=".../asciinema-player.min.js">` self-hosted too — zero third-party requests preserved) on the quickstart bottom ("Watch the cold install" section)
- If Docker is unavailable on this machine: record the temp-dir isolated Mac run and document the environment honestly (VRFY-01's "clean-machine" claim is then qualified; no silent substitution)

### Claims Audit, Crawl, Docs, Discussions
- VRFY-02 depth: every factual sentence on landing + quickstart + requirements traced to an artifact (README / CHANGELOG / synced setup.sh / manifests / `../jarvis` source); docs reference pages spot-audited; audit table committed as a phase artifact
- VRFY-03: crawl the 34 pre-rebuild URLs (Phase-2 classification table) against the LIVE site + live sitemap equality; every URL serves content or a redirect
- VRFY-04: deployment-guide / code-standards / system-architecture updated where they reference the old structure (src/ tree, Astro components, design tokens, new scripts)
- COMM-01: enable Discussions via `gh api` (admin account per STATE blocker notes); link from docs troubleshooting "Getting help" + landing footer; if the API auth is read-only, commit the docs links anyway and document the exact enable command as a maintainer step — no silent skip

### Claude's Discretion
- Audit table format, crawl script shape, and maintainer-docs wording, as long as every claim row carries its evidence pointer

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/verify-build.mjs` (V1–V10) — page-set/font/sitemap/llms.txt assertions; runs in CI on deploy
- `.github/workflows/deploy-pages.yml` — builds and deploys on push to main (Node 20 in CI; site builds on Node 22 locally — CI is the source of truth for the artifact)
- `.github/workflows/checks.yml` — runs check-manifests
- Phase-2 URL classification (02-01-SUMMARY) — the 34-URL keep list for the crawl
- `design/url-contract.json` — the canonical URL set
- Quickstart Step 5 fixtures — the tool-call shapes the cold-install run must reproduce
- `../jarvis/` private repo — source of truth for claims (README, CHANGELOG, server.py shapes)

### Established Patterns
- Zero third-party requests on the site (any video player must be self-hosted)
- Real-Chrome browser verification (never the harness headless)
- gh needs the phuongddx (admin) account for repo-admin APIs on jarvis-intelligence/jarvis-index; the v0.7.3 tag push succeeded with current auth — test Discussions API availability before relying on it
- Conventional commits, no AI attribution

### Integration Points
- Live site: https://jarvis-intelligence.github.io/jarvis-index/ (+ /docs/)
- MCP Registry entry: io.github.jarvis-intelligence/jarvis
- GitHub Discussions: repo Settings → Features (API: PUT /repos/{owner}/{repo}/community/discussions … verify exact endpoint at execution time)

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond the accepted decisions — standard approaches welcome.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
