---
phase: "6"
slug: "plugin-skills-enhancement"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-11"
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded by plan-phase from `06-RESEARCH.md` § Validation Architecture (lines 809-884), which carries
> the measured evidence behind every row here. The Per-Task Verification Map is filled once plans exist.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | **None.** No test framework, no linter, no `.editorconfig` in this repo (`.claude/CLAUDE.md:106`). Validation is zero-dependency Node assertion scripts invoked from CI, in the `scripts/check-manifests.mjs` / `scripts/verify-build.mjs` style. |
| **Config file** | none — `package.json:13-14` aliases (`check:manifests`, `verify`) |
| **Quick run command** | `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` |
| **Full suite command** | `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs && claude plugin validate ./plugin --strict && claude plugin validate . --strict` |
| **Release-gate command** | `node scripts/check-plugin.mjs --release` (adds tag-existence + URL 200 probes; valid only AFTER the tag is pushed) |
| **Estimated runtime** | Quick: sub-second, pure filesystem, no network. Full: ~seconds plus the `claude` CLI install step. |

Node 22 is pinned in `.github/workflows/checks.yml:39`.

---

## Sampling Rate

- **After every task commit:** `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs`
- **After every plan wave:** full suite (both Node scripts + both `claude plugin validate --strict` runs) — this is what `checks.yml` executes
- **Before `/gsd-verify-work`:** full suite green
- **Phase gate (post-merge, post-tag):** `node scripts/check-plugin.mjs --release`, then the manual client checks below
- **Max feedback latency:** < 5s for the quick command

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01 T1 | 06-01 | 1 | D-12, D-13, SC-4 | T-06-02 | P1's limitation stated in-script so a green P1 is never read as a server diff | guard (tracer, RED) | `node scripts/check-plugin.mjs; test $? -eq 1` | ❌ creates `scripts/check-plugin.mjs` | ⬜ pending |
| 06-01 T2 | 06-01 | 1 | D-01, SC-1 | T-06-01 | no shipped file steers an agent at a non-existent snake_case tool | content (GREEN) | `node scripts/check-plugin.mjs` | ✅ | ⬜ pending |
| 06-01 T3 | 06-01 | 1 | D-14 | T-06-03 | every newly guarded path re-runs the guard on both trigger classes | CI config | `npm run check:plugin` | ✅ | ⬜ pending |
| 06-02 T1 | 06-02 | 2 | D-11, SC-1 | T-06-09 | documented convention and enforced convention are the same rule | content | `grep -c '^version' plugin/skills/*/SKILL.md` | ✅ | ⬜ pending |
| 06-02 T2 | 06-02 | 2 | D-02, D-03, D-05, D-10 | T-06-06, T-06-08, T-06-11 | every recovery command transcribed from `setup.sh`, never invented; floor stays `>=` | content | `grep -c -F 'grep -nA20 "## Symptoms and fixes" references/troubleshooting.md' plugin/skills/jarvis-setup/SKILL.md` | ❌ creates `references/troubleshooting.md` | ⬜ pending |
| 06-02 T3 | 06-02 | 2 | D-02, D-03, D-18, SC-1 | T-06-07 | `jarvis-issues` cannot advise filing against a limitation that no longer holds | content | `node scripts/check-manifests.mjs && node scripts/check-plugin.mjs` | ✅ | ⬜ pending |
| 06-03 T1 | 06-03 | 2 | D-07, SC-3 | T-06-12, T-06-13, T-06-14, T-06-16 | exit-0-always, zero-byte silence, no network, no eval of probe output | behaviour (throwaway `sh` harness) | `env PATH=/usr/bin:/bin sh plugin/hooks/jarvis-index-status.sh \| wc -c` | ❌ creates the script | ⬜ pending |
| 06-03 T2 | 06-03 | 2 | D-07, SC-3 | T-06-12 | hooks-schema drift is caught by the vendor validator, proven on a mutated copy | schema | `claude plugin validate ./plugin --strict` | ❌ creates both hook configs | ⬜ pending |
| 06-03 T3 | 06-03 | 2 | D-03, SC-2 | T-06-08 (cross-plan class ref — the prose-pin threat is registered in 06-02; 06-03 has no own row for it), T-06-18 | no cross-client parity claim; floors stay `>=` | content | `grep -c -F 'jarvis-mcp[semantic]>=0.9.1' plugin/README.md` | ✅ | ⬜ pending |
| 06-04 T1 | 06-04 | 2 | D-06, SC-3 | T-06-20 | commands declared in no manifest; CLI fallback takes no interpolated input | structural | `claude plugin validate ./plugin --strict` | ❌ creates both command files | ⬜ pending |
| 06-04 T2 | 06-04 | 2 | D-08, SC-3 | T-06-19, T-06-23 | agent is read-only via `disallowedTools`; no plugin-scope-forbidden key | structural | `grep -c -E '^(hooks\|mcpServers\|permissionMode\|tools\|version):' plugin/agents/jarvis-navigator.md` | ❌ creates the agent | ⬜ pending |
| 06-04 T3 | 06-04 | 2 | D-09 | T-06-21, T-06-22 | declared schema URL resolves; Agent Plugins schema never declared on the Codex overlay | structural + live probe | `curl -o /dev/null -s -w '%{http_code}' -L https://json.schemastore.org/claude-code-plugin-manifest.json` | ✅ | ⬜ pending |
| 06-05 T1 | 06-05 | 2 | D-17 | T-06-SC | package legitimacy vetted by a human before any install lands | blocking-human gate | `curl -o /dev/null -s -w '%{http_code}' -L https://registry.npmjs.org/@anthropic-ai/claude-code/2.1.268` | ✅ | ⬜ pending |
| 06-05 T2 | 06-05 | 2 | D-12, D-17, SC-4 | T-06-25, T-06-26, T-06-27 | exact-pinned vendor CLI; hermetic guards run first; supplement-not-replacement recorded | CI config | `grep -c -F '@anthropic-ai/claude-code@2.1.268' .github/workflows/checks.yml` | ✅ | ⬜ pending |
| 06-06 T1 | 06-06 | 3 | D-12, D-13, SC-4 | T-06-29, T-06-33 | no marketplace `source` can escape the repository | guard (RED via scratch mutation) | `node scripts/check-plugin.mjs` | ✅ | ⬜ pending |
| 06-06 T2 | 06-06 | 3 | D-12, D-13, SC-4 | T-06-30, T-06-34 | plugin-scope security exclusion enforced by name; hand-rolled, not delegated | guard (RED via pre-phase worktree) | `node scripts/check-plugin.mjs \| grep -c -F 'P4'` | ✅ | ⬜ pending |
| 06-06 T3 | 06-06 | 3 | D-10, D-12, D-13, SC-3, SC-4 | T-06-31, T-06-32 | every referenced path resolves; hook script executable | guard (RED via scratch mutation) | `node scripts/check-plugin.mjs` | ✅ | ⬜ pending |
| 06-07 T1 | 06-07 | 4 | D-04, D-15, D-16, SC-5 | T-06-36 | all three manifests move in one commit; policy URLs target the tag they will resolve against | manifest | `node scripts/check-manifests.mjs` | ✅ | ⬜ pending |
| 06-07 T2 | 06-07 | 4 | D-03, D-12, D-13, SC-2, SC-4 | T-06-37 | floor stays a `>=` floor, no extra, pair byte-identical | guard (natural RED from T1 ordering) | `cmp plugin/mcp.json plugin/.mcp.json` | ✅ | ⬜ pending |
| 06-07 T3 | 06-07 | 4 | D-04, D-05, D-12, D-13, SC-4 | T-06-38, T-06-39, T-06-40, T-06-41 | `main` ref permitted in exactly one file; offline skips, never blocks; never wired into PR CI | guard (RED, `--release`-gated) | `node scripts/check-plugin.mjs --release; test $? -eq 1` | ✅ | ⬜ pending |
| 06-08 T1 | 06-08 | 5 | D-15, D-16, SC-5 | T-06-43, T-06-45 | irreversible tag push decided by a human; tag name proven free | blocking-human decision | `git ls-remote --tags origin refs/tags/v0.9.1` | ✅ | ⬜ pending |
| 06-08 T2 | 06-08 | 5 | D-04, D-15, SC-2, SC-5 | T-06-43, T-06-44, T-06-47 | both policy URLs proven 200 at the tag; clean tree, no edits | release gate | `node scripts/check-plugin.mjs --release` | ✅ | ⬜ pending |
| 06-08 T3 | 06-08 | 5 | D-15, SC-3, SC-5 | T-06-46 | every CI-unprovable client behaviour recorded with evidence or a named blocker | Cursor checklist + `<human-check>` harvested at end-of-phase | `node scripts/check-plugin.mjs --release` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Deliverable-class → proof mapping (from research, binds task-level `<verify>` blocks)

