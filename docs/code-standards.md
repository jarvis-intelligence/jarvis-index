# Code Standards — jarvis-index

## The ownership rule (read this first)

| Path | Source of truth | Editing here |
|---|---|---|
| `setup.sh` | `jarvis/setup.sh` (private repo) | **Never.** Overwritten by `sync-public-distribution.yml` on the next jarvis release. Fix it in `jarvis/`. |
| `plugin/**` | **Here** | Edit directly. |
| `.claude-plugin/**` | **Here** | Edit directly. |
| `.codex-plugin/**` | **Here** | Edit directly. |
| `.cursor-plugin/**` | **Here** | Edit directly. |
| `README.md` | **Here** | Edit directly. |
| `docs/**` | **Here** | Edit directly. |

An edit to `setup.sh` in this repo is silently lost. There is no warning, no conflict, no CI
failure — it is a plain overwrite.

## Shell (`setup.sh`)

Applies when fixing `setup.sh` upstream in `jarvis/`, and to reading it here.

### Strictly POSIX sh

`curl -fsSL … | sh` **ignores the shebang** and runs under the system `sh` — dash on many Linux
distros. Therefore:

- No arrays. Lists are space-separated strings that intentionally word-split
  (with an explicit `# shellcheck disable=SC2086` at the split site).
- No `[[ ]]`, no `local`, no `${arr[@]}`, no bash-only parameter expansion.
- `set -eu` at the top.
- Prefer the explicit `if should_run X; then run_one X …; fi` form over
  `should_run X && run_one X …` — the latter has ambiguous exit-status semantics under `set -e`
  across dash and bash-posix.

### Pin discipline

Every external dependency is pinned to an exact commit or tag. **Never `latest`.**

Each pin carries a comment answering three questions:

1. *Why this exact version* — e.g. `v0.1.1` is the first release whose binary supports
   `scip-swift index …`; `v0.1.2` is the first whose xcodebuild backend disables code signing.
2. *What breaks on a different one* — e.g. Kotlin `2.1.21` and `2.3.20` fail with
   `AbstractMethodError`, `2.2.20` with `NoSuchMethodError`.
3. *What to re-check when bumping* — e.g. "re-check which Kotlin the new release targets."

Where a fork is used instead of upstream, the comment also records the **exit ramp**: the
`scip` block states that when upstream merges scip-code/scip#465 and cuts a release, repoint at
`scip-code/scip` and delete `build-scip.yml` + `SCIP_COMMIT`.

Two pins are asserted by tests in the private repo (`tests/test_setup_sh.py`): `SCIP_COMMIT_PIN`
and `ZOEKT_COMMIT_PIN` must match the repo-root `SCIP_COMMIT` / `ZOEKT_COMMIT` files CI builds
from, and the release-repo pointers must never equal `JARVIS_REPO`.

### Install-function contract

Every `install_*` function must:

- Be **idempotent** — skip when already present, unless `FORCE=1`. The one exception is
  `install_scip`, which is *version*-gated via `installed_scip_matches_pin` rather than
  presence-gated, so a pin bump actually replaces the stranded upstream binary.
- **Verify SHA256** before installing any downloaded artifact.
- **Return non-zero on failure** rather than exiting — `run_one` isolates the failure so one bad
  dependency never aborts the run.
- **Warn about PATH shadowing** where relevant. `install_scip` checks whether a different `scip`
  sits earlier on `PATH` and warns, because `~/.jarvis/bin` is *appended*, so an older binary
  keeps winning at runtime.

### Testability

The file ends with a seam:

```sh
if [ "${JARVIS_SETUP_SOURCED:-}" != "1" ]; then main "$@"; fi
```

Tests source the file with `JARVIS_SETUP_SOURCED=1` and call individual functions without
performing a real install. Keep helpers overridable for the same reason — `BASH_SHIM_CANDIDATES`
and `ZOEKT_BASE_URL` exist so tests can point at fixtures.

## Plugin manifests

### Version bumps are the delivery mechanism

Plugin content ships to installed users **only** when a version is bumped. Any change under
`plugin/` requires bumping **all three** manifests to the *same* value:

