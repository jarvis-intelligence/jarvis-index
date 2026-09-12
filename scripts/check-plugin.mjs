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
//   P3 — both marketplace.json files parse and stay inside this checkout:
//        lowercase kebab-case name, owner.name, and a non-empty plugins array
//        whose entries match the plugin.json their source resolves to and
//        declare no component fields. Claude Code also rejects a marketplace
//        whose name collides with a reserved name; that list is re-checked by
//        the client on every load and is not enumerated here — P3 asserts
//        shape and resolution, not name availability.
//   P4 — skill, command, and agent frontmatter uses only its allowed key set.
//        Hand-rolled and must stay: `claude plugin validate --strict` was
//        measured NOT to report unknown frontmatter keys in skills, commands,
//        or agents (research C-4), so no vendor guard covers this — do not
//        delete P4 believing the validator has it handled. For agents,
//        `hooks`, `mcpServers`, and `permissionMode` fail by name:
//        unsupported in plugin scope for security reasons, and Claude Code
//        would otherwise load the agent anyway via silent filename fallback.
//   P5 — every path a manifest, hook config, or skill retrieval command
//        references resolves to a real file or directory: plugin-root-
//        relative fields resolve against plugin/, repository-root-relative
//        Codex fields against the checkout root. Hook scripts keep an
//        execute bit — without one, hooks silently do not fire — and
//        component markdown is never empty.
//
// All subject paths resolve against process.cwd(), never against this file's
// own location — this is the testability seam that lets this script run
// unmodified against a scratch copy of the repo by changing the working
// directory before invoking it.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, normalize, resolve } from 'node:path'

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

// ─────────────────────────────────────────────────────────────────────────
// P3 — marketplace manifests
// ─────────────────────────────────────────────────────────────────────────
const MARKETPLACES = [
  // Each marketplace pairs with the client manifest that its plugins[].source
  // entries must resolve to and match by name.
  { path: '.claude-plugin/marketplace.json', clientManifest: '.claude-plugin/plugin.json' },
  { path: '.cursor-plugin/marketplace.json', clientManifest: '.cursor-plugin/plugin.json' },
]
const MARKETPLACE_COMPONENT_KEYS = ['skills', 'commands', 'agents', 'hooks', 'mcpServers']
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

