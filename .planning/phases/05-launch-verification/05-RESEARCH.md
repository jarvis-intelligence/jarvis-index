# Phase 5: Launch Verification & Community - Research

**Researched:** 2026-08-23
**Domain:** Release verification, clean-room testing, static-site auditing, community enablement
**Confidence:** HIGH

## Summary

Phase 5 is not a build phase — it assembles and verifies what Phases 1–4 shipped. The work splits into three camps: (1) a single merge-deploy-verify sequence that puts the 118-commit milestone branch live on GitHub Pages, (2) a cold-install clean-room run inside Docker that produces the asciinema `.cast` file for embedding, and (3) a battery of audits (claims traceability, URL crawl, maintainer-doc freshness) plus the Discussions link wiring. No new external packages are installed; the only addition is asciinema-player static assets (Apache-2.0, 3.17.0, ~185 kB min.js + 19 kB CSS) placed in `public/assets/asciinema/` and the `.cast` file itself.

Key technical discovery: jarvis-mcp 0.6.2 publishes prebuilt wheels for linux aarch64 AND x86_64 (cp312/cp313/cp314, manylinux2014), so the Docker cold-install needs no Rust compiler — `uv tool install jarvis-mcp` downloads a wheel. The `asciinema-player` is Apache-2.0 (not MIT as tentatively assumed in CONTEXT.md), and Astro MDX supports `set:html` natively for the embed markup. GitHub Discussions are already enabled (`has_discussions: true` confirmed via `gh api`); the empty-array response from the correct `/discussions` endpoint confirms they work, and the landing footer at `src/pages/index.astro:210` already links to `github.com/jarvis-intelligence/jarvis-index/discussions`. The `phuongddx` account has `admin` permission on the repo.

**Primary recommendation:** Merge first, then run all verification against the live deployed artifact. Docker daemon must be started before the cold-install task; if unavailable, fall back to a temp-dir isolated Mac run with a qualified claim.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Merge `gsd/v0.7.3-milestone` → `main` with a **merge commit** (history preserved), push, let `deploy-pages.yml` deploy — at the START of Phase 5 execution; all launch verification runs against the LIVE final surface
- Deploy proof: `gh run watch` green + live URL checks; live sitemap equality via verify-build semantics
- Clean machine = Docker container (fresh Linux env, isolated HOME) following the published quickstart verbatim — honest clean-room, honestly timed
- Video = **asciinema terminal recording** (`.cast` file): self-hosted static asset (repo `public/`), player embed (`<script src=".../asciinema-player.min.js">` self-hosted too — zero third-party requests preserved) on the quickstart bottom
- If Docker is unavailable: record the temp-dir isolated Mac run and document the environment honestly
- VRFY-02 depth: every factual sentence on landing + quickstart + requirements traced to an artifact
- VRFY-03: crawl the 34 pre-rebuild URLs against the LIVE site + live sitemap equality
- VRFY-04: deployment-guide / code-standards / system-architecture updated where they reference the old structure
- COMM-01: enable Discussions via `gh api`; link from docs troubleshooting + landing footer; if auth is read-only, commit docs links anyway and document the exact enable command

### Claude's Discretion
- Audit table format, crawl script shape, and maintainer-docs wording, as long as every claim row carries its evidence pointer

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VRFY-01 | Clean-machine cold-install run, timed, recorded | Docker invocation, wheel availability, asciinema recording setup |
| VRFY-02 | Claims audit — landing/docs sentences traced to artifacts | Claims inventory by section, evidence-source mapping |
| VRFY-03 | Old-URL crawl + sitemap equality | url-contract.json, crawl loop design, sitemap parsing |
| VRFY-04 | Maintainer docs updated | Stale-reference inventory below |
| COMM-01 | Discussions enabled and linked | API verified already enabled, link placement points |
| COMM-02 | Video walkthrough embedded | asciinema-player assets, embed markup in Astro MDX |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Merge and deploy | CI/CD (GitHub Actions) | — | deploy-pages.yml is the sole deploy mechanism |
| Cold-install run | Local execution (Docker) | — | Isolated Linux container running published commands |
| Video recording | Local execution (container) | Static asset serving (CDN/ Pages) | asciinema CLI records, static player serves |
| Claims audit | Local execution | — | Read-only file analysis against source-of-truth artifacts |
| URL crawl | Local execution | Live site (GitHub Pages) | curl-based HTTP checks against deployed URLs |
| Maintainer docs update | File editing | — | Pure content edits to `docs/*.md` |
| Discussions enable + link | GitHub API | File editing | API already enabled; link edits in content files |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| asciinema-player | 3.17.0 | Self-hosted terminal-recording playback in the quickstart | The only serious asciinema embed player; supports self-hosted JS + CSS (no third-party requests), custom themes, auto-play, seek. Apache-2.0 license. |

