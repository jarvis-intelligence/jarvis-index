# Deployment Guide — jarvis-index

"Deployment" here means **publishing**: getting the installer, the plugin, and the binary assets
into users' hands. This repo has no build, no runtime, and nothing to deploy to a server.

There are four independent publishing channels. Know which one your change belongs to.

---

## Channel 1 — `setup.sh` (automated, from the private repo)

**Trigger:** a `jarvis` release.
**Mechanism:** `sync-public-distribution.yml` in the private repo overwrites `setup.sh` here and
commits as `chore: sync distribution surface from jarvis@<sha>`.
**Your action here:** none. Never edit `setup.sh` in this repo.

To change the installer:

1. Edit `jarvis/setup.sh` in the private repo.
2. Run its tests — `tests/test_setup_sh.py` asserts the commit pins match the repo-root
   `SCIP_COMMIT` / `ZOEKT_COMMIT` files and that the release repos are not `JARVIS_REPO`.
3. Cut a jarvis release (use the project-scoped `jarvis-release` skill).
4. Confirm the sync commit landed here.

**Known failure mode:** commit `c2a79e5` records a sync that had to be run manually after a
`JARVIS_DIST_TOKEN` 403. If a release lands with no matching sync commit here, check that token
first.

---

## Channel 2 — Plugin content (manual, here)

**Trigger:** any change under `plugin/`, `.claude-plugin/`, `.codex-plugin/`, or `.cursor-plugin/`.
**Mechanism:** users' clients re-read the manifest and pick up a **higher version**. Content
changes with no version bump reach nobody.

Steps:

1. Edit the content — skills, `plugin/README.md`, MCP config, assets.
2. If the MCP config changed, apply the edit to **both** `plugin/.mcp.json` and `plugin/mcp.json`,
   and confirm the `--from jarvis-mcp>=X` floor is still a valid `>=` minimum against PyPI.
3. Bump **all three** version fields to the same value:
   - `plugin/.claude-plugin/plugin.json` → `version`
   - `plugin/.cursor-plugin/plugin.json` → `version`
   - `.codex-plugin/plugin.json` → `version`
4. Run Cursor's official validator from the repo root:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/cursor/plugin-template/main/scripts/validate-template.mjs \
     -o /tmp/validate-template.mjs && node /tmp/validate-template.mjs
   ```
   Expect `Validation passed.` — the `no hooks/hooks.json` warning is normal, this plugin ships no
   hooks. The validator checks marketplace/plugin name agreement, path-field resolution, and skill
   frontmatter, so it catches most breakage across all three clients, not just Cursor.
5. Commit and push to `main`. All marketplaces serve from `main`.

Verify from a clean client:

```bash
# Claude Code
/plugin marketplace add jarvis-intelligence/jarvis-index
/plugin install jarvis@jarvis

# Codex CLI
codex plugin marketplace add https://github.com/jarvis-intelligence/jarvis-index --ref main
codex plugin add jarvis

