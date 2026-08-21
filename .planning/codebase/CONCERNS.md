# Codebase Concerns

**Analysis Date:** 2026-08-21

## Tech Debt

**`setup.sh` documentation/implementation drift (jarvis-mcp pre-warm):**
- Issue: The synced `setup.sh` (762 lines) contains no `install_jarvis_mcp`, no `uv tool install jarvis-mcp`, and no `--only jarvis-mcp` target — but the docs and skills edited in this repo all claim it does. `plugin/skills/jarvis-setup/SKILL.md` (lines 25, 35, 86) tells users setup.sh "runs `uv tool install jarvis-mcp` itself — pre-warming the cache" and that `--only` accepts `jarvis-mcp`; `docs/codebase-summary.md` (lines 45–48, 56–58) and `docs/system-architecture.md` (lines 80–84, 128, 152) describe an `install_jarvis_mcp` installer and a 798-line script. Git history shows the cause: docs commit `6d6ca8e` ("document setup.sh's automatic jarvis-mcp pre-warm (#8)") landed after the last sync commit `c945506` (2026-08-08), so the docs raced ahead of the private repo's sync.
- Files: `setup.sh`, `plugin/skills/jarvis-setup/SKILL.md`, `docs/codebase-summary.md`, `docs/system-architecture.md`
- Impact: Users following `docs/quickstart.md` (manual step 2) get correct behavior; users following the `jarvis-setup` skill believe the pre-warm is automatic and hit the 30s MCP connect timeout the pre-warm was designed to prevent ([jarvis-index#4](https://github.com/jarvis-intelligence/jarvis-index/issues/4)). `--only jarvis-mcp` fails as an unknown-args no-op (it silently installs nothing because `should_run` never matches).
- Fix approach: Either trigger the next jarvis release so the sync lands the newer `setup.sh`, or revert the pre-warm claims in `plugin/skills/jarvis-setup/SKILL.md`, `docs/codebase-summary.md`, and `docs/system-architecture.md` until the sync catches up. Long term, add a CI check comparing documented `--only` targets against `usage()` output in `setup.sh`.

**Landing-page version strings drift from plugin manifests:**
- Issue: `site/index.html` hardcodes "plugin v0.7.0" in two places (hero meta line 682, footer line 945) while all three plugin manifests are at `0.7.2`.
- Files: `site/index.html`, `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`
- Impact: The public marketing page advertises a stale plugin version; nothing flags the mismatch on bump.
- Fix approach: Update both strings to `0.7.2`, then add a CI check (or build-time substitution) that greps the manifests' version and asserts the site strings match.

**Stale `typeHierarchy` description in the tool roster:**
- Issue: `plugin/skills/jarvis-use/references/tool-roster.md` (line 24) still says typeHierarchy "**Returns an `error` on real indexes** — upstream `scip expt-convert` never populates `relationships`", describing pre-fork behavior. The sibling `plugin/skills/jarvis-use/SKILL.md` (gotcha, line 65) and `plugin/README.md` (line 13) correctly describe the fork-fixed behavior ("errors only on indexes built with an unpatched `scip`; reindex fixes it").
- Files: `plugin/skills/jarvis-use/references/tool-roster.md`, `plugin/skills/jarvis-use/SKILL.md`, `plugin/README.md`
- Impact: An agent loading the reference on demand gets contradictory guidance and may tell users typeHierarchy is unconditionally broken.
- Fix approach: Reword the roster entry to match the SKILL.md gotcha; requires a three-manifest version bump to ship.

**Stale committed planning artifacts contradict the shipped landing page:**
- Issue: `plans/0807-2314-landing-page/plan.md` and `docs/superpowers/specs/2026-08-07-landing-page-design.md` mandate "zero external requests... no CDN, fonts, images, scripts", "No JavaScript at all", and palette `#3B82F6`/`#0F172A`. The shipped `site/index.html` loads Google Fonts (lines 9–11), contains a `<script>` block (lines 949–987: theme toggle + copy buttons), and uses the `#29527d`-based palette documented in `docs/brand-spec.md` (from the later redesign, commit `18540b0`).
- Files: `plans/0807-2314-landing-page/plan.md`, `docs/superpowers/specs/2026-08-07-landing-page-design.md`, `site/index.html`, `docs/brand-spec.md`
- Impact: Anyone implementing from the committed plan/spec reintroduces the old constraints (no fonts, no JS) and regresses the live page; the spec's "zero scripts" verification claim no longer holds.
- Fix approach: Mark both artifacts as historical (superseded-by header pointing at `docs/brand-spec.md`), or move them out of the repo. Note `docs/.vitepress/config.ts` already excludes `superpowers/**` from the built site (line 25), but `plans/` is not user-facing either.

**Unpinned npm indexers violate the repo's own pin discipline:**
- Issue: `install_npm_indexer` in `setup.sh` (lines 581–602) runs `npm install -g "$_pkg"` with no version pin for `scip-typescript` and `scip-python`, while `docs/code-standards.md` ("Pin discipline") states "Every external dependency is pinned to an exact commit or tag. **Never `latest`.**"
- Files: `setup.sh`, `docs/code-standards.md`
- Impact: An upstream npm release with breaking behavior flows to every new install with no gate; the pin-discipline doc misleads contributors about actual coverage. Also npm globals install to the npm prefix, not `~/.jarvis/bin` — inconsistent install surface, and presence-gated (`already_installed`), so a stale PATH binary never upgrades.
- Fix approach: Pin exact versions in `jarvis/setup.sh` upstream with the standard why/what-breaks comment, and note the npm exception in `docs/code-standards.md` until then.

**Duplicated metadata across three manifests + two MCP configs:**
- Issue: Plugin identity (`name`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `version`) is hand-copied across `plugin/.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and `plugin/.cursor-plugin/plugin.json`; MCP registration is duplicated verbatim between `plugin/.mcp.json` and `plugin/mcp.json` (symlink rejected for Windows-Cursor reasons, per `docs/code-standards.md` lines 98–102).
- Files: `plugin/.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `plugin/.mcp.json`, `plugin/mcp.json`
- Impact: Five files must move in lockstep on every content change; a missed one ships inconsistent metadata to one client (version mismatch means content reaches nobody on that client).
- Fix approach: Add the CI checks listed in `docs/project-roadmap.md` gap 2 (version agreement, `.mcp.json`/`mcp.json` equality, JSON parse); the duplication itself is a settled trade-off, so guard it rather than deduplicate.

## Known Bugs

**Docs direct Cursor users at the wrong MCP config filename:**
- Symptoms: `docs/integrations/cursor.md` (line 19) tells Cursor users to copy "the block from `plugin/.mcp.json`" — Cursor reads `plugin/mcp.json` (undotted), Claude Code/Codex read the dotted one.
- Files: `docs/integrations/cursor.md`, `plugin/mcp.json`, `plugin/.mcp.json`
- Trigger: A Cursor user following the manual-registration path in the docs.
- Workaround: None needed today — the two files hold identical contents — but any future edit that touches only one file turns this into a real break.

**`docs/codebase-summary.md` file inventory is stale:**
- Symptoms: Claims `setup.sh` is 798 lines and ~59% of ~1,300 LOC across 14 text files; actual `setup.sh` is 762 lines and the repo now also carries `site/` (989-line `index.html`), `docs/` (~1,500 lines), `.github/workflows/deploy-pages.yml`, and `plans/`.
- Files: `docs/codebase-summary.md`
- Trigger: Reading the summary as an accurate inventory.
- Workaround: Cross-check with `wc -l`; treat the summary's setup.sh section as describing the not-yet-synced upstream version.

## Security Considerations

**`curl | sh` installer with same-origin checksums:**
- Risk: The primary install path pipes `main` straight into `sh`. Every downloaded artifact is SHA256-verified (`verify_sha256` in `setup.sh` lines 238–248), but the `.sha256` sidecar is fetched from the same GitHub release as the artifact — this protects against transport corruption, not a compromised repo, a hijacked release, or a rogue commit to `main` (the raw URL is branch-pinned, not commit-pinned). Checksums are not GPG-signed.
- Files: `setup.sh`, `README.md` (line 44), `docs/quickstart.md` (line 26), `site/index.html` (line 666)
- Current mitigation: TLS everywhere; pinned commit-tagged releases for scip/zoekt/scip-swift/scip-java; `run_one` failure isolation; the script only writes inside `~/.jarvis` plus one appended PATH line to the shell rc (`ensure_on_path`, `setup.sh` lines 177–204).
- Recommendations: Document the trust model explicitly (users trust the repo + GitHub); consider commit-pinning the install URL in docs; sign release assets if threat model grows.

**PyPI floor resolution is a supply-chain surface:**
- Risk: `plugin/.mcp.json` and `plugin/mcp.json` register the server as `uvx --from jarvis-mcp>=0.6.0 jarvis-server`. A version floor (not a pin) means every plugin user's client resolves and executes whatever the latest matching PyPI release is at server start.
- Files: `plugin/.mcp.json`, `plugin/mcp.json`
- Current mitigation: Deliberate choice documented in `docs/code-standards.md` (lines 104–106) — pinning exact versions would strand users; wheels-only publishing since 0.6.0 avoids source builds. PyPI account protection is upstream's responsibility (private repo).
- Recommendations: Keep the floor but note the residual risk; a compromised PyPI publish would auto-propagate to plugin users on next cold start.

**Remote-script execution in the documented validation step:**
- Risk: `docs/deployment-guide.md` (lines 47–50) instructs maintainers to `curl` Cursor's `validate-template.mjs` from `cursor/plugin-template@main` and run it with `node` — same curl-to-exec pattern, unpinned branch.
- Files: `docs/deployment-guide.md`
- Current mitigation: Maintainer-only, infrequent, from a well-known org.
- Recommendations: Pin the URL to a commit hash, or vendor the validator script into the repo.

**Landing page makes external requests while the product claims local-first:**
- Risk: `site/index.html` loads three Google Font families (lines 9–11), leaking visitor IPs/user-agents to Google — a brand/privacy inconsistency for a product whose pitch is "nothing leaves the room" (`README.md` line 1, `plugin/README.md` privacy section).
- Files: `site/index.html`, `docs/brand-spec.md`
- Current mitigation: `preconnect` hints and `display=swap` only; no other trackers or analytics on the page.
- Recommendations: Self-host the fonts (woff2 in `site/assets/`) to make the page zero-request, restoring the original spec constraint (`docs/superpowers/specs/2026-08-07-landing-page-design.md` D7).

**Secrets hygiene:**
- Risk: Low. No `.env`, credentials, or tokens are committed; `.gitignore` covers `node_modules/`, VitePress `cache/`+`dist/` only. `JARVIS_DIST_TOKEN` lives in the private repo's Actions secrets per `docs/code-standards.md` (lines 171–172).
- Files: `.gitignore`
- Current mitigation: Nothing secret exists in this repo by design.
- Recommendations: None beyond keeping it that way.

## Performance Bottlenecks

**MCP server cold-start vs the 30s connect window:**
- Problem: On a cold uv cache, `uvx --from jarvis-mcp>=0.6.0` resolves and possibly builds transitive deps (`cryptography` compiles Rust) before the stdio server answers — minutes in the worst case, past every MCP client's 30s connect timeout.
- Files: `plugin/.mcp.json`, `plugin/mcp.json`, `plugin/skills/jarvis-setup/SKILL.md` (troubleshooting table)
- Cause: Upstream packaging (`mcp` → `pyjwt[crypto]` → Rust builds); not fixable by a version floor (documented in the skill, line 86).
- Improvement path: The pre-warm (`uv tool install jarvis-mcp` inside setup.sh) is the designed fix — currently claimed in docs but absent from the synced `setup.sh` (see Tech Debt above). Landing the sync is the action.

**Render-blocking Google Fonts on the landing page:**
- Problem: The fonts stylesheet (`site/index.html` line 11) is a render-blocking external request on every page load.
- Files: `site/index.html`
- Cause: External webfonts chosen in the redesign (`docs/brand-spec.md`).
- Improvement path: Self-host woff2 files or accept the ~100–300ms penalty; `display=swap` already avoids invisible text.

**Sequential installer with a ~86MB download:**
- Problem: `setup.sh` installs dependencies strictly sequentially; `scip-java` alone is a ~86MB launcher (`setup.sh` line 633).
- Files: `setup.sh`
- Cause: POSIX-sh simplicity; curl has `--retry 3` but no parallelism.
- Improvement path: Acceptable for an installer; backgrounding downloads would complicate the failure-isolation contract for marginal gain.

## Fragile Areas

**`setup.sh` (synced, never edited here):**
- Files: `setup.sh`
- Why fragile: Strictly POSIX sh (no arrays/`[[`/bashisms) because `curl | sh` ignores the shebang; every function follows subtle contracts — `run_one` failure isolation, `install_scip`'s version-gate (not presence-gate) that must never be "simplified" (`docs/deployment-guide.md` lines 113–115), `shim_dir()` keyed to `JARVIS_DATA_DIR` not `JARVIS_BIN_DIR` (lines 155–164), per-function `trap "rm -rf" EXIT` that clobbers any prior EXIT trap (lines 267, 321). Any local edit is silently overwritten by the next sync (`docs/code-standards.md` lines 15–16).
- Safe modification: Never edit here — fix upstream in `jarvis/`, run `tests/test_setup_sh.py`, cut a release, confirm the sync commit. The `JARVIS_SETUP_SOURCED=1` seam (lines 758–762) is the test hook.
- Test coverage: Private repo only (`tests/test_setup_sh.py` asserts pin/file agreement and release-repo pointers); nothing in this repo exercises it.

**Three-manifest version bump (the delivery mechanism):**
- Files: `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`
- Why fragile: Content ships to installed users *only* when all three `version` fields bump to the same value — a purely human process with no CI backstop (`docs/project-roadmap.md` gap 2). Rollback is forward-only (clients compare versions; `docs/deployment-guide.md` lines 170–171).
- Safe modification: Edit content → bump all three → run Cursor's `validate-template.mjs` manually → push to `main` (all marketplaces serve from `main`).
- Test coverage: None automated; the manual validator covers manifest parsing, name agreement, path resolution, skill frontmatter.

**Pin/release ordering across repos:**
- Files: `setup.sh` (`SCIP_COMMIT_PIN`, `ZOEKT_COMMIT_PIN`), `docs/deployment-guide.md` (lines 100–115)
- Why fragile: A pin bump in the private repo that ships without the matching release tag existing in *this* repo 404s at install time for every user. The private repo's tests assert pin↔file agreement, not release existence — `docs/project-roadmap.md` calls this "the highest-severity silent-failure path in the whole distribution flow" (gap 3).
- Safe modification: Always verify `gh release view <tag> --repo jarvis-intelligence/jarvis-index` before releasing.
- Test coverage: None; manual `gh` check documented but unenforced.

**Sync pipeline from the private repo:**
- Files: `setup.sh`, `docs/deployment-guide.md` (lines 25–27), `docs/project-roadmap.md` (gap 4)
- Why fragile: `sync-public-distribution.yml` runs with `JARVIS_DIST_TOKEN`; one of four historical syncs (`c2a79e5`) had to be run manually after a token 403. A release can complete while the public `setup.sh` stays stale with no alert — the current pre-warm drift is a live instance.
- Safe modification: After every jarvis release, confirm the `chore: sync distribution surface from jarvis@<sha>` commit landed here.
- Test coverage: None; monitoring is an open question (`docs/project-roadmap.md` line 124).

**VitePress build config:**
- Files: `docs/.vitepress/config.ts`
- Why fragile: `ignoreDeadLinks: true` (line 10) means broken internal doc links never fail the build — dead links accumulate silently. `srcExclude` (lines 17–26) is a hand-maintained list of internal docs; adding a new internal maintainer doc without extending the list publishes it to the public site.
- Safe modification: When adding docs, decide public vs internal and update `srcExclude` accordingly; periodically re-enable dead-link checking locally.
- Test coverage: None; the Pages workflow (`.github/workflows/deploy-pages.yml`) only builds.

## Scaling Limits

**Cursor marketplace channel cadence:**
- Current capacity: Instant self-service plugin updates on Claude Code and Codex (push to `main` + version bump).
- Limit: Once listed on Cursor's public marketplace, every update undergoes manual review — version bumps stop being self-service on that channel (`docs/project-roadmap.md` gap 1, `docs/deployment-guide.md` lines 74–84). Submission decision is still open.
- Scaling path: Accept per-update review for reach, or stay on team-marketplace + local-symlink distribution.

**Single sync token / single maintainer path:**
- Current capacity: One automated sync workflow keyed to one `JARVIS_DIST_TOKEN`.
- Limit: Token expiry/permission drift silently stalls `setup.sh` updates (observed once, `c2a79e5`); no alerting.
- Scaling path: Alert on missing sync commit after release (roadmap near-term item); add a second maintainer path.

**Platform coverage:**
- Current capacity: macOS + Linux, arm64 + amd64 for scip/zoekt; scip-java any JVM.
- Limit: Windows unsupported (settled); `scip-swift` publishes macOS arm64 only — Intel Macs cannot index Swift (`setup.sh` lines 542–558 skip silently; `docs/project-roadmap.md` gap 5); Kotlin repos must match the exact pinned Kotlin 2.2.0 (`setup.sh` lines 59–65).
- Scaling path: Publish an x86_64 scip-swift asset or surface the Intel limitation in `jarvis-setup` prerequisites (roadmap medium-term).

## Dependencies at Risk

**`phuongddx/scip` fork (replaces upstream scip):**
- Risk: jarvis depends on a personal fork carrying the scip#465 `relationships` fix; upstream through v0.9.0 breaks `typeHierarchy` on every index (scip-code/scip#464).
- Impact: If the fork or its build pipeline (`build-scip.yml` in the private repo) goes away, new installs cannot get a working `scip`.
- Migration plan: Documented exit ramp in `setup.sh` (lines 14–22) and `docs/project-roadmap.md` watch items — when upstream merges #465 and cuts a release, repoint `SCIP_RELEASE_REPO` at `scip-code/scip` and delete `build-scip.yml` + `SCIP_COMMIT`.

**`scip-java` / scip-kotlinc (exact Kotlin 2.2.0 coupling):**
- Risk: The bundled Kotlin compiler plugin targets Kotlin 2.2.0 *exactly*; 2.1.21/2.3.20 fail with `AbstractMethodError`, 2.2.20 with `NoSuchMethodError` (`setup.sh` lines 59–65).
- Impact: Every scip-java version bump risks silently narrowing Kotlin support; off-pin repos degrade to search-only.
- Migration plan: Re-check the targeted Kotlin on every bump (pin-comment contract); upstream issue tracked in `docs/troubleshooting/upstream-issues.md`.

**`scip-swift` (history of a silent 404 outage):**
- Risk: Assets moved from the personal `phuongddx` owner to the org with no GitHub redirect — every `--only scip-swift` run 404'd until `SCIP_SWIFT_REPO` was repointed (`setup.sh` lines 49–53); release tags did not survive the move (`docs/deployment-guide.md` lines 126–129).
- Impact: Single-platform single-repo binary with a demonstrated breakage mode.
- Migration plan: On any scip-swift release, confirm both `.tar.gz` and `.sha256` assets exist before bumping the pin.

**Unpinned npm packages (`@sourcegraph/scip-typescript`, `@sourcegraph/scip-python`):**
- Risk: No version constraint (see Tech Debt); upstream breaking releases flow straight through.
- Impact: New installs get untested indexer versions; behavior can change between two machines running setup.sh a day apart.
- Migration plan: Pin exact versions upstream with the standard pin-comment format.

**`sourcegraph/zoekt` (no upstream releases):**
- Risk: Binaries are self-built and hosted on this repo's Releases because upstream publishes none.
- Impact: jarvis owns the entire build/host pipeline for search.
- Migration plan: Watch item only — if upstream starts publishing releases, simplify channel 3 (`docs/project-roadmap.md`).

## Missing Critical Features

**CI in this repo:**
- Problem: No workflow validates pushes. Nothing checks three-manifest version agreement, that a `plugin/**` change bumped the version, `.mcp.json`/`mcp.json` equality, JSON manifest validity, the PyPI `--from` floor, or that pinned release tags exist (`docs/project-roadmap.md` gap 2 lists all seven).
- Blocks: Safe self-service contribution; every guard is a manual human step. The cheapest first step (wiring Cursor's `validate-template.mjs` into CI) is already scoped in the roadmap.

**Post-install verification command:**
- Problem: No `setup.sh --verify`; users self-diagnose PATH shadowing and pin mismatches by reading the troubleshooting table in `plugin/skills/jarvis-setup/SKILL.md`.
- Blocks: Fast user triage; automated smoke checks.

**Alerting on sync failure:**
- Problem: A `JARVIS_DIST_TOKEN` failure lets releases complete with a stale public `setup.sh` and no notification (`docs/project-roadmap.md` gap 4; observed once at `c2a79e5`; plausibly the cause of the current pre-warm drift).
- Blocks: Confidence that docs describe the shipped installer.

## Test Coverage Gaps

**No test suite or CI anywhere in this repo:**
- What's not tested: Everything. `docs/codebase-summary.md` (line 3) states it plainly: "No build step, no test suite, no CI in this repo." `setup.sh`'s tests live in the private repo and run before sync — covering the synced file but nothing owned here.
- Files: entire repo; `.github/workflows/` contains only `deploy-pages.yml`
- Risk: Manifest drift, MCP-config drift, site version drift, and dead doc links all land silently — three of those four are currently realized (see Tech Debt / Known Bugs).
- Priority: High

**Plugin manifest contract (three clients):**
- What's not tested: Version agreement across `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`; Cursor name-agreement rules; path-field resolution — all enforced only by a manually-run external validator documented in `docs/deployment-guide.md` (lines 46–53).
- Files: `plugin/.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`
- Risk: A one-file version bump ships content to two clients and silently nobody on the third.
- Priority: High

**MCP registration duplication:**
- What's not tested: `plugin/.mcp.json` ≡ `plugin/mcp.json` byte equality; `--from jarvis-mcp>=0.6.0` floor validity against live PyPI.
- Files: `plugin/.mcp.json`, `plugin/mcp.json`
- Risk: An edit to one file only desyncs Cursor from Claude Code/Codex; a floor above the latest PyPI release breaks all plugin launches.
- Priority: Medium

**Docs site link integrity:**
- What's not tested: Internal links across `docs/**` — `ignoreDeadLinks: true` in `docs/.vitepress/config.ts` (line 10) explicitly disables the only automated check.
- Files: `docs/.vitepress/config.ts`, all `docs/**/*.md`
- Risk: Renamed/moved pages leave dead links in production docs indefinitely.
- Priority: Medium

**Skill content accuracy vs installer reality:**
- What's not tested: That `plugin/skills/*/SKILL.md` claims match `setup.sh` behavior (the `--only jarvis-mcp` / pre-warm claim is currently false). Skill `version` fields (all `"0.1.0"`) are independent of the manifests and never asserted to change with content.
- Files: `plugin/skills/jarvis-setup/SKILL.md`, `plugin/skills/jarvis-use/SKILL.md`, `plugin/skills/jarvis-issues/SKILL.md`, `setup.sh`
- Risk: Agents follow stale instructions and misdiagnose user setups (the skill is the product's steering surface).
- Priority: High

**Landing page version string vs manifests:**
- What's not tested: `site/index.html` "plugin v0.7.0" strings (lines 682, 945) against the manifest versions.
- Files: `site/index.html`
- Risk: Currently failing (0.7.0 vs 0.7.2) with no signal.
- Priority: Low

---

*Concerns audit: 2026-08-21*