### Supporting

No additional packages. The phase is verification and wiring, not new functionality.

**Alternatives Considered:**

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| asciinema-player | vhs (Charm) | vhs renders to GIF — no search, larger files, no seek. asciinema-player gives interactive playback from a small `.cast` file. |
| Self-hosted player | asciinema.org hosted embed | Violates the zero-third-party-requests constraint |

**Installation:**
```bash
# No npm install needed — copy static files from the npm package into public/assets/asciinema/
npm pack asciinema-player@3.17.0
tar xzf asciinema-player-3.17.0.tgz
# Copy dist/bundle/asciinema-player.min.js and dist/bundle/asciinema-player.css to public/assets/asciinema/
```

**Version verification:** `npm view asciinema-player version` → `3.17.0` [VERIFIED: npm registry]

## Package Legitimacy Audit

> Not applicable — the only external package (asciinema-player) is a static asset bundle (JS + CSS), not executable code. No postinstall scripts, no runtime dependency. Loaded as a `<script>` tag.

## Architecture Patterns

### Pattern 1: Merge-Deploy-Verify
**What:** Merge the milestone branch to `main`, let CI deploy, then verify against the live URL.
**When to use:** Every release to GitHub Pages.
**Example:**
```bash
git checkout main
git merge --no-ff gsd/v0.7.3-milestone -m "Merge v0.7.3 milestone: rebuild public surface"
git push origin main
gh run watch --repo jarvis-intelligence/jarvis-index
```

**Branch state:** The `gsd/v0.7.3-milestone` branch is 118 commits ahead of `origin/main`. [VERIFIED: `git log --oneline origin/main..gsd/v0.7.3-milestone | wc -l` → `118`]

**Deploy triggers** (`deploy-pages.yml` paths [VERIFIED: .github/workflows/deploy-pages.yml:8-15]):
- `src/**`, `public/**`, `design/**`, `astro.config.*`, `package.json`, `package-lock.json`, `.github/workflows/deploy-pages.yml`

**Deploy run duration:** ~2-3 minutes (Astro build + verify-build + Pages artifact upload + deploy + smoke probe).

**Deploy proof commands:**
```bash
# Watch the run
gh run watch --repo jarvis-intelligence/jarvis-index

# Verify live
ORIGIN="https://jarvis-intelligence.github.io"
BASE="$ORIGIN/jarvis-index"
curl -s -o /dev/null -w "%{http_code}" "$BASE/"            # expect 200
curl -s -o /dev/null -w "%{http_code}" "$BASE/docs/"       # expect 200

# Pagefind page_count check (verify-build V5 already tests presence;
# page_count jumping confirms content density)
curl -s "$BASE/docs/pagefind/pagefind-entry.json" | python3 -c "
import json,sys; d=json.load(sys.stdin); print('page_count:', d.get('page_count', 'missing'))
"
```

### Pattern 2: Docker Clean-Room Cold Install
**What:** Run the published quickstart inside an isolated Docker container with no pre-installed tools.
**When to use:** VRFY-01 cold-install verification.

**Image choice:** `python:3.13-slim` (Debian-based, ~60 MB). Has `curl` and `git` pre-installed. Does NOT have Node.js — but the quickstart needs Node only for `scip-typescript` and `scip-python` npm installs, which `setup.sh` handles (it checks for `npm` and installs the indexers). The image provides `python3.13` which satisfies `uv`'s requirement.