- `plugin/.claude-plugin/plugin.json` → `version`
- `plugin/.cursor-plugin/plugin.json` → `version`
- `.codex-plugin/plugin.json` → `version`

They version **independently of the `jarvis-mcp` PyPI package** — a docs-only skill fix ships
without a PyPI release.

The two marketplace manifests (`.claude-plugin/marketplace.json`, `.cursor-plugin/marketplace.json`)
carry no version and rarely change.

### MCP registration: two files, identical contents

`plugin/.mcp.json` (Claude Code, Codex) and `plugin/mcp.json` (Cursor) hold the same JSON. **Edit
both or neither.** They are duplicated rather than symlinked because a git symlink does not
survive checkout on Windows without developer mode, and Cursor supports Windows.

`--from jarvis-mcp>=0.6.0` must remain a valid `>=` minimum against what is actually published on
PyPI. Do not pin it to an exact version — that would strand users on a stale server.

The floor must also never drop below **0.6.0**, the first release published as wheels-only.
Every earlier version (0.0.1 – 0.5.1) ships an sdist alongside a single `py3-none-any` wheel, so a
lower floor lets `uvx` resolve a distribution it has to Cython-compile from source — inside the MCP
client's 30s connect window, which it will not fit.

Do not add the `[semantic]` extra to either registration. Keeping lancedb/torch out of every
plugin user's cold start is a deliberate, settled trade-off; users who need `semanticSearch`
register a second differently-named server.

### Cursor-specific constraints

- `name` in `.cursor-plugin/marketplace.json` and in `plugin/.cursor-plugin/plugin.json` must be
  lowercase kebab-case **and must match each other** — Cursor's validator errors otherwise.
- Every path field (`logo`, `skills`, `mcpServers`, `rules`, `agents`, `commands`, `hooks`) must
  resolve relative to the plugin directory. Declaring them is optional — Cursor auto-discovers
  `skills/` and `mcp.json` — but a declared path that does not exist is a hard error.
- Skills need `name` **and** `description` in frontmatter. Ours already carry both.
- Validate before pushing (see [deployment-guide.md](deployment-guide.md#channel-2--plugin-content-manual-here)).

## Skills

### File shape

```
plugin/skills/<name>/
├── SKILL.md              required — YAML frontmatter + body
├── agents/openai.yaml    Codex interface block
└── references/*.md       optional, loaded on demand
```

Frontmatter carries `name`, `description`, and `version`. The `description` is the trigger
surface — it must name the concrete situations that should invoke the skill, because that string
is what the agent matches against.

### Writing conventions

- **Open with sibling cross-links.** Every skill's first body line names its two siblings, so an
  agent that landed on the wrong one can redirect.
- **Reference files are loaded on demand.** `jarvis-use/SKILL.md` tells the agent exactly how to
  pull the detail it needs (`grep -nA20 "## Tool detail" references/tool-roster.md`) instead of
  inlining 44 lines it usually will not need.
- **State limitations as settled decisions with the rationale inline** — not as TODOs. The
  `semanticSearch` gotcha explains the trade-off and then says the decision is not being
  revisited, which stops an agent from "helpfully" changing `.mcp.json`.
- **Document known limitations in `jarvis-issues`** so the agent checks them before filing a
  duplicate.
- **Require confirmation before outward-facing actions.** `jarvis-issues` must show the drafted
  title and body and get explicit user approval before `gh issue create`.
- **Keep trigger examples** where useful — `jarvis-use` lists should-trigger and should-NOT-trigger
  phrasings as lightweight validation.

## Documentation

- Markdown lives in `docs/`; plans live in `plans/`. Soft cap of 500 lines per doc file.
- `README.md` stays under 300 lines and is a router, not a manual — the full user-facing detail
  belongs in `plugin/README.md` and the skills.
- Update docs when user-visible behavior, install steps, commands, architecture, or public
  contracts change. Skip changelog noise for internal edits.

## Commits

- Conventional-commit format. No AI attribution or co-author trailers.
- `chore: sync distribution surface from jarvis@<sha>` is machine-generated by the sync workflow —
  do not hand-write that form.
- Never commit secrets, tokens, or `.env` files. `JARVIS_DIST_TOKEN` lives in GitHub Actions
  secrets in the private repo, never here.
