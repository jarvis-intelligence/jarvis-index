# jarvis setup troubleshooting

Symptoms and fixes for common installer, MCP connection, optional-enrichment, and index-status problems.

## Symptoms and fixes

| Symptom | Fix |
|---|---|
| `command not found: jarvis` | Install the Homebrew binary with `brew install jarvis-intelligence/jarvis/jarvis`, run `hash -r`, then verify `jarvis --version` prints `jarvis 0.11.0`. If an old `~/.local/bin/jarvis` remains, remove the obsolete uv tool with `uv tool uninstall jarvis-mcp` and open a new shell. |
| `MCP server ... connection timed out after 30000ms` on the very first connect | Verify `command -v jarvis-server` resolves under the active Homebrew prefix and `jarvis-server` is executable. Reconnect from the MCP client. The plugin launches the Homebrew binary directly and has no package cache to warm. |
| `command not found: scip` / `zoekt-git-index` | These tools are normally embedded in the Homebrew keg and do not need to be on `PATH`; use `jarvis status <slug>` instead of probing PATH. For optional language-specific enrichment, install the applicable `scip-*` toolchain with the setup-skill `--only` command. |
| Zoekt `sym:` queries return nothing | `universal-ctags` is a Homebrew formula dependency. Run `brew list --versions universal-ctags`; if absent, run `brew install jarvis-intelligence/jarvis/jarvis` again. Reindex the affected slug after installing or changing ctags. |
| `findReferences`, `callHierarchy`, or `typeHierarchy` returns `requiredCapability` | Those tools are SCIP-only; a syntax baseline intentionally never invents reference or hierarchy edges. Run `getIndexStatus` and inspect `capabilities.tools`, then install/fix the applicable SCIP tooling and run `jarvis reindex <slug> --scip`. |
| `typeHierarchy` errors after SCIP enrichment | Verify `jarvis --version` is `0.11.0`; Homebrew bundles the patched `scip` needed for relationships. If an older `scip` earlier on `PATH` shadows it, remove or reorder that PATH entry, then run `jarvis reindex <slug> --scip`. |
| Swift: "multiple schemes" / wrong build | Pass `--scheme <name>` on the first `jarvis index`. It is stored in the registry and reused by `reindex`/`watch`. |
| `status: degraded` | The snapshot published (syntax baseline + search) but the SCIP stage failed, is missing, or is disabled. `jarvis status <slug>` prints `scipState`, the `cause`, and a `recovery` line — fix the cause, then run `jarvis reindex <slug> --scip`. Declaration navigation and search already work in the meantime. |
| `status: failed` | Re-run `jarvis index <slug>` and read stderr; the atomic-publish guarantee means the previous good index (if any) is still live. |