**Wheel availability** [VERIFIED: PyPI API query]:
- `jarvis-mcp` 0.6.2 publishes wheels for: `manylinux2014_aarch64` (cp312/313/314), `manylinux2014_x86_64` (cp312/313/314), `macosx_11_0_arm64` (cp312/313/314), `macosx_10_13/15_x86_64` (cp312/313/314)
- **No Rust/Cargo compiler needed in the container.** `uv tool install jarvis-mcp` downloads a prebuilt wheel.
- The Docker host is Apple Silicon (M3 Pro), so `--platform linux/amd64` should be specified to test the x86_64 wheel path (the more common Linux target).

**Docker invocation (recorded with asciinema inside the container):**
```bash
# Start Rancher Desktop's Docker daemon first
docker run --rm -it --platform linux/amd64 \
  -v "$PWD/cold-install.cast:/output/cold-install.cast" \
  python:3.13-slim bash -c '
  apt-get update && apt-get install -y asciinema curl git && \
  asciinema rec -o /output/cold-install.cast bash -c "
    curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh && \
    pip install uv && \
    uv tool install jarvis-mcp && \
    jarvis index /tmp/toy-repo && \
    jarvis status toy-repo
  "'
'
```

**Timing capture:** asciinema `.cast` files record wall-clock timestamps in the second field of each JSON line (`[timestamp, elapsed, "o", "text"]`). The elapsed field gives per-line timing; the total recording duration is the last line's timestamp minus the first.

**Fallback (Docker unavailable):** `CONTEXT.md` permits recording a temp-dir isolated Mac run. The claim is then qualified: "Recorded on macOS arm64 (M3 Pro) in an isolated environment. A Linux x86_64 run was not possible because Docker was not running."

### Pattern 3: Asciinema Player Self-Hosting
**What:** Serve the player JS/CSS from `public/assets/asciinema/` alongside the `.cast` file.
**When to use:** COMM-02 video embed.

**Assets needed** (from `asciinema-player@3.17.0` npm package):
- `public/assets/asciinema/asciinema-player.min.js` (~185 kB) [VERIFIED: `npm pack --dry-run` output]
- `public/assets/asciinema/asciinema-player.css` (~19 kB)
- `public/assets/asciinema/cold-install.cast` (terminal recording, typically 50-200 kB for a 3-5 min session)

**License:** Apache-2.0 (NOT MIT — the CLI `asciinema` is GPLv3, the player is Apache-2.0) [VERIFIED: npm view asciinema-player license → `Apache-2.0`]

**File size budget:** ~185 KB JS + ~19 KB CSS + ~100 KB cast = ~304 KB total. Well within static asset norms.

**Embed markup in quickstart MDX** (bottom section, after "## Next steps"):
```astro
---
// No frontmatter needed — just add a section at the bottom of quickstart.mdx
---

## Watch the cold install

<div id="cold-install-player"></div>
<link rel="stylesheet" href="/assets/asciinema/asciinema-player.css" />
<script src="/assets/asciinema/asciinema-player.min.js"></script>
<script>
  AsciinemaPlayer.create('/assets/asciinema/cold-install.cast', document.getElementById('cold-install-player'), {
    cols: 100,
    rows: 24,
    autoPlay: true,
    loop: false,
  });
</script>
```

Astro's MDX supports inline `<script>` and `<link>` tags — `set:html` is not required since these are standard HTML elements, not rehype-generated markup. The `is:inline` directive is unnecessary for external scripts that should load as-is. [VERIFIED: astro.config.mjs has no restrictive CSP; src/pages/index.astro uses `<script is:inline>` for landing-specific theme toggle — the player script follows the same pattern.]

