---
phase: 02-docs-rebuild-tutorial-first-content
reviewed: 2026-08-22T16:30:00Z
depth: deep
files_reviewed: 45
files_reviewed_list:
  - astro.config.mjs
  - design/url-contract.json
  - public/brand-logo.html
  - public/fonts/geist-latin-wght-normal.woff2
  - public/fonts/geist-mono-latin-wght-normal.woff2
  - public/fonts/rajdhani-latin-600-normal.woff2
  - public/fonts/rajdhani-latin-700-normal.woff2
  - public/llms.txt
  - scripts/verify-build.mjs
  - src/content/docs/404.md
  - src/content/docs/docs/changelog.md
  - src/content/docs/docs/cli/forget.md
  - src/content/docs/docs/cli/index-cmd.md
  - src/content/docs/docs/cli/index.md
  - src/content/docs/docs/cli/jarvis-server.md
  - src/content/docs/docs/cli/list.md
  - src/content/docs/docs/cli/reindex.md
  - src/content/docs/docs/cli/status.md
  - src/content/docs/docs/cli/watch.md
  - src/content/docs/docs/concepts/architecture.md
  - src/content/docs/docs/concepts/blast-radius.md
  - src/content/docs/docs/concepts/scip.md
  - src/content/docs/docs/concepts/semantic-search.md
  - src/content/docs/docs/concepts/zoekt.md
  - src/content/docs/docs/guide/install-matrix.mdx
  - src/content/docs/docs/guide/install.md
  - src/content/docs/docs/guide/requirements.md
  - src/content/docs/docs/index.md
  - src/content/docs/docs/integrations/claude-code.md
  - src/content/docs/docs/integrations/codex-cli.md
  - src/content/docs/docs/integrations/cursor.md
  - src/content/docs/docs/integrations/generic-stdio.md
  - src/content/docs/docs/integrations/index.md
  - src/content/docs/docs/quickstart.mdx
  - src/content/docs/docs/tools/blast-radius.md
  - src/content/docs/docs/tools/call-hierarchy.md
  - src/content/docs/docs/tools/document-symbols.md
  - src/content/docs/docs/tools/find-references.md
  - src/content/docs/docs/tools/get-index-status.md
  - src/content/docs/docs/tools/go-to-definition.md
  - src/content/docs/docs/tools/index.md
  - src/content/docs/docs/tools/search-code.md
  - src/content/docs/docs/tools/semantic-search.md
  - src/content/docs/docs/tools/type-hierarchy.md
  - src/content/docs/docs/troubleshooting/common-failures.md
  - src/content/docs/docs/troubleshooting/index.md
  - src/content/docs/docs/troubleshooting/upstream-issues.md
findings:
  critical: 2
  warning: 4
  info: 2
  total: 8
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-08-22T16:30:00Z
**Depth:** deep
**Files Reviewed:** 45
**Status:** issues_found

## Summary

This is a docs-content phase (Astro + Starlight), so the review focused on factual/behavioral
correctness of copy-pasteable commands, internal-link/anchor integrity, URL-contract consistency,
and the correctness of `scripts/verify-build.mjs`'s own assertion logic — rather than generic app
security concerns that don't apply to static Markdown.

Verification method: the site was actually built (`npx astro build`), `scripts/verify-build.mjs`
was run against the real `dist/`, and a from-scratch link/anchor resolver was written and run
against every built HTML file to cross-check the shipped script's own claims. All build artifacts
were deleted afterward; no source files were modified.

Two BLOCKER-tier defects were found and are proven, not speculative:

1. `scripts/verify-build.mjs`'s V3 dimension — which its own comments say exists specifically to
   catch a missing-`/jarvis-index`-prefix link (the "01-01 live asset-404 bug" class) — cannot
   actually catch that bug class. A reproduction (injecting exactly that defect into a real build)
   passed the check with exit code 0.
2. `docs/cli/jarvis-server.md`'s copy-pasteable `sh` command drops the `jarvis-mcp` version floor
   silently and writes a stray file into the user's CWD, because `>=` is unquoted in a raw shell
   command. Reproduced by executing the literal documented command.

One real broken anchor link was found and confirmed against the actual built HTML
(`id="typehierarchy-empty-on-upstream-scip-v090"` vs. the linked
`#typehierarchy-empty-on-upstream-scip`). All other internal links/anchors across the entire built
site (40 HTML files) were verified to resolve correctly via a full-site link/anchor sweep — this
is not a systemic problem, just this one entry.

## Critical Issues

### CR-01: verify-build.mjs's V3 dimension cannot detect the missing-BASE-prefix bug it exists to catch

**File:** `scripts/verify-build.mjs:130-148`
**Issue:**

