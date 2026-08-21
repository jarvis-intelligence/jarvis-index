# Testing Patterns

**Analysis Date:** 2026-08-21

## Test Framework

**Runner:**
- Not detected — this repo contains no test files, no test runner, and no test dependencies. `package.json` defines only `docs:dev` / `docs:build` / `docs:preview` scripts (VitePress); there is no `test`, `lint`, or `check` script.
- Config: none (no vitest/jest/playwright config, no `Makefile`, no `justfile`).

**Assertion Library:**
- Not detected.

**Run Commands:**
```bash
# There is no test command. The only automated checks that ever run:
npm ci                          # install docs deps
npm run docs:build              # VitePress build — must pass, CI runs it (docs/.vitepress/config.ts)

# Plugin validation (manual, before pushing plugin changes) — docs/deployment-guide.md Channel 2 step 4:
curl -fsSL https://raw.githubusercontent.com/cursor/plugin-template/main/scripts/validate-template.mjs \
  -o /tmp/validate-template.mjs && node /tmp/validate-template.mjs   # expect "Validation passed."
```

## Test File Organization

**Location:**
- Not applicable — no tests live in this repo. Tests for `setup.sh` exist upstream in the **private `jarvis` repo** as `tests/test_setup_sh.py` (referenced by `setup.sh:27`, `setup.sh:31`, `setup.sh:39`, `setup.sh:52` and `docs/deployment-guide.md:20-21`); they assert the commit pins match the repo-root `SCIP_COMMIT`/`ZOEKT_COMMIT` files and that release-repo pointers never equal `JARVIS_REPO`. Changes to `setup.sh` must be made and tested there — this repo's copy is auto-overwritten by `sync-public-distribution.yml` (`docs/code-standards.md` ownership rule).

**Naming:**
- Upstream convention (private repo): `tests/test_setup_sh.py`, pytest-style `test_*.py`.

## Test Structure

**Suite Organization:**
- Not applicable in this repo.

**Patterns (how correctness is actually assured here):**
- **Testability seam in `setup.sh`:** the script ends with `if [ "${JARVIS_SETUP_SOURCED:-}" != "1" ]; then main "$@"; fi` (`setup.sh:758-762`) — tests source the file with `JARVIS_SETUP_SOURCED=1` and call individual functions without performing a real install. Keep helpers overridable for the same reason: `JARVIS_BIN_DIR` and `JARVIS_DATA_DIR` redirect writes away from the real home directory (`setup.sh:141-149`), `BASH_SHIM_CANDIDATES` and `ZOEKT_BASE_URL` point at fixtures (`setup.sh:359-360`) (`docs/code-standards.md` "Testability").
- **CI as a build gate:** `.github/workflows/deploy-pages.yml` runs `npm ci` + `npx vitepress build docs` on every push to `main` touching `site/**`, `docs/**`, or package files — a docs build failure is the only automated failure signal in this repo.
- **Manual plugin validator:** Cursor's official `validate-template.mjs` checks marketplace/plugin name agreement, path-field resolution, and skill frontmatter across all three clients — run it from the repo root before pushing any change under `plugin/`, `.claude-plugin/`, `.codex-plugin/`, or `.cursor-plugin/` (`docs/deployment-guide.md:46-53`). The `no hooks/hooks.json` warning is expected — this plugin ships no hooks.
- **Documented smoke tests:** `docs/deployment-guide.md` "Post-publish smoke test" (lines 142-166) prescribes a fresh-machine run: `curl … setup.sh | sh`, `uv tool install jarvis-mcp`, `command -v scip zoekt-git-index zoekt-webserver`, `scip --version` (must match `SCIP_COMMIT_PIN`), `jarvis index` + `jarvis status <slug>` (expect `indexed`), then one MCP call `goToDefinition(repo: "<slug>", symbol: "main")` expecting a non-error `definitions` array.
- **Targeted re-checks:** `./setup.sh --only scip --force`, `--only zoekt --force` (flag value is `zoekt`, not `zoekt-git-index`), and `--help` (`docs/deployment-guide.md:160-166`).
- **Clean-client verification:** install from each marketplace in a clean Claude Code / Codex CLI / Cursor and confirm the `jarvis` MCP server auto-registers and all three skills list (`docs/deployment-guide.md:56-72`).
- **Trigger examples as lightweight validation:** `plugin/skills/jarvis-use/SKILL.md:80-83` lists should-trigger and should-NOT-trigger phrasings to sanity-check skill descriptions without tooling.
- **Release-asset verification before pin bumps:** `gh release list` / `gh release view <tag>` against `jarvis-intelligence/jarvis-index`, and confirming both `.tar.gz` and `.sha256` assets are attached (`docs/deployment-guide.md:105-129`).