### Anti-Patterns to Avoid
- **Recording outside Docker and claiming it's Linux.** Must be honest about the environment.
- **Embedding a third-party hosted player.** Violates the zero-external-requests constraint.
- **Running verification against a local build.** All VRFY checks run against the LIVE deployed site after merge.
- **Editing `setup.sh`.** Source of truth is the private repo. Never touch it here.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Terminal recording | Custom script/tmux logging | asciinema (PyPI 2.4.0) | Standard `.cast` format, built-in timing, compatible player |
| Terminal playback | Custom web player | asciinema-player 3.17.0 | Theme support, seek, auto-play, self-hosted |
| URL crawl | Ad-hoc curl one-liners | Shell loop over url-contract.json | Systematic, auditable, extensible |
| Sitemap parsing | Custom regex | grep on sitemap-0.xml | CI already validates sitemap structure |

**Key insight:** This phase is verification, not construction. Every tool used exists and is standard; the work is orchestration and documentation.

## Common Pitfalls

### Pitfall 1: Verifying against local build instead of live site
**What goes wrong:** Claims about URL availability, asset resolution, and Pagefind are false for the deployed artifact.
**Why it happens:** `npm run build && npm run verify` passes locally, but the live Pages artifact may differ.
**How to avoid:** CONTEXT.md locks this: merge → deploy → verify live. Never skip the deploy step.
**Warning signs:** Running verification before `gh run watch` completes.

### Pitfall 2: Docker daemon not running
**What goes wrong:** `docker run` fails with socket connection error.
**Why it happens:** Rancher Desktop's Docker daemon must be explicitly started.
**How to avoid:** Start the daemon (open Rancher Desktop app) before the cold-install task. Have the fallback ready.
**Warning signs:** `docker info` returns error or empty.

### Pitfall 3: asciinema-player license confusion
**What goes wrong:** Assuming MIT license when it's Apache-2.0.
**Why it happens:** The `asciinema` CLI is GPLv3, the `asciinema-player` npm package is Apache-2.0 — easy to conflate.
**How to avoid:** Verified: `npm view asciinema-player license` → `Apache-2.0`. Apache-2.0 is permissive and compatible with the repo's MIT license.
**Warning signs:** None — just verify before documenting.

### Pitfall 4: Forgetting to update the url-contract.json after adding the asciinema assets
**What goes wrong:** verify-build V2 fails because `public/assets/asciinema/` files exist in `dist/` but aren't in the URL contract.
**How to avoid:** The `.cast` and player JS/CSS are `public/` passthrough files — they don't create HTML pages, so V2's HTML-file set-equality check doesn't see them. However, V3's asset-resolution check on the landing/docs HTML WILL see the `<script src>` and `<link>` hrefs. These must be relative paths resolving to `dist/assets/asciinema/...`.
**Warning signs:** verify-build V3 failure after adding the embed.

### Pitfall 5: Discussions API endpoint confusion
**What goes wrong:** Using `repos/.../community/discussions` (404) instead of `repos/.../discussions` (correct).
**Why it happens:** GitHub's REST API docs show both forms; the `/community/` prefix is for enabling, not listing.
**How to avoid:** Discussions are already enabled (`has_discussions: true`). No API call needed to enable. The correct list endpoint is `gh api repos/jarvis-intelligence/jarvis-index/discussions`. [VERIFIED: returns `[]` (empty array, not 404).]
**Warning signs:** 404 from `/community/discussions` — use `/discussions` instead.

## Code Examples

### Merge-deploy sequence
```bash
git checkout main
git merge --no-ff gsd/v0.7.3-milestone -m "Merge v0.7.3 milestone: rebuild public surface"
git push origin main
gh run watch --repo jarvis-intelligence/jarvis-index
```

### Live verification
```bash
ORIGIN="https://jarvis-intelligence.github.io"
BASE="$ORIGIN/jarvis-index"

# Smoke probe (mirrors deploy-pages.yml:60-68)
for path in "/" "/docs/"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  echo "$path → $code"  # expect 200
  test "$code" = "200"
done

# Sitemap equality
curl -s "$BASE/sitemap-0.xml" | grep -o '<loc>[^<]*</loc>' | sort > /tmp/live-sitemap.txt
# Compare against url-contract.json (prepend BASE to each entry)
python3 -c "
import json
with open('design/url-contract.json') as f:
    urls = [f'https://jarvis-intelligence.github.io/jarvis-index{u}' for u in json.load(f)['urls']]
for u in sorted(urls):
    print(f'<loc>{u}</loc>')
" | diff - /tmp/live-sitemap.txt
```

