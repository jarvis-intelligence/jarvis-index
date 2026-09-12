#!/usr/bin/env node
// Plugin surface invariants, zero-dependency ESM.
//
// Dimensions:
//   P1 — shipped surfaces agree on the jarvis MCP tool roster. This derives the
//        roster from this repository and cannot see ../jarvis, which is not
//        available in CI: it cannot detect the server registering an eleventh
//        tool. Maintainers must re-read ../jarvis/src/jarvis/server.py when the
//        server changes; P1 is not a server diff.
//   P2a — manifest versions and MCP package floors agree before release.
//   P2b — release-pinned URLs reference the matching published git tag.
//   P3 — marketplace manifests parse and reference paths inside this checkout.
//   P4 — skill, command, and agent frontmatter uses only allowed keys.
//   P5 — manifest-referenced components and hook executables exist.
//
// All subject paths resolve against process.cwd() (not import.meta.url) — this
// is the testability seam that lets this script run unmodified against a
// scratch copy of the repo by changing the working directory before invoking it.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROSTER_PATH = 'plugin/skills/jarvis-use/references/tool-roster.md'
const SURFACE_PATHS = ['plugin/README.md', 'README.md']
const SNAKE_CASE_PATHS = [
  'plugin/skills/jarvis-setup/SKILL.md',
  'plugin/skills/jarvis-use/SKILL.md',
  'plugin/skills/jarvis-issues/SKILL.md',
  ROSTER_PATH,
]

let failed = false

function fail(dimension, detail) {
  console.error(`${dimension}: ${detail}`)
  failed = true
}

function readText(relPath) {
  try {
    return readFileSync(resolve(process.cwd(), relPath), 'utf8')
  } catch (err) {
    fail('P1', `${relPath}: could not read file (${err.message})`)
    return null
  }
}

function containsCountMismatch(text) {
  return !/\bten\b/i.test(text) || /\bnine\b/i.test(text)
}

function snakeCase(name) {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

// ─────────────────────────────────────────────────────────────────────────
// P1 — tool roster agreement
// ─────────────────────────────────────────────────────────────────────────
const rosterText = readText(ROSTER_PATH)
const tools = new Set()

if (rosterText !== null) {
  for (const match of rosterText.matchAll(/^### ([A-Za-z][A-Za-z0-9]*)\(/gm)) {
    tools.add(match[1])
  }
  if (tools.size !== 10) {
    fail('P1', `${ROSTER_PATH}: parsed ${tools.size} tool headings; expected 10`)
  }
}

for (const relPath of SURFACE_PATHS) {
  const text = readText(relPath)
  if (text === null) continue

  if (containsCountMismatch(text)) {
    fail('P1', `${relPath}: tool count must say ten and must not say nine`)
  }
  for (const tool of tools) {
    if (!text.includes(tool)) {
      fail('P1', `${relPath}: missing roster tool ${tool}`)
    }
  }
}

const codexManifestPath = '.codex-plugin/plugin.json'
const codexManifestText = readText(codexManifestPath)
if (codexManifestText !== null) {
  try {
    const codexManifest = JSON.parse(codexManifestText)
    const longDescription = codexManifest.interface?.longDescription
    if (typeof longDescription !== 'string') {
      fail('P1', `${codexManifestPath}: interface.longDescription must be a string`)
    } else if (/\bnine\b/i.test(longDescription)) {
      fail('P1', `${codexManifestPath}: interface.longDescription contains stale count word nine`)
    }
  } catch (err) {
    fail('P1', `${codexManifestPath}: JSON parse error — ${err.message}`)
  }
}

const forbiddenTokens = [...tools].map(snakeCase)
for (const relPath of SNAKE_CASE_PATHS) {
  const text = readText(relPath)
  if (text === null) continue

  for (const token of forbiddenTokens) {
    if (new RegExp(`\\b${token}\\b`).test(text)) {
      fail('P1', `${relPath}: contains snake_case tool name ${token}`)
    }
  }
}

if (failed) {
  process.exit(1)
}

console.log(`ok: P1 (${tools.size} roster tools agree across shipped surfaces) green`)
