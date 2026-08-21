# Phase 2: Docs Rebuild — Tutorial-First Content - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-21
**Phase:** 2-Docs Rebuild — Tutorial-First Content
**Areas discussed:** Page classification & brand-logo.html, Reference content depth & voice, Install-channel primacy, Troubleshooting scope & sourcing

---

## Page classification & brand-logo.html

| Option | Description | Selected |
|--------|-------------|----------|
| Keep, fix fonts | Keep as public URL, self-host its fonts so zero-third-party-fonts holds site-wide | ✓ |
| Retire with redirect | Drop from public surface, redirect old visitors | |
| Fold into docs | Move content into Starlight tree as /docs/brand/ | |

**User's choice:** Keep, fix fonts

| Option | Description | Selected |
|--------|-------------|----------|
| Keep all, deepen in place | Current IA sound; every page stays at its URL, gets real depth | ✓ |
| Reorganize IA now | Restructure nav groupings while deepening — more redirect churn | |

**User's choice:** Keep all, deepen in place

| Option | Description | Selected |
|--------|-------------|----------|
| No, nothing specific | Classification pass double-checks and flags redundancies for confirmation | ✓ |
| Yes, I have one in mind | Name a specific page to merge/retire | |

**User's choice:** No, nothing specific

| Option | Description | Selected |
|--------|-------------|----------|
| Lookup table + nav | Retired/renamed URL → new location table + docs nav link | ✓ |
| Plain generic 404 | Starlight default 404 as-is | |

**User's choice:** Lookup table + nav

---

## Reference content depth & voice

| Option | Description | Selected |
|--------|-------------|----------|
| Real transcripts from private repo | Actual request/response pairs from ../jarvis/ tests/README | ✓ |
| Illustrative examples | Hand-written plausible examples | |

**User's choice:** Real transcripts from private repo

| Option | Description | Selected |
|--------|-------------|----------|
| Terse reference | Signature, params table, one example, done | ✓ |
| Narrated | Prose explaining when/why before reference details | |

**User's choice:** Terse reference

| Option | Description | Selected |
|--------|-------------|----------|
| Quickstart only | DOCS-10 names quickstart; tool pages' error contract IS their shape | ✓ |
| Extend to tool pages too | Explicit worked/didn't-work callouts on all 9 pages | |

**User's choice:** Quickstart only

| Option | Description | Selected |
|--------|-------------|----------|
| Prominent caveat box | Top-of-page callout for [semantic] extra + second server | ✓ |
| Inline mention only | Note in prose within normal reference flow | |

**User's choice:** Prominent caveat box

---

## Install-channel primacy

| Option | Description | Selected |
|--------|-------------|----------|
| setup.sh curl | Client-agnostic, matches current quickstart/landing CTA | ✓ |
| Claude plugin install | Lead with likely-largest audience segment | |

**User's choice:** setup.sh curl

| Option | Description | Selected |
|--------|-------------|----------|
| Separate matrix page | Quickstart stays single linear path per DOCS-01 | ✓ |
| Inline in quickstart | Matrix before install step — choice up front | |

**User's choice:** Separate matrix page

| Option | Description | Selected |
|--------|-------------|----------|
| On the install matrix page | Registry is one of the four channels the matrix names | ✓ |
| Its own page | Dedicated page for the cross-client mechanism | |

**User's choice:** On the install matrix page

| Option | Description | Selected |
|--------|-------------|----------|
| Full standalone page | Equal footing with the three named clients per DOCS-02 | ✓ |
| Compact appendix | Fold into matrix page as a snippet | |

**User's choice:** Full standalone page

---

## Troubleshooting scope & sourcing

| Option | Description | Selected |
|--------|-------------|----------|
| Private repo's issue history | Mine ../jarvis/ issues for real recurring failures | ✓ |
| Named modes only | Exactly the three in DOCS-07 | |

**User's choice:** Private repo's issue history

| Option | Description | Selected |
|--------|-------------|----------|
| Keep two-page split | Common Failures (fixable) vs Upstream Issues (limitations) | ✓ |
| Single decision-tree page | Merge into one symptom-first tree | |

**User's choice:** Keep two-page split

| Option | Description | Selected |
|--------|-------------|----------|
| New page, linked before install | Dedicated Requirements & Limits page; quickstart links pre-install | ✓ |
| Inline block in quickstart | Condensed block in quickstart before install command | |

**User's choice:** New page, linked before install

| Option | Description | Selected |
|--------|-------------|----------|
| Full changelog verbatim | Mirror ../jarvis/CHANGELOG.md as-is | ✓ |
| Curated/trimmed | Public-relevant entries only | |

**User's choice:** Full changelog verbatim

---

## Claude's Discretion

- Exact sidebar/nav placement of new pages (install matrix, requirements & limits) within Starlight groups
- Per-case redirect mechanism choice (Astro redirects map vs content stubs) for any 02-01-flagged retires
- llms.txt format/generation approach — only the after-stabilization sequencing is locked

## Deferred Ideas

None — discussion stayed within phase scope.