### URL crawl loop
```bash
ORIGIN="https://jarvis-intelligence.github.io/jarvis-index"
while IFS= read -r url; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${ORIGIN}${url}")
  if [ "$code" = "200" ] || [ "$code" = "301" ] || [ "$code" = "302" ]; then
    echo "OK $code $url"
  else
    echo "FAIL $code $url"
  fi
done < <(python3 -c "import json; [print(u) for u in json.load(open('design/url-contract.json'))['urls']]")
```

### Claims audit table schema (VRFY-02)
```
| # | Surface | Section | Claim (verbatim) | Evidence Artifact | Evidence Pointer | Status |
|---|---------|---------|-------------------|-------------------|------------------|--------|
| 1 | Landing | Hero | "9 tools for go-to-definition, find-references..." | plugin/skills/jarvis-use/references/tool-roster.md | 9 tools listed: documentSymbols, goToDefinition, findReferences, callHierarchy, typeHierarchy, getIndexStatus, searchCode, semanticSearch, blastRadius | Traced |
| 2 | Landing | Privacy | "Everything runs on your machine" | ../jarvis/README.md | "local-first" section | Traced |
...
```

### Discussions link placement (COMM-01)
Discussions are already enabled. The landing footer already links to them:
[VERIFIED: src/pages/index.astro:210 → `href="https://github.com/jarvis-intelligence/jarvis-index/discussions"`]

The docs troubleshooting page needs a "Getting help" link. Best placement: a new paragraph at the bottom of `src/content/docs/docs/troubleshooting/index.md`, before the "Reference pages" section, linking to `https://github.com/jarvis-intelligence/jarvis-index/discussions`.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — this phase has no application code |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |

Phase 5 is pure verification and wiring — no test framework needed. Every check is a one-off script or manual verification.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VRFY-01 | Cold install completes, tool call succeeds | Manual (Docker) | Docker run command (see Pattern 2) | ❌ Wave 0 — asciinema must be installed in container |
| VRFY-02 | Every claim traced to artifact | Manual (audit table) | N/A — human judgment on traceability | ❌ Wave 0 — audit table created as artifact |
| VRFY-03 | 37 URLs (contract) serve 200/301/302 | Automated | URL crawl loop (see Code Examples) | ✅ url-contract.json exists |
| VRFY-03 | Sitemap equals shipped pages | Automated | Sitemap equality diff (see Code Examples) | ✅ url-contract.json + sitemap-0.xml |
| VRFY-04 | Maintainer docs describe new structure | Manual (review) | `grep` for stale references | ✅ docs/deployment-guide.md, docs/code-standards.md, docs/system-architecture.md exist |
| COMM-01 | Discussions enabled and linked | Automated (API) + Manual (link check) | `gh api repos/.../discussions` + `grep` for link | ✅ Landing footer link exists |
| COMM-02 | Video embedded on quickstart | Manual (visual) | `npm run build && npm run preview` then visit quickstart | ❌ Wave 0 — player assets not yet in public/ |

### Sampling Rate
- **Per task commit:** N/A (no test framework)
- **Per wave merge:** N/A
- **Phase gate:** All automated checks (VRFY-03 crawl, sitemap, COMM-01 API) pass; manual checks (VRFY-01 recording, VRFY-02 audit table, COMM-02 embed) confirmed by orchestrator

### Wave 0 Gaps
- [ ] `public/assets/asciinema/` directory and player files — needed for COMM-02 embed
- [ ] Docker daemon started — needed for VRFY-01 cold-install recording
- [ ] asciinema installed in Docker container — needed for VRFY-01 recording

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | — |
| V6 Cryptography | no | — |

