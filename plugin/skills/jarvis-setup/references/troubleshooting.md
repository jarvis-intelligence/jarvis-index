# jarvis setup troubleshooting

Symptoms and fixes for common installer, MCP connection, optional-enrichment, and index-status problems.

## Symptoms and fixes

| Symptom | Fix |
|---|---|
| `command not found: jarvis` | The plugin runs the MCP *server* via `uvx` without installing the CLI, so all 10 tools can work while `jarvis` itself is absent. Fix: `uv tool install jarvis-mcp` (what step 2's setup.sh already runs by default) — or skip installing and run one-off commands as `uvx --from "jarvis-mcp>=0.9.1" --python ">=3.12" jarvis index /path/to/repo`. |
| `MCP server ... connection timed out after 30000ms` on the very first connect | The plugin's registration launches the server with `uvx`, which on a cold cache resolves and builds the dependency tree before the server can answer. setup.sh's default run pre-warms this cache automatically, so this should only surface if you skipped setup.sh, used `--only` for a single native binary, or ran an older setup.sh. Fix: run `uv tool install jarvis-mcp` once, then reconnect (`/mcp` → jarvis). |
| `command not found: scip` / `zoekt-git-index` | `~/.jarvis/bin` is not on `PATH`. Open a new shell, or `source ~/.zshrc` (or `~/.bashrc`). Still missing after that? Re-run `setup.sh --only zoekt --force` — the flag value is `zoekt` (not `zoekt-git-index`); it installs both `zoekt-git-index` and `zoekt-webserver` from the same tarball. Syntax-only declaration navigation does not require these binaries. |
| Zoekt `sym:` queries return nothing | Zoekt auto-discovers `universal-ctags` on `PATH` (or `$CTAGS_COMMAND`) at index time; without it, only `sym:` degrades and setup.sh warns rather than fails. Run `sh setup.sh --only ctags` — the flag value is `ctags`, not `universal-ctags`. Zoekt looks up the literal `universal-ctags` binary name, so a bare `ctags` on `PATH` is invisible; setup.sh symlinks it. A shard indexed before install stays symbol-less until `jarvis reindex <slug>`. |
| `findReferences`, `callHierarchy`, or `typeHierarchy` returns `requiredCapability` | Those tools are SCIP-only; a syntax baseline intentionally never invents reference or hierarchy edges. Run `getIndexStatus` and inspect `capabilities.tools`, then install/fix the applicable SCIP tooling and run `jarvis reindex <slug> --scip`. |
| `typeHierarchy` errors after SCIP enrichment | Re-run setup.sh — the scip install is version-gated and replaces a non-matching binary automatically (heed its warning if an older `scip` earlier on `PATH` shadows the new one) — then `jarvis reindex <slug> --scip`. |
| Swift: "multiple schemes" / wrong build | Pass `--scheme <name>` on the first `jarvis index`. It is stored in the registry and reused by `reindex`/`watch`. |
| `status: degraded` | The snapshot published (syntax baseline + search) but the SCIP stage failed, is missing, or is disabled. `jarvis status <slug>` prints `scipState`, the `cause`, and a `recovery` line — fix the cause, then run `jarvis reindex <slug> --scip`. Declaration navigation and search already work in the meantime. |
| `status: failed` | Re-run `jarvis index <slug>` and read stderr; the atomic-publish guarantee means the previous good index (if any) is still live. |