for (const marketplace of MARKETPLACES) {
  let raw
  try {
    raw = readFileSync(resolve(process.cwd(), marketplace.path), 'utf8')
  } catch (err) {
    fail('P3', `${marketplace.path}: could not read file (${err.message})`)
    continue
  }
  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    fail('P3', `${marketplace.path}: JSON parse error — ${err.message}`)
    continue
  }

  // Read by key, never by position: the two marketplace files order their
  // fields differently (owner precedes metadata in the Cursor one).
  if (typeof data.name !== 'string' || !KEBAB_CASE.test(data.name)) {
    fail('P3', `${marketplace.path}: name must be a lowercase kebab-case string, got ${JSON.stringify(data.name ?? null)}`)
  }

  const ownerName = data.owner?.name
  if (typeof ownerName !== 'string' || ownerName.length === 0) {
    fail('P3', `${marketplace.path}: owner.name must be a non-empty string, got ${JSON.stringify(ownerName ?? null)}`)
  }

  const plugins = data.plugins
  if (!Array.isArray(plugins) || plugins.length === 0) {
    fail('P3', `${marketplace.path}: plugins must be a non-empty array, got ${JSON.stringify(plugins ?? null)}`)
    continue
  }

  for (let i = 0; i < plugins.length; i++) {
    const entry = plugins[i]
    const where = `${marketplace.path}: plugins[${i}]`
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      fail('P3', `${where}: entry must be an object, got ${JSON.stringify(entry ?? null)}`)
      continue
    }

    // A component field here conflicts with plugin.json and produces
    // "Plugin … has conflicting manifests" at install time.
    for (const key of MARKETPLACE_COMPONENT_KEYS) {
      if (key in entry) {
        fail('P3', `${where}: declares component field ${key} — components belong in plugin.json, not the marketplace entry (conflicting manifests)`)
      }
    }

    const source = entry.source
    // Shape checks run BEFORE any resolution so a source can never point the
    // install outside this checkout (T-06-29).
    if (typeof source !== 'string' || !source.startsWith('./')) {
      fail('P3', `${where}: source must begin with ./, got ${JSON.stringify(source ?? null)}`)
      continue
    }
    if (source.includes('\\')) {
      fail('P3', `${where}: source must not contain a backslash, got ${JSON.stringify(source)}`)
      continue
    }
    if (source.split('/').includes('..')) {
      fail('P3', `${where}: source must not contain a .. segment, got ${JSON.stringify(source)}`)
      continue
    }

    const sourceDir = resolve(process.cwd(), source)
    if (!existsSync(sourceDir) || !statSync(sourceDir).isDirectory()) {
      fail('P3', `${where}: source ${JSON.stringify(source)} does not resolve to an existing directory`)
      continue
    }
    const manifestPath = join(sourceDir, marketplace.clientManifest)
    if (!existsSync(manifestPath)) {
      fail('P3', `${where}: source ${JSON.stringify(source)} does not contain the expected manifest ${marketplace.clientManifest}`)
      continue
    }
    let pluginName
    try {
      pluginName = JSON.parse(readFileSync(manifestPath, 'utf8')).name
    } catch (err) {
      fail('P3', `${where}: expected manifest ${marketplace.clientManifest} is unreadable or not JSON (${err.message})`)
      continue
    }
    if (entry.name !== pluginName) {
      fail('P3', `${where}: entry name ${JSON.stringify(entry.name ?? null)} does not match ${marketplace.clientManifest} name ${JSON.stringify(pluginName ?? null)}`)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// P4 — skill, command, and agent frontmatter allowed keys
// ─────────────────────────────────────────────────────────────────────────
// Allowed key sets, each commented with its source of truth.
const SKILL_ALLOWED_KEYS = new Set([
  // Agent Skills specification frontmatter set (agentskills.io/specification).
  // `name` and `description` are the two required members; `version` is not a
  // member, so its return fails here.
  'name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools',
])
const COMMAND_ALLOWED_KEYS = new Set([
  // Claude Code's documented command frontmatter set. `name` is included
  // deliberately: Claude Code ignores it in a command file, but Cursor's
  // documented command frontmatter requires it. `paths` is excluded
  // deliberately so a command can never silently narrow its own applicability.
  'name', 'description', 'argument-hint', 'arguments', 'disable-model-invocation',
  'user-invocable', 'allowed-tools', 'disallowed-tools', 'model', 'effort',
  'when_to_use', 'metadata',
])
const AGENT_ALLOWED_KEYS = new Set([
  // Claude Code's documented plugin-scope agent key list.
  'name', 'description', 'model', 'effort', 'maxTurns', 'tools', 'disallowedTools',
  'skills', 'memory', 'background', 'isolation',
])
const AGENT_FORBIDDEN_KEYS = new Set([
  // Unsupported in plugin scope for security reasons; reported with the
  // specific exclusion message, never a generic unknown-key one.
  'hooks', 'mcpServers', 'permissionMode',
])

// Frontmatter parsing without a YAML dependency: the opening --- must be the
// file's first line (Claude Code reads frontmatter only in that case), the
// block ends at the next --- line, and top-level keys are leading
// identifier-colon matches on non-indented lines only — an indented line
// belongs to a nested map such as metadata. Returns null after reporting a
// structural failure.
function frontmatter(relPath) {
  let text
  try {
    text = readFileSync(resolve(process.cwd(), relPath), 'utf8')
  } catch (err) {
    fail('P4', `${relPath}: could not read file (${err.message})`)
    return null
  }
  const lines = text.split('\n')
  if (lines[0] !== '---') {
    fail('P4', `${relPath}: frontmatter must open with --- on line 1 — Claude Code reads frontmatter only in that case`)
    return null
  }
  let close = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      close = i
      break
    }
  }
  if (close === -1) {
    fail('P4', `${relPath}: frontmatter has no closing --- line`)
    return null
  }
  const keys = new Map()
  for (const line of lines.slice(1, close)) {
    if (/^\s/.test(line)) continue
    const match = line.match(/^([A-Za-z0-9_-]+):(.*)$/)
    if (match) keys.set(match[1], match[2].trim())
  }
  return keys
}

function unquote(value) {
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1)
  }
  return value
}

function checkKeys(relPath, keys, allowed, forbidden) {
  for (const key of keys.keys()) {
    if (forbidden?.has(key)) {
      fail('P4', `${relPath}: frontmatter key "${key}" is forbidden in plugin scope — hooks, mcpServers, and permissionMode are not supported for plugin-shipped agents (plugin-scope security exclusion)`)
    } else if (!allowed.has(key)) {
      fail('P4', `${relPath}: unknown frontmatter key "${key}"`)
    }
  }
  for (const key of ['name', 'description']) {
    if (!keys.has(key)) {
      fail('P4', `${relPath}: frontmatter key "${key}" is required`)
    }
  }
}

