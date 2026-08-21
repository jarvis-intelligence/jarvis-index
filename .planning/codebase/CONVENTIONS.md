# Coding Conventions

**Analysis Date:** 2026-08-21

This repo is jarvis's **public distribution surface** — installer, plugins, docs, landing page. It holds no application source; the code surfaces are POSIX shell (`setup.sh`), JSON/YAML manifests, Markdown (skills + docs), and small TypeScript/CSS for the VitePress site. The canonical, self-authored standards doc is `docs/code-standards.md` — read it before editing anything. This document mirrors and expands it.

## Ownership Rule (read first)

- `setup.sh` is **synced from the private `jarvis` repo** by `sync-public-distribution.yml` and silently overwritten on each release — never edit it here; fix it upstream in `jarvis/` (see `docs/code-standards.md`, `README.md`, `docs/deployment-guide.md`).
- Everything else — `plugin/**`, `.claude-plugin/**`, `.codex-plugin/**`, `.cursor-plugin/**`, `docs/**`, `README.md`, `site/**` — has its source of truth **here**; edit directly.

## Naming Patterns

**Files:**
- Markdown docs: kebab-case — `docs/code-standards.md`, `docs/deployment-guide.md`, `docs/tools/go-to-definition.md`.
- Skills: kebab-case directory + fixed `SKILL.md` filename — `plugin/skills/jarvis-use/SKILL.md`; optional `references/*.md` and `agents/openai.yaml` inside the same directory.
- Shell: flat `setup.sh` at repo root.
- Plan artifacts: `MMDD-HHMM-topic` directories — `plans/0807-2314-landing-page/plan.md`.

**Functions (shell):**
- snake_case, verbs for operations: `install_scip`, `detect_os`, `verify_sha256`, `run_one`, `print_summary` (`setup.sh`).
- Installer functions are prefixed `install_` and registered in `main()` via `run_one <name> install_<name>` (`setup.sh:745-751`).
- Logging helpers: `log_info`, `log_warn`, `log_error` (`setup.sh:69-79`).

**Variables (shell):**
- Globals and pinned constants: SCREAMING_SNAKE_CASE — `SCIP_COMMIT_PIN`, `ZOEKT_RELEASE_REPO`, `ONLY`, `FORCE`, `SUMMARY`, `EXIT_CODE` (`setup.sh:28-65`, `setup.sh:645-649`).
- Function-local temporaries: leading underscore — `_tmp`, `_name`, `_tar_url`, `_dest_name`, `_answer`, `_expected` (`setup.sh:258-262`, `setup.sh:706`).
- Environment-overridable knobs are also SCREAMING_SNAKE: `JARVIS_BIN_DIR`, `JARVIS_DATA_DIR`, `BASH_SHIM_CANDIDATES`, `JARVIS_SETUP_SOURCED` (`setup.sh:141-149`, `setup.sh:360`, `setup.sh:760`).

**Types:**
- Not applicable — no typed application code. `docs/.vitepress/config.ts` is untyped except VitePress's own `defineConfig` inference.

**Plugin/marketplace names:**
- Lowercase kebab-case, and `name` must match exactly between `.cursor-plugin/marketplace.json` and `plugin/.cursor-plugin/plugin.json` — Cursor's validator hard-errors on mismatch (`docs/code-standards.md` "Cursor-specific constraints").

## Code Style

**Formatting:**
- No formatter or linter config exists anywhere in the repo — no `.editorconfig`, Prettier, ESLint, ShellCheck config, `Makefile`, or `justfile` (verified by glob). Style is enforced by convention and review only.
- Shell (`setup.sh`): tab indentation; one command per line; section dividers as banner comments (`# ---- logging ----`, `setup.sh:67`).
- JSON manifests: 2-space indent — `plugin/.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `plugin/.mcp.json`.
- TypeScript (`docs/.vitepress/config.ts`): single quotes, no semicolons, 2-space indent.
- CSS (`docs/.vitepress/theme/style.css`): VitePress CSS-variable overrides only, grouped by light/dark theme with banner comments (`/* ---- Light theme (default) ---- */`).

**Linting:**
- ShellCheck annotations appear inline where a suppressible idiom is deliberate: `# shellcheck disable=SC2064` (`setup.sh:266`) and the SC2086 word-split convention documented in `docs/code-standards.md` — but no CI lint step runs (see TESTING.md).

## Shell Conventions (`setup.sh`)

Follow these when contributing upstream in `jarvis/`; the same file lands here via sync.