## Mocking

**Framework:** Not detected (no tests to mock in).

**Patterns:**
- The nearest analogue is fixture redirection via environment overrides, used by the upstream private-repo tests: `JARVIS_BIN_DIR`, `JARVIS_DATA_DIR`, `BASH_SHIM_CANDIDATES`, `ZOEKT_BASE_URL` (`setup.sh:141-149`, `setup.sh:359-360`). `bash_at_least_44` parses `bash --version` output rather than `$BASH_VERSINFO` specifically "so a test fixture can be a plain sh script" (`setup.sh:366-368`).

**What to Mock:**
- Upstream only: the network (download URLs → fixture servers), the filesystem (`JARVIS_BIN_DIR` → temp dir), and system bash (`BASH_SHIM_CANDIDATES` → fixture scripts).

**What NOT to Mock:**
- The `run_one` failure-isolation and summary flow, and the `installed_scip_matches_pin` version gate — these behaviors are the contract the tests exist to protect (`setup.sh:434-446`, `setup.sh:712-723`).

## Fixtures and Factories

**Test Data:**
- Not detected in this repo. Upstream fixtures live in the private `jarvis` repo alongside `tests/test_setup_sh.py`.

**Location:**
- Not applicable.

## Coverage

**Requirements:** None enforced — no coverage tooling, no thresholds, no reporting.

## Test Types

**Unit Tests:**
- Not present. Upstream (`jarvis` private repo) unit-tests `setup.sh` functions via the `JARVIS_SETUP_SOURCED=1` sourcing seam.

**Integration Tests:**
- Not present as code. The functional equivalents are the **manual procedures** documented in `docs/deployment-guide.md`: the plugin validator step (Channel 2), clean-client installs across Claude Code / Codex / Cursor, and the post-publish fresh-machine smoke test.

**E2E Tests:**
- Not used. The closest end-to-end check is manual: run `setup.sh`, `uv tool install jarvis-mcp`, `jarvis index <repo>`, `jarvis status <slug>`, then a live `goToDefinition` MCP call through a real client (`docs/deployment-guide.md:142-158`).

## Common Patterns

**Async Testing:**
- Not applicable — no async code under test in this repo.

**Error Testing:**
- Not applicable in-repo. Upstream tests assert drift-prevention invariants on `setup.sh`: `SCIP_COMMIT_PIN`/`ZOEKT_COMMIT_PIN` must match the repo-root `SCIP_COMMIT`/`ZOEKT_COMMIT` files CI builds from, and the release-repo pointers must never equal `JARVIS_REPO` (`setup.sh:27-41`, `docs/code-standards.md` "Pin discipline"). When adding a pin or pointer to `setup.sh` upstream, extend `tests/test_setup_sh.py` to assert it — that is the established pattern.

## Guidance for Future Work

- **Never add tests for `setup.sh` here** — the file is synced and overwritten; test it in the private `jarvis` repo.
- **For any change under `plugin/` + manifests:** bump all three versions to the same value (`plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`), run the Cursor validator, and manually verify in a clean client before pushing to `main` (`docs/deployment-guide.md` Channel 2).
- **For docs/site changes:** `npm run docs:build` locally is the pre-push check; CI (`.github/workflows/deploy-pages.yml`) re-runs it and deploys.
- **For skill-content changes:** rely on the validator for frontmatter correctness and on should/should-NOT trigger phrasing review for description quality (`plugin/skills/jarvis-use/SKILL.md:80-83`).

---

*Testing analysis: 2026-08-21*