// Markdown files directly under a component directory, or null when the
// component is not shipped at all (absent directory = not a failure; existing
// directory with zero markdown files = packaging mistake).
function componentMarkdownFiles(dirRelPath) {
  const absDir = resolve(process.cwd(), dirRelPath)
  if (!existsSync(absDir)) return null
  return readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(dirRelPath, entry.name))
}

function failIfEmpty(dirRelPath, files) {
  if (files !== null && files.length === 0) {
    fail('P4', `${dirRelPath}: exists but contains zero markdown files — an empty component directory is a packaging mistake`)
  }
}

let frontmatterSubjects = 0

const skillsDir = 'plugin/skills'
if (existsSync(resolve(process.cwd(), skillsDir))) {
  const skillDirs = readdirSync(resolve(process.cwd(), skillsDir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(skillsDir, entry.name))
  let subjects = 0
  for (const dir of skillDirs) {
    const relPath = join(dir, 'SKILL.md')
    if (!existsSync(resolve(process.cwd(), relPath))) continue
    subjects++
    const keys = frontmatter(relPath)
    if (keys === null) continue
    checkKeys(relPath, keys, SKILL_ALLOWED_KEYS, null)
    if (keys.has('name') && keys.get('name') !== basename(dir)) {
      fail('P4', `${relPath}: name ${JSON.stringify(keys.get('name'))} does not match parent directory name ${JSON.stringify(basename(dir))}`)
    }
    if (keys.has('description')) {
      const description = unquote(keys.get('description'))
      if (description.length < 1 || description.length > 1024) {
        fail('P4', `${relPath}: description must be 1-1024 characters, got ${description.length}`)
      }
    }
  }
  failIfEmpty(`${skillsDir}/*/SKILL.md`, subjects === 0 ? [] : null)
  frontmatterSubjects += subjects
}

for (const [dirRelPath, allowed, forbidden] of [
  ['plugin/commands', COMMAND_ALLOWED_KEYS, null],
  ['plugin/agents', AGENT_ALLOWED_KEYS, AGENT_FORBIDDEN_KEYS],
]) {
  const files = componentMarkdownFiles(dirRelPath)
  failIfEmpty(dirRelPath, files)
  for (const relPath of files ?? []) {
    frontmatterSubjects++
    const keys = frontmatter(relPath)
    if (keys === null) continue
    checkKeys(relPath, keys, allowed, forbidden)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// P5 — referenced paths resolve, hook script executable
// ─────────────────────────────────────────────────────────────────────────
// Walk a parsed JSON value and return [field, value] pairs whose value looks
// like a filesystem path: contains a separator, no whitespace, no URL scheme.
// Reading the values out of the manifests (rather than hard-coding resolved
// paths) keeps a future field addition covered automatically; the
// whitespace and scheme filters keep prose (the Codex longDescription's
// "call/type hierarchy") and https URLs out of the subject set.
function pathFields(value, prefix = '') {
  if (typeof value === 'string') {
    return /\//.test(value) && !/\s/.test(value) && !/^[a-z]+:\/\//i.test(value)
      ? [[prefix, value]]
      : []
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => pathFields(v, `${prefix}[${i}]`))
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([k, v]) => pathFields(v, prefix ? `${prefix}.${k}` : k))
  }
  return []
}

// Every "command" string field in a hook config tree.
function commandStrings(value) {
  if (Array.isArray(value)) return value.flatMap(commandStrings)
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([k, v]) =>
      k === 'command' && typeof v === 'string' ? [v] : commandStrings(v)
    )
  }
  return []
}

function hookCommandTarget(command) {
  const unquoted = command.replaceAll('"', '')
  if (unquoted.includes('${CLAUDE_PLUGIN_ROOT}')) {
    // The Claude/Codex config references the plugin root through the
    // variable; substitute plugin/ rather than treating the literal as a
    // path segment. (cursor.json's top-level version: 1 is Cursor's
    // hook-file schema version, not a plugin version — nothing reads it.)
    return normalize(unquoted.replaceAll('${CLAUDE_PLUGIN_ROOT}', 'plugin/'))
  }
  return join('plugin', unquoted)
}

let resolvedPaths = 0

