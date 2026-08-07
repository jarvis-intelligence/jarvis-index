# Project Roadmap — jarvis-index

Scope: this repo only — the distribution surface. Server features belong to the private `jarvis`
repo's roadmap.

_Last reviewed: 2026-08-07 (repo state at commit `3c5ab35` + uncommitted Cursor support)._

## Current state

| Area | State |
|---|---|
| `setup.sh` | Working. 7 dependencies, SHA256-verified, idempotent, failure-isolated. Synced automatically from the private repo. |
| Claude Code plugin | Published. `marketplace.json` → `./plugin`, version 0.7.0. |
| Codex CLI plugin | Published. Full `interface` block with icons and brand color, version 0.7.0. |
| Cursor plugin | **Added 2026-08-07**, version 0.7.0. Passes Cursor's official validator. Not yet submitted to the public Cursor marketplace. |
| Skills | Three shipped: `jarvis-setup`, `jarvis-use`, `jarvis-issues`. |
| MCP auto-registration | Working on all three clients via `plugin/.mcp.json` + `plugin/mcp.json`. |
| Binary hosting | `scip-56791658a873`, `zoekt-33f1f18af292` published as releases. |
| Issue tracker | Live; `jarvis-issues` skill files against it. |
| Docs | This set — created 2026-08-07. |

**Recent trajectory:** the repo started as a pure sync target and has been taking ownership of the
plugin surface. Recent commits moved `plugin/` and `.codex-plugin/` to being edited here directly
rather than overwritten from the private repo; Cursor support extends the same `plugin/` directory
to a third client.

## Known gaps

### 1. Cursor distribution is not self-service

The plugin is Cursor-compatible, but reaching Cursor users at scale needs a public marketplace
listing, which requires manual submission and review at <https://cursor.com/marketplace/publish>.
Until then Cursor users are limited to a Teams/Enterprise team marketplace or a local symlink.

Worse for release cadence: once listed, **every update is reviewed before publishing**, so a
plugin version bump stops being self-service on that channel while remaining instant on Claude
Code and Codex. Decide whether to submit before the next plugin change.

### 2. No CI in this repo

Nothing validates a push here. The tests that guard `setup.sh` live in the private repo and run
before the sync, which covers the synced file — but not the parts owned here. Nothing checks:

- the three plugin manifests' versions agree
- a version was actually bumped when `plugin/**` changed
- `plugin/.mcp.json` and `plugin/mcp.json` still hold identical contents
- the JSON manifests parse and carry required fields
- the MCP `--from` floor still resolves against PyPI
- release tags referenced by `setup.sh`'s pins actually exist here

Cursor's `validate-template.mjs` already covers manifest parsing, name agreement, path resolution,
and skill frontmatter — wiring that one script into CI is the cheapest first step and benefits all
three clients.

### 3. Pin/release ordering is unguarded

Bumping `*_COMMIT_PIN` in `jarvis/setup.sh` without the matching release existing here produces a
404 at install time for every user. The private repo's tests assert the pin matches the
`SCIP_COMMIT`/`ZOEKT_COMMIT` file — not that the release exists. This is the highest-severity
silent-failure path in the whole distribution flow.

### 4. Sync reliability

One of four sync commits (`c2a79e5`) required a manual run after a `JARVIS_DIST_TOKEN` 403.
A release can currently complete while the public `setup.sh` stays stale, with no alert.

### 5. Platform coverage

- Windows unsupported (documented, intentional).
- `scip-swift` is macOS **arm64 only** — no x86_64 asset, so Intel Macs cannot index Swift.
- Java/Kotlin: Android/Gradle projects and repos off the pinned Kotlin 2.2.0 cannot produce a SCIP
  index and are published search-only.

## Candidate work

Roughly ordered by value-to-effort. None of this is committed scope.

**Near term**

- Decide whether to submit to the public Cursor marketplace, accepting per-update review on that
  channel (gap 1).
- Add a minimal CI workflow covering gap 2's checks, starting with Cursor's
  `validate-template.mjs`.
- Add a release-existence check to the pin-bump path (gap 3) — a `gh release view` in the private
  repo's release workflow before it publishes.
- Alert on sync failure rather than letting a 403 pass silently (gap 4).

**Medium term**

- Automate the plugin version bump across all three manifests — derive it from the diff, or fail
  CI when `plugin/**` changed without one.
- Consider a Cursor `rules/` directory. Cursor supports `.mdc` rules as a first-class component
  and jarvis currently ships none; a rule stating "prefer jarvis structural tools over grep" would
  apply persistently rather than only when the `jarvis-use` skill triggers. Skills are portable
  across all three clients, rules are Cursor-only — so this is additive, not a replacement.
- Publish a `scip-swift` x86_64 asset, or state the Intel-Mac limitation explicitly in
  `jarvis-setup`'s prerequisites (currently it only appears as a parenthetical in step 2).
- Add a post-install verification command (`setup.sh --verify`) so users can self-diagnose PATH
  shadowing and pin mismatches without reading the troubleshooting table.

**Watch items — external, act when upstream moves**

- **`scip` fork exit ramp.** When `scip-code/scip` merges #465 and cuts a release, repoint
  `SCIP_RELEASE_REPO` at upstream and delete `build-scip.yml` + `SCIP_COMMIT`. This removes a
  whole build pipeline and one release channel.
- **Zoekt releases.** If `sourcegraph/zoekt` ever publishes releases, the same simplification
  applies to channel 3.
- **scip-java's Kotlin pin.** Any scip-java bump requires re-checking which Kotlin version its
  bundled `scip-kotlinc` plugin targets; the API is internal and unstable.

## Explicitly not planned

- Windows support.
- Multi-language merge in a single index.
- Multi-tenancy.
- Moving product source code into this repo.
- Adding the `[semantic]` extra to the plugin's default MCP registration — settled trade-off, see
  [system-architecture.md](system-architecture.md#notable-architectural-constraint-semanticsearch-under-the-plugin).

## Open questions

1. Submit to the public Cursor marketplace, or leave Cursor on team-marketplace + local install?
   Listing trades release autonomy for reach. (gap 1)
2. Is anyone monitoring sync-workflow failures today, or is a stale `setup.sh` only noticed when a
   user reports it? (gap 4)