| Deliverable class | What proves it | Automated? |
|---|---|---|
| Manifest edit (version bump, `$schema`, Cursor `hooks` field, Codex `longDescription`) | `check-manifests.mjs` dims 1-3 + new P2a + `claude plugin validate ./plugin --strict` exit 0 | Yes, PR-time |
| MCP pin edit (D-03) | P2a floor parse + `check-manifests.mjs:56-63` dual-config byte-identity | Yes, PR-time |
| Tool-count / roster copy (D-01, D-02) | P1 set-equality + forbidden-token scan — naturally red today on `README.md:20`, `.codex-plugin/plugin.json:25`, `jarvis-use/SKILL.md:75-76` | Yes, PR-time |
| SKILL.md frontmatter (D-11) | P4 allowed-key set — naturally red today on `SKILL.md:4` ×3. MUST be hand-rolled: `claude plugin validate --strict` does NOT report unknown frontmatter keys (measured, research C-4) | Yes, PR-time |
| Progressive-disclosure move (D-10) | P5 file-exists on the new `references/troubleshooting.md` + grep that `jarvis-setup/SKILL.md` carries an on-demand retrieval command in the `jarvis-use/SKILL.md:41` style | Yes, PR-time |
| Marketplace validity (D-12c) | P3 + `claude plugin validate . --strict` exit 0 | Yes, PR-time |
| Commands load (D-06) | `claude plugin validate ./plugin --strict` frontmatter parse + P4/P5 — structural only | Partly |
| Hook fires (D-07) | (i) schema: `claude plugin validate ./plugin --strict` emits `hooks.<name>: unknown hook event` + exit 1 on a wrong event name (measured); (ii) script behaviour: throwaway `sh` harness running the hook script with `jarvis` stripped from `PATH`, asserting **exit 0 and zero bytes on stdout**, then with a fake stale-TSV `jarvis`, asserting one JSON object containing `additionalContext` | Partly |
| Agent loads (D-08) | P4 agent-frontmatter key check + `claude plugin validate` — structural only | Partly |
| Guard actually guards (D-13) | Red-before-green: `git worktree add /tmp/pre-fix <pre-phase-commit>`, copy the new script in, run it, capture failing output as plan evidence. The `process.cwd()` seam (`check-manifests.mjs:4-6`) exists for this | Yes, one-time per dimension |
| Tag URLs resolve (D-04) | `curl -o /dev/null -w '%{http_code}' -L <url>` == 200 for both `.codex-plugin/plugin.json:39-40` URLs — **only after the tag is pushed** | Release gate |
| Release synchronization (D-15) | `check-manifests.mjs` green + `git ls-remote --tags origin` contains `v0.9.1` + both URL probes 200 | Release gate |