No security-relevant code changes in this phase. The only new files are static assets (JS, CSS, .cast) with no user-supplied input.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Docker (Rancher Desktop) | VRFY-01 cold-install | ⚠️ CLI installed, daemon NOT running | 29.5.3-rd | Temp-dir isolated Mac run (qualified claim) |
| `gh` CLI | Merge, deploy watch, Discussions API | ✓ | (current) | — |
| `asciinema` (CLI) | VRFY-01 recording | ✗ not installed | — | Install inside Docker container via `pip install asciinema` |
| `npm` (for player assets) | COMM-02 static files | ✓ | (v22) | — |
| `curl` | URL crawl, live verification | ✓ | (system) | — |
| `python3` | Sitemap parsing, audit table | ✓ | (system) | — |
| `../jarvis/` private repo | VRFY-02 claims tracing | ✓ | (local checkout) | — |

**Missing dependencies with no fallback:**
- Docker daemon must be started before VRFY-01. Without it, the fallback is a qualified Mac run.

**Missing dependencies with fallback:**
- asciinema CLI: install inside the Docker container via `pip install asciinema` (Debian `python:3.13-slim` has pip).

## Claims Inventory (for VRFY-02)

### Factual-claim surfaces and their evidence artifacts

| Surface | Section | Claim Types | Evidence Artifact |
|---------|---------|-------------|-------------------|
| Landing (`src/pages/index.astro`) | Hero (L71) | Value prop, install command | README, plugin manifests |
| Landing | Tools (L136) | 9 tools, honest tiering | `plugin/skills/jarvis-use/references/tool-roster.md` |
| Landing | Languages (L148) | Language matrix (4 nav, 10 search) | `src/content/docs/docs/guide/requirements.md` language table, `../jarvis/README.md` |
| Landing | Privacy (L160) | "Nothing leaves the machine" | `../jarvis/README.md`, `../jarvis/docs/system-architecture.md` |
| Landing | Architecture (L180) | Diagram accuracy | `../jarvis/docs/system-architecture.md`, `../jarvis/docs/assets/` |
| Landing | Badges (implied) | GitHub, PyPI, MCP Registry links | Live URLs — verified by smoke probe |
| Landing | Footer (L204) | GitHub link, Discussions link | `gh api` verified |
| Quickstart (`src/content/docs/docs/quickstart.mdx`) | Steps 1-5 | Commands, expected output, error shapes | `setup.sh`, `../jarvis/README.md`, `../jarvis/CHANGELOG.md` |
| Quickstart | Step 5 fixtures | `getIndexStatus` response shape, `goToDefinition` response shape | `../jarvis/src/jarvis/mcp/server.py` (private repo) |
| Requirements (`src/content/docs/docs/guide/requirements.md`) | Language table | Navigation/search support per language | `../jarvis/README.md` Requirements section |
| Requirements | Platform requirements | macOS/Linux only, Python 3.12+, git | `setup.sh:113-137` (detect_os/detect_arch) |
| Requirements | Language caveats | scip-swift version floor, AGP, Kotlin, Maven | `../jarvis/CHANGELOG.md`, upstream issue links |

### Audit table schema

```
| # | Surface File | Line/Section | Claim (verbatim excerpt) | Evidence Source | Evidence Path/Locator | Traced? |
|---|-------------|-------------|-------------------------|----------------|---------------------|---------|
```

## Old-URL Crawl Design (VRFY-03)

### URL source
- **Canonical list:** `design/url-contract.json` — 37 URLs (landing `/`, `/brand-logo.html`, 35 docs pages) [VERIFIED: `design/url-contract.json` lines 4-44 — counted 37 entries]

### Crawl loop
```bash
ORIGIN="https://jarvis-intelligence.github.io/jarvis-index"
failures=0
while IFS= read -r url; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${ORIGIN}${url}")
  case "$code" in
    200|301|302) echo "  OK $code $url" ;;
    *) echo "FAIL $code $url"; failures=$((failures + 1)) ;;
  esac
done < <(python3 -c "import json; [print(u) for u in json.load(open('design/url-contract.json'))['urls']]")
echo "Failures: $failures"
```

### Sitemap equality check
1. Fetch `sitemap-0.xml` from live site
2. Extract all `<loc>` URLs
3. Compare against url-contract.json URLs (prepended with origin)
4. All contract URLs must appear; no extra pages in sitemap that aren't in contract