- **Strictly POSIX sh.** `#!/usr/bin/env sh` + `set -eu` (`setup.sh:1`, `setup.sh:10`). `curl | sh` ignores the shebang and runs dash, so: no arrays, no `[[ ]]`, no `local`, no `${arr[@]}`, no bash-only expansion. Lists are newline-delimited strings (`SUMMARY`, `setup.sh:647-648`).
- **Prefer `if cmd; then …; fi` over `cmd && cmd`** under `set -e` — the `&&` form has ambiguous exit semantics across dash/bash-posix (`setup.sh:743-745`).
- **Pin discipline.** Every external dependency is pinned to an exact commit/tag, never `latest`. Each pin's comment answers: why this exact version, what breaks on a different one, what to re-check when bumping — plus an exit ramp when a fork is used (`setup.sh:14-65`).
- **Install-function contract** (`docs/code-standards.md` "Install-function contract"): every `install_*` must be idempotent (skip when present unless `FORCE=1`; `install_scip` is version-gated via `installed_scip_matches_pin` instead), verify SHA256 before installing (`verify_sha256`, `setup.sh:238-248`), return non-zero rather than exit (so `run_one` isolates the failure, `setup.sh:714-723`), and warn about PATH shadowing where relevant.
- **Temp cleanup via trap**, cleared on every exit path: `trap "rm -rf '$_tmp'" EXIT` then `trap - EXIT` after manual cleanup (`setup.sh:264-303`).
- **Prompt from `/dev/tty` only** — stdin is the piped script under `curl | sh` (`confirm`, `setup.sh:83-108`).
- **Testability seam:** the file ends with `if [ "${JARVIS_SETUP_SOURCED:-}" != "1" ]; then main "$@"; fi` so tests can source it and call functions individually; keep helpers overridable via env for the same reason (`setup.sh:758-762`).

## Import Organization

**Order:**
1. Not applicable for shell — `setup.sh` has no imports.
2. TypeScript (`docs/.vitepress/config.ts`): framework import first (`vitepress`), then side-effect theme import (`./style.css`), then the default export.

**Path Aliases:**
- None used. Relative paths only (`docs/.vitepress/theme/index.ts`).

## Manifest & Skill Conventions

- **Skill file shape** (from `docs/code-standards.md`): `SKILL.md` (required, YAML frontmatter `name` + `description` + `version`), optional `agents/openai.yaml` (Codex interface block with `interface.display_name` / `short_description` / `default_prompt`), optional `references/*.md` loaded on demand. See `plugin/skills/jarvis-use/`.
- **`description` is the trigger surface** — it must name the concrete situations that should invoke the skill; quote it in frontmatter when it contains colons (`plugin/skills/jarvis-use/SKILL.md:3`).
- **Version bump is the delivery mechanism.** Any change under `plugin/` requires bumping `version` to the same value in all three manifests: `plugin/.claude-plugin/plugin.json`, `plugin/.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`. Plugin version is independent of the `jarvis-mcp` PyPI package (`docs/code-standards.md`).
- **MCP registration is duplicated, not symlinked:** `plugin/.mcp.json` (Claude Code, Codex) and `plugin/mcp.json` (Cursor) hold identical JSON — edit both or neither. Keep `--from jarvis-mcp>=0.6.0` as a `>=` floor (never exact-pin, never below 0.6.0), and never add the `[semantic]` extra (`docs/code-standards.md`).

## Markdown & Docs Conventions

- **Frontmatter:** docs pages carry only `description` (`docs/tools/go-to-definition.md:1-3`); skills carry `name`/`description`/`version`.
- **Skills open with sibling cross-links:** first body line names the two sibling skills so a mis-landed agent can redirect (`plugin/skills/jarvis-setup/SKILL.md:9`).
- **Procedure docs use numbered H2 sections** (`## 1. Check prerequisites` … `## 7. Next`, `plugin/skills/jarvis-setup/SKILL.md`).
- **Tables for decision surfaces:** decision matrices (`plugin/skills/jarvis-use/SKILL.md:15-25`), troubleshooting (`plugin/skills/jarvis-setup/SKILL.md:83-91`), ownership rules (`docs/code-standards.md:5-13`), API parameters (`docs/tools/go-to-definition.md:17-20`).
- **Inline code in backticks always** for commands, paths, tool names, symbols — never bare.
- **On-demand references over inlining:** `jarvis-use/SKILL.md:50` points at `references/tool-roster.md` with an exact retrieval command (`grep -nA20 "## Tool detail" references/tool-roster.md`) instead of inlining 44 lines.
- **State limitations as settled decisions with rationale inline**, never as TODOs — e.g. the `semanticSearch` gotcha in `plugin/skills/jarvis-use/SKILL.md:68` explicitly says the decision is not being revisited, to stop an agent from "helpfully" editing `.mcp.json`.
- **Require confirmation before outward-facing actions:** `jarvis-issues` shows the drafted issue and gets explicit user approval before `gh issue create` (`plugin/skills/jarvis-issues/SKILL.md:63-71`).
- **Keep should/should-NOT trigger examples** as lightweight validation (`plugin/skills/jarvis-use/SKILL.md:80-83`).
- **Size caps:** soft cap 500 lines per doc; root `README.md` under 300 lines and a router, not a manual (`docs/code-standards.md` "Documentation").
- **Maintainer-only docs are excluded from the site** via `srcExclude` in `docs/.vitepress/config.ts:17-26` (`code-standards.md`, `deployment-guide.md`, `brand-spec.md`, etc.).
- **Update docs when user-visible behavior, install steps, commands, architecture, or public contracts change; skip changelog noise for internal edits** (`docs/code-standards.md`).