# Cursor — no CLI; symlink for a local check, then Developer: Reload Window
ln -s "$PWD/plugin" ~/.cursor/plugins/local/jarvis
```

Then confirm the `jarvis` MCP server appears without a manual `mcp add`, and that the three
skills are listed.

### Cursor marketplace distribution

Cursor has no user-facing CLI for adding a marketplace, so reaching users takes one of three
routes:

| Route | Who can use it | Notes |
|---|---|---|
| Team marketplace | Teams/Enterprise admins | Dashboard → Plugins → Add Marketplace → Import from Repo. Auto-refresh needs the Cursor GitHub App installed on this repo. |
| Local install | Anyone | Clone + symlink `plugin/` into `~/.cursor/plugins/local/jarvis`. |
| Public marketplace | Requires submission | Submit at <https://cursor.com/marketplace/publish>. Manually reviewed, must be open source, and **every update is reviewed before publishing** — so a plugin version bump is not self-service once listed. |

---

## Channel 3 — Binary release assets (automated, from the private repo)

**Trigger:** a bump to `jarvis/ZOEKT_COMMIT` or `jarvis/SCIP_COMMIT`.
**Mechanism:** `build-zoekt.yml` / `build-scip.yml` cross-compile from the pinned commit and
publish tarballs to **this repo's** Releases.

Current tags:

| Tag | Contents |
|---|---|
| `scip-56791658a873` | `scip-<os>-<arch>.tar.gz` + `.sha256` — fork build: upstream v0.9.0 + the scip#465 relationships fix |
| `zoekt-33f1f18af292` | `zoekt-<os>-<arch>.tar.gz` + `.sha256` — one tarball, both `zoekt-git-index` and `zoekt-webserver` |

Bumping a pin is a two-part change that must land together:

1. Update `jarvis/SCIP_COMMIT` (or `ZOEKT_COMMIT`) → CI publishes the new release tag here.
2. Update the matching `*_COMMIT_PIN` in `jarvis/setup.sh` → syncs here on the next release.

If step 2 ships without step 1, `setup.sh` downloads a 404. The private repo's tests guard the
pin/file agreement, not the existence of the release — verify the tag exists before releasing:

```bash
gh release list --repo jarvis-intelligence/jarvis-index
gh release view scip-<commit> --repo jarvis-intelligence/jarvis-index
```

**`scip` upgrades are special.** `install_scip` is version-gated, not presence-gated, so a pin
bump replaces existing users' upstream binary exactly once. Do not "simplify" it to a presence
check — that would strand every existing install on broken `typeHierarchy` forever.

---

## Channel 4 — `scip-swift` (separate public repo)

**Trigger:** a `jarvis-intelligence/scip-swift` release.
**Mechanism:** assets are published on that repo; `setup.sh` pins the version.
**Your action:** bump `SCIP_SWIFT_VERSION` in `jarvis/setup.sh` — it reaches users via the next
jarvis release sync. Asset naming uses `macos`, not `darwin`, and only arm64 is published.

Releases on this repo are cut by hand, and the tags did not survive the move off the old
`phuongddx/scip-swift` owner — which silently 404'd every `setup.sh --only scip-swift` run. When
tagging a version, confirm both assets (`.tar.gz` and `.tar.gz.sha256`) are actually attached
before bumping the pin.

---

## The Python package (not this repo)

`jarvis-mcp` is published to PyPI from the private repo. Wheels ship Cython-compiled `.so`
modules — **no sdist**. Users get it through `uvx` (plugin path) or `uv tool install` (manual
path). Use the `jarvis-release` skill for the 3-file version bump, changelog, PR, tag, and
publish-pipeline verification.

---

## Post-publish smoke test

On a machine with nothing installed:

```bash
curl -fsSL https://raw.githubusercontent.com/jarvis-intelligence/jarvis-index/main/setup.sh | sh
uv tool install jarvis-mcp

command -v scip zoekt-git-index zoekt-webserver   # ~/.jarvis/bin on PATH?
scip --version                                     # matches SCIP_COMMIT_PIN?

jarvis index /path/to/a/repo
jarvis status <slug>                               # expect: indexed
```

Then call one MCP tool through the client — `goToDefinition(repo: "<slug>", symbol: "main")`. A
non-error response with a `definitions` array means the whole pipeline works.

Targeted re-checks:

```bash
./setup.sh --only scip --force        # one dependency
./setup.sh --only zoekt --force       # value is `zoekt`, not `zoekt-git-index`
./setup.sh --help
```

## Rollback

- **Plugin content:** revert the commit on `main` and bump the version again (forward-only —
  clients compare versions, so a lower number does not roll users back).
- **Binary pin:** repoint `*_COMMIT_PIN` at the previous release tag in `jarvis/setup.sh` and
  re-release. Old release tags are not deleted, so the previous asset stays downloadable.
- **`setup.sh`:** revert in `jarvis/` and re-release. Reverting here is pointless — the next sync
  overwrites it.