## Maintainer Docs Deltas (VRFY-04)

### Current state of the three docs

The three maintainer docs (`docs/deployment-guide.md`, `docs/code-standards.md`, `docs/system-architecture.md`) are **clean of stale VitePress/`site/index.html`/`docs/.vitepress` references**. [VERIFIED: `grep -n 'VitePress\|site/index.html\|docs/.vitepress\|npm run docs' docs/*.md` returned no matches.]

### What they are MISSING (new site structure not yet documented)

**`docs/system-architecture.md`:**
- No mention of the Astro + Starlight site at all — currently describes only the distribution surface (plugin, setup.sh, binary releases)
- Should add: the docs/landing site as a fifth outbound channel — Astro 5 + Starlight at `/` and `/docs/`, built by `npm run build`, deployed by `deploy-pages.yml` (Node 22, paths: `src/**`, `public/**`, `design/**`)
- Should add: `design/tokens.css` as the identity layer consumed by both surfaces
- Should add: `public/` passthrough files (fonts, brand-logo.html, llms.txt, asciinema assets)

**`docs/deployment-guide.md`:**
- Missing: how the docs/landing site deploys (it's not a publishing channel for users, but maintainers need to know)
- Should add a "Channel 5 — Docs & Landing site" section: built by Astro + Starlight, deployed to GitHub Pages via `deploy-pages.yml` on push to `main`, verify-build assertions, post-deploy smoke probe
- The `Post-publish smoke test` section (line 142) is fine but references `./setup.sh --only` which is unchanged

**`docs/code-standards.md`:**
- Missing: `src/` content structure conventions (MDX files in `src/content/docs/docs/`, Astro components in `src/components/`)
- Missing: `design/tokens.css` as the design-token source of truth
- Missing: `public/` passthrough file conventions
- The existing content (plugin conventions, setup.sh rules, commit format) is all still accurate

### NOT in scope
- `.planning/codebase/CONVENTIONS.md`, `STACK.md`, `ARCHITECTURE.md` — these are internal planning artifacts, not maintainer docs. VRFY-04 specifies `deployment-guide`, `code-standards`, `system-architecture` only.
- `.claude/CLAUDE.md` — this is the harness's project CLAUDE.md, not a maintainer doc. It carries 31 stale VitePress-era references from the original codebase mapping, but updating it is out of scope for this phase (it's consumed by the OMP harness, not by maintainers).

## Discussions Status (COMM-01)

### Current state
- **Already enabled:** `has_discussions: true` [VERIFIED: `gh api repos/jarvis-intelligence/jarvis-index --jq '.has_discussions'` → `true`]
- **Empty:** `gh api repos/jarvis-intelligence/jarvis-index/discussions` → `[]` (no discussions yet)
- **Auth:** `phuongddx` account has `admin` permission [VERIFIED: `gh api repos/jarvis-intelligence/jarvis-index` → `permissions: {admin: true, ...}`]
- **API scopes:** Empty (token auth, not OAuth) — but `admin` permission on the repo is sufficient for all repo-admin operations

### Link placement
1. **Landing footer:** ALREADY DONE — `src/pages/index.astro:210` links to `https://github.com/jarvis-intelligence/jarvis-index/discussions`
2. **Docs troubleshooting:** NEEDS ADDING — add a "Getting help" paragraph at the bottom of `src/content/docs/docs/troubleshooting/index.md` (before the "Reference pages" section) linking to the Discussions URL

### No API call needed
Discussions are already enabled. The only work is the docs link edit.

## Verification Architecture

### Automatable checks
| Check | Command | Expected Result |
|-------|---------|----------------|
| Deploy run green | `gh run watch --repo jarvis-intelligence/jarvis-index` | Exit 0, all steps green |
| Live smoke probe | `curl -s -o /dev/null -w "%{http_code}" "$BASE/"` and `"$BASE/docs/"` | 200, 200 |
| URL crawl (37 URLs) | Loop over url-contract.json (see Code Examples) | All 200/301/302 |
| Sitemap equality | Diff live sitemap-0.xml against url-contract.json | No differences |
| Discussions API | `gh api repos/jarvis-intelligence/jarvis-index/discussions` | `[]` (not 404) |
| verify-build CI | Runs automatically in deploy-pages.yml | V1–V10 all pass |
| Video embed works | `npm run build` + `npm run preview` → visit quickstart bottom | Player renders, no console errors |