## Error Handling

**Patterns:**
- Shell: `log_error "…"` to stderr + `return 1` — never `exit` from helpers; `main` decides exit codes (`parse_args` failure → exit 2, platform failure → exit 1, any installer failure aggregated into `EXIT_CODE=1` after the summary prints, `setup.sh:731-755`).
- Failure isolation: `run_one` records `ok`/`FAILED` per dependency and continues, so one bad dependency never aborts the run (`setup.sh:712-723`).
- Unsupported platforms fail fast with a specific message (`detect_os`/`detect_arch`, `setup.sh:113-137`).
- Docs/skills describe jarvis's own error contract: every MCP tool returns `{"error": "..."}` rather than raising; check for an `error` key before reading results (`plugin/skills/jarvis-use/SKILL.md:77`, `plugin/skills/jarvis-use/references/tool-roster.md:3`).
- Ambiguity is surfaced, not swallowed: ambiguous symbol resolution returns a structured `candidates` list instead of a silent empty result (`plugin/skills/jarvis-use/SKILL.md:38-41`).

## Logging

**Framework:** plain shell `echo`/`printf` helpers (no logging library).

**Patterns:**
- `log_info` → stdout, two-space indent (user-facing progress); `log_warn`/`log_error` → stderr with `warn:`/`error:` prefixes (`setup.sh:69-79`). Usage output goes to stderr on bad args (`setup.sh:691`).
- End-of-run `summary` block lists every dependency with `ok`/`FAILED` (`print_summary`, `setup.sh:703-710`).

## Comments

**When to Comment:**
- Comment the **why, not the what**, at load-bearing lines — `setup.sh` is the exemplar: "The subshell is load-bearing. POSIX requires the shell to ABORT …" (`setup.sh:94-97`), "The bin_dir check is load-bearing: … which CI caught" (`setup.sh:215-218`).
- Pin comments cite upstream issues and test files: scip-code/scip#464/#465 and `tests/test_setup_sh.py` assertions (`setup.sh:14-32`).
- Usage-signature comment blocks precede multi-argument helpers: `#   install_tarball_binary <tar_url> <sha_url> <member> <dest_name>` (`setup.sh:254-257`).
- CSS comments map tokens to their source of truth (`docs/.vitepress/theme/style.css:1-5`).
- Refactoring restraint is documented inline: `install_raw_binary` is deliberately separate from `install_tarball_binary` because four callers depend on the tarball helper's behavior (`setup.sh:306-310`).

**JSDoc/TSDoc:**
- Not used. TypeScript files carry a one-line operational comment instead (`docs/.vitepress/config.ts:1`).

## Function Design

**Size:** small single-purpose helpers (~5-50 lines); orchestration lives in `main()` as a flat sequence of `if should_run X; then run_one …; fi` lines (`setup.sh:745-751`).

**Parameters:** positional `$1..$n`, immediately assigned to `_underscore` locals with names matching intent (`setup.sh:258-262`). Named flags parsed in `parse_args` with a `while [ $# -gt 0 ]; case` loop; missing values are hard errors (`setup.sh:670-696`).

**Return Values:** functions that compute echo to stdout for capture (`detect_os`, `bin_dir`, `shim_dir` — `setup.sh:113-164`); status functions return 0/non-zero (`have_cmd`, `bash_at_least_44`, `should_run`); installers return success/failure only.

## Module Design

**Exports:** Not applicable (no modules). Closest analogues: shell helpers are session-global by design; the only "entry point guard" is the `JARVIS_SETUP_SOURCED` sourcing seam (`setup.sh:758-762`).

**Barrel Files:** None. TypeScript theme re-exports VitePress's `DefaultTheme` verbatim (`docs/.vitepress/theme/index.ts`).

## Commits

- Conventional-commit format; no AI attribution or co-author trailers (`docs/code-standards.md` "Commits").
- `chore: sync distribution surface from jarvis@<sha>` is machine-generated by the sync workflow — never hand-write that form.

---

*Convention analysis: 2026-08-21*