V3's stated purpose (per the script's own header comment, lines 9-11, and `astro.config.mjs`'s
matching comment at lines 138-144) is to catch a link that is missing the `/jarvis-index` base
prefix — the exact class of bug that caused the "01-01 live asset-404" incident referenced in the
header. The fallback branch that is supposed to catch this:

```js
} else if (ref.startsWith('/')) {
  // Absolute but missing the base prefix — the exact origin-prefix bug
  // class this dimension exists to catch (RESEARCH Pattern 1).
  fromDistRoot = ref
} else {
```

sets `fromDistRoot` to the *unstripped* absolute path and then resolves it against `distDir`
directly. But Astro's `base` config is a pure URL-serving artifact — it is **not** reflected in
the physical `dist/` directory layout (confirmed: `dist/_astro/…`, `dist/assets/…`, etc. sit at
`dist` root, there is no `dist/jarvis-index/` subtree). So for virtually any real internal asset,
a reference that is *missing* the `/jarvis-index` prefix resolves against `dist/` to the exact
same file a *correctly prefixed* reference would — the check can never distinguish the two cases,
and therefore can never fail on this defect class for any file that actually exists in the build
(which is the case that matters: a link to a nonexistent path was already going to be caught by
plain 404-checking either way).

Reproduced directly: after a real `npx astro build`, injecting
`<a href="/favicon.svg">test</a>` into `dist/index.html` (a link missing the `/jarvis-index`
prefix, pointing at a real file) and re-running the script still printed
`ok: … V3 (landing+docs-home assets) … all green` with exit code `0`. This is precisely the "the
pre-deploy twin of the 01-01 live asset-404 bug" the script's header claims to guard against, and
it does not fire.

**Fix:** In the missing-prefix branch, the check needs to assert failure (or at minimum warn)
rather than silently attempt file resolution, since a real file will almost always exist at that
path in `dist/` regardless of whether the reference is correct for the deployed URL. A minimal
fix: treat any `ref.startsWith('/')` that is not `BASE`-prefixed as a hard V3 failure outright
(mirroring what the comment already claims the code does), e.g.:

```js
} else if (ref.startsWith('/')) {
  fail('V3', `absolute reference missing "${BASE}" prefix: "${rawRef}" in ${relative(distDir, htmlPath)}`)
  continue
} else {
```

## CR-02: `jarvis-server.md`'s documented command drops the version floor and pollutes the CWD

**File:** `src/content/docs/docs/cli/jarvis-server.md:24-26`
**Issue:**

```sh
uvx --from jarvis-mcp>=0.6.0 jarvis-server
```