---

## Wave 0 Requirements

- [ ] `scripts/check-plugin.mjs` — dimensions P1-P5; does not exist yet
- [ ] `.github/workflows/checks.yml` — added `run:` step, pinned `claude` CLI install step, and path-filter additions (`scripts/check-plugin.mjs`, `README.md`, `setup.sh`) in **both** the `push` and `pull_request` blocks
- [ ] `package.json` — `"check:plugin"` alias beside `check:manifests` (`package.json:13`)
- [ ] Red-before-green scratch harness for P3 and P5 (no natural pre-fix failure — needs a deliberate mutation in a git worktree copy)
- [ ] Throwaway hook-script harness (plain `sh`, not committed) proving silence-when-absent

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/jarvis:index` and `/jarvis:status` appear in the client command surface | D-06 / SC-3 | CI can prove frontmatter parses, not that a client renders the command | Real marketplace install in Claude Code (`/` menu) and Cursor (command surface); confirm both entries appear and run |
| SessionStart hook actually injects context into a live session | D-07 / SC-3 | Injection is client runtime behaviour; Cursor publishes no output-field schema for `sessionStart` | Install, open a fresh session in a repo with a stale index, confirm the staleness note appears; repeat in a repo with no index and confirm silence |
| Codex end-to-end behaviour | D-07, deferred Codex split | `codex plugin` has no `validate` subcommand (verified, codex-cli 0.153.4); Codex also skips plugin hooks until the user reviews and trusts them | Live `codex plugin marketplace add`; confirm whether the plugin root resolves to `plugin/` (hook discovered) or repo root (not discovered). Until then the Codex hook is best-effort and must carry a caveat in `plugin/README.md` |
| Any Cursor claim | D-06, D-07, D-09 | No Cursor IDE on this machine (`cursor --version` → no installation) and no Cursor plugin validator CLI exists; submission is manual review | Human on a Cursor machine installs from the marketplace and reports |
| Navigator subagent answer quality | D-08 | Structural load is checkable; multi-hop answer usefulness is human judgement | Ask an architecture question spanning `goToDefinition` → `callHierarchy` → `blastRadius` against an indexed repo |
| `blob/v0.9.1/...` URLs in the merge→tag window | D-04 | By construction they 404 until the tag is pushed | Only the post-push probe is meaningful; do not treat the window as a failure |
| `openai.yaml` `interface:` nesting is a real OpenAI shape | D-08 / research open question 6 | OpenAI documents `dependencies.tools` but never the `interface.display_name` / `short_description` / `default_prompt` block these files ship; no schema and no validator are published, so neither CI nor a local run can decide it | Record as outstanding with that blocker unless a live OpenAI skills install answers it. The stubs ship unchanged per D-08 and no P-dimension reads them; YAML parsing is not evidence of validity |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
