---
name: status
description: Report whether this repository is indexed, fresh, and which jarvis tools are available.
argument-hint: "[slug]"
disable-model-invocation: true
---

Part of the jarvis toolkit. Siblings: `jarvis-setup` (onboard), `jarvis-use` (everyday queries), `jarvis-issues` (report bugs).

Call `getIndexStatus` with `repo` set to the requested slug and `repo_path` set to the repository's local Git working directory. Passing `repo_path` is what enables the staleness comparison against `git rev-parse HEAD`.

Report `status`, the freshness fields, and every entry in `capabilities.tools`, including its availability, providers, reason, and recovery for unavailable capabilities. If the MCP server is not connected, run `jarvis status <slug>` instead.