This is a raw shell command (inside a ` ```sh ` fence), and `>` is the shell output-redirection
operator. Unquoted, `jarvis-mcp>=0.6.0` is parsed by the shell as: run `jarvis-mcp` (which does
not exist) with stdout redirected to a file literally named `=0.6.0`, and the `--from` flag then
receives no version constraint at all — `uvx --from jarvis-mcp jarvis-server` runs instead.

Reproduced by executing the exact documented line in a real shell:
```
+ uvx --from jarvis-mcp jarvis-server
```
and a stray file named `=0.6.0` was created in the current directory. The version floor required
by this repo's own `CLAUDE.md` (`--from jarvis-mcp>=0.6.0` must remain a valid `>=` floor) is
silently dropped for anyone who copies this exact command, and the shell litters their working
directory with a junk file. Every *other* place in the docs that carries this same version string
puts it inside a quoted JSON string (`"jarvis-mcp>=0.6.0"`) — this is the only occurrence rendered
as an unquoted, unquoted-shell-operator-bearing token in a runnable shell command.

**Fix:** quote the version constraint, matching the pattern used everywhere else in the docs:

```sh
uvx --from "jarvis-mcp>=0.6.0" jarvis-server
```

## Warnings

### WR-01: Broken anchor link to `typeHierarchy` entry in Upstream Issues

**File:** `src/content/docs/docs/troubleshooting/index.md:35`
**Issue:** Links to
`/troubleshooting/upstream-issues/#typehierarchy-empty-on-upstream-scip`, but the actual heading
in `upstream-issues.md:11` is `## typeHierarchy empty on upstream scip v0.9.0`, which
Starlight's heading-slug generator renders as `typehierarchy-empty-on-upstream-scip-v090`
(confirmed against the real built `dist/docs/troubleshooting/upstream-issues/index.html`, which
contains `id="typehierarchy-empty-on-upstream-scip-v090"`, not the id the link targets). Clicking
this link lands at the top of the Upstream Issues page instead of the intended entry. Verified via
a full-site anchor sweep of all 40 built HTML pages — this is the only broken anchor found
anywhere in the built site.
**Fix:** append the missing suffix:
```md
See [Upstream Issues: typeHierarchy](/troubleshooting/upstream-issues/#typehierarchy-empty-on-upstream-scip-v090).
```

### WR-02: Inconsistent `kind` value casing in `documentSymbols` example response

**File:** `src/content/docs/docs/tools/document-symbols.md:63,69,75,81`
**Issue:** The single example JSON response uses `"kind": "TYPE"`, `"kind": "METHOD"`,
`"kind": "TERM"` (all upper-case, matching the convention used consistently in
`call-hierarchy.md:68`, `find-references.md:108-109`, and `go-to-definition.md:80-81`), but the
fourth entry in the *same* response uses `"kind": "Method"` (mixed case) at line 81. Within one
JSON example this reads as a real value the client should expect to see vary — which, per this
same page's own text ("`displayName`/`kind` are the human-readable name and kind for the same
symbol"), an agent parsing this schema could reasonably build a case-sensitive check against and
be broken by the inconsistency.
**Fix:** change line 81 to `"kind": "METHOD"` to match the other three entries in the same
response and the convention used by every other tool page.

### WR-03: `typeHierarchy`'s nested `symbol.kind` example diverges from the sibling hierarchy tool's casing

**File:** `src/content/docs/docs/tools/type-hierarchy.md:61`
**Issue:** `callHierarchy`'s example (`call-hierarchy.md:68`) uses `"kind": "METHOD"` for the
identical `{"symbol": {"symbol", "displayName", "kind"}, "location": {...}}` shape, but
`typeHierarchy`'s example uses `"kind": "Interface"` (mixed case) for the same field. Combined
with WR-02, this suggests a typo/inconsistency in the docs rather than a genuine schema
difference (both are the same `symbol.kind` field, on sibling single-level-hierarchy tools).
**Fix:** align to `"kind": "TYPE"` or `"INTERFACE"` per the upper-case convention established
elsewhere, or explicitly document that `kind` casing is not guaranteed if that reflects real
upstream (SCIP indexer) behavior.

### WR-04: `astro.config.mjs`'s link-rebase plugin has no guard against links that already carry a scope prefix

**File:** `astro.config.mjs:18-30`
**Issue:** `rebaseDocsLinks()` unconditionally rewrites any `href` that starts with a single `/`
(and not `//`) by prepending `${BASE}/docs`. Today every root-relative link in the content set
is a bare, unprefixed path (e.g. `/quickstart/`), so this happens to be correct for the current
content — confirmed no content currently links to `/` (the site root) or to an
already-`/docs/`-prefixed path. But the function has no way to distinguish "this needs the docs
prefix" from "this is already fully scoped" or "this intentionally targets the site root" — a
future link to the landing page (`/`) would silently become `${BASE}/docs/` instead, and a future
link that already includes `/docs/...` would silently double-prefix to
`${BASE}/docs/docs/...`. Neither case is guarded against, tested, or caught by
`scripts/verify-build.mjs` (V3 only scans two pages; see also CR-01, which shows even that check
can't reliably catch a wrong-prefix reference against an existing dist file).
**Fix:** at minimum, skip the rewrite when `href` already starts with `${BASE}` or equals `/`,
e.g.:
```js
if (href.startsWith('/') && !href.startsWith('//') && href !== '/' && !href.startsWith(BASE)) {
  node.properties.href = rebased + href
}
```

## Info

### IN-01: `cli/index-cmd.md` and `cli/status.md` break the docs-wide fixed-example-date convention

**File:** `src/content/docs/docs/cli/index-cmd.md:78`, `src/content/docs/docs/cli/status.md:30`
**Issue:** Every other example timestamp across the docs (tool reference pages, quickstart) uses
the fixed fixture date `2026-07-08T12:00:00+00:00` / `2026-07-08T12:00:05+00:00`. These two CLI
pages instead use `2026-08-22T10:00:00+00:00`, which happens to match the day this phase was
authored/reviewed. This is cosmetic, but it breaks the otherwise-consistent "fixed fixture date"
convention used everywhere else and could look like a template placeholder that was never
substituted.
**Fix:** use the same `2026-07-08` fixture date as the rest of the docs for consistency, unless
this specific example is intentionally meant to look "live."

### IN-02: `verify-build.mjs`'s V9 sitemap prefix check is looser than the V3 asset check

**File:** `scripts/verify-build.mjs:197`
**Issue:** V3's asset-resolution matches `ref.startsWith(BASE + '/') || ref === BASE` before
treating a reference as base-prefixed, but V9's sitemap check uses the looser
`path.startsWith(BASE)` (no `/` boundary check), which would also match a hypothetical sibling
path like `/jarvis-indexfoo` as if it were base-prefixed. Not exploitable today (sitemap entries
are only ever generated from real site URLs), but it's an inconsistent guard between two
dimensions checking conceptually the same thing in the same file.
**Fix:** align V9 to the same `path === BASE || path.startsWith(BASE + '/')` boundary check V3
already uses.

---

_Reviewed: 2026-08-22T16:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
