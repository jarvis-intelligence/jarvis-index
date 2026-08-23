#!/usr/bin/env node
// SITE-07: three plugin-manifest invariants, zero-dependency ESM.
//
// All subject paths resolve against process.cwd() (not import.meta.url) — this
// is the testability seam that lets this script run unmodified against a
// scratch copy of the repo by changing the working directory before invoking it.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const MANIFEST_PATHS = [
  'plugin/.claude-plugin/plugin.json',
  'plugin/.cursor-plugin/plugin.json',
  '.codex-plugin/plugin.json',
]

const MCP_CONFIG_PATHS = ['plugin/.mcp.json', 'plugin/mcp.json']

let failed = false

function fail(message) {
  console.error(message)
  failed = true
}

// 1. Every manifest must parse as JSON.
const parsed = []
for (const relPath of MANIFEST_PATHS) {
  const absPath = resolve(process.cwd(), relPath)
  let raw
  try {
    raw = readFileSync(absPath, 'utf8')
  } catch (err) {
    fail(`${relPath}: could not read file (${err.message})`)
    continue
  }
  try {
    parsed.push({ path: relPath, data: JSON.parse(raw) })
  } catch (err) {
    fail(`${relPath}: JSON parse error — ${err.message}`)
  }
}

// 2. All three manifests must declare the same version.
if (parsed.length === MANIFEST_PATHS.length) {
  const versions = parsed.map((m) => m.data.version)
  const allMatch = versions.every((v) => v === versions[0])
  if (!allMatch) {
    fail('version mismatch across plugin manifests:')
    for (const m of parsed) {
      fail(`  ${m.path}: version = ${JSON.stringify(m.data.version)}`)
    }
  }
}

// 3. The two MCP config files must be byte-identical.
try {
  const [a, b] = MCP_CONFIG_PATHS.map((relPath) => readFileSync(resolve(process.cwd(), relPath)))
  if (!a.equals(b)) {
    fail(`${MCP_CONFIG_PATHS[0]} and ${MCP_CONFIG_PATHS[1]} differ — MCP registration must be byte-identical`)
  }
} catch (err) {
  fail(`could not compare ${MCP_CONFIG_PATHS.join(' / ')}: ${err.message}`)
}

if (failed) {
  process.exit(1)
}

console.log(`ok: ${MANIFEST_PATHS.length} manifests agree on version, MCP config pair byte-identical`)