// Two relativity families, deliberately separate: every path field in the
// Cursor plugin manifest is plugin-root-relative (resolve against plugin/),
// while the Codex manifest's skills and interface icons are repository-
// root-relative. Conflating the two is the easiest way to fabricate a
// P5 failure.
for (const [manifestRelPath, base] of [
  ['plugin/.cursor-plugin/plugin.json', 'plugin'],
  ['.codex-plugin/plugin.json', ''],
]) {
  let raw
  try {
    raw = readFileSync(resolve(process.cwd(), manifestRelPath), 'utf8')
  } catch (err) {
    fail('P5', `${manifestRelPath}: could not read file (${err.message})`)
    continue
  }
  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    fail('P5', `${manifestRelPath}: JSON parse error — ${err.message}`)
    continue
  }
  for (const [field, target] of pathFields(data)) {
    const absPath = resolve(process.cwd(), base, target)
    if (!existsSync(absPath)) {
      fail('P5', `${manifestRelPath}: ${field} ${JSON.stringify(target)} resolves to missing ${join(base, target)}`)
      continue
    }
    resolvedPaths++
  }
}

for (const hookConfigPath of ['plugin/hooks/hooks.json', 'plugin/hooks/cursor.json']) {
  let raw
  try {
    raw = readFileSync(resolve(process.cwd(), hookConfigPath), 'utf8')
  } catch (err) {
    fail('P5', `${hookConfigPath}: could not read file (${err.message})`)
    continue
  }
  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    fail('P5', `${hookConfigPath}: JSON parse error — ${err.message}`)
    continue
  }
  const commands = commandStrings(data)
  if (commands.length === 0) {
    fail('P5', `${hookConfigPath}: declares no command — a hook config that runs nothing is a packaging mistake`)
  }
  for (const command of commands) {
    const target = hookCommandTarget(command)
    const absPath = resolve(process.cwd(), target)
    if (!existsSync(absPath)) {
      fail('P5', `${hookConfigPath}: command ${JSON.stringify(command)} resolves to missing ${target}`)
      continue
    }
    resolvedPaths++
    if (target.endsWith('.sh') && (statSync(absPath).mode & 0o111) === 0) {
      fail('P5', `${hookConfigPath}: hook script ${target} has no execute bit — hooks silently do not fire when the script is not executable (chmod +x fixes it)`)
    }
  }
}

// On-demand retrieval commands: every `grep … "<heading>" references/<file>`
// inside a SKILL.md must point at an existing file carrying that heading —
// the mechanical half of D-10 (the move is only real if the pointer resolves
// and the anchor is there). Targets are discovered by scanning the skills,
// never hard-coded.
const RETRIEVAL_COMMAND = /`grep\s+(?:-\S+\s+)*"([^"]+)"\s+(references\/[A-Za-z0-9._/-]+)`/g
if (existsSync(resolve(process.cwd(), skillsDir))) {
  const skillDirs = readdirSync(resolve(process.cwd(), skillsDir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(skillsDir, entry.name))
  for (const dir of skillDirs) {
    const skillRelPath = join(dir, 'SKILL.md')
    const absSkill = resolve(process.cwd(), skillRelPath)
    if (!existsSync(absSkill)) continue
    const text = readFileSync(absSkill, 'utf8')
    for (const match of text.matchAll(RETRIEVAL_COMMAND)) {
      const [, heading, refRel] = match
      const refRelPath = join(dir, refRel)
      const absRef = resolve(process.cwd(), refRelPath)
      if (!existsSync(absRef)) {
        fail('P5', `${skillRelPath}: retrieval command names missing ${refRel}`)
        continue
      }
      if (!readFileSync(absRef, 'utf8').includes(heading)) {
        fail('P5', `${skillRelPath}: retrieval heading ${JSON.stringify(heading)} not found in ${refRel}`)
        continue
      }
      resolvedPaths++
    }
  }
}

// An existing command/agent component that installs must actually install
// something: at least one markdown file, and none of them zero bytes — an
// empty component file installs cleanly and does nothing.
for (const dirRelPath of ['plugin/commands', 'plugin/agents']) {
  const files = componentMarkdownFiles(dirRelPath)
  failIfEmpty(dirRelPath, files)
  for (const relPath of files ?? []) {
    const absPath = resolve(process.cwd(), relPath)
    if (statSync(absPath).size === 0) {
      fail('P5', `${relPath}: is zero bytes — an empty component file installs cleanly and does nothing`)
      continue
    }
    resolvedPaths++
  }
}

if (failed) {
  process.exit(1)
}

console.log(
  `ok: P1 (${tools.size} roster tools agree across shipped surfaces), P3 (${MARKETPLACES.length} marketplace manifests valid with resolving sources), P4 (${frontmatterSubjects} frontmatter blocks within allowed key sets), P5 (${resolvedPaths} referenced paths resolve, hook script executable) all green`
)
