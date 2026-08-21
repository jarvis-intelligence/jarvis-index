---
schema_version: 1
open_count: 3
waived_count: 0
fixed_count: 1
total_count: 4
last_updated: 2026-08-21T11:42:28.363Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | unrun-verify | src/pages/index.astro |  | V6 theme persistence check (toggle on /, reload, navigate to /docs/, toggle, navigate back, reload both) not performed - no browser tool available in execution session | open |  | 2026-08-21T11:22:17.653Z |  |
| 2 | 01 | unrun-verify | src/content/docs/docs/index.md |  | V5 interactive half (type a live search query, confirm multi-page hits, click through) not performed - no browser tool available in execution session | open |  | 2026-08-21T11:22:17.760Z |  |
| 3 | 01 | deviation | scripts/verify-build.mjs |  | 01-05 permanent pagefind-presence assertion must check the build root pagefind output directory (base-relative), not a docs-subpath-nested location - this project's Starlight mount nests docs under a subpath but Pagefind output emits at the Astro base root | fixed |  | 2026-08-21T11:22:17.863Z | 2026-08-21T11:42:21.597Z |
| 4 | 01 | deviation | public/brand-logo.html |  | scripts/verify-build.mjs V4 (font-origin) excludes dist/brand-logo.html — the legacy public/ passthrough page still uses the Google Fonts CDN (SITE-04 zero-third-party-fonts violation), preserved verbatim pending Phase 2 DOCS-09 keep/retire classification | open |  | 2026-08-21T11:42:28.363Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "src/pages/index.astro",
    "line": null,
    "description": "V6 theme persistence check (toggle on /, reload, navigate to /docs/, toggle, navigate back, reload both) not performed - no browser tool available in execution session",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-21T11:22:17.653Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "src/content/docs/docs/index.md",
    "line": null,
    "description": "V5 interactive half (type a live search query, confirm multi-page hits, click through) not performed - no browser tool available in execution session",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-21T11:22:17.760Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "01",
    "file": "scripts/verify-build.mjs",
    "line": null,
    "description": "01-05 permanent pagefind-presence assertion must check the build root pagefind output directory (base-relative), not a docs-subpath-nested location - this project's Starlight mount nests docs under a subpath but Pagefind output emits at the Astro base root",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-21T11:22:17.863Z",
    "resolved_at": "2026-08-21T11:42:21.597Z"
  },
  {
    "id": 4,
    "kind": "deviation",
    "phase": "01",
    "file": "public/brand-logo.html",
    "line": null,
    "description": "scripts/verify-build.mjs V4 (font-origin) excludes dist/brand-logo.html — the legacy public/ passthrough page still uses the Google Fonts CDN (SITE-04 zero-third-party-fonts violation), preserved verbatim pending Phase 2 DOCS-09 keep/retire classification",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-21T11:42:28.363Z",
    "resolved_at": null
  }
]
````