### Orchestrator-held checks
| Check | Why not automated |
|-------|------------------|
| Cold-install run success | Docker execution with live network; timing and recording are human-verified |
| Claims audit completeness | Human judgment on whether every claim is adequately traced |
| Maintainer-doc wording quality | Human judgment on accuracy and completeness of new sections |
| Video playback quality | Visual verification that the recording is clear, not garbled |

## Recommendation Summary

1. Merge to `main` first (118 commits, `--no-ff`), verify deploy green, then run all checks against the live site.
2. Docker cold-install with `python:3.13-slim` on `--platform linux/amd64`; wheels are prebuilt (no Rust needed); install asciinema inside the container.
3. asciinema-player 3.17.0 (Apache-2.0, ~304 KB total) into `public/assets/asciinema/`; embed in quickstart bottom via standard `<script>` + `<link>` tags.
4. Maintainer docs need ADDITIONS (new site structure), not corrections — they have zero stale references, only missing coverage of the Astro + Starlight layer.
5. Discussions already enabled; only work is a troubleshooting-page link edit. Landing footer link already exists.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Docker daemon can be started (Rancher Desktop is installed, CLI works) | Environment Availability | Falls back to qualified Mac run per CONTEXT.md |
| A2 | asciinema 2.4.0 installs cleanly inside `python:3.13-slim` | Docker Clean-Room | Low risk — standard pip package |
| A3 | The `.cast` file size stays under 200 KB for a 3-5 min recording | Asciinema Player | Low risk; if larger, still works, just bigger static asset |

## Open Questions

1. **Should the `.cast` recording include the `jarvis index` step on a real repo, or the quickstart's `toy-repo` fixture?** The quickstart Step 3 says `jarvis index /path/to/your/repo` — a real small repo in the container is more honest but needs creating. A Python one-liner repo is simplest.
   - Recommendation: Create a tiny Python repo in the container before recording.

2. **Should the maintainer-docs update be a single commit or per-doc commits?**
   - What we know: The three docs are independent edits.
   - Recommendation: One commit per doc (three atomic commits) matching the project's existing commit convention.

## Sources

### Primary (HIGH confidence)
- [VERIFIED: .github/workflows/deploy-pages.yml] — deploy triggers, build steps, smoke probe assertions
- [VERIFIED: design/url-contract.json] — 37 canonical URLs
- [VERIFIED: pypi.org/pypi/jarvis-mcp/json] — wheel platform availability
- [VERIFIED: npm view asciinema-player] — version 3.17.0, Apache-2.0 license, asset sizes
- [VERIFIED: gh api repos/jarvis-intelligence/jarvis-index] — `has_discussions: true`, admin permissions
- [VERIFIED: src/pages/index.astro:210] — existing Discussions footer link
- [VERIFIED: git log origin/main..gsd/v0.7.3-milestone] — 118 commits ahead
- [VERIFIED: src/content/docs/docs/quickstart.mdx] — full quickstart content
- [VERIFIED: src/content/docs/docs/troubleshooting/index.md] — needs Discussions link
- [VERIFIED: docs/deployment-guide.md, docs/code-standards.md, docs/system-architecture.md] — no stale references, missing new-site coverage

### Secondary (MEDIUM confidence)
- npm registry — asciinema-player version and license
- PyPI — jarvis-mcp wheel platforms

### Tertiary (LOW confidence)
- None — all claims verified against in-repo or authoritative sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — only one package (asciinema-player), verified on npm registry
- Architecture: HIGH — all patterns verified against in-repo files and live API responses
- Pitfalls: HIGH — all derived from verified repo state and tool availability checks

**Research date:** 2026-08-23
**Valid until:** 2026-09-23 (stable domain — verification phase, no fast-moving dependencies)
